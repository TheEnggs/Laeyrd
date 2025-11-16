"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDraft } from "../contexts/draft-context";
import { Loader2, Save } from "lucide-react";
import { useMemo } from "react";
import { useMutation, useQuery } from "@/hooks/use-query";
import useToast from "@/hooks/use-toast";
import { SaveThemeModes } from "@shared/types/event";
import { log } from "@shared/utils/debug-logs";
import { SaveChangesDialog } from "./save-dialog";
import { useDebouncedSave, useDraftSaveShortcut } from "@/hooks/use-draft-save";
import ThemeImporterDialog from "./theme-importer";
import { Separator } from "./ui/separator";
import { DiscardChangesDialog } from "./discard-changes";
import { cn } from "@/lib/utils";

export default function FloatingSave() {
  const toast = useToast();
  const { isSaving, drafts, saveDrafts, discardChanges, isDiscarding } =
    useDraft();
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
        <Badge className="relative left-1/2 -top-2 transform -translate-x-1/2 z-60 bg-primary/20 border border-primary/30 text-xs text-center backdrop-blur-xl text-foreground ">
          {isSaving ? (
            <span className="flex gap-2 items-center">
              Saving Changes <Loader2 className="w-4 h-4 animate-spin" />
            </span>
          ) : (
            <span>Auto Save is enabled</span>
          )}
        </Badge>
      ) : null}
      <div
        className={cn(
          "h-12 relative flex items-center gap-1 p-2 bg-primary/10 rounded-full shadow-xl border border-primary/20 backdrop-blur-xl",
          isSaving ? "pointer-events-none" : ""
        )}
      >
        <ThemeImporterDialog />

        {drafts.length > 0 ? (
          <>
            <Separator orientation="vertical" />
            <div className="px-2 flex items-center justify-center gap-2">
              <DiscardChangesDialog
                handleDiscard={() => discardChanges({})}
                isDiscarding={isDiscarding}
              />
              <Button
                variant="default"
                size="sm"
                disabled={isSavingTheme}
                onClick={saveDrafts}
                className="rounded-full font-medium"
              >
                <Save className="w-4 h-4 mr-2" />
                Save (CTRL+S)
              </Button>
            </div>
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
