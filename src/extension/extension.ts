import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import { log } from "../lib/debug-logs";
import { MessageHandler } from "./controller/message";
import { ThemeController } from "./controller/theme";
import { UserSettingsController } from "./controller/userSettings";
import { LivePreviewController } from "./controller/livePreview";
import { UserPreferencesController } from "./controller/userPreferences";
import { AuthController } from "./controller/auth";
import { HistoryController } from "./controller/history";
import { ThemeYourCodePanelManager } from "./controller/panelManager";

let panelManager: ThemeYourCodePanelManager;
let authController: AuthController;

export async function activate(context: vscode.ExtensionContext) {
  const controllers = {
    theme: ThemeController.getInstance(context),
    userSettings: new UserSettingsController(context),
    auth: AuthController.getInstance(context),
    preferences: UserPreferencesController.getInstance(context),
    history: HistoryController.getInstance(context),
  };

  // Store auth controller reference for cleanup

  controllers.userSettings.ensureOriginalBackup();

  panelManager = new ThemeYourCodePanelManager(context);
  authController = controllers.auth;
  authController.onAuthChanged((user) => {
    panelManager.messageHandler?.POST_MESSAGE({
      command: "UPDATE_AUTH_USER",
      payload: user || undefined,
      requestId: "",
      status: "success",
    });
  });

  const openCommand = vscode.commands.registerCommand(
    "themeYourCode.open",
    () => panelManager.open()
  );

  context.subscriptions.push(openCommand, panelManager);
}

export function deactivate() {
  // Cleanup auth server when extension is deactivated
  if (authController) {
    authController.dispose();
  }
}
const isDev = false;
