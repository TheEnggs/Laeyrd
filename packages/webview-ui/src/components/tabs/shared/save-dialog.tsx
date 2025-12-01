"use client";

import { useMemo, useState } from "react";
import { BookCheck, CheckCircle2, ChevronUp, Save } from "lucide-react";
import { Button } from "@webview/components/ui/button";
import { Input } from "@webview/components/ui/input";
import { Label } from "@webview/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@webview/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@webview/components/ui/popover";
import clsx from "clsx";
import { PublishType, SaveThemeModes } from "@shared/types/event";
import useToast from "@webview/hooks/use-toast";

interface SaveChangesPopoverProps {
  isPublishingDraftChanges: boolean;
  isDiscarding: boolean;
  sortedThemes: { label: string }[];
  onPublish: (args: {
    publishType: "settings" | "theme" | "both";
    theme?: { mode: keyof typeof SaveThemeModes; themeName: string };
  }) => void;
  isSavingDrafts: boolean;
}

export function SaveChangesPopover({
  isPublishingDraftChanges,
  isDiscarding,
  sortedThemes,
  onPublish,
  isSavingDrafts,
}: SaveChangesPopoverProps) {
  const toast = useToast(),
   [open, setOpen] = useState(false),

  // High-level: what user wants to save
   [publishType, setPublishType] = useState<PublishType>("both"),

  // Theme-specific state
   [mode, setMode] = useState<keyof typeof SaveThemeModes>(
    SaveThemeModes.OVERWRITE
  ),
   [themeName, setThemeName] = useState(""),
   [selectedTheme, setSelectedTheme] = useState(""),

   includesTheme = publishType === "theme" || publishType === "both",

   themeReady = useMemo(() => {
    if (!includesTheme) {return true;}

    if (mode === SaveThemeModes.OVERWRITE) {
      return Boolean(selectedTheme);
    }

    if (mode === SaveThemeModes.CREATE) {
      return Boolean(themeName.trim());
    }

    return false;
  }, [includesTheme, mode, selectedTheme, themeName]),

   handleSave = () => {
    let name: string | undefined;

    if (includesTheme) {
      name =
        mode === SaveThemeModes.OVERWRITE
          ? selectedTheme
          : themeName.trim() || undefined;
    }
    if (includesTheme && !name) {
      return toast({ message: "Theme name missing", type: "error" });
    }
    onPublish({
      publishType,
      theme: {
        mode,
        themeName: name || "Untitled Theme",
      },
    });

    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={isPublishingDraftChanges || isDiscarding}
          className="rounded-full font-medium gap-2"
        >
          <BookCheck className="w-4 h-4" />
          <span>Publish</span>
          <ChevronUp className="w-4 h-4 ml-2" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={14}
        className="w-[320px] md:w-[380px] bg-primary/10 rounded-xl shadow-xl border border-primary/20 backdrop-blur-xl p-4 space-y-4"
      >
        {/* Header */}
        <div className="space-y-1">
          <h3 className="text-sm font-semibold">Save your changes</h3>
          <p className="text-xs text-muted-foreground">
            Choose what you want to save and how themes should be handled.
          </p>
        </div>

        {/* Save type */}
        <div className="space-y-2">
          <Label className="text-xs font-medium">
            What do you want to save?
          </Label>
          <div className="grid grid-cols-1 gap-1.5 text-xs">
            <button
              type="button"
              className={clsx(
                "flex h-8 items-center justify-between rounded-lg border px-2 transition-colors",
                publishType === "settings"
                  ? "border-primary/60 bg-primary/10 text-primary"
                  : "border-border/60 hover:bg-muted/60"
              )}
              onClick={() => setPublishType("settings")}
            >
              <span>Settings only</span>
              {publishType === "settings" && (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              )}
            </button>

            <button
              type="button"
              className={clsx(
                "flex h-8 items-center justify-between rounded-lg border px-2 transition-colors",
                publishType === "theme"
                  ? "border-primary/60 bg-primary/10 text-primary"
                  : "border-border/60 hover:bg-muted/60"
              )}
              onClick={() => setPublishType("theme")}
            >
              <span>Theme only</span>
              {publishType === "theme" && (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              )}
            </button>

            <button
              type="button"
              className={clsx(
                "flex h-8 items-center justify-between rounded-lg border px-2 transition-colors",
                publishType === "both"
                  ? "border-primary/60 bg-primary/10 text-primary"
                  : "border-border/60 hover:bg-muted/60"
              )}
              onClick={() => setPublishType("both")}
            >
              <span>Theme + Settings</span>
              {publishType === "both" && (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              )}
            </button>
          </div>
        </div>

        {/* Theme section (only if needed) */}
        {includesTheme && (
          <div
            className={clsx(
              "rounded-xl border p-3 space-y-3 transition-all duration-200",
              themeReady
                ? "border-primary/50 bg-primary/5"
                : "border-border/40 bg-background/60"
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-foreground">
                Theme save mode
              </span>
              {themeReady && <CheckCircle2 className="w-4 h-4 text-primary" />}
            </div>

            {/* Mode selector */}
            <div className="space-y-1.5">
              <Label className="text-xs">Mode</Label>
              <Select
                value={mode}
                onValueChange={(v: keyof typeof SaveThemeModes) => setMode(v)}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Select mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={SaveThemeModes.OVERWRITE}>
                    Overwrite existing
                  </SelectItem>
                  <SelectItem value={SaveThemeModes.CREATE}>
                    Create new
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Mode-specific content */}
            {mode === SaveThemeModes.OVERWRITE ? (
              <div className="space-y-1.5">
                <Label className="text-xs">Select theme</Label>
                <Select value={selectedTheme} onValueChange={setSelectedTheme}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Choose a theme" />
                  </SelectTrigger>
                  <SelectContent>
                    {sortedThemes.map((theme) => (
                      <SelectItem key={theme.label} value={theme.label}>
                        {theme.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="space-y-1.5">
                  <Label className="text-xs">New theme name</Label>
                  <Input
                    className="h-8 text-xs"
                    placeholder="Eg. Night Owl Pro"
                    value={themeName}
                    onChange={(e) => setThemeName(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-1 gap-2">
          <p className="text-[11px] text-muted-foreground">
            {includesTheme
              ? "I understand that creating a new theme may reload the window and apply this theme."
              : "Only your editor settings will be updated."}
          </p>

          <Button
            size="sm"
            className="h-8 rounded-xl px-3 text-xs"
            disabled={!themeReady || isPublishingDraftChanges || isSavingDrafts}
            onClick={handleSave}
          >
            <Save className="w-3 h-3 mr-1.5" />
            Publish
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
