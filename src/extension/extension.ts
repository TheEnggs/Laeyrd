import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import { log } from "./utils/debug-logs";
import { MessageHandler } from "./controller/message";
import { ThemeController } from "./controller/theme";
import { UserSettingsController } from "./controller/userSettings";
import { LivePreviewController } from "./controller/livePreview";
import { UserPreferencesController } from "./controller/userPreferences";
import { AuthController } from "./controller/auth";

let panelInstance: vscode.WebviewPanel | undefined = undefined;

export async function activate(context: vscode.ExtensionContext) {
  const settingsPath = context.globalStorageUri.fsPath;
  const themeController = ThemeController.getInstance(context);
  const userSettingsController = new UserSettingsController(context);
  const userPreferencesController =
    UserPreferencesController.getInstance(context);
  const authController = AuthController.getInstance(context);

  // Ensure original user settings backup exists
  userSettingsController.ensureOriginalBackup();

  /**
   * Command: themeYourCode.open
   */
  const openCommand = vscode.commands.registerCommand(
    "themeYourCode.open",
    () => {
      if (panelInstance) {
        panelInstance.reveal(vscode.ViewColumn.One);
        return;
      }

      // Create and show panel
      panelInstance = vscode.window.createWebviewPanel(
        "themeYourCode",
        "Theme Your Code",
        vscode.ViewColumn.One,
        {
          enableScripts: true,
          retainContextWhenHidden: true,
          localResourceRoots: [
            vscode.Uri.file(
              path.join(context.extensionPath, "dist", "webview-ui")
            ),
          ],
        }
      );

      const handler = new MessageHandler(context, panelInstance);

      // Set initial HTML
      panelInstance.webview.html = getWebviewHtml(
        panelInstance.webview,
        context.extensionPath
      );

      // Watch for configuration changes (global/workspace)
      const configWatcher = vscode.workspace.onDidChangeConfiguration(
        (event) => {
          if (event.affectsConfiguration("workbench.colorTheme")) {
            handler.configurationChanged({
              updateThemeColor: true,
              updateThemeList: true,
            });
          }

          if (event.affectsConfiguration("workbench.colorCustomizations")) {
          }
        }
      );

      // Listen for webview messages
      const messageListener = panelInstance.webview.onDidReceiveMessage(
        (message) => {
          handler.handle(message.command, message);
        }
      );

      // Handle panel disposal
      const disposeListener = panelInstance.onDidDispose(() => {
        panelInstance = undefined;
      });

      // Push disposables
      context.subscriptions.push(
        configWatcher,
        messageListener,
        disposeListener
      );
    }
  );

  // Register command
  context.subscriptions.push(openCommand);
}

const isDev = false;

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
