

// --- Type Definitions for the Theme JSON Structure ---

import { TextMateScopeMap } from "../data/token/textMateScopeMap";
import { semanticToTokenKeyMap } from "../data/token/tokenList";
import { TextMateTokenRule, ThemeJson, TokenColorSettings, TokenColorsList } from "../types/theme";


// --- Generator Functions ---

/**
 * Helper to combine styles for the fontStyle property.
 * @param styles The style strings from the map (e.g., "bold", "italic", "none").
 * @returns A space-separated string for the fontStyle property, or undefined.
 */
export function getFontStyleString(styles: TokenColorSettings["fontStyle"]): TokenColorSettings["fontStyle"] | undefined {
  if (styles === "none" || !styles) {
    return undefined;
  }
  // VS Code accepts multiple styles separated by spaces (e.g., "bold italic")
  return styles.split(/\s+/).filter(s => s !== 'none').join(' ') as TokenColorSettings["fontStyle"];
}

/**
 * Generates the `userTokenColors` property for the theme.
 * This is the modern, high-priority coloring system.
 * @param userCustomizations A map of conceptual tokens and their user-selected styles.
 */
function generateSemanticTokenColors(
  userCustomizations: TokenColorsList
): Record<string, string | TokenColorSettings> {
  const semanticRules: Record<string, string | TokenColorSettings> = {};

  // 1. Loop through the standardized semantic token selectors 
  //    (defined in semanticToTokenKeyMap)
  for (const semanticSelector in semanticToTokenKeyMap) {
    const conceptualKey = semanticToTokenKeyMap[semanticSelector];
    
    // 2. Get the definition from the user's map (or default)
    const definition = userCustomizations[conceptualKey];

    if (definition) {
      const fontStyle = getFontStyleString(definition.defaultFontStyle);

      // 3. Construct the style object based on color and font style
      if (fontStyle) {
        semanticRules[semanticSelector] = {
          foreground: definition.defaultColor,
          fontStyle: fontStyle,
        };
      } else {
        // If no special font style is needed, use the simpler hex string format
        semanticRules[semanticSelector] = definition.defaultColor;
      }
    }
  }
  
  return semanticRules;
}

/**
 * Generates the `tokenColors` property for the theme.
 * This is the legacy TextMate fallback system, ensuring wide coverage.
 * @param userCustomizations A map of conceptual tokens and their user-selected styles.
 */
export function generateTextMateTokenColors(
  userCustomizations: TokenColorsList
): TextMateTokenRule[] {
  const tokenColors: TextMateTokenRule[] = [];

  // 1. Loop through the conceptual tokens (e.g., 'keyword', 'comment')
  for (const key in userCustomizations) {
    const conceptualKey = key as keyof TokenColorsList;
    const definition = userCustomizations[conceptualKey];
    const scopes = TextMateScopeMap[conceptualKey];

    if (scopes && scopes.length > 0) {
      const settings: TokenColorSettings = {
        foreground: definition.defaultColor,
      };
      
      const fontStyle = getFontStyleString(definition.defaultFontStyle);
      if (fontStyle) {
        settings.fontStyle = fontStyle;
      }

      // 2. Create one rule that applies the defined style to ALL mapped TextMate scopes
      tokenColors.push({
        // Use the conceptual name for debugging/readability within the JSON
        name: conceptualKey + "(Laeyrd)", 
        // Array of scopes derived from the TextMateScopeMap
        scope: scopes, 
        settings: settings,
      });
    }
  }

  return tokenColors;
}

export function generateVscodeTheme(
  baseTheme: ThemeJson,
  overriddenConfig: {
    userThemeName?: string,
    userThemeType?: "light" | "dark" | "high contrast",
    userThemeColors?: Record<string, string>
    userSemanticTokenColors?: TokenColorsList,
    userTextmateTokenColors?: TokenColorsList,
  }
): ThemeJson {
  const generatedSemanticTokens = Object.keys(overriddenConfig.userSemanticTokenColors).length > 0 ? 
  generateSemanticTokenColors(overriddenConfig.userSemanticTokenColors) : {}

  const generatedTokenColors = Object.keys(overriddenConfig.userTextmateTokenColors).length > 0 ? generateTextMateTokenColors(overriddenConfig.userTextmateTokenColors) : []
  const themeJson = {
    name: overriddenConfig.userThemeName || baseTheme.name,
    type: overriddenConfig.userThemeType || baseTheme.type,
    // Essential flag to enable the modern semantic coloring engine
    semanticHighlighting: true, 
    // --- Workbench UI Colors ---
    colors: {...baseTheme.colors, ...overriddenConfig.userThemeColors},
    // --- Syntax Coloring ---
    semanticTokenColors: {...baseTheme.semanticTokenColors, ...generatedSemanticTokens},
    tokenColors: [...baseTheme.tokenColors, ...generatedTokenColors],
  };
  return themeJson
}