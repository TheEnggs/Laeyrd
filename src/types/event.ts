export type WebviewEvent =
  | { command: "GET_THEME_COLORS"; payload: Record<string, string> }
  | { command: "GET_THEME_TOKEN_COLORS"; payload: any[] }
  | { command: "SETTINGS_UPDATED"; payload: any }
  | { command: "ERROR"; payload: string };
