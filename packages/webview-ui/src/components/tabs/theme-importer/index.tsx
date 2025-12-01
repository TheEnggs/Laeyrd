"use client";

import { useState } from "react";
import {
  AnimatedTabsList,
  AnimatedTabsTrigger,
  Tabs,
  TabsContent,
} from "@webview/components/ui/tabs";
import { FileJson, Palette } from "lucide-react";
import PaletteImporter from "./palette-importer";
import JsonImporter from "./json-importer";

const importTabs = [
  {
    id: "palette",
    name: "Color Palette",
    icon: Palette,
    description: "Map colors to groups or manually customize",
  },
  {
    id: "json",
    name: "JSON Import",
    icon: FileJson,
    description: "Directly import a theme.json file",
  },
] as const;

type TabId = (typeof importTabs)[number]["id"];

export default function ThemeImporter() {
  const [activeTab, setActiveTab] = useState<TabId>("palette");

  return (
    <div className="w-full h-full flex flex-col gap-6">
      <Tabs
        defaultValue="palette"
        className="w-full"
        onValueChange={(value) => setActiveTab(value as TabId)}
      >
        <AnimatedTabsList
          activeTab={activeTab}
          tabValues={importTabs.map((tab) => tab.id)}
          className="w-full grid grid-cols-2"
        >
          {importTabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <AnimatedTabsTrigger
                key={tab.id}
                value={tab.id}
                className="flex items-center gap-2 data-[state=active]:text-primary-foreground transition-all duration-200 text-muted-foreground hover:text-foreground text-xs font-medium rounded-xl px-3 py-2 relative"
              >
                <IconComponent className="w-4 h-4" />
                <span>{tab.name}</span>
              </AnimatedTabsTrigger>
            );
          })}
        </AnimatedTabsList>

        <div className="">
          <TabsContent
            value="palette"
            className="animate-in fade-in-50 duration-200 mt-4"
          >
            <PaletteImporter />
          </TabsContent>

          <TabsContent
            value="json"
            className="animate-in fade-in-50 duration-200 mt-4"
          >
            <JsonImporter />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
