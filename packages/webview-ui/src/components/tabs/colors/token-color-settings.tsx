"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@webview/components/ui/card";
import { useMemo } from "react";
import { cn } from "@webview/lib/utils";
import { useDraft } from "@webview/contexts/draft-context";
import {
  DraftStatePayload,
  TokenColorSettings as TokenColorSettingsType,
} from "@shared/types/theme";
import { useQuery } from "@webview/hooks/use-query";
import { CardSkeleton } from "../skeleton/card";
import RemoveDraftChange from "../shared/remove-draft-change";
import ColorPicker from "@webview/components/ui/color-picker";
import { Brackets } from "lucide-react";

export default function TokenColorSettings() {
  const { drafts, updateUnsavedChanges, handleRemoveDraftChange } = useDraft(),
   {
    data: semanticTokenColorsState,
    isLoading: isLoadingSemanticTokenColors,
  } = useQuery({
    command: "GET_THEME_TOKEN_MAP_COLORS",
    payload: [],
  }),

  // 🔹 Memoized tree: category → subcategory → colors[]
   colors = useMemo(() => {
    if (!semanticTokenColorsState) {return {};}
    const tree: Record<
      string,
      {
        key: string;
        displayName: string;
        description: string;
        value: TokenColorSettingsType;
        originalValue: string | undefined;
        isTouched: boolean;
      }
    > = {};

    for (const [key, def] of Object.entries(semanticTokenColorsState)) {
      const draftColor = drafts.find(
        (c): c is Extract<DraftStatePayload, { type: "token" }> =>
          c.key === key && c.type === "token"
      );

      tree[key] = {
        key,
        displayName: def.displayName,
        description: def.description,
        value: draftColor?.value ?? {
          foreground: def.defaultColor,
          fontStyle: def.defaultFontStyle ?? "none",
        },
        originalValue: def.defaultColor,
        isTouched: Boolean(draftColor),
      };
    }
    return tree;
  }, [semanticTokenColorsState, drafts]);

  return (
    <Card className="bg-card/50 border border-border/40 rounded-2xl shadow-sm overflow-hidden">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-foreground text-lg font-semibold tracking-tight">
          <div className="p-2 rounded-xl bg-primary/10">
            <Brackets className="w-5 h-5 text-primary" />
          </div>
          Token Customization
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground leading-relaxed">
          Note: Some token colors may not get applied as token colors are little
          tricky to handle.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoadingSemanticTokenColors ? (
          <CardSkeleton />
        ) : (
          <div
            className={cn(
              "grid gap-6 grid-cols-1 xl:grid-cols-3 md:grid-cols-2"
            )}
          >
            {Object.entries(colors).map(([key, color]) => (
              <div
                key={color.key}
                className={cn(
                  "border relative border-primary/20 space-y-3 rounded-xl p-4",
                  color.isTouched && " bg-primary/10"
                )}
              >
                <RemoveDraftChange
                  handleRemove={() =>
                    handleRemoveDraftChange([
                      {
                        type: "token",

                        key: color.key,
                        value: color.value,
                      },
                    ])
                  }
                  isTouched={color.isTouched}
                />
                {/* <div className="flex items-center justify-between"> */}
                <div>
                  <h4 className="text-base font-semibold text-foreground/80 tracking-tight">
                    {color.displayName}
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {color.description}
                  </p>
                </div>
                <ColorPicker
                  value={color.value.foreground || "#000000"}
                  onChange={(value) =>
                    updateUnsavedChanges([
                      {
                        type: "token",
                        key: color.key,
                        value: {
                          foreground: value,
                          fontStyle: color.value.fontStyle,
                        },
                      },
                    ])
                  }
                />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
