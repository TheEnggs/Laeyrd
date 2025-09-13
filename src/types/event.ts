import { DraftColor, DraftToken } from "@webview/contexts/settings-context";
import { FontMetaGrouped } from "./font";
import { UiLayoutMetaGrouped } from "./layout";
import {
  ColorMetaGrouped,
  TokenColorsList,
  SemanticTokenColors,
  TokenColorItemDetailed,
} from "./theme";
import { HistoryEntry, HistoryState } from "./history";
import { fontsLayoutUI } from "../lib/fonts-layout";

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
      mode: "create" | "overwrite";
      themeName: string;
      colors: DraftColor;
      tokenColors: DraftToken;
    };
    response: undefined;
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
  // History Events
  GET_HISTORY: {
    payload: any;
    response: HistoryState;
  };
  ADD_HISTORY_ENTRY: {
    payload: Omit<HistoryEntry, "id" | "timestamp">;
    response: undefined;
  };
  CLEAR_HISTORY: {
    payload: any;
    response: undefined;
  };
  RESET_TO_HISTORY_ENTRY: {
    payload: { entryId: string };
    response: undefined;
  };
  HISTORY_UPDATED: {
    payload: HistoryState;
    response: undefined;
  };
};

export interface RequestMessage<T extends keyof WebViewEvent> {
  requestId: string;
  command: T;
  payload: WebViewEvent[T]["payload"];
}

export interface ResponseMessage<
  T extends keyof WebViewEvent,
  K extends "payload" | "response"
> {
  requestId: string;
  command: T;
  status: "success" | "error";
  payload?: WebViewEvent[T][K];
  error?: string;
}
