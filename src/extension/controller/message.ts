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
import { ToastController } from "./toast";
import { HistoryController } from "./history";
import { DraftColor, DraftToken } from "@webview/contexts/settings-context";
import { log } from "../../lib/debug-logs";

export class MessageHandler {
  private toastController: ToastController;
  constructor(
    private context: vscode.ExtensionContext,
    private panel: vscode.WebviewPanel
  ) {
    this.toastController = ToastController.getInstance(this.context);
  }

  public async handle<T extends keyof WebViewEvent>(
    command: T,
    message: RequestMessage<T>
  ) {
    // Validate message structure
    if (!message || typeof message !== "object") {
      console.error("Invalid message received:", message);
      this.toastController.showToast({
        message: "Invalid message received",
        type: "error",
      });
      return;
    }

    log("incoming command", command, message);
    switch (command) {
      case "SHOW_TOAST":
        this.toastController.showToast({
          message: message.payload.message,
          type: message.payload.type,
        });
        break;
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
      case "GET_THEME_LIST": {
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
        this.responseHandler({
          command,
          requestId: message.requestId,
          executor: () => this.handleSaveTheme(message.payload),
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

      case "GET_FONT_AND_LAYOUT_SETTINGS": {
        const settings = SettingsController.getInstance(this.context);
        this.responseHandler({
          command,
          requestId: message.requestId,
          executor: () => settings.getMergedSettings(),
        });
        break;
      }
      case "TEST_SETTINGS_CHANGE": {
        const settings = SettingsController.getInstance(this.context);
        settings.testSettingsChange();
        this.settingsChanged();
        break;
      }
      // History handlers
      case "GET_HISTORY": {
        const historyController = HistoryController.getInstance(this.context);
        this.responseHandler({
          command,
          requestId: message.requestId,
          executor: () => historyController.getHistory(),
        });
        break;
      }
      case "ADD_HISTORY_ENTRY": {
        const historyController = HistoryController.getInstance(this.context);
        historyController.addEntry(message.payload);
        break;
      }
      case "CLEAR_HISTORY": {
        const historyController = HistoryController.getInstance(this.context);
        historyController.clearHistory();
        break;
      }
      case "RESET_TO_HISTORY_ENTRY": {
        this.responseHandler({
          command,
          requestId: message.requestId,
          executor: () =>
            this.handleResetToHistoryEntry(message.payload.entryId),
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
    colors: DraftColor;
    tokens: DraftToken;
  }) {
    const themeController = ThemeController.getInstance(this.context);
    log("SAVE_THEME", payload);
    if (!payload.themeName) {
      this.handle("SHOW_TOAST", {
        command: "SHOW_TOAST",
        requestId: "",
        payload: {
          message: "Please enter a theme name",
          type: "error",
        },
      });
      return;
    }
    if (payload.mode === "overwrite") {
      themeController.overwriteThemeByLabel(
        this.context,
        payload.themeName,
        payload.colors,
        payload.tokens
      );
    } else {
      const themeName = payload.themeName || "Untitled Theme";
      themeController.createTheme(
        this.context,
        themeName,
        payload.colors,
        payload.tokens
      );
      themeController.addThemeToPackageJson(
        this.context,
        themeName,
        themeName + ".json",
        "dark"
      );
    }
    // Apply VS Code settings (fonts/layout) if provided
    // if (payload.vscodeSettings) {
    //   const settings = new UserSettingsController(this.context);
    //   settings.ensureOriginalBackup();
    //   settings.applySettings(payload.payload.vscodeSettings);
    // }
    return null;
  }

  private async handleOverwriteSettings(payload: {
    settings: Record<string, string | number | boolean>;
  }) {
    const settingsController = SettingsController.getInstance(this.context);
    settingsController.overwriteSettingsJson(payload.settings);
    return null;
  }

  private async handleResetToHistoryEntry(entryId: string) {
    const historyController = HistoryController.getInstance(this.context);
    const entry = historyController.getEntryById(entryId);

    if (!entry) {
      throw new Error("History entry not found");
    }

    const themeController = ThemeController.getInstance(this.context);
    const settingsController = SettingsController.getInstance(this.context);

    try {
      // Reset colors if they exist in the entry
      if (entry.originalValues.colors) {
        // Apply the original colors from before this change
        const resetColors = entry.originalValues.colors;

        // Find active theme to apply reset to
        const activeTheme = themeController.getActiveThemeLabel();
        if (activeTheme) {
          themeController.overwriteThemeByLabel(
            this.context,
            activeTheme,
            resetColors,
            { tokenColors: {}, semanticTokenColors: {} } // We'll handle tokens separately
          );
        }
      }

      // Reset token colors if they exist
      if (
        entry.originalValues.tokenColors ||
        entry.originalValues.semanticTokenColors
      ) {
        const tokenColors = entry.originalValues.tokenColors || {};
        const semanticTokenColors =
          entry.originalValues.semanticTokenColors || {};

        const activeTheme = themeController.getActiveThemeLabel();
        if (activeTheme) {
          themeController.overwriteThemeByLabel(
            this.context,
            activeTheme,
            {},
            { tokenColors, semanticTokenColors }
          );
        }
      }

      // Reset font and layout settings if they exist
      if (entry.originalValues.fontLayoutSettings) {
        const fontLayoutSettings =
          entry.originalValues.fontLayoutSettings || {};
        this.handleOverwriteSettings({
          settings: {
            ...fontLayoutSettings,
          },
        });
      }

      log(
        `[MessageHandler] Successfully reset to history entry: ${entry.description}`
      );
      return { success: true };
    } catch (error) {
      log(`[MessageHandler] Error resetting to history entry: ${error}`);
      throw error;
    }
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
    log("outgoing response", command, requestId);
    try {
      const response = await executor();
      this.POST_MESSAGE<T, K>({
        command,
        requestId,
        status: "success",
        payload: response,
      });
    } catch (err) {
      log("error occured in response handler", err);
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

  /**
   * Handle font and layout settings changes and notify the frontend
   */
  public settingsChanged() {
    const settingsController = SettingsController.getInstance(this.context);

    // Handle configuration change and reload settings
    settingsController.handleConfigurationChange();

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
