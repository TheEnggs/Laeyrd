import { VSCodeMessenger } from "@webview/hooks/use-vscode-messenger";
import {
  RequestMessage,
  ResponseMessage,
  WebViewEvent,
} from "../../types/event";
import { log } from "../../lib/debug-logs";

type EventCallback<T = any> = (payload: T) => void;

class PromiseController {
  private messenger = VSCodeMessenger();
  private pendingRequests = new Map<
    string,
    { resolve: (val: any) => void; reject: (err: any) => void }
  >();
  private eventListeners = new Map<string, Set<EventCallback>>();

  constructor() {
    window.addEventListener("message", (event) => {
      // 1️⃣ Handle request-response
      log("new incoming message", event.data);
      const requestId = event.data.requestId;
      if (requestId) {
        const message = event.data as ResponseMessage<
          keyof WebViewEvent,
          "payload"
        >;
        const existingPromise = this.pendingRequests.get(message.requestId);
        log("existingPromise", existingPromise);
        if (existingPromise) {
          if (message.status === "success")
            existingPromise.resolve(message.payload);
          else existingPromise.reject(message.error);
          this.pendingRequests.delete(message.requestId);
        } else {
          reportError(new Error("Request not found: " + message.requestId));
        }
        return;
      } else {
        const message = event.data as ResponseMessage<
          keyof WebViewEvent,
          "payload"
        >;
        // 2️⃣ Handle push events (no requestId)
        if (message.command) {
          const listeners = this.eventListeners.get(message.command);
          log(listeners, message.command, message.payload);
          if (listeners) {
            listeners.forEach((cb) => cb(message.payload));
          }
        }
        return;
      }
    });
  }

  create<T extends keyof WebViewEvent>({
    command,
    payload,
  }: {
    command: T;
    payload: WebViewEvent[T]["payload"];
  }): Promise<ResponseMessage<T, "response">> {
    const requestId = crypto.randomUUID();
    const message: RequestMessage<T> = { requestId, command, payload };

    return new Promise((resolve, reject) => {
      // Set timeout to prevent hanging requests
      const timeout = setTimeout(() => {
        this.pendingRequests.delete(requestId);
        reject(new Error(`Request timeout for ${command} after 10 seconds`));
      }, 10000);

      this.pendingRequests.set(requestId, {
        resolve: (val: any) => {
          clearTimeout(timeout);
          resolve(val);
        },
        reject: (err: any) => {
          clearTimeout(timeout);
          reject(err);
        },
      });

      log("this promise set", Object.keys(this.pendingRequests));

      this.messenger.postMessage(message);
    });
  }

  // ✅ Subscribe to push events
  on<T extends keyof WebViewEvent>(
    command: T,
    cb: (payload: WebViewEvent[T]["payload"]) => void
  ) {
    log("push event", command);
    if (!this.eventListeners.has(command)) {
      this.eventListeners.set(command, new Set());
    }
    this.eventListeners.get(command)!.add(cb);
    return () => this.eventListeners.get(command)!.delete(cb); // unsubscribe
  }
  off<T extends keyof WebViewEvent>(command: T) {
    this.eventListeners.delete(command);
  }
}

export const promiseController = new PromiseController();
