import * as vscode from "vscode";
import type { HistoryEntry, HistoryState } from "@src/types/history";
import { log } from "@lib/debug-logs";

export class HistoryController {
  private static instance: HistoryController;
  private context: vscode.ExtensionContext;
  private state: HistoryState;
  private listeners: Array<(history: HistoryState) => void> = [];

  private constructor(context: vscode.ExtensionContext) {
    this.context = context;
    this.state = {
      entries: [],
      maxEntries: 50, // Keep last 50 changes
    };
    this.loadHistory();
  }

  public static getInstance(
    context: vscode.ExtensionContext
  ): HistoryController {
    if (!HistoryController.instance) {
      HistoryController.instance = new HistoryController(context);
    }
    return HistoryController.instance;
  }

  public onHistoryChanged(listener: (history: HistoryState) => void) {
    this.listeners.push(listener);
    // Immediately call with current state
    listener(this.state);
  }

  private notifyHistoryChanged() {
    this.listeners.forEach((cb) => cb(this.state));
  }

  private loadHistory(): void {
    try {
      const savedHistory = this.context.globalState.get<HistoryEntry[]>(
        "themeHistory",
        []
      );
      this.state.entries = savedHistory;
      log(`[HistoryController] Loaded ${savedHistory.length} history entries`);
    } catch (error) {
      console.error("Error loading history:", error);
      this.state.entries = [];
    }
  }

  private saveHistory(): void {
    try {
      this.context.globalState.update("themeHistory", this.state.entries);
      log(
        `[HistoryController] Saved ${this.state.entries.length} history entries`
      );
    } catch (error) {
      console.error("Error saving history:", error);
    }
  }

  public addEntry(entry: Omit<HistoryEntry, "id" | "timestamp">): void {
    const newEntry: HistoryEntry = {
      ...entry,
      id: `history_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };

    // Add to beginning of array
    this.state.entries.unshift(newEntry);

    // Keep only maxEntries
    if (this.state.entries.length > this.state.maxEntries) {
      this.state.entries = this.state.entries.slice(0, this.state.maxEntries);
    }

    this.saveHistory();
    this.notifyHistoryChanged();
    log(`[HistoryController] Added history entry: ${newEntry.description}`);
  }

  public getHistory(): HistoryState {
    return { ...this.state };
  }

  public clearHistory(): void {
    this.state.entries = [];
    this.saveHistory();
    this.notifyHistoryChanged();
    log("[HistoryController] Cleared history");
  }

  public getEntryById(id: string): HistoryEntry | undefined {
    return this.state.entries.find((entry) => entry.id === id);
  }

  public removeEntry(id: string): void {
    this.state.entries = this.state.entries.filter((entry) => entry.id !== id);
    this.saveHistory();
    this.notifyHistoryChanged();
    log(`[HistoryController] Removed history entry: ${id}`);
  }

  // Helper to create description from changes
  public static createDescription(changes: HistoryEntry["changes"]): string {
    const parts = [];

    if (changes.colors && Object.keys(changes.colors).length > 0) {
      parts.push(`${Object.keys(changes.colors).length} color(s)`);
    }

    if (changes.tokenColors && Object.keys(changes.tokenColors).length > 0) {
      parts.push(`${Object.keys(changes.tokenColors).length} token color(s)`);
    }

    if (
      changes.semanticTokenColors &&
      Object.keys(changes.semanticTokenColors).length > 0
    ) {
      parts.push(
        `${Object.keys(changes.semanticTokenColors).length} semantic token(s)`
      );
    }

    if (
      changes.fontLayoutSettings &&
      Object.keys(changes.fontLayoutSettings).length > 0
    ) {
      parts.push(
        `${
          Object.keys(changes.fontLayoutSettings).length
        } font layout setting(s)`
      );
    }

    if (parts.length === 0) {
      return "Settings changed";
    }

    return `Changed ${parts.join(", ")}`;
  }

  public dispose(): void {
    // Clean up if needed
  }
}
