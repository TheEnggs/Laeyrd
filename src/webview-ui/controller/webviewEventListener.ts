import { WebviewEvent } from "../../types/event";

type EventHandlerMap = {
  [K in WebviewEvent["command"]]: (
    payload: Extract<WebviewEvent, { command: K }>["payload"]
  ) => void;
};

export class WebviewEventHandler {
  private handlers: Partial<EventHandlerMap> = {};
  private boundListener?: (event: MessageEvent<WebviewEvent>) => void;

  constructor() {
    this.boundListener = (event: MessageEvent<WebviewEvent>) => {
      const data: any = event.data as any;
      const type: keyof EventHandlerMap = (data?.command || data?.type) as any;
      const payload = data?.payload;
      const handler = this.handlers[type];
      if (handler) {
        handler(payload as never);
      } else {
        console.warn(`No handler for event type: ${type}`);
      }
    };

    window.addEventListener("message", this.boundListener as any);
  }

  public cleanUp() {
    if (this.boundListener) {
      window.removeEventListener("message", this.boundListener as any);
      this.boundListener = undefined;
    }
  }

  public on<K extends WebviewEvent["command"]>(
    type: K,
    handler: EventHandlerMap[K]
  ) {
    this.handlers[type] = handler;
  }
}
