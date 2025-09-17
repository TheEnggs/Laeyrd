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
exports.ThemeYourCodePanelManager = void 0;
const vscode = __importStar(require("vscode"));
const message_1 = require("./message");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const fonts_layout_1 = require("../../lib/fonts-layout");
const isDev = false;
class ThemeYourCodePanelManager {
    constructor(context) {
        this.context = context;
        this.disposables = [];
    }
    open() {
        if (this.panel) {
            this.panel.reveal(vscode.ViewColumn.One);
            return;
        }
        this.panel = vscode.window.createWebviewPanel("themeYourCode", "Theme Your Code", vscode.ViewColumn.One, {
            enableScripts: true,
            retainContextWhenHidden: true,
            localResourceRoots: [
                vscode.Uri.file(path_1.default.join(this.context.extensionPath, "dist", "webview-ui")),
            ],
        });
        this.initMessageHandler(this.panel);
        this.panel.webview.html = getWebviewHtml(this.panel.webview, this.context.extensionPath);
        this.disposables.push(vscode.workspace.onDidChangeConfiguration((event) => {
            if (!this.messageHandler) {
                return;
            }
            if (event.affectsConfiguration("workbench.colorTheme")) {
                this.messageHandler.configurationChanged({
                    updateThemeColor: true,
                    updateThemeList: true,
                });
            }
            // Listen for font and layout settings changes
            if (this.isFontOrLayoutSetting(event)) {
                this.messageHandler.settingsChanged();
            }
        }), this.panel.webview.onDidReceiveMessage((message) => this.messageHandler?.handle(message.command, message)), this.panel.onDidDispose(() => this.disposePanel()));
    }
    disposePanel() {
        this.panel = undefined;
        this.dispose();
    }
    dispose() {
        while (this.disposables.length) {
            const d = this.disposables.pop();
            d?.dispose();
        }
    }
    initMessageHandler(panel) {
        this.messageHandler = new message_1.MessageHandler(this.context, panel);
    }
    /**
     * Check if a configuration change affects font or layout settings
     */
    isFontOrLayoutSetting(event) {
        const fontAndLayoutKeys = Object.keys(fonts_layout_1.fontsLayoutUI);
        const affectedKeys = fontAndLayoutKeys.filter((key) => {
            return event.affectsConfiguration(key);
        });
        if (affectedKeys.length > 0) {
            console.log(`[PanelManager] Font/Layout settings changed: ${affectedKeys.join(", ")}`);
            return true;
        }
        return false;
    }
}
exports.ThemeYourCodePanelManager = ThemeYourCodePanelManager;
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
    const html = fs_1.default.readFileSync(path_1.default.join(extensionPath, "dist/webview-ui/index.html"), "utf8");
    return html.replace(/(href|src)="\/(.*?)"/g, (_, attr, file) => {
        const resource = webview.asWebviewUri(vscode.Uri.file(path_1.default.join(extensionPath, "dist", "webview-ui", file)));
        return `${attr}="${resource}"`;
    });
}
