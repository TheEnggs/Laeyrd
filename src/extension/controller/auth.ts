import * as vscode from "vscode";
import {
  AuthUser,
  AuthSession,
  ServerConfig,
} from "../../types/user-preferences";
import { log } from "../../lib/debug-logs";
import { AuthServer } from "../lib/auth-server";

export class AuthController {
  private static instance: AuthController;
  private context: vscode.ExtensionContext;
  private currentUser: AuthUser | null = null;
  private currentSession: AuthSession | null = null;
  private listeners: Array<(user: AuthUser | null) => void> = [];
  private authServer: AuthServer | null = null;
  // Server configuration - webapp URL for authentication
  private serverConfig: ServerConfig = {
    baseUrl: "https://api.theme-your-code.com",
    githubUrl: "https://github.com/your-org/theme-your-code-server",
    privacyPolicyUrl: "https://theme-your-code.com/privacy",
    termsOfServiceUrl: "https://theme-your-code.com/terms",
    clerkPublishableKey: "", // No longer needed
    webappUrl: "http://localhost:3000", // Your webapp URL
  };

  private constructor(context: vscode.ExtensionContext) {
    this.context = context;
    this.loadStoredAuth();
  }

  public static getInstance(context: vscode.ExtensionContext): AuthController {
    if (!AuthController.instance) {
      AuthController.instance = new AuthController(context);
    }
    return AuthController.instance;
  }

  /**
   * Load stored authentication data from VS Code's global state
   */
  private async loadStoredAuth(): Promise<void> {
    try {
      const storedUser = this.context.globalState.get<AuthUser>("auth_user");
      const storedSession =
        this.context.globalState.get<AuthSession>("auth_session");

      if (storedUser && storedSession) {
        // Validate session is still active
        const now = new Date();
        const expireAt = new Date(storedSession.expireAt);

        if (expireAt > now && storedSession.status === "active") {
          this.currentUser = storedUser;
          this.currentSession = storedSession;
          log("[AuthController] Restored valid authentication session");
        } else {
          // Session expired, clear stored data
          await this.clearStoredAuth();
          log("[AuthController] Cleared expired authentication session");
        }
      }
    } catch (error) {
      log(`[AuthController] Error loading stored auth: ${error}`);
      await this.clearStoredAuth();
    }
  }

  /**
   * Clear stored authentication data
   */
  private async clearStoredAuth(): Promise<void> {
    await this.context.globalState.update("auth_user", undefined);
    await this.context.globalState.update("auth_session", undefined);
    this.currentUser = null;
    this.currentSession = null;
  }

  /**
   * Store authentication data securely
   */
  private async storeAuth(user: AuthUser, session: AuthSession): Promise<void> {
    await this.context.globalState.update("auth_user", user);
    await this.context.globalState.update("auth_session", session);
    this.currentUser = user;
    this.currentSession = session;
    this.notifyAuthChanged();
  }

  /**
   * Get current authenticated user
   */
  public getCurrentUser(): AuthUser | null {
    return this.currentUser;
  }

  /**
   * Get current session
   */
  public getCurrentSession(): AuthSession | null {
    return this.currentSession;
  }

  /**
   * Get server configuration including Clerk settings
   */
  public getServerConfig(): ServerConfig {
    return this.serverConfig;
  }

  /**
   * Register auth state change listener
   */
  public onAuthChanged(listener: (user: AuthUser | null) => void): void {
    this.listeners.push(listener);
  }

  /**
   * Notify all listeners of auth state change
   */
  private notifyAuthChanged(): void {
    this.listeners.forEach((listener) => listener(this.currentUser));
  }

  /**
   * Handle sign-in process - opens webapp for authentication
   */
  public async signIn(
    returnUrl?: string
  ): Promise<{ success: boolean; redirectUrl?: string }> {
    try {
      if (!this.authServer) {
        this.authServer = new AuthServer();
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
        log("[AuthController] Opened webapp sign-in URL in external browser");
        return { success: true, redirectUrl: signInUrl };
      } else {
        return { success: false };
      }
    } catch (error) {
      log(`[AuthController] Sign-in error: ${error}`);
      return { success: false };
    }
  }

  /**
   * Handle sign-out process
   */
  public async signOut(): Promise<{ success: boolean }> {
    try {
      // If we have a current session, invalidate it on the server
      if (this.currentSession) {
        await this.invalidateServerSession();
      }

      // Clear local auth data
      await this.clearStoredAuth();
      this.notifyAuthChanged();

      log("[AuthController] User signed out successfully");
      return { success: true };
    } catch (error) {
      log(`[AuthController] Sign-out error: ${error}`);
      return { success: false };
    }
  }

  /**
   * Build webapp sign-in URL with return parameters
   */
  private buildWebappSignInUrl(): string {
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
  private async invalidateServerSession(): Promise<void> {
    try {
      if (!this.currentSession) return;

      // TODO: Implement actual server session invalidation
      // const response = await fetch(`${this.serverConfig.baseUrl}/auth/invalidate`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${this.currentSession.id}`,
      //   },
      // });

      log("[AuthController] Server session invalidated");
    } catch (error) {
      log(`[AuthController] Error invalidating server session: ${error}`);
    }
  }

  /**
   * Update user information (called when user data changes)
   */
  public async updateUser(user: AuthUser): Promise<AuthUser> {
    try {
      if (this.currentUser) {
        const updatedUser = { ...this.currentUser, ...user };
        await this.context.globalState.update("auth_user", updatedUser);
        this.currentUser = updatedUser;
        this.notifyAuthChanged();
        return updatedUser;
      }
      throw new Error("No authenticated user to update");
    } catch (error) {
      log(`[AuthController] Error updating user: ${error}`);
      throw error;
    }
  }

  /**
   * Open external URL (helper for opening links in browser)
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
   * Handle authentication callback from webapp
   * This is called when the user completes authentication in the webapp
   */
  public async handleAuthCallback(authData: {
    user: AuthUser;
    session: AuthSession;
  }): Promise<void> {
    try {
      await this.storeAuth(authData.user, authData.session);
      log("[AuthController] Authentication callback processed successfully");

      // Show welcome message
      vscode.window.showInformationMessage(
        `Welcome back, ${
          authData.user.firstName || authData.user.username || "User"
        }!`
      );


      // Stop the auth server after successful authentication
      if (this.authServer) {
        this.authServer.stop();
        this.authServer = null;
      }
    } catch (error) {
      log(`[AuthController] Error handling auth callback: ${error}`);
      vscode.window.showErrorMessage(
        "Authentication failed. Please try again."
      );
      throw error;
    }
  }

  /**
   * Cleanup resources when extension is deactivated
   */
  public dispose(): void {}
}
