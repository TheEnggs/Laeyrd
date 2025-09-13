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

export async function activate(context: vscode.ExtensionContext) {
  const controllers = {
    theme: ThemeController.getInstance(context),
    userSettings: new UserSettingsController(context),
    preferences: UserPreferencesController.getInstance(context),
    auth: AuthController.getInstance(context),
    history: HistoryController.getInstance(context),
  };

  controllers.userSettings.ensureOriginalBackup();

  panelManager = new ThemeYourCodePanelManager(context);

  const openCommand = vscode.commands.registerCommand(
    "themeYourCode.open",
    () => panelManager.open()
  );

  context.subscriptions.push(openCommand, panelManager);
}
const isDev = false;
