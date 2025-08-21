import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
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

const mainTabs = [
  {
    id: "colors",
    name: "Colors & UI",
    icon: Palette,
    description: "Customize colors and visual appearance",
  },
  {
    id: "fonts",
    name: "Fonts",
    icon: Type,
    description: "Configure fonts for editor, terminal, and UI",
  },
  {
    id: "layout",
    name: "Layout & UI Elements",
    icon: Layout,
    description: "Adjust layout, panels, and UI behavior",
  },
];

export default function CustomizationTabs() {
  return (
    <div className="w-full max-w-7xl mx-auto">
      <Tabs
        defaultValue="colors"
        className="flex flex-col items-center w-full justify-start"
      >
        <TabsList className="w-full max-w-2xl bg-card/50 border border-border/40 h-full rounded-2xl shadow-sm gap-1 md:grid md:grid-cols-3 md:justify-center md:[mask-image:none]">
          {mainTabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/90 data-[state=active]:to-primary/80 data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all duration-200 text-muted-foreground hover:text-foreground text-sm font-medium rounded-xl px-3 py-2"
              >
                <IconComponent className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.name}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        <div className="space-y-6 w-full">
          {/* Colors & UI Tab */}
          <TabsContent
            value="colors"
            className="animate-in fade-in-50 duration-200"
          >
            <Card className="bg-transparent border-0 shadow-none">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-foreground text-lg font-semibold tracking-tight">
                  <div className="p-2 rounded-xl bg-primary/10">
                    <Palette className="w-5 h-5 text-primary" />
                  </div>
                  Colors & UI
                </CardTitle>
                <CardDescription className="text-muted-foreground text-sm leading-relaxed">
                  Customize the visual appearance of your VS Code theme
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ColorSettings />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Fonts Tab */}
          <TabsContent
            value="fonts"
            className="animate-in fade-in-50 duration-200"
          >
            <Card className="bg-transparent border-0 shadow-none">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-foreground text-lg font-semibold tracking-tight">
                  <div className="p-2 rounded-xl bg-primary/10">
                    <Type className="w-5 h-5 text-primary" />
                  </div>
                  Fonts
                </CardTitle>
                <CardDescription className="text-muted-foreground text-sm leading-relaxed">
                  Configure fonts for editor, terminal, and user interface
                  elements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FontSettings />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Layout & UI Elements Tab */}
          <TabsContent
            value="layout"
            className="animate-in fade-in-50 duration-200"
          >
            <Card className="bg-transparent border-0 shadow-none">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-foreground text-lg font-semibold tracking-tight">
                  <div className="p-2 rounded-xl bg-primary/10">
                    <Layout className="w-5 h-5 text-primary" />
                  </div>
                  Layout & UI Elements
                </CardTitle>
                <CardDescription className="text-muted-foreground text-sm leading-relaxed">
                  Adjust layout, panels, and user interface behavior
                </CardDescription>
              </CardHeader>
              <CardContent>{/* <LayoutSettings /> */}</CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
