import * as vscode from "vscode";
import { PanelManager } from "./controller/panelManager";
import { AuthController } from "./controller/auth";
import ExtensionController from "./controller/extensionController";
import { log } from "@shared/utils/debug-logs";
import { BackupManager } from "./controller/backup";

let panelManager: PanelManager | null = null;
let authController: AuthController | null = null;
export async function activate(context: vscode.ExtensionContext) {
  const extensionController = await ExtensionController.create(context);

  const isVersionUpdated = await extensionController.checkForVersionUpdate();
  const backupManager = new BackupManager(context);
  await backupManager.init();
  if (isVersionUpdated) {
    await backupManager.pullBackups();
  }
  // Make sure we capture the very first settings.json state
  await backupManager.ensureInitialSettingsBackup();

  authController = AuthController.getInstance();
  authController.setContext(context);

  extensionController.loadEvents(authController.getCurrentUser()?.id);

  const openCommand = vscode.commands.registerCommand("laeyrd.open", () => {
    const detectPanelClosingState = async (value: boolean) =>
      await extensionController.detectPanelClosingState(value);
    detectPanelClosingState(true);
    panelManager = new PanelManager(context, detectPanelClosingState);
    if (!panelManager) throw new Error("failed to initialize panel");
    panelManager.open();
    context.subscriptions.push(panelManager);
  });

  context.subscriptions.push(openCommand, authController, extensionController);
}

export async function deactivate() {
  panelManager?.dispose();
  authController?.dispose();
}
