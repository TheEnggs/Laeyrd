import { DraftStatePayload } from "@shared/types/theme";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "../../ui/button";
import { Search, Settings2 } from "lucide-react";
import { useDraft } from "@/contexts/draft-context";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import RemoveDraftChange from "../shared/remove-draft-change";
import { Input } from "../../ui/input";
import { useQuery } from "@/hooks/use-query";

import { Switch } from "../../ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { UiLayoutMetaWithKey } from "./layout-settings";
import { useDebounce } from "use-debounce";

export default function FontAndLayoutSearchDialog() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery] = useDebounce(searchQuery, 500);
  const { drafts } = useDraft();
  const { data: layoutState, isLoading: isLoadingLayout } = useQuery({
    command: "GET_FONT_AND_LAYOUT_SETTINGS",
    payload: [],
  });

  // Merge draftState with default values and organize by subcategory
  const settingsCustomization = useMemo(() => {
    if (!layoutState) return [];
    return Object.entries(layoutState).map(([key, item]) => {
      const draftValue = drafts.find(
        (c): c is Extract<DraftStatePayload, { type: "settings" }> =>
          c.key === key && c.type === "settings"
      );
      return {
        ...item,
        key: key,
        defaultValue: draftValue ? draftValue.value : item.defaultValue,
        originalValue: item.defaultValue,
        isTouched: !!draftValue,
      } as UiLayoutMetaWithKey;
    });
  }, [drafts, layoutState]); // eslint-disable-line react-hooks/exhaustive-deps

  const filteredSettingsCustomization: UiLayoutMetaWithKey[] = useMemo(() => {
    const query = debouncedSearchQuery.trim().toLowerCase();
    if (query === "") return settingsCustomization.slice(0, 20);

    return settingsCustomization.filter((s) => {
      // helper to avoid repeating `.toLowerCase().includes(...)`
      const match = (value: unknown): boolean => {
        if (value == null) return false;
        return String(value).toLowerCase().includes(query);
      };

      // for union-specific fields
      const optionsMatch =
        "options" in s && Array.isArray(s.options)
          ? s.options.some((opt) => match(opt))
          : false;

      return (
        match(s.key) ||
        match(s.category) ||
        match(s.subcategory) ||
        match(s.displayName) ||
        match(s.displayName.split(" ").join()) ||
        match(s.description) ||
        match(s.valueType) ||
        match(s.defaultValue) ||
        match(s.originalValue) ||
        optionsMatch
      );
    });
  }, [settingsCustomization, debouncedSearchQuery]);

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
              <Settings2 className="w-5 h-5 text-primary" />
            </div>
            Search settings
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
          {filteredSettingsCustomization.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No customization found for this query.
            </p>
          ) : (
            <div
              className={cn(
                "grid gap-4 grid-cols-1",
                filteredSettingsCustomization.length >= 3
                  ? "xl:grid-cols-3 md:grid-cols-2"
                  : settingsCustomization.length === 2
                    ? "md:grid-cols-2"
                    : "md:grid-cols-1"
              )}
            >
              {filteredSettingsCustomization.map((c) => (
                <LayoutSettings item={c} />
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function LayoutSettings({ item }: { item: UiLayoutMetaWithKey }) {
  const { updateUnsavedChanges, handleRemoveDraftChange } = useDraft();
  return (
    <div
      key={item.displayName}
      className={cn(
        "border relative border-primary/10 space-y-3 rounded-xl p-4",
        item.isTouched && "bg-primary/10"
      )}
    >
      <RemoveDraftChange
        handleRemove={() =>
          handleRemoveDraftChange([
            {
              type: "settings",
              key: item.key,
              value: item.defaultValue,
            },
          ])
        }
        isTouched={item.isTouched}
      />
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-medium text-foreground/90">
            {item.displayName}
          </h4>
          <p className="text-xs text-muted-foreground">{item.description}</p>
        </div>
      </div>
      {item.valueType === "boolean" ? (
        <div className="flex items-center space-x-2">
          <Switch
            checked={item.defaultValue as boolean}
            onCheckedChange={(checked) => {
              updateUnsavedChanges([
                {
                  type: "settings",
                  key: item.key,
                  value: checked,
                },
              ]);
            }}
          />
          <span className="text-xs font-medium text-muted-foreground">
            {item.defaultValue ? "Enabled" : "Disabled"}
          </span>
        </div>
      ) : item.valueType === "number" ? (
        <Input
          type="number"
          value={Number(item.defaultValue) || 0}
          onChange={(e) => {
            const numValue = parseFloat(e.target.value);
            updateUnsavedChanges([
              {
                type: "settings",
                key: item.key,
                value: numValue,
              },
            ]);
          }}
        />
      ) : item.valueType === "select" ? (
        <Select
          value={item.defaultValue as string}
          onValueChange={(value) => {
            updateUnsavedChanges([
              {
                type: "settings",
                key: item.key,
                value,
              },
            ]);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            {item.options.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <Input
          value={item.defaultValue as string}
          onChange={(e) => {
            updateUnsavedChanges([
              {
                type: "settings",
                key: item.key,
                value: e.target.value,
              },
            ]);
          }}
        />
      )}
    </div>
  );
}
