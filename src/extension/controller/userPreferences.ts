import * as vscode from "vscode";
import * as crypto from "crypto";
import {
  UserPreferences,
  UserConsents,
  ProgrammingLanguagePreference,
  ServerConfig,
} from "../../types/user-preferences";
import { log } from "../../lib/debug-logs";

export class UserPreferencesController {
  private static instance: UserPreferencesController;
  private context: vscode.ExtensionContext;
  private encryptionKey: string;

  // Server configuration - replace with your actual server details
  private serverConfig: ServerConfig = {
    baseUrl: "https://api.theme-your-code.com", // Replace with your server URL
    githubUrl: "https://github.com/your-org/theme-your-code-server", // Replace with your GitHub repo
    privacyPolicyUrl: "https://theme-your-code.com/privacy",
    termsOfServiceUrl: "https://theme-your-code.com/terms",
    clerkPublishableKey: "pk_test_your-clerk-key", // Replace with your Clerk publishable key
  };

  private constructor(context: vscode.ExtensionContext) {
    this.context = context;
    this.encryptionKey = this.getOrCreateEncryptionKey();
  }

  public static getInstance(
    context: vscode.ExtensionContext
  ): UserPreferencesController {
    if (!UserPreferencesController.instance) {
      UserPreferencesController.instance = new UserPreferencesController(
        context
      );
    }
    return UserPreferencesController.instance;
  }

  /**
   * Get or create encryption key for securing user data locally
   */
  private getOrCreateEncryptionKey(): string {
    const key = this.context.globalState.get<string>("encryption_key");
    if (key) {
      return key;
    }

    // Generate a new encryption key
    const newKey = crypto.randomBytes(32).toString("hex");
    this.context.globalState.update("encryption_key", newKey);
    log("[UserPreferencesController] Generated new encryption key");
    return newKey;
  }

  /**
   * Encrypt sensitive data before storing
   */
  private encrypt(data: string): string {
    try {
      const iv = crypto.randomBytes(16);
      const key = Buffer.from(this.encryptionKey, "hex");
      const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
      let encrypted = cipher.update(data, "utf8", "hex");
      encrypted += cipher.final("hex");
      return iv.toString("hex") + ":" + encrypted;
    } catch (error) {
      log(`[UserPreferencesController] Encryption error: ${error}`);
      throw new Error("Failed to encrypt data");
    }
  }

  /**
   * Decrypt sensitive data when reading
   */
  private decrypt(encryptedData: string): string {
    try {
      const [ivHex, encrypted] = encryptedData.split(":");
      const iv = Buffer.from(ivHex, "hex");
      const key = Buffer.from(this.encryptionKey, "hex");
      const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
      let decrypted = decipher.update(encrypted, "hex", "utf8");
      decrypted += decipher.final("utf8");
      return decrypted;
    } catch (error) {
      log(`[UserPreferencesController] Decryption error: ${error}`);
      throw new Error("Failed to decrypt data");
    }
  }

  /**
   * Get default user preferences
   */
  private getDefaultPreferences(): UserPreferences {
    const now = new Date().toISOString();
    return {
      programmingLanguage: {
        primary: "",
        secondary: [],
        frameworks: [],
      },
      consents: {
        dataSyncEnabled: false,
        readSettingsEnabled: false,
        analyticsEnabled: false,
        crashReportingEnabled: false,
        marketingOptIn: false,
        termsAccepted: false,
        privacyPolicyAccepted: false,
        lastUpdated: now,
      },
      version: "1.0.0",
      createdAt: now,
      updatedAt: now,
    };
  }

  /**
   * Get user preferences from local storage
   */
  public async getUserPreferences(): Promise<UserPreferences> {
    try {
      const encryptedData =
        this.context.globalState.get<string>("user_preferences");

      if (!encryptedData) {
        log(
          "[UserPreferencesController] No user preferences found, returning defaults"
        );
        return this.getDefaultPreferences();
      }

      const decrypted = this.decrypt(encryptedData);
      const preferences: UserPreferences = JSON.parse(decrypted);

      // Validate and migrate if necessary
      return this.validateAndMigratePreferences(preferences);
    } catch (error) {
      log(`[UserPreferencesController] Error reading preferences: ${error}`);
      // Return defaults if we can't read existing preferences
      return this.getDefaultPreferences();
    }
  }

