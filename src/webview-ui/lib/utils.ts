import { FontMeta } from "../../types/font";
import { UiLayoutMeta } from "../../types/layout";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function buildVSCodeSettingsFromState(
  fontState: Record<string, FontMeta["defaultValue"]>,
  layoutState: Record<string, UiLayoutMeta["defaultValue"]>
) {
  const settings = {
    ...fontState,
    ...layoutState,
  };
  return settings;
}
