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
import { ChevronDown, List, Loader2, Square } from "lucide-react";
import ColorPicker from "./ui/color-picker";
import { useDraft } from "@/contexts/draft-context";
import { CategoryTree, ColorRendered, iconMap } from "./color-settings";
import { useMemo } from "react";
import { cn } from "@/lib/utils";
import RemoveDraftChange from "./remove-draft-change";

export default function ApplyGroupColors({
  groupName,
  categoryTree,
  selectedColor,
}: {
  groupName: GroupName;
  categoryTree: CategoryTree;
  selectedColor: ColorRendered;
}) {
  const { updateUnsavedChanges, handleRemoveDraftChange, isDiscarding } =
    useDraft();

  const colors = useMemo(
    () =>
      Object.values(categoryTree).flatMap((subcategories) =>
        Object.values(subcategories).flatMap((colors) =>
          colors.filter(
            (c) => c.groupName === groupName && c.key !== selectedColor.key
          )
        )
      ),
    [categoryTree, groupName]
  );

  // pick icon based on first color’s category, or fall back
  const IconComponent =
    colors.length > 0
      ? iconMap[colors[0].category as keyof typeof iconMap] || Square
      : Square;

  const handleApplyToAll = () => {
    console.log("handleApplyToAll", colors);
    if (colors.length === 0) return;
    const changes = colors.map((color) => ({
      type: "color" as const,
      key: color.key,
      value: selectedColor.value,
    }));

    updateUnsavedChanges(changes);
  };

  const handleDiscardAllColors = () => {
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

      <DialogContent className="max-w-5xl w-full">
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
          <ColorItem color={selectedColor} />
        </div>
        <div className="p-2 flex items-center justify-between gap-4 mt-4">
          <div className="flex items-center gap-3 capitalize">
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
                disabled={isDiscarding}
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
    </div>
  );
}
