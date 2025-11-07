"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSettings } from "../contexts/settings-context";
import { Loader2, MonitorPlay } from "lucide-react";
import { useState, useMemo } from "react";
import { useMutation, useQuery } from "@/hooks/use-query";
import useToast from "@/hooks/use-toast";
import { buildVSCodeSettingsFromState } from "@/lib/utils";
import { useLivePreview } from "../hooks/use-live-preview";
import { SaveThemeModes } from "@shared/types/event";
import { log } from "@shared/utils/debug-logs";
import { SaveChangesDialog } from "./save-dialog";

export default function FloatingSave() {
  const {
    hasColorChanges,
    hasSettingsChanges,
    draftFontLayoutState,
    draftColorState,
    draftTokenState,
    fontLayoutDispatch,
    colorDispatch,
    tokenDispatch,
  } = useSettings();

  const toast = useToast();

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
        colorDispatch({ type: "RESET" });
        tokenDispatch({ type: "RESET" });
        toast({ message: "Theme saved", type: "success" });
      },
      onError: (error) => {
        log(error);
        toast({ message: "Failed to save theme", type: "error" });
      },
    }
  );

  const { mutate: saveSettings } = useMutation("SAVE_SETTINGS", {
    onSuccess: () => {
      fontLayoutDispatch({ type: "RESET" });
      toast({ message: "Settings saved", type: "success" });
    },
    onError: () => toast({ message: "Failed to save settings", type: "error" }),
  });

  // Unified save logic
  const handleSave = ({
    theme,
    settings,
  }: {
    theme: { mode: keyof typeof SaveThemeModes; themeName?: string };
    settings: { isSettingsSaveConfirmed: boolean };
  }) => {
    if (hasSettingsChanges && settings && settings.isSettingsSaveConfirmed) {
      handleSaveSettings();
    }
    if (hasColorChanges && theme) {
      handleSaveTheme(theme.mode, theme.themeName);
    }
  };

  const handleSaveTheme = (
    mode: keyof typeof SaveThemeModes,
    themeName: string | undefined
  ) => {
    if (!themeName) {
      return toast({ message: "Theme name missing", type: "error" });
    }
    saveTheme({
      mode,
      themeName,
      colors: draftColorState,
      tokenColors: draftTokenState,
    });
  };

  const handleSaveSettings = () => {
    saveSettings({
      settings: buildVSCodeSettingsFromState(
        draftFontLayoutState,
        draftFontLayoutState
      ),
    });
  };

  const { toggleLivePreview, livePreview, mutationPending } = useLivePreview({
    hasColorChanges,
    draftColorState,
    draftTokenState,
    saveTheme,
  });

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="relative flex items-center gap-3 px-3 py-2 bg-primary/10 rounded-full shadow-xl border border-primary/20 backdrop-blur-xl">
        <Button
          variant={livePreview ? "default" : "outline"}
          size="sm"
          onClick={() => {
            toggleLivePreview();
          }}
          className="px-4 font-medium rounded-full"
        >
          <MonitorPlay className="w-4 h-4 mr-2" />
          {mutationPending ? (
            <span>
              Live Preview <Loader2 className="spin" />
            </span>
          ) : livePreview ? (
            "Live Preview: ON"
          ) : (
            "Live Preview: OFF"
          )}
        </Button>

        {hasColorChanges || hasSettingsChanges ? (
          <div className="w-px h-6 bg-primary/20"></div>
        ) : null}

        <SaveChangesDialog
          hasColorChanges={hasColorChanges}
          hasSettingsChanges={hasSettingsChanges}
          isSavingTheme={isSavingTheme}
          onSave={handleSave}
          sortedThemes={sortedThemes}
        />
      </div>
    </div>
  );
}
