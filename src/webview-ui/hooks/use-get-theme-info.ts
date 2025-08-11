import { useVSCodeMessenger } from "./use-vscode-messenger";
import type { GroupedColors, GroupedTokenColors } from "../../types/theme";
import { useEffect, useState, useCallback } from "react";

export function useThemeController() {
  const [colors, setColors] = useState<GroupedColors | undefined>(undefined);
  const [tokenColors, setTokenColors] = useState<
    GroupedTokenColors | undefined
  >(undefined);

  const { postMessage } = useVSCodeMessenger((msg) => {
    if (!msg) return;
    switch (msg.command) {
      case "GET_THEME_COLORS":
        setColors(msg.payload as GroupedColors);
        break;
      case "GET_THEME_TOKEN_COLORS":
        setTokenColors(msg.payload as GroupedTokenColors);
        break;
      default:
        break;
    }
  });

  const requestColors = useCallback(() => {
    postMessage({ command: "GET_THEME_COLORS" });
  }, [postMessage]);

  const requestTokenColors = useCallback(() => {
    postMessage({ command: "GET_THEME_TOKEN_COLORS" });
  }, [postMessage]);

  useEffect(() => {
    // eager request once mounted; consumers can also call explicitly
    requestColors();
    requestTokenColors();
  }, [requestColors, requestTokenColors]);

  return { requestColors, requestTokenColors, colors, tokenColors };
}
