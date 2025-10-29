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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageController = void 0;
const vscode = __importStar(require("vscode"));
const theme_1 = require("./theme");
const userSettings_1 = require("./userSettings");
const settings_1 = require("./settings");
const userPreferences_1 = require("./userPreferences");
const auth_1 = require("./auth");
const toast_1 = require("./toast");
const debug_logs_1 = require("../../lib/debug-logs");
const sync_1 = __importDefault(require("./sync"));
class MessageController {
    constructor(context, themeController) {
        this.context = context;
        this._themeController = themeController;
    }
    async themeController() {
        if (!this._themeController) {
            this._themeController = await theme_1.ThemeController.create();
        }
        return this._themeController;
    }
    get showToast() {
        return toast_1.ToastController.showToast;
    }
    get authController() {
        if (!this._authController)
            this._authController = auth_1.AuthController.getInstance();
        return this._authController;
    }
    get userPreferencesController() {
        if (!this._userPreferenceController)
            this._userPreferenceController = new userPreferences_1.UserPreferencesController(this.context);
        return this._userPreferenceController;
    }
    setPanel(panel) {
        this.panel = panel;
    }
    async handle(command, message) {
        // Validate message structure
        if (!message || typeof message !== "object") {
            console.error("Invalid message received:", message);
            this.showToast({
                message: "Invalid message received",
                type: "error",
            });
            return;
        }
        (0, debug_logs_1.log)("incoming command", command, message);
        switch (command) {
            case "SHOW_TOAST":
                this.showToast({
                    message: message.payload.message,
                    type: message.payload.type,
                });
                break;
            case "GET_THEME_COLORS":
                this.responseHandler({
                    command,
                    requestId: message.requestId,
                    executor: async () => {
                        const tc = await this.themeController();
                        return tc.getColors();
                    },
                });
                break;
            case "GET_THEME_TOKEN_COLORS":
                this.responseHandler({
                    command,
                    requestId: message.requestId,
                    executor: async () => {
                        const tc = await this.themeController();
                        return tc.getTokenColors();
                    },
                });
                break;
            case "GET_SEMANTIC_TOKEN_COLORS":
                this.responseHandler({
                    command,
                    requestId: message.requestId,
                    executor: async () => {
                        const tc = await this.themeController();
                        tc.getSemanticTokenColors();
                    },
                });
                break;
            case "GET_THEME_LIST": {
                const tc = await this.themeController();
                const list = await tc.listOwnThemes(this.context);
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
                    executor: () => this.userPreferencesController.getUserPreferences(),
                });
                break;
            case "UPDATE_USER_PREFERENCES":
                this.responseHandler({
                    command,
                    requestId: message.requestId,
                    executor: () => this.userPreferencesController.updateUserPreferences(message.payload),
                });
                break;
            case "SYNC_USER_PREFERENCES":
                this.responseHandler({
                    command,
                    requestId: message.requestId,
                    executor: async () => {
                        // First update preferences, then sync
                        await this.userPreferencesController.updateUserPreferences(message.payload);
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
                    executor: () => this.authController.getServerConfig(),
                });
                break;
            case "WEBAPP_SIGN_IN":
                this.responseHandler({
                    command,
                    requestId: message.requestId,
                    executor: async () => {
                        const res = await this.authController.startDeviceFlow();
                        (0, debug_logs_1.log)("WEBAPP_SIGN_IN response", res);
                        return {
                            user_code: res.user_code,
                            verificationUri: res.verification_uri,
                            expiresIn: res.expires_in,
                        };
                    },
                });
                break;
            case "SIGN_OUT":
                this.responseHandler({
                    command,
                    requestId: message.requestId,
                    executor: () => this.authController.signOut(),
                });
                break;
            case "GET_AUTH_USER":
                this.responseHandler({
                    command,
                    requestId: message.requestId,
                    executor: () => this.authController.getCurrentUser(),
                });
                break;
            case "UPDATE_AUTH_USER":
                this.responseHandler({
                    command,
                    requestId: message.requestId,
                    executor: () => this.authController.updateUser(message.payload),
                });
                break;
            case "GET_AUTH_SESSION":
                this.responseHandler({
                    command,
                    requestId: message.requestId,
                    executor: () => this.authController.getCurrentSession(),
                });
                break;
            case "OPEN_EXTERNAL_URL":
                this.responseHandler({
                    command,
                    requestId: message.requestId,
                    executor: () => this.authController.openExternalUrl(message.payload.url),
                });
                break;
            case "OPEN_DONATION": {
                const url = vscode.Uri.parse("https://buymeacoffee.com/laeyrd");
                vscode.env.openExternal(url);
                break;
            }
            case "GET_FONT_AND_LAYOUT_SETTINGS": {
                const settings = await settings_1.SettingsController.getInstance(this.context);
                this.responseHandler({
                    command,
                    requestId: message.requestId,
                    executor: () => settings.getMergedSettings(),
                });
                break;
            }
            case "TEST_SETTINGS_CHANGE": {
                const settings = await settings_1.SettingsController.getInstance(this.context);
                settings.testSettingsChange();
                this.settingsChanged();
                break;
            }
            case "SYNC": {
                const userId = this._authController?.getCurrentUser()?.id;
                if (!userId)
                    throw new Error("User id is missing");
                const syncController = new sync_1.default(this.context, this.POST_MESSAGE, userId);
                syncController.loadOrCreateLocalVersions();
                this.responseHandler({
                    command,
                    requestId: message.requestId,
                    executor: async () => await syncController.syncAll(),
                });
                break;
            }
            default:
                console.warn("Unknown message:", message);
        }
    }
    async handleSaveTheme(payload) {
        (0, debug_logs_1.log)("SAVE_THEME", payload);
        if (!payload.themeName)
            throw new Error("Invalid theme name");
        const tc = await this.themeController();
        return tc.handleSaveTheme(payload, this.context);
    }
    async handleOverwriteSettings(payload) {
        const settingsController = await settings_1.SettingsController.getInstance(this.context);
        settingsController.overwriteSettingsJson(payload.settings);
        return null;
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
            (0, debug_logs_1.log)("error occurred in response handler", err);
            this.POST_MESSAGE({
                command,
                requestId,
                status: "error",
                error: err.message ?? String(err),
            });
        }
    }
    POST_MESSAGE({ command, payload, requestId, status, error }) {
        const messageData = { command, payload, requestId, status, error };
        try {
            if (!this.panel) {
                (0, debug_logs_1.log)("Panel not found");
                return;
            }
            this.panel.webview.postMessage(messageData);
        }
        catch (error) {
            console.error("Invalid message data:", error);
            console.error("Message data:", messageData);
            return;
        }
    }
    async configurationChanged({ updateThemeColor, updateThemeList, }) {
        const tc = await this.themeController();
        await tc.refreshTheme();
        if (updateThemeColor) {
            this.responseHandler({
                command: "UPDATE_THEME_COLORS",
                requestId: "",
                mode: "payload",
                executor: async () => {
                    const tc = await this.themeController();
                    return tc.getColors();
                },
            });
        }
        if (updateThemeList) {
            this.responseHandler({
                command: "UPDATE_THEME_LIST",
                requestId: "",
                mode: "payload",
                executor: async () => {
                    const tc = await this.themeController();
                    const list = await tc.listOwnThemes(this.context);
                    const active = tc.getActiveThemeLabel() || "";
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
    async settingsChanged() {
        const settingsController = await settings_1.SettingsController.getInstance(this.context);
        // Handle configuration change and reload settings
        await settingsController.handleConfigurationChange();
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
exports.MessageController = MessageController;
