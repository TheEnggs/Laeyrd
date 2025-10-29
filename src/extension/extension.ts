import * as vscode from "vscode";
import { AuthController } from "./controller/auth";
import { LaeyrdPanelManager } from "./controller/panelManager";
import { MessageController } from "./controller/message";

let panelManager: LaeyrdPanelManager;
let authController: AuthController;

export async function activate(context: vscode.ExtensionContext) {
  const openCommand = vscode.commands.registerCommand("laeyrd.open", () => {
    const messageHandler = new MessageController(context);
    panelManager = new LaeyrdPanelManager(context, messageHandler);
    panelManager.open();
    // controllers
    authController = AuthController.getInstance();
    authController.setContext(context);
    //   authController.clearStoredAuth();
    authController.loadStoredAuth();
    authController.onAuthChanged((user) =>
      messageHandler.POST_MESSAGE({
        command: "UPDATE_AUTH_USER",
        payload: user || undefined,
        requestId: "",
        status: "success",
      })
    );
  });

  context.subscriptions.push(openCommand, panelManager, authController);
}

export function deactivate() {
  // Cleanup auth server when extension is deactivated
  if (authController) {
    authController.dispose();
  }
}
