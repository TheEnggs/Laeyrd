"use client";

import { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDraft } from "@/contexts/draft-context";
import { DraftStatePayload } from "@shared/types/theme";
import { Import } from "lucide-react";
import { semanticToTokenKeyMap } from "@shared/data/tokenList";

function getSemanticTokenKey(token: string) {
  return semanticToTokenKeyMap[token] || token;
}
export default function ThemeImporterDialog() {
  const { updateUnsavedChanges } = useDraft();

  const [open, setOpen] = useState(false);
  const [rawJson, setRawJson] = useState("");
  const [preview, setPreview] = useState<DraftStatePayload[]>([]);
  //   const [includeColors, setIncludeColors] = useState(true);
  //   const [includeTokens, setIncludeTokens] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const onFile = useCallback((file: File | null) => {
    setError(null);
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? "");
      setRawJson(text);
    };
    reader.onerror = () => setError("Failed to read file");
    reader.readAsText(file);
  }, []);

  const parseThemeToPayload = useCallback((obj: any): DraftStatePayload[] => {
    const out: DraftStatePayload[] = [];
    if (!obj || typeof obj !== "object") return out;

    // 1. UI/workbench colors
    if (obj.colors && typeof obj.colors === "object") {
      for (const [k, v] of Object.entries(obj.colors)) {
        if (typeof v === "string") {
          out.push({ key: k, value: v, type: "color" });
        }
      }
    }

    // 2. Semantic token colors (modern, what we want)
    if (
      obj.semanticTokenColors &&
      typeof obj.semanticTokenColors === "object"
    ) {
      for (const [token, def] of Object.entries(obj.semanticTokenColors)) {
        const value =
          typeof def === "string"
            ? def
            : typeof (def as any)?.foreground === "string"
              ? (def as any).foreground
              : null;
        if (value)
          out.push({
            key: getSemanticTokenKey(token),
            value,
            type: "semanticToken",
          });
      }
    }

    // 3. Under editor.semanticTokenColorCustomizations (theme extensions)
    if (
      obj.editor?.semanticTokenColorCustomizations &&
      typeof obj.editor.semanticTokenColorCustomizations === "object"
    ) {
      const sem = obj.editor.semanticTokenColorCustomizations;

      if (sem.enabled === false) {
        // if theme disables semantic tokens, skip
        return out;
      }

      // direct semanticTokenColors under customization
      if (
        sem.semanticTokenColors &&
        typeof sem.semanticTokenColors === "object"
      ) {
        for (const [token, def] of Object.entries(sem.semanticTokenColors)) {
          const value =
            typeof def === "string"
              ? def
              : typeof (def as any)?.foreground === "string"
                ? (def as any).foreground
                : null;
          if (value)
            out.push({
              key: getSemanticTokenKey(token),
              value,
              type: "semanticToken",
            });
        }
      }
    }

    return out;
  }, []);

  const runParse = useCallback(() => {
    setError(null);
    setPreview([]);
    try {
      const parsed = JSON.parse(rawJson);
      const payload = parseThemeToPayload(parsed);
      setPreview(payload);
    } catch (e) {
      setError(String(e));
    }
  }, [rawJson, parseThemeToPayload]);

  const importSelected = useCallback(() => {
    setError(null);
    updateUnsavedChanges(preview);
    setOpen(false);
  }, [preview, updateUnsavedChanges]);

  const previewList = useMemo(() => preview.slice(0, 200), [preview]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="rounded-full">
          Import <Import className="w-4 h-4 ml-2" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Import Theme JSON</DialogTitle>
          <DialogDescription>
            Paste a VS Code theme.json or drop a file. Only <code>colors</code>{" "}
            and <code>semanticTokenColors</code> will be imported.
          </DialogDescription>
        </DialogHeader>

        {error && <div className="text-sm text-destructive">{error}</div>}

        <div className="grid grid-cols-2 gap-2 w-full">
          <div className="w-full flex flex-col gap-2">
            <Input
              id="file"
              type="file"
              accept="application/json"
              onChange={(e) =>
                onFile(e.target.files ? e.target.files[0] : null)
              }
              className="shrink-0 border border-border rounded-md"
            />
            <textarea
              id="paste"
              className="w-full rounded-md border border-border p-2 resize-y flex-1"
              value={rawJson}
              onChange={(e) => setRawJson(e.target.value)}
              placeholder="Paste theme.json here"
            />
            {/* <div className="flex items-center gap-2">
                <Switch
                  id="colors"
                  checked={includeColors}
                  onCheckedChange={setIncludeColors}
                />
                <Label htmlFor="colors">Include colors</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="tokens"
                  checked={includeTokens}
                  onCheckedChange={setIncludeTokens}
                />
                <Label htmlFor="tokens">Include semantic token colors</Label>
              </div> */}
            <Button
              onClick={runParse}
              size="sm"
              className="shrink-0 place-self-end"
            >
              Parse
            </Button>
          </div>

          <div className="w-full flex flex-col gap-2">
            <div className="text-xs text-muted-foreground">
              Preview: {preview.length} items
            </div>
            <div className="border border-border rounded-md overflow-hidden p-2 w-full">
              <ScrollArea className="h-64 w-full">
                <div className="p-2">
                  {previewList.length === 0 ? (
                    <div className="text-sm text-muted-foreground">
                      No items parsed
                    </div>
                  ) : (
                    previewList.map((it, idx) => {
                      // if semanticToken -> extract .foreground, else use value directly
                      const colorValue =
                        it.type === "semanticToken"
                          ? it.value
                          : typeof it.value === "string"
                            ? it.value
                            : undefined; // non-color values ignored

                      return (
                        <div
                          key={idx}
                          className="flex items-center justify-between gap-2 py-1"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">
                              {it.key}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">
                              {it.type}
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            className="shrink-0 w-12 h-10 p-0 border-2 bg-transparent hover:scale-105 transition-transform border-border/60 rounded-xl pointer-none"
                            style={{ backgroundColor: colorValue }}
                          />
                        </div>
                      );
                    })
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>

        <DialogFooter>
          <div className="flex items-center gap-2 w-full">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={importSelected} className="ml-auto">
              Import selected
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
