// UseDraftSaveShortcut.ts
import { useDraft } from "@webview/contexts/draft-context";
import { useEffect, useRef } from "react";
const DEBOUNCE_DELAY = 1000;
export function useDraftSaveShortcut() {
  const { saveDrafts, isPublishingDraftChanges } = useDraft();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().includes("MAC"),
       isSaveKey =
        (isMac && e.metaKey && e.key.toLowerCase() === "s") ||
        (!isMac && e.ctrlKey && e.key.toLowerCase() === "s");

      if (isSaveKey) {
        e.preventDefault();
        if (isPublishingDraftChanges) {return;}
        saveDrafts();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [saveDrafts, isPublishingDraftChanges]);
}

export function useDebouncedSave() {
  const { drafts, saveDrafts, isSaving } = useDraft(),
   timerRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    // If (isPublishingDraftChanges) {
    //   If (timerRef.current) {
    //     ClearTimeout(timerRef.current);
    //   }
    //   Return;
    // }
    // Clear any previous timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // Start a new debounce timer
    timerRef.current = setTimeout(() => {
      saveDrafts();
    }, DEBOUNCE_DELAY);

    // Cleanup if drafts change again OR component unmounts
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [drafts, saveDrafts]);
}
