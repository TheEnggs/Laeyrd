"use client";

import { Button } from "@webview/components/ui/button";
import { Badge } from "@webview/components/ui/badge";
import { useSettings } from "../contexts/settings-context";
import { Save, RotateCcw, MonitorPlay } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@webview/components/ui/alert-dialog";
import { VSCodeMessenger } from "@webview/hooks/use-vscode-messenger";
import { useMemo, useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@webview/components/ui/select";
import { buildVSCodeSettingsFromState } from "@webview/lib/utils";
import { useQuery } from "@webview/hooks/use-query";

export default function FloatingSave() {
  const {
    hasColorChanges,
    hasSettingsChanges,
    draftFontState,
    draftLayoutState,
  } = useSettings();
  const { postMessage } = VSCodeMessenger();
  const { data: themesList, isLoading: isLoadingThemes } = useQuery({
    command: "GET_THEMES_LIST",
    payload: [],
  });
  const { data: activeThemeLabel, isLoading: isLoadingActiveTheme } = useQuery({
    command: "GET_ACTIVE_THEME_LABEL",
    payload: [],
  });
  const [livePreview, setLivePreview] = useState(false);

  const [mode, setMode] = useState<"overwrite" | "create">("overwrite");
  const [themeName, setThemeName] = useState<string>("");
  const [overwriteLabel, setOverwriteLabel] = useState<string | undefined>(
    undefined
  );
  const [loading, setLoading] = useState(false);
  console.log(themesList);
  const sortedThemes = useMemo(() => {
    return (themesList || [])
      ?.slice()
      ?.sort((a: any, b: any) => a.label.localeCompare(b.label));
  }, [themesList]);

  const handleSave = () => {
    setLoading(true);
    if (mode === "overwrite") {
      postMessage({
        command: "SAVE_THEME",
        payload: {
          themeName: overwriteLabel,
        },
      });
    } else if (mode === "create") {
      postMessage({
        command: "SAVE_THEME",
        payload: {
          themeName: themeName,
        },
      });
    }
    if (hasSettingsChanges) {
      postMessage({
        command: "SAVE_SETTINGS",
        payload: {
          settings: buildVSCodeSettingsFromState(
            draftFontState,
            draftLayoutState
          ),
        },
      });
    }
  };

  const toggleLivePreview = () => {
    const next = !livePreview;
    setLivePreview(next);
    postMessage({
      command: next ? "ENABLE_LIVE_PREVIEW" : "DISABLE_LIVE_PREVIEW",
    });
  };

  if (!hasColorChanges && !hasSettingsChanges) return null;

  //   // Auto-save while live preview is on
  //   useEffect(() => {
  //     if (!livePreview) return;
  //     postMessage({
  //       command: "LIVE_PREVIEW_APPLY",
  //       payload: {
  //         colors: colorsState,
  //         tokenColors: tokenColorsState,
  //         vscodeSettings: buildVSCodeSettingsFromState(state.settings),
  //       },
  //     });
  //   }, [livePreview, colorsState, tokenColorsState, state.settings, postMessage]);

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="relative flex items-center gap-3 px-2 py-2 bg-card/95 rounded-full shadow-xl border border-primary/10 backdrop-blur-xl">
        {/* Live Preview Toggle */}
        <Button
          variant={livePreview ? "default" : "outline"}
          size="sm"
          onClick={toggleLivePreview}
          className="px-4 font-medium transition-all duration-200 rounded-full"
          title={livePreview ? "Disable Live Preview" : "Enable Live Preview"}
        >
          <MonitorPlay className="w-4 h-4 mr-2" />
          {livePreview ? "Live Preview On" : "Live Preview"}
        </Button>
        {/* Divider */}
        <div className="w-px h-6 bg-border/40"></div>

        {/* Reset Button with Confirmation */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              disabled={!hasColorChanges || !hasSettingsChanges}
              size="sm"
              className="px-4 font-medium transition-all duration-200 bg-background/50 border-border/50 text-foreground hover:bg-accent/10 hover:border-accent/30 rounded-full"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-card/95 border border-border/40 rounded-2xl shadow-xl backdrop-blur-xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-foreground font-semibold tracking-tight">
                Reset All Changes
              </AlertDialogTitle>
              <AlertDialogDescription className="text-muted-foreground">
                Are you sure you want to reset all your customizations? This
                action cannot be undone and will restore all settings to their
                default values.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-background/50 border-border/50 text-foreground hover:bg-accent/10 rounded-xl">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl">
                Reset All Changes
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Save Button with Confirmation */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              size="sm"
              disabled={!hasColorChanges || !hasSettingsChanges || loading}
              className="px-6 font-medium bg-gradient-to-r from-primary/90 to-primary/80 hover:from-primary hover:to-primary/90 transition-all duration-200 shadow-sm text-primary-foreground rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? "Saving..." : "Save"}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-card/95 border border-border/40 rounded-2xl shadow-xl backdrop-blur-xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-foreground font-semibold tracking-tight">
                Save Changes
              </AlertDialogTitle>
              {hasColorChanges && hasSettingsChanges && (
                <AlertDialogDescription className="text-muted-foreground">
                  Choose to overwrite the current theme JSON or create a new
                  theme file.
                  <br />
                  This will overwrite the current settings JSON file.
                </AlertDialogDescription>
              )}
            </AlertDialogHeader>
            {hasColorChanges ? (
              <div className="space-y-4 py-2">
                <div className="flex items-center gap-4 w-full">
                  <label className="flex items-center gap-2 text-sm w-1/3">
                    <input
                      type="radio"
                      name="save-mode"
                      value="overwrite"
                      checked={mode === "overwrite"}
                      onChange={() => setMode("overwrite")}
                    />
                    Overwrite theme
                  </label>
                  {mode === "overwrite" && (
                    <div className="flex items-center gap-2 w-2/3">
                      <Select
                        value={overwriteLabel}
                        onValueChange={setOverwriteLabel}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select theme to overwrite" />
                        </SelectTrigger>
                        <SelectContent>
                          {sortedThemes.map((t: any) => (
                            <SelectItem key={t.label} value={t.label}>
                              <div className="flex items-center gap-2">
                                <span>{t.label}</span>
                                {activeThemeLabel === t.label && (
                                  <Badge className="ml-2" variant="secondary">
                                    Current
                                  </Badge>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-4 w-full">
                  <label className="flex items-center gap-2 text-sm w-1/3">
                    <input
                      type="radio"
                      name="save-mode"
                      value="create"
                      checked={mode === "create"}
                      onChange={() => setMode("create")}
                    />
                    Create new
                  </label>

                  <input
                    type="text"
                    placeholder="Theme Name"
                    className=" px-3 w-2/3 py-2 rounded-md bg-background/60 border border-border/40 text-sm"
                    disabled={mode !== "create"}
                    value={themeName}
                    onChange={(e) => setThemeName(e.target.value)}
                  />
                </div>
              </div>
            ) : null}
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-background/50 border-border/50 text-foreground hover:bg-accent/10 rounded-xl">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleSave}
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full"
              >
                Save Changes
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Changes Indicator */}
        {hasColorChanges && hasSettingsChanges && livePreview && (
          <Badge className="absolute -top-6 left-1/2 -translate-x-1/2 animate-pulse bg-accent text-accent-foreground text-[11px] px-2 py-1 rounded-full">
            Last Saved: 2 seconds ago
          </Badge>
        )}
      </div>
    </div>
  );
}
