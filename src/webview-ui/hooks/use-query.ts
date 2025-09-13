import { log } from "../../lib/debug-logs";
import { WebViewEvent } from "../../types/event";
import { queryClient } from "../controller/query-client";
import { useEffect, useState } from "react";

export const useQuery = <T extends keyof WebViewEvent>(queryParameter: {
  command: T;
  payload: WebViewEvent[T]["payload"];
  staleTime?: number;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<WebViewEvent[T]["response"] | null>(null);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    let canceled = false;
    setIsLoading(true);
    setError(null);

    // Create a stable cache key that includes command and serialized payload
    const cacheKey = queryParameter.command;

    queryClient
      .query(cacheKey, {
        command: queryParameter.command,
        payload: queryParameter.payload,
        staleTime: queryParameter.staleTime || Infinity,
      })
      .then((data) => {
        if (!canceled) {
          setData(data);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (!canceled) {
          setError(err);
          setIsLoading(false);
        }
      });

    const unsubscribe = queryClient.subscribe({
      command: cacheKey,
      cb: (data) => {
        if (!canceled) return setData(data);
      },
    });

    return () => {
      canceled = true;
      unsubscribe();
    };
  }, [
    queryParameter.command,
    JSON.stringify(queryParameter.payload), // Serialize payload to avoid reference changes
    queryParameter.staleTime,
  ]);

  return { data, isLoading, error };
};

export const useMutation = <T extends keyof WebViewEvent>(
  command: T,
  response?: {
    onSuccess?: (data: WebViewEvent[T]["response"]["payload"]) => void;
    onError?: (error: any) => void;
    onSettled?: () => void;
  }
) => {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<any>(null);
  const [mutationData, setMutationData] = useState<
    WebViewEvent[T]["response"]["payload"] | null
  >(null);

  const mutate = (payload: WebViewEvent[T]["payload"]) => {
    setIsPending(true);
    queryClient
      .mutate(command, payload)
      .then((data) => {
        log("mutate success", command, data);
        setMutationData(data);
        response?.onSuccess?.(data);
      })
      .catch((error) => {
        setMutationData(null);
        response?.onError?.(error);
      })
      .finally(() => {
        setIsPending(false);
        response?.onSettled?.();
      });
  };

  return { isPending, error, mutate, data: mutationData };
};

export const useSetData = <T extends keyof WebViewEvent>({
  command,
  payload,
}: {
  command: T;
  payload: WebViewEvent[T]["payload"];
}) => {
  queryClient.setData({ command, data: payload });
  return { success: true };
};
