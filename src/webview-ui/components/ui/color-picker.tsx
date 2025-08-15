"use client";

import { useRef, useState } from "react";
import { Button } from "@webview/components/ui/button";
import { Input } from "@webview/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@webview/components/ui/popover";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@webview/components/ui/tabs";
import { Plus } from "lucide-react";
import { Badge } from "./badge";

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

// Zinc color palette
const zincColors = [
  "#fafafa",
  "#f4f4f5",
  "#e4e4e7",
  "#d4d4d8",
  "#a1a1aa",
  "#71717a",
  "#52525b",
  "#3f3f46",
  "#27272a",
  "#18181b",
  "#09090b",
  "#000000",
];

// Catppuccin colors for custom palette
const catppuccinColors = [
  "#f4dbd6", // rosewater
  "#f0c6c6", // flamingo
  "#f5bde6", // pink
  "#c6a0f6", // mauve
  "#ed8796", // red
  "#ee99a0", // maroon
  "#f5a97f", // peach
  "#eed49f", // yellow
  "#a6da95", // green
  "#8bd5ca", // teal
  "#91d7e3", // sky
  "#7dc4e4", // sapphire
  "#8aadf4", // blue
  "#b7bdf8", // lavender
];

export default function ColorPicker({ value, onChange }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customPalette, setCustomPalette] =
    useState<string[]>(catppuccinColors);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  const addToCustomPalette = (color: string) => {
    if (!customPalette.includes(color)) {
      setCustomPalette([...customPalette, color]);
    }
  };

  const handleColorSelect = (color: string) => {
    onChange(color);
    addToCustomPalette(color);
  };

  return (
    <div className="flex gap-3">
      <Popover
        open={isOpen}
        onOpenChange={(open) => {
          setIsOpen(open);
        }}
      >
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-12 h-10 p-0 border-2 bg-transparent hover:scale-105 transition-transform border-border/60 rounded-xl"
            style={{ backgroundColor: value }}
            ref={triggerRef}
          >
            <span className="sr-only">Pick color</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-4 bg-card/95 border border-border/40 rounded-2xl flex flex-col  gap-2 shadow-lg backdrop-blur-xl">
          <Tabs defaultValue="picker" className="w-full shrink-0">
            <TabsList className="w-full bg-card/50 border border-border/40 rounded-xl p-1 gap-1 md:grid md:grid-cols-2">
              <TabsTrigger
                value="picker"
                className="text-foreground data-[state=active]:bg-primary/90 data-[state=active]:text-primary-foreground text-xs font-medium rounded-lg px-3 py-2"
              >
                Picker
              </TabsTrigger>
              <TabsTrigger
                value="custom"
                className="text-foreground data-[state=active]:bg-primary/90 data-[state=active]:text-primary-foreground text-xs font-medium rounded-lg px-3 py-2"
              >
                Custom
              </TabsTrigger>
            </TabsList>

            <TabsContent value="picker" className="space-y-4 mt-4">
              <div className="flex gap-3">
                <Input
                  type="color"
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  className="w-12 h-10 p-0 border-0 rounded-xl"
                />
                <Input
                  type="text"
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  placeholder="#000000"
                  className="flex-1 bg-background/50 border-border/60 text-foreground rounded-xl text-xs"
                />
              </div>
            </TabsContent>

            <TabsContent value="custom" className="mt-4 w-full">
              <div className="space-y-3 w-full flex flex-col items-center">
                <Badge
                  variant="outline"
                  className="bg-primary/20 text-xs text-center"
                >
                  custom color import coming soon
                </Badge>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">
                    Catppuccin Palette
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0 border-border/60 text-foreground hover:bg-primary/10 rounded-xl"
                    onClick={() => {
                      const randomColor =
                        "#" + Math.floor(Math.random() * 16777215).toString(16);
                      setCustomPalette([...customPalette, randomColor]);
                    }}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-6 gap-2">
                  {customPalette.map((color, index) => (
                    <button
                      key={`${color}-${index}`}
                      className="w-8 h-8 rounded-xl border-2 border-border/60 hover:border-primary/60 transition-colors hover:scale-110 shadow-sm"
                      style={{ backgroundColor: color }}
                      onClick={() => handleColorSelect(color)}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </PopoverContent>
      </Popover>
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="#000000"
        className="flex-1 bg-background/50 border-border/60 text-foreground rounded-xl text-xs"
      />
    </div>
  );
}
