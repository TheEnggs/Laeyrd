import { useEffect, useMemo } from "react";
import { Color } from "@src/types/theme";
import { DraftColor, DraftToken } from "../contexts/settings-context";
import { SaveThemeModes } from "@src/types/event";
import { debounce } from "@webview/lib/utils";

const DEBOUNCE_MS = 500;

export function useLivePreview({
  livePreview,
  hasColorChanges,
  draftColorState,
  draftTokenState,
  saveTheme,
}: {
  livePreview: boolean;
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
  // memoize a debounced version of saveTheme
  const debouncedSave = useMemo(
    () =>
      debounce((colors: DraftColor, tokens: DraftToken) => {
        saveTheme({
          mode: SaveThemeModes.LIVE,
          themeName: "[laeyrd] Live Preview",
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
}
