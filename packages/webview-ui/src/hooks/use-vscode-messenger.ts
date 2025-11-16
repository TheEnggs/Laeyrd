// src/hooks/useVSCodeMessenger.ts
import { RequestMessage, WebViewEvent } from "@shared/types/event";
import { HandleAcquireVsCodeApi } from "@/lib/acquireVsCodeApi";
import { log } from "@shared/utils/debug-logs";

type GET_REQUEST_MESSAGE<T extends keyof WebViewEvent> = {
  requestId: string;
  command: T;
  payload: WebViewEvent[T]["payload"];
};
export function VSCodeMessenger() {
  const postMessage = (message: GET_REQUEST_MESSAGE<keyof WebViewEvent>) => {
    log("postMessage", message);
    const vscodeMessageApi = HandleAcquireVsCodeApi.getInstance();
    if (vscodeMessageApi) {
      vscodeMessageApi.postMessage(message);
    }
  };

  return { postMessage };
}
