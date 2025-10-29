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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const vscode = __importStar(require("vscode"));
const debug_logs_1 = require("../../lib/debug-logs");
const constants_1 = require("../lib/constants");
const os_1 = __importDefault(require("os"));
const uuid_1 = require("uuid");
class AuthController {
    constructor() {
        this.currentUser = null;
        this.currentSession = null;
        this.listeners = [];
        this.serverConfig = { ...constants_1.SERVER_CONFIG };
    }
    static getInstance() {
        if (!AuthController.instance) {
            AuthController.instance = new AuthController();
        }
        return AuthController.instance;
    }
    setContext(context) {
        this.context = context;
    }
    /** Load stored authentication data from VS Code global state */
    async getStoredUserAndSession() {
        if (!this.context)
            return { storedUser: null, storedSession: null };
        const storedUser = JSON.parse((await this.context.secrets.get("auth_user")) || "{}");
        const storedSession = JSON.parse((await this.context.secrets.get("auth_session")) || "{}");
        return { storedUser, storedSession };
    }
    async loadStoredAuth() {
        const { storedUser, storedSession } = await this.getStoredUserAndSession();
        if (storedUser && storedSession) {
            this.currentUser = storedUser;
            this.currentSession = storedSession;
            (0, debug_logs_1.log)("[AuthController] Restored authentication session");
        }
    }
    async clearStoredAuth() {
        if (!this.context)
            return;
        await this.context.globalState.update("auth_user", undefined);
        await this.context.globalState.update("auth_session", undefined);
        this.currentUser = null;
        this.currentSession = null;
        this.notifyAuthChanged();
    }
    async storeAuth(user, session) {
        if (!this.context)
            return;
        await this.context.secrets.store("auth_session", JSON.stringify(session));
        await this.context.secrets.store("auth_user", JSON.stringify(user));
        this.currentUser = user;
        this.currentSession = session;
        this.notifyAuthChanged();
    }
    getCurrentUser() {
        return this.currentUser;
    }
    getCurrentSession() {
        return this.currentSession;
    }
    getServerConfig() {
        return this.serverConfig;
    }
    onAuthChanged(listener) {
        this.listeners.push(listener);
    }
    notifyAuthChanged() {
        try {
            this.listeners.forEach((listener) => listener(this.currentUser));
        }
        catch (error) {
            (0, debug_logs_1.log)("error notifying auth listeners", error);
        }
    }
    /**
     * Starts device flow by requesting device/user codes from the backend
     */
    async startDeviceFlow() {
        this.currentSession = null;
        this.currentUser = null;
        const deviceInfo = await this.getDeviceInfo();
        const res = await fetch(`${constants_1.SERVER_CONFIG.webappUrl}/api/device-auth/start`, {
            method: "POST",
            body: JSON.stringify(deviceInfo),
        });
        if (!res.ok)
            throw new Error("Failed to start device flow");
        const data = (await res.json());
        this.pollDeviceApproval(data.device_code, data.expires_in);
        return data;
    }
    /**
     * Poll backend to check if device was approved
     */
    async pollDeviceApproval(deviceCode, expiresIn) {
        const timeoutMs = expiresIn * 1000 + 60000; // expiresIn + 1 minute buffer
        const intervalMs = 5000; // 5 seconds
        const startTime = Date.now();
        const result = await new Promise((resolve, reject) => {
            const interval = setInterval(async () => {
                try {
                    // Check timeout
                    if (Date.now() - startTime > timeoutMs) {
                        clearInterval(interval);
                        return reject(new Error(`Device approval timed out after ${expiresIn} seconds`));
                    }
                    const res = await fetch(`${constants_1.SERVER_CONFIG.webappUrl}/api/device-auth/token`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ deviceCode }),
                    });
                    if (!res.ok) {
                        // Not approved yet, just wait for next interval
                        (0, debug_logs_1.log)("device not approved yet, retrying...", res.status, res.statusText);
                        return;
                    }
                    const json = (await res.json());
                    const authData = json.authData;
                    (0, debug_logs_1.log)("device approved", authData);
                    // Success! Device approved
                    clearInterval(interval);
                    const session = authData.session;
                    const user = authData.user;
                    resolve({ session, user });
                }
                catch (err) {
                    console.log("Device not approved yet, retrying...", err);
                }
            }, intervalMs);
        });
        (0, debug_logs_1.log)("approval result", result);
        this.currentSession = result.session;
        this.currentUser = result.user;
        if (!this.currentSession || !this.currentUser)
            throw new Error("Failed to store auth");
        await this.storeAuth(this.currentUser, this.currentSession);
        this.notifyAuthChanged();
        return;
    }
    /**
     * Sign out current user
     */
    async signOut() {
        try {
            await this.clearStoredAuth();
            (0, debug_logs_1.log)("[AuthController] User signed out successfully");
            return { success: true };
        }
        catch (error) {
            (0, debug_logs_1.log)(`[AuthController] Sign-out error: ${error}`);
            return { success: false };
        }
    }
    /**
     * Open external URL in user's default browser
     */
    async openExternalUrl(url) {
        try {
            const opened = await vscode.env.openExternal(vscode.Uri.parse(url));
            return { success: opened };
        }
        catch (error) {
            (0, debug_logs_1.log)(`[AuthController] Error opening external URL: ${error}`);
            return { success: false };
        }
    }
    /**
     * Update user info locally
     */
    async updateUser(user) {
        if (!this.context)
            throw new Error("Context not set");
        if (!this.currentUser)
            throw new Error("No authenticated user to update");
        const updatedUser = { ...this.currentUser, ...user };
        await this.context.globalState.update("auth_user", updatedUser);
        this.currentUser = updatedUser;
        this.notifyAuthChanged();
        return updatedUser;
    }
    async getDeviceInfo() {
        // Unique machine ID (can be generated once and stored in global state)
        let machineId = vscode.workspace
            .getConfiguration("laeyrd")
            .get("deviceMachineId") || (0, uuid_1.v4)();
        // Save machineId so it persists
        await vscode.workspace
            .getConfiguration("laeyrd")
            .update("deviceMachineId", machineId, vscode.ConfigurationTarget.Global);
        const deviceInfo = {
            machineId,
            appName: vscode.env.appName,
            deviceName: os_1.default.hostname(),
            os: `${os_1.default.type()} ${os_1.default.arch()} ${os_1.default.release()}`,
            extensionVersion: vscode.extensions.getExtension("your.extension.id")?.packageJSON
                .version || "unknown",
            ipAddress: undefined, // optionally fetch via external service
        };
        // Optional: fetch public IP if needed
        try {
            const res = await fetch("https://api.ipify.org?format=json");
            const data = await res.json();
            deviceInfo.ipAddress = data.ip;
        }
        catch (err) {
            console.warn("Failed to fetch public IP", err);
        }
        (0, debug_logs_1.log)("deviceInfo", deviceInfo);
        return deviceInfo;
    }
    dispose() {
        this.listeners = [];
        AuthController.instance = undefined;
    }
}
exports.AuthController = AuthController;
