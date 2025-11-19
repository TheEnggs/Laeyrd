import {
  DraftStatePayload,
  DraftStatePayloadKeys,
  GroupName,
} from "@shared/types/theme";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "./ui/button";
import { ChevronDown, List, Loader2, Search, Square } from "lucide-react";
import ColorPicker from "./ui/color-picker";
import { useDraft } from "@/contexts/draft-context";
import { CategoryTree, ColorRendered, iconMap } from "./color-settings";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import RemoveDraftChange from "./remove-draft-change";
import { Input } from "./ui/input";
import ApplyGroupColors from "./apply-group-colors";
import { useQuery } from "@/hooks/use-query";
import { useDebounce } from "use-debounce";

export default function ColorSearchDialog() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery] = useDebounce(searchQuery, 500);

  const { drafts } = useDraft();
  const { data: colorsState, isLoading: isLoadingColors } = useQuery({
    command: "GET_THEME_COLORS",
    payload: [],
  });

  // 🔹 Memoized tree: category → subcategory → colors[]
  const colors = useMemo(() => {
    if (!colorsState) return [];
    const colors = [];
    for (const [key, def] of Object.entries(colorsState)) {
      const draftColor = drafts.find(
        (c): c is Extract<DraftStatePayload, { type: "color" }> =>
          c.key === key && c.type === "color"
      );
      colors.push({
        key,
        category: def.category,
        displayName: def.displayName,
        description: def.description,
        groupName: def.groupName,
        value: draftColor?.value ?? def.defaultValue ?? "",
        originalValue: def.defaultValue,
        isTouched: !!draftColor,
      });
    }
    return colors;
  }, [colorsState, drafts]);

  const filteredColors = useMemo(() => {
    const query = debouncedSearchQuery.trim().toLowerCase();
    if (query === "") return colors.slice(0, 20);

    return colors.filter((color) => {
      const match = (value: unknown): boolean => {
        if (value == null) return false;
        return String(value).toLowerCase().includes(query);
      };

      return (
        match(color.key) ||
        match(color.category) ||
        match(color.displayName) ||
        match(color.displayName.split(" ").join()) ||
        match(color.description) ||
        match(color.groupName?.split("_").join(" ")) ||
        match(color.value) ||
        match(color.originalValue)
      );
    });
  }, [colors, debouncedSearchQuery]);

  // pick icon based on first color’s category, or fall back
  const IconComponent =
    colors.length > 0
      ? iconMap[colors[0].category as keyof typeof iconMap] || Square
      : Square;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          className="w-full p-2 text-xs capitalize text-foreground rounded-full"
          variant="outline"
          size="sm"
        >
          {/* <span className="w-40 p-2 rounded-xl border border-border/40"> */}
          <Search className="w-4 h-4" />
          {/* </span> */}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-5xl w-full">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-foreground text-lg font-semibold tracking-tight capitalize">
            <div className="p-2 rounded-xl bg-primary/10">
              <IconComponent className="w-5 h-5 text-primary" />
            </div>
            Search colors
          </DialogTitle>
          <DialogDescription>
            You can apply the same color to all the colors in this group.
          </DialogDescription>
        </DialogHeader>
        <div className="w-full">
          <Input
            placeholder="Search colors"
            className="w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        {/* Scrollable content area */}
        <div className="mt-2 h-[50vh] overflow-y-auto pr-1">
          {filteredColors.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No colors found for this query.
            </p>
          ) : (
            <div
              className={cn(
                "grid gap-4 grid-cols-1",
                colors.length >= 3
                  ? "xl:grid-cols-3 md:grid-cols-2"
                  : colors.length === 2
                    ? "md:grid-cols-2"
                    : "md:grid-cols-1"
              )}
            >
              {filteredColors.map((color) => (
                <ColorItem color={color} />
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ColorItem({ color }: { color: ColorRendered }) {
  const { updateUnsavedChanges, handleRemoveDraftChange } = useDraft();
  return (
    <div
      key={color.key}
      className={cn(
        "border relative border-primary/20 space-y-3 rounded-xl p-4",
        color.isTouched && "bg-primary/10"
      )}
    >
      <RemoveDraftChange
        handleRemove={() =>
          handleRemoveDraftChange([
            {
              type: "color",
              key: color.key,
              value: color.value,
            },
          ])
        }
        isTouched={color.isTouched}
      />

      <div>
        <h4 className="text-xs font-semibold text-foreground/40 tracking-tight">
          {color.category}
        </h4>
        <h4 className="text-base font-semibold text-foreground/80 tracking-tight">
          {color.displayName}
        </h4>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {color.description}
        </p>
      </div>

      <ColorPicker
        value={color.value}
        onChange={(value) =>
          updateUnsavedChanges([
            {
              type: "color",
              key: color.key,
              value,
            },
          ])
        }
      />
      {!color.groupName ? null : (
        <ApplyGroupColors groupName={color.groupName} selectedColor={color} />
      )}
    </div>
  );
}
