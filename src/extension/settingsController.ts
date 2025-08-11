import * as fs from "fs";
import * as path from "path";

interface MetaData {
  latestVersion: number;
  currentVersion: number;
}

class SettingsVersionControl {
  private static instance: SettingsVersionControl;
  private baseDir: string;
  private metaFile: string;
  private baseFile: string;
  private currentFile: string;
  private versionsDir: string;

  private constructor(baseDir: string) {
    this.baseDir = baseDir;
    this.metaFile = path.join(baseDir, "meta.json");
    this.baseFile = path.join(baseDir, "store", "base.json");
    this.currentFile = path.join(baseDir, "store", "current.json");
    this.versionsDir = path.join(baseDir, "store", "versions");

    this.ensureDirs();
  }

  public static getInstance(baseDir: string) {
    if (!SettingsVersionControl.instance) {
      SettingsVersionControl.instance = new SettingsVersionControl(baseDir);
    }
    return SettingsVersionControl.instance;
  }

  private ensureDirs() {
    fs.mkdirSync(this.versionsDir, { recursive: true });
  }

  private readJSON<T>(filePath: string): T {
    return JSON.parse(fs.readFileSync(filePath, "utf-8")) as T;
  }

  private writeJSON(filePath: string, data: unknown) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  }

  private getMeta(): MetaData {
    return this.readJSON<MetaData>(this.metaFile);
  }

  private setMeta(meta: MetaData) {
    this.writeJSON(this.metaFile, meta);
  }

  public initBase(settings: object) {
    if (!fs.existsSync(this.baseFile)) {
      this.writeJSON(this.baseFile, settings);
      this.writeJSON(this.currentFile, settings);
      this.setMeta({ latestVersion: 0, currentVersion: 0 });
    }
  }

  public getCurrent(): object {
    return this.readJSON<object>(this.currentFile);
  }

  public saveNewVersion(newSettings: object) {
    const meta = this.getMeta();
    const nextVersion = meta.latestVersion + 1;

    const versionFile = path.join(
      this.versionsDir,
      `${String(nextVersion).padStart(3, "0")}.json`
    );
    this.writeJSON(versionFile, newSettings);
    this.writeJSON(this.currentFile, newSettings);

    this.setMeta({ latestVersion: nextVersion, currentVersion: nextVersion });
  }

  public restoreVersion(versionNumber: number) {
    const versionFile = path.join(
      this.versionsDir,
      `${String(versionNumber).padStart(3, "0")}.json`
    );
    if (!fs.existsSync(versionFile))
      throw new Error(`Version ${versionNumber} does not exist`);

    const settings = this.readJSON<object>(versionFile);
    this.writeJSON(this.currentFile, settings);
    this.setMeta({ ...this.getMeta(), currentVersion: versionNumber });

    return settings;
  }

  public resetToBase() {
    const baseSettings = this.readJSON<object>(this.baseFile);
    this.writeJSON(this.currentFile, baseSettings);
    this.setMeta({ ...this.getMeta(), currentVersion: 0 });
    return baseSettings;
  }
}

export default SettingsVersionControl;
