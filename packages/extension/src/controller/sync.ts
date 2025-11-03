import * as fs from "fs";
import { BackendController } from "./backend";
import { MessageController } from "./message";
import * as vscode from "vscode";
import path from "path";
import { createHash } from "crypto";
import { ThemeController } from "./theme";
import {
  LocalFileMeta,
  LocalVersionFile,
  RemoteFileMeta,
  RemoteVersionStore,
  SyncCategory,
  SyncResponse,
  SyncState,
} from "@shared/types/sync";
import { Theme } from "@shared/types/theme";
import { log } from "@shared/utils/debug-logs";

const SyncActionFactory = {
  [SyncState.UNTRACKED]: async (self: SyncController, meta: LocalFileMeta) => {
    return await self.pushFile(meta, "create");
  },

  [SyncState.LOCAL_AHEAD]: async (
    self: SyncController,
    meta: LocalFileMeta
  ) => {
    return await self.pushFile(meta);
  },

  [SyncState.REMOTE_AHEAD]: async (
    self: SyncController,
    meta: LocalFileMeta,
    remoteMeta: RemoteFileMeta
  ) => {
    return await self.pullFile(meta, remoteMeta);
  },

  [SyncState.CONFLICT]: async () => {
    // 🔥 Manual resolution mode (future: merge UI)
    return {
      success: false,
      reason: "Conflict detected, manual resolution required.",
    };
  },

  [SyncState.UP_TO_DATE]: async () => true,
};

export default class SyncController {
  private localVersionStore: LocalVersionFile;
  private remoteVersionStore?: RemoteVersionStore;

  private _backendController?: BackendController;
  constructor(
    private context: vscode.ExtensionContext,
    private postMessage: MessageController["POST_MESSAGE"],
    private userId: string
  ) {
    this.localVersionStore = this.loadOrCreateLocalVersions();
  }

  private get getUserId() {
    if (!this.userId) throw new Error("User id is missing");
    return this.userId;
  }

  private get backend() {
    if (!this._backendController)
      this._backendController = new BackendController();
    return this._backendController;
  }

  public async fetchRemoteVersions() {
    const remoteData = await this.backend.fetchRemoteVersion();
    if (!remoteData.success) throw new Error(remoteData.error as string);
    this.remoteVersionStore = remoteData.data;
  }

  public loadOrCreateLocalVersions(): LocalVersionFile {
    const filePath = this.getLocalFilePath();
    let localStore: LocalVersionFile = {};
    // Load existing file if exists
    if (fs.existsSync(filePath)) {
      try {
        localStore = JSON.parse(
          fs.readFileSync(filePath, "utf-8")
        ) as LocalVersionFile;
      } catch (err) {
        console.error("Failed to read local versions, creating new one:", err);
        localStore = {};
      }
    }

    // Ensure userId structure exists
    if (!localStore[this.getUserId]) {
      localStore[this.getUserId] = { themes: {}, settings: {} };
    }

    const userThemes = localStore[this.getUserId].themes;

    // Read package.json to get available themes
    const pkgPath = path.join(this.context.extensionPath, "package.json");
    if (fs.existsSync(pkgPath)) {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
      const themeFiles: { label: string; path: string; uiTheme: string }[] =
        pkg.contributes?.themes;
      const filteredThemes = themeFiles.filter(
        (theme) => !theme.label.includes("Live Preview")
      );
      filteredThemes.forEach((theme) => {
        if (!userThemes[theme.label]) {
          // Add missing theme
          const now = new Date().toISOString();
          const localFilePath = this.getLocalFilePath();
          if (!fs.existsSync(path.dirname(localFilePath)))
            fs.mkdirSync(path.dirname(localFilePath), { recursive: true });
          const themePath = path.join(
            this.context.extensionPath,
            "/src/themes",
            theme.label + ".json"
          );
          const fileContent = this.getFileContent(themePath);
          const hash = this.getFileHash(fileContent);
          userThemes[theme.path] = {
            fileName: theme.label,
            createdAt: now,
            updatedAt: now,
            headVersionId: null,
            headVersionHash: null,
            headVersionFilePath: null,
            headVersionCreatedAt: null,
            parentId: null,
            parentHash: null,
            userId: this.getUserId,
            localCommitHash: hash,
            localFilePath: themePath,
            isDirty: false,
            hasConflict: false,
          } as LocalFileMeta;
        }
      });
    }

    // Save updated store
    fs.writeFileSync(filePath, JSON.stringify(localStore, null, 2));
    return localStore;
  }

