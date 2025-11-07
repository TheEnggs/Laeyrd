import * as vscode from "vscode";
import { ThemeController } from "./theme";
import { UserSettingsController } from "./userSettings";
import {
  RequestMessage,
  ResponseMessage,
  SaveThemeModes,
  WebViewEvent,
} from "@shared/types/event";
import { SettingsController } from "./settings";
import { UserPreferencesController } from "./userPreferences";
import { AuthController } from "./auth";
import { ToastController } from "./toast";
import { log } from "@shared/utils/debug-logs";
import SyncController from "./sync";
import { DraftColor, DraftToken } from "@shared/types/theme";

export class MessageController {
  private _themeController?: ThemeController;
  private _authController?: AuthController;
  private _userPreferenceController?: UserPreferencesController;
  private panel?: vscode.WebviewPanel;

  constructor(
    private context: vscode.ExtensionContext,
    themeController?: ThemeController
  ) {
    this._themeController = themeController;
  }

  private async themeController(): Promise<ThemeController> {
    if (!this._themeController) {
      this._themeController = await ThemeController.create();
    }
    return this._themeController;
  }

  public get showToast(): typeof ToastController.showToast {
    return ToastController.showToast;
  }

  private get authController(): AuthController {
    if (!this._authController)
      this._authController = AuthController.getInstance();
    return this._authController;
  }

  private get userPreferencesController(): UserPreferencesController {
    if (!this._userPreferenceController)
      this._userPreferenceController = new UserPreferencesController(
        this.context
      );
    return this._userPreferenceController;
  }

  setPanel(panel: vscode.WebviewPanel) {
    this.panel = panel;
  }

