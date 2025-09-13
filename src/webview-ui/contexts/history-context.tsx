"use client";

import { createContext, useContext, useEffect, ReactNode } from "react";
import { useMutation } from "@webview/hooks/use-query";
import { HistoryController } from "../../extension/controller/history";
import { HistoryEntry } from "../../types/history";
import { useSettings } from "./settings-context";

interface HistoryContextType {
  addHistoryEntry: (entry: Omit<HistoryEntry, "id" | "timestamp">) => void;
}

const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

export function HistoryProvider({ children }: { children: ReactNode }) {
  const { draftColorState, draftFontLayoutState, draftTokenState } =
    useSettings();

  const { mutate: addHistoryEntryMutation } = useMutation("ADD_HISTORY_ENTRY");

  const addHistoryEntry = (entry: Omit<HistoryEntry, "id" | "timestamp">) => {
    addHistoryEntryMutation(entry);
  };

  // Track changes and create history entries when state changes significantly
  useEffect(() => {
    // Create a debounced function to avoid too many history entries
    const debounceTimer = setTimeout(() => {
      const hasChanges =
        Object.keys(draftColorState).length > 0 ||
        Object.keys(draftFontLayoutState).length > 0 ||
        Object.keys(draftTokenState.tokenColors).length > 0 ||
        Object.keys(draftTokenState.semanticTokenColors).length > 0;

      if (hasChanges) {
        // Determine type
        let type: HistoryEntry["type"] = "both";
        const hasThemeChanges =
          Object.keys(draftColorState).length > 0 ||
          Object.keys(draftTokenState.tokenColors).length > 0 ||
          Object.keys(draftTokenState.semanticTokenColors).length > 0;
        const hasSettingsChanges = Object.keys(draftFontLayoutState).length > 0;

        if (hasThemeChanges && !hasSettingsChanges) {
          type = "theme";
        } else if (hasSettingsChanges && !hasThemeChanges) {
          type = "settings";
        }

        // Create changes object
        const changes: HistoryEntry["changes"] = {};
        const originalValues: HistoryEntry["originalValues"] = {};

        if (Object.keys(draftColorState).length > 0) {
          changes.colors = { ...draftColorState };
          // Note: We need original values to reset properly
          // These would need to be captured from the theme controller
          originalValues.colors = {};
        }

        if (Object.keys(draftTokenState.tokenColors).length > 0) {
          changes.tokenColors = { ...draftTokenState.tokenColors };
          originalValues.tokenColors = {};
        }

        if (Object.keys(draftTokenState.semanticTokenColors).length > 0) {
          changes.semanticTokenColors = {
            ...draftTokenState.semanticTokenColors,
          };
          originalValues.semanticTokenColors = {};
        }

        if (Object.keys(draftFontLayoutState).length > 0) {
          changes.fontLayoutSettings = { ...draftFontLayoutState };
          originalValues.fontLayoutSettings = {};
        }

        // Create description
        const description = HistoryController.createDescription(changes);

        // Note: This is a simplified version. In a real implementation,
        // we'd want to capture the original values properly and only
        // create history entries on actual saves or major changes
        // addHistoryEntry({
        //   description,
        //   type,
        //   changes,
        //   originalValues,
        // });
      }
    }, 2000); // 2 second debounce

    return () => clearTimeout(debounceTimer);
  }, [
    draftColorState,
    draftFontLayoutState,
    draftTokenState,
    addHistoryEntryMutation,
  ]);

  return (
    <HistoryContext.Provider
      value={{
        addHistoryEntry,
      }}
    >
      {children}
    </HistoryContext.Provider>
  );
}

export function useHistory() {
  const context = useContext(HistoryContext);
  if (context === undefined) {
    throw new Error("useHistory must be used within a HistoryProvider");
  }
  return context;
}
