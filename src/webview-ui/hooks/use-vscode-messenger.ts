// src/hooks/useVSCodeMessenger.ts
import { HandleAcquireVsCodeApi } from "@webview/lib/acquireVsCodeApi";

export function VSCodeMessenger() {
  const postMessage = (message: any) => {
    const vscodeMessageApi = HandleAcquireVsCodeApi.getInstance();
    if (vscodeMessageApi) {
      vscodeMessageApi.postMessage(message);
    }
  };

  return { postMessage };
}
