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
exports.groupTokenColors = groupTokenColors;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const debug_logs_1 = require("../utils/debug-logs");
const color_category_map_1 = require("../utils/color-category-map");
function groupColors(colors) {
    return Object.entries(colors).reduce((acc, [key, value]) => {
        const [category, subKey] = key.split(".");
        if (!acc[category])
            acc[category] = {};
        acc[category][subKey] = value;
        return acc;
    }, {});
}
function groupTokenColors(tokenColors) {
    const grouped = {};
    for (const token of tokenColors) {
        const scopes = Array.isArray(token.scope) ? token.scope : [token.scope];
        for (const scope of scopes) {
            grouped[scope] = {
                foreground: token.settings.foreground || "",
                fontStyle: token.settings.fontStyle || "",
            };
        }
    }
    return grouped;
}
function flattenTokenColors(groupedTokenColors) {
    const tokenColors = [];
    for (const [scope, settings] of Object.entries(groupedTokenColors)) {
        tokenColors.push({
            scope,
            settings: {
                ...(settings.foreground ? { foreground: settings.foreground } : {}),
                ...(settings.fontStyle ? { fontStyle: settings.fontStyle } : {}),
            },
        });
    }
    return tokenColors;
}
class ThemeController {
    constructor() {
        this.loadCurrentTheme();
    }
    static getInstance() {
        if (!ThemeController.instance) {
            ThemeController.instance = new ThemeController();
        }
        return ThemeController.instance;
    }
    /**
     * Load the currently active theme JSON into memory.
     */
    loadCurrentTheme() {
        try {
            const activeThemeName = vscode.workspace
                .getConfiguration("workbench")
                .get("colorTheme");
            if (!activeThemeName) {
                console.warn("No active theme detected");
                return;
            }
            (0, debug_logs_1.log)("activeThemeName", activeThemeName);
            const themeExt = vscode.extensions.all.find((ext) => {
                const themes = ext.packageJSON?.contributes?.themes || [];
                return themes.some((t) => t.label === activeThemeName || t.id === activeThemeName);
            });
            (0, debug_logs_1.log)("themeExt", themeExt);
            if (!themeExt) {
                console.warn("Theme extension not found for:", activeThemeName);
                return;
            }
            const themeInfo = themeExt.packageJSON.contributes.themes.find((t) => t.label === activeThemeName || t.id === activeThemeName);
            if (!themeInfo) {
                console.warn("Theme info not found inside extension:", themeExt.id);
                return;
            }
            console.log("themeInfo", themeInfo);
            const themeJsonPath = path.join(themeExt.extensionPath, themeInfo.path);
            if (!fs.existsSync(themeJsonPath)) {
                console.error("Theme JSON file not found:", themeJsonPath);
                return;
            }
            this.currentThemePath = themeJsonPath;
            const parsedTheme = JSON.parse(fs.readFileSync(themeJsonPath, "utf8"));
            this.currentTheme = parsedTheme;
            (0, debug_logs_1.log)("parsedTheme", parsedTheme);
        }
        catch (error) {
            console.error("Error loading current theme", error);
        }
    }
    /**
     * Force reload theme from disk
     */
    refreshTheme() {
        (0, debug_logs_1.log)("refreshing theme");
        this.loadCurrentTheme();
    }
    getColors() {
        const colors = this.currentTheme?.colors;
        return colors ? (0, color_category_map_1.transformColorsToColorTabs)(groupColors(colors)) : undefined;
    }
    getTokenColors() {
        const tokenColors = this.currentTheme?.tokenColors;
        return tokenColors ? groupTokenColors(tokenColors) : undefined;
    }
    getName() {
        return this.currentTheme?.name;
    }
    getType() {
        return this.currentTheme?.type;
    }
    isOurTheme() {
        return !!this.currentTheme?.name?.includes("Theme Your Code");
    }
    getThemePath() {
        return this.currentThemePath;
    }
    /**
     * Return themes contributed by this extension (from package.json)
     */
    listOwnThemes(context) {
        try {
            const packageJsonPath = path.join(context.extensionPath, "package.json");
            const pkg = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
            const themes = pkg?.contributes?.themes?.map((t) => ({
                label: t.label,
                path: t.path,
                uiTheme: t.uiTheme,
            })) || [];
            return themes;
        }
        catch (error) {
            console.error("Failed to read extension themes from package.json", error);
            return [];
        }
    }
    /**
     * Return currently active theme label as configured in VS Code
     */
    getActiveThemeLabel() {
        return vscode.workspace
            .getConfiguration("workbench")
            .get("colorTheme");
    }
    /**
     * Overwrite a theme JSON by its label from our extension package.json
     */
    overwriteThemeByLabel(context, themeLabel, colors, tokenColors) {
        try {
            const themes = this.listOwnThemes(context);
            const target = themes.find((t) => t.label === themeLabel);
            if (!target) {
                vscode.window.showErrorMessage(`Theme "${themeLabel}" not found in this extension.`);
                return;
            }
            const absoluteThemePath = path.join(context.extensionPath, target.path);
            if (!fs.existsSync(absoluteThemePath)) {
                vscode.window.showErrorMessage(`Theme file not found at ${absoluteThemePath}`);
                return;
            }
            const themeJson = JSON.parse(fs.readFileSync(absoluteThemePath, "utf8"));
            const tokensArray = Array.isArray(tokenColors)
                ? tokenColors
                : flattenTokenColors(tokenColors);
            const updatedTheme = {
                ...themeJson,
                colors: {
                    ...(themeJson.colors || {}),
                    ...colors,
                },
                tokenColors: tokensArray,
            };
            fs.writeFileSync(absoluteThemePath, JSON.stringify(updatedTheme, null, 2), "utf8");
            // If we just overwrote the active theme, refresh in-memory cache
            const activeLabel = this.getActiveThemeLabel();
            if (activeLabel && activeLabel === themeLabel) {
                this.currentThemePath = absoluteThemePath;
                this.currentTheme = updatedTheme;
                this.refreshTheme();
            }
        }
        catch (error) {
            console.error("Failed to overwrite theme by label", error);
        }
    }
    /**
     * Overwrite the current theme JSON
     */
    overwriteTheme(colors, tokenColors) {
        if (!this.currentThemePath || !this.currentTheme) {
            console.error("No theme loaded to overwrite");
            return;
        }
        const tokensArray = Array.isArray(tokenColors)
            ? tokenColors
            : flattenTokenColors(tokenColors);
        const updatedTheme = {
            ...this.currentTheme,
            colors: {
                ...this.currentTheme.colors,
                ...colors,
            },
            tokenColors: {
                ...this.currentTheme.tokenColors,
                ...tokensArray,
            },
        };
        fs.writeFileSync(this.currentThemePath, JSON.stringify(updatedTheme, null, 2), "utf8");
        this.refreshTheme();
    }
    /**
     * Create a new theme file inside our extension folder
     */
    createTheme(context, themeName, colors, tokenColors, type = "dark") {
        try {
            console.log("creating theme", themeName);
            const themesDir = path.join(context.extensionPath, "/src/themes");
            console.log("themesDir", themesDir);
            if (!fs.existsSync(themesDir))
                fs.mkdirSync(themesDir);
            console.log("themesDir exists", fs.existsSync(themesDir));
            const themePath = path.join(themesDir, `${themeName}.json`);
            console.log("themePath", themePath);
            const tokensArray = Array.isArray(tokenColors)
                ? tokenColors
                : flattenTokenColors(tokenColors);
            console.log("tokensArray", tokensArray);
            const themeJson = {
                name: themeName,
                type,
                colors,
                tokenColors: tokensArray,
            };
            console.log("themeJson", themeJson);
            fs.writeFileSync(themePath, JSON.stringify(themeJson, null, 2), "utf8");
            return themePath;
        }
        catch (error) {
            console.error("Error creating theme", error);
            return "";
        }
    }
    addThemeToPackageJson(context, themeName, themeFile, type = "dark") {
        const packageJsonPath = path.join(context.extensionPath, "package.json");
        const pkg = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
        // Ensure "contributes" & "themes" exist
        if (!pkg.contributes)
            pkg.contributes = {};
        if (!pkg.contributes.themes)
            pkg.contributes.themes = [];
        // Avoid duplicates
        const alreadyExists = pkg.contributes.themes.some((t) => t.label === themeName);
        if (alreadyExists) {
            vscode.window.showWarningMessage(`Theme "${themeName}" already exists in package.json.`);
            return;
        }
        // Add new theme entry
        pkg.contributes.themes.push({
            label: themeName,
            uiTheme: type === "dark" ? "vs-dark" : "vs",
            path: `./src/themes/${themeFile}`,
        });
        fs.writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2), "utf8");
        vscode.window
            .showInformationMessage(`Theme "${themeName}" added! Reload to activate.`, "Reload Now")
            .then((selection) => {
            if (selection === "Reload Now") {
                vscode.commands.executeCommand("workbench.action.reloadWindow");
            }
        });
    }
}
exports.ThemeController = ThemeController;
