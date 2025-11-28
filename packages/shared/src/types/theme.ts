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
export const GROUP_NAMES = [
  "primary_background",
  "secondary_background",
  "border",
  "border_hover",
  "border_active",
  "primary_text",
  "muted_text",
  "faint_text",
  "primary_accent",
  "secondary_accent",
  "accent_1",
  "accent_2",
  "accent_3",
] as const;

export type GroupName = typeof GROUP_NAMES[number];

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
  preferredType: "textmate" | "semantic";
  defaultColor?: string;
  defaultFontStyle?: TokenColorSettings["fontStyle"];
};

export type TokenColorsList = Record<TokenCategory, TokenColorMeta>;

export type Color = Record<string, string>;

export type TextMateTokenRule = {
  name?: string;
  scope: string[];
  settings: TokenColorSettings;
};

export type UserTokenColors = Record<string, TokenColorSettings>;

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

export type DraftColor = Color;
export type DraftToken = {
  tokenColors: Record<string, TokenColorSettings>;
  userTokenColors: Record<string, string>;
};

const tokenStyleSchema = z.enum(["bold", "italic", "underline", "none"]);

const tokenColorSettings = z.object({
  foreground: z.string().optional(),
  fontStyle: tokenStyleSchema.optional(),
});

export const draftState = z.object({
  colorCustomization: z.record(
    z.string(), // key
    z.string() // hex color string
  ),
  tokenCustomization: z.record(
    z.string(),
    tokenColorSettings
  ),
  semanticTokenCustomization: z.record(
    z.string(), 
    tokenColorSettings
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

export type TokenColorSettings = z.infer<typeof tokenColorSettings>;
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
      value: TokenColorSettings; // usually hex color
    }
  | {
      type: "semanticToken";
      key: string;
      value: TokenColorSettings;
    }
  | {
      type: "settings";
      key: string;
      value: boolean | number | string; // editor settings etc.
    };

export type DraftStatePayloadKeys = DraftStatePayload["type"];

export type DraftChangeHandlerMap = {
  color: (key: string, value: string) => void;
  token: (key: string, value: TokenColorSettings) => void;
  semanticToken: (key: string, value: TokenColorSettings) => void;
  settings: (key: string, value: string | number | boolean) => void;
};


export interface ThemeJson {
  name: string;
  type: "light" | "dark" | "high contrast";
  semanticHighlighting: boolean;
  colors: Record<string, string>;
  semanticTokenColors: Record<string, string | TokenColorSettings>;
  tokenColors: TextMateTokenRule[];
}