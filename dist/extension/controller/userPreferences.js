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
exports.UserPreferencesController = void 0;
const crypto = __importStar(require("crypto"));
const debug_logs_1 = require("../../lib/debug-logs");
class UserPreferencesController {
    constructor(context) {
        this.context = context;
    }
    /**
     * Get or create encryption key for securing user data locally
     */
    get getEncryptionKey() {
        const key = this.context.globalState.get("encryption_key");
        if (key) {
            return key;
        }
        // Generate a new encryption key
        const newKey = crypto.randomBytes(32).toString("hex");
        this.context.globalState.update("encryption_key", newKey);
        (0, debug_logs_1.log)("[UserPreferencesController] Generated new encryption key");
        return newKey;
    }
    /**
     * Encrypt sensitive data before storing
     */
    encrypt(data) {
        try {
            const iv = crypto.randomBytes(16);
            const key = Buffer.from(this.getEncryptionKey, "hex");
            const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
            let encrypted = cipher.update(data, "utf8", "hex");
            encrypted += cipher.final("hex");
            return iv.toString("hex") + ":" + encrypted;
        }
        catch (error) {
            (0, debug_logs_1.log)(`[UserPreferencesController] Encryption error: ${error}`);
            throw new Error("Failed to encrypt data");
        }
    }
    /**
     * Decrypt sensitive data when reading
     */
    decrypt(encryptedData) {
        try {
            const [ivHex, encrypted] = encryptedData.split(":");
            const iv = Buffer.from(ivHex, "hex");
            const key = Buffer.from(this.getEncryptionKey, "hex");
            const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
            let decrypted = decipher.update(encrypted, "hex", "utf8");
            decrypted += decipher.final("utf8");
            return decrypted;
        }
        catch (error) {
            (0, debug_logs_1.log)(`[UserPreferencesController] Decryption error: ${error}`);
            throw new Error("Failed to decrypt data");
        }
    }
    /**
     * Get default user preferences
     */
    getDefaultPreferences() {
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
    async getUserPreferences() {
        try {
            const encryptedData = this.context.globalState.get("user_preferences");
            if (!encryptedData) {
                (0, debug_logs_1.log)("[UserPreferencesController] No user preferences found, returning defaults");
                return this.getDefaultPreferences();
            }
            const decrypted = this.decrypt(encryptedData);
            const preferences = JSON.parse(decrypted);
            // Validate and migrate if necessary
            return this.validateAndMigratePreferences(preferences);
        }
        catch (error) {
            (0, debug_logs_1.log)(`[UserPreferencesController] Error reading preferences: ${error}`);
            // Return defaults if we can't read existing preferences
            return this.getDefaultPreferences();
        }
    }
    /**
     * Update user preferences in local storage
     */
    async updateUserPreferences(updates) {
        try {
            const currentPreferences = await this.getUserPreferences();
            const updatedPreferences = {
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
            (0, debug_logs_1.log)("[UserPreferencesController] User preferences updated successfully");
            // If sync is enabled, attempt to sync with server
            if (updatedPreferences.consents.dataSyncEnabled) {
                this.syncWithServer(updatedPreferences).catch((error) => {
                    (0, debug_logs_1.log)(`[UserPreferencesController] Sync failed: ${error}`);
                    // Don't throw here - local update should succeed even if sync fails
                });
            }
            return updatedPreferences;
        }
        catch (error) {
            (0, debug_logs_1.log)(`[UserPreferencesController] Error updating preferences: ${error}`);
            throw new Error("Failed to update user preferences");
        }
    }
    /**
     * Validate and migrate preferences schema if needed
     */
    validateAndMigratePreferences(preferences) {
        // Ensure all required fields are present
        const defaults = this.getDefaultPreferences();
        const migrated = {
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
    async syncWithServer(preferences) {
        try {
            if (!preferences.consents.dataSyncEnabled) {
                return { success: false, message: "Data sync is disabled" };
            }
            // TODO: Implement actual server sync
            // This is a placeholder for the actual server communication
            (0, debug_logs_1.log)("[UserPreferencesController] Syncing with server...");
            // For now, just simulate success
            // In real implementation, you would:
            // 1. Send encrypted preferences to your server
            // 2. Handle authentication/authorization
            // 3. Return server response
            return { success: true, message: "Preferences synced successfully" };
        }
        catch (error) {
            (0, debug_logs_1.log)(`[UserPreferencesController] Server sync error: ${error}`);
            return { success: false, message: "Failed to sync with server" };
        }
    }
    /**
     * Reset all user preferences to defaults
     */
    async resetUserPreferences() {
        try {
            await this.context.globalState.update("user_preferences", undefined);
            (0, debug_logs_1.log)("[UserPreferencesController] User preferences reset to defaults");
            return this.getDefaultPreferences();
        }
        catch (error) {
            (0, debug_logs_1.log)(`[UserPreferencesController] Error resetting preferences: ${error}`);
            throw new Error("Failed to reset user preferences");
        }
    }
    /**
     * Check if user has given consent for a specific action
     */
    async hasConsent(consentType) {
        const preferences = await this.getUserPreferences();
        return preferences.consents[consentType] === true;
    }
    /**
     * Update specific consent
     */
    async updateConsent(consentType, value) {
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
    async getUserId() {
        const preferences = await this.getUserPreferences();
        if (preferences.userId) {
            return preferences.userId;
        }
        // Generate a new anonymous user ID
        const userId = crypto.randomUUID();
        await this.updateUserPreferences({ userId });
        (0, debug_logs_1.log)("[UserPreferencesController] Generated new user ID");
        return userId;
    }
}
exports.UserPreferencesController = UserPreferencesController;
