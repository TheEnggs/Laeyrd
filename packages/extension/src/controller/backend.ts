import { log } from "@shared/utils/debug-logs";
import { SERVER_CONFIG } from "@shared/utils/constants";
import { AuthController } from "./auth";
import {
  CreateTheme,
  LocalFileMeta,
  PushResponse,
  RemoteFileMeta,
} from "@shared/types/sync";
import path from "path";
import fs from "node:fs";

type ApiResponse<T> =
  | { success: true; data: T; responseType: "text" | "json" | "arraybuffer" }
  | { success: false; error: unknown };

export class BackendController {
  private baseUrl: string = SERVER_CONFIG.baseUrl;

  /** ---------- Generic Request ---------- **/
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const token = await this.getUserToken();
      if (!token) {throw new Error("No auth token available");}

      const url = `${this.baseUrl}${endpoint}`;
      log("Requesting", url);

      const res = await fetch(url, {
        ...options,
        headers: {
          ...(options.headers || {}),
          Authorization: `Bearer ${token}`,
          // Only set JSON content type when body exists and is a string
          ...(options.body && typeof options.body === "string"
            ? { "Content-Type": "application/json" }
            : {}),
        },
      });

      if (!res.ok) {
        let errorBody: string | object;
        try {
          errorBody = res.headers
            .get("content-type")
            ?.includes("application/json")
            ? ((await res.json()) as object)
            : ((await res.text()) as string);
        } catch {
          errorBody = `Request failed: ${res.status}`;
        }
        throw new Error(JSON.stringify(errorBody));
      }

      // ✅ Auto-detect content type for correct parsing
      const contentType = res.headers.get("content-type") || "",
       responseType = contentType.includes("application/json")
        ? "json"
        : contentType.includes("text/")
          ? "text"
          : "arraybuffer";

      let data: any;
      if (responseType === "json") {
        data = await res.json();
      } else if (responseType === "text") {
        data = await res.text();
      } else {
        data = await res.arrayBuffer(); // For binary responses
      }

