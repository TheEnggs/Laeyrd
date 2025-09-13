"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsController = void 0;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const jsonc_parser_1 = require("jsonc-parser");
const getSettings_1 = require("../utils/getSettings");
const debug_logs_1 = require("../../lib/debug-logs");
const settings_1 = require("../utils/settings");
const fonts_layout_1 = require("../../lib/fonts-layout");
class SettingsController {
    constructor(context) {
        this.listeners = [];
        this.context = context;
        this.loadCurrentSettings();
        this.startWatching();
    }
    onSettingsChanged(listener) {
        this.listeners.push(listener);
    }
    notifySettingsChanged() {
        this.listeners.forEach((cb) => cb(this.currentSettings || {
            mergedSettings: {},
            fontLayoutSettings: {},
            raw: {},
        }));
    }
    static getInstance(context) {
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
    mergeSettingsWithDefaults(parsedSettings, config) {
        const merged = {};
        // Get all keys from fontsLayoutUI
        const fontAndLayoutKeys = Object.keys(fonts_layout_1.fontsLayoutUI);
        fontAndLayoutKeys.forEach((key) => {
            // Start with default value from fontsLayoutUI
            let value = fonts_layout_1.fontsLayoutUI[key].defaultValue;
            // Override with VS Code configuration value if available
            const configValue = config.get(key);
            if (configValue !== undefined) {
                value = configValue;
            }
            // Override with parsed settings value if available (highest priority)
            if (parsedSettings[key] !== undefined) {
                value = parsedSettings[key];
            }
            merged[key] = value;
        });
        return merged;
    }
    /**
     * Load the currently active settings file for the detected fork
     */
    loadCurrentSettings() {
        try {
            const fork = (0, getSettings_1.detectFork)();
            const settingsPath = (0, getSettings_1.getSettingsPath)(fork);
            this.currentSettingsPath = settingsPath;
            (0, debug_logs_1.log)("settingsPath", settingsPath);
            (0, debug_logs_1.log)("fork", fork);
            if (!fs.existsSync(settingsPath)) {
                (0, debug_logs_1.log)(`[SettingsController] Settings file not found: ${settingsPath}`);
                this.currentSettings = undefined;
                return;
            }
            const fileContent = fs.readFileSync(settingsPath, "utf8");
            const parsed = (0, jsonc_parser_1.parse)(fileContent); // supports comments
            // Separate font and layout settings for easy access
            const fontsLayoutSettings = {};
            // You can add all your font/layout keys from fontListMap & uiLayoutCategoryMap
            const fontAndLayoutKeys = Object.keys(fonts_layout_1.fontsLayoutUI);
            fontAndLayoutKeys.forEach((key) => {
                if (parsed[key] !== undefined)
                    fontsLayoutSettings[key] = parsed[key];
            });
            const config = vscode.workspace.getConfiguration();
            const mergedSettings = this.mergeSettingsWithDefaults(fontsLayoutSettings, config);
            this.currentSettings = {
                fontLayoutSettings: fontsLayoutSettings,
                mergedSettings,
                raw: parsed,
            };
            (0, debug_logs_1.log)(`[SettingsController] Settings loaded for fork: ${fork}`);
            (0, debug_logs_1.log)(`[SettingsController] Merged ${Object.keys(mergedSettings).length} settings from defaults, config, and parsed settings`);
        }
        catch (error) {
            console.error("Error loading settings:", error);
            this.currentSettings = undefined;
        }
    }
    /**
     * Force reload settings from disk
     */
    refreshSettings() {
        (0, debug_logs_1.log)("Refreshing user settings...");
        this.loadCurrentSettings();
        this.notifySettingsChanged();
    }
    /**
     * Start watching for external changes to the settings.json
     */
    startWatching() {
        if (!this.currentSettingsPath)
            return;
        const watcher = vscode.workspace.createFileSystemWatcher(this.currentSettingsPath);
        watcher.onDidChange(() => {
            (0, debug_logs_1.log)("Detected change in settings.json");
            this.refreshSettings();
        });
        watcher.onDidCreate(() => {
            (0, debug_logs_1.log)("settings.json created");
            this.refreshSettings();
        });
        watcher.onDidDelete(() => {
            (0, debug_logs_1.log)("settings.json deleted");
            this.currentSettings = undefined;
        });
        this.watcher = watcher;
    }
    /**
     * Get merged settings (defaults + config + parsed settings)
     */
    getMergedSettings() {
        return (0, settings_1.getLayoutSettings)(this.currentSettings?.mergedSettings || {});
    }
    /**
     * Get current settings object
     */
    getCurrentSettings() {
        return this.currentSettings;
    }
    /**
     * Force reload settings and notify listeners
     * This is called when VS Code configuration changes
     */
    handleConfigurationChange() {
        (0, debug_logs_1.log)("[SettingsController] Configuration change detected, reloading settings...");
        this.loadCurrentSettings();
        this.notifySettingsChanged();
    }
    /**
     * Test method to simulate settings changes
     * This is useful for debugging and testing the settings change flow
     */
    testSettingsChange() {
        (0, debug_logs_1.log)("[SettingsController] Testing settings change notification...");
        this.notifySettingsChanged();
    }
    /**
     * Overwrite the current settings JSON with updated font & layout values
     */
    overwriteSettingsJson(settings) {
        if (!this.currentSettingsPath || !this.currentSettings) {
            console.error("No settings loaded to overwrite");
            return;
        }
        (0, debug_logs_1.log)("settings", settings);
        for (const [key, value] of Object.entries(settings)) {
            vscode.workspace
                .getConfiguration()
                .update(key, value, vscode.ConfigurationTarget.Global);
        }
        this.refreshSettings();
        (0, debug_logs_1.log)(`[SettingsController] Settings overwritten at: ${this.currentSettingsPath}`);
    }
    /**
     * Optional: update a single key
     */
    updateSetting(key, value) {
        if (!this.currentSettingsPath || !this.currentSettings)
            return;
        const updated = { ...this.currentSettings.raw, [key]: value };
        fs.writeFileSync(this.currentSettingsPath, JSON.stringify(updated, null, 2), "utf8");
        this.refreshSettings();
    }
    dispose() {
        this.watcher?.dispose();
    }
}
exports.SettingsController = SettingsController;
