import * as vscode from "vscode";
import * as fs from "fs";
import { parse } from "jsonc-parser";
import { detectFork, getSettingsPath } from "../utils/getSettings";
import { log } from "../utils/debug-logs";
import { fontListMap } from "../../lib/fontsList";
import { uiLayoutCategoryMap } from "../../lib/layoutList";
import { getFontSettings } from "../utils/settings";
import { FontMetaGrouped } from "../../types/font";
import { getLayoutSettings } from "../utils/settings";
import { UiLayoutMetaGrouped } from "../../types/layout";

export interface UserSettings {
  fontSettings: Record<string, string>;
  layoutSettings: Record<string, string | number | boolean>;
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
          fontSettings: {},
          layoutSettings: {},
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
   * Load the currently active settings file for the detected fork
   */
  private loadCurrentSettings(): void {
    try {
      const fork = detectFork();
      const settingsPath = getSettingsPath(fork);
      this.currentSettingsPath = settingsPath;
      console.log("settingsPath", settingsPath);
      console.log("fork", fork);
      if (!fs.existsSync(settingsPath)) {
        log(`[SettingsController] Settings file not found: ${settingsPath}`);
        this.currentSettings = undefined;
        return;
      }

      const fileContent = fs.readFileSync(settingsPath, "utf8");
      const parsed = parse(fileContent); // supports comments

      // Separate font and layout settings for easy access
      const fontSettings: Record<string, string> = {};
      const layoutSettings: Record<string, string | number | boolean> = {};

      // You can add all your font/layout keys from fontListMap & uiLayoutCategoryMap
      const fontKeys = Object.keys(fontListMap);
      const layoutKeys = Object.keys(uiLayoutCategoryMap);

      fontKeys.forEach((key) => {
        if (parsed[key] !== undefined)
          fontSettings[key] = parsed[key] as string;
      });

      layoutKeys.forEach((key) => {
        if (parsed[key] !== undefined)
          layoutSettings[key] = parsed[key] as string | number | boolean;
      });

      const config = vscode.workspace.getConfiguration();
      console.log("config", config.editor);
      this.currentSettings = { fontSettings, layoutSettings, raw: parsed };
      log(`[SettingsController] Settings loaded for fork: ${fork}`);
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
    // this.loadCurrentSettings();
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
   * Get current font settings
   */
  public getFontSettings(): FontMetaGrouped | undefined {
    return getFontSettings(this.currentSettings?.fontSettings || {});
  }

  /**
   * Get current layout settings
   */
  public getLayoutSettings(): UiLayoutMetaGrouped | undefined {
    return getLayoutSettings(this.currentSettings?.layoutSettings || {});
  }

  /**
   * Overwrite the current settings JSON with updated font & layout values
   */
  public overwriteSettingsJson(
    fontSettings: Record<string, string>,
    layoutSettings: Record<string, string | number | boolean>
  ): void {
    if (!this.currentSettingsPath || !this.currentSettings) {
      console.error("No settings loaded to overwrite");
      return;
    }

    const updatedSettings = {
      ...this.currentSettings.raw, // preserve all other keys
      ...fontSettings,
      ...layoutSettings,
    };

    fs.writeFileSync(
      this.currentSettingsPath,
      JSON.stringify(updatedSettings, null, 2),
      "utf8"
    );
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
