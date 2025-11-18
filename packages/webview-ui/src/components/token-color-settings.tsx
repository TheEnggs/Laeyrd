"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ColorPicker from "./ui/color-picker";
import { useMemo } from "react";
import { ColorSettingsSkeleton } from "./skeleton/color-settings";
import { cn } from "@/lib/utils";
import { useQuery } from "../hooks/use-query";
import { useDraft } from "@/contexts/draft-context";
import { log } from "@shared/utils/debug-logs";
import { DraftStatePayload } from "@shared/types/theme";
import RemoveDraftChange from "./remove-draft-change";

export default function TokenColorSettings() {
  const { drafts, updateUnsavedChanges, handleRemoveDraftChange } = useDraft();
  const {
    data: semanticTokenColorsState,
    isLoading: isLoadingSemanticTokenColors,
  } = useQuery({
    command: "GET_THEME_TOKEN_COLORS",
    payload: [],
  });

  // 🔹 Memoized tree: category → subcategory → colors[]
  const colors = useMemo(() => {
    if (!semanticTokenColorsState) return {};
    const tree: Record<
      string,
      {
        key: string;
        displayName: string;
        description: string;
        value: string;
        originalValue: string | undefined;
        isTouched: boolean;
      }
    > = {};

    for (const [key, def] of Object.entries(semanticTokenColorsState)) {
      const draftColor = drafts.find(
        (c): c is Extract<DraftStatePayload, { type: "semanticToken" }> =>
          c.key === key && c.type === "semanticToken"
      );

      tree[key] = {
        key,
        displayName: def.displayName,
        description: def.description,
        value: draftColor?.value ?? def.defaultColor ?? "",
        originalValue: def.defaultColor,
        isTouched: !!draftColor,
      };
    }
    return tree;
  }, [semanticTokenColorsState, drafts]);

  if (isLoadingSemanticTokenColors) return <ColorSettingsSkeleton />;
  return (
    <div className="w-full">
      <div
        className={cn("grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3")}
      >
        {Object.entries(colors).map(([key, color]) => (
          <Card
            key={key}
            className="bg-card/50 border relative border-border/40 rounded-2xl shadow-sm overflow-hidden"
          >
            <RemoveDraftChange
              handleRemove={() =>
                handleRemoveDraftChange([
                  {
                    type: "semanticToken",
                    key: color.key,
                    value: color.value,
                  },
                ])
              }
              isTouched={color.isTouched}
            />
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-foreground text-lg font-semibold tracking-tight">
                {color.displayName}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                key={color.key}
                className={cn(
                  "border border-primary/20 space-y-3 rounded-xl p-4",
                  color.isTouched && " bg-primary/10"
                )}
              >
                {/* <div className="flex items-center justify-between"> */}
                <div>
                  <h4 className="text-base font-semibold text-foreground/80 tracking-tight">
                    {color.displayName}
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {color.description}
                  </p>
                </div>
                {/* <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground font-medium px-2 py-1 rounded-lg hover:bg-primary/5">
                                {color.key}
                              </span>
                            </div> */}
                {/* </div> */}
                <ColorPicker
                  value={color.value}
                  onChange={(value) =>
                    updateUnsavedChanges([
                      {
                        type: "semanticToken",
                        key: color.key,
                        value,
                      },
                    ])
                  }
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
