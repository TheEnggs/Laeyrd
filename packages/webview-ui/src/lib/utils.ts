import { FontMeta } from "@shared/types/font";
import { UiLayoutMeta } from "@shared/types/layout";
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

export function debounce<T extends (...args: any[]) => void>(
  fn: T,
  delay: number
) {
  let timer: NodeJS.Timeout | null = null;

  const debounced = (...args: Parameters<T>) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };

  debounced.cancel = () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  };

  return debounced as T & { cancel: () => void };
}
