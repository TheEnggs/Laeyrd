
import * as vscode from "vscode";
import { detectFork, getSettingsPath } from "@extension/utils/getSettings";
import { ThemeJson } from "@shared/types/theme";

const encoder = new TextEncoder(),
 decoder = new TextDecoder();

export interface ThemeBackupPayload {
  // Whatever shape your theme/draft state has
  // You can replace this with your DraftState or DraftFile type
  id?: string;
  name: string;
  data: ThemeJson;
}

export class BackupManager {
  private readonly storageRoot: vscode.Uri;
  private readonly backupsDir: vscode.Uri;
  private readonly themesDir: vscode.Uri;
  private readonly settingsBackupFile: vscode.Uri;

  constructor(private readonly context: vscode.ExtensionContext) {
    this.storageRoot = context.globalStorageUri;
    this.backupsDir = vscode.Uri.joinPath(this.storageRoot, "backups");
    this.themesDir = vscode.Uri.joinPath(this.backupsDir, "themes");
    this.settingsBackupFile = vscode.Uri.joinPath(
      this.backupsDir,
      "settings-original.json"
    );
  }

  /**
   * Ensure directories exist. Call this early in activate()
   */
  public async init() {
    await vscode.workspace.fs.createDirectory(this.backupsDir);
    await vscode.workspace.fs.createDirectory(this.themesDir);
  }

  /**
   * One-time backup of settings.json when extension is first installed.
   * If backup file already exists, it does nothing.
   */
  public async ensureInitialSettingsBackup() {
    try {
      // If file exists, don't touch it
      await vscode.workspace.fs.stat(this.settingsBackupFile);
      // Stat succeeded → backup already exists
      return;
    } catch {
      // Stat failed → no backup yet
    }

    const settingsUri = this.getUserSettingsUri();
    if (!settingsUri) {
      // Can't locate settings.json (very rare, but let's not explode)
      return;
    }

    try {
      const settingsBytes = await vscode.workspace.fs.readFile(settingsUri);
      // Save exact raw content
      await vscode.workspace.fs.writeFile(
        this.settingsBackupFile,
        settingsBytes
      );
    } catch (error) {
      // Swallow failure but log if you have a logger
      console.error("Failed to create initial settings backup:", error);
    }
  }

  /**
   * Creates a backup of the given theme / draft payload.
   * Call this whenever you create/update a theme or apply draft changes.
   */
  public async backupTheme(payload: ThemeBackupPayload) {
    const safeName = payload.name?.replace(/[^\w\-]+/g, "_") || "theme",
     fileName = `${safeName}.json`,
     fileUri = vscode.Uri.joinPath(this.themesDir, fileName),

     content = {
      id: payload.id ?? null,
      name: payload.name ?? null,
      createdAt: new Date().toISOString(),
      data: payload.data,
    },

     json = JSON.stringify(content, null, 2),
     bytes = encoder.encode(json);

    try {
      await vscode.workspace.fs.writeFile(fileUri, bytes);
    } catch (error) {
      console.error("Failed to write theme backup:", error);
    }
  }

  public async deleteBackedUpThemeFile(themeName: string) {
    const themeUri = vscode.Uri.joinPath(this.themesDir, `${themeName  }.json`);
    await vscode.workspace.fs.delete(themeUri, { recursive: false });
  }

  /**
   * Optional helper to list existing theme backups, if you ever want a UI for restore.
   */
  public async listThemeBackups(): Promise<vscode.Uri[]> {
    try {
      const entries = await vscode.workspace.fs.readDirectory(this.themesDir);
      return entries
        .filter(
          ([name, type]) =>
            type === vscode.FileType.File && name.endsWith(".json")
        )
        .map(([name]) => vscode.Uri.joinPath(this.themesDir, name));
    } catch {
      return [];
    }
  }

  /**
   * Optional helper: read back the initial settings backup if needed.
   */
  public async readInitialSettingsBackup(): Promise<string | null> {
    try {
      const bytes = await vscode.workspace.fs.readFile(this.settingsBackupFile);
      return decoder.decode(bytes);
    } catch {
      return null;
    }
  }

  public async addTheme_UpdatePackageJson(
    context: vscode.ExtensionContext,
    themeName: string,
    themeJson: ThemeJson,
    type: "light" | "dark" = "dark"
  ) {
    try {
      let fileUri = vscode.Uri.joinPath(
        context.extensionUri,
        "dist/themes",
        `${themeName}.json`
      );
      if (!fileUri) {
        const themePath = vscode.Uri.joinPath(
          context.extensionUri,
          "dist/themes"
        );
        await vscode.workspace.fs.createDirectory(themePath);
        fileUri = vscode.Uri.joinPath(themePath, `${themeName}.json`);
      }

      await vscode.workspace.fs.writeFile(
        fileUri,
        new TextEncoder().encode(JSON.stringify(themeJson, null, 2))
      );
      const packageUri = vscode.Uri.joinPath(
        context.extensionUri,
        "package.json"
      ),
       content = await vscode.workspace.fs.readFile(packageUri),
       pkg = JSON.parse(Buffer.from(content).toString("utf8"));

      if (!pkg.contributes) {pkg.contributes = {};}
      if (!pkg.contributes.themes) {pkg.contributes.themes = [];}

      const alreadyExists = pkg.contributes.themes.some(
        (t: any) => t.label === themeName
      );
      if (alreadyExists)
        {throw new Error(`Theme "${themeName}" already exists in package.json.`);}
      pkg.contributes.themes.push({
        label: themeName,
        uiTheme: type === "dark" ? "vs-dark" : "vs",
        path: `dist/themes/${themeName}.json`,
      });

      await vscode.workspace.fs.writeFile(
        packageUri,
        new TextEncoder().encode(JSON.stringify(pkg, null, 2))
      );

      return { success: true };
    } catch (err) {
      vscode.window.showErrorMessage(`Failed to backup themes "${themeName}"`);
      return { success: false };
    }
  }

  public async pullBackups() {
    try {
      const entries = await vscode.workspace.fs.readDirectory(this.themesDir);
      for (const [name, type] of entries) {
        if (type === vscode.FileType.File && name.endsWith(".json")) {
          const themeUri = vscode.Uri.joinPath(this.themesDir, name),
           bytes = await vscode.workspace.fs.readFile(themeUri),
           themeJson: ThemeJson = JSON.parse(new TextDecoder().decode(bytes));
          await this.addTheme_UpdatePackageJson(this.context, name, themeJson);
        }
      }
      vscode.window
        .showInformationMessage(
          `Themes backed up! Reload window to activate.`,
          "Reload Window Now"
        )
        .then((selection) => {
          if (selection === "Reload Window Now")
            {vscode.commands.executeCommand("workbench.action.reloadWindow");}
        });
    } catch (e) {
      vscode.window.showErrorMessage(`Failed to pull backups`);
    }
  }

  /**
   * Try to locate the user settings.json path for the current environment.
   * This uses VS Code workspace APIs instead of guessing OS paths.
   */
  private getUserSettingsUri(): vscode.Uri {
    const fork = detectFork(),
     settingsPath = getSettingsPath(fork), // Your function returning a string
     uri = vscode.Uri.file(settingsPath);
    return uri;
  }
}
