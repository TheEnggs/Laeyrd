import * as vscode from "vscode";
import { ThemeController } from "./theme";
import { UserSettingsController } from "./userSettings";
import { LivePreviewController } from "./livePreview";
import {
  RequestMessage,
  ResponseMessage,
  WebViewEvent,
} from "../../types/event";
import { SettingsController } from "./settings";
import { UserPreferencesController } from "./userPreferences";
import { AuthController } from "./auth";

type Message = {
  command: string;
  payload: WebViewEvent[keyof WebViewEvent]["payload"];
  requestId: string;
};

export class MessageHandler {
  constructor(
    private context: vscode.ExtensionContext,
    private panel: vscode.WebviewPanel
  ) {}

  public async handle<T extends keyof WebViewEvent>(
    command: T,
    message: RequestMessage<T>
  ) {
    // Validate message structure
    if (!message || typeof message !== "object") {
      console.error("Invalid message received:", message);
      return;
    }

    switch (command) {
      case "GET_THEME_COLORS":
        this.responseHandler({
          command,
          requestId: message.requestId,
          executor: () => ThemeController.getInstance(this.context).getColors(),
        });
        break;
      case "GET_THEME_TOKEN_COLORS":
        this.responseHandler({
          command,
          requestId: message.requestId,
          executor: () =>
            ThemeController.getInstance(this.context).getTokenColors(),
        });
        break;
      case "GET_SEMANTIC_TOKEN_COLORS":
        this.responseHandler({
          command,
          requestId: message.requestId,
          executor: () =>
            ThemeController.getInstance(this.context).getSemanticTokenColors(),
        });
        break;
      case "GET_THEMES_LIST": {
        const tc = ThemeController.getInstance(this.context);
        const list = tc.listOwnThemes(this.context);
        const active = tc.getActiveThemeLabel();
        this.responseHandler({
          command,
          requestId: message.requestId,
          executor: () => ({
            themes: list,
            active,
          }),
        });
        break;
      }
      case "SAVE_THEME":
        await this.handleSaveTheme(message.payload);
        break;
      case "SAVE_SETTINGS":
        await this.handleSaveTheme(message.payload);
        break;
      case "RESTORE_ORIGINAL_SETTINGS":
        const settings = new UserSettingsController(this.context);
        settings.rollbackToOriginal();
        break;
      case "GET_USER_PREFERENCES":
        this.responseHandler({
          command,
          requestId: message.requestId,
          executor: () =>
            UserPreferencesController.getInstance(
              this.context
            ).getUserPreferences(),
        });
        break;
      case "UPDATE_USER_PREFERENCES":
        this.responseHandler({
          command,
          requestId: message.requestId,
          executor: () =>
            UserPreferencesController.getInstance(
              this.context
            ).updateUserPreferences(message.payload),
        });
        break;
      case "SYNC_USER_PREFERENCES":
        this.responseHandler({
          command,
          requestId: message.requestId,
          executor: async () => {
            const controller = UserPreferencesController.getInstance(
              this.context
            );
            // First update preferences, then sync
            await controller.updateUserPreferences(message.payload);
            // Return sync result (placeholder for now)
            return {
              success: true,
              message: "Preferences synced successfully",
            };
          },
        });
        break;
      case "GET_SERVER_CONFIG":
        this.responseHandler({
          command,
          requestId: message.requestId,
          executor: () =>
            AuthController.getInstance(this.context).getServerConfig(),
        });
        break;
      case "CLERK_SIGN_IN":
        this.responseHandler({
          command,
          requestId: message.requestId,
          executor: () =>
            AuthController.getInstance(this.context).signIn(
              message.payload?.returnUrl
            ),
        });
        break;
      case "CLERK_SIGN_OUT":
        this.responseHandler({
          command,
          requestId: message.requestId,
          executor: () => AuthController.getInstance(this.context).signOut(),
        });
        break;
      case "GET_AUTH_USER":
        this.responseHandler({
          command,
          requestId: message.requestId,
          executor: () =>
            AuthController.getInstance(this.context).getCurrentUser(),
        });
        break;
      case "UPDATE_AUTH_USER":
        this.responseHandler({
          command,
          requestId: message.requestId,
          executor: () =>
            AuthController.getInstance(this.context).updateUser(
              message.payload
            ),
        });
        break;
      case "GET_AUTH_SESSION":
        this.responseHandler({
          command,
          requestId: message.requestId,
          executor: () =>
            AuthController.getInstance(this.context).getCurrentSession(),
        });
        break;
      case "OPEN_EXTERNAL_URL":
        this.responseHandler({
          command,
          requestId: message.requestId,
          executor: () =>
            AuthController.getInstance(this.context).openExternalUrl(
              message.payload.url
            ),
        });
        break;

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
        const tc = ThemeController.getInstance(this.context);
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
      case "GET_FONT_SETTINGS": {
        const settings = SettingsController.getInstance(this.context);
        console.log("GET_FONT_SETTINGS", settings.getFontSettings());
        this.responseHandler({
          command,
          requestId: message.requestId,
          executor: () => settings.getFontSettings(),
        });
        break;
      }
      case "GET_LAYOUT_SETTINGS": {
        const settings = SettingsController.getInstance(this.context);
        this.responseHandler({
          command,
          requestId: message.requestId,
          executor: () => settings.getLayoutSettings(),
        });
        break;
      }
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
    const themeController = ThemeController.getInstance(this.context);
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

  public async responseHandler<
    T extends keyof WebViewEvent,
    K extends "payload" | "response"
  >({
    command,
    mode = "response" as K,
    requestId,
    executor,
  }: {
    command: T;
    mode?: K;
    requestId: string;
    executor: () => Promise<WebViewEvent[T][K]> | WebViewEvent[T][K];
  }) {
    try {
      const response = await executor();
      this.POST_MESSAGE<T, K>({
        command,
        requestId,
        status: "success",
        payload: response,
      });
    } catch (err) {
      this.POST_MESSAGE<T, K>({
        command,
        requestId,
        status: "error",
        error: (err as Error).message ?? String(err),
      });
    }
  }

  public POST_MESSAGE<
    T extends keyof WebViewEvent,
    K extends "payload" | "response"
  >({ command, payload, requestId, status }: ResponseMessage<T, K>) {
    const messageData = { command, payload, requestId, status };
    try {
      this.panel.webview.postMessage(messageData);
    } catch (error) {
      console.error("Invalid message data:", error);
      console.error("Message data:", messageData);
      return;
    }
  }

  public configurationChanged({
    updateThemeColor,
    updateThemeList,
  }: {
    updateThemeColor: boolean;
    updateThemeList: boolean;
  }) {
    const themeController = ThemeController.getInstance(this.context);
    themeController.refreshTheme();
    if (updateThemeColor) {
      this.responseHandler({
        command: "UPDATE_THEME_COLORS",
        requestId: "",
        mode: "payload",
        executor: async () => themeController.getColors(),
      });
    }
    if (updateThemeList) {
      this.responseHandler({
        command: "UPDATE_THEME_LIST",
        requestId: "",
        mode: "payload",
        executor: () => {
          const list = themeController.listOwnThemes(this.context);
          const active = themeController.getActiveThemeLabel() || "";
          return {
            themes: list,
            active,
          };
        },
      });
    }
  }
}
