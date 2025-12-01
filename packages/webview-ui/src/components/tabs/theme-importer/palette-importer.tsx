"use client";

import { useCallback, useState } from "react";
import { Button, buttonVariants } from "@webview/components/ui/button";
import { Input } from "@webview/components/ui/input";
import { useDraft } from "@webview/contexts/draft-context";
import { DraftStatePayload, GROUP_NAMES, GroupName } from "@shared/types/theme";
import { colorCategoryMap } from "@shared/data/colorsList";
import ColorPicker from "@webview/components/ui/color-picker";
import {
  ArrowRight,
  Link,
  Loader2,
  RefreshCw,
  Trash2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@webview/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@webview/components/ui/select";
import { Label } from "@webview/components/ui/label";
import { cn } from "@webview/lib/utils";

// Derive unique group names from the map
const ALL_GROUPS = GROUP_NAMES;

export default function PaletteImporter() {
  const { updateUnsavedChanges } = useDraft(),

   [rawJson, setRawJson] = useState(""),
   [mappedColors, setMappedColors] = useState<
    Partial<Record<GroupName, string>>
  >({}),
   [importedPalette, setImportedPalette] = useState<
    Record<string, string>
  >({}),
   [isParsing, setIsParsing] = useState(false),
   [error, setError] = useState<string | null>(null),

   onFile = useCallback((file: File | null) => {
    setError(null);
    if (!file) {return;}
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? "");
      setRawJson(text);
    };
    reader.onerror = () => setError("Failed to read file");
    reader.readAsText(file);
  }, []),

   parseImportedJson = useCallback(() => {
    setError(null);
    setIsParsing(true);

    setTimeout(() => {
      try {
        let isJson = false,
         jsonError = "",
         parsed: any;

        // Strategy 1: Try JSON Parse
        try {
          parsed = JSON.parse(rawJson);
          isJson = true;
        } catch (e) {
          jsonError = (e as Error).message;
        }

        const flattened: Record<string, string> = {},
         isValidColor = (c: string) =>
          /^#([0-9a-fA-F]{3}){1,2}([0-9a-fA-F]{2})?$/.test(c);

        if (isJson) {
          // Handle JSON (Object or Array)
          const processObject = (target: any, prefix = "") => {
            if (!target) {return;}

            if (Array.isArray(target)) {
              target.forEach((val, idx) => {
                if (typeof val === "string") {
                  if (isValidColor(val)) {
                    flattened[`${prefix}Item ${idx + 1}`] = val;
                  }
                } else if (typeof val === "object") {
                  processObject(val, `${prefix}Item ${idx + 1}.`);
                }
              });
            } else if (typeof target === "object") {
              for (const [k, v] of Object.entries(target)) {
                if (typeof v === "string") {
                  if (isValidColor(v)) {
                    flattened[prefix + k] = v;
                  }
                } else if (typeof v === "object") {
                  processObject(v, `${prefix + k  }.`);
                }
              }
            }
          };

          // If it has a 'colors' property, we can focus on it, but for flexibility we process the whole thing
          // Unless 'colors' exists and is an object, then we prioritize that but maybe we shouldn't restrict it.
          // Let's process the whole object to be "extensible".
          processObject(parsed);

          if (Object.keys(flattened).length === 0) {
            setError(
              "The input is valid JSON, but we couldn't find any valid hex color strings (e.g., #ff0000) inside it."
            );
            setImportedPalette({});
            return;
          }
        } else {
          // Strategy 2: Regex Extraction (Fallback for raw text, CSS, SCSS, invalid JSON)
          // Matches #123, #123456, #12345678 (alpha)
          const hexRegex =
            /#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b/g,
           matches = rawJson.match(hexRegex);

          if (matches && matches.length > 0) {
            matches.forEach((color, idx) => {
              flattened[`Extracted ${idx + 1}`] = color;
            });
          } else {
            setError(
              `Could not parse as JSON (${jsonError}). Also failed to find any hex codes in the text.`
            );
            setImportedPalette({});
            return;
          }
        }

        setImportedPalette(flattened);

        // Auto-fill if keys match standard VS Code keys
        const newMapping: Partial<Record<GroupName, string>> = {
          ...mappedColors,
        };
        let foundCount = 0;
        for (const [key, meta] of Object.entries(colorCategoryMap)) {
          if (meta.groupName && flattened[key]) {
            newMapping[meta.groupName] = flattened[key];
            foundCount++;
          }
        }
        setMappedColors(newMapping);
      } catch (e) {
        setError("An unexpected error occurred during parsing.");
      } finally {
        setIsParsing(false);
      }
    }, 100);
  }, [rawJson, mappedColors]),

   handleColorChange = (group: GroupName, color: string) => {
    setMappedColors((prev) => ({ ...prev, [group]: color }));
  },

   handleKeyMap = (group: GroupName, importedKey: string) => {
    const color = importedPalette[importedKey];
    if (color) {
      setMappedColors((prev) => ({ ...prev, [group]: color }));
    }
  },

   applyPalette = () => {
    const changes: DraftStatePayload[] = [];

    // For each defined group color, find all VS Code keys that belong to it
    for (const [key, meta] of Object.entries(colorCategoryMap)) {
      if (meta.groupName && mappedColors[meta.groupName]) {
        changes.push({
          type: "color",
          key,
          value: mappedColors[meta.groupName]!,
        });
      }
    }

    updateUnsavedChanges(changes);
  },

   clearAll = () => {
    setMappedColors({});
    setImportedPalette({});
    setRawJson("");
    setError(null);
  },

   filledCount = Object.keys(mappedColors).length,
   importedKeys = Object.keys(importedPalette).sort();

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle> Import Palette</CardTitle>
          <CardDescription>
            Import a color palette file (JSON) to map its keys to the theme
            groups.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="file-upload">Upload JSON</Label>
            <Input
              id="file-upload"
              type="file"
              accept="application/json"
              onChange={(e) =>
                onFile(e.target.files ? e.target.files[0] : null)
              }
              className="bg-background"
            />
          </div>

          <div className="grid gap-2 relative">
            <Label htmlFor="json-paste">
              Paste JSON or #123, #123456, #12345678
            </Label>
            <textarea
              id="json-paste"
              className="w-full h-48 rounded-md border border-border p-2 text-xs font-mono resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background"
              value={rawJson}
              onChange={(e) => setRawJson(e.target.value)}
              placeholder='{ "primary": "#ff0000", "secondary": "#00ff00" }'
            />

            <Button
              onClick={parseImportedJson}
              disabled={!rawJson || isParsing}
              variant="default"
              size={"sm"}
              className="max-w-max absolute bottom-2 right-2"
            >
              {isParsing ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Parse Palette
            </Button>
          </div>

          {error && <p className="text-xs text-destructive">{error}</p>}

          {importedKeys.length > 0 && (
            <div className="text-xs max-w-max text-muted-foreground flex items-center gap-2 bg-muted/20 p-2 rounded-md">
              <span className="font-medium text-foreground">
                {importedKeys.length}
              </span>{" "}
              colors found in palette.
            </div>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row justify-between items-start gap-6">
          <div className="flex flex-col space-y-1.5">
            <CardTitle> Customize Groups</CardTitle>
            <CardDescription>
              Map imported keys to groups or manually adjust colors.
            </CardDescription>
          </div>
          <div className="flex gap-2 items-center justify-end">
            <Button
              onClick={applyPalette}
              disabled={filledCount === 0}
              size="sm"
              className="max-w-max"
            >
              Apply Palette <ArrowRight className="w-4 h-4 ml-2" />
            </Button>

            <Button
              onClick={clearAll}
              variant="outline"
              size="sm"
              className="max-w-max hover:text-destructive"
            >
              <Trash2 className="w-4 h-4 mr-2" /> Clear All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="p-4 grid grid-cols-1 xl:grid-cols-2 gap-4">
            {ALL_GROUPS.map((group) => (
              <div
                key={group}
                className="flex flex-col gap-2 p-3 rounded-xl border border-border/50 transition-all"
              >
                <div className="min-w-0">
                  <p
                    className="text-sm font-medium capitalize truncate"
                    title={group}
                  >
                    {group.split("_").join(" ")}
                  </p>
                  <p className="text-[10px] text-muted-foreground font-mono truncate">
                    {group}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-2">
                  {importedKeys.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Select onValueChange={(val) => handleKeyMap(group, val)}>
                        <SelectTrigger
                          className={cn(buttonVariants({ variant: "outline" }))}
                        >
                          <Link className="w-4 h-4 mr-2 text-muted-foreground shrink-0" />
                          <SelectValue placeholder="Map from palette..." />
                        </SelectTrigger>
                        <SelectContent className="border border-border/50 rounded-xl">
                          {importedKeys.map((key) => (
                            <SelectItem
                              key={key}
                              value={key}
                              className="text-sm bg-primary/5"
                            >
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-8 h-7 p-0 border-2 bg-transparent hover:scale-105 transition-transform border-border/60 rounded-xl"
                                  style={{
                                    backgroundColor: importedPalette[key],
                                  }}
                                />
                                <span>{key}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <ColorPicker
                    value={mappedColors[group] || ""}
                    onChange={(v) => handleColorChange(group, v)}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
