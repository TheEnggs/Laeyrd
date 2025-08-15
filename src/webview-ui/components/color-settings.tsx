"use client";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@webview/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@webview/components/ui/card";
import ColorPicker from "./ui/color-picker";
import { useSettings } from "../contexts/settings-context";
import { themeColors } from "../data/theme-colors";
import {
  Palette,
  FileText,
  Layout,
  Monitor,
  Braces,
  Type,
  Zap,
  MousePointer,
  Terminal,
} from "lucide-react";

const iconMap = {
  base: Palette,
  editor: FileText,
  workbench: Layout,
  window: Monitor,
  tokens: Braces,
  text: Type,
  actions: Zap,
  buttons: MousePointer,
  terminal: Terminal,
} as const;

export default function ColorSettings() {
  const { colorsState, colorsDispatch, markChanged } = useSettings() as any;

  return (
    <div className="w-full">
      <Tabs defaultValue={themeColors[0]?.id ?? "base"} className="w-full">
        <TabsList className="w-full h-full mb-6 bg-card/50 border border-border/40 rounded-2xl shadow-sm gap-1 md:grid md:grid-cols-9 md:[mask-image:none] md:[-webkit-mask-image:none]">
          {themeColors.map((tab) => {
            const IconComponent =
              iconMap[tab.id as keyof typeof iconMap] || Palette;
            return (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/90 data-[state=active]:to-primary/80 data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all duration-200 text-muted-foreground hover:text-foreground text-xs font-medium rounded-xl px-3 py-2"
              >
                <IconComponent className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{tab.name}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        <div className="space-y-6">
          {themeColors.map((tab) => {
            const IconComponent =
              iconMap[tab.id as keyof typeof iconMap] || Palette;
            return (
              <TabsContent
                key={tab.id}
                value={tab.id}
                className="animate-in fade-in-50 duration-200"
              >
                <div className="space-y-6">
                  {tab.categories.map((category) => (
                    <Card
                      key={category.name}
                      className="bg-card/50 border border-border/40 rounded-2xl shadow-sm overflow-hidden"
                    >
                      <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-3 text-foreground text-lg font-semibold tracking-tight">
                          <div className="p-2 rounded-xl bg-primary/10">
                            <IconComponent className="w-5 h-5 text-primary" />
                          </div>
                          {category.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                          {category.colors.map((color) => {
                            const id = color.id; // e.g., 'editor.background'
                            const current =
                              colorsState[id] ?? color.defaultValue;
                            return (
                              <div key={id} className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <h4 className="text-base font-semibold text-foreground/80 tracking-tight">
                                      {color.name}
                                    </h4>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                      {color.description}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-muted-foreground font-medium px-2 py-1 rounded-lg hover:bg-primary/5">
                                      {id}
                                    </span>
                                  </div>
                                </div>
                                <ColorPicker
                                  value={current}
                                  onChange={(newValue) => {
                                    colorsDispatch({
                                      type: "SET_COLORS",
                                      colors: { [id]: String(newValue) },
                                    });
                                    markChanged();
                                  }}
                                />
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            );
          })}
        </div>
      </Tabs>
    </div>
  );
}
