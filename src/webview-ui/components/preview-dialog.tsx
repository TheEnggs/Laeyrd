"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@webview/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@webview/components/ui/select";
import { Button } from "@webview/components/ui/button";
import {
  Eye,
  FileText,
  Search,
  GitBranch,
  Bug,
  Puzzle,
  Settings,
} from "lucide-react";
import { useSettings } from "../contexts/settings-context";
import { useMonaco } from "@monaco-editor/react";
import MonacoPreview from "./MonacoPreview";
import { programmingLanguages, codeSamples } from "./CodeSamples";

// moved to CodeSamples.ts

export default function PreviewDialog() {
  const { colorsState, previewOpen, previewAnchor, closePreview } =
    useSettings();

  // Get theme colors from user settings, fallback to CSS variables
  const getThemeColor = (colorKey: string, fallback: string) => {
    return colorsState[colorKey] || `var(--${fallback})`;
  };
  // Sidebar colors
  const sideBarBg = getThemeColor("sideBar.background", "color-sidebar");
  const sideBarFg = getThemeColor(
    "sideBar.foreground",
    "color-sidebar-foreground"
  );
  const sideBarBorder = getThemeColor("sideBar.border", "color-border");

  return (
    <Dialog open={previewOpen} onOpenChange={closePreview}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="bg-background/50 border-border/50 text-foreground hover:bg-accent/10 transition-all duration-200 h-8 px-4 text-xs font-medium rounded-xl"
        >
          <Eye className="w-3.5 h-3.5 mr-2" />
          Preview
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[60vh] overflow-hidden bg-background border border-border/40 rounded-2xl shadow-xl p-0">
        <DialogHeader className="px-4 py-3 border-b border-border/40">
          <div className="flex items-center justify-start gap-6">
            <DialogTitle className="text-sm font-medium">
              Theme Preview -{" "}
            </DialogTitle>
          </div>
        </DialogHeader>

        {/* VSCode-like Editor Layout */}
        <div className="grid grid-cols-[220px_1fr] gap-0 max-h-[78vh]">
          {/* Sidebar mock */}
          <div
            className="h-full border-r"
            style={{
              background: sideBarBg,
              color: sideBarFg,
              borderColor: sideBarBorder,
            }}
          >
            <div className="p-3 text-xs opacity-80">Explorer</div>
          </div>
          {/* Editor */}
          <div className="h-[78vh]">
            <MonacoPreview />
          </div>
        </div>
      </DialogContent>
      {/* Floating preview when a color picker is open */}
      {previewOpen && previewAnchor && (
        <div
          className="fixed z-50 rounded-xl border border-border/40 shadow-xl overflow-hidden bg-background"
          style={{
            top: Math.max(8, previewAnchor.top),
            left: Math.max(8, previewAnchor.left),
            width: Math.min(
              previewAnchor.width,
              window.innerWidth - previewAnchor.left - 8
            ),
            height: Math.min(
              previewAnchor.height,
              window.innerHeight - previewAnchor.top - 8
            ),
          }}
        >
          <div className="grid grid-cols-[120px_1fr] h-full">
            <div
              className="border-r"
              style={{
                background: sideBarBg,
                color: sideBarFg,
                borderColor: sideBarBorder,
              }}
            >
              <div className="p-2 text-[10px] opacity-80">Preview</div>
            </div>
            <MonacoPreview />
          </div>
        </div>
      )}
    </Dialog>
  );
}
