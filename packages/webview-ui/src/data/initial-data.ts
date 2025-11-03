import { SettingsState, VSCodeSettings } from "@shared/types/theme";

export const initialSettings: VSCodeSettings = {
  fonts: {
    editor: {
      fontSize: 14,
      fontFamily: "Consolas, Monaco, monospace",
      fontWeight: "normal",
      lineHeight: 1.5,
      letterSpacing: 0,
      tabSize: 4,
    },
    terminal: {
      fontSize: 14,
      fontFamily: "Consolas, Monaco, monospace",
      fontWeight: "normal",
      lineHeight: 1.2,
      letterSpacing: 0,
    },
    ui: {
      fontSize: 13,
      fontFamily: "Segoe UI, Tahoma, sans-serif",
      fontWeight: "normal",
      breadcrumbs: { fontSize: 12 },
      statusBar: { fontSize: 12, fontFamily: "Segoe UI, Tahoma, sans-serif" },
      activityBar: { fontSize: 12, fontFamily: "Segoe UI, Tahoma, sans-serif" },
      sideBar: { fontSize: 12, fontFamily: "Segoe UI, Tahoma, sans-serif" },
      menuBar: { fontSize: 12, fontFamily: "Segoe UI, Tahoma, sans-serif" },
      titleBar: { fontSize: 12, fontFamily: "Segoe UI, Tahoma, sans-serif" },
    },
  },
  uiLayout: {
    workbench: {
      sideBarLocation: "left",
      panelLocation: "bottom",
      activityBarLocation: "top",
    },
    zenMode: {
      fullScreen: false,
      centerLayout: true,
      hideLineNumbers: false,
      hideTabs: false,
      hideStatusBar: false,
      hideActivityBar: false,
      hideSideBar: false,
      hideMenuBar: false,
    },
    window: {
      titleBarStyle: "custom",
      menuBarVisibility: "visible",
      zoomLevel: 0,
      nativeFullScreen: false,
      nativeTabs: false,
    },
    editor: {
      showFoldingControls: "mouseover",
      foldingStrategy: "auto",
      showLineNumbers: "on",
      renderLineHighlight: "line",
      renderWhitespace: "selection",
      renderControlCharacters: false,
      renderIndentGuides: true,
      renderValidationDecorations: "on",
      guides: {
        indentation: true,
        bracketPairs: true,
        bracketPairsHorizontal: true,
        highlightActiveIndentation: true,
        highlightActiveBracketPair: true,
      },
    },
    explorer: {
      compactFolders: true,
      sortOrder: "default",
      openEditorsVisible: 9,
      autoReveal: true,
    },
    search: {
      showLineNumbers: true,
      useGlobalIgnoreFiles: true,
      useParentIgnoreFiles: true,
      useIgnoreFiles: true,
      useExcludeSettingsAndIgnoreFiles: true,
      followSymlinks: true,
    },
  },
};

export const initialState: SettingsState = {
  settings: initialSettings,
  hasChanges: false,
  isLoading: false,
};
