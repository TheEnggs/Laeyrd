import { fontListMap } from "../../lib/fontsList";
import { FontMetaGrouped } from "../../types/font";
import { fontsLayoutUI } from "../../lib/fonts-layout";
import { UiLayoutMetaGrouped } from "../../types/layout";

export const getLayoutSettings = (
  layout: Record<string, string | number | boolean>
): UiLayoutMetaGrouped => {
  const layoutList = fontsLayoutUI;
  for (const key in layout) {
    if (layoutList[key]) {
      layoutList[key].defaultValue = layout[key];
    }
  }
  return layoutList;
};
