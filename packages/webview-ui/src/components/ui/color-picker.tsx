"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from "lucide-react";
import { Badge } from "./badge";
import { HexColorInput, HexAlphaColorPicker } from "react-colorful";
interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}
const randomColor = () =>
  `#${Math.floor(Math.random() * 0xffffff)
    .toString(16)
    .padStart(6, "0")}`;

const randomColors = (length: number): string[] =>
  Array.from({ length }, () => randomColor());

export default function ColorPicker({ value, onChange }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customPalette, setCustomPalette] = useState<string[]>(randomColors(9));
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
              <div className="flex gap-2 flex-col w-full items-center justify-center">
                <HexAlphaColorPicker
                  color={value}
                  onChange={onChange}
                  className="min-w-full w-full rounded-lg"
                />

                <HexColorInput
                  color={value}
                  onChange={onChange}
                  className="p-2 border border-input/60 rounded-lg w-full"
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
                <div className="flex gap-2 items-center justify-between">
                  <span className="text-sm font-medium text-foreground">
                    Random Colors
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 w-8 p-0 border-border/60 text-foreground hover:bg-primary/10 rounded-xl"
                    onClick={() => {
                      setCustomPalette([...customPalette, randomColor()]);
                    }}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="hideScrollbar grid grid-cols-6 gap-2 max-h-36 overflow-y-scroll">
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
