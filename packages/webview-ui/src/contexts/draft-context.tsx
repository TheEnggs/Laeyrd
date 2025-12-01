// DraftProvider.tsx
import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  DraftState,
  DraftStatePayload,
  DraftStatePayloadKeys,
} from "@shared/types/theme";
import useToast from "@webview/hooks/use-toast";
import { useMutation, useQuery } from "@webview/hooks/use-query";
import { log } from "@shared/utils/debug-logs";
import { PublishType, SaveThemeModes } from "@shared/types/event";

interface DraftContextValue {
  drafts: DraftStatePayload[];
  isLoading: boolean;
  isSaving: boolean;
  updateUnsavedChanges: (changes: DraftStatePayload[]) => void;
  saveDrafts: () => void;
  publishDraftChanges: (args: {
    publishType: PublishType;
    theme?: { mode: keyof typeof SaveThemeModes; themeName: string };
  }) => void;
  isPublishingDraftChanges: boolean;
  discardChanges: ({}) => void;
  isDiscarding: boolean;
  handleRemoveDraftChange: (drafts: DraftStatePayload[]) => void;
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
    if (!items) {return [];}
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
    ...make(draftState.settingsCustomization, "settings"),
  ];
}

export function DraftProvider({ children }: { children: ReactNode }) {
  const toast = useToast(),
   { data, isLoading, refetch } = useQuery({
    command: "GET_DRAFT_STATE",
    payload: {},
  }),
  //   Const hydrationRequiredRef = useRef(true);
   [drafts, setDrafts] = useState<DraftStatePayload[]>([]),
   draftsRef = useRef(drafts);

  useEffect(() => {
    draftsRef.current = drafts;
  }, [drafts]);

  const saveDrafts = useCallback(() => {
    commitDrafts(draftsRef.current);
  }, []),

   updateUnsavedChanges = useCallback((changes: DraftStatePayload[]) => {
    setDrafts((prev) => {
      if (changes.length === 0) {return prev;}
      const next = [...prev];
      for (const change of changes) {
        const idx = next.findIndex(
          (d) => d.type === change.type && d.key === change.key
        );

        if (idx === -1) {
          next.push(change);
        } else {
          const existing = next[idx];
          if (existing.value !== change.value) {
            next[idx] = { ...change };
          }
        }
      }

      return next;
    });
  }, []),

   handleRemoveDraftChange = useCallback((drafts: DraftStatePayload[]) => {
    removeDraftChange(drafts);
  }, []);

  useEffect(() => {
    if (!isLoading && data?.draftState) {
      setDrafts(getDraftStatePayload(data.draftState));
      //   HydrationRequiredRef.current = false;
    }
  }, [data?.draftState, isLoading]);

  const { mutate: commitDrafts, isPending: isSaving } = useMutation(
    "UPDATE_DRAFT_STATE",
    {
      onSuccess: (res) => {
        toast({ message: "Draft saved", type: "success" });
      },
      onError: (err) =>
        toast({
          message: `Something went wrong while saving the draft${  err}`,
          type: "error",
        }),
    }
  ),
   { mutate: publishDraftChanges, isPending: isPublishingDraftChanges } =
    useMutation("PUBLISH_DRAFT_CHANGES", {
      onSuccess: (data) => {
        setDrafts(getDraftStatePayload(data.data.draftFile.draftState));
        toast({
          message: `${data.data.publishType === "both" ? "Themes and settings" : data.data.publishType} changes published`,
          type: "success",
        });
      },
      onError: (error) => {
        log(error);
        toast({ message: "Failed to publish changes", type: "error" });
      },
    }),

   { mutate: discardChanges, isPending: isDiscarding } = useMutation(
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
  ),

   { mutate: removeDraftChange, isPending: isRemovingDraftChange } =
    useMutation("REMOVE_DRAFT_CHANGE", {
      onSuccess: (data) => {
        const { data: removedDrafts } = data;
        setDrafts((prev) =>
          prev.filter((d) => !removedDrafts.some((r) => r.key === d.key))
        );
        if (data.error) {
          toast({
            message: `Failed to remove some changes, Reason: ${  data.error}`,
            type: "error",
          });
        }
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
        publishDraftChanges,
        isPublishingDraftChanges,
        discardChanges,
        isDiscarding,
        handleRemoveDraftChange,
      }}
    >
      {children}
    </DraftContext.Provider>
  );
}

export function useDraft() {
  const ctx = useContext(DraftContext);
  if (!ctx) {throw new Error("useDraft must be used within DraftProvider");}
  return ctx;
}
