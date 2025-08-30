import { FontMetaGrouped } from "../types/font";

export const fontListMap: FontMetaGrouped = {
  "editor.fontFamily": {
    category: "Fonts",
    subcategory: "Editor",
    displayName: "Editor Font Family",
    description: "Controls the font family used in the editor.",
    valueType: "string",
    defaultValue: "default system font",
    fontFamily: true,
  },
  "editor.fontSize": {
    category: "Fonts",
    subcategory: "Editor",
    displayName: "Editor Font Size",
    description: "Controls the font size in pixels in the editor.",
    valueType: "number",
    defaultValue: 14,
  },
  "editor.fontLigatures": {
    category: "Fonts",
    subcategory: "Editor",
    displayName: "Editor Font Ligatures",
    description: "Enables/Disables font ligatures.",
    valueType: "boolean",
    defaultValue: false,
  },
  "editor.lineHeight": {
    category: "Fonts",
    subcategory: "Editor",
    displayName: "Editor Line Height",
    description:
      "Controls line height in pixels. 0 means compute automatically.",
    valueType: "number",
    defaultValue: 0,
  },
  "terminal.integrated.fontFamily": {
    category: "Fonts",
    subcategory: "Terminal",
    displayName: "Terminal Font Family",
    description: "Controls the font family of the integrated terminal.",
    valueType: "string",
    defaultValue: "default system font",
    fontFamily: true,
  },
  "terminal.integrated.fontSize": {
    category: "Fonts",
    subcategory: "Terminal",
    displayName: "Terminal Font Size",
    description: "Controls the font size of the integrated terminal in pixels.",
    valueType: "number",
    defaultValue: 14,
  },
};
