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
const toast_1 = require("./toast");
const history_1 = require("./history");
const debug_logs_1 = require("../../lib/debug-logs");
class MessageHandler {
    constructor(context, panel) {
        this.context = context;
        this.panel = panel;
        this.toastController = toast_1.ToastController.getInstance(this.context);
    }
    async handle(command, message) {
        // Validate message structure
        if (!message || typeof message !== "object") {
            console.error("Invalid message received:", message);
            this.toastController.showToast({
                message: "Invalid message received",
                type: "error",
            });
            return;
        }
        (0, debug_logs_1.log)("incoming command", command, message);
        switch (command) {
            case "SHOW_TOAST":
                this.toastController.showToast({
                    message: message.payload.message,
                    type: message.payload.type,
                });
                break;
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
            case "GET_THEME_LIST": {
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
                this.responseHandler({
                    command,
                    requestId: message.requestId,
                    executor: () => this.handleSaveTheme(message.payload),
                });
                break;
            case "SAVE_SETTINGS":
                await this.responseHandler({
                    command,
                    requestId: message.requestId,
                    executor: () => this.handleOverwriteSettings(message.payload),
                });
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
            case "WEBAPP_SIGN_IN":
                this.responseHandler({
                    command,
                    requestId: message.requestId,
                    executor: () => auth_1.AuthController.getInstance(this.context).signIn(message.payload?.returnUrl),
                });
                break;
            case "SIGN_OUT":
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
            case "GET_FONT_AND_LAYOUT_SETTINGS": {
                const settings = settings_1.SettingsController.getInstance(this.context);
                this.responseHandler({
                    command,
                    requestId: message.requestId,
                    executor: () => settings.getMergedSettings(),
                });
                break;
            }
            case "TEST_SETTINGS_CHANGE": {
                const settings = settings_1.SettingsController.getInstance(this.context);
                settings.testSettingsChange();
                this.settingsChanged();
                break;
            }
            // History handlers
            case "GET_HISTORY": {
                const historyController = history_1.HistoryController.getInstance(this.context);
                this.responseHandler({
                    command,
                    requestId: message.requestId,
                    executor: () => historyController.getHistory(),
                });
                break;
            }
            case "ADD_HISTORY_ENTRY": {
                const historyController = history_1.HistoryController.getInstance(this.context);
                historyController.addEntry(message.payload);
                break;
            }
            case "CLEAR_HISTORY": {
                const historyController = history_1.HistoryController.getInstance(this.context);
                historyController.clearHistory();
                break;
            }
            case "RESET_TO_HISTORY_ENTRY": {
                this.responseHandler({
                    command,
                    requestId: message.requestId,
                    executor: () => this.handleResetToHistoryEntry(message.payload.entryId),
                });
                break;
            }
            default:
                console.warn("Unknown message:", message);
        }
    }
    async handleSaveTheme(payload) {
        const themeController = theme_1.ThemeController.getInstance(this.context);
        (0, debug_logs_1.log)("SAVE_THEME", payload);
        if (!payload.themeName) {
            this.handle("SHOW_TOAST", {
                command: "SHOW_TOAST",
                requestId: "",
                payload: {
                    message: "Please enter a theme name",
                    type: "error",
                },
            });
            return;
        }
        if (payload.mode === "overwrite") {
            themeController.overwriteThemeByLabel(this.context, payload.themeName, payload.colors, payload.tokens);
        }
        else {
            const themeName = payload.themeName || "Untitled Theme";
            themeController.createTheme(this.context, themeName, payload.colors, payload.tokens);
            themeController.addThemeToPackageJson(this.context, themeName, themeName + ".json", "dark");
        }
        // Apply VS Code settings (fonts/layout) if provided
        // if (payload.vscodeSettings) {
        //   const settings = new UserSettingsController(this.context);
        //   settings.ensureOriginalBackup();
        //   settings.applySettings(payload.payload.vscodeSettings);
        // }
        return null;
    }
    async handleOverwriteSettings(payload) {
        const settingsController = settings_1.SettingsController.getInstance(this.context);
        settingsController.overwriteSettingsJson(payload.settings);
        return null;
    }
    async handleResetToHistoryEntry(entryId) {
        const historyController = history_1.HistoryController.getInstance(this.context);
        const entry = historyController.getEntryById(entryId);
        if (!entry) {
            throw new Error("History entry not found");
        }
        const themeController = theme_1.ThemeController.getInstance(this.context);
        const settingsController = settings_1.SettingsController.getInstance(this.context);
        try {
            // Reset colors if they exist in the entry
            if (entry.originalValues.colors) {
                // Apply the original colors from before this change
                const resetColors = entry.originalValues.colors;
                // Find active theme to apply reset to
                const activeTheme = themeController.getActiveThemeLabel();
                if (activeTheme) {
                    themeController.overwriteThemeByLabel(this.context, activeTheme, resetColors, { tokenColors: {}, semanticTokenColors: {} } // We'll handle tokens separately
                    );
                }
            }
            // Reset token colors if they exist
            if (entry.originalValues.tokenColors ||
                entry.originalValues.semanticTokenColors) {
                const tokenColors = entry.originalValues.tokenColors || {};
                const semanticTokenColors = entry.originalValues.semanticTokenColors || {};
                const activeTheme = themeController.getActiveThemeLabel();
                if (activeTheme) {
                    themeController.overwriteThemeByLabel(this.context, activeTheme, {}, { tokenColors, semanticTokenColors });
                }
            }
            // Reset font and layout settings if they exist
            if (entry.originalValues.fontLayoutSettings) {
                const fontLayoutSettings = entry.originalValues.fontLayoutSettings || {};
                this.handleOverwriteSettings({
                    settings: {
                        ...fontLayoutSettings,
                    },
                });
            }
            (0, debug_logs_1.log)(`[MessageHandler] Successfully reset to history entry: ${entry.description}`);
            return { success: true };
        }
        catch (error) {
            (0, debug_logs_1.log)(`[MessageHandler] Error resetting to history entry: ${error}`);
            throw error;
        }
    }
    async responseHandler({ command, mode = "response", requestId, executor, }) {
        (0, debug_logs_1.log)("outgoing response", command, requestId);
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
            (0, debug_logs_1.log)("error occured in response handler", err);
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
    /**
     * Handle font and layout settings changes and notify the frontend
     */
    settingsChanged() {
        const settingsController = settings_1.SettingsController.getInstance(this.context);
        // Handle configuration change and reload settings
        settingsController.handleConfigurationChange();
        // Get the updated merged settings
        const mergedSettings = settingsController.getMergedSettings();
        if (mergedSettings) {
            (0, debug_logs_1.log)("[MessageHandler] Notifying frontend of settings changes");
            this.responseHandler({
                command: "UPDATE_FONT_AND_LAYOUT_SETTINGS",
                requestId: "",
                mode: "payload",
                executor: () => mergedSettings,
            });
        }
    }
}
exports.MessageHandler = MessageHandler;
