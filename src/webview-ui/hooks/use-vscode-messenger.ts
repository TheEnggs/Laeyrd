// src/hooks/useVSCodeMessenger.ts
import { HandleAcquireVsCodeApi } from "@webview/lib/acquireVsCodeApi";
import { useEffect, useRef, useCallback } from "react";
// import * as vscode from "vscode-webview";

export function useVSCodeMessenger(onMessage?: (msg: any) => void) {
  useEffect(() => {
    console.log("useEffect");
    const listener = (event: MessageEvent) => {
      if (onMessage) onMessage(event.data);
      console.log("event", event);
    };

    window.addEventListener("message", listener);
    return () => window.removeEventListener("message", listener);
  }, [onMessage]);

  const postMessage = useCallback((message: any) => {
    const vscodeMessageApi = HandleAcquireVsCodeApi.getInstance();
    if (vscodeMessageApi) {
      vscodeMessageApi.postMessage(message);
    }
  }, []);

  return { postMessage };
}
