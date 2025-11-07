import { useEffect, useMemo, useState } from "react";
import { Color, DraftColor, DraftToken } from "@shared/types/theme";

import { SaveThemeModes } from "@shared/types/event";
import { debounce } from "@/lib/utils";
import useToast from "./use-toast";
import { useMutation } from "./use-query";
import { log } from "@shared/utils/debug-logs";

const DEBOUNCE_MS = 1000;

export function useLivePreview({
  hasColorChanges,
  draftColorState,
  draftTokenState,
  saveTheme,
}: {
  hasColorChanges: boolean;
  draftColorState: Color;
  draftTokenState: DraftToken;
  saveTheme: (payload: {
    mode: keyof typeof SaveThemeModes;
    themeName: string;
    colors: DraftColor;
    tokenColors: DraftToken;
  }) => void;
}) {
  const toast = useToast();
  const [livePreview, setLivePreview] = useState(false);

  const { mutate: enableLivePreviewMutate, isPending: mutationPending } =
    useMutation("ENABLE_LIVE_PREVIEW", {
      onSuccess: () => {
        log("Live Preview Enabled");
        setLivePreview(true);
      },
      onError: (error) => {
        log(error);
        toast({
          message: "Failed to set live preview state",
          type: "error",
        });
      },
    });

  const toggleLivePreview = () => {
    if (livePreview) setLivePreview(false);
    else enableLivePreviewMutate({});
  };

  // memoize a debounced version of saveTheme
  const debouncedSave = useMemo(
    () =>
      debounce((colors: DraftColor, tokens: DraftToken) => {
        saveTheme({
          mode: SaveThemeModes.LIVE,
          themeName: "", // set in the backend
          colors,
          tokenColors: tokens,
        });
      }, DEBOUNCE_MS),
    [saveTheme]
  );

  useEffect(() => {
    if (!livePreview) return;
    if (!hasColorChanges) return;

    debouncedSave(draftColorState, draftTokenState);

    // cleanup to avoid memory leaks
    return () => {
      debouncedSave.cancel();
    };
  }, [livePreview, hasColorChanges, draftColorState, draftTokenState]);

  return { toggleLivePreview, livePreview, mutationPending };
}
