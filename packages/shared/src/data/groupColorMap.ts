import * as path from "path";
import * as fs from "fs";
import { ColorMetaGrouped, GroupName } from "../types/theme";
import { colorCategoryMap } from "./oldcolorsList";

export const editorColorMap = {
  "editor.background": "bg",
  "editor.foreground": "tx",
  "editor.hoverHighlightBackground": "ui_2",
  "editor.lineHighlightBackground": "bg_2",
  "editor.selectionBackground": "ui_3",
  "editor.selectionHighlightBackground": "tx_3",
  "editor.wordHighlightBackground": "ui_2",
  "editor.wordHighlightStrongBackground": "ui",
  "editor.findMatchBackground": "pr",
  "editor.findMatchHighlightBackground": "pr",
  "editor.findRangeHighlightBackground": "bg_2",
  "editor.inactiveSelectionBackground": "ui_3",
  "editor.lineHighlightBorder": "ui",
  "editor.rangeHighlightBackground": "bg_2",
  "editorWhitespace.foreground": "ui",
  "editorIndentGuide.background1": "ui_2",
  "editorHoverWidget.background": "ui",
  "editorLineNumber.activeForeground": "tx",
  "editorLineNumber.foreground": "ui_3",
  "editorGutter.background": "bg",
  "editorGutter.modifiedBackground": "ac_2",
  "editorGutter.addedBackground": "ac_2",
  "editorGutter.deletedBackground": "sc",
  "editorBracketMatch.background": "ui",
  "editorBracketMatch.border": "ui_2",
  "editorGroupHeader.tabsBackground": "bg",
  "editorGroup.border": "ui_2",
  "tab.activeBackground": "bg",
  "tab.inactiveBackground": "bg_2",
  "tab.inactiveForeground": "tx_2",
  "tab.activeForeground": "tx",
  "tab.hoverBackground": "ui_2",
  "tab.unfocusedHoverBackground": "ui_2",
  "tab.border": "ui_2",
  "tab.activeModifiedBorder": "pr",
  "tab.inactiveModifiedBorder": "sc",
  "editorWidget.background": "bg_2",
  "editorWidget.border": "ui_2",
  "editorSuggestWidget.background": "bg",
  "editorSuggestWidget.border": "ui_2",
  "editorSuggestWidget.foreground": "tx",
  "editorSuggestWidget.highlightForeground": "tx_2",
  "editorSuggestWidget.selectedBackground": "ui_2",
  "panel.background": "bg",
  "panel.border": "ui_2",
  "panelTitle.activeBorder": "ui_3",
  "panelTitle.activeForeground": "tx",
  "panelTitle.inactiveForeground": "tx_2",
  "statusBar.background": "bg",
  "statusBar.foreground": "tx",
  "statusBar.border": "ui_2",
  "statusBar.debuggingBackground": "sc",
  "statusBar.debuggingForeground": "tx",
  "titleBar.activeBackground": "bg",
  "titleBar.activeForeground": "tx",
  "titleBar.inactiveBackground": "bg_2",
  "titleBar.inactiveForeground": "tx_2",
  "titleBar.border": "ui_2",
  "menu.foreground": "tx",
  "menu.background": "bg",
  "menu.selectionForeground": "tx",
  "menu.selectionBackground": "ui_2",
  "menu.border": "ui_2",
  "terminal.foreground": "tx",
  "terminal.background": "bg",
  "terminalCursor.foreground": "tx",
  "terminalCursor.background": "bg",
  "terminal.ansiRed": "sc",
  "terminal.ansiGreen": "ac_2",
  "terminal.ansiYellow": "pr",
  "terminal.ansiBlue": "sc",
  "terminal.ansiMagenta": "ac_2",
  "terminal.ansiCyan": "ac_2",
  "activityBar.background": "bg",
  "activityBar.foreground": "tx",
  "activityBar.inactiveForeground": "tx_2",
  "activityBar.activeBorder": "tx",
  "activityBar.border": "ui_2",
  "sideBar.background": "bg",
  "sideBar.foreground": "tx",
  "sideBar.border": "ui_2",
  "sideBarTitle.foreground": "tx",
  "sideBarSectionHeader.background": "bg_2",
  "sideBarSectionHeader.foreground": "tx",
  "sideBarSectionHeader.border": "ui_2",
  "list.foreground": "tx",
  "list.inactiveSelectionBackground": "ui_2",
  "list.activeSelectionBackground": "ui_3",
  "list.inactiveSelectionForeground": "tx",
  "list.activeSelectionForeground": "tx",
  "list.focusOutline": "pr",
  "list.hoverForeground": "tx",
  "list.hoverBackground": "ui_2",
  "input.background": "bg_2",
  "input.foreground": "tx",
  "input.border": "ui_2",
  "input.placeholderForeground": "tx_2",
  "dropdown.background": "bg_2",
  "dropdown.foreground": "tx",
  "dropdown.border": "ui_2",
  "dropdown.listBackground": "bg",
  "badge.background": "sc",
  "activityBarBadge.background": "sc",
  "button.background": "sc",
  "button.foreground": "bg",
  "badge.foreground": "bg",
  "activityBarBadge.foreground": "bg",
};

// Concrete mapping implementation
export const schemaToGroupName: Record<string, GroupName> = {
  bg: "primary_background",
  bg_2: "secondary_background",

  ui: "border",
  ui_2: "border_hover",
  ui_3: "border_active",

  tx: "primary_text",
  tx_2: "muted_text",
  tx_3: "faint_text",

  pr: "primary_accent",
  sc: "secondary_accent",

  ac_1: "accent_1",
  ac_2: "accent_2",
  ac_3: "accent_3",
};
function applyGroupNamesToColorMetaInPlace(): void {
  const colors = { ...colorCategoryMap };
  for (const [token, meta] of Object.entries(colors)) {
    if (!(token in editorColorMap)) continue;

    const paletteKey: string = editorColorMap[token];
    const groupName = schemaToGroupName[paletteKey];

    meta.groupName = groupName ?? undefined;
  }
  const filePath = path.join(__dirname, "/newColorList.ts");
  fs.writeFileSync(filePath, JSON.stringify(colors, null, 2));
}

applyGroupNamesToColorMetaInPlace();
