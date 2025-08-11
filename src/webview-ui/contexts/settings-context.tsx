"use client";

import {
  createContext,
  useContext,
  useReducer,
  type ReactNode,
  useEffect,
  useState,
} from "react";
import { GroupedColors, GroupedTokenColors } from "../../types/theme";
import { useVSCodeMessenger } from "@webview/hooks/use-vscode-messenger";
import { themeColors } from "@webview/data/theme-colors";

// ---------- Fonts ----------
export interface FontsSettings {
  editor: {
    fontSize: number;
    fontFamily: string;
    fontWeight:
      | "normal"
      | "bold"
      | "100"
      | "200"
      | "300"
      | "400"
      | "500"
      | "600"
      | "700"
      | "800"
      | "900";
    lineHeight: number;
    letterSpacing: number;
    tabSize: number;
  };
  terminal: {
    fontSize: number;
    fontFamily: string;
    fontWeight:
      | "normal"
      | "bold"
      | "100"
      | "200"
      | "300"
      | "400"
      | "500"
      | "600"
      | "700"
      | "800"
      | "900";
    lineHeight: number;
    letterSpacing: number;
  };
  ui: {
    fontSize: number;
    fontFamily: string;
    fontWeight:
      | "normal"
      | "bold"
      | "100"
      | "200"
      | "300"
      | "400"
      | "500"
      | "600"
      | "700"
      | "800"
      | "900";
    breadcrumbs: { fontSize: number };
    statusBar: { fontSize: number; fontFamily: string };
    activityBar: { fontSize: number; fontFamily: string };
    sideBar: { fontSize: number; fontFamily: string };
    menuBar: { fontSize: number; fontFamily: string };
    titleBar: { fontSize: number; fontFamily: string };
  };
}

// ---------- UI layout ----------
export interface UiLayoutSettings {
  workbench: {
    sideBarLocation: "left" | "right";
    panelLocation: "bottom" | "right" | "left";
    activityBarLocation: "top" | "bottom";
  };
  zenMode: {
    fullScreen: boolean;
    centerLayout: boolean;
    hideLineNumbers: boolean;
    hideTabs: boolean;
    hideStatusBar: boolean;
    hideActivityBar: boolean;
    hideSideBar: boolean;
    hideMenuBar: boolean;
  };
  window: {
    titleBarStyle: "custom" | "native";
    menuBarVisibility: "visible" | "toggle" | "hidden";
    zoomLevel: number;
    nativeFullScreen: boolean;
    nativeTabs: boolean;
  };
  editor: {
    showFoldingControls: "always" | "mouseover";
    foldingStrategy: "auto" | "indentation";
    showLineNumbers: "on" | "off" | "relative";
    renderLineHighlight: "all" | "line" | "none" | "gutter";
    renderWhitespace:
      | "none"
      | "boundary"
      | "mark"
      | "selection"
      | "trailing"
      | "all";
    renderControlCharacters: boolean;
    renderIndentGuides: boolean;
    renderValidationDecorations: "on" | "off" | "editable";
    guides: {
      indentation: boolean;
      bracketPairs: boolean;
      bracketPairsHorizontal: boolean;
      highlightActiveIndentation: boolean;
      highlightActiveBracketPair: boolean;
    };
  };
  explorer: {
    compactFolders: boolean;
    sortOrder:
      | "default"
      | "mixed"
      | "filesFirst"
      | "type"
      | "modified"
      | "foldersNestsFiles";
    openEditorsVisible: number;
    autoReveal: boolean;
  };
  search: {
    showLineNumbers: boolean;
    useGlobalIgnoreFiles: boolean;
    useParentIgnoreFiles: boolean;
    useIgnoreFiles: boolean;
    useExcludeSettingsAndIgnoreFiles: boolean;
    followSymlinks: boolean;
  };
}

export interface VSCodeSettings {
  fonts: FontsSettings;
  uiLayout: UiLayoutSettings;
}

interface SettingsState {
  settings: VSCodeSettings;
  hasChanges: boolean;
  isLoading: boolean;
}

