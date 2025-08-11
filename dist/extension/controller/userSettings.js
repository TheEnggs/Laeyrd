"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserSettingsController = void 0;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class UserSettingsController {
    constructor(context) {
        this.context = context;
        this.pendingChanges = {};
        this.appliedChanges = {};
        this.backupDir = path.join(this.context.globalStorageUri.fsPath, "settings-backup");
        this.originalBackupFile = path.join(this.backupDir, "settings.original.json");
        this.appliedBackupFile = path.join(this.backupDir, "settings.applied.json");
        fs.mkdirSync(this.backupDir, { recursive: true });
    }
    /**
     * Ensure we store the user's original settings.json the first time we run.
     */
    async ensureOriginalBackup() {
        if (!fs.existsSync(this.originalBackupFile)) {
            const currentSettings = await this.getAllSettings();
            this.writeBackupFile(this.originalBackupFile, currentSettings);
        }
    }
    /**
     * Apply a partial update to settings using VS Code API (not direct file write).
     * Saves the applied changes for rollback.
     */
    async applySettings(partialUpdates) {
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
    stageChanges(partialUpdates) {
        this.pendingChanges = deepMerge(this.pendingChanges, partialUpdates);
    }
    /**
     * Commit pending changes to settings.json
     */
    async commitPendingChanges() {
        await this.applySettings(this.pendingChanges);
        this.pendingChanges = {};
    }
    /**
     * Rollback applied changes to original settings.json
     */
    async rollbackToOriginal() {
        if (!fs.existsSync(this.originalBackupFile))
            return;
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
    async createVersionedBackup() {
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const backupFile = path.join(this.backupDir, `settings-${timestamp}.json`);
        const currentSettings = await this.getAllSettings();
        this.writeBackupFile(backupFile, currentSettings);
    }
    /**
     * Get the entire settings.json as an object
     */
    async getAllSettings() {
        const config = vscode.workspace.getConfiguration();
        // VS Code doesn't provide raw settings.json directly, so we can only
        // fetch the keys we care about, or backup from disk for full snapshot
        return this.readUserSettingsFromDisk();
    }
    /**
     * Read user settings.json from disk (only for backup/restore, not live updates)
     */
    readUserSettingsFromDisk() {
        const filePath = this.getUserSettingsPath();
        if (!fs.existsSync(filePath))
            return {};
        try {
            const text = fs.readFileSync(filePath, "utf8");
            return text.trim() ? JSON.parse(text) : {};
        }
        catch {
            return {};
        }
    }
    /**
     * Path to VS Code's user settings.json
     */
    getUserSettingsPath() {
        return path.join(vscode.env.appSettingsHome?.fsPath ||
            path.join(process.env.HOME || process.env.USERPROFILE || "", ".config/Code/User"), "settings.json");
    }
    /**
     * Utility: Write JSON to a file safely
     */
    writeBackupFile(filePath, data) {
        const dir = path.dirname(filePath);
        fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
    }
    readBackupFile(filePath) {
        if (!fs.existsSync(filePath))
            return {};
        try {
            return JSON.parse(fs.readFileSync(filePath, "utf8"));
        }
        catch {
            return {};
        }
    }
}
exports.UserSettingsController = UserSettingsController;
function isObject(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value);
}
function deepMerge(base, updates) {
    const out = { ...base };
    for (const [key, value] of Object.entries(updates)) {
        if (isObject(value)) {
            out[key] = deepMerge(isObject(out[key]) ? out[key] : {}, value);
        }
        else {
            out[key] = value;
        }
    }
    return out;
}
