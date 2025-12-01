"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@webview/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@webview/components/ui/popover";
import { PopoverClose } from "@radix-ui/react-popover";

export function DiscardChangesDialog({
  handleDiscard,
  isDiscarding,
}: {
  handleDiscard: () => void;
  isDiscarding: boolean;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="destructive"
          size="sm"
          disabled={isDiscarding}
          className="rounded-full font-medium"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          {isDiscarding ? "Discarding..." : "Discard"}
        </Button>
      </PopoverTrigger>

      <PopoverContent 
        align="end"
        sideOffset={14}
        className="w-[320px] md:w-[380px] bg-primary/10 rounded-xl shadow-xl border border-primary/20 backdrop-blur-xl p-4 space-y-4"
      >
        <div className="space-y-1">
          <h3 className="text-sm font-semibold">Discard changes</h3>
          <p className="text-xs text-muted-foreground">
            Are you sure you want to discard all unsaved changes? This action
            cannot be undone.
          </p>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <PopoverClose asChild>
            <Button variant="outline" size={"sm"} className="rounded-xl border-border/50">
              Cancel
            </Button>
          </PopoverClose>
          <Button
            onClick={handleDiscard}
            size="sm"
            variant={"destructive"}
            className="h-8 rounded-xl px-3 text-xs"
            disabled={isDiscarding}
          >
            Discard
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
