import { WebViewEvent } from "../../types/event";

export function reportError(error: Error) {
  console.log("reportError", error);
  //   window.postMessage({
  //     command: "REPORT_ERROR",
  //     payload: {
  //       error: error.message,
  //     } as WebViewEvent["REPORT_ERROR"]["payload"],
  //   });
}
