import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import {
  Color,
  ColorGroups,
  GroupedColors,
  GroupedTokenColors,
  Theme,
  TokenColorItem,
  TokenColorMeta,
  TokenColorsList,
  SemanticTokenColors,
} from "../../types/theme";
import { log } from "../../lib/debug-logs";
import {
  convertTokenColors,
  convertTokenColorsBackToTheme,
  generateColors,
} from "../utils/colors";
import { ColorMetaGrouped } from "../../types/theme";
import { parse } from "jsonc-parser";
import { DraftColor, DraftToken } from "@webview/contexts/settings-context";
export function groupColors(colors: Color): GroupedColors {
  return Object.entries(colors).reduce((acc, [key, value]) => {
    const [category, subKey] = (key as `${ColorGroups}.${string}`).split(".");
    if (!acc[category as ColorGroups]) acc[category as ColorGroups] = {};
    acc[category as ColorGroups][subKey as string] = value;
    return acc;
  }, {} as GroupedColors);
}

export class ThemeController {
  private static instance: ThemeController;
  private context: vscode.ExtensionContext;
  private currentTheme: Theme | undefined;
  private currentThemePath: string | undefined;

  private constructor(context: vscode.ExtensionContext) {
    this.context = context;
    this.loadCurrentTheme();
  }

  public static getInstance(context: vscode.ExtensionContext): ThemeController {
    if (!ThemeController.instance) {
      ThemeController.instance = new ThemeController(context);
    }
    return ThemeController.instance;
  }

  /**
   * Load the currently active theme JSON into memory.
   */
  private loadCurrentTheme(): void {
    try {
      const activeThemeName = vscode.workspace
        .getConfiguration("workbench")
        .get<string>("colorTheme");
      if (!activeThemeName) {
        console.warn("No active theme detected");
        return;
      }
      log("activeThemeName", activeThemeName);
      const themeExt = vscode.extensions.all.find((ext) => {
        const themes = ext.packageJSON?.contributes?.themes || [];
        return themes.some(
          (t: any) => t.label === activeThemeName || t.id === activeThemeName
        );
      });
      log("themeExt", themeExt);
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
      log("themeInfo", themeInfo);
      const themeJsonPath = path.join(themeExt.extensionPath, themeInfo.path);

      if (!fs.existsSync(themeJsonPath)) {
        console.error("Theme JSON file not found:", themeJsonPath);
        return;
      }
      this.currentThemePath = themeJsonPath;
      log("themeJsonPath", themeJsonPath);
      const parsedTheme = parse(fs.readFileSync(themeJsonPath, "utf8"));
      this.currentTheme = parsedTheme;
    } catch (error) {
      console.error("Error loading current theme", error);
    }
  }

  /**
   * Force reload theme from disk
   */
  public refreshTheme(): void {
    log("refreshing theme");
    this.loadCurrentTheme();
  }

  public getColors(): ColorMetaGrouped | undefined {
    const colors = this.currentTheme?.colors;
    return colors ? generateColors(colors) : undefined;
  }

  public getTokenColors(): TokenColorsList | undefined {
    const tokenColors = this.currentTheme?.tokenColors;
    return tokenColors ? convertTokenColors(tokenColors) : undefined;
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
    return !!this.currentTheme?.name?.includes("Theme Your Code");
  }

  public getThemePath(): string | undefined {
    return this.currentThemePath;
  }

  /**
   * Return themes contributed by this extension (from package.json)
   */
  public listOwnThemes(
    context: vscode.ExtensionContext
  ): Array<{ label: string; path: string; uiTheme?: string }> {
    try {
      const packageJsonPath = path.join(context.extensionPath, "package.json");
      const pkg = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
      const themes: Array<{ label: string; path: string; uiTheme?: string }> =
        pkg?.contributes?.themes?.map((t: any) => ({
          label: t.label,
          path: t.path,
          uiTheme: t.uiTheme,
        })) || [];
      return themes;
    } catch (error) {
      console.error("Failed to read extension themes from package.json", error);
      return [];
    }
  }

  /**
   * Return currently active theme label as configured in VS Code
   */
  public getActiveThemeLabel() {
    const activeThemeName = vscode.workspace
      .getConfiguration("workbench")
      .get<string>("colorTheme");
    return activeThemeName;
  }

