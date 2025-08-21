import { WebViewEvent } from "../../types/event";
import { promiseController } from "./promise-controller";

class QueryClient {
  private static instance: QueryClient;
  private cache = new Map<string, unknown>();

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
  ): Promise<WebViewEvent[T]["response"]> {
    return promiseController.create({ command, payload });
  }

  async setData<T extends keyof WebViewEvent>(
    key: string,
    data: WebViewEvent[T]["response"]
  ): Promise<void> {
    this.cache.set(key, data);
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
