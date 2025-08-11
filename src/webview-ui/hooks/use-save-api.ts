import React from "react";
import { useVSCodeMessenger } from "./use-vscode-messenger";

export function useSaveApi() {
  const { postMessage } = useVSCodeMessenger((msg) => {
    if (msg.command === "SAVE_SUCCESS") {
      alert("Theme saved successfully!");
    }
  });

  //   const handleSave = () => {
  //     postMessage({
  //       command: "SAVE_THEME",
  //       payload: {
  //         mode: state.isEditingExisting ? "overwrite" : "create",
  //         themeName: state.newThemeName || undefined,
  //         colors: state.settings.themeColors,
  //         tokenColors: [], // Map from your state if you have syntax token colors
  //       },
  //     });
  //   };

  //   return { handleSave };
}
