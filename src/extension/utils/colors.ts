import {
  TokenCategory,
  TokenColorItem,
  TokenColorsList,
} from "../../types/theme";
import { colorCategoryMap } from "../../lib/colorsList";
import { tokenColorMap } from "../../lib/tokenList";

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

export function convertTokenColorsBackToTheme(
  map: TokenColorsList
): TokenColorItem[] {
  const tokenColors: TokenColorItem[] = [];

  Object.values(map).forEach((entry) => {
    tokenColors.push({
      scope: entry.displayName, // use the original scope (displayName)
      settings: {
        foreground: entry.defaultColor,
        fontStyle:
          entry.defaultFontStyle !== "none"
            ? entry.defaultFontStyle
            : undefined,
      },
    });
  });

  return tokenColors;
}