  private determineSyncState(
    local: LocalFileMeta,
    remote?: RemoteFileMeta
  ): SyncState {
    if (!remote) return SyncState.UNTRACKED;

    const localHash = local.localCommitHash;
    const parentHash = local.parentHash;
    const remoteHash = remote.headVersionHash;

    // No changes
    if (localHash === remoteHash) return SyncState.UP_TO_DATE;

    // Local ahead
    if (parentHash === remoteHash) return SyncState.LOCAL_AHEAD;

    // Remote ahead
    if (localHash === remote.parentHash) return SyncState.REMOTE_AHEAD;

    // Conflict (diverged)
    return SyncState.CONFLICT;
  }

  private getFileHash(content: string) {
    const hash = createHash("sha256").update(content).digest("hex");
    return hash;
  }

  private getFileContent(filePath: string) {
    const fileContent = fs.readFileSync(filePath, "utf-8");

    return fileContent;
  }

  /** 📤 Push file to backend */
  async pushFile(
    localMeta: LocalFileMeta,
    mode: "create" | "update" = "update"
  ): Promise<boolean> {
    try {
      // 1️⃣ Get the file content to upload
      const fileContent = this.getFileContent(localMeta.localFilePath);

      // 2️⃣ Initialize upload session with backend
      const uploadInit = await this.backend.initThemesUpload(
        localMeta,
        fileContent
      );
      if (!uploadInit.success) throw new Error("Failed to initialize upload");

      const signedUrl = uploadInit.data.endpoint.signedUrl;

      // 3️⃣ Upload the file content
      const upload = await this.backend.uploadFile(signedUrl, fileContent);
      if (!upload.success) throw new Error(upload.error);

      // 4️⃣ Push the metadata depending on mode
      const pushResult = await this.handlePushMode(localMeta, mode, signedUrl);
      if (!pushResult) throw new Error("Failed to push file metadata");

      // 5️⃣ Update local metadata to reflect new version state
      this.updateLocalMeta(localMeta, pushResult);

      return true;
    } catch (error) {
      console.error("Push failed:", error);
      return false;
    }
  }

  /**
   * Handle the 'create' or 'update' mode logic in a clean separate function.
   */
  private async handlePushMode(
    localMeta: LocalFileMeta,
    mode: "create" | "update",
    signedUrl: string
  ): Promise<{
    id: number;
    headVersionId: number;
    headVersionCreatedAt: string;
    headVersionFilePath: string;
    headVersionHash: string;
  } | null> {
    if (mode === "create") {
      const res = await this.backend.createFile(localMeta, signedUrl);
      if (!res.success) return null;

      const {
        theme,
        headVersionCreatedAt,
        headVersionFilePath,
        headVersionHash,
        headVersionId,
      } = res.data;

      return {
        id: theme.id,
        headVersionCreatedAt,
        headVersionFilePath,
        headVersionHash,
        headVersionId,
      };
    }

    // "update" mode
    const res = await this.backend.pushFile(localMeta);
    if (!res.success) return null;

    return res.data;
  }

  /**
   * Update local metadata after successful push.
   */
  private updateLocalMeta(
    localMeta: LocalFileMeta,
    pushResult: {
      id: number;
      headVersionId: number;
      headVersionCreatedAt: string;
      headVersionFilePath: string;
      headVersionHash: string;
    }
  ) {
    localMeta.id = pushResult.id;
    localMeta.parentHash = localMeta.localCommitHash;
    localMeta.localCommitHash = pushResult.headVersionHash;
    localMeta.headVersionHash = pushResult.headVersionHash;
    localMeta.headVersionId = pushResult.headVersionId;
    localMeta.isDirty = false;
    localMeta.hasConflict = false;
  }

