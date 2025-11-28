"use client";

import { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDraft } from "@/contexts/draft-context";
import { DraftStatePayload } from "@shared/types/theme";
import { semanticToTokenKeyMap } from "@shared/data/token/tokenList";
import { ArrowRight, Loader2, Trash2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function getSemanticTokenKey(token: string) {
  return semanticToTokenKeyMap[token] || token;
}

export default function JsonImporter() {
  const { updateUnsavedChanges } = useDraft();

  const [rawJson, setRawJson] = useState("");
  const [preview, setPreview] = useState<DraftStatePayload[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);

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
    if (obj.userTokenColors && typeof obj.userTokenColors === "object") {
      for (const [token, def] of Object.entries(obj.userTokenColors)) {
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

      // direct userTokenColors under customization
      if (sem.userTokenColors && typeof sem.userTokenColors === "object") {
        for (const [token, def] of Object.entries(sem.userTokenColors)) {
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
    setIsParsing(true);

    // Small timeout to allow UI to update if JSON is huge
    setTimeout(() => {
      try {
        const parsed = JSON.parse(rawJson);
        const payload = parseThemeToPayload(parsed);
        setPreview(payload);
      } catch (e) {
        setError(String(e));
      } finally {
        setIsParsing(false);
      }
    }, 100);
  }, [rawJson, parseThemeToPayload]);

  const importSelected = useCallback(() => {
    setError(null);
    updateUnsavedChanges(preview);
    // Maybe show a toast or success message?
  }, [preview, updateUnsavedChanges]);

  const colorsList = useMemo(
    () => preview.filter((it) => it.type === "color"),
    [preview]
  );
  const tokenColors = useMemo(
    () => preview.filter((it) => it.type === "semanticToken"),
    [preview]
  );

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
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Import Source</h3>
            <Input
              id="file"
              type="file"
              accept="application/json"
              onChange={(e) =>
                onFile(e.target.files ? e.target.files[0] : null)
              }
              className="shrink-0 border border-border rounded-md"
            />
          </div>
          <div className="flex-1 flex flex-col gap-2 min-h-0">
            <h3 className="text-sm font-medium">Or Paste JSON</h3>
            <textarea
              id="paste"
              className="w-full h-48 rounded-md border border-border p-2 text-xs font-mono resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background"
              value={rawJson}
              onChange={(e) => setRawJson(e.target.value)}
              placeholder="Paste JSON here"
            />
          </div>
          <Button
            onClick={runParse}
            size={"sm"}
            disabled={!rawJson || isParsing}
            className="max-w-max"
          >
            {isParsing ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : null}
            Parse JSON
          </Button>
        </CardContent>
      </Card>

      <div className="w-full flex flex-col gap-4 h-full min-h-0">
        <Card>
          <CardHeader className="flex flex-row justify-between items-start gap-6">
            <div className="flex flex-col space-y-1.5">
              <CardTitle>Preview</CardTitle>
              <CardDescription>
                Preview of the parsed JSON file.
              </CardDescription>
            </div>
            <div className="flex gap-2 items-center justify-end">
              <Button
                onClick={importSelected}
                disabled={preview.length === 0}
                size="sm"
                className="max-w-max"
              >
                Import <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Preview</h3>
              <span className="text-xs text-muted-foreground">
                {preview.length} items found
              </span>
            </div>

            <div className="border border-border rounded-md overflow-hidden flex-1 w-full bg-muted/10">
              <ScrollArea className="h-[60vh] w-full">
                <div className="p-4">
                  {error && (
                    <div className="text-sm text-destructive mb-4">{error}</div>
                  )}

                  {preview.length === 0 && !error ? (
                    <div className="text-sm text-muted-foreground text-center py-10">
                      Parse a JSON file to see preview
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {colorsList.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                            Colors ({colorsList.length})
                          </p>
                          <div className="space-y-1">
                            {colorsList.map((it, idx) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between gap-3 py-1.5 px-2 rounded hover:bg-muted/50 transition-colors"
                              >
                                <div className="flex-1 min-w-0">
                                  <div
                                    className="text-sm font-medium truncate"
                                    title={it.key}
                                  >
                                    {it.key}
                                  </div>
                                </div>
                                <div
                                  className="shrink-0 w-8 h-8 rounded-md border border-border shadow-sm"
                                  style={{ backgroundColor: it.value }}
                                  title={it.value}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {tokenColors.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                            Tokens ({tokenColors.length})
                          </p>
                          <div className="space-y-1">
                            {tokenColors.map((it, idx) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between gap-3 py-1.5 px-2 rounded hover:bg-muted/50 transition-colors"
                              >
                                <div className="flex-1 min-w-0">
                                  <div
                                    className="text-sm font-medium truncate"
                                    title={it.key}
                                  >
                                    {it.key}
                                  </div>
                                  <div className="text-xs text-muted-foreground truncate">
                                    {it.value.fontStyle
                                      ? `Style: ${it.value.fontStyle}`
                                      : "No style"}
                                  </div>
                                </div>
                                <div
                                  className="shrink-0 w-12 h-10 rounded-md border border-border shadow-sm"
                                  style={{
                                    backgroundColor: it.value.foreground,
                                  }}
                                  title={it.value.foreground}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
