import * as vscode from "vscode";
import { ThemeController } from "./theme";
import { UserSettingsController } from "./userSettings";
import {
  RequestMessage,
  ResponseMessage,
  WebViewEvent,
} from "@shared/types/event";
import { SettingsController } from "./settings";
import { AuthController } from "./auth";
import { ToastController } from "./toast";
import { log } from "@shared/utils/debug-logs";
import SyncController from "./sync";
import DraftManager from "./draft";
import { TelemetryService } from "./telemetry";

export class MessageController {
  private _themeController?: ThemeController;
  private _authController?: AuthController;
  private panel?: vscode.WebviewPanel;

  constructor(
    private context: vscode.ExtensionContext,
    themeController?: ThemeController
  ) {
    this._themeController = themeController;
  }

  private async themeController(): Promise<ThemeController> {
    if (!this._themeController) {
      this._themeController = await ThemeController.getInstance(this.context);
    }
    return this._themeController;
  }

  public get showToast(): typeof ToastController.showToast {
    return ToastController.showToast;
  }

  private get authController(): AuthController {
    if (!this._authController)
      {this._authController = AuthController.getInstance();}
    return this._authController;
  }

  setPanel(panel: vscode.WebviewPanel) {
    this.panel = panel;
  }

  //TODO: conversion to Message factory/registry method to handle all messages
  public async handle(message: RequestMessage) {
    // Validate message structure
    if (!message || typeof message !== "object") {
      console.error("Invalid message received:", message);
      this.showToast({
        message: "Invalid message received",
        type: "error",
      });
      return;
    }

    const { command } = message;
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
      case "GET_THEME_TOKEN_MAP_COLORS":
        this.responseHandler<"GET_THEME_TOKEN_MAP_COLORS", "response">({
          command,
          requestId: message.requestId,
          executor: async () => {
            const tc = await this.themeController();
            return tc.getTokenMapColors();
          },
        });
        break;
      case "GET_THEME_LIST": {
        const tc = await this.themeController(),
         themes = await tc.listOwnThemes(),
         active = tc.getActiveThemeLabel();
        this.responseHandler<"GET_THEME_LIST", "response">({
          command,
          requestId: message.requestId,
          executor: () => ({
            themes,
            active,
          }),
        });
        break;
      }
      //   Case "SAVE_THEME":
      //     This.responseHandler<"SAVE_THEME", "response">({
      //       Command,
      //       RequestId: message.requestId,
      //       Executor: () => this.handleSaveTheme(message.payload),
      //     });
      //     Break;
      case "DELETE_THEME":
        this.responseHandler<"DELETE_THEME", "response">({
          command,
          requestId: message.requestId,
          executor: async () => {
            const tc = await this.themeController();
            return await tc.deleteThemeFile(message.payload);
          },
        });
        break;
      case "GET_DRAFT_STATE":
        this.responseHandler<"GET_DRAFT_STATE", "response">({
          command,
          requestId: message.requestId,
          executor: async () =>
            (await DraftManager.init(this.context)).draftFileContent,
        });
        break;
      case "UPDATE_DRAFT_STATE":
        this.responseHandler<"UPDATE_DRAFT_STATE", "response">({
          command,
          requestId: message.requestId,
          executor: async () => {
            const draftManager = await DraftManager.init(this.context),
             result = await draftManager.applyDraftChanges(
              message.payload
            );
            return {
              success: result,
              draftFile: draftManager.draftFileContent,
            };
          },
        });
        break;
      case "PUBLISH_DRAFT_CHANGES":
        this.responseHandler<"PUBLISH_DRAFT_CHANGES", "response">({
          command,
          requestId: message.requestId,
          executor: async () => {
            const draftManager = await DraftManager.init(this.context),
             result = await draftManager.publishDraftChanges(
              message.payload
            );
            if (
              result.success &&
              (result.data.publishType === "theme" ||
                result.data.publishType === "both")
            ) {
              await this.configurationChanged({
                updateThemeColor: true,
                updateThemeList: true,
              });
            }
            return result;
          },
        });
        break;

      case "REMOVE_DRAFT_CHANGE":
        this.responseHandler<"REMOVE_DRAFT_CHANGE", "response">({
          command,
          requestId: message.requestId,
          executor: async () => {
            const draftManager = await DraftManager.init(this.context),
             result = await draftManager.removeDraftChange(
              message.payload
            );
            return result;
          },
        });
        break;
      case "DISCARD_DRAFT_CHANGES":
        this.responseHandler<"DISCARD_DRAFT_CHANGES", "response">({
          command,
          requestId: message.requestId,
          executor: async () => {
            const draftManager = await DraftManager.init(this.context),
             result = await draftManager.discardChanges();
            return result;
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
        const url = vscode.Uri.parse("https://buymeacoffee.com/theenggs");
        vscode.env.openExternal(url);
        break;
      }

      case "GET_FONT_AND_LAYOUT_SETTINGS": {
        const settings = await SettingsController.init(this.context);
        this.responseHandler({
          command,
          requestId: message.requestId,
          executor: () => settings.getMergedSettings(),
        });
        break;
      }

      case "SYNC": {
        const userId = this._authController?.getCurrentUser()?.id;
        if (!userId) {throw new Error("User id is missing");}
        const syncController = new SyncController(this.context, userId);
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

  private async handleOverwriteSettings(payload: {
    settings: Record<string, string | number | boolean>;
  }) {
    const settingsController = await SettingsController.init(this.context);
    return settingsController.overwriteSettingsJson(payload.settings);
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
      if(command === "PUBLISH_DRAFT_CHANGES"){
        TelemetryService.instance.sendEvent("MESSAGE RESPONSE HANDLER", {
          command,
          requestId,
        });
      }
      const response = await executor();
      this.POST_MESSAGE<T, K>({
        command,
        requestId,
        status: "success",
        payload: response,
      });
    } catch (err) {
      TelemetryService.instance.sendError("MESSAGE RESPONSE HANDLER", err, {
        command,
        requestId,
      });
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
        return;
      }
      this.panel.webview.postMessage(messageData);
    } catch (error) {
      console.error("Invalid message data:", error);
      console.error("Message data:", messageData);
      
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
      this.responseHandler({
        command: "UPDATE_TOKEN_MAP_COLORS",
        requestId: "",
        mode: "payload",
        executor: async () => {
          const tc = await this.themeController();
          return tc.getTokenMapColors();
        },
      });
    }
    if (updateThemeList) {
      this.responseHandler({
        command: "UPDATE_THEME_LIST",
        requestId: "",
        mode: "payload",
        executor: async () => {
          const tc = await this.themeController(),
           list = await tc.listOwnThemes(),
           active = tc.getActiveThemeLabel() || "";
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
    const settingsController = await SettingsController.init(this.context);

    // Handle configuration change and reload settings
    await settingsController.handleConfigurationChange();

    // Get the updated merged settings
    const mergedSettings = settingsController.getMergedSettings();

    if (mergedSettings) {
      this.responseHandler({
        command: "UPDATE_FONT_AND_LAYOUT_SETTINGS",
        requestId: "",
        mode: "payload",
        executor: () => mergedSettings,
      });
    }
  }
}
