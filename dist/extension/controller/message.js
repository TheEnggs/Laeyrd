"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageHandler = void 0;
const theme_1 = require("./theme");
const userSettings_1 = require("./userSettings");
class MessageHandler {
    constructor(context, panel) {
        this.context = context;
        this.panel = panel;
    }
    async handle(message) {
        switch (message.command) {
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
                this.handleSaveTheme(message.payload);
                break;
            default:
                console.warn("Unknown message:", message);
        }
    }
    handleSaveTheme(payload) {
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
    }
    postMessage(message, payload) {
        this.panel.webview.postMessage({ command: message, payload });
    }
}
exports.MessageHandler = MessageHandler;
