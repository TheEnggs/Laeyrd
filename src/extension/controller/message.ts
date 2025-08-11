import * as vscode from "vscode";
import { ThemeController } from "./theme";
import { UserSettingsController } from "./userSettings";

export class MessageHandler {
  constructor(
    private context: vscode.ExtensionContext,
    private panel: vscode.WebviewPanel
  ) {}

  public async handle(message: any) {
    switch (message.command) {
      case "GET_THEME_COLORS":
        const colors = ThemeController.getInstance().getColors();
        this.panel.webview.postMessage({
          command: "GET_THEME_COLORS",
          payload: colors,
        });
        break;
      case "GET_THEME_TOKEN_COLORS":
        const tokenColors = ThemeController.getInstance().getTokenColors();
        this.panel.webview.postMessage({
          command: "GET_THEME_TOKEN_COLORS",
          payload: tokenColors,
        });
        break;
      case "GET_THEMES_LIST": {
        const tc = ThemeController.getInstance();
        const list = tc.listOwnThemes(this.context);
        const active = tc.getActiveThemeLabel();
        this.panel.webview.postMessage({
          command: "GET_THEMES_LIST",
          payload: { themes: list, active },
        });
        break;
      }
      case "SAVE_THEME":
        this.handleSaveTheme(message.payload);
        break;
      default:
        console.warn("Unknown message:", message);
    }
  }

  private handleSaveTheme(payload: {
    mode: "create" | "overwrite";
    themeName?: string;
    overwriteLabel?: string; // when overwriting pick a label from our package.json list
    colors: Record<string, string>;
    tokenColors: any[];
    vscodeSettings?: any;
  }) {
    const themeController = ThemeController.getInstance();
    console.log("SAVE_THEME", payload);
    if (payload.mode === "overwrite") {
      if (payload.overwriteLabel) {
        themeController.overwriteThemeByLabel(
          this.context,
          payload.overwriteLabel,
          payload.colors,
          payload.tokenColors
        );
      } else {
        themeController.overwriteTheme(payload.colors, payload.tokenColors);
      }
    } else {
      const themeName = payload.themeName || "Untitled Theme";
      themeController.createTheme(
        this.context,
        themeName,
        payload.colors,
        payload.tokenColors
      );
      themeController.addThemeToPackageJson(
        this.context,
        themeName,
        themeName + ".json",
        "dark"
      );
    }
    // Apply VS Code settings (fonts/layout) if provided
    if (payload.vscodeSettings) {
      const settings = new UserSettingsController(this.context);
      settings.ensureOriginalBackup();
      settings.applySettings(payload.vscodeSettings);
    }

    this.panel.webview.postMessage({ command: "SAVE_SUCCESS" });
  }

  public postMessage(message: any, payload: any) {
    this.panel.webview.postMessage({ command: message, payload });
  }
}
