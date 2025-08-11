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
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class SettingsVersionControl {
    constructor(baseDir) {
        this.baseDir = baseDir;
        this.metaFile = path.join(baseDir, "meta.json");
        this.baseFile = path.join(baseDir, "store", "base.json");
        this.currentFile = path.join(baseDir, "store", "current.json");
        this.versionsDir = path.join(baseDir, "store", "versions");
        this.ensureDirs();
    }
    static getInstance(baseDir) {
        if (!SettingsVersionControl.instance) {
            SettingsVersionControl.instance = new SettingsVersionControl(baseDir);
        }
        return SettingsVersionControl.instance;
    }
    ensureDirs() {
        fs.mkdirSync(this.versionsDir, { recursive: true });
    }
    readJSON(filePath) {
        return JSON.parse(fs.readFileSync(filePath, "utf-8"));
    }
    writeJSON(filePath, data) {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
    }
    getMeta() {
        return this.readJSON(this.metaFile);
    }
    setMeta(meta) {
        this.writeJSON(this.metaFile, meta);
    }
    initBase(settings) {
        if (!fs.existsSync(this.baseFile)) {
            this.writeJSON(this.baseFile, settings);
            this.writeJSON(this.currentFile, settings);
            this.setMeta({ latestVersion: 0, currentVersion: 0 });
        }
    }
    getCurrent() {
        return this.readJSON(this.currentFile);
    }
    saveNewVersion(newSettings) {
        const meta = this.getMeta();
        const nextVersion = meta.latestVersion + 1;
        const versionFile = path.join(this.versionsDir, `${String(nextVersion).padStart(3, "0")}.json`);
        this.writeJSON(versionFile, newSettings);
        this.writeJSON(this.currentFile, newSettings);
        this.setMeta({ latestVersion: nextVersion, currentVersion: nextVersion });
    }
    restoreVersion(versionNumber) {
        const versionFile = path.join(this.versionsDir, `${String(versionNumber).padStart(3, "0")}.json`);
        if (!fs.existsSync(versionFile))
            throw new Error(`Version ${versionNumber} does not exist`);
        const settings = this.readJSON(versionFile);
        this.writeJSON(this.currentFile, settings);
        this.setMeta({ ...this.getMeta(), currentVersion: versionNumber });
        return settings;
    }
    resetToBase() {
        const baseSettings = this.readJSON(this.baseFile);
        this.writeJSON(this.currentFile, baseSettings);
        this.setMeta({ ...this.getMeta(), currentVersion: 0 });
        return baseSettings;
    }
}
exports.default = SettingsVersionControl;
