import * as vscode from "vscode";
import {
  ColorMetaGrouped,
  DraftState,
  ThemeJson,
  TokenColorsList,
} from "@shared/types/theme";
import { SaveThemeModes } from "@shared/types/event";
import { parse } from "jsonc-parser";
import { ToastController } from "./toast";
import { BackupManager } from "./backup";
import { generateVscodeTheme } from "@shared/utils/themeGenerator";
import {
  convertDraftUserTokenColorsToTokenColors,
  generateTokenMapColorsFromTheme,
} from "@shared/data/token/tokenList";
import { generateColors } from "@extension/utils/colors";

interface ThemeContribution {
  id?: string;
  label: string;
  uiTheme: "vs" | "vs-dark";
  path: string;
}

export class ThemeController {
  private static instance: ThemeController | undefined;

  public static async getInstance(
    context: vscode.ExtensionContext
  ): Promise<ThemeController> {
    if (!this.instance) {
      const controller = new ThemeController(context);
      await controller.loadCurrentTheme();
      this.instance = controller;
    }
    return this.instance;
  }

  public currentTheme?: ThemeJson;
  private themesDirUri?: vscode.Uri;
  private isLoading = false;

  private constructor(private readonly context: vscode.ExtensionContext) {
  }

  /** Load the currently active theme JSON into memory */
  private async loadCurrentTheme(): Promise<void> {
    // prevent concurrent double loads if someone spams refreshTheme
    if (this.isLoading) return;
    this.isLoading = true;

    try {
      const activeThemeName = vscode.workspace
        .getConfiguration("workbench")
        .get<string>("colorTheme");

      if (!activeThemeName) {
        console.warn("No active theme detected");
        return;
      }

      const themeExt = vscode.extensions.all.find((ext) => {
        const themes = ext.packageJSON?.contributes?.themes || [];
        return themes.some(
          (t: any) => t.label === activeThemeName || t.id === activeThemeName
        );
      });

      if (!themeExt) {
        console.warn("Theme extension not found for:", activeThemeName);
        return;
      }

      const themeInfo = themeExt.packageJSON.contributes.themes.find(
        (t: any) => t.label === activeThemeName || t.id === activeThemeName
      );

      if (!themeInfo) {
        console.warn("Theme info not found inside extension:", themeExt.id);
        return;
      }

      const themeUri = vscode.Uri.joinPath(
        themeExt.extensionUri,
        themeInfo.path
      );

      this.currentTheme = await this.loadThemeWithIncludes(themeUri);
    } catch (error) {
      console.error("Error loading current theme", error);
    } finally {
      this.isLoading = false;
    }
  }

  private async loadThemeWithIncludes(uri: vscode.Uri): Promise<ThemeJson> {
    const themeContent = await vscode.workspace.fs.readFile(uri);
    const rawTheme = parse(Buffer.from(themeContent).toString("utf8"));

    if (!rawTheme || !rawTheme.include) {
      return rawTheme;
    }

    const includeUri = this.resolveIncludeUri(uri, rawTheme.include);
    const parentTheme = await this.loadThemeWithIncludes(includeUri);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { include, ...childTheme } = rawTheme;

    return this.mergeThemes(parentTheme, childTheme);
  }

  private resolveIncludeUri(
    themeUri: vscode.Uri,
    includePath: string
  ): vscode.Uri {
    const baseDir = themeUri.with({
      path: themeUri.path.replace(/\/[^/]+$/, "/"),
    });
    return vscode.Uri.joinPath(baseDir, includePath);
  }

  private mergeThemes(parent: any, child: any): ThemeJson {
    if (!parent) return child;
    if (!child) return parent;

    return {
      ...parent,
      ...child,
      colors: {
        ...(parent.colors ?? {}),
        ...(child.colors ?? {}),
      },
      tokenColors: [
        ...(parent.tokenColors ?? []),
        ...(child.tokenColors ?? []),
      ],
      semanticTokenColors: {
        ...(parent.semanticTokenColors ?? {}),
        ...(child.semanticTokenColors ?? {}),
      },
    };
  }

  /** Force reload theme from disk */
  public async refreshTheme(): Promise<void> {
    await this.loadCurrentTheme();
  }

  public getColors(): ColorMetaGrouped | undefined {
    const colors = this.currentTheme?.colors;
    return colors ? generateColors(colors) : undefined;
  }

