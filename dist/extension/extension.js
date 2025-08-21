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
const debug_logs_1 = require("./utils/debug-logs");
const message_1 = require("./controller/message");
const theme_1 = require("./controller/theme");
const userSettings_1 = require("./controller/userSettings");
let panelInstance = undefined;
async function activate(context) {
    (0, debug_logs_1.log)("activate", context.extensionPath);
    const settingsPath = context.globalStorageUri.fsPath;
    //   const alreadyInitialized = context.globalState.get("tyc_initialized");
    //   const vcs = SettingsVersionControl.getInstance(settingsPath);
    //   if (!alreadyInitialized) {
    //     log("Initializing Theme Your Code");
    //     try {
    //       await copyCurrentThemeToBase(context);
    //     } catch (error) {
    //       log("Error copying current theme to base", error);
    //     }
    //     context.globalState.update("tyc_initialized", true);
    //   }
    context.subscriptions.push(vscode.commands.registerCommand("themeYourCode.open", () => {
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
        const themeController = theme_1.ThemeController.getInstance();
        // Ensure user settings backup exists on first open
        new userSettings_1.UserSettingsController(context).ensureOriginalBackup();
        const handler = new message_1.MessageHandler(context, panelInstance);
        // And set its HTML content
        panelInstance.webview.html = getWebviewHtml(panelInstance.webview, context.extensionPath);
        vscode.workspace.onDidChangeConfiguration((event) => {
            if (event.affectsConfiguration("workbench.colorTheme")) {
                themeController.refreshTheme();
                const groupedColors = themeController.getColors();
                handler.postMessage("UPDATE_THEME_COLORS", groupedColors);
            }
            if (event.affectsConfiguration("workbench.colorCustomizations")) {
                //do something
            }
        });
        panelInstance.webview.onDidReceiveMessage((message) => {
            console.log("message", message);
            handler.handle(message);
        }, undefined, context.subscriptions);
        // Ensure live preview cleans up if panel is disposed without saving
        panelInstance.onDidDispose(() => {
            // LivePreviewController.getInstance(context).handleDispose();
            panelInstance = undefined;
        });
    }));
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
