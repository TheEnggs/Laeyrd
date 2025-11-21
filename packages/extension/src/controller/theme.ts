import * as vscode from "vscode";
import {
  Color,
  ColorGroups,
  GroupedColors,
  Theme,
  TokenColorsList,
  SemanticTokenColors,
  ColorMetaGrouped,
  DraftColor,
  DraftToken,
  DraftState,
  draftState,
} from "@shared/types/theme";
import { log } from "@shared/utils/debug-logs";
import { SaveThemeModes } from "@shared/types/event";
import { parse } from "jsonc-parser";
import { ToastController } from "./toast";
import {
  convertTokenColors,
  convertTokenColorsBackToTheme,
  generateColors,
} from "src/utils/colors";
import DraftManager from "./draft";
import { BackupManager } from "./backup";

export function groupColors(colors: Color): GroupedColors {
  return Object.entries(colors).reduce((acc, [key, value]) => {
    const [category, subKey] = (key as `${ColorGroups}.${string}`).split(".");
    if (!acc[category as ColorGroups]) acc[category as ColorGroups] = {};
    acc[category as ColorGroups][subKey as string] = value;
    return acc;
  }, {} as GroupedColors);
}

interface ThemeContribution {
  id?: string;
  label: string;
  uiTheme: "vs" | "vs-dark";
  path: string;
}

export class ThemeController {
  public currentTheme?: Theme;
  private currentThemeUri?: vscode.Uri;
  private themesDirUri?: vscode.Uri;

  private constructor() { }

  public static async create(): Promise<ThemeController> {
    const controller = new ThemeController();
    await controller.loadCurrentTheme();
    return controller;
  }

