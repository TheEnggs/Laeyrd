import { colorCategoryMap } from "@shared/data/colorsList";

export const generateColors = (colors: Record<string, string>) => {
  const colorsList = colorCategoryMap;
  for (const key in colors) {
    if (colorsList[key]) {
      colorsList[key].defaultValue = colors[key];
    }
  }
  return colorsList;
};
