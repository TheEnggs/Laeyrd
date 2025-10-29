// src/hooks/useVSCodeMessenger.ts
import { RequestMessage, WebViewEvent } from "@src/types/event";
import { HandleAcquireVsCodeApi } from "@webview/lib/acquireVsCodeApi";
import { log } from "../../lib/debug-logs";

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
