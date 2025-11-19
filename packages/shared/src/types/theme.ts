import z from "zod";
// new colors
export type Category =
  | "Base"
  | "Editor"
  | "Workbench"
  //   | "Tokens"
  | "Terminal"
  | "UI & Layout"
  | "Extras";

// All allowed group names as string literal union
export type GroupName =
  | "primary_background"
  | "secondary_background"
  | "border"
  | "border_hover"
  | "border_active"
  | "primary_text"
  | "muted_text"
  | "faint_text"
  | "primary_accent"
  | "secondary_accent"
  | "accent_1"
  | "accent_2"
  | "accent_3";
export interface ColorMeta {
  category: Category;
  displayName: string;
  description: string; // ≤ 6 words
  subcategory?: string;
  defaultValue?: string;
  groupName?: GroupName;
}

export type ColorMetaGrouped = Record<string, ColorMeta>;

export type TokenCategory =
  | "comment"
  | "literal"
  | "keyword"
  | "variable"
  | "constant"
  | "parameter"
  | "function"
  | "class"
  | "interface"
  | "enum"
  | "type"
  | "number"
  | "operator"
  | "punctuation"
  | "property"
  | "annotation"
  | "builtin"
  | "namespace"
  | "tag"
  | "attribute"
  | "escapesequence"
  | "invalid"
  | "macro";

export type TokenColorMeta = {
  displayName: string;
  description: string; // ≤ 6 words
  defaultColor?: string;
  defaultFontStyle?: string;
};

export type TokenColorsList = Record<TokenCategory, TokenColorMeta>;

export type Color = Record<string, string>;

export type TokenColorItem = {
  name?: string;
  scope: TokenCategory | TokenCategory[];
  settings: {
    foreground?: string;
    fontStyle?: string;
  };
};

export type SemanticTokenColor = {
  foreground: string;
};

export type SemanticTokenColors = Record<string, SemanticTokenColor>;

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
  semanticTokenColors: Record<string, string>;
};

export const draftState = z.object({
  colorCustomization: z.record(
    z.string(), // key
    z.string() // hex color string
  ),
  tokenCustomization: z.record(
    z.string(),
    z.string() // token colors also just hex strings
  ),
  semanticTokenCustomization: z.record(
    z.string(), // key
    z.string() // hex color string
  ),
  settingsCustomization: z.record(
    z.string(),
    z.union([z.string(), z.number(), z.boolean()]) // settings can be mixed type
  ),
});

export const draftFile = z.object({
  themeName: z.string().optional(),
  oldSettings: draftState,
  draftState: draftState,
  lastUpdatedOn: z.string(),
  isContentSaved: z.boolean(),
  isEditing: z.boolean(),
  isSettingsRestored: z.boolean(),
});

export type DraftFile = z.infer<typeof draftFile>;
export type DraftState = z.infer<typeof draftState>;
export type DraftStatePayload =
  | {
      type: "color";
      key: string;
      value: string; // e.g., "#ff0000"
    }
  | {
      type: "token";
      key: string;
      value: string; // usually hex color
    }
  | {
      type: "semanticToken";
      key: string;
      value: string; // VS Code style
    }
  | {
      type: "settings";
      key: string;
      value: boolean | number | string; // editor settings etc.
    };

export type DraftStatePayloadKeys = DraftStatePayload["type"];

export type DraftChangeHandlerMap = {
  color: (key: string, value: string) => void;
  token: (key: string, value: string) => void;
  semanticToken: (key: string, value: string) => void;
  settings: (key: string, value: string | number | boolean) => void;
};
