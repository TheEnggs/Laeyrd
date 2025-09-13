"use client";

import { log } from "../../lib/debug-logs";

export type VsCodeApi = {
  postMessage: (message: any) => void;
  getState: <T = unknown>() => T | undefined;
  setState: (newState: unknown) => void;
};

function createFallbackApi(): VsCodeApi {
  let state: unknown = undefined;
  return {
    postMessage: (message: any) => {
      // eslint-disable-next-line no-console
      log("[Mock vscode.postMessage]", message);
    },
    getState: <T>() => state as T,
    setState: (newState: unknown) => {
      state = newState;
      // eslint-disable-next-line no-console
      log("[Mock vscode.setState]", newState);
    },
  };
}

export class HandleAcquireVsCodeApi {
  private static instance: VsCodeApi | undefined;

  private constructor() {
    const hasWindow = typeof window !== "undefined";
    const globalAcquire = hasWindow
      ? (window as any).acquireVsCodeApi
      : undefined;
    try {
      if (typeof globalAcquire === "function") {
        HandleAcquireVsCodeApi.instance = globalAcquire();
      } else {
        HandleAcquireVsCodeApi.instance = createFallbackApi();
      }
    } catch {
      HandleAcquireVsCodeApi.instance = createFallbackApi();
    }
  }

  public static getInstance() {
    if (!HandleAcquireVsCodeApi.instance) {
      new HandleAcquireVsCodeApi();
    }
    return HandleAcquireVsCodeApi.instance;
  }
}
