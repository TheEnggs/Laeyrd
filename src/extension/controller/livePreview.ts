// import * as vscode from "vscode";
// import * as fs from "fs";
// import * as path from "path";
// import { ThemeController } from "./theme";

// type JsonObject = Record<string, any>;

// export class LivePreviewController {
//   private static instance: LivePreviewController | undefined;

//   public static getInstance(
//     context: vscode.ExtensionContext
//   ): LivePreviewController {
//     if (!LivePreviewController.instance) {
//       LivePreviewController.instance = new LivePreviewController(context);
//     }
//     return LivePreviewController.instance;
//   }

//   private constructor(private context: vscode.ExtensionContext) {}

//   private get storageDir() {
//     return path.join(this.context.globalStorageUri.fsPath, "live-preview");
//   }

//   private get beforeSettingsPath() {
//     return path.join(this.storageDir, "settings.before.json");
//   }

//   private get previewSettingsPath() {
//     return path.join(this.storageDir, "settings.preview.json");
//   }

//   private get livePreviewThemePath() {
//     return path.join(
//       this.context.extensionPath,
//       "src/themes/live-preview.json"
//     );
//   }

//   private get snippetsDir() {
//     // Snippets are shipped as static files under dist/extension/snippets
//     return path.join(
//       this.context.extensionPath,
//       "dist",
//       "extension",
//       "snippets"
//     );
//   }

//   public async enable(): Promise<void> {
//     fs.mkdirSync(this.storageDir, { recursive: true });

//     const prevTheme = ThemeController.getInstance(
//       this.context
//     ).getActiveThemeLabel();
//     await this.setGlobalState("livePreview.prevTheme", prevTheme);
//     await this.setGlobalState("livePreview.enabled", true);

//     // Snapshot current user settings to restore if needed
//     const currentSettings = this.readUserSettingsFromDisk();
//     this.writeJson(this.beforeSettingsPath, currentSettings);

//     // Create preview settings file from current settings, but ensure we do not include color customizations
//     const previewSettings = { ...currentSettings } as JsonObject;
//     delete previewSettings["workbench.colorCustomizations"]; // keep colors in theme only
//     this.writeJson(this.previewSettingsPath, previewSettings);

//     // Copy current theme JSON to live-preview theme file (exact copy, only name changed)
//     const tc = ThemeController.getInstance(this.context);
//     const currentThemePath = tc.getThemePath();
//     if (currentThemePath && fs.existsSync(currentThemePath)) {
//       try {
//         const themeJson = JSON.parse(fs.readFileSync(currentThemePath, "utf8"));
//         themeJson.name = "live-preview";
//         this.writeJson(this.livePreviewThemePath, themeJson);
//       } catch (err) {
//         console.error("Failed to write live-preview theme", err);
//       }
//     }

//     // Switch active theme to live-preview
//     await vscode.workspace
//       .getConfiguration("workbench")
//       .update("colorTheme", "live-preview", vscode.ConfigurationTarget.Global);

//     // If no folder is open, set up snippets as a temporary workspace and layout
//     if (
//       !vscode.workspace.workspaceFolders ||
//       vscode.workspace.workspaceFolders.length === 0
//     ) {
//       await this.setupSnippetsIfNoWorkspace();
//     }
//   }

//   public async disable(saveApplied: boolean): Promise<void> {
//     const enabled = await this.getGlobalState<boolean>("livePreview.enabled");
//     if (!enabled) return;

//     const prevTheme = (await this.getGlobalState<string>(
//       "livePreview.prevTheme"
//     )) as string | undefined;

//     if (!saveApplied) {
//       // Restore settings from before-preview snapshot
//       const before = this.readJson(this.beforeSettingsPath);
//       const current = this.readUserSettingsFromDisk();
//       await this.applySettingsRestore(before, current);
//     }

//     // Restore previous theme if available
//     if (prevTheme) {
//       await vscode.workspace
//         .getConfiguration("workbench")
//         .update("colorTheme", prevTheme, vscode.ConfigurationTarget.Global);
//     }

