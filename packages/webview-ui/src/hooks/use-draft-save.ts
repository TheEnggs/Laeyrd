// useDraftSaveShortcut.ts
import { useDraft } from "@/contexts/draft-context";
import { useEffect, useRef } from "react";
const DEBOUNCE_DELAY = 1000;
export function useDraftSaveShortcut() {
  const { saveDrafts } = useDraft();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().includes("MAC");
      const isSaveKey =
        (isMac && e.metaKey && e.key.toLowerCase() === "s") ||
        (!isMac && e.ctrlKey && e.key.toLowerCase() === "s");

      if (isSaveKey) {
        e.preventDefault();
        saveDrafts();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [saveDrafts]);
}

export function useDebouncedSave() {
  const { updateByUserCount, saveDrafts } = useDraft();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (updateByUserCount === 0) return;
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
  }, [updateByUserCount, saveDrafts]);
}
