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
import { useVSCodeMessenger } from "@webview/hooks/use-vscode-messenger";
import { useMemo, useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@webview/components/ui/select";

export default function Header() {
  const {
    hasChanges,
    isLoading,
    colorsState,
    tokenColorsState,
    setLoading,
    themesList,
    activeThemeLabel,
    state,
  } = useSettings() as any;
  const { postMessage } = useVSCodeMessenger();
  const [livePreview, setLivePreview] = useState(false);

  const [mode, setMode] = useState<"overwrite" | "create">("overwrite");
  const [themeName, setThemeName] = useState<string>("");
  const [overwriteLabel, setOverwriteLabel] = useState<string | undefined>(
    undefined
  );

  const sortedThemes = useMemo(() => {
    return (themesList || [])
      .slice()
      .sort((a: any, b: any) => a.label.localeCompare(b.label));
  }, [themesList]);

  const handleSave = () => {
    setLoading(true);
    postMessage({
      command: "SAVE_THEME",
      payload: {
        mode,
        themeName:
          mode === "create" ? themeName || "Untitled Theme" : undefined,
        overwriteLabel: mode === "overwrite" ? overwriteLabel : undefined,
        colors: colorsState,
        tokenColors: tokenColorsState,
        vscodeSettings: buildVSCodeSettingsFromState(state.settings),
      },
    });
  };

  const toggleLivePreview = () => {
    const next = !livePreview;
    setLivePreview(next);
    postMessage({
      command: next ? "ENABLE_LIVE_PREVIEW" : "DISABLE_LIVE_PREVIEW",
    });
  };

  // Auto-save while live preview is on
  useEffect(() => {
    if (!livePreview) return;
    postMessage({
      command: "LIVE_PREVIEW_APPLY",
      payload: {
        colors: colorsState,
        tokenColors: tokenColorsState,
        vscodeSettings: buildVSCodeSettingsFromState(state.settings),
      },
    });
  }, [livePreview, colorsState, tokenColorsState, state.settings, postMessage]);

  function buildVSCodeSettingsFromState(s: any) {
    // Map our local UI state into VS Code settings keys
    const out: any = {};
    // Fonts
    if (s.editor) {
      out["editor.fontFamily"] = s.editor.fontFamily;
      out["editor.fontSize"] = s.editor.fontSize;
      out["editor.fontWeight"] = s.editor.fontWeight;
      out["editor.lineHeight"] = s.editor.lineHeight;
      out["editor.letterSpacing"] = s.editor.letterSpacing;
      out["editor.tabSize"] = s.editor.tabSize;
      if (s.editor.wordWrap) out["editor.wordWrap"] = s.editor.wordWrap;
      if (s.editor.wordWrapColumn)
        out["editor.wordWrapColumn"] = s.editor.wordWrapColumn;
    }
    if (s.terminal) {
      out["terminal.integrated.fontFamily"] = s.terminal.fontFamily;
      out["terminal.integrated.fontSize"] = s.terminal.fontSize;
      out["terminal.integrated.fontWeight"] = s.terminal.fontWeight;
      out["terminal.integrated.lineHeight"] = s.terminal.lineHeight;
      out["terminal.integrated.letterSpacing"] = s.terminal.letterSpacing;
      if (s.terminal.cursorStyle)
        out["terminal.integrated.cursorStyle"] = s.terminal.cursorStyle;
      if (s.terminal.cursorWidth)
        out["terminal.integrated.cursorWidth"] = s.terminal.cursorWidth;
      if (typeof s.terminal.cursorBlinking === "boolean")
        out["terminal.integrated.cursorBlinking"] = s.terminal.cursorBlinking;
    }
    if (s.ui) {
      out["window.zoomLevel"] = s.layout?.window?.zoomLevel ?? 0;
      // Not all UI font settings map directly to VS Code settings; keep common ones
    }
    // Workbench layout
    if (s.workbench) {
      out["workbench.sideBar.location"] = s.workbench.sideBarLocation;
      out["workbench.panel.defaultLocation"] = s.workbench.panelLocation;
      out["workbench.activityBar.location"] = s.workbench.activityBarLocation;
    }
    // Layout editor/search/explorer
    const layout = s.layout || {};
    if (layout.window) {
      out["window.titleBarStyle"] = layout.window.titleBarStyle;
      out["window.menuBarVisibility"] = layout.window.menuBarVisibility;
      out["window.zoomLevel"] = layout.window.zoomLevel;
      //   out["window.nativeFullScreen"] = layout.window.nativeFullScreen;
      out["window.nativeTabs"] = layout.window.nativeTabs;
    }
    if (layout.zenMode) {
      out["zenMode.fullScreen"] = layout.zenMode.fullScreen;
      out["zenMode.centerLayout"] = layout.zenMode.centerLayout;
      out["zenMode.hideLineNumbers"] = layout.zenMode.hideLineNumbers;
      out["zenMode.hideTabs"] = layout.zenMode.hideTabs;
      out["zenMode.hideStatusBar"] = layout.zenMode.hideStatusBar;
      out["zenMode.hideActivityBar"] = layout.zenMode.hideActivityBar;
      out["zenMode.hideSideBar"] = layout.zenMode.hideSideBar;
      out["zenMode.hideMenuBar"] = layout.zenMode.hideMenuBar;
    }
    if (layout.editor) {
      out["editor.showFoldingControls"] = layout.editor.showFoldingControls;
      out["editor.foldingStrategy"] = layout.editor.foldingStrategy;
      out["editor.renderLineHighlight"] = layout.editor.renderLineHighlight;
      out["editor.renderWhitespace"] = layout.editor.renderWhitespace;
      out["editor.renderControlCharacters"] =
        layout.editor.renderControlCharacters;
      out["editor.renderIndentGuides"] = layout.editor.renderIndentGuides;
      out["editor.renderValidationDecorations"] =
        layout.editor.renderValidationDecorations;
      if (layout.editor.guides) {
        out["editor.guides.indentation"] = layout.editor.guides.indentation;
        out["editor.guides.bracketPairs"] = layout.editor.guides.bracketPairs;
        out["editor.guides.bracketPairsHorizontal"] =
          layout.editor.guides.bracketPairsHorizontal;
        out["editor.guides.highlightActiveIndentation"] =
          layout.editor.guides.highlightActiveIndentation;
        out["editor.guides.highlightActiveBracketPair"] =
          layout.editor.guides.highlightActiveBracketPair;
      }
    }
    if (layout.explorer) {
      out["explorer.compactFolders"] = layout.explorer.compactFolders;
      out["explorer.sortOrder"] = layout.explorer.sortOrder;
      out["explorer.openEditors.visible"] = layout.explorer.openEditorsVisible;
      out["explorer.autoReveal"] = layout.explorer.autoReveal;
    }
    if (layout.search) {
      out["search.showLineNumbers"] = layout.search.showLineNumbers;
      out["search.useGlobalIgnoreFiles"] = layout.search.useGlobalIgnoreFiles;
      out["search.useParentIgnoreFiles"] = layout.search.useParentIgnoreFiles;
      out["search.useIgnoreFiles"] = layout.search.useIgnoreFiles;
      out["search.useExcludeSettingsAndIgnoreFiles"] =
        layout.search.useExcludeSettingsAndIgnoreFiles;
      out["search.followSymlinks"] = layout.search.followSymlinks;
    }
    return out;
  }

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="relative flex items-center gap-3 px-6 py-4 bg-card/95 border border-border/40 rounded-2xl shadow- xl backdrop-blur-xl">
        {/* Live Preview Toggle */}
        <Button
          variant={livePreview ? "default" : "outline"}
          size="sm"
          onClick={toggleLivePreview}
          className="h-10 px-4 text-sm font-medium transition-all duration-200 rounded-xl"
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
              size="sm"
              className="h-10 px-4 text-sm font-medium transition-all duration-200 bg-background/50 border-border/50 text-foreground hover:bg-accent/10 hover:border-accent/30 rounded-xl"
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
              disabled={!hasChanges || isLoading}
              className="h-10 px-6 text-sm font-medium bg-gradient-to-r from-primary/90 to-primary/80 hover:from-primary hover:to-primary/90 transition-all duration-200 shadow-sm text-primary-foreground rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-card/95 border border-border/40 rounded-2xl shadow-xl backdrop-blur-xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-foreground font-semibold tracking-tight">
                Save Theme Changes
              </AlertDialogTitle>
              <AlertDialogDescription className="text-muted-foreground">
                Choose to overwrite the current theme JSON or create a new theme
                file.
              </AlertDialogDescription>
            </AlertDialogHeader>
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
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-background/50 border-border/50 text-foreground hover:bg-accent/10 rounded-xl">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleSave}
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl"
              >
                Save Changes
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Changes Indicator */}
        {hasChanges && (
          <Badge className="absolute -top-1 -translate-y-1/2 left-1/2 -translate-x-1/2 animate-pulse bg-accent text-accent-foreground text-xs px-2 py-1 rounded-full">
            Unsaved Changes
          </Badge>
        )}
      </div>
    </div>
  );
}