//     await this.setGlobalState("livePreview.enabled", false);

//     // If we added a temporary workspace folder for snippets, remove it
//     const added = await this.getGlobalState<boolean>(
//       "livePreview.addedWorkspace"
//     );
//     if (
//       added &&
//       vscode.workspace.workspaceFolders &&
//       vscode.workspace.workspaceFolders.length > 0
//     ) {
//       const idx = vscode.workspace.workspaceFolders.findIndex(
//         (f) => f.uri.fsPath === this.snippetsDir
//       );
//       if (idx >= 0) {
//         vscode.workspace.updateWorkspaceFolders(idx, 1);
//       }
//       await this.setGlobalState("livePreview.addedWorkspace", false);
//     }
//   }

//   public async handleDispose(): Promise<void> {
//     const enabled = await this.getGlobalState<boolean>("livePreview.enabled");
//     if (enabled) {
//       await this.disable(false);
//     }
//   }

//   public async handleSaveComplete(): Promise<void> {
//     await this.disable(true);
//   }

//   // Utils
//   private async setGlobalState(key: string, value: any) {
//     await this.context.globalState.update(key, value);
//   }

//   private async getGlobalState<T>(key: string): Promise<T | undefined> {
//     return this.context.globalState.get<T>(key);
//   }

//   private writeJson(filePath: string, data: JsonObject) {
//     fs.mkdirSync(path.dirname(filePath), { recursive: true });
//     fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
//   }

//   private readJson(filePath: string): JsonObject {
//     if (!fs.existsSync(filePath)) return {};
//     try {
//       return JSON.parse(fs.readFileSync(filePath, "utf8"));
//     } catch {
//       return {};
//     }
//   }

//   private getUserSettingsPath(): string {
//     return path.join(
//       (vscode as any).env.appSettingsHome?.fsPath ||
//         path.join(
//           process.env.HOME || process.env.USERPROFILE || "",
//           ".config/Code/User"
//         ),
//       "settings.json"
//     );
//   }

//   private readUserSettingsFromDisk(): JsonObject {
//     const filePath = this.getUserSettingsPath();
//     if (!fs.existsSync(filePath)) return {};
//     try {
//       const text = fs.readFileSync(filePath, "utf8");
//       return text.trim() ? (JSON.parse(text) as JsonObject) : {};
//     } catch {
//       return {};
//     }
//   }

//   private async applySettingsRestore(before: JsonObject, current: JsonObject) {
//     const config = vscode.workspace.getConfiguration();
//     // restore keys present in before
//     for (const [key, value] of Object.entries(before)) {
//       await config.update(key, value, vscode.ConfigurationTarget.Global);
//     }
//     // remove keys that are not in before but exist in current
//     for (const key of Object.keys(current)) {
//       if (!(key in before)) {
//         await config.update(key, undefined, vscode.ConfigurationTarget.Global);
//       }
//     }
//   }

//   private async setupSnippetsIfNoWorkspace() {
//     // Ensure directory exists (it should be copied during build)
//     if (!fs.existsSync(this.snippetsDir)) {
//       fs.mkdirSync(this.snippetsDir, { recursive: true });
//     }

//     // Add snippets as a workspace folder
//     const added = vscode.workspace.updateWorkspaceFolders(0, 0, {
//       uri: vscode.Uri.file(this.snippetsDir),
//       name: "snippets",
//     });
//     if (added) {
//       await this.setGlobalState("livePreview.addedWorkspace", true);
//     }

//     // Open side bar (Explorer)
//     await vscode.commands.executeCommand("workbench.view.explorer");

//     // Create and show terminal
//     const terminal = vscode.window.createTerminal({ name: "Live Preview" });
//     terminal.show();

//     // Split editor and open a snippet beside the webview
//     const indexUri = vscode.Uri.file(path.join(this.snippetsDir, "index.html"));
//     const doc = await vscode.workspace.openTextDocument(indexUri);
//     await vscode.window.showTextDocument(doc, vscode.ViewColumn.Beside);
//   }
// }
