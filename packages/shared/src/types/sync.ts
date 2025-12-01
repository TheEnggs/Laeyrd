import { ThemeSchema } from "./db";
export type SupportedSyncFileTypes = "themes" | "settings";

export type RemoteVersionStore = Record<SupportedSyncFileTypes, RemoteFileMeta[]>

export type LocalVersionFile = {
  [userId: string]: Record<SupportedSyncFileTypes, Record<string, LocalFileMeta>>;
};

type BaseFileMeta = {
  fileName: string;
  createdAt: string;
  updatedAt: string;
  headVersionId: number | null;
  headVersionHash: string | null;
  headVersionFilePath: string | null;
  headVersionCreatedAt: string | null;
  parentId: number | null;
  parentHash: string | null;
  userId: string;
};

export type RemoteFileMeta = BaseFileMeta & {
  id: number;
  remoteFileUrl: string;
  deviceId?: string; // Optional, last updater device
};

export type LocalFileMeta = BaseFileMeta & {
  id?: number;
  localCommitHash: string;
  localFilePath: string; // Path on local machine
  isDirty: boolean;
  hasConflict: boolean;
};

export type CreateTheme = {
  theme: ThemeSchema;
  headVersionId: number;
  headVersionCreatedAt: string;
  headVersionFilePath: string;
  headVersionHash: string;
};

export type PushResponse = {
  id: number;
  headVersionId: number;
  headVersionCreatedAt: string;
  headVersionFilePath: string;
  headVersionHash: string;
};

export type SyncCategory = SupportedSyncFileTypes;

export type SyncResponse = {
  fileName: string;
  fileId: number;
  fileType: SyncCategory;
  success: boolean;
  status: SyncResponseStatus;
  fileContent?: string;
  remoteFileContent?: string;
  localUpdatedOn: string;
  remoteFileUrl?: string;
  remoteUpdatedOn?: string;
  error?: string;
  resolved: -1 | 0 | 1;
  resolvedError?: string;
};

export enum SyncState {
  UP_TO_DATE = "UP_TO_DATE",
  LOCAL_AHEAD = "LOCAL_AHEAD",
  REMOTE_AHEAD = "REMOTE_AHEAD",
  CONFLICT = "CONFLICT",
  UNTRACKED = "UNTRACKED",
}

export type SyncResponseStatus =
  | "PUSHED"
  | "PULLED"
  | "CONFLICT"
  | "UP_TO_DATE"
  | "ERROR";

export type ConflictResolvePayload = {
  fileId: number;
  keepState: "local" | "remote";
}[]
export type ConflictResolvedResponse = {
  fileId: number;
  fileType: SupportedSyncFileTypes;
  success: boolean;
  error?: string;

}[]
