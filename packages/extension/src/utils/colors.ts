import {
  DraftToken,
  SemanticTokenColors,
  TokenCategory,
  TokenColorItem,
  TokenColorsList,
} from "@shared/types/theme";
import { colorCategoryMap } from "@shared/data/colorsList";
import { tokenColorMap } from "@shared/data/tokenList";

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
  tokenColors: TokenColorItem[]
): TokenColorsList {
  const map: TokenColorsList = tokenColorMap;
  tokenColors?.forEach((item) => {
    const scopes = Array.isArray(item.scope) ? item.scope : [item.scope];
    const settings = item.settings ?? {};

    scopes.forEach((scope) => {
      if (!map[scope]) {
        map[scope] = {
          displayName: scope,
          description: `Token color for ${scope}`,
          defaultColor:
            settings.foreground ||
            tokenColorMap[scope]?.defaultColor ||
            "#000000",
          defaultFontStyle:
            settings.fontStyle ||
            tokenColorMap[scope]?.defaultFontStyle ||
            "none",
        };
      }
    });
  });

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
      foreground: value.foreground,
    };
  });
  return { tokenColors, semanticTokenColors };
}
