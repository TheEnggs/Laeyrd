const debug = false; // Set false for production
export function log(...args: any[]) {
  if (debug) {
    console.log("[Laeyrd]", ...args);
  }
}
