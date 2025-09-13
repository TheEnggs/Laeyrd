import * as vscode from "vscode";
export class ToastController {
  private static instance: ToastController;
  private context: vscode.ExtensionContext;

  private constructor(context: vscode.ExtensionContext) {
    this.context = context;
  }

  public static getInstance(context: vscode.ExtensionContext): ToastController {
    if (!ToastController.instance) {
      ToastController.instance = new ToastController(context);
    }
    return ToastController.instance;
  }

  public showToast({
    message,
    type,
  }: {
    message: string;
    type: "info" | "error" | "warn" | "success";
  }) {
    if (type === "info") vscode.window.showInformationMessage(message);
    else if (type === "warn") vscode.window.showWarningMessage(message);
    else if (type === "error") vscode.window.showErrorMessage(message);
    else if (type === "success") vscode.window.showInformationMessage(message);
    vscode.window.showInformationMessage(message);
  }
}
