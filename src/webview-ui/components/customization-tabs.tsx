import { useState } from "react";
import {
  Tabs,
  TabsContent,
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
import { Palette, Type, Layout, Settings, Store } from "lucide-react";
import LayoutSettings from "./layout-settings";
import UserSettingsContent from "./user-settings-content";
import MarketplaceContent from "./marketplace-content";

const mainTabs = [
  {
    id: "colors",
    name: "Colors",
    icon: Palette,
    description: "Customize colors and visual appearance",
  },

  {
    id: "Fonts & Layout",
    name: "Fonts & Layout",
    icon: Layout,
    description: "Adjust layout, panels, and UI behavior",
  },

  {
    id: "settings",
    name: "Settings",
    icon: Settings,
    description: "Manage your account and preferences",
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
          className="w-full max-w-4xl gap-1 grid grid-cols-3 justify-center [mask-image:none]"
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

          {/* Marketplace Tab */}
          {/* <TabsContent
            value="marketplace"
            className="animate-in fade-in-50 duration-200"
          >
            <Card className="bg-transparent border-0 shadow-none">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-secondary-foreground text-lg font-semibold tracking-tight">
                  <div className="p-2 rounded-xl bg-primary/10">
                    <Store className="w-5 h-5 text-primary" />
                  </div>
                  Marketplace
                </CardTitle>
                <CardDescription className="text-secondary-foreground/80 text-sm leading-relaxed">
                  Discover and install themes, extensions, and development tools
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MarketplaceContent />
              </CardContent>
            </Card>
          </TabsContent> */}

          {/* User Settings Tab */}
          <TabsContent
            value="settings"
            className="animate-in fade-in-50 duration-200"
          >
            <Card className="bg-transparent border-0 shadow-none">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-secondary-foreground text-lg font-semibold tracking-tight">
                  <div className="p-2 rounded-xl bg-primary/10">
                    <Settings className="w-5 h-5 text-primary" />
                  </div>
                  Settings
                </CardTitle>
                <CardDescription className="text-secondary-foreground/80 text-sm leading-relaxed">
                  Manage your account, preferences, and application settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UserSettingsContent />
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
