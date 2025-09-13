import { WebViewEvent } from "../../types/event";
import { log } from "../../lib/debug-logs";

export function reportError(error: Error) {
  log("reportError", error);
  //   window.postMessage({
  //     command: "REPORT_ERROR",
  //     payload: {
  //       error: error.message,
  //     } as WebViewEvent["REPORT_ERROR"]["payload"],
  //   });
}
