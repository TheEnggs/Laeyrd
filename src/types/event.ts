import { DraftColor, DraftToken } from "@webview/contexts/settings-context";
import { UiLayoutMetaGrouped } from "./layout";
import {
  ColorMetaGrouped,
  TokenColorsList,
  SemanticTokenColors,
} from "./theme";
import { fontsLayoutUI } from "@lib/data/fonts-layout";
import { LocalVersionFile, SyncResponse } from "./sync";

export const SaveThemeModes = {
  CREATE: "CREATE",
  OVERWRITE: "OVERWRITE",
  LIVE: "LIVE",
} as const;

export type WebViewEvent = {
  SHOW_TOAST: {
    payload: { message: string; type: "info" | "error" | "warn" | "success" };
    response: undefined;
  };
  UPDATE_THEME_COLORS: {
    payload: ColorMetaGrouped | undefined;
    response: undefined;
  };
  GET_THEME_COLORS: {
    payload: any;
    response: ColorMetaGrouped;
  };
  GET_THEME_TOKEN_COLORS: {
    payload: any[];
    response: TokenColorsList;
  };
  GET_SEMANTIC_TOKEN_COLORS: {
    payload: any[];
    response: SemanticTokenColors;
  };
  GET_FONT_AND_LAYOUT_SETTINGS: {
    payload: any;
    response: UiLayoutMetaGrouped;
  };
  UPDATE_FONT_AND_LAYOUT_SETTINGS: {
    payload: UiLayoutMetaGrouped;
    response: undefined;
  };
  TEST_SETTINGS_CHANGE: {
    payload: any;
    response: undefined;
  };
  GET_THEME_LIST: {
    payload: any[];
    response: {
      themes: { label: string; path: string; uiTheme?: string }[];
      active: string;
    };
  };
  GET_ACTIVE_THEME_LABEL: {
    payload: any;
    response: string;
  };
  UPDATE_THEME_LIST: {
    payload: {
      themes: { label: string; path: string; uiTheme?: string }[];
      active: string;
    };
    response: undefined;
  };
  SETTINGS_UPDATED: { payload: any; response: any };
  LIVE_PREVIEW_STATE: { payload: boolean; response: boolean };
  LIVE_PREVIEW_APPLY: { payload: any; response: undefined };
  OPEN_DONATION: { payload: any; response: undefined };
  ENABLE_LIVE_PREVIEW: { payload: any; response: undefined };
  DISABLE_LIVE_PREVIEW: { payload: any; response: undefined };
  SAVE_THEME: {
    payload: {
      mode: keyof typeof SaveThemeModes;
      themeName: string;
      colors: DraftColor;
      tokenColors: DraftToken;
    };
    response: { success: boolean };
  };
  SAVE_SETTINGS: {
    payload: {
      settings: Record<keyof typeof fontsLayoutUI, string | number | boolean>;
    };
    response: undefined;
  };
  RESTORE_ORIGINAL_SETTINGS: { payload: any; response: undefined };

  SAVE_SUCCESS: { payload?: undefined; response?: undefined };
  REPORT_ERROR: { payload: { error: string }; response: undefined };
  ERROR: { payload: string; response: string };
  // User Preferences Events
  GET_USER_PREFERENCES: {
    payload: any;
    response: import("./user-preferences").UserPreferences;
  };
  UPDATE_USER_PREFERENCES: {
    payload: Partial<import("./user-preferences").UserPreferences>;
    response: import("./user-preferences").UserPreferences;
  };
  SYNC_USER_PREFERENCES: {
    payload: import("./user-preferences").UserPreferences;
    response: { success: boolean; message?: string };
  };
  GET_SERVER_CONFIG: {
    payload: any;
    response: import("./user-preferences").ServerConfig;
  };
  // Authentication Events
  CLERK_SIGN_IN: {
    payload: { returnUrl?: string };
    response: { success: boolean; redirectUrl?: string };
  };
  CLERK_SIGN_OUT: {
    payload: any;
    response: { success: boolean };
  };
  GET_AUTH_USER: {
    payload: any;
    response: import("./user-preferences").AuthUser | null;
  };
  UPDATE_AUTH_USER: {
    payload: import("./user-preferences").AuthUser;
    response: import("./user-preferences").AuthUser;
  };
  GET_AUTH_SESSION: {
    payload: any;
    response: import("./user-preferences").AuthSession | null;
  };
  OPEN_EXTERNAL_URL: {
    payload: { url: string };
    response: { success: boolean };
  };
  WEBAPP_SIGN_IN: {
    payload: null;
    response: {
      user_code: string;
      verificationUri: string;
      expiresIn: number;
    };
  };
  SIGN_OUT: {
    payload: null;
    response: { success: boolean };
  };
  // THEMES SYNC EVENTS
  FETCH_REMOTE_VERSION: {
    payload: {};
    response: { hasConflicts: boolean; hasUpdates: boolean };
  };
  SYNC: {
    payload: {};
    response: { success: boolean; data: SyncResponse[] };
  };

  //   CHECK_CONFLICTS: {
  //     payload: { userId: string };
  //     response: {
  //       conflictingThemes: LocalThemeVersion[];
  //     };
  //   };

  RESOLVE_CONFLICT: {
    payload: {
      resolve: { themeId: string; resolve: "KEEP_LOCAL" | "KEEP_REMOTE" }[];
    };
    response: {
      success: boolean;
    };
  };

  // FUTURE: SETTINGS SYNC
  FETCH_REMOTE_SETTINGS: {
    payload: { userId: string };
    response: any[]; // define RemoteSettingsVersion type
  };

  PULL_SETTING: {
    payload: { settingId: number };
    response: {
      success: boolean;
      setting: any; // define LocalSettingsVersion type
      message?: string;
    };
  };

  PUSH_SETTING: {
    payload: { settingId: number };
    response: {
      success: boolean;
      setting: any; // define LocalSettingsVersion type
      conflict?: boolean;
      remoteSetting?: any; // RemoteSettingsVersion
    };
  };
};

export interface RequestMessage<T extends keyof WebViewEvent> {
  requestId: string;
  command: T;
  payload: WebViewEvent[T]["payload"];
}

export interface ResponseMessage<
  T extends keyof WebViewEvent,
  K extends "payload" | "response",
> {
  requestId: string;
  command: T;
  status: "success" | "error";
  payload?: WebViewEvent[T][K];
  error?: string;
}
