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
exports.LivePreviewController = void 0;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const theme_1 = require("./theme");
class LivePreviewController {
    static getInstance(context) {
        if (!LivePreviewController.instance) {
            LivePreviewController.instance = new LivePreviewController(context);
        }
        return LivePreviewController.instance;
    }
    constructor(context) {
        this.context = context;
    }
    get storageDir() {
        return path.join(this.context.globalStorageUri.fsPath, "live-preview");
    }
    get beforeSettingsPath() {
        return path.join(this.storageDir, "settings.before.json");
    }
    get previewSettingsPath() {
        return path.join(this.storageDir, "settings.preview.json");
    }
    get livePreviewThemePath() {
        return path.join(this.context.extensionPath, "src/themes/live-preview.json");
    }
    get snippetsDir() {
        // Snippets are shipped as static files under dist/extension/snippets
        return path.join(this.context.extensionPath, "dist", "extension", "snippets");
    }
    async enable() {
        fs.mkdirSync(this.storageDir, { recursive: true });
        const prevTheme = theme_1.ThemeController.getInstance().getActiveThemeLabel();
        await this.setGlobalState("livePreview.prevTheme", prevTheme);
        await this.setGlobalState("livePreview.enabled", true);
        // Snapshot current user settings to restore if needed
        const currentSettings = this.readUserSettingsFromDisk();
        this.writeJson(this.beforeSettingsPath, currentSettings);
        // Create preview settings file from current settings, but ensure we do not include color customizations
        const previewSettings = { ...currentSettings };
        delete previewSettings["workbench.colorCustomizations"]; // keep colors in theme only
        this.writeJson(this.previewSettingsPath, previewSettings);
        // Copy current theme JSON to live-preview theme file (exact copy, only name changed)
        const tc = theme_1.ThemeController.getInstance();
        const currentThemePath = tc.getThemePath();
        if (currentThemePath && fs.existsSync(currentThemePath)) {
            try {
                const themeJson = JSON.parse(fs.readFileSync(currentThemePath, "utf8"));
                themeJson.name = "live-preview";
                this.writeJson(this.livePreviewThemePath, themeJson);
            }
            catch (err) {
                console.error("Failed to write live-preview theme", err);
            }
        }
        // Switch active theme to live-preview
        await vscode.workspace
            .getConfiguration("workbench")
            .update("colorTheme", "live-preview", vscode.ConfigurationTarget.Global);
        // If no folder is open, set up snippets as a temporary workspace and layout
        if (!vscode.workspace.workspaceFolders ||
            vscode.workspace.workspaceFolders.length === 0) {
            await this.setupSnippetsIfNoWorkspace();
        }
    }
    async disable(saveApplied) {
        const enabled = await this.getGlobalState("livePreview.enabled");
        if (!enabled)
            return;
        const prevTheme = (await this.getGlobalState("livePreview.prevTheme"));
        if (!saveApplied) {
            // Restore settings from before-preview snapshot
            const before = this.readJson(this.beforeSettingsPath);
            const current = this.readUserSettingsFromDisk();
            await this.applySettingsRestore(before, current);
        }
        // Restore previous theme if available
        if (prevTheme) {
            await vscode.workspace
                .getConfiguration("workbench")
                .update("colorTheme", prevTheme, vscode.ConfigurationTarget.Global);
        }
        await this.setGlobalState("livePreview.enabled", false);
        // If we added a temporary workspace folder for snippets, remove it
        const added = await this.getGlobalState("livePreview.addedWorkspace");
        if (added &&
            vscode.workspace.workspaceFolders &&
            vscode.workspace.workspaceFolders.length > 0) {
            const idx = vscode.workspace.workspaceFolders.findIndex((f) => f.uri.fsPath === this.snippetsDir);
            if (idx >= 0) {
                vscode.workspace.updateWorkspaceFolders(idx, 1);
            }
            await this.setGlobalState("livePreview.addedWorkspace", false);
        }
    }
    async handleDispose() {
        const enabled = await this.getGlobalState("livePreview.enabled");
        if (enabled) {
            await this.disable(false);
        }
    }
    async handleSaveComplete() {
        await this.disable(true);
    }
    // Utils
    async setGlobalState(key, value) {
        await this.context.globalState.update(key, value);
    }
    async getGlobalState(key) {
        return this.context.globalState.get(key);
    }
    writeJson(filePath, data) {
        fs.mkdirSync(path.dirname(filePath), { recursive: true });
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
    }
    readJson(filePath) {
        if (!fs.existsSync(filePath))
            return {};
        try {
            return JSON.parse(fs.readFileSync(filePath, "utf8"));
        }
        catch {
            return {};
        }
    }
    getUserSettingsPath() {
        return path.join(vscode.env.appSettingsHome?.fsPath ||
            path.join(process.env.HOME || process.env.USERPROFILE || "", ".config/Code/User"), "settings.json");
    }
    readUserSettingsFromDisk() {
        const filePath = this.getUserSettingsPath();
        if (!fs.existsSync(filePath))
            return {};
        try {
            const text = fs.readFileSync(filePath, "utf8");
            return text.trim() ? JSON.parse(text) : {};
        }
        catch {
            return {};
        }
    }
    async applySettingsRestore(before, current) {
        const config = vscode.workspace.getConfiguration();
        // restore keys present in before
        for (const [key, value] of Object.entries(before)) {
            await config.update(key, value, vscode.ConfigurationTarget.Global);
        }
        // remove keys that are not in before but exist in current
        for (const key of Object.keys(current)) {
            if (!(key in before)) {
                await config.update(key, undefined, vscode.ConfigurationTarget.Global);
            }
        }
    }
    async setupSnippetsIfNoWorkspace() {
        // Ensure directory exists (it should be copied during build)
        if (!fs.existsSync(this.snippetsDir)) {
            fs.mkdirSync(this.snippetsDir, { recursive: true });
        }
        // Add snippets as a workspace folder
        const added = vscode.workspace.updateWorkspaceFolders(0, 0, {
            uri: vscode.Uri.file(this.snippetsDir),
            name: "snippets",
        });
        if (added) {
            await this.setGlobalState("livePreview.addedWorkspace", true);
        }
        // Open side bar (Explorer)
        await vscode.commands.executeCommand("workbench.view.explorer");
        // Create and show terminal
        const terminal = vscode.window.createTerminal({ name: "Live Preview" });
        terminal.show();
        // Split editor and open a snippet beside the webview
        const indexUri = vscode.Uri.file(path.join(this.snippetsDir, "index.html"));
        const doc = await vscode.workspace.openTextDocument(indexUri);
        await vscode.window.showTextDocument(doc, vscode.ViewColumn.Beside);
    }
}
exports.LivePreviewController = LivePreviewController;
