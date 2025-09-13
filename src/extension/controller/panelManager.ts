import * as vscode from "vscode";
import { MessageHandler } from "./message";
import path from "path";
import fs from "fs";
import { fontsLayoutUI } from "../../lib/fonts-layout";

const isDev = false;

export class ThemeYourCodePanelManager implements vscode.Disposable {
  private panel: vscode.WebviewPanel | undefined;
  private disposables: vscode.Disposable[] = [];

  constructor(private readonly context: vscode.ExtensionContext) {}

  public open() {
    if (this.panel) {
      this.panel.reveal(vscode.ViewColumn.One);
      return;
    }

    this.panel = vscode.window.createWebviewPanel(
      "themeYourCode",
      "Theme Your Code",
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

    const handler = new MessageHandler(this.context, this.panel);

    this.panel.webview.html = getWebviewHtml(
      this.panel.webview,
      this.context.extensionPath
    );

    this.disposables.push(
      vscode.workspace.onDidChangeConfiguration((event) => {
        if (event.affectsConfiguration("workbench.colorTheme")) {
          handler.configurationChanged({
            updateThemeColor: true,
            updateThemeList: true,
          });
        }
        // Listen for font and layout settings changes
        if (this.isFontOrLayoutSetting(event)) {
          handler.settingsChanged();
        }
      }),

      this.panel.webview.onDidReceiveMessage((message) =>
        handler.handle(message.command, message)
      ),

      this.panel.onDidDispose(() => this.disposePanel())
    );
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

  /**
   * Check if a configuration change affects font or layout settings
   */
  private isFontOrLayoutSetting(
    event: vscode.ConfigurationChangeEvent
  ): boolean {
    const fontAndLayoutKeys = Object.keys(fontsLayoutUI);

    const affectedKeys = fontAndLayoutKeys.filter((key) => {
      return event.affectsConfiguration(key);
    });

    if (affectedKeys.length > 0) {
      console.log(
        `[PanelManager] Font/Layout settings changed: ${affectedKeys.join(
          ", "
        )}`
      );
      return true;
    }

    return false;
  }
}

function getWebviewHtml(
  webview: vscode.Webview,
  extensionPath: string
): string {
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
  const html = fs.readFileSync(
    path.join(extensionPath, "dist/webview-ui/index.html"),
    "utf8"
  );

  return html.replace(/(href|src)="\/(.*?)"/g, (_, attr, file) => {
    const resource = webview.asWebviewUri(
      vscode.Uri.file(path.join(extensionPath, "dist", "webview-ui", file))
    );
    return `${attr}="${resource}"`;
  });
}
