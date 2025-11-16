"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDraft } from "@/contexts/draft-context";
import { ColorSettingsSkeleton } from "./skeleton/color-settings";
import { Input } from "@/components/ui/input";
import { Switch } from "./ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { UiLayoutMeta } from "@shared/types/layout";
import { cn } from "@/lib/utils";
import { useQuery } from "@/hooks/use-query";
import { log } from "@shared/utils/debug-logs";
import { DraftStatePayload } from "@shared/types/theme";
import RemoveDraftChange from "./remove-draft-change";

type UiLayoutMetaWithKey = UiLayoutMeta & {
  key: string;
  isTouched: boolean;
  originalValue: string | undefined;
};

export default function LayoutSettings() {
  const { drafts, updateUnsavedChanges, handleRemoveDraftChange } = useDraft();
  const { data: layoutState, isLoading: isLoadingLayout } = useQuery({
    command: "GET_FONT_AND_LAYOUT_SETTINGS",
    payload: [],
  });
  log("layoutState", drafts);
  // Merge draftState with default values and organize by subcategory
  const layoutTree = useMemo(() => {
    if (!layoutState) return {};
    const tree: Record<string, UiLayoutMetaWithKey[]> = {};
    const subcategoryToggles: Record<string, UiLayoutMetaWithKey> = {};

    Object.entries(layoutState).forEach(([key, item]) => {
      if (!tree[item.subcategory]) tree[item.subcategory] = [];
      const draftValue = drafts.find(
        (c): c is Extract<DraftStatePayload, { type: "settings" }> =>
          c.key === key && c.type === "settings"
      );
      // Create a new item with the current value, maintaining type safety
      const currentItem = {
        ...item,
        key: key,
        defaultValue: draftValue ? draftValue.value : item.defaultValue,
        originalValue: item.defaultValue,
        isTouched: !!draftValue,
      } as UiLayoutMetaWithKey;

      // Store subcategory toggles separately
      if (item.isSubCategoryToggle) {
        subcategoryToggles[item.subcategory] = currentItem;
      }

      tree[item.subcategory].push(currentItem);
    });

    return { tree, subcategoryToggles };
  }, [drafts, layoutState]); // eslint-disable-line react-hooks/exhaustive-deps

  //   if (!draftState) return <p>No fonts found</p>;
  if (!layoutTree.tree) return <p>No layout found</p>;

  return (
    <div className="space-y-6">
      {Object.entries(layoutTree.tree).map(([subCategory, items]) => (
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
              {items.map((item) => {
                return (
                  <div
                    key={item.displayName}
                    className={cn(
                      "border relative border-primary/10 space-y-3 rounded-xl p-4",
                      item.isTouched && "bg-primary/10"
                    )}
                  >
                    <RemoveDraftChange
                      handleRemove={() =>
                        handleRemoveDraftChange("settings", item.key)
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
                );
              })}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
