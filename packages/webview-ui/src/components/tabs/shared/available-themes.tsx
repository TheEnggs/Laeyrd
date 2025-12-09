import { Label } from "@webview/components/ui/label";
import { useMutation, useQuery } from "../../../hooks/use-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { CheckCheck, ChevronUp, Palette, Trash2 } from "lucide-react";
import { Button } from "@webview/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@webview/components/ui/popover";
import { PopoverClose } from "@radix-ui/react-popover";
import { ScrollArea } from "@webview/components/ui/scroll-area";
import { cn } from "@webview/lib/utils";

export const AvailableThemes = ({
  popoverAlign = "start",
  popoverOffset = 14,
}: {
  popoverAlign: "end" | "center" | "start";
  popoverOffset?: number;
}) => {
  const { data, isLoading } = useQuery({
    command: "GET_THEMES_LIST",
    payload: {},
  });

  const { data: activeTheme } = useQuery({
    command: "GET_ACTIVE_THEME_LABEL",
    payload: {},
  });

  const { mutate } = useMutation("SET_THEME");

  const handleThemeChange = (themeName: string) => {
    if (themeName === activeTheme) return;
    mutate({ themeName });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="rounded-full">
          <Palette className="w-4 h-4 mr-1" /> {activeTheme ?? "Themes"}
          <ChevronUp className="w-4 h-4 ml-2" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align={popoverAlign}
        sideOffset={14}
        className="w-[300px] bg-primary/10 max-h-[450px] flex items-center justify-between rounded-xl shadow-xl border border-primary/20 backdrop-blur-xl pl-4 pr-1 py-4"
      >
        <ScrollArea className="h-[400px] w-full">
          <div className="h-full w-full flex flex-col gap-2 pr-4">
            {data?.themes.map((theme) => (
              <div
                className={cn(
                  "text-sm p-2 rounded-lg hover:bg-primary/10 cursor-pointer border border-primary/10 flex gap-2 items-center justify-between bg-primary/5",
                  theme === activeTheme && "bg-primary/20 border-primary/20"
                )}
                key={theme}
                onClick={() => handleThemeChange(theme)}
              >
                <span className="text-xs flex items-center gap-2 justify-start">
                  <Palette className="w-4 h-4" /> {theme}
                </span>
                {theme === activeTheme ? (
                  <CheckCheck className="h-4 w-4 mr-2" />
                ) : null}
              </div>
            ))}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};
