export type UiLayoutMeta =
  | {
      category: string;
      isSubCategoryToggle?: boolean;
      subcategory: string;
      displayName: string;
      description: string;
      defaultValue: string | number | boolean;
      valueType: "number" | "boolean" | "string";
      // Options is not allowed for number/boolean
    }
  | {
      category: string;
      isSubCategoryToggle?: boolean;
      subcategory: string;
      displayName: string;
      description: string;
      defaultValue: string;
      valueType: "select";
      options: string[]; // Required for select
    };

export type UiLayoutMetaGrouped = Record<string, UiLayoutMeta>;
