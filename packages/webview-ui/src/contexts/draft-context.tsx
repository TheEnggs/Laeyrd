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
  discardChanges: ({}) => void;
  isDiscarding: boolean;
  handleRemoveDraftChange: (type: DraftStatePayloadKeys, key: string) => void;
  updateByUserCount: number;
}

const DraftContext = createContext<DraftContextValue | null>(null);

function getDraftStatePayload(draftState: DraftState): DraftStatePayload[] {
  type EntriesType = {
    [K in DraftStatePayloadKeys]: DraftState[`${K}Customization`];
  };

  function make<T extends keyof EntriesType>(
    items: EntriesType[T],
    entriesType: T
  ): {
    key: string;
    value: any;
    type: T;
  }[] {
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
    ...make(draftState.semanticTokenCustomization, "semanticToken"),
    ...make(draftState.tokenCustomization, "token"),
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
  const [updateByUserCount, setUpdateByUserCount] = useState(0);
  const draftsRef = useRef(drafts);

  useEffect(() => {
    draftsRef.current = drafts;
  }, [drafts]);

  const saveDrafts = useCallback(() => {
    commitDrafts(draftsRef.current);
  }, []);

  const updateUnsavedChanges = useCallback(
    (payload: DraftStatePayload, originalValue?: string | boolean | number) => {
      setDrafts((prev) => {
        const filtered = prev.filter((e) => e.key !== payload.key);
        if (originalValue !== undefined && originalValue === payload.value) {
          return filtered;
        }
        return [...filtered, payload];
      });

      setUpdateByUserCount((prev) => prev + 1);
    },
    []
  );

  const handleRemoveDraftChange = useCallback(
    (type: DraftStatePayloadKeys, key: string) => {
      removeDraftChange({ type, key });
    },
    []
  );
  const hydrated = useRef(false);

  useEffect(() => {
    if (!isLoading && !hydrated.current && data?.draftState) {
      setDrafts(getDraftStatePayload(data.draftState));
      hydrated.current = true;
    }
  }, [data, isLoading]);

  const { mutate: commitDrafts, isPending: isSaving } = useMutation(
    "UPDATE_DRAFT_STATE",
    {
      onSuccess: (data) => {
        setQueryData({ command: "GET_DRAFT_STATE", payload: data });
        toast({ message: "Draft saved", type: "success" });
      },
      onError: (err) =>
        toast({
          message: "Something went wrong while saving the draft" + err,
          type: "error",
        }),
    }
  );

  const { mutate: discardChanges, isPending: isDiscarding } = useMutation(
    "DISCARD_DRAFT_CHANGES",
    {
      onSuccess: () => {
        setDrafts([]);
        toast({ message: "Draft changes discarded", type: "success" });
      },
      onError: (error) => {
        log(error);
        toast({ message: "Failed to discard draft changes", type: "error" });
      },
    }
  );

  const { mutate: removeDraftChange, isPending: isRemovingDraftChange } =
    useMutation("REMOVE_DRAFT_CHANGE", {
      onSuccess: (data) => {
        log("removeDraftChange", data.data);
        setDrafts((prev) => prev.filter((d) => d.key !== data.data.key));
        // toast({ message: "Draft changes discarded", type: "success" });
      },
      onError: (error) => {
        log(error);
        toast({ message: "Failed to remove this change", type: "error" });
      },
    });

  return (
    <DraftContext.Provider
      value={{
        drafts,
        isLoading,
        isSaving,
        updateUnsavedChanges,
        saveDrafts,
        discardChanges,
        isDiscarding,
        handleRemoveDraftChange,
        updateByUserCount,
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
