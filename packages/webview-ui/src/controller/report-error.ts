import { WebViewEvent } from "@shared/types/event";
import { log } from "../../../shared/src/utils/debug-logs";

export function reportError(error: Error) {
  log("reportError", error);
  //   window.postMessage({
  //     command: "REPORT_ERROR",
  //     payload: {
  //       error: error.message,
  //     } as WebViewEvent["REPORT_ERROR"]["payload"],
  //   });
}
