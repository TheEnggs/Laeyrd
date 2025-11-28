import { TokenColorsList } from "../../types/theme";

// to the complex, standard TextMate scope strings required for broad coverage.
export const TextMateScopeMap: Record<keyof TokenColorsList, string[]> = {
  // General code comments (e.g., //, /* */, #)
  comment: ["comment", "comment.block", "comment.line", "punctuation.definition.comment"],
  
  // String, char, and regex literals
  literal: ["string", "string.quoted", "string.template", "string.regexp", "entity.name.tag.script", "markup.inline.raw", "string.other.link", "markup.inline.raw.string.markdown"],

  // Control flow, variable declaration types, storage modifiers
  keyword: [
    "keyword",
    "keyword.control",
    "keyword.operator.new",
    "storage.type",
    "storage.modifier",
    "variable.language" // e.g., 'this' in JS
  ],

  // Generic variable references that aren't constants or parameters (fallback)
  variable: [
    "variable.other",
    "variable.other.readwrite",
    "variable.other.property",
    "variable.other.object",
    "variable.parameter" // Catch parameters if semantic isn't active
  ],

  // Constant literals (true, false, null) and defined constants (const/final)
  constant: [
    "constant.language", // true, false, null
    "constant.numeric",  // (Usually overridden by semantic number type)
    "constant.other"
  ],

  // Function parameters (used when semantic is off)
  parameter: ["variable.parameter"],

  // Function/Method names (declarations and calls)
  function: ["entity.name.function", "support.function"],

  // Class, Struct, Interface names (declarations and usages)
  class: [
    "entity.name.type.class",
    "support.class",
    "entity.name.type.module" // Modules/packages
  ],

  // Interface names (often same scope as classes but targeting both is safe)
  interface: ["entity.name.type.interface", "support.type"],

  // Enumeration names and members
  enum: ["entity.name.type.enum", "variable.other.enummember"],

  // Type annotations (e.g., in TypeScript, Java)
  type: ["entity.name.type", "support.type"],

  // Numeric literals
  number: ["constant.numeric"],

  // Preprocessor directives, build system tags
  macro: ["meta.preprocessor", "keyword.control.directive"],

  // Arithmetic, boolean, and comparison operators
  operator: ["keyword.operator", "punctuation.accessor"],

  // Semicolons, commas, parenthesis, braces, brackets
  punctuation: [
    "punctuation.separator",
    "punctuation.terminator",
    "punctuation.definition"
  ],

  // Class/object properties, member access
  property: ["variable.other.property"],

  // Decorators and Annotations (e.g., @Component)
  annotation: ["entity.name.function.decorator", "meta.annotation"],

  // Built-in library entities (e.g., console, Math)
  builtin: ["support.variable.property", "support.function.builtin"],

  // Namespaces and modules
  namespace: ["entity.name.namespace"],

  // HTML/XML/JSX Tags
  tag: ["entity.name.tag"],

  // HTML/XML/JSX Attributes
  attribute: ["entity.other.attribute-name"],

  // Escape sequences within strings (e.g., \n, \t)
  escapesequence: ["constant.character.escape", "constant.other.placeholder"],

  // Invalid or illegal code sequences
  invalid: ["invalid.illegal", "invalid.deprecated"],
};