import { ThemeJson, TokenColorSettings, TokenColorsList, UserTokenColors } from "../../types/theme";
import { normalizeTokenMapKey } from "./normalizeTokenMapColors";
import { TextMateScopeMap } from "./textMateScopeMap";


// NOTE: This list now contains the user-friendly definitions and default styles.

export const tokenColorMap: TokenColorsList = {
  comment: {
    displayName: "Comments",
    description: "Color for code comments",
    defaultColor: "#6A9955",
    defaultFontStyle: "italic",
  },
  literal: {
    displayName: "Literals",
    description: "Color for string literals",
    defaultColor: "#CE9178",
    defaultFontStyle: "none",
  },
  keyword: {
    displayName: "Keywords",
    description: "Color for keywords and control flow statements",
    defaultColor: "#569CD6",
    defaultFontStyle: "bold",
  },
  variable: {
    displayName: "Variables",
    description: "Color for variable names",
    defaultColor: "#9CDCFE",
    defaultFontStyle: "none",
  },
  constant: {
    displayName: "Constants",
    description: "Color for constant variables",
    defaultColor: "#4FC1FF",
    defaultFontStyle: "none",
    },
  parameter: {
    displayName: "Parameters",
    description: "Color for function parameters",
    defaultColor: "#9CDCFE",
    defaultFontStyle: "italic",
  },
  function: {
    displayName: "Functions",
    description: "Color for function and method names",
    defaultColor: "#DCDCAA",
    defaultFontStyle: "none",
  },
  class: {
    displayName: "Classes",
    description: "Color for class names",
    defaultColor: "#4EC9B0",
    defaultFontStyle: "none",
  },
  interface: {
    displayName: "Interfaces",
    description: "Color for interface names",
    defaultColor: "#B8D7A3",
    defaultFontStyle: "none",
  },
  enum: {
    displayName: "Enums",
    description: "Color for enumerations",
    defaultColor: "#B8D7A3",
    defaultFontStyle: "none",
  },
  type: {
    displayName: "Types",
    description: "Color for type annotations and type names",
    defaultColor: "#4EC9B0",
    defaultFontStyle: "none",
  },
  number: {
    displayName: "Numbers",
    description: "Color for numeric literals",
    defaultColor: "#B5CEA8",
    defaultFontStyle: "none",
  },
  macro: {
    displayName: "Macros",
    description: "Color for macros",
    defaultColor: "#B5CEA8",
    defaultFontStyle: "none",
  },
  operator: {
    displayName: "Operators",
    description: "Color for operators",
    defaultColor: "#D4D4D4",
    defaultFontStyle: "none",
  },
  punctuation: {
    displayName: "Punctuation",
    description: "Color for punctuation and delimiters",
    defaultColor: "#D4D4D4",
    defaultFontStyle: "none",
  },
  property: {
    displayName: "Properties",
    description: "Color for object or class properties",
    defaultColor: "#9CDCFE",
    defaultFontStyle: "none",
  },
  annotation: {
    displayName: "Annotations",
    description: "Color for decorators and annotations",
    defaultColor: "#C586C0",
    defaultFontStyle: "none",
  },
  builtin: {
    displayName: "Builtins",
    description: "Color for built-in functions or objects (like Math, console)",
    defaultColor: "#DCDCAA",
    defaultFontStyle: "none",
  },
  namespace: {
    displayName: "Namespace",
    description: "Color for module or namespace names",
    defaultColor: "#4EC9B0",
    defaultFontStyle: "none",
  },
  tag: {
    displayName: "Tags",
    description: "Color for HTML/XML tags",
    defaultColor: "#569CD6",
    defaultFontStyle: "none",
  },
  attribute: {
    displayName: "Attributes",
    description: "Color for HTML/XML attributes",
    defaultColor: "#9CDCFE",
    defaultFontStyle: "none",
  },
  escapesequence: {
    displayName: "EscapeSequences",
    description: "Color for escape characters within strings",
    defaultColor: "#D7BA7D",
    defaultFontStyle: "none",
  },
  invalid: {
    displayName: "Invalid",
    description: "Color for invalid or erroneous code",
    defaultColor: "#F44747",
    defaultFontStyle: "underline",
  },
};