  /** Load the currently active theme JSON into memory */
  private async loadCurrentTheme(): Promise<void> {
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
      this.currentThemeUri = themeUri;

      const themeContent = await vscode.workspace.fs.readFile(themeUri);
      this.currentTheme = parse(Buffer.from(themeContent).toString("utf8"));
    } catch (error) {
      console.error("Error loading current theme", error);
    }
  }

  /** Force reload theme from disk */
  public async refreshTheme() {
    log("refreshing theme");
    await this.loadCurrentTheme();
  }

  public getColors(): ColorMetaGrouped | undefined {
    log("current theme", this.currentTheme);
    const colors = this.currentTheme?.colors;
    return colors ? generateColors(colors) : undefined;
  }

  public getTokenColors(): TokenColorsList | undefined {
    return this.currentTheme?.tokenColors
      ? convertTokenColors(this.currentTheme.semanticTokenColors)
      : undefined;
  }

  public getSemanticTokenColors(): SemanticTokenColors | undefined {
    return this.currentTheme?.semanticTokenColors;
  }

  public getName(): string | undefined {
    return this.currentTheme?.name;
  }

  public getType(): Theme["type"] | undefined {
    return this.currentTheme?.type;
  }

  public isOurTheme(): boolean {
    return !!this.currentTheme?.name?.includes("Laeyrd");
  }

  /** List themes contributed by this extension (from package.json) */
  public async listOwnThemes(context: vscode.ExtensionContext) {
    const packageUri = vscode.Uri.joinPath(
      context.extensionUri,
      "package.json"
    );
    const content = await vscode.workspace.fs.readFile(packageUri);
    const pkg = JSON.parse(Buffer.from(content).toString("utf8"));
    const themes: Array<{ label: string; path: string; uiTheme?: string }> =
      pkg?.contributes?.themes?.map((t: any) => ({
        label: t.label,
        path: t.path,
        uiTheme: t.uiTheme,
      })) || [];
    return themes;
  }

  public getActiveThemeLabel() {
    return vscode.workspace
      .getConfiguration("workbench")
      .get<string>("colorTheme");
  }

  public async setActiveThemeByLabel(themeName: string) {
    await vscode.workspace
      .getConfiguration("workbench")
      .update("colorTheme", themeName, vscode.ConfigurationTarget.Global);
    ToastController.showToast;
  }
  public async handleSaveTheme(
    payload: {
      mode: keyof typeof SaveThemeModes;
      themeName: string;
      draftState: DraftState;
    },

    context: vscode.ExtensionContext
  ) {
    try {
      const draftState = payload.draftState;
      const colors = draftState.colorCustomization;
      const tokens = draftState.semanticTokenCustomization;
      const themeName = payload.themeName;

      if (payload.mode === SaveThemeModes.OVERWRITE) {
        await this.overwriteThemeByLabel(context, themeName, colors, {
          tokenColors: {},
          semanticTokenColors: tokens,
        });
      } else {
        const res = await this.createTheme(context, themeName, colors, {
          tokenColors: {},
          semanticTokenColors: tokens,
        });
        if (!res.success) throw new Error("Failed to create theme");
        await this.addThemeToPackageJson(
          context,
          themeName,
          `${themeName}.json`
        );
      }

      return { success: true };
    } catch (e) {
      console.log(e)
      throw e;
    }
  }
  public async overwriteThemeByLabel(
    context: vscode.ExtensionContext,
    themeLabel: string,
    colors: DraftColor | undefined,
    tokenColors: DraftToken | undefined
  ) {

    const { themeJson, themeUri } = await this.getThemeJson(context, themeLabel)

    const updatedTheme: Theme = {
      ...themeJson,
      ...this.generateThemeColors(colors, tokenColors)
    };

    this.writeToThemeFile(context, themeLabel, updatedTheme);

    // Refresh if this was active theme
    if (this.getActiveThemeLabel() === themeLabel) {
      this.currentThemeUri = themeUri;
      this.currentTheme = updatedTheme;
      await this.refreshTheme();
    }
  }


  public async createTheme(
    context: vscode.ExtensionContext,
    themeName: string,
    colors: DraftColor | undefined,
    tokenColors: DraftToken | undefined,
    type: "light" | "dark" = "dark"
  ): Promise<{ success: boolean }> {
    if (!themeName || /[\\/:*?"<>|]/.test(themeName))
      throw new Error("Invalid theme name");

    const themeJson: Theme & { publisher: string } = {
      name: themeName,
      type,
      publisher: "Laeyrd",
      ...this.generateThemeColors(colors, tokenColors)
    };

    return this.writeToThemeFile(context, themeName, themeJson);
  }

  public async deleteThemeFile(
    context: vscode.ExtensionContext,
    payload: { themeName: string }
  ) {
    const { themeName } = payload;
    try {
      const themeUri = vscode.Uri.joinPath(
        context.extensionUri,
        "dist",
        "themes",
        themeName + ".json"
      );

      await vscode.workspace.fs.delete(themeUri, { recursive: false });
      await this.removeThemeFromPackageJson(context, themeName);
      try {
        const backupManager = new BackupManager(context);
        await backupManager.deleteBackedUpThemeFile(themeName);
      } catch (e) {
        console.error("Failed to delete backed up theme file", e);
      }
      this.promptReload(
        `Theme "${themeName}" deleted. Reload to get latest changes.`
      );
      return { success: true };
    } catch (error: any) {
      // If file doesn’t exist, don’t hard-fail. Could be already cleaned.
      if ((error as { code?: string })?.code !== "FileNotFound") {
        throw new Error(
          `Failed to delete theme file "${themeName}": ${String(error)}`
        );
      }
      throw error;
    }
  }


  /** Ensure themes folder exists */
  private async ensureThemesFolder(context: vscode.ExtensionContext) {
    if (!this.themesDirUri) {
      this.themesDirUri = vscode.Uri.joinPath(
        context.extensionUri,
        "dist/themes"
      );
      await vscode.workspace.fs.createDirectory(this.themesDirUri);
    }
    return this.themesDirUri;
  }

  private async getThemePath(
    themeName: string,
    context: vscode.ExtensionContext
  ) {
    const dir = await this.ensureThemesFolder(context);
    return vscode.Uri.joinPath(dir, `${themeName}.json`);
  }
  public async writeToThemeFile(
    context: vscode.ExtensionContext,
    themeName: string,
    themeJson: Theme
  ) {
    try {
      const fileUri = await this.getThemePath(themeName, context);
      await vscode.workspace.fs.writeFile(
        fileUri,
        new TextEncoder().encode(JSON.stringify(themeJson, null, 2))
      );
      vscode.window.showInformationMessage(
        `Theme "${themeName}" created successfully!`
      );
      try {
        const backupManager = new BackupManager(context);
        await backupManager.backupTheme({
          name: themeName,
          data: themeJson, // or just draftState if you like
        });
      } catch (e) {
        console.error("Failed to backup theme", e);
      }
      this.promptReload(
        `Your changes to theme "${themeName}" have been saved. Reload to activate.`
      );
      return { success: true };
    } catch (err) {
      vscode.window.showErrorMessage(`Failed to create theme "${themeName}"`);
      return { success: false };
    }
  }


  /** Overwrite a theme JSON by its label from our extension package.json */


  async getThemeJson(context: vscode.ExtensionContext, themeLabel: string) {
    try {
      const themes = await this.listOwnThemes(context);
      const target = themes.find((t) => t.label === themeLabel);
      if (!target) {
        throw new Error("Theme not found")
      }

      const themeUri = vscode.Uri.joinPath(context.extensionUri, target.path);
      const themeContent = await vscode.workspace.fs.readFile(themeUri);
      const themeJson: Theme = JSON.parse(
        Buffer.from(themeContent).toString("utf8")
      );
      return { themeJson, themeUri }
    } catch (e) {
      throw e
    }
  }

  generateThemeColors(colors: DraftColor | undefined,
    tokenColors: DraftToken | undefined) {

    const tokensArray = tokenColors
      ? convertTokenColorsBackToTheme(tokenColors)
      : { tokenColors: [], semanticTokenColors: {} };

    return {
      colors: { ...(this.currentTheme?.colors ?? {}), ...colors },
      semanticTokenColors: {
        ...(this.currentTheme?.semanticTokenColors ?? {}),
        ...tokensArray.semanticTokenColors,
      },
      tokenColors: [
        ...(this.currentTheme?.tokenColors ?? []),
        ...tokensArray.tokenColors,
      ],
    }
  }

  private getPackageJsonUri(context: vscode.ExtensionContext) {
    return vscode.Uri.joinPath(context.extensionUri, "package.json");
  }

  private async readPackageJson(
    context: vscode.ExtensionContext
  ): Promise<any> {
    const uri = this.getPackageJsonUri(context);
    const content = await vscode.workspace.fs.readFile(uri);
    try {
      return JSON.parse(new TextDecoder().decode(content));
    } catch (error) {
      throw new Error(`Failed to parse package.json: ${String(error)}`);
    }
  }

  async writePackageJson(
    context: vscode.ExtensionContext,
    pkg: any
  ): Promise<void> {
    const uri = this.getPackageJsonUri(context);
    const text = JSON.stringify(pkg, null, 2);
    const bytes = new TextEncoder().encode(text);
    await vscode.workspace.fs.writeFile(uri, bytes);
  }

  ensureContributesThemes(pkg: any): ThemeContribution[] {
    if (!pkg.contributes) pkg.contributes = {};
    if (!Array.isArray(pkg.contributes.themes)) pkg.contributes.themes = [];
    return pkg.contributes.themes as ThemeContribution[];
  }

  promptReload(message: string) {
    vscode.window
      .showInformationMessage(message, "Reload Window")
      .then((selection) => {
        if (selection === "Reload Window") {
          return vscode.commands.executeCommand("workbench.action.reloadWindow");
        }
      })
  }


  /**
   * Add a theme contribution to package.json
   */
  public async addThemeToPackageJson(
    context: vscode.ExtensionContext,
    themeName: string,
    themeFile: string,
    type: "dark" | "light" = "dark"
  ) {
    const pkg = await this.readPackageJson(context);
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

    await this.writePackageJson(context, pkg);
  }

  /**
   * Remove a theme contribution by label from package.json
   */
  public async removeThemeFromPackageJson(
    context: vscode.ExtensionContext,
    themeName: string
  ) {
    const pkg = await this.readPackageJson(context);
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
    await this.writePackageJson(context, pkg);

    this.promptReload(
      `Theme "${themeName}" removed from package.json. Reload to apply.`
    );
  }
}
