import * as vscode from "vscode";
import * as fs from "fs";
import { parse } from "jsonc-parser";
import { detectFork, getSettingsPath } from "../utils/getSettings";
import { log } from "../../lib/debug-logs";
import { fontListMap } from "../../lib/fontsList";
import { uiLayoutCategoryMap } from "../../lib/layoutList";
import { getLayoutSettings } from "../utils/settings";
import { FontMetaGrouped } from "../../types/font";
import { UiLayoutMetaGrouped } from "../../types/layout";
import { fontsLayoutUI } from "../../lib/fonts-layout";

export interface UserSettings {
  fontLayoutSettings: Record<string, string | number | boolean>;
  mergedSettings: Record<keyof typeof fontsLayoutUI, number | boolean | string>;
  raw?: Record<string, unknown>;
}

export class SettingsController {
  private static instance: SettingsController;
  private context: vscode.ExtensionContext;

  private currentSettings: UserSettings | undefined;
  private currentSettingsPath: string | undefined;
  private listeners: Array<(settings: UserSettings) => void> = [];
  private watcher: vscode.FileSystemWatcher | undefined;

  private constructor(context: vscode.ExtensionContext) {
    this.context = context;
    this.loadCurrentSettings();
    this.startWatching();
  }

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

  public static getInstance(
    context: vscode.ExtensionContext
  ): SettingsController {
    if (!SettingsController.instance) {
      SettingsController.instance = new SettingsController(context);
    }
    return SettingsController.instance;
  }

  /**
   * Merge settings with proper priority order:
   * 1. Default values from fontsLayoutUI
   * 2. VS Code configuration values
   * 3. Parsed settings from JSON file (highest priority)
   */
  private mergeSettingsWithDefaults(
    parsedSettings: Record<string, string | number | boolean>,
    config: vscode.WorkspaceConfiguration
  ): Record<keyof typeof fontsLayoutUI, number | boolean | string> {
    const merged: Record<string, string | number | boolean> = {};

    // Get all keys from fontsLayoutUI
    const fontAndLayoutKeys = Object.keys(fontsLayoutUI);

    fontAndLayoutKeys.forEach((key) => {
      // Start with default value from fontsLayoutUI
      let value: string | number | boolean =
        fontsLayoutUI[key as keyof typeof fontsLayoutUI].defaultValue;

      // Override with VS Code configuration value if available
      const configValue = config.get(key);
      if (configValue !== undefined) {
        value = configValue as string | number | boolean;
      }

      // Override with parsed settings value if available (highest priority)
      if (parsedSettings[key] !== undefined) {
        value = parsedSettings[key];
      }

      merged[key] = value;
    });

    return merged as Record<
      keyof typeof fontsLayoutUI,
      number | boolean | string
    >;
  }

  /**
   * Load the currently active settings file for the detected fork
   */
  private loadCurrentSettings(): void {
    try {
      const fork = detectFork();
      const settingsPath = getSettingsPath(fork);
      this.currentSettingsPath = settingsPath;
      log("settingsPath", settingsPath);
      log("fork", fork);
      if (!fs.existsSync(settingsPath)) {
        log(`[SettingsController] Settings file not found: ${settingsPath}`);
        this.currentSettings = undefined;
        return;
      }

      const fileContent = fs.readFileSync(settingsPath, "utf8");
      const parsed = parse(fileContent); // supports comments

      // Separate font and layout settings for easy access
      const fontsLayoutSettings: Record<string, string | number | boolean> = {};

      // You can add all your font/layout keys from fontListMap & uiLayoutCategoryMap
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
        `[SettingsController] Merged ${
          Object.keys(mergedSettings).length
        } settings from defaults, config, and parsed settings`
      );
    } catch (error) {
      console.error("Error loading settings:", error);
      this.currentSettings = undefined;
    }
  }

  /**
   * Force reload settings from disk
   */
  public refreshSettings(): void {
    log("Refreshing user settings...");
    this.loadCurrentSettings();
    this.notifySettingsChanged();
  }

  /**
   * Start watching for external changes to the settings.json
   */
  private startWatching(): void {
    if (!this.currentSettingsPath) return;

    const watcher = vscode.workspace.createFileSystemWatcher(
      this.currentSettingsPath
    );

    watcher.onDidChange(() => {
      log("Detected change in settings.json");
      this.refreshSettings();
    });

    watcher.onDidCreate(() => {
      log("settings.json created");
      this.refreshSettings();
    });

    watcher.onDidDelete(() => {
      log("settings.json deleted");
      this.currentSettings = undefined;
    });

    this.watcher = watcher;
  }

  /**
   * Get merged settings (defaults + config + parsed settings)
   */
  public getMergedSettings() {
    return getLayoutSettings(this.currentSettings?.mergedSettings || {});
  }

  /**
   * Get current settings object
   */
  public getCurrentSettings(): UserSettings | undefined {
    return this.currentSettings;
  }

  /**
   * Force reload settings and notify listeners
   * This is called when VS Code configuration changes
   */
  public handleConfigurationChange(): void {
    log(
      "[SettingsController] Configuration change detected, reloading settings..."
    );
    this.loadCurrentSettings();
    this.notifySettingsChanged();
  }

  /**
   * Test method to simulate settings changes
   * This is useful for debugging and testing the settings change flow
   */
  public testSettingsChange(): void {
    log("[SettingsController] Testing settings change notification...");
    this.notifySettingsChanged();
  }

  /**
   * Overwrite the current settings JSON with updated font & layout values
   */
  public overwriteSettingsJson(
    settings: Record<string, string | number | boolean | undefined>
  ): void {
    if (!this.currentSettingsPath || !this.currentSettings) {
      console.error("No settings loaded to overwrite");
      return;
    }
    log("settings", settings);
    for (const [key, value] of Object.entries(settings)) {
      vscode.workspace
        .getConfiguration()
        .update(key, value, vscode.ConfigurationTarget.Global);
    }
    this.refreshSettings();
    log(
      `[SettingsController] Settings overwritten at: ${this.currentSettingsPath}`
    );
  }

  /**
   * Optional: update a single key
   */
  public updateSetting(key: string, value: string | number | boolean): void {
    if (!this.currentSettingsPath || !this.currentSettings) return;
    const updated = { ...this.currentSettings.raw, [key]: value };
    fs.writeFileSync(
      this.currentSettingsPath,
      JSON.stringify(updated, null, 2),
      "utf8"
    );
    this.refreshSettings();
  }

  public dispose(): void {
    this.watcher?.dispose();
  }
}
