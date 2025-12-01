import * as vscode from "vscode";
import { PanelManager } from "./controller/panelManager";
import ExtensionController from "./controller/extensionController";
import { BackupManager } from "./controller/backup";
import { ThemeController } from "./controller/theme";
import { TelemetryService } from "./controller/telemetry";

let panelManager: PanelManager | null = null;
export async function activate(context: vscode.ExtensionContext) {
    const telemetry = TelemetryService.instance;
  telemetry.init(context);

  telemetry.sendEvent("extension_activated", {
    VscodeVersion: vscode.version,
    Platform: process.platform,
  });
  const extensionController = await ExtensionController.create(context),
    isVersionUpdated = await extensionController.checkForVersionUpdate(),
    backupManager = new BackupManager(context);
  await backupManager.init();
  // Make sure we capture the very first settings.json state
  await backupManager.ensureInitialSettingsBackup();

  if (isVersionUpdated) {
    await backupManager.pullBackups();
  }

  const openCommand = vscode.commands.registerCommand(
    "laeyrd.open",
    async () => {
      panelManager = PanelManager.getInstance(context);
      if (!panelManager) {
        throw new Error("failed to initialize panel");
      }
      panelManager.open();
      const themeController = await ThemeController.getInstance(context);
      context.subscriptions.push(panelManager, themeController);
    }
  );

  context.subscriptions.push(openCommand, extensionController);
}

export async function deactivate() {
  panelManager?.dispose();
}
