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
import { cn } from "@webview/lib/utils";
import { useQuery } from "@webview/hooks/use-query";

export default function FontSettings() {
  const { draftFontState, fontDispatch } = useSettings();
  const { data: fontsState, isLoading: isLoadingFonts } = useQuery({
    command: "GET_FONT_SETTINGS",
    payload: [],
  });

  // Merge draftState with default values
  const fontsTree = useMemo(() => {
    if (!fontsState) return {};
    const tree: Record<string, FontMeta[]> = {};
    Object.values(fontsState).forEach((item) => {
      if (!tree[item.subcategory]) tree[item.subcategory] = [];
      const value = item.defaultValue;
      tree[item.subcategory].push({ ...item, defaultValue: value });
    });
    return tree;
  }, [draftFontState, fontsState]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!fontsState) return <p>No fonts found</p>;
  console.log("fontsState", fontsState);
  if (false) return <ColorSettingsSkeleton />;
  return (
    <div className="space-y-6">
      {Object.entries(fontsTree).map(([subCategory, items]) => (
        <Card
          key={subCategory}
          className="bg-card/50 border border-border/40 rounded-2xl shadow-sm overflow-hidden"
        >
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-semibold">
              {subCategory}
            </CardTitle>
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
              {items.map((font) => (
                <div key={font.displayName} className=" space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-foreground/80">
                        {font.displayName}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {font.description}
                      </p>
                    </div>
                  </div>
                  <Input
                    value={font.defaultValue as string}
                    type={
                      typeof font.defaultValue === "number" ? "number" : "text"
                    }
                    onChange={(e) => {
                      fontDispatch({
                        type: "SET_FONT",
                        key: font.displayName,
                        value: e.target.value,
                      });
                    }}
                  />
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
      ))}
    </div>
  );
}
