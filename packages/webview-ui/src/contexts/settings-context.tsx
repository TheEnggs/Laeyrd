"use client";

import {
  createContext,
  useContext,
  useReducer,
  type ReactNode,
  useState,
  useEffect,
} from "react";
import { UiLayoutMeta } from "@shared/types/layout";
import { DraftToken, DraftColor } from "@shared/types/theme";
// ---------- Initial state ----------

type DraftLayout = Record<string, UiLayoutMeta["defaultValue"]>;

type DraftColorAction =
  | { type: "SET_COLOR"; key: string; value: string; defaultValue: string }
  | { type: "RESET" };

type DraftLayoutAction =
  | {
      type: "SET_LAYOUT";
      key: string;
      value: UiLayoutMeta["defaultValue"];
      defaultValue: UiLayoutMeta["defaultValue"];
    }
  | { type: "RESET" };

type DraftTokenAction =
  | {
      type: "SET_TOKEN_COLOR";
      key: string;
      value: { foreground?: string; fontStyle?: string };
    }
  | {
      type: "SET_SEMANTIC_TOKEN_COLOR";
      key: string;
      value: { foreground: string };
    }
  | { type: "RESET" };

function draftTokenReducer(
  state: DraftToken,
  action: DraftTokenAction
): DraftToken {
  switch (action.type) {
    case "SET_TOKEN_COLOR":
      return {
        ...state,
        tokenColors: { ...state.tokenColors, [action.key]: action.value },
      };
    case "SET_SEMANTIC_TOKEN_COLOR":
      return {
        ...state,
        semanticTokenColors: {
          ...state.semanticTokenColors,
          [action.key]: action.value,
        },
      };
    case "RESET":
      return { tokenColors: {}, semanticTokenColors: {} };
    default:
      return state;
  }
}
function draftColorReducer(
  state: DraftColor,
  action: DraftColorAction
): DraftColor {
  switch (action.type) {
    case "SET_COLOR":
      const { key, value, defaultValue } = action;
      if (value === defaultValue) {
        const { [key]: _, ...rest } = state;
        return rest;
      }
      return { ...state, [key]: value };
    case "RESET":
      return {};
    default:
      return state;
  }
}

function draftFontLayoutReducer(
  state: DraftLayout,
  action: DraftLayoutAction
): DraftLayout {
  switch (action.type) {
    case "SET_LAYOUT": {
      const { key, value, defaultValue } = action;

      // If the user "sets" a value equal to the default, drop it
      if (value === defaultValue) {
        const { [key]: _, ...rest } = state;
        return rest;
      }

      // Otherwise, store it as an override
      return { ...state, [key]: value };
    }
    case "RESET":
      return {};
    default:
      return state;
  }
}

interface SettingsContextType {
  draftColorState: DraftColor;
  draftFontLayoutState: DraftLayout;
  colorDispatch: React.Dispatch<DraftColorAction>;
  draftTokenState: DraftToken;
  tokenDispatch: React.Dispatch<DraftTokenAction>;
  fontLayoutDispatch: React.Dispatch<DraftLayoutAction>;
  hasColorChanges: boolean;
  setHasColorChanges: React.Dispatch<React.SetStateAction<boolean>>;
  hasSettingsChanges: boolean;
  setHasSettingsChanges: React.Dispatch<React.SetStateAction<boolean>>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined
);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [draftColorState, colorDispatch] = useReducer(draftColorReducer, {});
  const [draftTokenState, tokenDispatch] = useReducer(draftTokenReducer, {
    tokenColors: {},
    semanticTokenColors: {},
  });

  const [draftFontLayoutState, fontLayoutDispatch] = useReducer(
    draftFontLayoutReducer,
    {}
  );

  const [hasColorChanges, setHasColorChanges] = useState(false);
  const [hasSettingsChanges, setHasSettingsChanges] = useState(false);

  useEffect(() => {
    if (
      Object.keys(draftColorState).length > 0 ||
      Object.keys(draftTokenState.tokenColors).length > 0 ||
      Object.keys(draftTokenState.semanticTokenColors).length > 0
    ) {
      setHasColorChanges(true);
    } else {
      setHasColorChanges(false);
    }

    if (Object.keys(draftFontLayoutState).length > 0) {
      setHasSettingsChanges(true);
    } else {
      setHasSettingsChanges(false);
    }
  }, [draftColorState, draftFontLayoutState, draftTokenState]);

  return (
    <SettingsContext.Provider
      value={{
        draftColorState: draftColorState,
        draftFontLayoutState: draftFontLayoutState,
        colorDispatch: colorDispatch,
        draftTokenState: draftTokenState,
        fontLayoutDispatch: fontLayoutDispatch,
        tokenDispatch: tokenDispatch,
        hasColorChanges: hasColorChanges,
        setHasColorChanges: setHasColorChanges,
        hasSettingsChanges: hasSettingsChanges,
        setHasSettingsChanges: setHasSettingsChanges,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
