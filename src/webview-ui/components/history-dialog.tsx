"use client";

import { useState } from "react";
import { History, RotateCcw, Clock, Trash2, X } from "lucide-react";
import { Button } from "@webview/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@webview/components/ui/dialog";
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
} from "@webview/components/ui/alert-dialog";
import { Badge } from "@webview/components/ui/badge";
import { ScrollArea } from "@webview/components/ui/scroll-area";
import { useQuery, useMutation } from "@webview/hooks/use-query";
import useToast from "@webview/hooks/use-toast";
import { HistoryEntry, HistoryState } from "../../types/history";

export default function HistoryDialog() {
  const [open, setOpen] = useState(false);
  const toast = useToast();

  const { data: historyData, isLoading } = useQuery({
    command: "GET_HISTORY",
    payload: [],
  });

  const { mutate: resetToEntry, isPending: isResetting } = useMutation(
    "RESET_TO_HISTORY_ENTRY",
    {
      onSuccess: () => {
        toast({
          message: "Successfully reset to selected state",
          type: "success",
        });
        setOpen(false);
      },
      onError: (error) => {
        toast({
          message: `Failed to reset: ${error}`,
          type: "error",
        });
      },
    }
  );

  const { mutate: clearHistory, isPending: isClearing } = useMutation(
    "CLEAR_HISTORY",
    {
      onSuccess: () => {
        toast({
          message: "History cleared",
          type: "success",
        });
        // History will be automatically updated via the subscription
      },
      onError: () => {
        toast({
          message: "Failed to clear history",
          type: "error",
        });
      },
    }
  );

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;

    return date.toLocaleDateString();
  };

  const getTypeColor = (type: HistoryEntry["type"]) => {
    switch (type) {
      case "theme":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30";
      case "settings":
        return "bg-green-500/20 text-green-300 border-green-500/30";
      case "both":
        return "bg-purple-500/20 text-purple-300 border-purple-500/30";
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30";
    }
  };

  const getChangesSummary = (entry: HistoryEntry) => {
    const changes = [];

    if (entry.changes.colors) {
      changes.push(`${Object.keys(entry.changes.colors).length} colors`);
    }
    if (entry.changes.tokenColors) {
      changes.push(`${Object.keys(entry.changes.tokenColors).length} tokens`);
    }

    if (entry.changes.fontLayoutSettings) {
      changes.push(
        `${Object.keys(entry.changes.fontLayoutSettings).length} font layout`
      );
    }

    return changes.join(", ");
  };

  const entries = historyData?.entries || [];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="px-4 font-medium transition-all duration-200 rounded-full"
          title="View History"
        >
          <History className="w-4 h-4 mr-2" />
          History
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] bg-card/95 border border-border/40 rounded-2xl shadow-xl backdrop-blur-xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-foreground font-semibold tracking-tight flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Change History
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                View and restore previous theme and settings changes
              </DialogDescription>
            </div>
            {entries.length > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isClearing}
                    className="text-destructive hover:text-destructive-foreground hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Clear
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Clear History</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to clear all history? This action
                      cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => clearHistory({})}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Clear History
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Loading history...</div>
            </div>
          ) : entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Clock className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                No History Yet
              </h3>
              <p className="text-muted-foreground max-w-sm">
                Make some changes to your theme or settings to start building
                your history.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {entries.map((entry, index) => (
                <div
                  key={entry.id}
                  className="p-4 rounded-xl bg-background/50 border border-border/30 hover:border-border/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge
                          className={`text-xs ${getTypeColor(entry.type)}`}
                        >
                          {entry.type}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {formatTimestamp(entry.timestamp)}
                        </span>
                      </div>

                      <h4 className="font-medium text-foreground mb-1 truncate">
                        {entry.description}
                      </h4>

                      <p className="text-sm text-muted-foreground">
                        {getChangesSummary(entry)}
                      </p>
                    </div>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isResetting}
                          className="ml-3 px-3 py-1 h-8 text-xs"
                        >
                          <RotateCcw className="w-3 h-3 mr-1" />
                          Reset
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Reset to Previous State
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to reset to this state? This
                            will restore:
                            <br />
                            <strong>{entry.description}</strong>
                            <br />
                            Changes: {getChangesSummary(entry)}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => resetToEntry({ entryId: entry.id })}
                            className="bg-primary text-primary-foreground hover:bg-primary/90"
                          >
                            Reset to This State
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
