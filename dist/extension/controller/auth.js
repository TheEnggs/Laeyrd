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
exports.AuthController = void 0;
const vscode = __importStar(require("vscode"));
const debug_logs_1 = require("../../lib/debug-logs");
const auth_server_1 = require("../lib/auth-server");
class AuthController {
    constructor(context) {
        this.currentUser = null;
        this.currentSession = null;
        this.listeners = [];
        this.authServer = null;
        // Server configuration - webapp URL for authentication
        this.serverConfig = {
            baseUrl: "https://api.theme-your-code.com",
            githubUrl: "https://github.com/your-org/theme-your-code-server",
            privacyPolicyUrl: "https://theme-your-code.com/privacy",
            termsOfServiceUrl: "https://theme-your-code.com/terms",
            clerkPublishableKey: "", // No longer needed
            webappUrl: "http://localhost:3000", // Your webapp URL
        };
        this.context = context;
        this.loadStoredAuth();
    }
    static getInstance(context) {
        if (!AuthController.instance) {
            AuthController.instance = new AuthController(context);
        }
        return AuthController.instance;
    }
    /**
     * Load stored authentication data from VS Code's global state
     */
    async loadStoredAuth() {
        try {
            const storedUser = this.context.globalState.get("auth_user");
            const storedSession = this.context.globalState.get("auth_session");
            if (storedUser && storedSession) {
                // Validate session is still active
                const now = new Date();
                const expireAt = new Date(storedSession.expireAt);
                if (expireAt > now && storedSession.status === "active") {
                    this.currentUser = storedUser;
                    this.currentSession = storedSession;
                    (0, debug_logs_1.log)("[AuthController] Restored valid authentication session");
                }
                else {
                    // Session expired, clear stored data
                    await this.clearStoredAuth();
                    (0, debug_logs_1.log)("[AuthController] Cleared expired authentication session");
                }
            }
        }
        catch (error) {
            (0, debug_logs_1.log)(`[AuthController] Error loading stored auth: ${error}`);
            await this.clearStoredAuth();
        }
    }
    /**
     * Clear stored authentication data
     */
    async clearStoredAuth() {
        await this.context.globalState.update("auth_user", undefined);
        await this.context.globalState.update("auth_session", undefined);
        this.currentUser = null;
        this.currentSession = null;
    }
    /**
     * Store authentication data securely
     */
    async storeAuth(user, session) {
        await this.context.globalState.update("auth_user", user);
        await this.context.globalState.update("auth_session", session);
        this.currentUser = user;
        this.currentSession = session;
        this.notifyAuthChanged();
    }
    /**
     * Get current authenticated user
     */
    getCurrentUser() {
        return this.currentUser;
    }
    /**
     * Get current session
     */
    getCurrentSession() {
        return this.currentSession;
    }
    /**
     * Get server configuration including Clerk settings
     */
    getServerConfig() {
        return this.serverConfig;
    }
    /**
     * Register auth state change listener
     */
    onAuthChanged(listener) {
        this.listeners.push(listener);
    }
    /**
     * Notify all listeners of auth state change
     */
    notifyAuthChanged() {
        this.listeners.forEach((listener) => listener(this.currentUser));
    }
    /**
     * Handle sign-in process - opens webapp for authentication
     */
    async signIn(returnUrl) {
        try {
            if (!this.authServer) {
                this.authServer = new auth_server_1.AuthServer();
                await this.authServer.start();
                // Set up the auth callback
                this.authServer.setAuthCallback(async (authData) => {
                    await this.handleAuthCallback(authData);
                });
            }
            const signInUrl = this.buildWebappSignInUrl();
            // Open webapp in external browser for authentication
            const opened = await vscode.env.openExternal(vscode.Uri.parse(signInUrl));
            if (opened) {
                (0, debug_logs_1.log)("[AuthController] Opened webapp sign-in URL in external browser");
                return { success: true, redirectUrl: signInUrl };
            }
            else {
                return { success: false };
            }
        }
        catch (error) {
            (0, debug_logs_1.log)(`[AuthController] Sign-in error: ${error}`);
            return { success: false };
        }
    }
    /**
     * Handle sign-out process
     */
    async signOut() {
        try {
            // If we have a current session, invalidate it on the server
            if (this.currentSession) {
                await this.invalidateServerSession();
            }
            // Clear local auth data
            await this.clearStoredAuth();
            this.notifyAuthChanged();
            (0, debug_logs_1.log)("[AuthController] User signed out successfully");
            return { success: true };
        }
        catch (error) {
            (0, debug_logs_1.log)(`[AuthController] Sign-out error: ${error}`);
            return { success: false };
        }
    }
    /**
     * Build webapp sign-in URL with return parameters
     */
    buildWebappSignInUrl() {
        const baseUrl = `${this.serverConfig.webappUrl}/sign-in`;
        const params = new URLSearchParams();
        if (!this.authServer) {
            throw new Error("Auth server not initialized");
        }
        const callbackUrl = this.authServer.getCallbackUrl();
        const appName = vscode.env.appName;
        // Add return URL for post-auth redirect
        params.append("callback_url", callbackUrl);
        // Add VS Code integration flag
        params.append("integration", "extension");
        params.append("app", appName);
        return `${baseUrl}?${params.toString()}`;
    }
    /**
     * Invalidate server session
     */
    async invalidateServerSession() {
        try {
            if (!this.currentSession)
                return;
            // TODO: Implement actual server session invalidation
            // const response = await fetch(`${this.serverConfig.baseUrl}/auth/invalidate`, {
            //   method: 'POST',
            //   headers: {
            //     'Content-Type': 'application/json',
            //     'Authorization': `Bearer ${this.currentSession.id}`,
            //   },
            // });
            (0, debug_logs_1.log)("[AuthController] Server session invalidated");
        }
        catch (error) {
            (0, debug_logs_1.log)(`[AuthController] Error invalidating server session: ${error}`);
        }
    }
    /**
     * Update user information (called when user data changes)
     */
    async updateUser(user) {
        try {
            if (this.currentUser) {
                const updatedUser = { ...this.currentUser, ...user };
                await this.context.globalState.update("auth_user", updatedUser);
                this.currentUser = updatedUser;
                this.notifyAuthChanged();
                return updatedUser;
            }
            throw new Error("No authenticated user to update");
        }
        catch (error) {
            (0, debug_logs_1.log)(`[AuthController] Error updating user: ${error}`);
            throw error;
        }
    }
    /**
     * Open external URL (helper for opening links in browser)
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
     * Handle authentication callback from webapp
     * This is called when the user completes authentication in the webapp
     */
    async handleAuthCallback(authData) {
        try {
            await this.storeAuth(authData.user, authData.session);
            (0, debug_logs_1.log)("[AuthController] Authentication callback processed successfully");
            // Show welcome message
            vscode.window.showInformationMessage(`Welcome back, ${authData.user.firstName || authData.user.username || "User"}!`);
            // Stop the auth server after successful authentication
            if (this.authServer) {
                this.authServer.stop();
                this.authServer = null;
            }
        }
        catch (error) {
            (0, debug_logs_1.log)(`[AuthController] Error handling auth callback: ${error}`);
            vscode.window.showErrorMessage("Authentication failed. Please try again.");
            throw error;
        }
    }
    /**
     * Cleanup resources when extension is deactivated
     */
    dispose() { }
}
exports.AuthController = AuthController;
