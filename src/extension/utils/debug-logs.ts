import * as vscode from "vscode";
const debug = false; // set false for production

export function log(...args: any[]) {
  if (debug) {
    console.log("[ThemeYourCode]", ...args);
  }
}
