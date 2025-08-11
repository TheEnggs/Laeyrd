import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

type JsonObject = Record<string, any>;

export class UserSettingsController {
  private backupDir: string;
  private originalBackupFile: string;
  private appliedBackupFile: string;
  private pendingChanges: JsonObject = {};
  private appliedChanges: JsonObject = {};

  constructor(private context: vscode.ExtensionContext) {
    this.backupDir = path.join(
      this.context.globalStorageUri.fsPath,
      "settings-backup"
    );

    this.originalBackupFile = path.join(
      this.backupDir,
      "settings.original.json"
    );
    this.appliedBackupFile = path.join(this.backupDir, "settings.applied.json");

    fs.mkdirSync(this.backupDir, { recursive: true });
  }

  /**
   * Ensure we store the user's original settings.json the first time we run.
   */
  public async ensureOriginalBackup() {
    if (!fs.existsSync(this.originalBackupFile)) {
      const currentSettings = await this.getAllSettings();
      this.writeBackupFile(this.originalBackupFile, currentSettings);
    }
  }

  /**
   * Apply a partial update to settings using VS Code API (not direct file write).
   * Saves the applied changes for rollback.
   */
  public async applySettings(partialUpdates: JsonObject) {
    for (const [key, value] of Object.entries(partialUpdates)) {
      await vscode.workspace
        .getConfiguration()
        .update(key, value, vscode.ConfigurationTarget.Global);
    }

    // Track applied changes for rollback
    this.appliedChanges = deepMerge(this.appliedChanges, partialUpdates);
    this.writeBackupFile(this.appliedBackupFile, this.appliedChanges);
  }

  /**
   * Stage pending changes in memory before applying.
   */
  public stageChanges(partialUpdates: JsonObject) {
    this.pendingChanges = deepMerge(this.pendingChanges, partialUpdates);
  }

  /**
   * Commit pending changes to settings.json
   */
  public async commitPendingChanges() {
    await this.applySettings(this.pendingChanges);
    this.pendingChanges = {};
  }

  /**
   * Rollback applied changes to original settings.json
   */
  public async rollbackToOriginal() {
    if (!fs.existsSync(this.originalBackupFile)) return;

    const originalSettings = this.readBackupFile(this.originalBackupFile);
    for (const [key, value] of Object.entries(originalSettings)) {
      await vscode.workspace
        .getConfiguration()
        .update(key, value, vscode.ConfigurationTarget.Global);
    }

    this.appliedChanges = {};
  }

  /**
   * Create a versioned backup of current settings
   */
  public async createVersionedBackup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupFile = path.join(this.backupDir, `settings-${timestamp}.json`);
    const currentSettings = await this.getAllSettings();
    this.writeBackupFile(backupFile, currentSettings);
  }

  /**
   * Get the entire settings.json as an object
   */
  private async getAllSettings(): Promise<JsonObject> {
    const config = vscode.workspace.getConfiguration();
    // VS Code doesn't provide raw settings.json directly, so we can only
    // fetch the keys we care about, or backup from disk for full snapshot
    return this.readUserSettingsFromDisk();
  }

  /**
   * Read user settings.json from disk (only for backup/restore, not live updates)
   */
  private readUserSettingsFromDisk(): JsonObject {
    const filePath = this.getUserSettingsPath();
    if (!fs.existsSync(filePath)) return {};
    try {
      const text = fs.readFileSync(filePath, "utf8");
      return text.trim() ? (JSON.parse(text) as JsonObject) : {};
    } catch {
      return {};
    }
  }

  /**
   * Path to VS Code's user settings.json
   */
  private getUserSettingsPath(): string {
    return path.join(
      (vscode as any).env.appSettingsHome?.fsPath ||
        path.join(
          process.env.HOME || process.env.USERPROFILE || "",
          ".config/Code/User"
        ),
      "settings.json"
    );
  }

  /**
   * Utility: Write JSON to a file safely
   */
  private writeBackupFile(filePath: string, data: JsonObject) {
    const dir = path.dirname(filePath);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
  }

  private readBackupFile(filePath: string): JsonObject {
    if (!fs.existsSync(filePath)) return {};
    try {
      return JSON.parse(fs.readFileSync(filePath, "utf8"));
    } catch {
      return {};
    }
  }
}

function isObject(value: any): value is JsonObject {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function deepMerge(base: JsonObject, updates: JsonObject): JsonObject {
  const out: JsonObject = { ...base };
  for (const [key, value] of Object.entries(updates)) {
    if (isObject(value)) {
      out[key] = deepMerge(isObject(out[key]) ? out[key] : {}, value);
    } else {
      out[key] = value;
    }
  }
  return out;
}