// This map links specific semantic token selectors (type.modifier) to your conceptual keys.
export const semanticToTokenKeyMap: Record<string, keyof typeof tokenColorMap> = {
  // Core Types and Symbols
  namespace: "namespace",
  type: "type",
  class: "class",
  interface: "interface",
  enum: "enum",
  enumMember: "enum",
  typeParameter: "type",

  // Variables and Parameters
  parameter: "parameter",
  variable: "variable",
  property: "property",

  // Functions and Methods
  function: "function",
  member: "property",
  method: "function",

  // Immutability (Constants)
  "variable.constant": "constant",
  "variable.readonly": "constant",
  "property.readonly": "constant",
  "enumMember.readonly": "enum",

  // Keywords and Operators
  keyword: "keyword",
  "keyword.operator": "operator",
  operator: "operator",

  // Literals
  string: "literal",
  number: "number",
  boolean: "literal",
  regexp: "literal",
  "string.escape": "escapesequence",

  // Comments
  comment: "comment",
  "comment.documentation": "comment",

  // Builtins / libraries
  "variable.defaultLibrary": "builtin",
  "type.defaultLibrary": "builtin",
  "property.defaultLibrary": "builtin",
  "function.defaultLibrary": "builtin",
  "method.defaultLibrary": "builtin",

  // JSX / HTML / XML
  tag: "tag",
  "tag.attribute": "attribute",
  attribute: "attribute",
  "namespace.jsx": "namespace",
  "type.jsx": "type",

  // Decorators / annotations
  decorator: "annotation",
  annotation: "annotation",

  // Macros
  macro: "macro",

  // Invalid / error
  invalid: "invalid",
  unreachable: "invalid",
};

export function convertDraftUserTokenColorsToTokenColors(
  tokenColors: UserTokenColors
): TokenColorsList {
  const map: TokenColorsList = {} as TokenColorsList;

  for (const [key, value] of Object.entries(tokenColors)) {
    const category = normalizeTokenMapKey(key);
    console.log("Key:", key, "Normalized Category:", category);
    if (!category) {continue;}

    const base = tokenColorMap[category];
    if (!base) {continue;} // Extra safety if normalizeTokenMapKey ever returns weird stuff

    map[category] = {
      ...base,
      defaultColor: value.foreground,
      defaultFontStyle: value.fontStyle || base.defaultFontStyle,
    };
  }

  return map;
}

// --- Helper Functions ---

/**
 * Matches a specific semantic selector (e.g. 'variable.readonly') 
 * back to your conceptual key (e.g. 'constant')
 */
function getConceptualKeyFromSemanticSelector(
  semanticSelector: string
): keyof TokenColorsList | null {
  // 1. Check exact match
  if (semanticToTokenKeyMap[semanticSelector]) {
    return semanticToTokenKeyMap[semanticSelector];
  }
  // 2. Check base token type (e.g. 'variable' from 'variable.readonly')
  const baseType = semanticSelector.split(":")[0].split('.')[0];
  if (semanticToTokenKeyMap[baseType]) {
    return semanticToTokenKeyMap[baseType];
  }
  return null;
}

/**
 * Parses VS Code style string ("bold italic") into your TokenStyle type
 */
function parseFontStyle(styleString: string | undefined): TokenColorSettings["fontStyle"] {
  if (!styleString || styleString === "") {return "none";}
  const styles = styleString.toLowerCase();

  if (styles.includes("italic")) {return "italic";}
  if (styles.includes("bold")) {return "bold";}
  if (styles.includes("underline")) {return "underline";}
  return "none";
}

/**
 * Normalizes a theme rule value (string or object) into color and style
 */
function extractStyleFromRule(
  value: string | TokenColorSettings
): { color: string; style: TokenColorSettings["fontStyle"] | undefined } {
  if (typeof value === "string") {
    return { color: value, style: undefined };
  }

  return {
    color: value.foreground || "",
    style: value.fontStyle !== undefined ? parseFontStyle(value.fontStyle) : undefined,
  };
}

// --- Main Parser Function ---

