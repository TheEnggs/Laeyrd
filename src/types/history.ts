export interface HistoryEntry {
  id: string;
  timestamp: number;
  description: string;
  type: "theme" | "settings" | "both";
  changes: {
    colors?: Record<string, string>;
    tokenColors?: Record<string, { foreground?: string; fontStyle?: string }>;
    semanticTokenColors?: Record<string, { foreground: string }>;
    fontLayoutSettings?: Record<string, any>;
  };
  // Store original values for easy reset
  originalValues: {
    colors?: Record<string, string>;
    tokenColors?: Record<string, { foreground?: string; fontStyle?: string }>;
    semanticTokenColors?: Record<string, { foreground: string }>;
    fontLayoutSettings?: Record<string, any>;
  };
}

export interface HistoryState {
  entries: HistoryEntry[];
  maxEntries: number;
}

export type HistoryAction =
  | { type: "ADD_ENTRY"; entry: HistoryEntry }
  | { type: "CLEAR_HISTORY" }
  | { type: "SET_HISTORY"; entries: HistoryEntry[] }
  | { type: "RESET_TO_ENTRY"; entryId: string };