  /** 📥 Pull file from backend */
  async pullFile(localMeta: LocalFileMeta, remoteMeta: RemoteFileMeta) {
    try {
      if (!remoteMeta.headVersionFilePath) return false;

      const res = await this.backend.downloadFile(remoteMeta);
      if (!res.success) throw new Error("Failed to pull file");
      localMeta.id = remoteMeta.id;
      localMeta.localCommitHash = remoteMeta.headVersionHash!;
      localMeta.parentHash = remoteMeta.parentHash;
      localMeta.isDirty = false;
      localMeta.hasConflict = false;

      const themeController = await ThemeController.create();
      themeController.writeToThemeFile(
        this.context,
        localMeta.fileName,
        res.data as unknown as Theme
      );
      return true;
    } catch (e) {
      console.error("Pull failed:", e);
      return false;
    }
  }
  private getLocalFilePath(): string {
    const storagePath = this.context.globalStorageUri.fsPath;
    if (!fs.existsSync(storagePath))
      fs.mkdirSync(storagePath, { recursive: true });
    return path.join(storagePath, "laeyrd-local-versions.json");
  }

  private saveLocalVersions() {
    fs.writeFileSync(
      this.getLocalFilePath(),
      JSON.stringify(this.localVersionStore, null, 2)
    );
  }
  /** 🔁 Sync a single category (themes/settings) */
  public async syncCategory(category: SyncCategory) {
    const localCategory = this.localVersionStore[this.getUserId]?.[category];
    const remoteCategory = this.remoteVersionStore?.[category];
    if (!localCategory || !remoteCategory)
      throw new Error(`Missing ${category} data for user ${this.getUserId}`);

    const results: SyncResponse[] = [];

    for (const [fileName, localMeta] of Object.entries(localCategory)) {
      const remoteMeta = remoteCategory.find((m) => m.id === localMeta.id);

      const state = this.determineSyncState(localMeta, remoteMeta);
      log(`🧩 Syncing [${fileName}] → state: ${state}`);

      try {
        const action = SyncActionFactory[state];
        if (state === SyncState.REMOTE_AHEAD && !remoteMeta) continue;
        const result = await action(this, localMeta, remoteMeta!);
        const SyncActionState =
          state === SyncState.CONFLICT
            ? "CONFLICT"
            : SyncState.REMOTE_AHEAD
              ? "PULLED"
              : SyncState.UP_TO_DATE
                ? "UP_TO_DATE"
                : "PUSHED";
        results.push({
          fileName,
          fileId: localMeta.id,
          fileType: category,
          remoteFileUrl: remoteMeta?.remoteFileUrl || "",
          success: !!result,
          status: SyncActionState,
          localUpdatedOn: new Date().toISOString(),
          remoteUpdatedOn: new Date().toISOString(),
        });
      } catch (err) {
        results.push({
          fileName,
          fileId: localMeta.id,
          fileType: category,
          remoteFileUrl: remoteMeta?.remoteFileUrl || "",
          success: false,
          status: "ERROR",
          error: (err as Error).message,
          localUpdatedOn: new Date().toISOString(),
          remoteUpdatedOn: new Date().toISOString(),
        });
      }
    }

    this.saveLocalVersions();
    console.log(`✅ ${category} sync summary:`, results);
    return results;
  }

  public async syncAll() {
    console.log("🚀 Starting full sync for all categories...");
    await this.fetchRemoteVersions();

    const categories: SyncCategory[] = ["themes", "settings"];

    const results = await Promise.allSettled(
      categories.map((cat) => this.syncCategory(cat))
    );
    const fulfilled: SyncResponse[] = results
      .filter(
        (r): r is PromiseFulfilledResult<SyncResponse[]> =>
          r.status === "fulfilled"
      )
      .flatMap((r) => r.value);

    console.log("🎯 Final sync summary:", results);
    return { success: true, data: fulfilled };
  }
}
