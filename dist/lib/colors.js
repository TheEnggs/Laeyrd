"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ColorCategories = exports.mainTabs = void 0;
exports.mainTabs = [
    "Base",
    "Editor",
    "Workbench",
    //   "Tokens",
    "Terminal",
    "UI & Layout",
    "Extras",
];
exports.ColorCategories = {
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
};
