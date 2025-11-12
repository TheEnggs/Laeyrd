
import { AuthController } from "@extension/controller/auth";
import { SettingsController } from "@extension/controller/settings";
import { ThemeController } from "@extension/controller/theme";
import { UserPreferencesController } from "@extension/controller/userPreferences";
import * as vscode from "vscode"
export class ControllerFactory {
  private static instances = new Map<string, any>();

  static get(context: vscode.ExtensionContext, prefix: string) {
    const existing = this.instances.get(prefix);
    if (existing) return existing;

    let instance;
    switch (prefix) {
      case "THEMES":
        instance = ThemeController.create();
        break;
      case "AUTH":
        instance = AuthController.getInstance(context);
        break;
      case "SETTINGS":
        instance = SettingsController.init(context);
        break;
      case "PREFERENCES":
        instance = new UserPreferencesController(context);
        break;
      default:
        throw new Error(`Unknown controller prefix: ${prefix}`);
    }

    this.instances.set(prefix, instance);
    return instance;
  }
}
