export type WebviewEvent =
  | { command: "GET_THEME_COLORS"; payload: Record<string, string> }
  | { command: "GET_THEME_TOKEN_COLORS"; payload: any[] }
  | { command: "SETTINGS_UPDATED"; payload: any }
  | { command: "LIVE_PREVIEW_STATE"; payload: boolean }
  | { command: "SAVE_SUCCESS"; payload?: undefined }
  | { command: "ERROR"; payload: string };
