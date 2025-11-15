import * as vscode from "vscode";
import SyncController from "./sync";
import { log } from "@shared/utils/debug-logs";

type ExtensionConfiguration = {
  relaunchRequired: boolean;
  reloadedByExtension: boolean;
  autoSync: boolean;
};

export default class ExtensionController {
  private extensionConfiguration: ExtensionConfiguration;
  private readonly fileName = "laeyrd-configuration.json";
  public panelClosedAt?: number;
  private constructor(
    private context: vscode.ExtensionContext,
    config: ExtensionConfiguration
  ) {
    this.extensionConfiguration = config;
  }

  /** Static async initializer */
  static async create(context: vscode.ExtensionContext) {
    const controller = new ExtensionController(context, {
      relaunchRequired: true,
      reloadedByExtension: false,
      autoSync: false,
    });

    await controller.loadFromFile();
    await controller.setValue("relaunchRequired", true);
    return controller;
  }

  private async loadFromFile() {
    try {
      const filePath = vscode.Uri.joinPath(
        this.context.globalStorageUri,
        this.fileName
      );
      const bytes = await vscode.workspace.fs.readFile(filePath);
      const text = new TextDecoder("utf8").decode(bytes);
      const parsed = JSON.parse(text);
      this.extensionConfiguration = {
        ...this.extensionConfiguration,
        ...parsed,
      };
    } catch (err) {
      // If file doesn't exist, create it with defaults
      await this.writeFile();
    }
  }

  private async writeFile() {
    const filePath = vscode.Uri.joinPath(
      this.context.globalStorageUri,
      this.fileName
    );
    const data = new TextEncoder().encode(
      JSON.stringify(this.extensionConfiguration, null, 2)
    );
    await vscode.workspace.fs.writeFile(filePath, data);
  }

  async setValue<T extends keyof ExtensionConfiguration>(
    key: T,
    value: ExtensionConfiguration[T]
  ) {
    this.extensionConfiguration[key] = value;
    await this.writeFile();
  }

  getValue<T extends keyof ExtensionConfiguration>(key: T) {
    return this.extensionConfiguration[key];
  }

  async autoSync(userId: string | null) {
    if (!userId) return;
    const syncController = new SyncController(this.context, userId);
    await syncController.syncAll();
  }

  async relaunch() {
    await vscode.commands.executeCommand("laeyrd.open");
  }
  async loadEvents(userId?: string) {
    // if (this.extensionConfiguration.relaunchRequired) {
    //   this.relaunch()
    // }
    if (this.extensionConfiguration.autoSync && userId) {
      this.autoSync(userId);
    }
    return;
  }
  async detectPanelClosingState(relaunchRequired: boolean) {
    log(relaunchRequired, "here to set the relaunch required to false");
    await this.setValue("relaunchRequired", relaunchRequired);
    return;
  }
  dispose() {}
}
