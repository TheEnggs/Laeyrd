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
exports.MessageHandler = void 0;
const vscode = __importStar(require("vscode"));
const theme_1 = require("./theme");
const userSettings_1 = require("./userSettings");
const livePreview_1 = require("./livePreview");
class MessageHandler {
    constructor(context, panel) {
        this.context = context;
        this.panel = panel;
    }
    async handle(message) {
        switch (message.command) {
            case "ENABLE_LIVE_PREVIEW": {
                const lp = livePreview_1.LivePreviewController.getInstance(this.context);
                await lp.enable();
                break;
            }
            case "DISABLE_LIVE_PREVIEW": {
                const lp = livePreview_1.LivePreviewController.getInstance(this.context);
                await lp.disable(false);
                break;
            }
            case "LIVE_PREVIEW_APPLY": {
                const tc = theme_1.ThemeController.getInstance();
                // Apply to live-preview theme in place
                tc.overwriteThemeByLabel(this.context, "live-preview", message.payload.colors || {}, message.payload.tokenColors || []);
                // Apply settings live (fonts/layout); do not include color customizations here
                if (message.payload.vscodeSettings) {
                    const settings = new userSettings_1.UserSettingsController(this.context);
                    settings.applySettings(message.payload.vscodeSettings);
                }
                break;
            }
            case "OPEN_DONATION": {
                const url = vscode.Uri.parse("https://buymeacoffee.com/themeYourCode");
                vscode.env.openExternal(url);
                break;
            }
            case "GET_THEME_COLORS":
                const colors = theme_1.ThemeController.getInstance().getColors();
                this.panel.webview.postMessage({
                    command: "GET_THEME_COLORS",
                    payload: colors,
                });
                break;
            case "GET_THEME_TOKEN_COLORS":
                const tokenColors = theme_1.ThemeController.getInstance().getTokenColors();
                this.panel.webview.postMessage({
                    command: "GET_THEME_TOKEN_COLORS",
                    payload: tokenColors,
                });
                break;
            case "GET_THEMES_LIST": {
                const tc = theme_1.ThemeController.getInstance();
                const list = tc.listOwnThemes(this.context);
                const active = tc.getActiveThemeLabel();
                this.panel.webview.postMessage({
                    command: "GET_THEMES_LIST",
                    payload: { themes: list, active },
                });
                break;
            }
            case "SAVE_THEME":
                await this.handleSaveTheme(message.payload);
                break;
            case "RESTORE_ORIGINAL_SETTINGS":
                const settings = new userSettings_1.UserSettingsController(this.context);
                settings.rollbackToOriginal();
                break;
            default:
                console.warn("Unknown message:", message);
        }
    }
    async handleSaveTheme(payload) {
        const themeController = theme_1.ThemeController.getInstance();
        console.log("SAVE_THEME", payload);
        if (payload.mode === "overwrite") {
            if (payload.overwriteLabel) {
                themeController.overwriteThemeByLabel(this.context, payload.overwriteLabel, payload.colors, payload.tokenColors);
            }
            else {
                themeController.overwriteTheme(payload.colors, payload.tokenColors);
            }
        }
        else {
            const themeName = payload.themeName || "Untitled Theme";
            themeController.createTheme(this.context, themeName, payload.colors, payload.tokenColors);
            themeController.addThemeToPackageJson(this.context, themeName, themeName + ".json", "dark");
        }
        // Apply VS Code settings (fonts/layout) if provided
        if (payload.vscodeSettings) {
            const settings = new userSettings_1.UserSettingsController(this.context);
            settings.ensureOriginalBackup();
            settings.applySettings(payload.vscodeSettings);
        }
        this.panel.webview.postMessage({ command: "SAVE_SUCCESS" });
        // If live preview is on, turn it off after save completes
        const lp = livePreview_1.LivePreviewController.getInstance(this.context);
        await lp.handleSaveComplete();
    }
    postMessage(message, payload) {
        this.panel.webview.postMessage({ command: message, payload });
    }
}
exports.MessageHandler = MessageHandler;