  /**
   * Overwrite a theme JSON by its label from our extension package.json
   */
  public overwriteThemeByLabel(
    context: vscode.ExtensionContext,
    themeLabel: string,
    colors: DraftColor,
    tokenColors: DraftToken
  ): void {
    try {
      const themes = this.listOwnThemes(context);
      const target = themes.find((t) => t.label === themeLabel);
      if (!target) {
        vscode.window.showErrorMessage(
          `Theme "${themeLabel}" not found in this extension.`
        );
        return;
      }

      const absoluteThemePath = path.join(context.extensionPath, target.path);
      if (!fs.existsSync(absoluteThemePath)) {
        vscode.window.showErrorMessage(
          `Theme file not found at ${absoluteThemePath}`
        );
        return;
      }

      const themeJson: Theme = JSON.parse(
        fs.readFileSync(absoluteThemePath, "utf8")
      );

      const tokensArray = convertTokenColorsBackToTheme(tokenColors);

      const updatedTheme: Theme = {
        ...themeJson,
        colors: {
          ...this.currentTheme?.colors,
          ...colors,
        },
        semanticTokenColors: {
          ...this.currentTheme?.semanticTokenColors,
          ...tokensArray.semanticTokenColors,
        },
        tokenColors: [
          ...(this.currentTheme?.tokenColors ?? []),
          ...tokensArray.tokenColors,
        ],
      } as Theme;

      fs.writeFileSync(
        absoluteThemePath,
        JSON.stringify(updatedTheme, null, 2),
        "utf8"
      );

      // If we just overwrote the active theme, refresh in-memory cache
      const activeLabel = this.getActiveThemeLabel();
      if (activeLabel && activeLabel === themeLabel) {
        this.currentThemePath = absoluteThemePath;
        this.currentTheme = updatedTheme;
        this.refreshTheme();
      }
    } catch (error) {
      console.error("Failed to overwrite theme by label", error);
    }
  }

  /**
   * Create a new theme file inside our extension folder
   */
  public createTheme(
    context: vscode.ExtensionContext,
    themeName: string,
    colors: DraftColor,
    tokenColors: DraftToken,
    type: "light" | "dark" = "dark"
  ): string {
    try {
      log("creating theme", themeName);
      const themesDir = path.join(context.extensionPath, "/src/themes");
      log("themesDir", themesDir);
      if (!fs.existsSync(themesDir)) fs.mkdirSync(themesDir);
      log("themesDir exists", fs.existsSync(themesDir));
      const themePath = path.join(themesDir, `${themeName}.json`);
      log("themePath", themePath);

      const tokensArray = convertTokenColorsBackToTheme(tokenColors);
      log("tokensArray", tokensArray);
      const themeJson: Theme & { publisher: string } = {
        name: themeName,
        type,
        publisher: "Theme Your Code",
        colors: {
          ...this.currentTheme?.colors,
          ...colors,
        },
        tokenColors: {
          ...this.currentTheme?.tokenColors,
          ...tokensArray.tokenColors,
        },
        semanticTokenColors: {
          ...this.currentTheme?.semanticTokenColors,
          ...tokensArray.semanticTokenColors,
        },
      };
      log("themeJson", themeJson);
      fs.writeFileSync(themePath, JSON.stringify(themeJson, null, 2), "utf8");
      return themePath;
    } catch (error) {
      console.error("Error creating theme", error);
      return "";
    }
  }
  public addThemeToPackageJson(
    context: vscode.ExtensionContext,
    themeName: string,
    themeFile: string,
    type: "light" | "dark" = "dark"
  ) {
    const packageJsonPath = path.join(context.extensionPath, "package.json");
    const pkg = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

    // Ensure "contributes" & "themes" exist
    if (!pkg.contributes) pkg.contributes = {};
    if (!pkg.contributes.themes) pkg.contributes.themes = [];

    // Avoid duplicates
    const alreadyExists = pkg.contributes.themes.some(
      (t: any) => t.label === themeName
    );
    if (alreadyExists) {
      vscode.window.showWarningMessage(
        `Theme "${themeName}" already exists in package.json.`
      );
      return;
    }

    // Add new theme entry
    pkg.contributes.themes.push({
      label: themeName,
      uiTheme: type === "dark" ? "vs-dark" : "vs",
      path: `./src/themes/${themeFile}`,
    });

    fs.writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2), "utf8");

    vscode.window
      .showInformationMessage(
        `Theme "${themeName}" added! Reload to activate.`,
        "Reload Now"
      )
      .then((selection) => {
        if (selection === "Reload Now") {
          vscode.commands.executeCommand("workbench.action.reloadWindow");
        }
      });
  }
}