  public getTokenMapColors(): TokenColorsList | undefined {
    const tokenColors = this.currentTheme?.tokenColors;
    const semanticTokenColors = this.currentTheme?.semanticTokenColors;
    if (!tokenColors && !semanticTokenColors) return undefined;
    return generateTokenMapColorsFromTheme(tokenColors, semanticTokenColors);
  }

  public getName(): string | undefined {
    return this.currentTheme?.name;
  }

  public getType(): ThemeJson["type"] | undefined {
    return this.currentTheme?.type;
  }

  public isOurTheme(): boolean {
    return Boolean(this.currentTheme?.name?.includes("Laeyrd"));
  }

  /** List themes contributed by this extension (from package.json) */
  public async listOwnThemes() {
    const packageUri = vscode.Uri.joinPath(
      this.context.extensionUri,
      "package.json"
    );
    const content = await vscode.workspace.fs.readFile(packageUri);
    const pkg = JSON.parse(Buffer.from(content).toString("utf8")) as {
      contributes?: { themes?: ThemeContribution[] };
    };

    const themes =
      pkg?.contributes?.themes?.map((t) => ({
        label: t.label,
        path: t.path,
        uiTheme: t.uiTheme,
      })) ?? [];

    return themes;
  }

  public getActiveThemeLabel(): string | undefined {
    return vscode.workspace
      .getConfiguration("workbench")
      .get<string>("colorTheme");
  }

