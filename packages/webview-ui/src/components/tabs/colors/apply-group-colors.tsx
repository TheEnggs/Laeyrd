import { DraftStatePayload, GroupName } from "@shared/types/theme";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@webview/components/ui/dialog";
import { Button } from "../../ui/button";
import { ChevronDown, List, Loader2, Square, Trash } from "lucide-react";
import ColorPicker from "../../ui/color-picker";
import { useDraft } from "@webview/contexts/draft-context";
import { ColorRendered, iconMap } from "./color-settings";
import { useMemo } from "react";
import { cn } from "@webview/lib/utils";
import RemoveDraftChange from "../shared/remove-draft-change";
import { useQuery } from "@webview/hooks/use-query";

export default function ApplyGroupColors({
  groupName,
  selectedColor,
}: {
  groupName: GroupName;
  selectedColor: ColorRendered;
}) {
  const {
      drafts,
      updateUnsavedChanges,
      handleRemoveDraftChange,
      isDiscarding,
    } = useDraft(),
    { data: colorsState, isLoading: isLoadingColors } = useQuery({
      command: "GET_THEME_COLORS",
      payload: [],
    }),
    // 🔹 Memoized tree: category → subcategory → colors[]
    {colors, hasChanges} = useMemo(() => {
      let hasChanges: boolean = false;
      if (!colorsState) {
        return {colors: [], hasChanges};
      }
      const colors = [];
      for (const [key, def] of Object.entries(colorsState)) {
        if (def.groupName !== groupName) {
          continue;
        }
        if (key === selectedColor.key) continue;
        const draftColor = drafts.find(
          (c): c is Extract<DraftStatePayload, { type: "color" }> =>
            c.key === key && c.type === "color"
        );
        const isTouched = Boolean(draftColor);
        if (isTouched) {
          hasChanges = true;
        }
        colors.push({
          key,
          category: def.category,
          displayName: def.displayName,
          description: def.description,
          groupName: def.groupName,
          value: draftColor?.value ?? def.defaultValue ?? "",
          originalValue: def.defaultValue,
          isTouched,
        });
      }
      return { colors, hasChanges };
    }, [colorsState, drafts]),
    // Pick icon based on first color’s category, or fall back
    IconComponent =
      colors.length > 0
        ? iconMap[colors[0].category as keyof typeof iconMap] || Square
        : Square,
    handleApplyToAll = () => {
      if (colors.length === 0) {
        return;
      }
      const changes = colors.map((color) => ({
        type: "color" as const,
        key: color.key,
        value: selectedColor.value,
      }));

      updateUnsavedChanges(changes);
    },
    handleDiscardAllColors = () => {
      const toRemove: Extract<DraftStatePayload, { type: "color" }>[] =
        colors.map((color) => ({
          type: "color",
          key: color.key,
          value: color.value,
        }));
      handleRemoveDraftChange(toRemove);
    };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          className="w-full flex items-center gap-2 text-xs capitalize text-foreground justify-between"
          variant="outline"
          size="sm"
        >
          Group : {groupName.split("_").join(" ")}
          <ChevronDown className="w-4 h-4" />
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-6xl w-full">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-foreground text-lg font-semibold tracking-tight capitalize">
            <div className="p-2 rounded-xl bg-primary/10">
              <IconComponent className="w-5 h-5 text-primary" />
            </div>
            {groupName.split("_").join(" ")} colors
          </DialogTitle>
          <DialogDescription>
            You can apply the same color to all the colors in this group.
          </DialogDescription>
        </DialogHeader>
        <div>
          <ColorItem color={selectedColor} isParent={true} />
        </div>
        <div className="p-2 flex items-center justify-between gap-4 mt-4">
          <div className="flex items-center gap-3">
            <List className="w-5 h-5" />
            Colors list of same group
          </div>

          {colors.length > 0 && (
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant={"destructive"}
                size="sm"
                className="text-xs"
                onClick={handleDiscardAllColors}
                disabled={isDiscarding || !hasChanges || isLoadingColors}
              >
                {isDiscarding ? (
                  <span>
                    Discarding <Loader2 className="w-4 h-4 animate-spin ml-2" />
                  </span>
                ) : (
                  "Discard all"
                )}
              </Button>
              <Button
                type="button"
                size="sm"
                className="text-xs"
                onClick={handleApplyToAll}
                disabled={isLoadingColors}
              >
                Apply to all
              </Button>
            </div>
          )}
        </div>

        {/* Scrollable content area */}
        <div className="mt-2 max-h-[50vh] overflow-y-auto pr-1">
          {colors.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No colors mapped to this group.
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
              {colors.map((color) => (
                <ColorItem color={color} />
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ColorItem({
  color,
  isParent,
}: {
  color: ColorRendered;
  isParent?: boolean;
}) {
  const { updateUnsavedChanges, handleRemoveDraftChange } = useDraft();
  function handleApplyToItem(value?: string) {
    updateUnsavedChanges([
      {
        type: "color",
        key: color.key,
        value: value ?? color.value,
      },
    ]);
  }
  function handleRemove() {
    return handleRemoveDraftChange([
      {
        type: "color",
        key: color.key,
        value: color.value,
      },
    ]);
  }

  return (
    <div
      key={color.key}
      className={cn(
        "w-full border relative border-primary/20 space-y-3 rounded-xl p-4",
        color.isTouched && "bg-primary/10"
      )}
    >
      {isParent ? (
        <RemoveDraftChange
          handleRemove={handleRemove}
          isTouched={color.isTouched}
        />
      ) : null}

      <div className="flex items-start justify-between gap-4 w-full mr-4">
        <div className="flex-1 min-w-0">
          <h4 className="text-base truncate font-semibold text-foreground/80 tracking-tight">
            {color.displayName}
          </h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {color.description}
          </p>
        </div>
        {!isParent ? (
          !color.isTouched ? (
            <Button
              variant={"outline"}
              size="sm"
              className="text-xs shrink-0"
              onClick={() => handleApplyToItem()}
            >
              Apply
            </Button>
          ) : (
            <Button
              variant={"destructive"}
              size="sm"
              className="text-xs shrink-0"
              onClick={handleRemove}
            >
              <Trash className="w-4 h-4" />
            </Button>
          )
        ) : null}
      </div>

      <ColorPicker
        value={color.value}
        onChange={(value) => handleApplyToItem(value)}
      />
    </div>
  );
}
