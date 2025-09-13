"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HistoryController = void 0;
const debug_logs_1 = require("../../lib/debug-logs");
class HistoryController {
    constructor(context) {
        this.listeners = [];
        this.context = context;
        this.state = {
            entries: [],
            maxEntries: 50, // Keep last 50 changes
        };
        this.loadHistory();
    }
    static getInstance(context) {
        if (!HistoryController.instance) {
            HistoryController.instance = new HistoryController(context);
        }
        return HistoryController.instance;
    }
    onHistoryChanged(listener) {
        this.listeners.push(listener);
        // Immediately call with current state
        listener(this.state);
    }
    notifyHistoryChanged() {
        this.listeners.forEach((cb) => cb(this.state));
    }
    loadHistory() {
        try {
            const savedHistory = this.context.globalState.get("themeHistory", []);
            this.state.entries = savedHistory;
            (0, debug_logs_1.log)(`[HistoryController] Loaded ${savedHistory.length} history entries`);
        }
        catch (error) {
            console.error("Error loading history:", error);
            this.state.entries = [];
        }
    }
    saveHistory() {
        try {
            this.context.globalState.update("themeHistory", this.state.entries);
            (0, debug_logs_1.log)(`[HistoryController] Saved ${this.state.entries.length} history entries`);
        }
        catch (error) {
            console.error("Error saving history:", error);
        }
    }
    addEntry(entry) {
        const newEntry = {
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
        (0, debug_logs_1.log)(`[HistoryController] Added history entry: ${newEntry.description}`);
    }
    getHistory() {
        return { ...this.state };
    }
    clearHistory() {
        this.state.entries = [];
        this.saveHistory();
        this.notifyHistoryChanged();
        (0, debug_logs_1.log)("[HistoryController] Cleared history");
    }
    getEntryById(id) {
        return this.state.entries.find((entry) => entry.id === id);
    }
    removeEntry(id) {
        this.state.entries = this.state.entries.filter((entry) => entry.id !== id);
        this.saveHistory();
        this.notifyHistoryChanged();
        (0, debug_logs_1.log)(`[HistoryController] Removed history entry: ${id}`);
    }
    // Helper to create description from changes
    static createDescription(changes) {
        const parts = [];
        if (changes.colors && Object.keys(changes.colors).length > 0) {
            parts.push(`${Object.keys(changes.colors).length} color(s)`);
        }
        if (changes.tokenColors && Object.keys(changes.tokenColors).length > 0) {
            parts.push(`${Object.keys(changes.tokenColors).length} token color(s)`);
        }
        if (changes.semanticTokenColors &&
            Object.keys(changes.semanticTokenColors).length > 0) {
            parts.push(`${Object.keys(changes.semanticTokenColors).length} semantic token(s)`);
        }
        if (changes.fontLayoutSettings &&
            Object.keys(changes.fontLayoutSettings).length > 0) {
            parts.push(`${Object.keys(changes.fontLayoutSettings).length} font layout setting(s)`);
        }
        if (parts.length === 0) {
            return "Settings changed";
        }
        return `Changed ${parts.join(", ")}`;
    }
    dispose() {
        // Clean up if needed
    }
}
exports.HistoryController = HistoryController;
