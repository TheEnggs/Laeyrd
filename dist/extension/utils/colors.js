"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateColors = void 0;
exports.convertTokenColors = convertTokenColors;
exports.convertTokenColorsBackToTheme = convertTokenColorsBackToTheme;
const colorsList_1 = require("../../lib/colorsList");
const tokenList_1 = require("../../lib/tokenList");
const generateColors = (colors) => {
    const colorsList = colorsList_1.colorCategoryMap;
    for (const key in colors) {
        if (colorsList[key]) {
            colorsList[key].defaultValue = colors[key];
        }
    }
    return colorsList;
};
exports.generateColors = generateColors;
function convertTokenColors(tokenColors) {
    const map = tokenList_1.tokenColorMap;
    tokenColors?.forEach((item) => {
        const scopes = Array.isArray(item.scope) ? item.scope : [item.scope];
        const settings = item.settings ?? {};
        scopes.forEach((scope) => {
            if (!map[scope]) {
                map[scope] = {
                    displayName: scope,
                    description: `Token color for ${scope}`,
                    defaultColor: settings.foreground ||
                        tokenList_1.tokenColorMap[scope]?.defaultColor ||
                        "#000000",
                    defaultFontStyle: settings.fontStyle ||
                        tokenList_1.tokenColorMap[scope]?.defaultFontStyle ||
                        "none",
                };
            }
        });
    });
    return map;
}
function convertTokenColorsBackToTheme(tokens) {
    const tokenColors = [];
    const semanticTokenColors = {};
    const tokenColorsMap = tokens?.tokenColors ?? {};
    const semanticTokenColorsMap = tokens?.semanticTokenColors ?? {};
    Object.entries(tokenColorsMap).forEach(([key, value]) => {
        tokenColors.push({
            scope: key, // use the original scope (displayName)
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
