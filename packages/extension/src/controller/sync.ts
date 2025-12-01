import * as fs from "fs";
import { BackendController } from "./backend";
import * as vscode from "vscode";
import path from "path";
import { createHash } from "crypto";
import { ThemeController } from "./theme";
import {
  ConflictResolvePayload,
  ConflictResolvedResponse,
  LocalFileMeta,
  LocalVersionFile,
  RemoteFileMeta,
  RemoteVersionStore,
  SupportedSyncFileTypes,
  SyncCategory,
  SyncResponse,
  SyncState,
} from "@shared/types/sync";
import { log } from "@shared/utils/debug-logs";
import { ThemeJson } from "@shared/types/theme";

const SyncActionFactory = {
  [SyncState.UNTRACKED]: async (self: SyncController, meta: LocalFileMeta) => await self.pushFile(meta, "create"),

  [SyncState.LOCAL_AHEAD]: async (
    self: SyncController,
    meta: LocalFileMeta
  ) => await self.pushFile(meta),

  [SyncState.REMOTE_AHEAD]: async (
    self: SyncController,
    meta: LocalFileMeta,
    remoteMeta: RemoteFileMeta
  ) => await self.pullFile(meta, remoteMeta),

  [SyncState.CONFLICT]: async () => 
    // 🔥 Manual resolution mode (future: merge UI)
     ({
      success: false,
      reason: "Conflict detected, manual resolution required.",
    })
  ,

  [SyncState.UP_TO_DATE]: async () => true,
};

export default class SyncController {
  private localVersionStore: LocalVersionFile;
  private remoteVersionStore?: RemoteVersionStore;

  private _backendController?: BackendController;

  constructor(
    private context: vscode.ExtensionContext,
    private userId: string
  ) {
    this.localVersionStore = this.loadOrCreateLocalVersions();
  }

  private get getUserId() {
    if (!this.userId) {throw new Error("User id is missing");}
    return this.userId;
  }

  private get backend() {
    if (!this._backendController)
      {this._backendController = new BackendController();}
    return this._backendController;
  }

