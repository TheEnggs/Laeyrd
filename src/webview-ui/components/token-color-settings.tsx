"use client";

import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { AlertCircle } from "lucide-react";
import { useQuery } from "../hooks/use-query";
import { SemanticTokenColors, TokenColorsList } from "../../types/theme";
import { useSettings } from "../contexts/settings-context";
import ColorPicker from "./ui/color-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { cn } from "../lib/utils";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useRef, useMemo, memo } from "react";
import { ColorSettingsSkeleton } from "./skeleton/color-settings";

export default function TokenColorSettings() {
  const { draftTokenState, tokenDispatch } = useSettings();

  const { data: tokenColorsState, isLoading: isLoadingTokenColors } = useQuery({
    command: "GET_THEME_TOKEN_COLORS",
    payload: [],
  });

  const {
    data: semanticTokenColorsState,
    isLoading: isLoadingSemanticTokenColors,
  } = useQuery({
    command: "GET_SEMANTIC_TOKEN_COLORS",
    payload: [],
  });

  console.log("tokenColorsState", tokenColorsState);
  console.log("semanticTokenColorsState", semanticTokenColorsState);

  if (
    !isLoadingTokenColors &&
    !isLoadingSemanticTokenColors &&
    !tokenColorsState &&
    !semanticTokenColorsState
  )
    return (
      <div className="w-full flex flex-col items-center justify-center py-12">
        <AlertCircle className="w-8 h-8 text-destructive mb-2" />
        <p className="text-foreground/80 font-medium">
          Failed to load theme token colors.
        </p>
      </div>
    );

  return (
    <div className="space-y-6">
      {/* Semantic Token Colors Section */}
      {semanticTokenColorsState && (
        <Card className="bg-card/50 border border-border/40 rounded-2xl shadow-sm overflow-hidden">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-foreground text-lg font-semibold tracking-tight">
              <div className="p-2 rounded-xl bg-primary/10">
                <div className="w-5 h-5 text-primary">🎨</div>
              </div>
              Semantic Token Colors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
              {Object.entries(semanticTokenColorsState).map(([key, color]) => {
                const currentValue =
                  draftTokenState.semanticTokenColors[key]?.foreground ??
                  color.foreground;

                return (
                  <div key={key} className="space-y-3">
                    <div>
                      <h4 className="text-base font-semibold text-foreground/80 tracking-tight">
                        {key}
                      </h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Semantic token color
                      </p>
                    </div>
                    <ColorPicker
                      value={currentValue}
                      onChange={(newValue) =>
                        tokenDispatch({
                          type: "SET_SEMANTIC_TOKEN_COLOR",
                          key,
                          value: { foreground: String(newValue) },
                        })
                      }
                    />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Token Colors Section - Virtualized */}
      {isLoadingTokenColors ? (
        <ColorSettingsSkeleton />
      ) : tokenColorsState ? (
        <VirtualizedTokenColors
          tokenColorsState={tokenColorsState}
          draftTokenState={draftTokenState}
          tokenDispatch={tokenDispatch}
        />
      ) : null}
    </div>
  );
}

// Virtualized Token Colors Component
const VirtualizedTokenColors = memo(function VirtualizedTokenColors({
  tokenColorsState,
  draftTokenState,
  tokenDispatch,
}: {
  tokenColorsState: TokenColorsList;
  draftTokenState: any;
  tokenDispatch: any;
}) {
  const parentRef = useRef<HTMLDivElement>(null);

  // Convert token colors to array for virtualization
  const tokenColorsArray = useMemo(() => {
    return Object.entries(tokenColorsState).map(([category, meta]) => ({
      category,
      meta,
    }));
  }, [tokenColorsState]);

  // Configure virtualizer
  const rowVirtualizer = useVirtualizer({
    count: tokenColorsArray.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 180, // Estimated height of each item
    overscan: 3, // Number of items to render outside of the visible area
    scrollPaddingEnd: 20, // Add padding at the end for better UX
  });

  return (
    <Card className="bg-card/50 border border-border/40 rounded-2xl shadow-sm overflow-hidden">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-foreground text-lg font-semibold tracking-tight">
          <div className="p-2 rounded-xl bg-primary/10">
            <div className="w-5 h-5 text-primary">🔤</div>
          </div>
          Token Colors ({tokenColorsArray.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div
          ref={parentRef}
          className="h-[800px] overflow-auto hideScrollbar"
          style={{
            contain: "strict",
          }}
        >
          <div
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              width: "100%",
              position: "relative",
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const { category, meta } = tokenColorsArray[virtualRow.index];
              const currentTokenColor = draftTokenState.tokenColors[category];
              const currentForeground =
                currentTokenColor?.foreground ?? meta.defaultColor;
              const currentFontStyle =
                currentTokenColor?.fontStyle ?? meta.defaultFontStyle;

              return (
                <div
                  key={virtualRow.index}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                  className="px-1"
                >
                  <div className="h-full p-4 bg-background/50 rounded-lg border border-border/20">
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-base font-semibold text-foreground/80 tracking-tight">
                          {meta.displayName}
                        </h4>
                        {/* <p className="text-xs text-muted-foreground leading-relaxed">
                          {meta.description}
                        </p> */}
                      </div>

                      {/* Color Picker */}
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground">
                          Color
                        </label>
                        <ColorPicker
                          value={currentForeground || "#000000"}
                          onChange={(newValue) =>
                            tokenDispatch({
                              type: "SET_TOKEN_COLOR",
                              key: category,
                              value: {
                                ...currentTokenColor,
                                foreground: String(newValue),
                              },
                            })
                          }
                        />
                      </div>

                      {/* Font Style Selector */}
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground">
                          Font Style
                        </label>
                        <Select
                          value={currentFontStyle || "none"}
                          onValueChange={(value) =>
                            tokenDispatch({
                              type: "SET_TOKEN_COLOR",
                              key: category,
                              value: {
                                ...currentTokenColor,
                                fontStyle: value === "none" ? undefined : value,
                              },
                            })
                          }
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select font style" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Normal</SelectItem>
                            <SelectItem value="bold">Bold</SelectItem>
                            <SelectItem value="italic">Italic</SelectItem>
                            <SelectItem value="underline">Underline</SelectItem>
                            <SelectItem value="bold italic">
                              Bold Italic
                            </SelectItem>
                            <SelectItem value="bold underline">
                              Bold Underline
                            </SelectItem>
                            <SelectItem value="italic underline">
                              Italic Underline
                            </SelectItem>
                            <SelectItem value="bold italic underline">
                              Bold Italic Underline
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
