import { fontListMap } from "../../lib/fontsList";
import { FontMetaGrouped } from "../../types/font";
import { uiLayoutCategoryMap } from "../../lib/layoutList";
import { UiLayoutMetaGrouped } from "../../types/layout";

export const getFontSettings = (
  fonts: Record<string, string>
): FontMetaGrouped => {
  const fontsList = fontListMap;
  for (const key in fonts) {
    if (fontsList[key]) {
      fontsList[key].defaultValue = fonts[key];
    }
  }
  return fontsList;
};

export const getLayoutSettings = (
  layout: Record<string, string | number | boolean>
): UiLayoutMetaGrouped => {
  console.log("layout", layout);
  const layoutList = uiLayoutCategoryMap;
  for (const key in layout) {
    if (layoutList[key]) {
      layoutList[key].defaultValue = layout[key];
    }
  }
  console.log("layoutList", layoutList);
  return layoutList;
};