  public async handleSaveTheme(payload: {
    mode: keyof typeof SaveThemeModes;
    themeName: string;
    draftState: DraftState;
  }): Promise<{ success: boolean }> {
    try {
      if (!this.currentTheme) {
        throw new Error("Current theme not found");
      }

      const { draftState, themeName, mode } = payload;

      const colors = draftState.colorCustomization;

      // You probably want different transforms here, but keeping your original logic
      const semanticTokenColors = convertDraftUserTokenColorsToTokenColors(
        draftState.tokenCustomization
      );
      const textmateTokenColors = convertDraftUserTokenColorsToTokenColors(
        draftState.tokenCustomization
      );

      const themeJson = generateVscodeTheme(this.currentTheme, {
        userThemeColors: colors,
        userThemeName: themeName,
        userSemanticTokenColors: semanticTokenColors,
        userTextmateTokenColors: textmateTokenColors,
        userThemeType: this.currentTheme.type,
      });
      const res = await this.writeToThemeFile(themeName, themeJson);
      if (!res.success) {
        throw new Error("Failed to write theme file");
      }
      if (mode === SaveThemeModes.CREATE) {
        await this.addThemeToPackageJson(
          themeName,
          `${themeName}.json`,
          this.currentTheme.type === "dark" ? "dark" : "light"
        );
      }

      return { success: true };
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  public async deleteThemeFile(payload: {
    themeName: string;
  }): Promise<{ success: boolean }> {
    const { themeName } = payload;
    try {
      const themeUri = vscode.Uri.joinPath(
        this.context.extensionUri,
        "dist",
        "themes",
        `${themeName}.json`
      );

      await vscode.workspace.fs.delete(themeUri, { recursive: false });
      await this.removeThemeFromPackageJson(themeName);

      try {
        const backupManager = new BackupManager(this.context);
        await backupManager.deleteBackedUpThemeFile(themeName);
      } catch (e) {
        console.error("Failed to delete backed up theme file", e);
      }

      this.promptReload(
        `Theme "${themeName}" deleted. Reload to get latest changes.`
      );
      return { success: true };
    } catch (error: any) {
      if ((error as { code?: string })?.code !== "FileNotFound") {
        throw new Error(
          `Failed to delete theme file "${themeName}": ${String(error)}`
        );
      }
      // FileNotFound: just bubble up same error if some caller really cares
      throw error;
    }
  }

  /** Ensure themes folder exists */
  private async ensureThemesFolder(): Promise<vscode.Uri> {
    if (!this.themesDirUri) {
      this.themesDirUri = vscode.Uri.joinPath(
        this.context.extensionUri,
        "dist",
        "themes"
      );
      await vscode.workspace.fs.createDirectory(this.themesDirUri);
    }
    return this.themesDirUri;
  }

  private async getThemePath(themeName: string): Promise<vscode.Uri> {
    const dir = await this.ensureThemesFolder();
    return vscode.Uri.joinPath(dir, `${themeName}.json`);
  }

  public async writeToThemeFile(
    themeName: string,
    themeJson: ThemeJson
  ): Promise<{ success: boolean }> {
    try {
      const fileUri = await this.getThemePath(themeName);

      await vscode.workspace.fs.writeFile(
        fileUri,
        new TextEncoder().encode(JSON.stringify(themeJson, null, 2))
      );

      vscode.window.showInformationMessage(
        `Theme "${themeName}" created successfully!`
      );

      try {
        const backupManager = new BackupManager(this.context);
        await backupManager.backupTheme({
          name: themeName,
          data: themeJson,
        });
      } catch (e) {
        console.error("Failed to backup theme", e);
      }

      this.promptReload(
        `Your changes to theme "${themeName}" have been saved. Reload to activate.`
      );
      return { success: true };
    } catch {
      vscode.window.showErrorMessage(`Failed to create theme "${themeName}"`);
      return { success: false };
    }
  }

  /** Read a theme JSON by its label from our extension package.json */
  public async getThemeJson(themeLabel: string): Promise<{
    themeJson: ThemeJson;
    themeUri: vscode.Uri;
  }> {
    const themes = await this.listOwnThemes();
    const target = themes.find((t) => t.label === themeLabel);
    if (!target) {
      throw new Error("Theme not found");
    }

    const themeUri = vscode.Uri.joinPath(this.context.extensionUri, target.path);
    const themeContent = await vscode.workspace.fs.readFile(themeUri);
    const themeJson: ThemeJson = JSON.parse(
      Buffer.from(themeContent).toString("utf8")
    );
    return { themeJson, themeUri };
  }

  private getPackageJsonUri(): vscode.Uri {
    return vscode.Uri.joinPath(this.context.extensionUri, "package.json");
  }

  private async readPackageJson(): Promise<any> {
    const uri = this.getPackageJsonUri();
    const content = await vscode.workspace.fs.readFile(uri);
    try {
      return JSON.parse(new TextDecoder().decode(content));
    } catch (error) {
      throw new Error(`Failed to parse package.json: ${String(error)}`);
    }
  }

  private async writePackageJson(pkg: any): Promise<void> {
    const uri = this.getPackageJsonUri();
    const text = JSON.stringify(pkg, null, 2);
    const bytes = new TextEncoder().encode(text);
    await vscode.workspace.fs.writeFile(uri, bytes);
  }

  private ensureContributesThemes(pkg: any): ThemeContribution[] {
    if (!pkg.contributes) pkg.contributes = {};
    if (!Array.isArray(pkg.contributes.themes)) pkg.contributes.themes = [];
    return pkg.contributes.themes as ThemeContribution[];
  }

  private promptReload(message: string): void {
    vscode.window
      .showInformationMessage(message, "Reload Window")
      .then((selection) => {
        if (selection === "Reload Window") {
          return vscode.commands.executeCommand(
            "workbench.action.reloadWindow"
          );
        }
      });
  }

  /**
   * Add a theme contribution to package.json
   */
  public async addThemeToPackageJson(
    themeName: string,
    themeFile: string,
    type: "dark" | "light" = "dark"
  ): Promise<void> {
    const pkg = await this.readPackageJson();
    const themes = this.ensureContributesThemes(pkg);

    const existing = themes.find(
      (t) => t.label.toLowerCase() === themeName.toLowerCase()
    );

    if (existing) {
      throw new Error(
        `Theme "${themeName}" already exists in package.json (label: ${existing.label}).`
      );
    }

    const uiTheme: "vs" | "vs-dark" = type === "dark" ? "vs-dark" : "vs";

    themes.push({
      label: themeName,
      uiTheme,
      path: `dist/themes/${themeFile}`,
    });

    await this.writePackageJson(pkg);
  }

  /**
   * Remove a theme contribution by label from package.json
   */
  public async removeThemeFromPackageJson(
    themeName: string
  ): Promise<void> {
    const pkg = await this.readPackageJson();
    const themes = this.ensureContributesThemes(pkg);

    const beforeCount = themes.length;
    const filtered = themes.filter(
      (t) => t.label.toLowerCase() !== themeName.toLowerCase()
    );

    if (filtered.length === beforeCount) {
      vscode.window.showWarningMessage(
        `No theme contribution found with label "${themeName}".`
      );
      return;
    }

    pkg.contributes.themes = filtered;
    await this.writePackageJson(pkg);

    this.promptReload(
      `Theme "${themeName}" removed from package.json. Reload to apply.`
    );
  }

  dispose() {
    // Clean up resources if needed
    ThemeController.instance = undefined; 
  }
}
