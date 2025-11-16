import { log } from "../../../shared/src/utils/debug-logs";
import { WebViewEvent } from "@shared/types/event";
import { queryClient } from "../controller/query-client";
import { useCallback, useEffect, useState } from "react";

export const useQuery = <T extends keyof WebViewEvent>(queryParameter: {
  command: T;
  payload: WebViewEvent[T]["payload"];
  staleTime?: number;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<WebViewEvent[T]["response"] | null>(null);
  const [error, setError] = useState<any>(null);

  // Stable cache key (right now only command, you may want command+payload hash)
  const cacheKey = queryParameter.command;

  // Memoize payload string so JSON.stringify doesn't change every render by accident
  const payloadString = JSON.stringify(queryParameter.payload);

  const fetchQuery = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await queryClient.query(cacheKey, {
        command: queryParameter.command,
        payload: queryParameter.payload,
        staleTime: queryParameter.staleTime || Infinity,
      });

      setData(result);
      setIsLoading(false);
      return result;
    } catch (err) {
      setError(err);
      setIsLoading(false);
      throw err;
    }
  }, [
    cacheKey,
    payloadString,
    queryParameter.command,
    queryParameter.staleTime,
  ]);
  // ^ payload itself isn't included directly, we key off payloadString for stability

  useEffect(() => {
    let canceled = false;
    setError(null);

    // fire initial fetch
    fetchQuery().catch(() => {
      /* already handled state in fetchQuery */
    });

    const unsubscribe = queryClient.subscribe({
      command: cacheKey,
      cb: (newData) => {
        if (!canceled) setData(newData);
      },
    });

    return () => {
      canceled = true;
      unsubscribe();
    };
  }, [cacheKey, fetchQuery]);

  const refetch = useCallback(() => {
    return fetchQuery();
  }, [fetchQuery]);

  return { data, isLoading, error, refetch };
};

export const useMutation = <T extends keyof WebViewEvent>(
  command: T,
  options?: {
    onSuccess?: (data: WebViewEvent[T]["response"]) => void;
    onError?: (error: any) => void;
    onSettled?: () => void;
  }
) => {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<any>(null);
  const [mutationData, setMutationData] = useState<
    WebViewEvent[T]["response"] | null
  >(null);

  const mutate = useCallback(
    (payload: WebViewEvent[T]["payload"]) => {
      setIsPending(true);
      setError(null);

      const p = queryClient
        .mutate(command, payload)
        .then((data) => {
          log("mutate success", command, data);
          setMutationData(data);
          options?.onSuccess?.(data);
          return data;
        })
        .catch((err) => {
          setMutationData(null);
          setError(err);
          options?.onError?.(err);
          throw err;
        })
        .finally(() => {
          setIsPending(false);
          options?.onSettled?.();
        });

      return p;
    },
    [command, options?.onSuccess, options?.onError, options?.onSettled]
  );

  return { isPending, error, mutate, data: mutationData };
};

export const setQueryData = <T extends keyof WebViewEvent>({
  command,
  payload,
}: {
  command: T;
  payload: WebViewEvent[T]["response"];
}) => {
  queryClient.setData({ command, data: payload });
  return { success: true };
};
