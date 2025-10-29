import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { log } from "../../lib/debug-logs";

export async function copyCurrentThemeToBase(context: vscode.ExtensionContext) {
  const currentTheme = vscode.workspace
    .getConfiguration("workbench")
    .get<string>("colorTheme");

  log("Current active theme:", currentTheme);

  // Find theme extension
  const themeExt = vscode.extensions.all.find((ext) => {
    const themes = ext.packageJSON?.contributes?.themes || [];
    return themes.some(
      (t: any) => t.label === currentTheme || t.id === currentTheme
    );
  });

  if (!themeExt) {
    console.warn("Theme extension not found for:", currentTheme);
    return;
  }

  // Find theme info
  const themeInfo = themeExt.packageJSON.contributes.themes.find(
    (t: any) => t.label === currentTheme || t.id === currentTheme
  );

  if (!themeInfo) {
    console.warn("Theme info not found inside extension:", themeExt.id);
    return;
  }

  // Resolve path
  const themeJsonPath = path.join(themeExt.extensionPath, themeInfo.path);

  const themeJson = JSON.parse(
    fs.readFileSync(path.join(themeJsonPath), "utf8")
  );

  const myThemeFolder = path.join(context.extensionPath, "./src/themes");
  if (!fs.existsSync(myThemeFolder))
    fs.mkdirSync(myThemeFolder, { recursive: true });

  const myThemePath = path.join(myThemeFolder, "laeyrd.json");
  fs.writeFileSync(myThemePath, JSON.stringify(themeJson, null, 2));

  // Do not auto-apply theme here to avoid forcing user's selection
  // If needed, provide a command to apply: workbench.colorTheme = "Laeyrd"
}

export function isExpired(token: string, graceSeconds = 30): boolean {
  try {
    const [, payloadBase64] = token.split(".");
    const payload = JSON.parse(
      Buffer.from(payloadBase64, "base64").toString("utf8")
    );
    const exp = payload.exp;
    if (!exp) return true;
    return Date.now() >= (exp - graceSeconds) * 1000;
  } catch {
    return true;
  }
}
