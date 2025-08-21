"use client";

import {
  createContext,
  useContext,
  useReducer,
  type ReactNode,
  useState,
} from "react";
// import { themeColors } from "@webview/data/theme-colors";
import { ColorTab } from "../../types/theme";
import { useQuery } from "@webview/hooks/use-query";
import { promiseController } from "@webview/controller/promise-controller";

// ---------- Initial state ----------

type DraftState = {
  draftColors: Record<string, string>;
};

type DraftAction =
  | { type: "SET_COLOR"; key: string; value: string }
  | { type: "RESET"; payload: Record<string, string> };

const DraftContext = createContext<{
  state: DraftState;
  dispatch: React.Dispatch<DraftAction>;
} | null>(null);

function draftReducer(state: DraftState, action: DraftAction): DraftState {
  switch (action.type) {
    case "SET_COLOR":
      return {
        ...state,
        draftColors: { ...state.draftColors, [action.key]: action.value },
      };
    case "RESET":
      return { draftColors: action.payload };
    default:
      return state;
  }
}

interface SettingsContextType {
  colorsState: ColorTab[] | null;
  isLoading: boolean;
  draftState: DraftState;
  draftDispatch: React.Dispatch<DraftAction>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined
);

export function SettingsProvider({ children }: { children: ReactNode }) {
  promiseController.on("UPDATE_THEME_COLORS", (payload) => {});
  const { data: colorsState, isLoading: isLoadingColors } = useQuery({
    command: "GET_THEME_COLORS",
    payload: [],
  });

  const [state, dispatch] = useReducer(draftReducer, {
    draftColors: {},
  });

  return (
    <SettingsContext.Provider
      value={{
        colorsState: colorsState,
        draftState: state,
        draftDispatch: dispatch,
        isLoading: isLoadingColors,
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
