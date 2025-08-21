import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import { log } from "./utils/debug-logs";
import { MessageHandler } from "./controller/message";
import { ThemeController } from "./controller/theme";
import { UserSettingsController } from "./controller/userSettings";
import { LivePreviewController } from "./controller/livePreview";
import { transformColorsToColorTabs } from "./utils/color-category-map";

let panelInstance: vscode.WebviewPanel | undefined = undefined;
export async function activate(context: vscode.ExtensionContext) {
  log("activate", context.extensionPath);
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
  context.subscriptions.push(
    vscode.commands.registerCommand("themeYourCode.open", () => {
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
      const themeController = ThemeController.getInstance();
      // Ensure user settings backup exists on first open
      new UserSettingsController(context).ensureOriginalBackup();
      const handler = new MessageHandler(context, panelInstance);
      // And set its HTML content
      panelInstance.webview.html = getWebviewHtml(
        panelInstance.webview,
        context.extensionPath
      );
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
      panelInstance.webview.onDidReceiveMessage(
        (message) => {
          console.log("message", message);
          handler.handle(message);
        },
        undefined,
        context.subscriptions
      );

      // Ensure live preview cleans up if panel is disposed without saving
      panelInstance.onDidDispose(() => {
        // LivePreviewController.getInstance(context).handleDispose();
        panelInstance = undefined;
      });
    })
  );
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
