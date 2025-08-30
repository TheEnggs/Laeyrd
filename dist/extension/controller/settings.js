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
const debug_logs_1 = require("../utils/debug-logs");
const fontsList_1 = require("../../lib/fontsList");
const layoutList_1 = require("../../lib/layoutList");
const settings_1 = require("../utils/settings");
const settings_2 = require("../utils/settings");
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
            fontSettings: {},
            layoutSettings: {},
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
     * Load the currently active settings file for the detected fork
     */
    loadCurrentSettings() {
        try {
            const fork = (0, getSettings_1.detectFork)();
            const settingsPath = (0, getSettings_1.getSettingsPath)(fork);
            this.currentSettingsPath = settingsPath;
            console.log("settingsPath", settingsPath);
            console.log("fork", fork);
            if (!fs.existsSync(settingsPath)) {
                (0, debug_logs_1.log)(`[SettingsController] Settings file not found: ${settingsPath}`);
                this.currentSettings = undefined;
                return;
            }
            const fileContent = fs.readFileSync(settingsPath, "utf8");
            const parsed = (0, jsonc_parser_1.parse)(fileContent); // supports comments
            // Separate font and layout settings for easy access
            const fontSettings = {};
            const layoutSettings = {};
            // You can add all your font/layout keys from fontListMap & uiLayoutCategoryMap
            const fontKeys = Object.keys(fontsList_1.fontListMap);
            const layoutKeys = Object.keys(layoutList_1.uiLayoutCategoryMap);
            fontKeys.forEach((key) => {
                if (parsed[key] !== undefined)
                    fontSettings[key] = parsed[key];
            });
            layoutKeys.forEach((key) => {
                if (parsed[key] !== undefined)
                    layoutSettings[key] = parsed[key];
            });
            const config = vscode.workspace.getConfiguration();
            console.log("config", config.editor);
            this.currentSettings = { fontSettings, layoutSettings, raw: parsed };
            (0, debug_logs_1.log)(`[SettingsController] Settings loaded for fork: ${fork}`);
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
        // this.loadCurrentSettings();
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
     * Get current font settings
     */
    getFontSettings() {
        return (0, settings_1.getFontSettings)(this.currentSettings?.fontSettings || {});
    }
    /**
     * Get current layout settings
     */
    getLayoutSettings() {
        return (0, settings_2.getLayoutSettings)(this.currentSettings?.layoutSettings || {});
    }
    /**
     * Overwrite the current settings JSON with updated font & layout values
     */
    overwriteSettingsJson(fontSettings, layoutSettings) {
        if (!this.currentSettingsPath || !this.currentSettings) {
            console.error("No settings loaded to overwrite");
            return;
        }
        const updatedSettings = {
            ...this.currentSettings.raw, // preserve all other keys
            ...fontSettings,
            ...layoutSettings,
        };
        fs.writeFileSync(this.currentSettingsPath, JSON.stringify(updatedSettings, null, 2), "utf8");
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
