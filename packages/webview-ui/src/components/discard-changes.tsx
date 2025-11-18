"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DiscardChangesDialog({
  handleDiscard,
  isDiscarding,
}: {
  handleDiscard: () => void;
  isDiscarding: boolean;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="destructive"
          size="sm"
          disabled={isDiscarding}
          className="rounded-full font-medium"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          {isDiscarding ? "Discarding..." : "Discard"}
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent className="bg-card border border-border/40 rounded-2xl shadow-xl max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-semibold">
            Discard Changes
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to discard your changes?
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-xl border-border/50">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDiscard}
            className="rounded-xl bg-destructive hover:bg-destructive/90 text-foreground"
            disabled={isDiscarding}
          >
            Discard
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
