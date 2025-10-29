import { fontsLayoutUI } from "../../lib/data/fonts-layout";
import { UiLayoutMetaGrouped } from "@src/types/layout";

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