// ---------- Actions ----------
export type FontAction = {
  type: "UPDATE_FONT_BY_PATH";
  path: string;
  value: any;
};
export type ColorsAction = {
  type: "SET_COLORS";
  colors: Record<string, string>; // id -> value
};
export type TokenColorsAction = {
  type: "SET_TOKEN_COLORS";
  tokenColors: GroupedTokenColors;
};
export type UiLayoutAction = {
  type: "UPDATE_UI_LAYOUT_BY_PATH";
  path: string;
  value: any;
};

export type SettingsAction =
  | FontAction
  | ColorsAction
  | TokenColorsAction
  | UiLayoutAction;

// ---------- Initial state ----------
const initialSettings: VSCodeSettings = {
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

const initialState: SettingsState = {
  settings: initialSettings,
  hasChanges: false,
  isLoading: false,
};

function fontsReducer(
  state: FontsSettings,
  action: SettingsAction
): FontsSettings {
  switch (action.type) {
    case "UPDATE_FONT_BY_PATH":
      return {
        ...state,
        [action.path]: action.value as any,
      } as FontsSettings;
    default:
      return state;
  }
}

// Build a lookup set of valid color ids from theme-colors.ts
const VALID_COLOR_IDS: Set<string> = (() => {
  const ids = new Set<string>();
  for (const tab of themeColors) {
    for (const cat of tab.categories) {
      for (const color of cat.colors) {
        ids.add(color.id);
      }
    }
  }
  return ids;
})();

// Map GroupedColors (category -> key -> value) to id -> value, filtered by known ids
function mapGroupedColorsToIds(grouped: GroupedColors): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [category, entries] of Object.entries(grouped)) {
    for (const [key, value] of Object.entries(entries)) {
      const id = `${category}.${key}`;
      if (VALID_COLOR_IDS.has(id)) {
        out[id] = value;
      }
    }
  }
  return out;
}

function colorsReducer(
  state: Record<string, string>,
  action: ColorsAction
): Record<string, string> {
  switch (action.type) {
    case "SET_COLORS":
      return { ...state, ...action.colors };
    default:
      return state;
  }
}

function tokenColorsReducer(
  state: GroupedTokenColors,
  action: TokenColorsAction
): GroupedTokenColors {
  switch (action.type) {
    case "SET_TOKEN_COLORS":
      return action.tokenColors;
    default:
      return state;
  }
}

function uiLayoutReducer(
  state: UiLayoutSettings,
  action: SettingsAction
): UiLayoutSettings {
  switch (action.type) {
    case "UPDATE_UI_LAYOUT_BY_PATH":
      return {
        ...state,
        [action.path]: action.value as any,
      } as UiLayoutSettings;
    default:
      return state;
  }
}

type ThemeState = {
  colors: Record<string, string>; // id -> value
  tokenColors: GroupedTokenColors;
};

