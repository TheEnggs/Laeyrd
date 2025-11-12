"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDraft } from "../contexts/draft-context";
import { Loader2, MonitorPlay } from "lucide-react";
import { useState, useMemo } from "react";
import { useMutation, useQuery } from "@/hooks/use-query";
import useToast from "@/hooks/use-toast";
import { buildVSCodeSettingsFromState } from "@/lib/utils";
import { useLivePreview } from "../hooks/use-live-preview";
import { SaveThemeModes } from "@shared/types/event";
import { log } from "@shared/utils/debug-logs";
import { SaveChangesDialog } from "./save-dialog";
import { useDraftSaveShortcut } from "@/hooks/use-draft-save-shortcut";
import ThemeImporterDialog from "./theme-importer";
import { Separator } from "./ui/separator";
import { DiscardChangesDialog } from "./discard-changes";

export default function FloatingSave() {
  const toast = useToast();
  const { isSaving, drafts, saveDrafts } = useDraft();
  useDraftSaveShortcut();
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

  const { mutate: saveTheme, isPending: isSavingTheme } = useMutation(
    "SAVE_THEME",
    {
      onSuccess: () => {
        toast({ message: "Theme saved", type: "success" });
      },
      onError: (error) => {
        log(error);
        toast({ message: "Failed to save theme", type: "error" });
      },
    }
  );

  const { mutate: discardChanges, isPending: isDiscarding } = useMutation(
    "DISCARD_DRAFT_CHANGES",
    {
      onSuccess: () => {
        toast({ message: "Draft changes discarded", type: "success" });
      },
      onError: (error) => {
        log(error);
        toast({ message: "Failed to discard draft changes", type: "error" });
      },
    }
  );

  // Unified save logic
  const handleSave = ({
    theme,
  }: {
    theme: { mode: keyof typeof SaveThemeModes; themeName?: string };
  }) => {
    handleSaveTheme(theme.mode, theme.themeName);
  };

  const handleSaveTheme = (
    mode: keyof typeof SaveThemeModes,
    themeName: string | undefined
  ) => {
    if (!themeName) {
      return toast({ message: "Theme name missing", type: "error" });
    }
    saveDrafts();
    saveTheme({
      mode,
      themeName,
    });
  };

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
      {drafts.length > 0 ? (
        <Badge
          onClick={saveDrafts}
          className="relative left-1/2 -top-2 transform -translate-x-1/2 z-60 bg-primary/20 border border-primary/30 text-xs text-center backdrop-blur-xl text-foreground"
        >
          Save to draft (ctrl+s)
        </Badge>
      ) : null}
      <div className="h-12 relative flex items-center gap-3 p-2 bg-primary/10 rounded-full shadow-xl border border-primary/20 backdrop-blur-xl">
        <ThemeImporterDialog />
        <Separator orientation="vertical" />
        <DiscardChangesDialog
          handleDiscard={() => discardChanges({})}
          isDiscarding={isDiscarding}
        />

        {drafts.length > 0 ? (
          <>
            <Separator orientation="vertical" />
            <SaveChangesDialog
              isSavingTheme={isSavingTheme}
              isDiscarding={isDiscarding}
              onSave={handleSave}
              sortedThemes={sortedThemes}
            />
          </>
        ) : null}
      </div>
    </div>
  );
}
