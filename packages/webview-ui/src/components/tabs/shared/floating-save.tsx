"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDraft } from "../../../contexts/draft-context";
import { Loader2, Save } from "lucide-react";
import { useMemo } from "react";
import { useMutation, useQuery } from "@/hooks/use-query";
import { PublishType, SaveThemeModes } from "@shared/types/event";
import { log } from "@shared/utils/debug-logs";
import { SaveChangesPopover } from "./save-dialog";
import { useDebouncedSave, useDraftSaveShortcut } from "@/hooks/use-draft-save";
import { Separator } from "../../ui/separator";
import { DiscardChangesDialog } from "./discard-changes";
import { cn } from "@/lib/utils";
import ColorSearchDialog from "../colors/color-search-dialog";
import FontAndLayoutSearchDialog from "../font-and-layout/font-and-layout-search-dialog";

export default function FloatingSave({
  activeTab,
}: {
  activeTab: "colors" | "importer" | "fonts-layout";
}) {
  const {
    isSaving,
    drafts,
    saveDrafts,
    publishDraftChanges,
    isPublishingDraftChanges,
    discardChanges,
    isDiscarding,
  } = useDraft();
  useDraftSaveShortcut();
  useDebouncedSave();
  const { data: themesData } = useQuery({
    command: "GET_THEME_LIST",
    payload: [],
  });

  const sortedThemes = useMemo(() => {
    if (!themesData?.themes) return [];
    return [...themesData.themes].sort((a, b) =>
      a.label.localeCompare(b.label)
    );
  }, [themesData]);

  const handlePublishDraftChanges = (args: {
    publishType: PublishType;
    theme?: { mode: keyof typeof SaveThemeModes; themeName: string };
  }) => {
    // saveDrafts();
    publishDraftChanges(args);
    return;
  };
  if (activeTab === "importer" && drafts.length === 0) return null;
  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
      {drafts.length > 0 ? (
        <Badge className="relative left-1/2 -top-2 transform -translate-x-1/2 z-60 bg-primary/20 border border-primary/30 text-xs text-center backdrop-blur-xl text-foreground ">
          {isSaving ? (
            <span className="flex gap-2 items-center">
              Saving Changes <Loader2 className="w-4 h-4 animate-spin" />
            </span>
          ) : (
            <span>Auto Save Enabled (Shortcut CTRL+S)</span>
          )}
        </Badge>
      ) : null}
      <div
        className={cn(
          "h-12 relative flex items-center gap-1 p-2 bg-primary/10 rounded-full shadow-xl border border-primary/20 backdrop-blur-xl",
          isSaving ? "pointer-events-none" : ""
        )}
      >
        {activeTab === "colors" ? (
          <ColorSearchDialog key={activeTab} />
        ) : activeTab === "fonts-layout" ? (
          <FontAndLayoutSearchDialog key={activeTab} />
        ) : null}

        {drafts.length > 0 ? (
          <>
            <Separator orientation="vertical" />
            <div className="px-2 flex items-center justify-center gap-2">
              <DiscardChangesDialog
                handleDiscard={() => discardChanges({})}
                isDiscarding={isDiscarding}
              />
            </div>
            <Separator orientation="vertical" />
            <SaveChangesPopover
              isPublishingDraftChanges={isPublishingDraftChanges}
              isDiscarding={isDiscarding}
              onPublish={handlePublishDraftChanges}
              sortedThemes={sortedThemes}
              isSavingDrafts={isSaving}
            />
          </>
        ) : null}
      </div>
    </div>
  );
}
