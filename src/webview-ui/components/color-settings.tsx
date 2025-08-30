"use client";

import {
  Tabs,
  TabsContent,
  AnimatedTabsList,
  AnimatedTabsTrigger,
} from "@webview/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@webview/components/ui/card";
import ColorPicker from "./ui/color-picker";
import { useSettings } from "../contexts/settings-context";
import {
  Palette,
  FileText,
  Layout,
  Braces,
  Zap,
  Terminal,
  Square,
  AlertCircle,
} from "lucide-react";
import { mainTabs } from "../../lib/colors";
import { useMemo, useState } from "react";
import { ColorSettingsSkeleton } from "./skeleton/color-settings";
import { cn } from "@webview/lib/utils";
import TokenColorSettings from "./token-color-settings";
import { useQuery } from "../hooks/use-query";

// 🔹 Map main tabs to icons
const iconMap = {
  Base: Palette,
  Editor: FileText,
  Workbench: Layout,
  Tokens: Braces,
  "UI & Layout": Layout,
  Extras: Zap,
  Terminal: Terminal,
} as const;

export default function ColorSettings() {
  const { draftColorState, colorDispatch } = useSettings();
  const { data: colorsState, isLoading: isLoadingColors } = useQuery({
    command: "GET_THEME_COLORS",
    payload: [],
  });
  const [activeTab, setActiveTab] = useState<string>(mainTabs[0]);

  // 🔹 Memoized tree: category → subcategory → colors[]
  const categoryTree = useMemo(() => {
    if (!colorsState) return {};
    const tree: Record<
      string,
      Record<
        string,
        {
          key: string;
          displayName: string;
          description: string;
          value: string;
        }[]
      >
    > = {};

    for (const [key, def] of Object.entries(colorsState)) {
      const category = def.category;
      const subcategory = def.subcategory || "General";

      if (!tree[category]) tree[category] = {};
      if (!tree[category][subcategory]) tree[category][subcategory] = [];

      tree[category][subcategory].push({
        key,
        displayName: def.displayName,
        description: def.description,
        value: draftColorState[key]?.value ?? def.defaultValue ?? "",
      });
    }
    return tree;
  }, [colorsState, draftColorState]);

  //   if (!isLoading && !colorsState)
  //     return (
  //       <div className="w-full flex flex-col items-center justify-center py-12">
  //         <AlertCircle className="w-8 h-8 text-destructive mb-2" />
  //         <p className="text-foreground/80 font-medium">
  //           Failed to load theme colors.
  //         </p>
  //       </div>
  //     );

  return (
    <div className="w-full">
      <Tabs
        defaultValue={mainTabs[0]}
        className="w-full"
        onValueChange={setActiveTab}
      >
        {/* 🔹 Tabs List */}
        <AnimatedTabsList
          activeTab={activeTab}
          tabValues={[...mainTabs, "Tokens"]}
          className="w-full h-full grid grid-cols-7"
        >
          {mainTabs.map((tab) => {
            const IconComponent =
              iconMap[tab as keyof typeof iconMap] || Square;
            return (
              <AnimatedTabsTrigger
                key={tab}
                value={tab}
                className="flex items-center gap-2 data-[state=active]:text-primary-foreground transition-all duration-200 text-muted-foreground hover:text-foreground text-xs font-medium rounded-xl px-3 py-2 relative"
              >
                <IconComponent className="w-3.5 h-3.5" />
                <span className="hidden sm:inline capitalize">{tab}</span>
              </AnimatedTabsTrigger>
            );
          })}
          <AnimatedTabsTrigger
            value="Tokens"
            className="flex items-center gap-2 data-[state=active]:text-primary-foreground transition-all duration-200 text-muted-foreground hover:text-foreground text-xs font-medium rounded-xl px-3 py-2 relative"
          >
            <Braces className="w-3.5 h-3.5" />
            <span className="hidden sm:inline capitalize">Tokens</span>
          </AnimatedTabsTrigger>
        </AnimatedTabsList>
        {isLoadingColors && <ColorSettingsSkeleton />}
        {/* 🔹 Tabs Content */}
        {mainTabs.map((tab) => {
          const subcategories = categoryTree[tab] || {};
          const IconComponent = iconMap[tab as keyof typeof iconMap] || Square;

          return (
            <TabsContent
              key={tab}
              value={tab}
              className="animate-in fade-in-50 duration-200 mt-4"
            >
              {Object.entries(subcategories).map(([sub, colors]) => (
                <Card
                  key={sub}
                  className="bg-card/50 border border-border/40 rounded-2xl shadow-sm overflow-hidden"
                >
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-foreground text-lg font-semibold tracking-tight">
                      <div className="p-2 rounded-xl bg-primary/10">
                        <IconComponent className="w-5 h-5 text-primary" />
                      </div>
                      {sub}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div
                      className={cn(
                        "grid gap-6 grid-cols-1",
                        colors.length >= 3
                          ? "xl:grid-cols-3 md:grid-cols-2"
                          : colors.length === 2
                          ? "md:grid-cols-2"
                          : "md:grid-cols-1"
                      )}
                    >
                      {colors.map((color) => (
                        <div key={color.key} className="space-y-3">
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
                            onChange={(newValue) =>
                              colorDispatch({
                                type: "SET_COLOR",
                                key: color.key,
                                value: String(newValue),
                              })
                            }
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          );
        })}
        <TabsContent value="Tokens">
          <TokenColorSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