export function generateTokenMapColorsFromTheme(
  tokenColors?: ThemeJson["tokenColors"],
  semanticTokenColors?: ThemeJson["semanticTokenColors"]
): TokenColorsList {

  // 1. Start with default values (cloned to avoid mutation)
  // This ensures we always return a complete map, even if the theme is partial
  const finalMap: TokenColorsList = JSON.parse(JSON.stringify(tokenColorMap)),

  // 2. Track which keys were updated by Semantic Rules (Priority 1)
  // We will NOT allow TextMate rules to overwrite these later.
   semanticUpdatedKeys = new Set<string>();
  // --- PROCESS SEMANTIC COLORS (Highest Priority) ---
  if (semanticTokenColors) {
    for (const [selector, value] of Object.entries(semanticTokenColors)) {
      const conceptualKey = getConceptualKeyFromSemanticSelector(selector);

      // Only update if we map to a key AND haven't updated it yet
      if (conceptualKey && !semanticUpdatedKeys.has(conceptualKey)) {
        const { color, style } = extractStyleFromRule(value);

        // Only update if a valid color was found
        if (color) {
          finalMap[conceptualKey] = {
            ...finalMap[conceptualKey],
            defaultColor: color,
            // If semantic rule has style, use it; otherwise keep existing default
            defaultFontStyle: style || finalMap[conceptualKey].defaultFontStyle,
          };
          semanticUpdatedKeys.add(conceptualKey);
        }
      }
    }
  }
  // --- PROCESS TEXTMATE COLORS (Fallback) ---
  if (tokenColors && Array.isArray(tokenColors)) {
    for (const rule of tokenColors) {
      // Skip rules without valid settings
      if (!rule.scope || !rule.settings || !rule.settings.foreground) {continue;}

      // Normalize scope to array for easier checking
      const ruleScopes = Array.isArray(rule.scope) ? rule.scope : [rule.scope];

      // We compare this rule against ALL our conceptual keys to see if it applies
      for (const key of Object.keys(TextMateScopeMap) as Array<keyof TokenColorsList>) {

        // SKIP if this key was already set by a higher-priority Semantic Rule
        if (semanticUpdatedKeys.has(key)) {continue;}

        const targetScopes = TextMateScopeMap[key],
         isMatch = ruleScopes.some(ruleScope => {
          // Does this rule scope exist in our target list?
          if (targetScopes.includes(ruleScope)) {return true;}

          // Does this rule scope cover one of our targets? 
          // (e.g. rule "comment" covers target "comment.line")
          const coversTarget = targetScopes.some(target => target.startsWith(ruleScope));
          if (coversTarget) {return true;}

          return false;
        });

        if (isMatch) {
          const { color, style } = extractStyleFromRule(rule.settings);

          finalMap[key] = {
            ...finalMap[key],
            defaultColor: color,
            defaultFontStyle: style || finalMap[key].defaultFontStyle,
          };

          // NOTE: We do NOT break here.
          // TextMate rules rely on order (cascading). A later rule in the array might 
          // Override this one, so we keep processing the loop to capture the final state.
        }
      }
    }
  }
  


  return finalMap;
}

// Define which conceptual tokens are best handled by which setting property.
// Note: This is a decision based on the reliability issues discussed (string/comment failure on semantic).
const SEMANTIC_TOKENS_FOR_SETTINGS = [
  'function', 'class', 'interface', 'enum', 'type', 'variable',
  'constant', 'parameter', 'property', 'annotation', 'builtin',
  'namespace', 'tag', 'attribute', 'macro', 'invalid'
],

 SIMPLE_TEXTMATE_TOKENS_FOR_SETTINGS = [
  'comment', 'literal', 'keyword', 'number', 'operator', 'punctuation'
];

// Assumes tokenColorMap and semanticToTokenKeyMap are imported.

export function generateSemanticAndTextmateCustomizations(semanticTokens: ThemeJson["semanticTokenColors"]): { semanticRules: Record<string, TokenColorSettings | string>, textmateRules: Record<string, TokenColorSettings | string> } {
  const semanticRules: Record<string, TokenColorSettings | string> = {},
   textmateRules: Record<string, TokenColorSettings | string> = {};

  Object.entries(semanticTokens).map(([key, value]) => {

    // Skip if this token is designated for the simple TextMate path
    if (SIMPLE_TEXTMATE_TOKENS_FOR_SETTINGS.includes(key)) {
      textmateRules[key] = value;
      return;
    }
    if (SEMANTIC_TOKENS_FOR_SETTINGS.includes(key)) {
      semanticRules[key] = value;
    }
  });

  return { semanticRules, textmateRules };
}