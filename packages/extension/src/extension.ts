import * as vscode from "vscode";
import { PanelManager } from "./controller/panelManager";
import { AuthController } from "./controller/auth";
import { MessageController } from "./controller/message";

let panelManager: PanelManager;
let authController: AuthController;

export async function activate(context: vscode.ExtensionContext) {
  const openCommand = vscode.commands.registerCommand("laeyrd.open", () => {
    const messageHandler = new MessageController(context);
    panelManager = new PanelManager(context, messageHandler);
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
    // auto sync can be added here
  });

  context.subscriptions.push(openCommand, panelManager, authController);
}

export function deactivate() {
  // Cleanup auth server when extension is deactivated
  if (authController) {
    authController.dispose();
  }
}
