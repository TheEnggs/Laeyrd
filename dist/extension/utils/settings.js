"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLayoutSettings = exports.getFontSettings = void 0;
const fontsList_1 = require("../../lib/fontsList");
const layoutList_1 = require("../../lib/layoutList");
const getFontSettings = (fonts) => {
    const fontsList = fontsList_1.fontListMap;
    for (const key in fonts) {
        if (fontsList[key]) {
            fontsList[key].defaultValue = fonts[key];
        }
    }
    return fontsList;
};
exports.getFontSettings = getFontSettings;
const getLayoutSettings = (layout) => {
    console.log("layout", layout);
    const layoutList = layoutList_1.uiLayoutCategoryMap;
    for (const key in layout) {
        if (layoutList[key]) {
            layoutList[key].defaultValue = layout[key];
        }
    }
    console.log("layoutList", layoutList);
    return layoutList;
};
exports.getLayoutSettings = getLayoutSettings;
