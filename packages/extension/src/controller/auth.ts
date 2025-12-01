import * as vscode from "vscode";
import { AuthSession, AuthUser, ServerConfig } from "@shared/types/user";
import { log } from "@shared/utils/debug-logs";
import os from "os";
import { v4 as uuidv4 } from "uuid";
import { SERVER_CONFIG } from "@shared/utils/constants";
import { MessageController } from "./message";

export interface DeviceInfo {
  machineId?: string;
  appName?: string;
  deviceName?: string;
  os?: string;
  extensionVersion?: string;
  ipAddress?: string; // Optional if you want to fetch external IP
}

export class AuthController {
  private static instance?: AuthController;
  private currentUser: AuthUser | null = null;
  private currentSession: AuthSession | null = null;
  private listeners: Array<(user: AuthUser | null) => void> = [];
  private serverConfig: ServerConfig = { ...SERVER_CONFIG };
  private context?: vscode.ExtensionContext;

  private constructor() {}

  public static getInstance(): AuthController {
    if (!AuthController.instance) {
      AuthController.instance = new AuthController();
    }
    return AuthController.instance;
  }

  public setContext(context: vscode.ExtensionContext) {
    this.context = context;
  }

  /** Load stored authentication data from VS Code global state */
  public async getStoredUserAndSession() {
    if (!this.context) {return { storedUser: null, storedSession: null };}
    const storedUser = JSON.parse(
      (await this.context.secrets.get("auth_user")) || "{}"
    ),
     storedSession = JSON.parse(
      (await this.context.secrets.get("auth_session")) || "{}"
    );

    return { storedUser, storedSession };
  }

  public async loadStoredAuth(): Promise<void> {
    const { storedUser, storedSession } = await this.getStoredUserAndSession();
    if (storedUser && storedSession) {
      this.currentUser = storedUser;
      this.currentSession = storedSession;
      ;
    }
  }

  public async clearStoredAuth(): Promise<void> {
    if (!this.context) {return;}
    await this.context.globalState.update("auth_user", undefined);
    await this.context.globalState.update("auth_session", undefined);
    this.currentUser = null;
    this.currentSession = null;
    this.notifyAuthChanged();
  }

  private async storeAuth(user: AuthUser, session: AuthSession): Promise<void> {
    if (!this.context) {return;}
    await this.context.secrets.store("auth_session", JSON.stringify(session));
    await this.context.secrets.store("auth_user", JSON.stringify(user));
    this.currentUser = user;
    this.currentSession = session;
    this.notifyAuthChanged();
  }

  public getCurrentUser(): AuthUser | null {
    return this.currentUser;
  }

  public getCurrentSession(): AuthSession | null {
    return this.currentSession;
  }

  public getServerConfig(): ServerConfig {
    return this.serverConfig;
  }

  public onAuthChanged(listener: (user: AuthUser | null) => void): void {
    this.listeners.push(listener);
  }

  private notifyAuthChanged(): void {
    try {
      this.listeners.forEach((listener) => listener(this.currentUser));
    } catch (error) {
      log("error notifying auth listeners", error);
    }
  }

  /**
   * Starts device flow by requesting device/user codes from the backend
   */
  public async startDeviceFlow() {
    this.currentSession = null;
    this.currentUser = null;
    const deviceInfo = await this.getDeviceInfo(),
     res = await fetch(
      `${SERVER_CONFIG.webappUrl}/api/device-auth/start`,
      {
        method: "POST",
        body: JSON.stringify(deviceInfo),
      }
    );
    if (!res.ok) {throw new Error("Failed to start device flow");}
    const data = (await res.json()) as {
      device_code: string;
      user_code: string;
      verification_uri: string;
      expires_in: number;
    };
    this.pollDeviceApproval(data.device_code, data.expires_in);

    return data;
  }

