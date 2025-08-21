import { ColorTab, GroupedTokenColors } from "./theme";

export type WebViewEvent = {
  UPDATE_THEME_COLORS: {
    payload: ColorTab[];
    response: undefined;
  };
  GET_THEME_COLORS: {
    payload: any[];
    response: ColorTab[];
  };
  GET_THEME_TOKEN_COLORS: {
    payload: any[];
    response: GroupedTokenColors;
  };
  GET_THEME_LIST: {
    payload: any[];
    response: { label: string; path: string; uiTheme?: string }[];
  };
  SETTINGS_UPDATED: { payload: any; response: any };
  LIVE_PREVIEW_STATE: { payload: boolean; response: boolean };
  SAVE_SUCCESS: { payload?: undefined; response?: undefined };
  REPORT_ERROR: { payload: { error: string }; response: undefined };
  ERROR: { payload: string; response: string };
};

export interface RequestMessage<T extends keyof WebViewEvent> {
  requestId: string;
  command: T;
  payload: WebViewEvent[T]["payload"];
}

export interface ResponseMessage<T extends keyof WebViewEvent> {
  requestId: string;
  command: T;
  status: "success" | "error";
  payload?: WebViewEvent[T]["response"];
  error?: string;
}
