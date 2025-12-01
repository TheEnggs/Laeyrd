"use client";

import { useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@webview/components/ui/card";
import { useDraft } from "@webview/contexts/draft-context";
import { CardSkeleton } from "../skeleton/card";
import { Input } from "@webview/components/ui/input";
import { Switch } from "@webview/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@webview/components/ui/select";
import { UiLayoutMeta } from "@shared/types/layout";
import { cn } from "@webview/lib/utils";
import { useQuery } from "@webview/hooks/use-query";
import { log } from "@shared/utils/debug-logs";
import { DraftStatePayload } from "@shared/types/theme";
import RemoveDraftChange from "../shared/remove-draft-change";

export type UiLayoutMetaWithKey = UiLayoutMeta & {
  key: string;
  isTouched: boolean;
  originalValue: string | undefined;
};

export default function LayoutSettings() {
  const { drafts, updateUnsavedChanges, handleRemoveDraftChange } = useDraft(),
   { data: layoutState, isLoading: isLoadingLayout } = useQuery({
    command: "GET_FONT_AND_LAYOUT_SETTINGS",
    payload: [],
  });
  log("layoutState", drafts);
  // Merge draftState with default values and organize by subcategory
  const layoutTree = useMemo(() => {
    if (!layoutState) {return {};}
    const tree: Record<string, UiLayoutMetaWithKey[]> = {},
     subcategoryToggles: Record<string, UiLayoutMetaWithKey> = {};

    Object.entries(layoutState).forEach(([key, item]) => {
      if (!tree[item.subcategory]) {tree[item.subcategory] = [];}
      const draftValue = drafts.find(
        (c): c is Extract<DraftStatePayload, { type: "settings" }> =>
          c.key === key && c.type === "settings"
      ),
      // Create a new item with the current value, maintaining type safety
       currentItem = {
        ...item,
        key,
        defaultValue: draftValue ? draftValue.value : item.defaultValue,
        originalValue: item.defaultValue,
        isTouched: Boolean(draftValue),
      } as UiLayoutMetaWithKey;

      // Store subcategory toggles separately
      if (item.isSubCategoryToggle) {
        subcategoryToggles[item.subcategory] = currentItem;
      }

      tree[item.subcategory].push(currentItem);
    });

    return { tree, subcategoryToggles };
  }, [drafts, layoutState]); // eslint-disable-line react-hooks/exhaustive-deps

  return isLoadingLayout ? (
    <CardSkeleton />
  ) : (
    <div className="space-y-6">
      {!layoutTree ? (
        <p className="text-center">
          Something went wrong while getting the font and layout settings
        </p>
      ) : (
        Object.entries(layoutTree?.tree || {}).map(([subCategory, items]) => (
          <Card
            key={subCategory}
            className={`bg-card/50 border border-border/40 rounded-2xl shadow-sm overflow-hidden`}
          >
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold capitalize">
                  {subCategory}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div
                className={cn(
                  "grid gap-6 grid-cols-1",
                  items.length >= 3
                    ? "xl:grid-cols-3 md:grid-cols-2"
                    : items.length === 2
                      ? "md:grid-cols-2"
                      : "md:grid-cols-1"
                )}
              >
                {items.map((item) => (
                    <div
                      key={item.displayName}
                      className={cn(
                        "border relative border-primary/10 space-y-3 rounded-xl p-4",
                        item.isTouched && "bg-primary/10"
                      )}
                    >
                      <RemoveDraftChange
                        handleRemove={() =>
                          handleRemoveDraftChange([
                            {
                              type: "settings",
                              key: item.key,
                              value: item.defaultValue,
                            },
                          ])
                        }
                        isTouched={item.isTouched}
                      />
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-foreground/90">
                            {item.displayName}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {item.description}
                          </p>
                        </div>
                      </div>
                      {item.valueType === "boolean" ? (
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={item.defaultValue as boolean}
                            onCheckedChange={(checked) => {
                              updateUnsavedChanges([
                                {
                                  type: "settings",
                                  key: item.key,
                                  value: checked,
                                },
                              ]);
                            }}
                          />
                          <span className="text-xs font-medium text-muted-foreground">
                            {item.defaultValue ? "Enabled" : "Disabled"}
                          </span>
                        </div>
                      ) : item.valueType === "number" ? (
                        <Input
                          type="number"
                          value={Number(item.defaultValue) || 0}
                          onChange={(e) => {
                            const numValue = parseFloat(e.target.value);
                            updateUnsavedChanges([
                              {
                                type: "settings",
                                key: item.key,
                                value: numValue,
                              },
                            ]);
                          }}
                        />
                      ) : item.valueType === "select" ? (
                        <Select
                          value={item.defaultValue as string}
                          onValueChange={(value) => {
                            updateUnsavedChanges([
                              {
                                type: "settings",
                                key: item.key,
                                value,
                              },
                            ]);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select an option" />
                          </SelectTrigger>
                          <SelectContent>
                            {item.options.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          value={item.defaultValue as string}
                          onChange={(e) => {
                            updateUnsavedChanges([
                              {
                                type: "settings",
                                key: item.key,
                                value: e.target.value,
                              },
                            ]);
                          }}
                        />
                      )}
                      {/* <FontInput
                    value={font.defaultValue}
                    onChange={
                      (newValue: string) => {}
                      //   draftDispatch({
                      //     type: "SET_FONT",
                      //     key: font.key,
                      //     value: newValue,
                      //   })
                    }
                  {/* /> */}
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