  /**
   * Poll backend to check if device was approved
   */
  public async pollDeviceApproval(
    deviceCode: string,
    expiresIn: number
  ): Promise<void> {
    const timeoutMs = expiresIn * 1000 + 60000, // ExpiresIn + 1 minute buffer
     intervalMs = 5000, // 5 seconds
     startTime = Date.now(),

     result = await new Promise<{ session: AuthSession; user: AuthUser }>(
      (resolve, reject) => {
        const interval = setInterval(async () => {
          try {
            // Check timeout
            if (Date.now() - startTime > timeoutMs) {
              clearInterval(interval);
              return reject(
                new Error(
                  `Device approval timed out after ${expiresIn} seconds`
                )
              );
            }

            const res = await fetch(
              `${SERVER_CONFIG.webappUrl}/api/device-auth/token`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ deviceCode }),
              }
            );

            if (!res.ok) {
              // Not approved yet, just wait for next interval
              log(
                "device not approved yet, retrying...",
                res.status,
                res.statusText
              );
              return;
            }
            const json = (await res.json()) as {
              authData: {
                user: AuthUser;
                session: AuthSession;
              };
              success: boolean;
              userIs: string;
            },
             {authData} = json;
            log("device approved", authData);

            // Success! Device approved
            clearInterval(interval);

            const {session} = authData,

             {user} = authData;

            resolve({ session, user });
          } catch (err) {
            log("Device not approved yet, retrying...", err);
          }
        }, intervalMs);
      }
    );
    log("approval result", result);
    this.currentSession = result.session;
    this.currentUser = result.user as AuthUser;
    if (!this.currentSession || !this.currentUser)
      {throw new Error("Failed to store auth");}
    await this.storeAuth(this.currentUser, this.currentSession);

    this.notifyAuthChanged();
    
  }

  /**
   * Sign out current user
   */
  public async signOut(): Promise<{ success: boolean }> {
    try {
      await this.clearStoredAuth();
      ;
      return { success: true };
    } catch (error) {
      log(`[AuthController] Sign-out error: ${error}`);
      return { success: false };
    }
  }

  /**
   * Open external URL in user's default browser
   */
  public async openExternalUrl(url: string): Promise<{ success: boolean }> {
    try {
      const opened = await vscode.env.openExternal(vscode.Uri.parse(url));
      return { success: opened };
    } catch (error) {
      log(`[AuthController] Error opening external URL: ${error}`);
      return { success: false };
    }
  }

  /**
   * Update user info locally
   */
  public async updateUser(user: AuthUser): Promise<AuthUser> {
    if (!this.context) {throw new Error("Context not set");}
    if (!this.currentUser) {throw new Error("No authenticated user to update");}
    const updatedUser = { ...this.currentUser, ...user };
    await this.context.globalState.update("auth_user", updatedUser);
    this.currentUser = updatedUser;
    this.notifyAuthChanged();
    return updatedUser;
  }

  async getDeviceInfo(): Promise<DeviceInfo> {
    // Unique machine ID (can be generated once and stored in global state)
    const machineId =
      vscode.workspace
        .getConfiguration("laeyrd")
        .get<string>("deviceMachineId") || uuidv4();

    // Save machineId so it persists
    await vscode.workspace
      .getConfiguration("laeyrd")
      .update("deviceMachineId", machineId, vscode.ConfigurationTarget.Global);

    const deviceInfo: DeviceInfo = {
      machineId,
      appName: vscode.env.appName,
      deviceName: os.hostname(),
      os: `${os.type()} ${os.arch()} ${os.release()}`,
      extensionVersion:
        vscode.extensions.getExtension("your.extension.id")?.packageJSON
          .version || "unknown",
      ipAddress: undefined, // Optionally fetch via external service
    };

    // Optional: fetch public IP if needed
    try {
      const res = await fetch("https://api.ipify.org?format=json"),
       data = (await res.json()) as { ip: string };
      deviceInfo.ipAddress = data.ip;
    } catch (err) {
      console.warn("Failed to fetch public IP", err);
    }
    log("deviceInfo", deviceInfo);
    return deviceInfo;
  }
  async registerEventListeners() {
    if (!this.context) {return;}
    const messageController = new MessageController(this.context);
    this.onAuthChanged((user) =>
      messageController.POST_MESSAGE({
        command: "UPDATE_AUTH_USER",
        payload: user || undefined,
        requestId: "",
        status: "success",
      })
    );
  }

  public dispose(): void {
    this.listeners = [];
    AuthController.instance = undefined;
  }
}
