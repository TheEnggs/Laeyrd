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
const jsonc_parser_1 = require("jsonc-parser");
const getSettings_1 = require("../utils/getSettings");
const debug_logs_1 = require("../../lib/debug-logs");
const settings_1 = require("../utils/settings");
const fonts_layout_1 = require("../../lib/data/fonts-layout");
class SettingsController {
    constructor(context) {
        this.listeners = [];
        this.context = context;
    }
    /**
     * Factory method - async initialization
     */
    static async getInstance(context) {
        if (SettingsController.instance)
            return SettingsController.instance;
        const controller = new SettingsController(context);
        await controller.loadCurrentSettings();
        controller.startWatching();
        SettingsController.instance = controller;
        return controller;
    }
    // ========== Helper Functions ==========
    async readFileUtf8(uri) {
        const raw = await vscode.workspace.fs.readFile(uri);
        return new TextDecoder("utf8").decode(raw);
    }
    // ========== Observers ==========
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
    // ========== Core Logic ==========
    mergeSettingsWithDefaults(parsedSettings, config) {
        const merged = {};
        const fontAndLayoutKeys = Object.keys(fonts_layout_1.fontsLayoutUI);
        fontAndLayoutKeys.forEach((key) => {
            let value = fonts_layout_1.fontsLayoutUI[key].defaultValue;
            const configValue = config.get(key);
            if (configValue !== undefined)
                value = configValue;
            if (parsedSettings[key] !== undefined)
                value = parsedSettings[key];
            merged[key] = value;
        });
        return merged;
    }
    async loadCurrentSettings() {
        try {
            const fork = (0, getSettings_1.detectFork)();
            const settingsPath = (0, getSettings_1.getSettingsPath)(fork);
            const uri = vscode.Uri.file(settingsPath);
            this.currentSettingsPath = uri;
            (0, debug_logs_1.log)("settingsPath", settingsPath);
            (0, debug_logs_1.log)("fork", fork);
            try {
                await vscode.workspace.fs.stat(uri);
            }
            catch {
                (0, debug_logs_1.log)(`[SettingsController] Settings file not found: ${settingsPath}`);
                this.currentSettings = undefined;
                return;
            }
            const fileContent = await this.readFileUtf8(uri);
            const parsed = (0, jsonc_parser_1.parse)(fileContent);
            const fontsLayoutSettings = {};
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
            (0, debug_logs_1.log)(`[SettingsController] Merged ${Object.keys(mergedSettings).length} settings`);
        }
        catch (error) {
            console.error("Error loading settings:", error);
            this.currentSettings = undefined;
        }
    }
    // ========== Watching ==========
    startWatching() {
        if (!this.currentSettingsPath)
            return;
        const watcher = vscode.workspace.createFileSystemWatcher(this.currentSettingsPath.fsPath);
        watcher.onDidChange(async () => {
            (0, debug_logs_1.log)("Detected change in settings.json");
            await this.refreshSettings();
        });
        watcher.onDidCreate(async () => {
            (0, debug_logs_1.log)("settings.json created");
            await this.refreshSettings();
        });
        watcher.onDidDelete(() => {
            (0, debug_logs_1.log)("settings.json deleted");
            this.currentSettings = undefined;
        });
        this.watcher = watcher;
    }
    // ========== Public APIs ==========
    async refreshSettings() {
        (0, debug_logs_1.log)("Refreshing user settings...");
        await this.loadCurrentSettings();
        this.notifySettingsChanged();
    }
    getMergedSettings() {
        return (0, settings_1.getLayoutSettings)(this.currentSettings?.mergedSettings || {});
    }
    getCurrentSettings() {
        return this.currentSettings;
    }
    async handleConfigurationChange() {
        (0, debug_logs_1.log)("[SettingsController] Configuration change detected, reloading settings...");
        await this.loadCurrentSettings();
        this.notifySettingsChanged();
    }
    testSettingsChange() {
        (0, debug_logs_1.log)("[SettingsController] Testing settings change notification...");
        this.notifySettingsChanged();
    }
    async overwriteSettingsJson(settings) {
        if (!this.currentSettings) {
            console.error("No settings loaded to overwrite");
            return;
        }
        (0, debug_logs_1.log)("settings", settings);
        for (const [key, value] of Object.entries(settings)) {
            await vscode.workspace
                .getConfiguration()
                .update(key, value, vscode.ConfigurationTarget.Global);
        }
        await this.refreshSettings();
        (0, debug_logs_1.log)(`[SettingsController] Settings updated via VS Code API`);
    }
    async updateSetting(key, value) {
        if (!this.currentSettings)
            return;
        await vscode.workspace
            .getConfiguration()
            .update(key, value, vscode.ConfigurationTarget.Global);
        await this.refreshSettings();
    }
    dispose() {
        this.watcher?.dispose();
    }
}
exports.SettingsController = SettingsController;
SettingsController.instance = null;
