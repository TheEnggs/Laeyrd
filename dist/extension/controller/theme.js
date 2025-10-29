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
exports.ThemeController = void 0;
exports.groupColors = groupColors;
const vscode = __importStar(require("vscode"));
const debug_logs_1 = require("../../lib/debug-logs");
const colors_1 = require("../utils/colors");
const event_1 = require("../../types/event");
const jsonc_parser_1 = require("jsonc-parser");
const toast_1 = require("./toast");
function groupColors(colors) {
    return Object.entries(colors).reduce((acc, [key, value]) => {
        const [category, subKey] = key.split(".");
        if (!acc[category])
            acc[category] = {};
        acc[category][subKey] = value;
        return acc;
    }, {});
}
class ThemeController {
    constructor() { }
    static async create() {
        const controller = new ThemeController();
        await controller.loadCurrentTheme();
        return controller;
    }
    /** Load the currently active theme JSON into memory */
    async loadCurrentTheme() {
        try {
            const activeThemeName = vscode.workspace
                .getConfiguration("workbench")
                .get("colorTheme");
            if (!activeThemeName) {
                console.warn("No active theme detected");
                return;
            }
            const themeExt = vscode.extensions.all.find((ext) => {
                const themes = ext.packageJSON?.contributes?.themes || [];
                return themes.some((t) => t.label === activeThemeName || t.id === activeThemeName);
            });
            if (!themeExt) {
                console.warn("Theme extension not found for:", activeThemeName);
                return;
            }
            const themeInfo = themeExt.packageJSON.contributes.themes.find((t) => t.label === activeThemeName || t.id === activeThemeName);
            if (!themeInfo) {
                console.warn("Theme info not found inside extension:", themeExt.id);
                return;
            }
            const themeUri = vscode.Uri.joinPath(themeExt.extensionUri, themeInfo.path);
            this.currentThemeUri = themeUri;
            const themeContent = await vscode.workspace.fs.readFile(themeUri);
            this.currentTheme = (0, jsonc_parser_1.parse)(Buffer.from(themeContent).toString("utf8"));
        }
        catch (error) {
            console.error("Error loading current theme", error);
        }
    }
    /** Force reload theme from disk */
    async refreshTheme() {
        (0, debug_logs_1.log)("refreshing theme");
        await this.loadCurrentTheme();
    }
    getColors() {
        console.log("current theme", this.currentTheme);
        const colors = this.currentTheme?.colors;
        return colors ? (0, colors_1.generateColors)(colors) : undefined;
    }
    getTokenColors() {
        return this.currentTheme?.tokenColors
            ? (0, colors_1.convertTokenColors)(this.currentTheme.tokenColors)
            : undefined;
    }
    getSemanticTokenColors() {
        return this.currentTheme?.semanticTokenColors;
    }
    getName() {
        return this.currentTheme?.name;
    }
    getType() {
        return this.currentTheme?.type;
    }
    isOurTheme() {
        return !!this.currentTheme?.name?.includes("Laeyrd");
    }
    /** List themes contributed by this extension (from package.json) */
    async listOwnThemes(context) {
        const packageUri = vscode.Uri.joinPath(context.extensionUri, "package.json");
        const content = await vscode.workspace.fs.readFile(packageUri);
        const pkg = JSON.parse(Buffer.from(content).toString("utf8"));
        const themes = pkg?.contributes?.themes?.map((t) => ({
            label: t.label,
            path: t.path,
            uiTheme: t.uiTheme,
        })) || [];
        return themes;
    }
    getActiveThemeLabel() {
        return vscode.workspace
            .getConfiguration("workbench")
            .get("colorTheme");
    }
    async setActiveThemeByLabel(themeName) {
        await vscode.workspace
            .getConfiguration("workbench")
            .update("colorTheme", themeName, vscode.ConfigurationTarget.Global);
        toast_1.ToastController.showToast;
    }
    /** Handles live theme mode */
    async handleLiveMode(context, themeName, colors, tokenColors, type = "dark") {
        const themes = await this.listOwnThemes(context);
        const target = themes.find((t) => t.label === themeName);
        const activeThemeName = this.getActiveThemeLabel();
        const currTheme = this.currentTheme;
        const finalColors = { ...currTheme?.colors, ...colors };
        const finalTokenColors = { ...currTheme?.tokenColors, ...tokenColors };
        if (target) {
            await this.overwriteThemeByLabel(context, themeName, finalColors, finalTokenColors);
        }
        else {
            await this.createTheme(context, themeName, finalColors, finalTokenColors, type);
            await this.addThemeToPackageJson(context, themeName, `${themeName}.json`, type);
        }
        if (activeThemeName !== themeName)
            await this.setActiveThemeByLabel(themeName);
    }
    async handleSaveTheme(payload, context) {
        try {
            if (payload.mode === event_1.SaveThemeModes.OVERWRITE) {
                await this.overwriteThemeByLabel(context, payload.themeName, payload.colors, payload.tokens);
            }
            else if (payload.mode === event_1.SaveThemeModes.LIVE) {
                await this.handleLiveMode(context, "Live Preview - Laeyrd", payload.colors, payload.tokens, payload.type);
            }
            else {
                const themeName = payload.themeName || "Untitled Theme";
                const res = await this.createTheme(context, themeName, payload.colors, payload.tokens, payload.type);
                if (!res.success)
                    throw new Error("Failed to create theme");
                await this.addThemeToPackageJson(context, themeName, `${themeName}.json`, payload.type);
            }
            return { success: true };
        }
        catch (e) {
            throw e;
        }
    }
    /** Overwrite a theme JSON by its label from our extension package.json */
    async overwriteThemeByLabel(context, themeLabel, colors, tokenColors) {
        const themes = await this.listOwnThemes(context);
        const target = themes.find((t) => t.label === themeLabel);
        if (!target) {
            vscode.window.showErrorMessage(`Theme "${themeLabel}" not found in this extension.`);
            return;
        }
        const themeUri = vscode.Uri.joinPath(context.extensionUri, target.path);
        const themeContent = await vscode.workspace.fs.readFile(themeUri);
        const themeJson = JSON.parse(Buffer.from(themeContent).toString("utf8"));
        const tokensArray = (0, colors_1.convertTokenColorsBackToTheme)(tokenColors);
        const updatedTheme = {
            ...themeJson,
            colors: { ...(this.currentTheme?.colors ?? {}), ...colors },
            semanticTokenColors: {
                ...(this.currentTheme?.semanticTokenColors ?? {}),
                ...tokensArray.semanticTokenColors,
            },
            tokenColors: [
                ...(this.currentTheme?.tokenColors ?? []),
                ...tokensArray.tokenColors,
            ],
        };
        await vscode.workspace.fs.writeFile(themeUri, new TextEncoder().encode(JSON.stringify(updatedTheme, null, 2)));
        // Refresh if this was active theme
        if (this.getActiveThemeLabel() === themeLabel) {
            this.currentThemeUri = themeUri;
            this.currentTheme = updatedTheme;
            await this.refreshTheme();
        }
    }
    overwriteThemeContent(themeId, content, context) {
        if (!themeId || !content)
            throw new Error("Theme name or content not present");
    }
    /** Ensure themes folder exists */
    async ensureThemesFolder(context) {
        if (!this.themesDirUri) {
            this.themesDirUri = vscode.Uri.joinPath(context.globalStorageUri, "themes");
            await vscode.workspace.fs.createDirectory(this.themesDirUri);
        }
        return this.themesDirUri;
    }
    async getThemePath(themeName, context) {
        const dir = await this.ensureThemesFolder(context);
        return vscode.Uri.joinPath(dir, `${themeName}.json`);
    }
    async writeToThemeFile(context, themeName, themeJson) {
        try {
            const fileUri = await this.getThemePath(themeName, context);
            await vscode.workspace.fs.writeFile(fileUri, new TextEncoder().encode(JSON.stringify(themeJson, null, 2)));
            vscode.window.showInformationMessage(`Theme "${themeName}" created successfully!`);
            return { success: true };
        }
        catch (err) {
            vscode.window.showErrorMessage(`Failed to create theme "${themeName}"`);
            return { success: false };
        }
    }
    async createTheme(context, themeName, colors, tokenColors, type = "dark") {
        if (!themeName || /[\\/:*?"<>|]/.test(themeName))
            throw new Error("Invalid theme name");
        const tokensArray = (0, colors_1.convertTokenColorsBackToTheme)(tokenColors);
        const themeJson = {
            name: themeName,
            type,
            publisher: "Laeyrd",
            colors: { ...(this.currentTheme?.colors ?? {}), ...colors },
            tokenColors: {
                ...(this.currentTheme?.tokenColors ?? {}),
                ...tokensArray.tokenColors,
            },
            semanticTokenColors: {
                ...(this.currentTheme?.semanticTokenColors ?? {}),
                ...tokensArray.semanticTokenColors,
            },
        };
        return this.writeToThemeFile(context, themeName, themeJson);
    }
    async addThemeToPackageJson(context, themeName, themeFile, type = "dark") {
        const packageUri = vscode.Uri.joinPath(context.extensionUri, "package.json");
        const content = await vscode.workspace.fs.readFile(packageUri);
        const pkg = JSON.parse(Buffer.from(content).toString("utf8"));
        if (!pkg.contributes)
            pkg.contributes = {};
        if (!pkg.contributes.themes)
            pkg.contributes.themes = [];
        const alreadyExists = pkg.contributes.themes.some((t) => t.label === themeName);
        if (alreadyExists)
            throw new Error(`Theme "${themeName}" already exists in package.json.`);
        pkg.contributes.themes.push({
            label: themeName,
            uiTheme: type === "dark" ? "vs-dark" : "vs",
            path: `themes/${themeFile}`, // relative path inside extension
        });
        await vscode.workspace.fs.writeFile(packageUri, new TextEncoder().encode(JSON.stringify(pkg, null, 2)));
        vscode.window
            .showInformationMessage(`Theme "${themeName}" added! Reload to activate.`, "Reload Now")
            .then((selection) => {
            if (selection === "Reload Now")
                vscode.commands.executeCommand("workbench.action.reloadWindow");
        });
    }
}
exports.ThemeController = ThemeController;
