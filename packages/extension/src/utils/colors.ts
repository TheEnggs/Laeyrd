import {
  DraftToken,
  SemanticTokenColors,
  TokenCategory,
  TokenColorItem,
  TokenColorsList,
} from "@shared/types/theme";
import { colorCategoryMap } from "@shared/data/colorsList";
import { tokenColorMap } from "@shared/data/tokenList";
import { log } from "@shared/utils/debug-logs";

function normalizeSemanticTokenKey(key: string): TokenCategory | null {
  const lower = key.toLowerCase();

  if (lower.includes("comment")) return "comment";
  if (
    lower.includes("string") ||
    lower.includes("char") ||
    lower.includes("literal")
  )
    return "literal";
  if (
    lower.includes("keyword") ||
    lower.includes("modifier") ||
    lower.includes("control")
  )
    return "keyword";
  if (lower.includes("variable.parameter")) return "parameter";
  if (lower.includes("variable.constant")) return "constant";
  if (lower.includes("variable") && !lower.includes("property"))
    return "variable";
  if (lower.includes("property")) return "property";
  if (lower.includes("function") || lower.includes("method")) return "function";
  if (lower.includes("class")) return "class";
  if (lower.includes("interface")) return "interface";
  if (lower.includes("enum")) return "enum";
  if (lower.includes("type")) return "type";
  if (lower.includes("number") || lower.includes("numeric")) return "number";
  if (lower.includes("macro")) return "macro";
  if (lower.includes("operator")) return "operator";
  if (lower.includes("punctuation") || lower.includes("delimiter"))
    return "punctuation";
  if (lower.includes("annotation") || lower.includes("decorator"))
    return "annotation";
  if (
    lower.includes("builtin") ||
    lower.includes("defaultlibrary") ||
    lower.includes("global")
  )
    return "builtin";
  if (lower.includes("namespace") || lower.includes("module"))
    return "namespace";
  if (lower.includes("tag")) return "tag";
  if (lower.includes("attribute")) return "attribute";
  if (lower.includes("escape")) return "escapesequence";
  if (lower.includes("invalid") || lower.includes("error")) return "invalid";

  return null;
}

export const generateColors = (colors: Record<string, string>) => {
  const colorsList = colorCategoryMap;
  for (const key in colors) {
    if (colorsList[key]) {
      colorsList[key].defaultValue = colors[key];
    }
  }
  return colorsList;
};

export function convertTokenColors(
  tokenColors: SemanticTokenColors | undefined
): TokenColorsList {
  const map: TokenColorsList = structuredClone(tokenColorMap);
  if (!tokenColors) return map;
  log("tokenColors", tokenColors);
  for (const [key, value] of Object.entries(tokenColors)) {
    const category = normalizeSemanticTokenKey(key);
    if (!category) continue;

    map[category] = {
      ...map[category],
      defaultColor: value.foreground,
    };
  }

  return map;
}

export function convertTokenColorsBackToTheme(tokens: DraftToken): {
  tokenColors: TokenColorItem[];
  semanticTokenColors: SemanticTokenColors;
} {
  const tokenColors: TokenColorItem[] = [];
  const semanticTokenColors: SemanticTokenColors = {};
  const tokenColorsMap = tokens?.tokenColors ?? {};
  const semanticTokenColorsMap = tokens?.semanticTokenColors ?? {};
  Object.entries(tokenColorsMap).forEach(([key, value]) => {
    tokenColors.push({
      scope: key as TokenCategory, // use the original scope (displayName)
      settings: {
        foreground: value.foreground,
        fontStyle: value.fontStyle !== "none" ? value.fontStyle : undefined,
      },
    });
  });
  Object.entries(semanticTokenColorsMap).forEach(([key, value]) => {
    semanticTokenColors[key] = {
      foreground: value,
    };
  });
  return { tokenColors, semanticTokenColors };
}
