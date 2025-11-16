import { TokenColorsList } from "../types/theme";

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
export const semanticToTokenKeyMap: Record<string, keyof typeof tokenColorMap> =
  {
    // ─────────────────────────
    // Core simple tokens
    // ─────────────────────────
    namespace: "namespace",
    type: "type",
    class: "class",
    interface: "interface",
    enum: "enum",
    enumMember: "enum",

    typeParameter: "type",
    parameter: "parameter",
    variable: "variable",
    property: "property",
    function: "function",
    method: "function",

    // ─────────────────────────
    // Literals
    // ─────────────────────────
    string: "literal",
    number: "number",
    boolean: "literal",
    regexp: "literal",
    "string.escape": "escapesequence",

    // ─────────────────────────
    // Keywords & operators
    // ─────────────────────────
    keyword: "keyword",
    "keyword.operator": "operator",
    operator: "operator",

    // ─────────────────────────
    // Comments
    // ─────────────────────────
    comment: "comment",
    "comment.documentation": "comment",

    // ─────────────────────────
    // Builtins / libraries
    // ─────────────────────────
    "variable.defaultLibrary": "builtin",
    "type.defaultLibrary": "builtin",
    "property.defaultLibrary": "builtin",
    "function.defaultLibrary": "builtin",
    "method.defaultLibrary": "builtin",

    // ─────────────────────────
    // JSX / HTML / XML
    // ─────────────────────────
    tag: "tag",
    "tag.attribute": "attribute",
    attribute: "attribute",
    "namespace.jsx": "namespace",
    "type.jsx": "type",

    // ─────────────────────────
    // Constant-ish things
    // ─────────────────────────
    "variable.constant": "constant",
    "variable.readonly": "constant",
    "property.readonly": "constant",
    "enumMember.readonly": "enum",

    // ─────────────────────────
    // Decorators / annotations
    // ─────────────────────────
    decorator: "annotation",
    annotation: "annotation",

    // ─────────────────────────
    // Macros
    // ─────────────────────────
    macro: "macro",

    // ─────────────────────────
    // Invalid / error
    // ─────────────────────────
    invalid: "invalid",
    unreachable: "invalid",
  };
