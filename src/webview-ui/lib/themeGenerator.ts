import type { editor as MonacoEditor } from "monaco-editor";

type ColorsMap = Record<string, string | undefined>;

function pick(colors: ColorsMap, key: string, fallback?: string) {
  return colors[key] ?? fallback;
}

export function generateMonacoTheme(
  colors: ColorsMap,
  base: "vs" | "vs-dark" | "hc-black" = "vs-dark"
): MonacoEditor.IStandaloneThemeData {
  const themeColors: Record<string, string> = {};

  function set(key: string, sourceKey: string, fallback?: string) {
    const val = pick(colors, sourceKey, fallback);
    if (val) themeColors[key] = val;
  }

  // Core editor colors
  set("editor.background", "editor.background", "#1e1e1e");
  set("editor.foreground", "editor.foreground", "#d4d4d4");
  set(
    "editor.lineHighlightBackground",
    "editor.lineHighlightBackground",
    "#2a2a2a"
  );
  set("editor.selectionBackground", "editor.selectionBackground", "#264f78");
  set(
    "editor.inactiveSelectionBackground",
    "editor.inactiveSelectionBackground",
    "#3a3d41"
  );
  set(
    "editor.selectionHighlightBackground",
    "editor.selectionHighlightBackground",
    "#314365"
  );

  // Cursor & line numbers
  set("editorCursor.foreground", "editorCursor.foreground", "#aeafad");
  set("editorLineNumber.foreground", "editorLineNumber.foreground", "#858585");
  set(
    "editorLineNumber.activeForeground",
    "editorLineNumber.activeForeground",
    "#c6c6c6"
  );

  // Whitespace and guides
  set("editorWhitespace.foreground", "editorWhitespace.foreground", "#3b3a32");
  set(
    "editorIndentGuide.background",
    "editorIndentGuide.background",
    "#404040"
  );
  set(
    "editorIndentGuide.activeBackground",
    "editorIndentGuide.activeBackground",
    "#707070"
  );

  // Bracket match
  set(
    "editorBracketMatch.background",
    "editorBracketMatch.background",
    "#515c6a80"
  );
  set("editorBracketMatch.border", "editorBracketMatch.border", "#c1c1c1");

  // Find/word highlight
  set("editor.findMatchBackground", "editor.findMatchBackground", "#515c6a");
  set(
    "editor.findMatchHighlightBackground",
    "editor.findMatchHighlightBackground",
    "#ea5c0055"
  );
  set(
    "editor.wordHighlightBackground",
    "editor.wordHighlightBackground",
    "#575757b8"
  );
  set(
    "editor.wordHighlightStrongBackground",
    "editor.wordHighlightStrongBackground",
    "#004972b8"
  );

  // Gutter/overview
  set(
    "editorGutter.background",
    "editorGutter.background",
    pick(colors, "editor.background", "#1e1e1e")
  );
  set("editorOverviewRuler.border", "editorOverviewRuler.border", "#7f7f7f4d");

  // Markers
  set("editorError.foreground", "editorError.foreground", "#f14c4c");
  set("editorWarning.foreground", "editorWarning.foreground", "#cca700");
  set("editorInfo.foreground", "editorInfo.foreground", "#3794ff");

  // Minimap
  set(
    "minimap.background",
    "minimap.background",
    pick(colors, "editor.background", "#1e1e1e")
  );
  set(
    "minimap.selectionHighlight",
    "minimap.selectionHighlight",
    pick(colors, "editor.selectionBackground", "#264f78")
  );

  return {
    base,
    inherit: true,
    rules: [],
    colors: themeColors,
  };
}
