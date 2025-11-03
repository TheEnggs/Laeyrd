export interface UserConsents {
  dataSyncEnabled: boolean;
  readSettingsEnabled: boolean;
  analyticsEnabled: boolean;
  crashReportingEnabled: boolean;
  marketingOptIn: boolean;
  termsAccepted: boolean;
  privacyPolicyAccepted: boolean;
  lastUpdated: string; // ISO date string
}

export interface AuthUser {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  username?: string;
  githubUsername?: string;
  isSignedIn: boolean;
  lastSignInAt?: string;
  createdAt?: string;
}

export interface AuthSession {
  id: string; // sessionId
  token: string;
  userId: string;
  status: "active" | "expired" | "ended";
  lastActiveAt: string;
}

export interface UserPreferences {
  userId?: string;
  authUser?: AuthUser;
  consents: UserConsents;
  version: string; // for schema migration purposes
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface ServerConfig {
  baseUrl: string;
  githubUrl: string;
  privacyPolicyUrl: string;
  termsOfServiceUrl: string;
  clerkPublishableKey: string;
  webappUrl: string;
  clerkSignInUrl?: string;
  clerkSignUpUrl?: string;
}
