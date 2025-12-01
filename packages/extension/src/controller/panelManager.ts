import * as vscode from "vscode";
import { MessageController } from "./message";
import path from "path";
import fs from "fs";
import { fontsLayoutUI } from "@shared/data/fonts-layout";
import { log } from "@shared/utils/debug-logs";

export class PanelManager implements vscode.Disposable {
  private static instance: PanelManager;
  public panel?: vscode.WebviewPanel;
  private disposables: vscode.Disposable[] = [];
  private messageHandler: MessageController;

  private constructor(
    private readonly context: vscode.ExtensionContext,
  ) {
    this.messageHandler = new MessageController(this.context);
  }

    public static getInstance(
      context: vscode.ExtensionContext
    ): PanelManager {
      if (!this.instance) {
        const manager = new PanelManager(context);
        this.instance = manager;
      }
      return this.instance;
    }

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
    this.panel.iconPath = {
      light: vscode.Uri.joinPath(
        this.context.extensionUri,
        "dist",
        "media",
        "icons",
        "laeyrd_ae_dark.svg"
      ),
      dark: vscode.Uri.joinPath(
        this.context.extensionUri,
        "dist",
        "media",
        "icons",
        "laeyrd_ae_light.svg"
      ),
    };

    // Inject the panel into MessageHandler
    this.panel.webview.html = this.getWebviewHtml(this.panel.webview);
    this.messageHandler.setPanel(this.panel);
    this.registerEventListeners();
  }

  private registerEventListeners() {
    if (!this.panel) {return;}
    this.messageHandler.setPanel(this.panel);
    // Configuration changes
    this.disposables.push(
      vscode.workspace.onDidChangeConfiguration((event) => {
        if (event.affectsConfiguration("workbench.colorTheme")) {
          this.messageHandler
            .configurationChanged({
              updateThemeColor: true,
              updateThemeList: true,
            })
            .catch((err) => log(err));
        }
        if (this.isFontOrLayoutSetting(event)) {
          this.messageHandler
            .settingsChanged()
            .catch((err) =>
              log(err)
            );
        }
      })
    );

    // Webview messages
    this.disposables.push(
      this.panel.webview.onDidReceiveMessage((message) =>
        this.messageHandler.handle(message)
      )
    );

    // Panel dispose
    this.disposables.push(
      this.panel.onDidDispose(async () => await this.disposePanel())
    );
  }

  private async disposePanel() {
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
    const keys = Object.keys(fontsLayoutUI),
     affected = keys.filter((k) => event.affectsConfiguration(k));
    if (affected.length > 0) {
      log(`[PanelManager] Font/Layout changed: ${affected.join(", ")}`);
      return true;
    }
    return false;
  }

  private getWebviewHtml(webview: vscode.Webview): string {
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
