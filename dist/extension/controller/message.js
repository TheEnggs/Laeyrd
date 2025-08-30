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
const settings_1 = require("./settings");
const userPreferences_1 = require("./userPreferences");
const auth_1 = require("./auth");
class MessageHandler {
    constructor(context, panel) {
        this.context = context;
        this.panel = panel;
    }
    async handle(command, message) {
        // Validate message structure
        if (!message || typeof message !== "object") {
            console.error("Invalid message received:", message);
            return;
        }
        switch (command) {
            case "GET_THEME_COLORS":
                this.responseHandler({
                    command,
                    requestId: message.requestId,
                    executor: () => theme_1.ThemeController.getInstance(this.context).getColors(),
                });
                break;
            case "GET_THEME_TOKEN_COLORS":
                this.responseHandler({
                    command,
                    requestId: message.requestId,
                    executor: () => theme_1.ThemeController.getInstance(this.context).getTokenColors(),
                });
                break;
            case "GET_SEMANTIC_TOKEN_COLORS":
                this.responseHandler({
                    command,
                    requestId: message.requestId,
                    executor: () => theme_1.ThemeController.getInstance(this.context).getSemanticTokenColors(),
                });
                break;
            case "GET_THEMES_LIST": {
                const tc = theme_1.ThemeController.getInstance(this.context);
                const list = tc.listOwnThemes(this.context);
                const active = tc.getActiveThemeLabel();
                this.responseHandler({
                    command,
                    requestId: message.requestId,
                    executor: () => ({
                        themes: list,
                        active,
                    }),
                });
                break;
            }
            case "SAVE_THEME":
                await this.handleSaveTheme(message.payload);
                break;
            case "SAVE_SETTINGS":
                await this.handleSaveTheme(message.payload);
                break;
            case "RESTORE_ORIGINAL_SETTINGS":
                const settings = new userSettings_1.UserSettingsController(this.context);
                settings.rollbackToOriginal();
                break;
            case "GET_USER_PREFERENCES":
                this.responseHandler({
                    command,
                    requestId: message.requestId,
                    executor: () => userPreferences_1.UserPreferencesController.getInstance(this.context).getUserPreferences(),
                });
                break;
            case "UPDATE_USER_PREFERENCES":
                this.responseHandler({
                    command,
                    requestId: message.requestId,
                    executor: () => userPreferences_1.UserPreferencesController.getInstance(this.context).updateUserPreferences(message.payload),
                });
                break;
            case "SYNC_USER_PREFERENCES":
                this.responseHandler({
                    command,
                    requestId: message.requestId,
                    executor: async () => {
                        const controller = userPreferences_1.UserPreferencesController.getInstance(this.context);
                        // First update preferences, then sync
                        await controller.updateUserPreferences(message.payload);
                        // Return sync result (placeholder for now)
                        return {
                            success: true,
                            message: "Preferences synced successfully",
                        };
                    },
                });
                break;
            case "GET_SERVER_CONFIG":
                this.responseHandler({
                    command,
                    requestId: message.requestId,
                    executor: () => auth_1.AuthController.getInstance(this.context).getServerConfig(),
                });
                break;
            case "CLERK_SIGN_IN":
                this.responseHandler({
                    command,
                    requestId: message.requestId,
                    executor: () => auth_1.AuthController.getInstance(this.context).signIn(message.payload?.returnUrl),
                });
                break;
            case "CLERK_SIGN_OUT":
                this.responseHandler({
                    command,
                    requestId: message.requestId,
                    executor: () => auth_1.AuthController.getInstance(this.context).signOut(),
                });
                break;
            case "GET_AUTH_USER":
                this.responseHandler({
                    command,
                    requestId: message.requestId,
                    executor: () => auth_1.AuthController.getInstance(this.context).getCurrentUser(),
                });
                break;
            case "UPDATE_AUTH_USER":
                this.responseHandler({
                    command,
                    requestId: message.requestId,
                    executor: () => auth_1.AuthController.getInstance(this.context).updateUser(message.payload),
                });
                break;
            case "GET_AUTH_SESSION":
                this.responseHandler({
                    command,
                    requestId: message.requestId,
                    executor: () => auth_1.AuthController.getInstance(this.context).getCurrentSession(),
                });
                break;
            case "OPEN_EXTERNAL_URL":
                this.responseHandler({
                    command,
                    requestId: message.requestId,
                    executor: () => auth_1.AuthController.getInstance(this.context).openExternalUrl(message.payload.url),
                });
                break;
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
                const tc = theme_1.ThemeController.getInstance(this.context);
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
            case "GET_FONT_SETTINGS": {
                const settings = settings_1.SettingsController.getInstance(this.context);
                console.log("GET_FONT_SETTINGS", settings.getFontSettings());
                this.responseHandler({
                    command,
                    requestId: message.requestId,
                    executor: () => settings.getFontSettings(),
                });
                break;
            }
            case "GET_LAYOUT_SETTINGS": {
                const settings = settings_1.SettingsController.getInstance(this.context);
                this.responseHandler({
                    command,
                    requestId: message.requestId,
                    executor: () => settings.getLayoutSettings(),
                });
                break;
            }
            default:
                console.warn("Unknown message:", message);
        }
    }
    async handleSaveTheme(payload) {
        const themeController = theme_1.ThemeController.getInstance(this.context);
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
        const saveResponseData = { command: "SAVE_SUCCESS" };
        try {
            JSON.stringify(saveResponseData);
            this.panel.webview.postMessage(saveResponseData);
        }
        catch (error) {
            console.error("Invalid save response data:", error);
            console.error("Save response data:", saveResponseData);
        }
        // If live preview is on, turn it off after save completes
        const lp = livePreview_1.LivePreviewController.getInstance(this.context);
        await lp.handleSaveComplete();
    }
    async responseHandler({ command, mode = "response", requestId, executor, }) {
        try {
            const response = await executor();
            this.POST_MESSAGE({
                command,
                requestId,
                status: "success",
                payload: response,
            });
        }
        catch (err) {
            this.POST_MESSAGE({
                command,
                requestId,
                status: "error",
                error: err.message ?? String(err),
            });
        }
    }
    POST_MESSAGE({ command, payload, requestId, status }) {
        const messageData = { command, payload, requestId, status };
        try {
            this.panel.webview.postMessage(messageData);
        }
        catch (error) {
            console.error("Invalid message data:", error);
            console.error("Message data:", messageData);
            return;
        }
    }
    configurationChanged({ updateThemeColor, updateThemeList, }) {
        const themeController = theme_1.ThemeController.getInstance(this.context);
        themeController.refreshTheme();
        if (updateThemeColor) {
            this.responseHandler({
                command: "UPDATE_THEME_COLORS",
                requestId: "",
                mode: "payload",
                executor: async () => themeController.getColors(),
            });
        }
        if (updateThemeList) {
            this.responseHandler({
                command: "UPDATE_THEME_LIST",
                requestId: "",
                mode: "payload",
                executor: () => {
                    const list = themeController.listOwnThemes(this.context);
                    const active = themeController.getActiveThemeLabel() || "";
                    return {
                        themes: list,
                        active,
                    };
                },
            });
        }
    }
}
exports.MessageHandler = MessageHandler;
