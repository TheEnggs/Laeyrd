import * as vscode from "vscode";
import { MessageController } from "./message";
import path from "path";
import fs from "fs";
import { fontsLayoutUI } from "../../lib/data/fonts-layout";

const isDev = false;

export class LaeyrdPanelManager implements vscode.Disposable {
  private panel?: vscode.WebviewPanel;
  private disposables: vscode.Disposable[] = [];

  constructor(
    private readonly context: vscode.ExtensionContext,
    private messageHandler: MessageController
  ) {}

  public open() {
    if (this.panel) {
      this.panel.reveal(vscode.ViewColumn.One);
      return;
    }

    this.panel = vscode.window.createWebviewPanel(
      "laeyrd",
      "Laeyrd",
      vscode.ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [
          vscode.Uri.file(
            path.join(this.context.extensionPath, "dist", "webview-ui")
          ),
        ],
      }
    );

    // Inject the panel into MessageHandler
    this.messageHandler.setPanel(this.panel);

    this.panel.webview.html = this.getWebviewHtml(this.panel.webview);

    this.registerEventListeners();
  }

  private registerEventListeners() {
    if (!this.panel) return;

    // Configuration changes
    this.disposables.push(
      vscode.workspace.onDidChangeConfiguration((event) => {
        if (event.affectsConfiguration("workbench.colorTheme")) {
          this.messageHandler
            .configurationChanged({
              updateThemeColor: true,
              updateThemeList: true,
            })
            .catch((err) =>
              console.log("something went wrong while updating theme")
            );
        }
        if (this.isFontOrLayoutSetting(event)) {
          this.messageHandler
            .settingsChanged()
            .catch((err) =>
              console.log("something went wrong while updating settings")
            );
        }
      })
    );

    // Webview messages
    this.disposables.push(
      this.panel.webview.onDidReceiveMessage((message) =>
        this.messageHandler.handle(message.command, message)
      )
    );

    // Panel dispose
    this.disposables.push(this.panel.onDidDispose(() => this.disposePanel()));
  }

  private disposePanel() {
    this.panel = undefined;
    this.dispose();
  }

  public dispose() {
    while (this.disposables.length) {
      const d = this.disposables.pop();
      d?.dispose();
    }
  }

  private isFontOrLayoutSetting(
    event: vscode.ConfigurationChangeEvent
  ): boolean {
    const keys = Object.keys(fontsLayoutUI);
    const affected = keys.filter((k) => event.affectsConfiguration(k));
    if (affected.length > 0) {
      console.log(`[PanelManager] Font/Layout changed: ${affected.join(", ")}`);
      return true;
    }
    return false;
  }

  private getWebviewHtml(webview: vscode.Webview): string {
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

    const html = fs.readFileSync(
      path.join(this.context.extensionPath, "dist/webview-ui/index.html"),
      "utf8"
    );

    return html.replace(/(href|src)="\/(.*?)"/g, (_, attr, file) => {
      const resource = webview.asWebviewUri(
        vscode.Uri.file(
          path.join(this.context.extensionPath, "dist/webview-ui", file)
        )
      );
      return `${attr}="${resource}"`;
    });
  }
}
