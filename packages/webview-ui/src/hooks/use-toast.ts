import { WebViewEvent } from "@shared/types/event";
import { VSCodeMessenger } from "./use-vscode-messenger";

export default function useToast() {
  const { postMessage } = VSCodeMessenger();
  const toast = (payload: WebViewEvent["SHOW_TOAST"]["payload"]) => {
    return postMessage({
      requestId: crypto.randomUUID(),
      command: "SHOW_TOAST",
      payload,
    });
  };
  return toast;
}
