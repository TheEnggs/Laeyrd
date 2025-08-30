import { useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  AnimatedTabsTrigger,
  AnimatedTabsList,
} from "@webview/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@webview/components/ui/card";
import ColorSettings from "./color-settings";
import FontSettings from "./font-settings";
// import LayoutSettings from "./layout-settings";
// import { themeColors } from "../data/theme-colors";
import { Palette, Type, Layout } from "lucide-react";
import LayoutSettings from "./layout-settings";

const mainTabs = [
  {
    id: "colors",
    name: "Colors",
    icon: Palette,
    description: "Customize colors and visual appearance",
  },
  //   {
  //     id: "fonts",
  //     name: "Fonts",
  //     icon: Type,
  //     description: "Configure fonts for editor, terminal, and UI",
  //   },
  {
    id: "Fonts & Layout",
    name: "Fonts & Layout",
    icon: Layout,
    description: "Adjust layout, panels, and UI behavior",
  },
];

export default function CustomizationTabs() {
  const [activeTab, setActiveTab] = useState("colors");

  return (
    <div className="w-full max-w-7xl mx-auto">
      <Tabs
        defaultValue="colors"
        className="flex flex-col items-center w-full justify-start"
        onValueChange={setActiveTab}
      >
        <AnimatedTabsList
          activeTab={activeTab}
          tabValues={mainTabs.map((tab) => tab.id)}
          className="w-full max-w-2xl gap-1 grid grid-cols-2 justify-center [mask-image:none]"
        >
          {mainTabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <AnimatedTabsTrigger
                key={tab.id}
                value={tab.id}
                className="flex items-center gap-2 data-[state=active]:text-primary-foreground transition-all duration-200 text-muted-foreground hover:text-foreground text-sm font-medium rounded-xl px-3 relative"
              >
                <IconComponent className="w-4 h-4" />
                <span className="inline">{tab.name}</span>
              </AnimatedTabsTrigger>
            );
          })}
        </AnimatedTabsList>

        <div className="space-y-6 w-full">
          {/* Colors & UI Tab */}
          <TabsContent
            value="colors"
            className="animate-in fade-in-50 duration-200"
          >
            <Card className="bg-transparent border-0 shadow-none">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-secondary-foreground text-lg font-semibold tracking-tight">
                  <div className="p-2 rounded-xl bg-primary/10">
                    <Palette className="w-5 h-5 text-primary" />
                  </div>
                  Colors
                </CardTitle>
                <CardDescription className="text-secondary-foreground/80 text-sm leading-relaxed">
                  Customize the visual appearance of your VS Code theme
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ColorSettings />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Fonts Tab */}
          {/* <TabsContent
            value="fonts"
            className="animate-in fade-in-50 duration-200"
          >
            <Card className="bg-transparent border-0 shadow-none">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-secondary-foreground text-lg font-semibold tracking-tight">
                  <div className="p-2 rounded-xl bg-primary/10">
                    <Type className="w-5 h-5 text-primary" />
                  </div>
                  Fonts
                </CardTitle>
                <CardDescription className="text-secondary-foreground/80 text-sm leading-relaxed">
                  Configure fonts for editor, terminal, and user interface
                  elements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FontSettings />
              </CardContent>
            </Card>
          </TabsContent> */}

          {/* Layout & UI Elements Tab */}
          <TabsContent
            value="Fonts & Layout"
            className="animate-in fade-in-50 duration-200"
          >
            <Card className="bg-transparent border-0 shadow-none">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-secondary-foreground text-lg font-semibold tracking-tight">
                  <div className="p-2 rounded-xl bg-primary/10">
                    <Layout className="w-5 h-5 text-primary" />
                  </div>
                  Fonts & Layout
                </CardTitle>
                <CardDescription className="text-secondary-foreground/80 text-sm leading-relaxed">
                  Adjust fonts, layout, panels, and user interface behavior
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LayoutSettings />
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