  /**
   * Update user preferences in local storage
   */
  public async updateUserPreferences(
    updates: Partial<UserPreferences>
  ): Promise<UserPreferences> {
    try {
      const currentPreferences = await this.getUserPreferences();

      const updatedPreferences: UserPreferences = {
        ...currentPreferences,
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      // Update consents timestamp if consents were modified
      if (updates.consents) {
        updatedPreferences.consents = {
          ...currentPreferences.consents,
          ...updates.consents,
          lastUpdated: new Date().toISOString(),
        };
      }

      // Update auth user if provided
      if (updates.authUser) {
        updatedPreferences.authUser = {
          ...currentPreferences.authUser,
          ...updates.authUser,
        };
        updatedPreferences.userId = updates.authUser.id;
      }

      // Encrypt and store
      const encryptedData = this.encrypt(JSON.stringify(updatedPreferences));
      await this.context.globalState.update("user_preferences", encryptedData);

      log("[UserPreferencesController] User preferences updated successfully");

      // If sync is enabled, attempt to sync with server
      if (updatedPreferences.consents.dataSyncEnabled) {
        this.syncWithServer(updatedPreferences).catch((error) => {
          log(`[UserPreferencesController] Sync failed: ${error}`);
          // Don't throw here - local update should succeed even if sync fails
        });
      }

      return updatedPreferences;
    } catch (error) {
      log(`[UserPreferencesController] Error updating preferences: ${error}`);
      throw new Error("Failed to update user preferences");
    }
  }

  /**
   * Validate and migrate preferences schema if needed
   */
  private validateAndMigratePreferences(
    preferences: UserPreferences
  ): UserPreferences {
    // Ensure all required fields are present
    const defaults = this.getDefaultPreferences();

    const migrated: UserPreferences = {
      ...defaults,
      ...preferences,
      programmingLanguage: {
        ...defaults.programmingLanguage,
        ...preferences.programmingLanguage,
      },
      consents: {
        ...defaults.consents,
        ...preferences.consents,
      },
    };

    // Update version if schema was migrated
    if (migrated.version !== defaults.version) {
      migrated.version = defaults.version;
      migrated.updatedAt = new Date().toISOString();
    }

    return migrated;
  }

  /**
   * Sync user preferences with server (if enabled)
   */
  private async syncWithServer(
    preferences: UserPreferences
  ): Promise<{ success: boolean; message?: string }> {
    try {
      if (!preferences.consents.dataSyncEnabled) {
        return { success: false, message: "Data sync is disabled" };
      }

      // TODO: Implement actual server sync
      // This is a placeholder for the actual server communication
      log("[UserPreferencesController] Syncing with server...");

      // For now, just simulate success
      // In real implementation, you would:
      // 1. Send encrypted preferences to your server
      // 2. Handle authentication/authorization
      // 3. Return server response

      return { success: true, message: "Preferences synced successfully" };
    } catch (error) {
      log(`[UserPreferencesController] Server sync error: ${error}`);
      return { success: false, message: "Failed to sync with server" };
    }
  }

  /**
   * Get server configuration
   */
  public getServerConfig(): ServerConfig {
    return this.serverConfig;
  }

  /**
   * Reset all user preferences to defaults
   */
  public async resetUserPreferences(): Promise<UserPreferences> {
    try {
      await this.context.globalState.update("user_preferences", undefined);
      log("[UserPreferencesController] User preferences reset to defaults");
      return this.getDefaultPreferences();
    } catch (error) {
      log(`[UserPreferencesController] Error resetting preferences: ${error}`);
      throw new Error("Failed to reset user preferences");
    }
  }

  /**
   * Check if user has given consent for a specific action
   */
  public async hasConsent(consentType: keyof UserConsents): Promise<boolean> {
    const preferences = await this.getUserPreferences();
    return preferences.consents[consentType] === true;
  }

  /**
   * Update specific consent
   */
  public async updateConsent(
    consentType: keyof UserConsents,
    value: boolean
  ): Promise<UserPreferences> {
    const currentPreferences = await this.getUserPreferences();
    return this.updateUserPreferences({
      consents: {
        ...currentPreferences.consents,
        [consentType]: value,
        lastUpdated: new Date().toISOString(),
      },
    });
  }

  /**
   * Get user ID (generate if not exists)
   */
  public async getUserId(): Promise<string> {
    const preferences = await this.getUserPreferences();

    if (preferences.userId) {
      return preferences.userId;
    }

    // Generate a new anonymous user ID
    const userId = crypto.randomUUID();
    await this.updateUserPreferences({ userId });

    log("[UserPreferencesController] Generated new user ID");
    return userId;
  }
}
