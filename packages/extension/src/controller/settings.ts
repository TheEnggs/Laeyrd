import * as vscode from "vscode";
import { parse } from "jsonc-parser";
import { detectFork, getSettingsPath } from "@extension/utils/getSettings";
import { log } from "@shared/utils/debug-logs";
import { fontsLayoutUI } from "@shared/data/fonts-layout";
import { getLayoutSettings } from "@extension/utils/settings";

export interface UserSettings {
  fontLayoutSettings: Record<string, string | number | boolean>;
  mergedSettings: Record<keyof typeof fontsLayoutUI, number | boolean | string>;
  raw?: Record<string, unknown>;
}

export class SettingsController {
  private currentSettings: UserSettings | undefined;
  private currentSettingsPath: vscode.Uri | undefined;
  private listeners: Array<(settings: UserSettings) => void> = [];
  private watcher: vscode.FileSystemWatcher | undefined;

  private constructor(private context: vscode.ExtensionContext) {}

  /**
   * Factory method - async initialization
   */
  public static async init(
    context: vscode.ExtensionContext
  ): Promise<SettingsController> {
    const controller = new SettingsController(context);
    await controller.loadCurrentSettings();
    return controller;
  }

  // ========== Helper Functions ==========

  private async readFileUtf8(uri: vscode.Uri): Promise<string> {
    const raw = await vscode.workspace.fs.readFile(uri);
    return new TextDecoder("utf8").decode(raw);
  }

  // ========== Observers ==========

  public onSettingsChanged(listener: (settings: UserSettings) => void) {
    this.listeners.push(listener);
  }

  private notifySettingsChanged() {
    this.listeners.forEach((cb) =>
      cb(
        this.currentSettings || {
          mergedSettings: {},
          fontLayoutSettings: {},
          raw: {},
        }
      )
    );
  }

  // ========== Core Logic ==========

  private mergeSettingsWithDefaults(
    parsedSettings: Record<string, string | number | boolean>,
    config: vscode.WorkspaceConfiguration
  ): Record<keyof typeof fontsLayoutUI, number | boolean | string> {
    const merged: Record<string, string | number | boolean> = {};
    const fontAndLayoutKeys = Object.keys(fontsLayoutUI);

    fontAndLayoutKeys.forEach((key) => {
      let value = fontsLayoutUI[key as keyof typeof fontsLayoutUI].defaultValue;

      const configValue = config.get(key);
      if (configValue !== undefined)
        value = configValue as string | number | boolean;

      if (parsedSettings[key] !== undefined) value = parsedSettings[key];
      merged[key] = value;
    });

    return merged as Record<
      keyof typeof fontsLayoutUI,
      number | boolean | string
    >;
  }

  private async loadCurrentSettings(): Promise<void> {
    try {
      const fork = detectFork();
      const settingsPath = getSettingsPath(fork);
      const uri = vscode.Uri.file(settingsPath);
      this.currentSettingsPath = uri;

      log("settingsPath", settingsPath);
      log("fork", fork);

      try {
        await vscode.workspace.fs.stat(uri);
      } catch {
        log(`[SettingsController] Settings file not found: ${settingsPath}`);
        this.currentSettings = undefined;
        return;
      }

      const fileContent = await this.readFileUtf8(uri);
      const parsed = parse(fileContent) as Record<string, unknown>;

      const fontsLayoutSettings: Record<string, string | number | boolean> = {};
      const fontAndLayoutKeys = Object.keys(fontsLayoutUI);
      fontAndLayoutKeys.forEach((key) => {
        if (parsed[key] !== undefined)
          fontsLayoutSettings[key] = parsed[key] as string | number | boolean;
      });

      const config = vscode.workspace.getConfiguration();
      const mergedSettings = this.mergeSettingsWithDefaults(
        fontsLayoutSettings,
        config
      );

      this.currentSettings = {
        fontLayoutSettings: fontsLayoutSettings,
        mergedSettings,
        raw: parsed,
      };

      log(`[SettingsController] Settings loaded for fork: ${fork}`);
      log(
        `[SettingsController] Merged ${Object.keys(mergedSettings).length} settings`
      );
    } catch (error) {
      console.error("Error loading settings:", error);
      this.currentSettings = undefined;
    }
  }

  // ========== Watching ==========

  private startWatching(): void {
    if (!this.currentSettingsPath) return;

    const watcher = vscode.workspace.createFileSystemWatcher(
      this.currentSettingsPath.fsPath
    );

    watcher.onDidChange(async () => {
      log("Detected change in settings.json");
      await this.refreshSettings();
    });

    watcher.onDidCreate(async () => {
      log("settings.json created");
      await this.refreshSettings();
    });

    watcher.onDidDelete(() => {
      log("settings.json deleted");
      this.currentSettings = undefined;
    });

    this.watcher = watcher;
  }

  // ========== Public APIs ==========

  public async refreshSettings(): Promise<void> {
    log("Refreshing user settings...");
    await this.loadCurrentSettings();
    this.notifySettingsChanged();
  }

  public getMergedSettings() {
    return getLayoutSettings(this.currentSettings?.mergedSettings || {});
  }

  public getCurrentSettings(): UserSettings | undefined {
    return this.currentSettings;
  }

  public async handleConfigurationChange(): Promise<void> {
    log(
      "[SettingsController] Configuration change detected, reloading settings..."
    );
    await this.loadCurrentSettings();
    this.notifySettingsChanged();
  }

  public testSettingsChange(): void {
    log("[SettingsController] Testing settings change notification...");
    this.notifySettingsChanged();
  }

  public async overwriteSettingsJson(
    settings: Record<string, string | number | boolean | undefined>
  ) {
    try {
      if (!this.currentSettings) {
        throw new Error("No settings loaded to overwrite");
      }

      log("settings", settings);
      for (const [key, value] of Object.entries(settings)) {
        await vscode.workspace
          .getConfiguration()
          .update(key, value, vscode.ConfigurationTarget.Global);
      }

      await this.refreshSettings();
      log(`[SettingsController] Settings updated via VS Code API`);
      return { success: true };
    } catch (e) {
      throw e;
    }
  }

  public async updateSetting(
    key: string,
    value: string | number | boolean
  ): Promise<void> {
    if (!this.currentSettings) return;

    await vscode.workspace
      .getConfiguration()
      .update(key, value, vscode.ConfigurationTarget.Global);
    await this.refreshSettings();
  }

  public dispose(): void {
    this.watcher?.dispose();
  }
}
