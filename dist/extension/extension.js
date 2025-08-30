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
exports.activate = activate;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const message_1 = require("./controller/message");
const theme_1 = require("./controller/theme");
const userSettings_1 = require("./controller/userSettings");
const userPreferences_1 = require("./controller/userPreferences");
const auth_1 = require("./controller/auth");
let panelInstance = undefined;
async function activate(context) {
    const settingsPath = context.globalStorageUri.fsPath;
    const themeController = theme_1.ThemeController.getInstance(context);
    const userSettingsController = new userSettings_1.UserSettingsController(context);
    const userPreferencesController = userPreferences_1.UserPreferencesController.getInstance(context);
    const authController = auth_1.AuthController.getInstance(context);
    // Ensure original user settings backup exists
    userSettingsController.ensureOriginalBackup();
    /**
     * Command: themeYourCode.open
     */
    const openCommand = vscode.commands.registerCommand("themeYourCode.open", () => {
        if (panelInstance) {
            panelInstance.reveal(vscode.ViewColumn.One);
            return;
        }
        // Create and show panel
        panelInstance = vscode.window.createWebviewPanel("themeYourCode", "Theme Your Code", vscode.ViewColumn.One, {
            enableScripts: true,
            retainContextWhenHidden: true,
            localResourceRoots: [
                vscode.Uri.file(path.join(context.extensionPath, "dist", "webview-ui")),
            ],
        });
        const handler = new message_1.MessageHandler(context, panelInstance);
        // Set initial HTML
        panelInstance.webview.html = getWebviewHtml(panelInstance.webview, context.extensionPath);
        // Watch for configuration changes (global/workspace)
        const configWatcher = vscode.workspace.onDidChangeConfiguration((event) => {
            if (event.affectsConfiguration("workbench.colorTheme")) {
                handler.configurationChanged({
                    updateThemeColor: true,
                    updateThemeList: true,
                });
            }
            if (event.affectsConfiguration("workbench.colorCustomizations")) {
            }
        });
        // Listen for webview messages
        const messageListener = panelInstance.webview.onDidReceiveMessage((message) => {
            handler.handle(message.command, message);
        });
        // Handle panel disposal
        const disposeListener = panelInstance.onDidDispose(() => {
            panelInstance = undefined;
        });
        // Push disposables
        context.subscriptions.push(configWatcher, messageListener, disposeListener);
    });
    // Register command
    context.subscriptions.push(openCommand);
}
const isDev = false;
function getWebviewHtml(webview, extensionPath) {
    if (isDev) {
        return `
          <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta http-equiv="Content-Security-Policy"
          content="default-src 'none';
                   img-src https: data:;
                   script-src 'unsafe-inline' http://localhost:5173;
                   style-src 'unsafe-inline' http://localhost:5173;
                   connect-src http://localhost:5173;">
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Vite Dev Webview</title>
      </head>
      <body>
        <div id="root"></div>
        <script type="module" src="http://localhost:5173/src/main.tsx"></script>
      </body>
    </html>
  `;
    }
    // PRODUCTION
    const html = fs.readFileSync(path.join(extensionPath, "dist/webview-ui/index.html"), "utf8");
    return html.replace(/(href|src)="\/(.*?)"/g, (_, attr, file) => {
        const resource = webview.asWebviewUri(vscode.Uri.file(path.join(extensionPath, "dist", "webview-ui", file)));
        return `${attr}="${resource}"`;
    });
}
