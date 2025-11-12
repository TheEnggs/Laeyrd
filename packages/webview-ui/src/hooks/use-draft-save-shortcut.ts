// useDraftSaveShortcut.ts
import { useDraft } from "@/contexts/draft-context";
import { useEffect } from "react";

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
