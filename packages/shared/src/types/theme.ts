// new colors
export type Category =
  | "Base"
  | "Editor"
  | "Workbench"
  //   | "Tokens"
  | "Terminal"
  | "UI & Layout"
  | "Extras";

export interface ColorMeta {
  category: Category;
  subcategory: string;
  displayName: string;
  description: string; // ≤ 6 words
  defaultValue?: string;
}

export type ColorMetaGrouped = Record<string, ColorMeta>;

export type TokenCategory =
  | "Comments"
  | "Literals"
  | "Numbers"
  | "Keywords"
  | "Variables"
  | "Functions"
  | "Types"
  | "Operators"
  | "Punctuation";

export type TokenColorMeta = {
  displayName: TokenCategory;
  description: string; // ≤ 6 words
  defaultColor?: string;
  defaultFontStyle?: string;
};

export type TokenColorsList = Record<TokenCategory, TokenColorMeta>;

export type Color = Record<string, string>;

export type TokenColorItem = {
  scope: TokenCategory | TokenCategory[];
  settings: {
    foreground?: string;
    fontStyle?: string;
  };
};

export type SemanticTokenColor = {
  foreground: string;
};

export type SemanticTokenColors = {
  [key: string]: SemanticTokenColor;
};

export type TokenColorItemDetailed = {
  name: string;
  scope: string | string[];
  settings: {
    foreground?: string;
    fontStyle?: string;
  };
};

export type Theme = {
  name: string;
  type: "light" | "dark";
  colors: Color;
  tokenColors: TokenColorItem[];
  semanticTokenColors?: SemanticTokenColors;
};

export type ColorGroups =
  | "base"
  | "editor"
  | "workbench"
  | "text"
  | "actions"
  | "buttons"
  | "terminal"
  | "ui"
  | "uiLayout"
  | "window"
  | "tokens";

// Type definitions for the transformation
export interface ThemeColor {
  id: string;
  name: string;
  description: string;
  defaultValue: string;
  category: string;
}

export interface ColorCategory {
  name: string;
  colors: ThemeColor[];
}

export interface ColorTab {
  id: ColorGroups;
  name: string;
  icon: string;
  categories: ColorCategory[];
}

export type GroupedColors = Record<any, Color>;
export type GroupedTokenColors = Record<
  string,
  {
    foreground?: string;
    fontStyle?: string;
  }
>;
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

export interface SettingsState {
  settings: VSCodeSettings;
  hasChanges: boolean;
  isLoading: boolean;
}
export type DraftColor = Color;
export type DraftToken = {
  tokenColors: Record<string, { foreground?: string; fontStyle?: string }>;
  semanticTokenColors: Record<string, { foreground: string }>;
};
