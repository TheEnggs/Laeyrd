export type Color = Record<string, string>;

export type TokenColor = {
  scope: string | string[];
  settings: Record<string, string>;
};

export type Theme = {
  name: string;
  type: "light" | "dark";
  colors: Color;
  tokenColors: TokenColor[];
};

export type GroupedColors = Record<string, Color>;
export type GroupedTokenColors = Record<
  string,
  {
    foreground?: string;
    fontStyle?: string;
  }
>;
