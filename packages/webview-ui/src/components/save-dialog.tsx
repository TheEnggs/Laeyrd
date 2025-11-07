"use client";

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
} from "@/components/ui/alert-dialog";
import { Save, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useState, useMemo } from "react";
import { SaveThemeModes } from "@shared/types/event";
import clsx from "clsx";

interface SaveChangesDialogProps {
  hasColorChanges: boolean;
  hasSettingsChanges: boolean;
  isSavingTheme: boolean;
  sortedThemes: { label: string }[];
  onSave: ({
    theme,
    settings,
  }: {
    theme: { mode: keyof typeof SaveThemeModes; themeName?: string };
    settings: { isSettingsSaveConfirmed: boolean };
  }) => void;
}

export function SaveChangesDialog({
  hasColorChanges,
  hasSettingsChanges,
  isSavingTheme,
  sortedThemes,
  onSave,
}: SaveChangesDialogProps) {
  const [mode, setMode] = useState<keyof typeof SaveThemeModes>(
    SaveThemeModes.OVERWRITE
  );
  const [themeName, setThemeName] = useState("");
  const [selectedTheme, setSelectedTheme] = useState("");
  const [isWarningConfirmed, setIsWarningConfirmed] = useState(false);
  const [isSettingsSaveConfirmed, setIsSettingsSaveConfirmed] = useState(false);

  const themeReady = useMemo(() => {
    if (mode === SaveThemeModes.OVERWRITE) return !!selectedTheme;
    if (mode === SaveThemeModes.CREATE)
      return !!themeName.trim() && isWarningConfirmed;
    return false;
  }, [mode, selectedTheme, themeName, isWarningConfirmed]);

  const settingsReady = isSettingsSaveConfirmed;

  const handleConfirmSave = () => {
    const name =
      mode === SaveThemeModes.OVERWRITE ? selectedTheme : themeName.trim();
    if (mode === SaveThemeModes.CREATE && !isWarningConfirmed) return;

    onSave({
      theme: { mode, themeName: name },
      settings: { isSettingsSaveConfirmed },
    });
  };

  const shouldShowDialog = hasColorChanges || hasSettingsChanges;
  if (!shouldShowDialog) return null;

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="default"
          size="sm"
          disabled={isSavingTheme}
          className="rounded-full font-medium"
        >
          <Save className="w-4 h-4 mr-2" />
          {isSavingTheme ? "Saving..." : "Save"}
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent className="bg-card border border-border/40 rounded-2xl shadow-xl max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-semibold">
            Save Your Changes
          </AlertDialogTitle>
          <AlertDialogDescription>
            Choose how you want to save your theme and settings. You can save
            both or only one.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="flex flex-col md:flex-row gap-6 py-4">
          {/* Theme Save Card */}
          {hasColorChanges && (
            <div
              className={clsx(
                "flex-1 rounded-xl border p-4 space-y-4 transition-all duration-200",
                themeReady
                  ? "border-primary/50 bg-primary/10"
                  : "border-border/40 bg-background/50"
              )}
            >
              <div className="flex items-center justify-between">
                <Label className="font-medium text-foreground">Theme</Label>
                {themeReady && (
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                )}
              </div>

              <div className="space-y-2">
                <Label>Save Mode</Label>
                <Select
                  value={mode}
                  onValueChange={(v: keyof typeof SaveThemeModes) => setMode(v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={SaveThemeModes.OVERWRITE}>
                      Overwrite Existing
                    </SelectItem>
                    <SelectItem value={SaveThemeModes.CREATE}>
                      Create New
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {mode === SaveThemeModes.OVERWRITE ? (
                <div>
                  <Label>Select Theme</Label>
                  <Select
                    value={selectedTheme}
                    onValueChange={setSelectedTheme}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a theme" />
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
                  <Label>New Theme Name</Label>
                  <Input
                    placeholder="Enter theme name"
                    value={themeName}
                    onChange={(e) => setThemeName(e.target.value)}
                  />
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="warning"
                      checked={isWarningConfirmed}
                      onCheckedChange={(v: boolean) => setIsWarningConfirmed(v)}
                      className="border border-input"
                    />
                    <Label
                      htmlFor="warning"
                      className="text-sm text-muted-foreground"
                    >
                      I understand that creating a new theme will reload the
                      window.
                    </Label>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Settings Save Card */}
          {hasSettingsChanges && (
            <div
              onClick={() => setIsSettingsSaveConfirmed((prev) => !prev)}
              className={clsx(
                "flex-1 rounded-xl border p-4 flex flex-col justify-between cursor-pointer transition-all duration-200 hover:border-primary/50",
                settingsReady
                  ? "border-primary/50 bg-primary/10"
                  : "border-border/40 bg-background/50"
              )}
            >
              <div className="flex items-center justify-between">
                <Label className="font-medium text-foreground">Settings</Label>
                {settingsReady ? (
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                ) : (
                  <div className="w-5 h-5 border rounded-full border-border/60" />
                )}
              </div>
              <div className="text-sm text-foreground mt-3">
                You have unsaved settings changes. Click the card to confirm
                saving settings changes.
              </div>
              <div className="text-xs text-muted-foreground mt-3">
                Disclaimer: Saving settings will overwrite the original settings
                file. You can always revert to the original settings if you've
                created account on Laeyrd.
              </div>
            </div>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-xl border-border/50">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirmSave}
            className="rounded-xl"
            disabled={!themeReady && !settingsReady}
          >
            Save
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
