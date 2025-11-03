import { ThemeSchema } from "./db";

export type RemoteVersionStore = {
  themes: RemoteFileMeta[];
  settings: RemoteFileMeta[];
};

export type LocalVersionFile = {
  [userId: string]: {
    themes: Record<string, LocalFileMeta>;
    settings: Record<string, LocalFileMeta>;
  };
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
  deviceId?: string; // optional, last updater device
};

export type LocalFileMeta = BaseFileMeta & {
  id?: number;
  localCommitHash: string;
  localFilePath: string; // path on local machine
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

export type SyncCategory = keyof LocalVersionFile[string];

export type SyncResponse = {
  fileName: string;
  fileId?: number;
  fileType: SyncCategory;
  success: boolean;
  status: SyncResponseStatus;
  fileContent?: string;
  remoteFileContent?: string;
  localUpdatedOn: string;
  remoteFileUrl?: string;
  remoteUpdatedOn?: string;
  error?: string;
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
