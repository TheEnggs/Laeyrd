const debug = true; // set false for production

export function log(...args: any[]) {
  if (debug) {
    console.log("[ThemeYourCode]", ...args);
  }
}
