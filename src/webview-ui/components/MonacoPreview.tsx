"use client";

import Editor, { useMonaco } from "@monaco-editor/react";
import { useEffect, useMemo, useState } from "react";
import { generateMonacoTheme } from "@webview/lib/themeGenerator";
import { useSettings } from "@webview/contexts/settings-context";
import { codeSamples, programmingLanguages } from "./CodeSamples";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { cn } from "@webview/lib/utils";

export default function MonacoPreview({ className }: { className?: string }) {
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const { colorsState, state } = useSettings();
  const monaco = useMonaco();

  const currentCode =
    codeSamples[selectedLanguage as keyof typeof codeSamples] ||
    codeSamples.javascript;

  // Get theme colors from user settings, fallback to CSS variables
  const getThemeColor = (colorKey: string, fallback: string) => {
    return colorsState[colorKey] || `var(--${fallback})`;
  };
  const editorOptions = useMemo(() => {
    return {
      readOnly: true,
      fontFamily: state?.settings?.editor?.fontFamily,
      fontSize: state?.settings?.editor?.fontSize,
      fontLigatures: true,
      lineHeight: Math.round((state?.settings?.editor?.lineHeight || 1.5) * 20),
      wordWrap: (state as any)?.settings?.editor?.wordWrap || "off",
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      renderWhitespace:
        state?.settings?.layout?.editor?.renderWhitespace || "none",
    } as any;
  }, [state]);
  useEffect(() => {
    if (!monaco) return;
    const theme = generateMonacoTheme(colorsState, "vs-dark");
    try {
      monaco.editor.defineTheme("tyc-preview-theme", theme as any);
    } catch {}
  }, [monaco, colorsState]);

  return (
    <div className="mt-4 relative h-full w-full">
      <Editor
        height="100%"
        defaultLanguage={selectedLanguage}
        value={currentCode}
        theme="tyc-preview-theme"
        options={editorOptions as any}
      />
      <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
        <SelectTrigger className="absolute top-1 right-4 w-40 bg-background border-border/60 rounded-lg h-8 px-1 py-1 max-w-max">
          <SelectValue className="text-xs" />
        </SelectTrigger>
        <SelectContent className="bg-card/95 border border-border/40 rounded-xl">
          {programmingLanguages.map((lang) => (
            <SelectItem
              key={lang.value}
              value={lang.value}
              className="rounded-lg"
            >
              <span className="flex items-center gap-2">
                <span>{lang.icon}</span>
                <span className="text-xs">{lang.label}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