interface SettingsContextType {
  colorsState: ThemeState["colors"];
  colorsDispatch: (action: ColorsAction) => void;
  tokenColorsState: ThemeState["tokenColors"];
  tokenColorsDispatch: (action: TokenColorsAction) => void;
  hasChanges: boolean;
  isLoading: boolean;
  markChanged: () => void;
  setLoading: (loading: boolean) => void;
  themesList?: { label: string; path: string; uiTheme?: string }[];
  activeThemeLabel?: string;
  state: {
    settings: {
      editor: FontsSettings["editor"];
      terminal: FontsSettings["terminal"];
      ui: FontsSettings["ui"];
      layout: UiLayoutSettings;
      workbench: UiLayoutSettings["workbench"];
    };
    hasChanges: boolean;
    isLoading: boolean;
  };
  updateSetting: (section: string, key: string, value: any) => void;
  // Preview popover control
  previewOpen: boolean;
  previewAnchor?: { top: number; left: number; width: number; height: number };
  openPreviewAt: (anchor: {
    top: number;
    left: number;
    width: number;
    height: number;
  }) => void;
  closePreview: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined
);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [colorsState, colorsDispatch] = useReducer(
    colorsReducer,
    {} as Record<string, string>
  );
  const [tokenColorsState, tokenColorsDispatch] = useReducer(
    tokenColorsReducer,
    {} as GroupedTokenColors
  );

  const [meta, setMeta] = useReducer(
    (s: { hasChanges: boolean; isLoading: boolean }, a: any) => ({
      ...s,
      ...a,
    }),
    { hasChanges: false, isLoading: false }
  );

  const [themesList, setThemesList] = useState<
    { label: string; path: string; uiTheme?: string }[]
  >([]);
  const [activeThemeLabel, setActiveThemeLabel] = useState<string | undefined>(
    undefined
  );

  // Preview popover state
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewAnchor, setPreviewAnchor] = useState<
    { top: number; left: number; width: number; height: number } | undefined
  >(undefined);

  // Local UI settings state used by font/layout editors
  const [uiSettings, setUiSettings] = useState({
    editor: initialSettings.fonts.editor,
    terminal: initialSettings.fonts.terminal,
    ui: initialSettings.fonts.ui,
    layout: initialSettings.uiLayout,
    workbench: initialSettings.uiLayout.workbench,
  });

  const { postMessage } = useVSCodeMessenger((msg) => {
    if (!msg) return;
    switch (msg.command) {
      case "GET_THEME_COLORS":
        console.log("GET_THEME_COLORS", msg.payload);
        colorsDispatch({
          type: "SET_COLORS",
          colors: mapGroupedColorsToIds(msg.payload as GroupedColors),
        });
        break;
      case "GET_THEME_TOKEN_COLORS":
        tokenColorsDispatch({
          type: "SET_TOKEN_COLORS",
          tokenColors: msg.payload as GroupedTokenColors,
        });
        break;
      case "GET_THEMES_LIST":
        setThemesList(msg.payload?.themes || []);
        setActiveThemeLabel(msg.payload?.active);
        break;
      case "SAVE_SUCCESS":
        setMeta({ isLoading: false, hasChanges: false });
        break;
      default:
        break;
    }
  });

  useEffect(() => {
    // Request initial values on mount
    postMessage({ command: "GET_THEME_COLORS" });
    postMessage({ command: "GET_THEME_TOKEN_COLORS" });
    postMessage({ command: "GET_THEMES_LIST" });
  }, [postMessage]);

  // Compose settings state from local UI state
  const settingsState = {
    settings: uiSettings,
    hasChanges: meta.hasChanges,
    isLoading: meta.isLoading,
  };

  const updateSetting = (section: string, key: string, value: any) => {
    setUiSettings((prev: any) => {
      const next = { ...prev } as any;
      if (section === "editor" || section === "terminal" || section === "ui") {
        next[section] = { ...(next[section] || {}), [key]: value };
      } else if (section === "layout") {
        next.layout = { ...(next.layout || {}), [key]: value };
      } else if (section === "workbench") {
        next.workbench = { ...(next.workbench || {}), [key]: value };
      } else {
        next[section] = { ...(next[section] || {}), [key]: value };
      }
      return next;
    });
    setMeta({ hasChanges: true });
  };

  const openPreviewAt = (anchor: {
    top: number;
    left: number;
    width: number;
    height: number;
  }) => {
    setPreviewAnchor(anchor);
    setPreviewOpen(true);
  };

  const closePreview = () => setPreviewOpen(false);

  return (
    <SettingsContext.Provider
      value={{
        colorsState,
        colorsDispatch,
        tokenColorsState,
        tokenColorsDispatch,
        hasChanges: meta.hasChanges,
        isLoading: meta.isLoading,
        markChanged: () => setMeta({ hasChanges: true }),
        setLoading: (loading: boolean) => setMeta({ isLoading: loading }),
        themesList,
        activeThemeLabel,
        state: settingsState,
        updateSetting,
        previewOpen,
        previewAnchor,
        openPreviewAt,
        closePreview,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
