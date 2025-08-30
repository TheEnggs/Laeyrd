import { Category } from "../types/theme";

export const mainTabs: Category[] = [
  "Base",
  "Editor",
  "Workbench",
  //   "Tokens",
  "Terminal",
  "UI & Layout",
  "Extras",
];

export const ColorCategories: Record<Category, string[]> = {
  Base: ["Core", "Selection", "Borders"],
  Editor: ["Core", "Selection", "Widgets", "Guides"],
  Workbench: ["Activity Bar", "Side Bar", "Status Bar", "Title Bar", "Panel"],
  Terminal: ["Core", "ANSI Colors"],
  //   Tokens: [
  //     "Comments",
  //     "Keywords",
  //     "Strings",
  //     "Variables",
  //     "Functions",
  //     "Types",
  //   ],
  "UI & Layout": ["Buttons", "Dropdowns", "Inputs", "Scrollbars", "Minimap"],
  Extras: ["Debug", "Notifications", "Extensions"],
} as const;
