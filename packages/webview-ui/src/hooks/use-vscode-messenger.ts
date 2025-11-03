// src/hooks/useVSCodeMessenger.ts
import { RequestMessage, WebViewEvent } from "@shared/types/event";
import { HandleAcquireVsCodeApi } from "@webview/lib/acquireVsCodeApi";
import { log } from "@shared/utils/debug-logs";

export function VSCodeMessenger() {
  const postMessage = <T extends keyof WebViewEvent>(
    message: RequestMessage<T>
  ) => {
    log("postMessage", message);
    const vscodeMessageApi = HandleAcquireVsCodeApi.getInstance();
    if (vscodeMessageApi) {
      vscodeMessageApi.postMessage(message);
    }
  };

  return { postMessage };
}
