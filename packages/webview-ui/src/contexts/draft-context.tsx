// DraftProvider.tsx
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  ReactNode,
} from "react";
import {
  DraftState,
  DraftStatePayload,
  DraftStatePayloadKeys,
} from "@shared/types/theme";
import useToast from "@/hooks/use-toast";
import { setQueryData, useMutation, useQuery } from "@/hooks/use-query";
import { log } from "@shared/utils/debug-logs";

interface DraftContextValue {
  drafts: DraftStatePayload[];
  isLoading: boolean;
  isSaving: boolean;
  updateUnsavedChanges: (
    payload: DraftStatePayload,
    originalValue?: string | boolean | number
  ) => void;
  saveDrafts: () => void;
}

const DraftContext = createContext<DraftContextValue | null>(null);

function getDraftStatePayload(draftState: DraftState): DraftStatePayload[] {
  type EntriesType = {
    [K in DraftStatePayloadKeys]: DraftState[`${K}Customization`];
  };

  function make<T extends keyof EntriesType>(
    items: EntriesType[T],
    entriesType: T
  ) {
    if (!items) return [];
    const entries = Object.entries(items);
    return entries
      ? entries.length > 0
        ? entries.map(([key, value]) => ({ key, value, type: entriesType }))
        : []
      : [];
  }
  return [
    ...make(draftState.colorCustomization, "color"),
    ...make(draftState.tokenCustomization, "token"),
    ...make(draftState.semanticTokenCustomization, "semanticToken"),
    ...make(draftState.settingsCustomization, "settings"),
  ];
}

export function DraftProvider({ children }: { children: ReactNode }) {
  const toast = useToast();
  const { data, isLoading } = useQuery({
    command: "GET_DRAFT_STATE",
    payload: {},
  });

  const [drafts, setDrafts] = useState<DraftStatePayload[]>([]);
  const draftsRef = useRef(drafts);

  const { mutate: commitDrafts, isPending: isSaving } = useMutation(
    "UPDATE_DRAFT_STATE",
    {
      onSuccess: (data) => {
        setQueryData({ command: "GET_DRAFT_STATE", payload: data });
        toast({ message: "Draft saved", type: "success" });
      },
      onError: () =>
        toast({
          message: "Something went wrong while saving the draft",
          type: "error",
        }),
    }
  );

  useEffect(() => {
    draftsRef.current = drafts;
  }, [drafts]);

  const saveDrafts = useCallback(() => {
    commitDrafts(draftsRef.current);
  }, [commitDrafts]);

  const updateUnsavedChanges = useCallback(
    (payload: DraftStatePayload, originalValue?: string | boolean | number) => {
      setDrafts((prev) => {
        const filtered = prev.filter((e) => e.key !== payload.key);
        // Narrow type safely before treating it like an object
        const isObject =
          typeof payload.value === "object" &&
          payload.value !== null &&
          !Array.isArray(payload.value);

        if (originalValue !== undefined) {
          if (
            (!isObject && originalValue === payload.value) ||
            (isObject &&
              "foreground" in (payload.value as { foreground: string }) &&
              originalValue ===
                (payload.value as { foreground: string }).foreground)
          ) {
            return filtered;
          }
        }
        return [...filtered, payload];
      });
    },
    []
  );

  useEffect(() => {
    if (isLoading) return;
    if (!data?.draftState) return;
    log("drafts", data.draftState);
    setDrafts(getDraftStatePayload(data.draftState));
  }, [data, isLoading]);

  return (
    <DraftContext.Provider
      value={{
        drafts,
        isLoading,
        isSaving,
        updateUnsavedChanges,
        saveDrafts,
      }}
    >
      {children}
    </DraftContext.Provider>
  );
}

export function useDraft() {
  const ctx = useContext(DraftContext);
  if (!ctx) throw new Error("useDraft must be used within DraftProvider");
  return ctx;
}
