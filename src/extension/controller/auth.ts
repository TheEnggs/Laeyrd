import * as vscode from "vscode";
import {
  AuthUser,
  AuthSession,
  ServerConfig,
} from "../../types/user-preferences";
import { log } from "../utils/debug-logs";

export class AuthController {
  private static instance: AuthController;
  private context: vscode.ExtensionContext;
  private currentUser: AuthUser | null = null;
  private currentSession: AuthSession | null = null;
  private listeners: Array<(user: AuthUser | null) => void> = [];

  // Server configuration - replace with your actual Clerk setup
  private serverConfig: ServerConfig = {
    baseUrl: "https://api.theme-your-code.com",
    githubUrl: "https://github.com/your-org/theme-your-code-server",
    privacyPolicyUrl: "https://theme-your-code.com/privacy",
    termsOfServiceUrl: "https://theme-your-code.com/terms",
    clerkPublishableKey: process.env.CLERK_PUBLISHABLE_KEY || "pk_test_...", // Replace with your Clerk publishable key
    clerkSignInUrl: "https://your-clerk-app.accounts.dev/sign-in",
    clerkSignUpUrl: "https://your-clerk-app.accounts.dev/sign-up",
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
   * Handle sign-in process - opens external browser for Clerk OAuth
   */
  public async signIn(
    returnUrl?: string
  ): Promise<{ success: boolean; redirectUrl?: string }> {
    try {
      const signInUrl = this.buildSignInUrl(returnUrl);

      // Open external browser for Clerk authentication
      const opened = await vscode.env.openExternal(vscode.Uri.parse(signInUrl));

      if (opened) {
        log("[AuthController] Opened sign-in URL in external browser");

        // Start polling for authentication completion
        // In a real implementation, you'd have a callback URL that posts back to the extension
        this.startAuthPolling();

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
   * Build sign-in URL with return parameters
   */
  private buildSignInUrl(returnUrl?: string): string {
    const baseUrl =
      this.serverConfig.clerkSignInUrl ||
      `${this.serverConfig.baseUrl}/auth/sign-in`;
    const params = new URLSearchParams();

    // Add return URL for post-auth redirect
    params.append(
      "return_url",
      returnUrl || "vscode://theme-your-code.auth-callback"
    );

    // Add VS Code integration flag
    params.append("integration", "vscode");

    return `${baseUrl}?${params.toString()}`;
  }

  /**
   * Start polling for authentication completion
   * In production, you'd use a proper callback mechanism
   */
  private startAuthPolling(): void {
    let pollCount = 0;
    const maxPolls = 60; // Poll for 5 minutes max (5s intervals)

    const pollInterval = setInterval(async () => {
      pollCount++;

      try {
        // Check if auth was completed by checking your server endpoint
        const authResult = await this.checkAuthCompletion();

        if (authResult.success && authResult.user && authResult.session) {
          clearInterval(pollInterval);
          await this.storeAuth(authResult.user, authResult.session);

          vscode.window.showInformationMessage(
            `Welcome back, ${
              authResult.user.firstName || authResult.user.username || "User"
            }!`
          );
        } else if (pollCount >= maxPolls) {
          clearInterval(pollInterval);
          log("[AuthController] Auth polling timeout");
        }
      } catch (error) {
        log(`[AuthController] Auth polling error: ${error}`);
        if (pollCount >= maxPolls) {
          clearInterval(pollInterval);
        }
      }
    }, 5000); // Poll every 5 seconds
  }

  /**
   * Check if authentication was completed
   * This would call your server to check for a completed auth session
   */
  private async checkAuthCompletion(): Promise<{
    success: boolean;
    user?: AuthUser;
    session?: AuthSession;
  }> {
    try {
      // TODO: Implement actual server check
      // This is a placeholder - replace with your server endpoint

      // const response = await fetch(`${this.serverConfig.baseUrl}/auth/check-session`, {
      //   method: 'GET',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      // });

      // For now, return false to indicate auth not complete
      return { success: false };
    } catch (error) {
      log(`[AuthController] Error checking auth completion: ${error}`);
      return { success: false };
    }
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
   * Handle authentication callback from external source
   * This would be called when the user completes OAuth in the browser
   */
  public async handleAuthCallback(authData: {
    user: AuthUser;
    session: AuthSession;
  }): Promise<void> {
    try {
      await this.storeAuth(authData.user, authData.session);
      log("[AuthController] Authentication callback processed successfully");
    } catch (error) {
      log(`[AuthController] Error handling auth callback: ${error}`);
      throw error;
    }
  }
}