  public async handle<T extends keyof WebViewEvent>(
    command: T,
    message: RequestMessage<T>
  ) {
    // Validate message structure
    if (!message || typeof message !== "object") {
      console.error("Invalid message received:", message);
      this.showToast({
        message: "Invalid message received",
        type: "error",
      });
      return;
    }

    log("incoming command", command, message);
    switch (command) {
      case "SHOW_TOAST":
        this.showToast({
          message: message.payload.message,
          type: message.payload.type,
        });
        break;
      case "GET_THEME_COLORS":
        this.responseHandler({
          command,
          requestId: message.requestId,
          executor: async () => {
            const tc = await this.themeController();
            return tc.getColors();
          },
        });
        break;
      case "GET_THEME_TOKEN_COLORS":
        this.responseHandler({
          command,
          requestId: message.requestId,
          executor: async () => {
            const tc = await this.themeController();
            return tc.getTokenColors();
          },
        });
        break;
      case "GET_SEMANTIC_TOKEN_COLORS":
        this.responseHandler({
          command,
          requestId: message.requestId,
          executor: async () => {
            const tc = await this.themeController();
            tc.getSemanticTokenColors();
          },
        });
        break;
      case "GET_THEME_LIST": {
        const tc = await this.themeController();
        const list = await tc.listOwnThemes(this.context);
        const filteredList = list.filter(
          (t) => t.label! === "Live Preview - Laeyrd"
        );
        const active = tc.getActiveThemeLabel();
        this.responseHandler({
          command,
          requestId: message.requestId,
          executor: () => ({
            themes: filteredList,
            active,
          }),
        });
        break;
      }
      case "SAVE_THEME":
        this.responseHandler<"SAVE_THEME", "response">({
          command,
          requestId: message.requestId,
          executor: () => this.handleSaveTheme(message.payload),
        });
        break;
      case "ENABLE_LIVE_PREVIEW":
        this.responseHandler<"ENABLE_LIVE_PREVIEW", "response">({
          command,
          requestId: message.requestId,
          executor: async () => {
            const themeController = await ThemeController.create();
            return themeController.enableLivePreview(this.context);
          },
        });
        break;
      case "SAVE_SETTINGS":
        await this.responseHandler({
          command,
          requestId: message.requestId,
          executor: () => this.handleOverwriteSettings(message.payload),
        });
        break;
      case "RESTORE_ORIGINAL_SETTINGS":
        const settings = new UserSettingsController(this.context);
        settings.rollbackToOriginal();
        break;
      case "GET_USER_PREFERENCES":
        this.responseHandler({
          command,
          requestId: message.requestId,
          executor: () => this.userPreferencesController.getUserPreferences(),
        });
        break;
      case "UPDATE_USER_PREFERENCES":
        this.responseHandler({
          command,
          requestId: message.requestId,
          executor: () =>
            this.userPreferencesController.updateUserPreferences(
              message.payload
            ),
        });
        break;
      case "SYNC_USER_PREFERENCES":
        this.responseHandler({
          command,
          requestId: message.requestId,
          executor: async () => {
            // First update preferences, then sync
            await this.userPreferencesController.updateUserPreferences(
              message.payload
            );
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
          executor: () => this.authController.getServerConfig(),
        });
        break;
      case "WEBAPP_SIGN_IN":
        this.responseHandler({
          command,
          requestId: message.requestId,
          executor: async () => {
            const res = await this.authController.startDeviceFlow();
            log("WEBAPP_SIGN_IN response", res);
            return {
              user_code: res.user_code,
              verificationUri: res.verification_uri,
              expiresIn: res.expires_in,
            };
          },
        });
        break;
      case "SIGN_OUT":
        this.responseHandler({
          command,
          requestId: message.requestId,
          executor: () => this.authController.signOut(),
        });
        break;
      case "GET_AUTH_USER":
        this.responseHandler({
          command,
          requestId: message.requestId,
          executor: () => this.authController.getCurrentUser(),
        });
        break;
      case "UPDATE_AUTH_USER":
        this.responseHandler({
          command,
          requestId: message.requestId,
          executor: () => this.authController.updateUser(message.payload),
        });
        break;
      case "GET_AUTH_SESSION":
        this.responseHandler({
          command,
          requestId: message.requestId,
          executor: () => this.authController.getCurrentSession(),
        });
        break;
      case "OPEN_EXTERNAL_URL":
        this.responseHandler({
          command,
          requestId: message.requestId,
          executor: () =>
            this.authController.openExternalUrl(message.payload.url),
        });
        break;

      case "OPEN_DONATION": {
        const url = vscode.Uri.parse("https://buymeacoffee.com/laeyrd");
        vscode.env.openExternal(url);
        break;
      }

      case "GET_FONT_AND_LAYOUT_SETTINGS": {
        const settings = await SettingsController.getInstance(this.context);
        this.responseHandler({
          command,
          requestId: message.requestId,
          executor: () => settings.getMergedSettings(),
        });
        break;
      }
      case "TEST_SETTINGS_CHANGE": {
        const settings = await SettingsController.getInstance(this.context);
        settings.testSettingsChange();
        this.settingsChanged();
        break;
      }
      case "SYNC": {
        const userId = this._authController?.getCurrentUser()?.id;
        if (!userId) throw new Error("User id is missing");
        const syncController = new SyncController(
          this.context,
          this.POST_MESSAGE,
          userId
        );
        syncController.loadOrCreateLocalVersions();
        this.responseHandler<"SYNC", "response">({
          command,
          requestId: message.requestId,
          executor: async () => await syncController.syncAll(),
        });
        break;
      }
      default:
        console.warn("Unknown message:", message);
    }
  }

  private async handleSaveTheme(payload: {
    mode: keyof typeof SaveThemeModes;
    themeName: string;
    colors: DraftColor;
    tokens: DraftToken;
    type: "dark" | "light";
  }) {
    log("SAVE_THEME", payload);
    if (!payload.themeName && payload.mode !== "LIVE")
      throw new Error("Invalid theme name");
    const tc = await this.themeController();
    return await tc.handleSaveTheme(payload, this.context);
  }

  private async handleOverwriteSettings(payload: {
    settings: Record<string, string | number | boolean>;
  }) {
    const settingsController = await SettingsController.getInstance(
      this.context
    );
    settingsController.overwriteSettingsJson(payload.settings);
    return null;
  }

  public async responseHandler<
    T extends keyof WebViewEvent,
    K extends "payload" | "response",
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
      log("error occurred in response handler", err);
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
    K extends "payload" | "response",
  >({ command, payload, requestId, status, error }: ResponseMessage<T, K>) {
    const messageData = { command, payload, requestId, status, error };
    try {
      if (!this.panel) {
        log("Panel not found");
        return;
      }
      this.panel.webview.postMessage(messageData);
    } catch (error) {
      console.error("Invalid message data:", error);
      console.error("Message data:", messageData);
      return;
    }
  }

  public async configurationChanged({
    updateThemeColor,
    updateThemeList,
  }: {
    updateThemeColor: boolean;
    updateThemeList: boolean;
  }) {
    const tc = await this.themeController();
    await tc.refreshTheme();
    if (updateThemeColor) {
      this.responseHandler({
        command: "UPDATE_THEME_COLORS",
        requestId: "",
        mode: "payload",
        executor: async () => {
          const tc = await this.themeController();
          return tc.getColors();
        },
      });
    }
    if (updateThemeList) {
      this.responseHandler({
        command: "UPDATE_THEME_LIST",
        requestId: "",
        mode: "payload",
        executor: async () => {
          const tc = await this.themeController();
          const list = await tc.listOwnThemes(this.context);
          const active = tc.getActiveThemeLabel() || "";
          return {
            themes: list,
            active,
          };
        },
      });
    }
  }

  /**
   * Handle font and layout settings changes and notify the frontend
   */
  public async settingsChanged() {
    const settingsController = await SettingsController.getInstance(
      this.context
    );

    // Handle configuration change and reload settings
    await settingsController.handleConfigurationChange();

    // Get the updated merged settings
    const mergedSettings = settingsController.getMergedSettings();

    if (mergedSettings) {
      log("[MessageHandler] Notifying frontend of settings changes");
      this.responseHandler({
        command: "UPDATE_FONT_AND_LAYOUT_SETTINGS",
        requestId: "",
        mode: "payload",
        executor: () => mergedSettings,
      });
    }
  }
}
