"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLayoutSettings = void 0;
const fonts_layout_1 = require("../../lib/data/fonts-layout");
const getLayoutSettings = (layout) => {
    const layoutList = fonts_layout_1.fontsLayoutUI;
    for (const key in layout) {
        if (layoutList[key]) {
            layoutList[key].defaultValue = layout[key];
        }
    }
    return layoutList;
};
exports.getLayoutSettings = getLayoutSettings;
