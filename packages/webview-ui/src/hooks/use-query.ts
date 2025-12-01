import { log } from "../../../shared/src/utils/debug-logs";
import { WebViewEvent } from "@shared/types/event";
import { queryClient } from "../controller/query-client";
import { useCallback, useEffect, useState } from "react";

export const useQuery = <T extends keyof WebViewEvent>(queryParameter: {
  command: T;
  payload: WebViewEvent[T]["payload"];
  staleTime?: number;
}) => {
  const [isLoading, setIsLoading] = useState(false),
   [data, setData] = useState<WebViewEvent[T]["response"] | null>(null),
   [error, setError] = useState<any>(null),

  // Stable cache key (right now only command, you may want command+payload hash)
   cacheKey = queryParameter.command,

  // Memoize payload string so JSON.stringify doesn't change every render by accident
   payloadString = JSON.stringify(queryParameter.payload),

   fetchQuery = useCallback(
    async (options?: { force?: boolean }) => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await queryClient.query(cacheKey, {
          command: queryParameter.command,
          payload: queryParameter.payload,
          staleTime: options?.force ? 0 : queryParameter.staleTime || Infinity,
        });

        setData(result);
        setIsLoading(false);
        return result;
      } catch (err) {
        setError(err);
        setIsLoading(false);
        throw err;
      }
    },
    [cacheKey, payloadString, queryParameter.command, queryParameter.staleTime]
  );
  // ^ payload itself isn't included directly, we key off payloadString for stability

  useEffect(() => {
    let canceled = false;
    setError(null);
    fetchQuery();
    const unsubscribe = queryClient.subscribe({
      command: cacheKey,
      cb: (newData) => {
        if (!canceled) {setData(newData);}
      },
    });

    return () => {
      canceled = true;
      unsubscribe();
    };
  }, [cacheKey, fetchQuery]);

  const refetch = useCallback(
    (options?: { force?: boolean }) => fetchQuery({ force: true }),
    [fetchQuery]
  );

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
  const [isPending, setIsPending] = useState(false),
   [error, setError] = useState<any>(null),
   [mutationData, setMutationData] = useState<
    WebViewEvent[T]["response"] | null
  >(null),

   mutate = useCallback(
    (payload: WebViewEvent[T]["payload"]) => {
      setIsPending(true);
      setError(null);

      const p = queryClient
        .mutate(command, payload)
        .then((data) => {
          log("mutate success", command, data);
          setMutationData(data);
          return data;
        })
        .then((data) => options?.onSuccess?.(data))
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
