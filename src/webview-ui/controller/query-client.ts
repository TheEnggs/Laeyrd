import { ResponseMessage, WebViewEvent } from "../../types/event";
import { promiseController } from "./promise-controller";

class QueryClient {
  private static instance: QueryClient;
  private cache = new Map<string, unknown>();
  private subscribers = new Map<
    keyof WebViewEvent,
    Set<(data: unknown) => void>
  >();
  private constructor() {}

  static getInstance() {
    if (!QueryClient.instance) {
      QueryClient.instance = new QueryClient();
    }
    return QueryClient.instance;
  }

  async query<T extends keyof WebViewEvent>(
    key: string,
    params: {
      command: T;
      payload: WebViewEvent[T]["payload"];
      staleTime?: number;
    }
  ): Promise<WebViewEvent[T]["response"]> {
    if (this.cache.has(key)) {
      return this.cache.get(key) as WebViewEvent[T]["response"];
    }

    const data = await promiseController.create(params);
    this.cache.set(key, data);

    if (params.staleTime && params.staleTime !== Infinity) {
      setTimeout(() => this.cache.delete(key), params.staleTime);
    }
    return data;
  }

  async mutate<T extends keyof WebViewEvent>(
    command: T,
    payload: WebViewEvent[T]["payload"]
  ): Promise<ResponseMessage<T, "response">> {
    const promise = promiseController.create({ command, payload });
    return promise;
  }

  private notify<T extends keyof WebViewEvent>({
    command,
    data,
  }: {
    command: T;
    data: WebViewEvent[T]["payload"];
  }) {
    const subs = this.subscribers.get(command);
    if (subs) {
      for (const cb of subs) cb(data);
    }
    return;
  }

  subscribe<T extends keyof WebViewEvent>({
    command,
    cb,
  }: {
    command: T;
    cb: (data: WebViewEvent[T]["response"]) => void;
  }) {
    if (!this.subscribers.has(command)) {
      this.subscribers.set(command, new Set());
    }
    this.subscribers.get(command)!.add(cb);
    return () => this.subscribers.get(command)!.delete(cb);
  }

  getQueryData<T extends keyof WebViewEvent>(
    command: T
  ): WebViewEvent[T]["response"] {
    return this.cache.get(command) as WebViewEvent[T]["response"];
  }

  setData<T extends keyof WebViewEvent>({
    command,
    data,
  }: {
    command: T;
    data: WebViewEvent[T]["response"];
  }) {
    this.cache.set(command, data);
    this.notify({ command, data });
    return;
  }

  invalidate(key: string) {
    this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
  }
}

// ✅ Always get the same instance
export const queryClient = QueryClient.getInstance();
