"use client";

import { useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@webview/components/ui/card";
import { fontListMap } from "../../lib/fontsList";
import { useSettings } from "../contexts/settings-context";
// import FontInput from "@webview/components/ui/font-input";
import { FontMeta } from "../../types/font";
import { ColorSettingsSkeleton } from "./skeleton/color-settings";
import { Input } from "./ui/input";
import { Switch } from "./ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { UiLayoutMeta, UiLayoutMetaGrouped } from "../../types/layout";
import { cn } from "@webview/lib/utils";
import { useQuery } from "@webview/hooks/use-query";

type UiLayoutMetaWithKey = UiLayoutMeta & { key: string };

export default function LayoutSettings() {
  const { draftFontLayoutState, fontLayoutDispatch } = useSettings();
  const { data: layoutState, isLoading: isLoadingLayout } = useQuery({
    command: "GET_FONT_AND_LAYOUT_SETTINGS",
    payload: [],
  });
  console.log("layoutState", layoutState);
  // Merge draftState with default values and organize by subcategory
  const layoutTree = useMemo(() => {
    if (!layoutState) return {};
    const tree: Record<string, UiLayoutMetaWithKey[]> = {};
    const subcategoryToggles: Record<string, UiLayoutMetaWithKey> = {};

    Object.entries(layoutState).forEach(([key, item]) => {
      if (!tree[item.subcategory]) tree[item.subcategory] = [];
      const draftValue = draftFontLayoutState[key];
      const value = draftValue ?? item.defaultValue;
      // Create a new item with the current value, maintaining type safety
      const currentItem = {
        ...item,
        key: key,
        defaultValue: value,
      } as UiLayoutMetaWithKey;

      // Store subcategory toggles separately
      if (item.isSubCategoryToggle) {
        subcategoryToggles[item.subcategory] = currentItem;
      }

      tree[item.subcategory].push(currentItem);
    });

    return { tree, subcategoryToggles };
  }, [draftFontLayoutState, layoutState]); // eslint-disable-line react-hooks/exhaustive-deps

  //   if (!draftState) return <p>No fonts found</p>;
  if (!layoutTree.tree) return <p>No layout found</p>;

  if (false) return <ColorSettingsSkeleton />;
  return (
    <div className="space-y-6">
      {Object.entries(layoutTree.tree).map(([subCategory, items]) => (
        <Card
          key={subCategory}
          className={`bg-card/50 border border-border/40 rounded-2xl shadow-sm overflow-hidden ${
            layoutTree.subcategoryToggles[subCategory] &&
            !(layoutTree.subcategoryToggles[subCategory]
              .defaultValue as boolean)
              ? "bg-muted/30"
              : ""
          }`}
        >
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">
                {subCategory}
              </CardTitle>
              {layoutTree.subcategoryToggles[subCategory] && (
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={
                      layoutTree.subcategoryToggles[subCategory]
                        .defaultValue as boolean
                    }
                    onCheckedChange={(checked) => {
                      fontLayoutDispatch({
                        type: "SET_LAYOUT",
                        key: subCategory,
                        value: checked as boolean,
                        defaultValue: layoutTree.subcategoryToggles[subCategory]
                          .defaultValue as boolean,
                      });
                    }}
                  />
                  <span className="text-xs font-medium text-muted-foreground">
                    {layoutTree.subcategoryToggles[subCategory].defaultValue
                      ? "Enabled"
                      : "Disabled"}
                  </span>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div
              className={cn(
                "grid gap-6 grid-cols-1",
                items.filter((item) => !item.isSubCategoryToggle).length >= 3
                  ? "xl:grid-cols-3 md:grid-cols-2"
                  : items.filter((item) => !item.isSubCategoryToggle).length ===
                    2
                  ? "md:grid-cols-2"
                  : "md:grid-cols-1",
                layoutTree.subcategoryToggles[subCategory] &&
                  !(layoutTree.subcategoryToggles[subCategory]
                    .defaultValue as boolean)
                  ? "opacity-50 pointer-events-none"
                  : ""
              )}
            >
              {items.map((item) => {
                if (item.isSubCategoryToggle) return null;
                return (
                  <div key={item.displayName} className="space-y-3">
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
                            fontLayoutDispatch({
                              type: "SET_LAYOUT",
                              key: item.key,
                              value: checked as boolean,
                              defaultValue: item.defaultValue as boolean,
                            });
                          }}
                        />
                        <span className="text-xs font-medium text-muted-foreground">
                          {item.defaultValue ? "Enabled" : "Disabled"}
                        </span>
                      </div>
                    ) : item.valueType === "number" ? (
                      <Input
                        type="number"
                        value={(item.defaultValue as number).toString()}
                        onChange={(e) => {
                          const numValue = parseFloat(e.target.value);
                          fontLayoutDispatch({
                            type: "SET_LAYOUT",
                            key: item.key,
                            value: isNaN(numValue)
                              ? item.defaultValue
                              : numValue,
                            defaultValue: item.defaultValue as number,
                          });
                        }}
                      />
                    ) : item.valueType === "select" ? (
                      <Select
                        value={item.defaultValue as string}
                        onValueChange={(value) => {
                          fontLayoutDispatch({
                            type: "SET_LAYOUT",
                            key: item.key,
                            value: value as string,
                            defaultValue: item.defaultValue as string,
                          });
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
                          fontLayoutDispatch({
                            type: "SET_LAYOUT",
                            key: item.key,
                            value: e.target.value as string,
                            defaultValue: item.defaultValue as string,
                          });
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
