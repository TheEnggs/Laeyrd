import { FontMeta } from "@shared/types/font";
import { UiLayoutMeta } from "@shared/types/layout";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
