import * as vscode from "vscode";
import {
  Color,
  ColorGroups,
  GroupedColors,
  Theme,
  TokenColorsList,
  SemanticTokenColors,
  ColorMetaGrouped,
} from "@src/types/theme";
import { log } from "../../lib/debug-logs";
import {
  convertTokenColors,
  convertTokenColorsBackToTheme,
  generateColors,
} from "../utils/colors";
import { DraftColor, DraftToken } from "@webview/contexts/settings-context";
import { SaveThemeModes } from "@src/types/event";
import { parse } from "jsonc-parser";
import { ToastController } from "./toast";

export function groupColors(colors: Color): GroupedColors {
  return Object.entries(colors).reduce((acc, [key, value]) => {
    const [category, subKey] = (key as `${ColorGroups}.${string}`).split(".");
    if (!acc[category as ColorGroups]) acc[category as ColorGroups] = {};
    acc[category as ColorGroups][subKey as string] = value;
    return acc;
  }, {} as GroupedColors);
}

export class ThemeController {
  public currentTheme?: Theme;
  private currentThemeUri?: vscode.Uri;
  private themesDirUri?: vscode.Uri;

  private constructor() {}

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
    console.log("current theme", this.currentTheme);
    const colors = this.currentTheme?.colors;
    return colors ? generateColors(colors) : undefined;
  }

  public getTokenColors(): TokenColorsList | undefined {
    return this.currentTheme?.tokenColors
      ? convertTokenColors(this.currentTheme.tokenColors)
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

  /** Handles live theme mode */
  public async handleLiveMode(
    context: vscode.ExtensionContext,
    themeName: string,
    colors: DraftColor,
    tokenColors: DraftToken,
    type: "light" | "dark" = "dark"
  ) {
    const themes = await this.listOwnThemes(context);
    const target = themes.find((t) => t.label === themeName);
    const activeThemeName = this.getActiveThemeLabel();
    const currTheme = this.currentTheme;
    const finalColors = { ...currTheme?.colors, ...colors };
    const finalTokenColors = { ...currTheme?.tokenColors, ...tokenColors };
    if (target) {
      await this.overwriteThemeByLabel(
        context,
        themeName,
        finalColors,
        finalTokenColors
      );
    } else {
      await this.createTheme(
        context,
        themeName,
        finalColors,
        finalTokenColors,
        type
      );
      await this.addThemeToPackageJson(
        context,
        themeName,
        `${themeName}.json`,
        type
      );
    }

    if (activeThemeName !== themeName)
      await this.setActiveThemeByLabel(themeName);
  }

  public async handleSaveTheme(
    payload: {
      mode: keyof typeof SaveThemeModes;
      themeName: string;
      colors: DraftColor;
      tokens: DraftToken;
      type: "dark" | "light";
    },
    context: vscode.ExtensionContext
  ) {
    try {
      if (payload.mode === SaveThemeModes.OVERWRITE) {
        await this.overwriteThemeByLabel(
          context,
          payload.themeName,
          payload.colors,
          payload.tokens
        );
      } else if (payload.mode === SaveThemeModes.LIVE) {
        await this.handleLiveMode(
          context,
          "Live Preview - Laeyrd",
          payload.colors,
          payload.tokens,
          payload.type
        );
      } else {
        const themeName = payload.themeName || "Untitled Theme";
        const res = await this.createTheme(
          context,
          themeName,
          payload.colors,
          payload.tokens,
          payload.type
        );
        if (!res.success) throw new Error("Failed to create theme");
        await this.addThemeToPackageJson(
          context,
          themeName,
          `${themeName}.json`,
          payload.type
        );
      }
      return { success: true };
    } catch (e) {
      throw e;
    }
  }

  /** Overwrite a theme JSON by its label from our extension package.json */
  public async overwriteThemeByLabel(
    context: vscode.ExtensionContext,
    themeLabel: string,
    colors: DraftColor,
    tokenColors: DraftToken
  ) {
    const themes = await this.listOwnThemes(context);
    const target = themes.find((t) => t.label === themeLabel);
    if (!target) {
      vscode.window.showErrorMessage(
        `Theme "${themeLabel}" not found in this extension.`
      );
      return;
    }

    const themeUri = vscode.Uri.joinPath(context.extensionUri, target.path);
    const themeContent = await vscode.workspace.fs.readFile(themeUri);
    const themeJson: Theme = JSON.parse(
      Buffer.from(themeContent).toString("utf8")
    );

    const tokensArray = convertTokenColorsBackToTheme(tokenColors);
    const updatedTheme: Theme = {
      ...themeJson,
      colors: { ...(this.currentTheme?.colors ?? {}), ...colors },
      semanticTokenColors: {
        ...(this.currentTheme?.semanticTokenColors ?? {}),
        ...tokensArray.semanticTokenColors,
      },
      tokenColors: [
        ...(this.currentTheme?.tokenColors ?? []),
        ...tokensArray.tokenColors,
      ],
    };

    await vscode.workspace.fs.writeFile(
      themeUri,
      new TextEncoder().encode(JSON.stringify(updatedTheme, null, 2))
    );

    // Refresh if this was active theme
    if (this.getActiveThemeLabel() === themeLabel) {
      this.currentThemeUri = themeUri;
      this.currentTheme = updatedTheme;
      await this.refreshTheme();
    }
  }
  public overwriteThemeContent(
    themeId: string,
    content: string,
    context: vscode.ExtensionContext
  ) {
    if (!themeId || !content)
      throw new Error("Theme name or content not present");
  }
  /** Ensure themes folder exists */
  private async ensureThemesFolder(context: vscode.ExtensionContext) {
    if (!this.themesDirUri) {
      this.themesDirUri = vscode.Uri.joinPath(
        context.globalStorageUri,
        "themes"
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
      return { success: true };
    } catch (err) {
      vscode.window.showErrorMessage(`Failed to create theme "${themeName}"`);
      return { success: false };
    }
  }

  public async createTheme(
    context: vscode.ExtensionContext,
    themeName: string,
    colors: DraftColor,
    tokenColors: DraftToken,
    type: "light" | "dark" = "dark"
  ): Promise<{ success: boolean }> {
    if (!themeName || /[\\/:*?"<>|]/.test(themeName))
      throw new Error("Invalid theme name");

    const tokensArray = convertTokenColorsBackToTheme(tokenColors);
    const themeJson: Theme & { publisher: string } = {
      name: themeName,
      type,
      publisher: "Laeyrd",
      colors: { ...(this.currentTheme?.colors ?? {}), ...colors },
      tokenColors: {
        ...(this.currentTheme?.tokenColors ?? {}),
        ...tokensArray.tokenColors,
      },
      semanticTokenColors: {
        ...(this.currentTheme?.semanticTokenColors ?? {}),
        ...tokensArray.semanticTokenColors,
      },
    };

    return this.writeToThemeFile(context, themeName, themeJson);
  }

  public async addThemeToPackageJson(
    context: vscode.ExtensionContext,
    themeName: string,
    themeFile: string,
    type: "light" | "dark" = "dark"
  ) {
    const packageUri = vscode.Uri.joinPath(
      context.extensionUri,
      "package.json"
    );
    const content = await vscode.workspace.fs.readFile(packageUri);
    const pkg = JSON.parse(Buffer.from(content).toString("utf8"));

    if (!pkg.contributes) pkg.contributes = {};
    if (!pkg.contributes.themes) pkg.contributes.themes = [];

    const alreadyExists = pkg.contributes.themes.some(
      (t: any) => t.label === themeName
    );
    if (alreadyExists)
      throw new Error(`Theme "${themeName}" already exists in package.json.`);

    pkg.contributes.themes.push({
      label: themeName,
      uiTheme: type === "dark" ? "vs-dark" : "vs",
      path: `themes/${themeFile}`, // relative path inside extension
    });

    await vscode.workspace.fs.writeFile(
      packageUri,
      new TextEncoder().encode(JSON.stringify(pkg, null, 2))
    );

    vscode.window
      .showInformationMessage(
        `Theme "${themeName}" added! Reload to activate.`,
        "Reload Now"
      )
      .then((selection) => {
        if (selection === "Reload Now")
          vscode.commands.executeCommand("workbench.action.reloadWindow");
      });
  }
}