  public async fetchRemoteVersions() {
    const remoteData = await this.backend.fetchRemoteVersion();
    if (!remoteData.success) {throw new Error(remoteData.error as string);}
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

    const userThemes = localStore[this.getUserId].themes,

    // Read package.json to get available themes
     pkgPath = path.join(this.context.extensionPath, "package.json");
    if (fs.existsSync(pkgPath)) {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8")),
       themeFiles: { label: string; path: string; uiTheme: string }[] =
        pkg.contributes?.themes,
       filteredThemes = themeFiles.filter(
        (theme) => !theme.label.includes("Live Preview")
      );
      filteredThemes.forEach((theme) => {
        if (!userThemes[theme.label]) {
          // Add missing theme
          const now = new Date().toISOString(),
           localFilePath = this.getLocalFilePath();
          if (!fs.existsSync(path.dirname(localFilePath)))
            {fs.mkdirSync(path.dirname(localFilePath), { recursive: true });}
          const themePath = path.join(
            this.context.extensionPath,
            "/src/themes",
            `${theme.label  }.json`
          ),
           fileContent = this.getFileContent(themePath),
           hash = this.getFileHash(fileContent);
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
    if (!remote) {return SyncState.UNTRACKED;}

    const localHash = local.localCommitHash,
     {parentHash} = local,
     remoteHash = remote.headVersionHash;

    // No changes
    if (localHash === remoteHash) {return SyncState.UP_TO_DATE;}

    // Local ahead
    if (parentHash === remoteHash) {return SyncState.LOCAL_AHEAD;}

    // Remote ahead
    if (localHash === remote.parentHash) {return SyncState.REMOTE_AHEAD;}

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
      const fileContent = this.getFileContent(localMeta.localFilePath),

      // 2️⃣ Initialize upload session with backend
       uploadInit = await this.backend.initThemesUpload(
        localMeta,
        fileContent
      );
      if (!uploadInit.success) {throw new Error("Failed to initialize upload");}

      const {signedUrl} = uploadInit.data.endpoint,

      // 3️⃣ Upload the file content
       upload = await this.backend.uploadFile(signedUrl, fileContent);
      if (!upload.success) {throw new Error(upload.error);}

      // 4️⃣ Push the metadata depending on mode
      const pushResult = await this.handlePushMode(localMeta, mode, signedUrl);
      if (!pushResult) {throw new Error("Failed to push file metadata");}

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
      if (!res.success) {return null;}

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
    if (!res.success) {return null;}

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
      if (!remoteMeta.headVersionFilePath) {return false;}

      const res = await this.backend.downloadFile(remoteMeta);
      if (!res.success) {throw new Error("Failed to pull file");}
      localMeta.id = remoteMeta.id;
      localMeta.localCommitHash = remoteMeta.headVersionHash!;
      localMeta.parentHash = remoteMeta.parentHash;
      localMeta.isDirty = false;
      localMeta.hasConflict = false;

      const themeController = await ThemeController.getInstance(this.context);
      themeController.writeToThemeFile(
        localMeta.fileName,
        res.data as unknown as ThemeJson
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
      {fs.mkdirSync(storagePath, { recursive: true });}
    return path.join(storagePath, "laeyrd-local-versions.json");
  }

  private saveLocalVersions() {
    fs.writeFileSync(
      this.getLocalFilePath(),
      JSON.stringify(this.localVersionStore, null, 2)
    );
  }
  public async handleConflictResolve(
    payload: ConflictResolvePayload
  ): Promise<ConflictResolvedResponse> {
    await this.fetchRemoteVersions();
    if (!this.remoteVersionStore)
      {throw new Error("Failed to get remote versions");}

    const keepLocalFiles = payload.filter((f) => f.keepState === "local"),
     keepRemoteFiles = payload.filter((f) => f.keepState === "remote"),

     results: ConflictResolvedResponse = [],

    // Helper: upload local file to remote bucket
     uploadLocalFile = async (
      fileId: number,
      type: SupportedSyncFileTypes
    ) => {
      try {
        const localMeta = Object.values(
          this.localVersionStore[this.userId][type]
        ).find((e) => e.id === fileId);
        if (!localMeta)
          {return results.push({
            fileId,
            fileType: type,
            success: false,
            error: `Local ${type} metadata not found.`,
          });}

        const pushResult = await this.pushFile(localMeta, "update");
        if (pushResult) {results.push({ fileId, fileType: type, success: true });}
        else
          {results.push({
            fileId,
            fileType: type,
            success: false,
            error: `Failed to upload ${type}.`,
          });}
      } catch (err: any) {
        results.push({
          fileId,
          fileType: type,
          success: false,
          error: err.message,
        });
      }
    },

    // Helper: download remote file and replace local
     downloadRemoteFile = async (
      fileId: number,
      type: SupportedSyncFileTypes
    ) => {
      try {
        if (!this.remoteVersionStore) {throw new Error("error");}
        const remoteMeta = this.remoteVersionStore[type].find(
          (f) => f.id === fileId
        );
        if (!remoteMeta || !remoteMeta.remoteFileUrl)
          {return results.push({
            fileId,
            fileType: type,
            success: false,
            error: `Remote ${type} metadata or download URL missing.`,
          });}

        const response = await fetch(remoteMeta.remoteFileUrl);
        if (!response.ok)
          {throw new Error(
            `Failed to fetch remote ${type} file (${response.status})`
          );}

        const fileContent = await response.text(),
         filePath = this.context.globalStorageUri.with({
          path: `${this.context.globalStorageUri.path}/${type}/${fileId}.json`,
        });

        await vscode.workspace.fs.writeFile(
          filePath,
          Buffer.from(fileContent, "utf-8")
        );

        const userStore = this.localVersionStore[this.userId],
         target = Object.values(userStore[type]).find(
          (e) => e.id === fileId
        );
        if (target) {
          target.isDirty = false;
          target.updatedAt = new Date().toISOString();
        }

        results.push({ fileId, fileType: type, success: true });
      } catch (err: any) {
        results.push({
          fileId,
          fileType: type,
          success: false,
          error: err.message,
        });
      }
    };

    // Upload all local-chosen files (themes + settings)
    if (keepLocalFiles.length > 0) {
      const uploadPromises = keepLocalFiles.flatMap((f) => [
        uploadLocalFile(f.fileId, "themes"),
        uploadLocalFile(f.fileId, "settings"),
      ]);
      await Promise.allSettled(uploadPromises);
    }

    // Download all remote-chosen files (themes + settings)
    if (keepRemoteFiles.length > 0) {
      const downloadPromises = keepRemoteFiles.flatMap((f) => [
        downloadRemoteFile(f.fileId, "themes"),
        downloadRemoteFile(f.fileId, "settings"),
      ]);
      await Promise.allSettled(downloadPromises);
    }

    // Clean up timestamps and flags
    const userStore = this.localVersionStore[this.userId],
     now = new Date().toISOString();

    results
      .filter((r) => r.success)
      .forEach(({ fileId, fileType }) => {
        const item = userStore[fileType]?.[fileId];
        if (item) {
          item.isDirty = false;
          item.updatedAt = now;
        }
      });

    return results;
  }
  private getLatestLocalMeta(fileName: string, type: SupportedSyncFileTypes) {
    const localMeta = this.localVersionStore[this.userId][type][fileName];
    return localMeta;
  }
  /** 🔁 Sync a single category (themes/settings) */
  public async syncCategory(category: SyncCategory) {
    const localCategory = this.localVersionStore[this.getUserId]?.[category],
     remoteCategory = this.remoteVersionStore?.[category];
    if (!localCategory || !remoteCategory)
      {throw new Error(`Missing ${category} data for user ${this.getUserId}`);}

    const results: SyncResponse[] = [];

    for (const [fileName, localMeta] of Object.entries(localCategory)) {
      const remoteMeta = remoteCategory.find((m) => m.id === localMeta.id),

       state = this.determineSyncState(localMeta, remoteMeta);
      log(`🧩 Syncing [${fileName}] → state: ${state}`);

      try {
        const action = SyncActionFactory[state];
        if (state === SyncState.REMOTE_AHEAD && !remoteMeta) {continue;}
        const result = await action(this, localMeta, remoteMeta!),
         SyncActionState =
          state === SyncState.CONFLICT
            ? "CONFLICT"
            : SyncState.REMOTE_AHEAD
              ? "PULLED"
              : SyncState.UP_TO_DATE
                ? "UP_TO_DATE"
                : "PUSHED",
         latestLocalMeta = this.getLatestLocalMeta(
          localMeta.fileName,
          category
        );
        results.push({
          fileName,
          fileId: latestLocalMeta.id!,
          fileType: category,
          remoteFileUrl: remoteMeta?.remoteFileUrl || "",
          success: Boolean(result),
          status: SyncActionState,
          localUpdatedOn: new Date().toISOString(),
          remoteUpdatedOn: new Date().toISOString(),
          resolved: -1,
        });
      } catch (err) {
        const latestLocalMeta = this.getLatestLocalMeta(
          localMeta.fileName,
          category
        );
        results.push({
          fileName,
          fileId: latestLocalMeta.id!,
          fileType: category,
          remoteFileUrl: remoteMeta?.remoteFileUrl || "",
          success: false,
          status: "ERROR",
          error: (err as Error).message,
          localUpdatedOn: new Date().toISOString(),
          remoteUpdatedOn: new Date().toISOString(),
          resolved: -1,
        });
      }
    }

    this.saveLocalVersions();
    log(`✅ ${category} sync summary:`, results);
    return results;
  }

  public async syncAll() {
    await this.fetchRemoteVersions();

    const categories: SyncCategory[] = ["themes", "settings"],

     results = await Promise.allSettled(
      categories.map((cat) => this.syncCategory(cat))
    ),
     fulfilled: SyncResponse[] = results
      .filter(
        (r): r is PromiseFulfilledResult<SyncResponse[]> =>
          r.status === "fulfilled"
      )
      .flatMap((r) => r.value);

    log("🎯 Final sync summary:", results);
    return { success: true, data: fulfilled };
  }
}
