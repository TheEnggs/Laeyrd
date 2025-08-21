import * as vscode from "vscode";
import { ThemeController } from "./theme";
import { UserSettingsController } from "./userSettings";
import { LivePreviewController } from "./livePreview";
import { transformColorsToColorTabs } from "../utils/color-category-map";

export class MessageHandler {
  constructor(
    private context: vscode.ExtensionContext,
    private panel: vscode.WebviewPanel
  ) {}

  public async handle(message: any) {
    // Validate message structure
    if (!message || typeof message !== "object") {
      console.error("Invalid message received:", message);
      return;
    }

    switch (message.command) {
      case "ENABLE_LIVE_PREVIEW": {
        const lp = LivePreviewController.getInstance(this.context);
        await lp.enable();
        break;
      }
      case "DISABLE_LIVE_PREVIEW": {
        const lp = LivePreviewController.getInstance(this.context);
        await lp.disable(false);
        break;
      }
      case "LIVE_PREVIEW_APPLY": {
        const tc = ThemeController.getInstance();
        // Apply to live-preview theme in place
        tc.overwriteThemeByLabel(
          this.context,
          "live-preview",
          message.payload.colors || {},
          message.payload.tokenColors || []
        );
        // Apply settings live (fonts/layout); do not include color customizations here
        if (message.payload.vscodeSettings) {
          const settings = new UserSettingsController(this.context);
          settings.applySettings(message.payload.vscodeSettings);
        }
        break;
      }
      case "OPEN_DONATION": {
        const url = vscode.Uri.parse("https://buymeacoffee.com/themeYourCode");
        vscode.env.openExternal(url);
        break;
      }
      case "GET_THEME_COLORS":
        console.log("GETting_THEME_COLORS");
        const groupedColors = ThemeController.getInstance().getColors();
        console.log("Grouped colors:", groupedColors);
        console.log("Grouped colors type:", typeof groupedColors);
        console.log(
          "Grouped colors keys:",
          groupedColors ? Object.keys(groupedColors) : "null"
        );

        // Transform flat grouped colors to hierarchical ColorTab structure
        const colorTabs = groupedColors || [];
        console.log("Color tabs result:", colorTabs);
        console.log("Color tabs length:", colorTabs?.length);
        const responseData = {
          command: "GET_THEME_COLORS",
          payload: colorTabs,
          status: "success",
          requestId: message.requestId,
        };

        // Validate response data
        try {
          JSON.stringify(responseData);
          this.panel.webview.postMessage(responseData);
        } catch (error) {
          console.error("Invalid response data:", error);
          console.error("Response data:", responseData);
        }
        break;
      case "GET_THEME_TOKEN_COLORS":
        const tokenColors = ThemeController.getInstance().getTokenColors();
        const tokenResponseData = {
          command: "GET_THEME_TOKEN_COLORS",
          payload: tokenColors,
        };

        try {
          JSON.stringify(tokenResponseData);
          this.panel.webview.postMessage(tokenResponseData);
        } catch (error) {
          console.error("Invalid token response data:", error);
          console.error("Token response data:", tokenResponseData);
        }
        break;
      case "GET_THEMES_LIST": {
        const tc = ThemeController.getInstance();
        const list = tc.listOwnThemes(this.context);
        const active = tc.getActiveThemeLabel();
        const themesResponseData = {
          command: "GET_THEMES_LIST",
          payload: { themes: list, active },
        };

        try {
          JSON.stringify(themesResponseData);
          this.panel.webview.postMessage(themesResponseData);
        } catch (error) {
          console.error("Invalid themes response data:", error);
          console.error("Themes response data:", themesResponseData);
        }
        break;
      }
      case "SAVE_THEME":
        await this.handleSaveTheme(message.payload);
        break;
      case "RESTORE_ORIGINAL_SETTINGS":
        const settings = new UserSettingsController(this.context);
        settings.rollbackToOriginal();
        break;
      default:
        console.warn("Unknown message:", message);
    }
  }

  private async handleSaveTheme(payload: {
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

    const saveResponseData = { command: "SAVE_SUCCESS" };

    try {
      JSON.stringify(saveResponseData);
      this.panel.webview.postMessage(saveResponseData);
    } catch (error) {
      console.error("Invalid save response data:", error);
      console.error("Save response data:", saveResponseData);
    }
    // If live preview is on, turn it off after save completes
    const lp = LivePreviewController.getInstance(this.context);
    await lp.handleSaveComplete();
  }

  public postMessage(message: any, payload: any) {
    // Validate data before sending
    const messageData = { command: message, payload };

    // Check for circular references or undefined values
    try {
      JSON.stringify(messageData);
    } catch (error) {
      console.error("Invalid message data:", error);
      console.error("Message data:", messageData);
      return;
    }

    this.panel.webview.postMessage(messageData);
  }
}
