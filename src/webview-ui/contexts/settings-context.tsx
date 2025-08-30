"use client";

import {
  createContext,
  useContext,
  useReducer,
  type ReactNode,
  useState,
  useEffect,
} from "react";
import { queryClient } from "@webview/controller/query-client";
import { FontMeta } from "../../types/font";
import { UiLayoutMeta } from "../../types/layout";
// ---------- Initial state ----------

type DraftState = Record<string, { type: "color" | "token"; value: string }>;
type DraftLayout = Record<string, UiLayoutMeta["defaultValue"]>;
type DraftFonts = Record<string, FontMeta["defaultValue"]>;
type DraftToken = {
  tokenColors: Record<string, { foreground?: string; fontStyle?: string }>;
  semanticTokenColors: Record<string, { foreground: string }>;
};

type DraftColorAction =
  | { type: "SET_COLOR"; key: string; value: string }
  | { type: "RESET"; payload: DraftState };

type DraftFontAction =
  | { type: "SET_FONT"; key: string; value: FontMeta["defaultValue"] }
  | { type: "RESET"; payload: DraftFonts };

type DraftLayoutAction =
  | { type: "SET_LAYOUT"; key: string; value: UiLayoutMeta["defaultValue"] }
  | { type: "RESET"; payload: DraftLayout };

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
  | { type: "RESET"; payload: DraftToken };

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
      return action.payload;
    default:
      return state;
  }
}
function draftColorReducer(
  state: DraftState,
  action: DraftColorAction
): DraftState {
  switch (action.type) {
    case "SET_COLOR":
      return {
        ...state,
        [action.key]: { type: "color", value: action.value },
      };
    case "RESET":
      return action.payload;
    default:
      return state;
  }
}

// pass original backend data into reducer via closure or context
function createDraftFontReducer() {
  return function draftFontReducer(
    state: DraftFonts,
    action: DraftFontAction
  ): DraftFonts {
    const original = queryClient.getQueryData("GET_FONT_SETTINGS");
    switch (action.type) {
      case "SET_FONT": {
        const { key, value } = action;
        // if value equals original → remove from draft
        if (original[key].defaultValue === value) {
          const { [key]: _, ...rest } = state;
          return rest;
        }
        // else track the change
        return { ...state, [key]: value };
      }
      case "RESET":
        return {};
      default:
        return state;
    }
  };
}

function createDraftLayoutReducer() {
  return function draftLayoutReducer(
    state: DraftLayout,
    action: DraftLayoutAction
  ): DraftLayout {
    const original = queryClient.getQueryData("GET_LAYOUT_SETTINGS");
    switch (action.type) {
      case "SET_LAYOUT": {
        const { key, value } = action;
        if (original[key].defaultValue === value) {
          const { [key]: _, ...rest } = state;
          return rest;
        }
        return { ...state, [key]: value };
      }
      case "RESET":
        return {};
      default:
        return state;
    }
  };
}

interface SettingsContextType {
  draftColorState: DraftState;
  draftFontState: DraftFonts;
  draftLayoutState: DraftLayout;
  fontDispatch: React.Dispatch<DraftFontAction>;
  colorDispatch: React.Dispatch<DraftColorAction>;
  draftTokenState: DraftToken;
  tokenDispatch: React.Dispatch<DraftTokenAction>;
  layoutDispatch: React.Dispatch<DraftLayoutAction>;
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
  const [draftFontState, fontDispatch] = useReducer(
    createDraftFontReducer(),
    {}
  );
  const [draftLayoutState, layoutDispatch] = useReducer(
    createDraftLayoutReducer(),
    {}
  );

  const [hasColorChanges, setHasColorChanges] = useState(false);
  const [hasSettingsChanges, setHasSettingsChanges] = useState(false);

  useEffect(() => {
    if (
      Object.keys(draftColorState).length > 0 ||
      Object.keys(draftFontState).length > 0
    ) {
      setHasColorChanges(true);
    } else {
      setHasColorChanges(false);
    }

    if (
      Object.keys(draftLayoutState).length > 0 ||
      Object.keys(draftTokenState.tokenColors).length > 0 ||
      Object.keys(draftTokenState.semanticTokenColors).length > 0
    ) {
      setHasSettingsChanges(true);
    } else {
      setHasSettingsChanges(false);
    }
  }, [draftColorState, draftFontState, draftLayoutState, draftTokenState]);

  return (
    <SettingsContext.Provider
      value={{
        draftColorState: draftColorState,
        draftFontState: draftFontState,
        draftLayoutState: draftLayoutState,
        colorDispatch: colorDispatch,
        draftTokenState: draftTokenState,
        fontDispatch: fontDispatch,
        layoutDispatch: layoutDispatch,
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
