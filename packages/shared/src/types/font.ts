export type FontMeta = {
  category: string;
  subcategory: string;
  displayName: string;
  description: string;
  valueType: "string" | "number" | "boolean";
  defaultValue: string | number | boolean;
  fontFamily?: boolean;
};

export type FontMetaGrouped = Record<string, FontMeta>;