      return { success: true, data: data as T, responseType };
    } catch (error) {
      log("BackendController request error:", JSON.stringify(error, null, 2));
      return { success: false, error };
    }
  }

  /** ---------- TOKEN / AUTH ---------- **/
  async getUserToken(): Promise<string | null> {
    const session = AuthController.getInstance().getCurrentSession();
    if (!session) {return null;}
    log("Sessionid", session.id);

    const res = await fetch(`${SERVER_CONFIG.webappUrl}/api/refresh-token`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${session.id}`,
      },
    });

    if (!res.ok) {return null;}

    const data = (await res.json()) as { token: string; sessionId: string };
    if (data.sessionId !== session.id) {return null;}
    return data.token || null;
  }

  /** ---------- SYNC OPERATIONS ---------- **/

  // Fetch remote version metadata for themes/settings
  async fetchRemoteVersion(): Promise<
    ApiResponse<{
      themes: RemoteFileMeta[];
      settings: RemoteFileMeta[];
    }>
  > {
    return this.request<{
      themes: RemoteFileMeta[];
      settings: RemoteFileMeta[];
    }>("/uac/remote-version", {
      method: "GET",
    });
  }

  // Pull a single remote file (theme or settings)
  async pullFile(remoteMeta: RemoteFileMeta): Promise<ApiResponse<string>> {
    if (!remoteMeta.remoteFileUrl) {
      return { success: false, error: "Remote file path missing" };
    }

    // Optionally, you can use initUpload here if needed before pull
    return this.request<string>(remoteMeta.remoteFileUrl, { method: "GET" });
  }

  async initThemesUpload(localMeta: LocalFileMeta, content: string) {
    const obj = content,
     blob = new Blob([obj], {
      type: "application/json",
    }),
     file = new File([blob], "data.json", { type: "application/json" });
    return this.request<{
      endpoint: { expire: number; signedUrl: string; fileId: string };
    }>(`/uac/themes/initUpload`, {
      method: "POST",
      body: JSON.stringify({
        fileName: localMeta.fileName,
        size: file.size,
        mimeType: "application/json",
        checksum: localMeta.localCommitHash,
      }),
    });
  }

  async uploadFile(endpoint: string, content: string) {
    try {
      const obj = content,
       blob = new Blob([obj], {
        type: "application/json",
      }),
       file = new File([blob], "data.json", { type: "application/json" });
      log("file", file);
      const uploadRes = await fetch(endpoint, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: file,
      });

      if (!uploadRes.ok) {
        // Read response body for error details from S3
        const errorText = await uploadRes.text();
        return {
          success: false,
          error: `Upload failed with status ${uploadRes.status}: ${errorText}`,
        };
      }

      return { success: true };
    } catch (e) {
      log("uploadFile error", e);
      return {
        success: false,
        error: e instanceof Error ? e.message : String(e),
      };
    }
  }

  // Create a single local file to backend
  async createFile(localMeta: LocalFileMeta, uploadedUrl: string) {
    return this.request<CreateTheme>(`/uac/themes`, {
      method: "POST",
      body: JSON.stringify({
        name: localMeta.fileName,
        fileUrl: uploadedUrl,
        checksum: localMeta,
      }),
    });
  }
  // Push a single local file to backend
  async pushFile(localMeta: LocalFileMeta) {
    return this.request<PushResponse>(`/uac/push/${localMeta.id}`, {
      method: "POST",
      body: JSON.stringify({
        parentHash: localMeta.localCommitHash,
        filePath: localMeta.localFilePath,
        checksum: localMeta.localCommitHash,
      }),
    });
  }

  async downloadFile(
    remoteMeta: RemoteFileMeta,
    localPath?: string
  ): Promise<ApiResponse<string>> {
    try {
      if (!remoteMeta.remoteFileUrl) {
        throw new Error("Remote file path missing");
      }

      // 1️⃣ Make request to download raw content
      const token = await this.getUserToken();
      if (!token) {throw new Error("No auth token available");}

      const url = `${this.baseUrl}${remoteMeta.remoteFileUrl}`;
      log("Downloading", url);

      const res = await this.request<string>(url, {
        method: "GET",
      });
      if (!res.success) {throw new Error("Failed to download file");}
      // 3️⃣ If a local path is provided, save it to disk
      if (localPath) {
        const dir = path.dirname(localPath);
        if (!fs.existsSync(dir)) {fs.mkdirSync(dir, { recursive: true });}

        // For binary content, write as base64-decoded buffer
        if (res.responseType === "text") {
          fs.writeFileSync(localPath, res.data, "utf-8");
        } else if (res.responseType === "arraybuffer") {
          const buffer = Buffer.from(res.data, "base64");
          fs.writeFileSync(localPath, buffer);
        } else {
          throw new Error("Invalid response type");
        }

        log(`File saved to ${localPath}`);
      }
      return res;
    } catch (error) {
      log(
        "BackendController downloadFile error:",
        JSON.stringify(error, null, 2)
      );
      return { success: false, error };
    }
  }

  // Check remote vs local status (like git status)
  async checkFileStatus(localMeta: LocalFileMeta): Promise<
    ApiResponse<{
      status: "up_to_date" | "conflict" | "update_required";
      remoteFileUrl: string;
      dbHeadHash?: string;
      dbHeadVersionId?: number;
    }>
  > {
    if (!localMeta.id) {return { success: false, error: "File id is missing" };}
    return this.request<{
      status: "up_to_date" | "conflict" | "update_required";
      remoteFileUrl: string;
      dbHeadHash?: string;
      dbHeadVersionId?: number;
    }>(`/uac/status/${localMeta.id}`, {
      method: "POST",
      body: JSON.stringify({
        NewFileChecksum: localMeta.localCommitHash,
        parentHash: localMeta.parentHash,
      }),
    });
  }
}
