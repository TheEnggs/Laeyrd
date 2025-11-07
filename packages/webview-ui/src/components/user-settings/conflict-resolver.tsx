"use client";

import React from "react";
import { diffLines } from "diff";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

// Virtualization constants
const ITEM_HEIGHT = 24; // px, line height
const OVERSCAN = 10;

type DiffViewerProps = {
  initialLocal?: string;
  initialRemote?: string;
};

type Row = {
  left: string | null;
  right: string | null;
  leftStatus?: "removed" | "unchanged";
  rightStatus?: "added" | "unchanged";
  leftNo?: number | null;
  rightNo?: number | null;
};

export function DiffViewer({
  initialLocal = "",
  initialRemote = "",
}: DiffViewerProps) {
  const [localText, setLocalText] = React.useState(initialLocal);
  const [remoteText, setRemoteText] = React.useState(initialRemote);

  // Build aligned rows with per-side line numbers
  const rows = React.useMemo<Row[]>(() => {
    const parts = diffLines(localText, remoteText);
    const out: Row[] = [];
    let leftNo = 1;
    let rightNo = 1;

    for (const part of parts) {
      const lines = part.value.split("\n");
      if (lines.length && lines[lines.length - 1] === "") lines.pop();

      if (part.added) {
        for (const l of lines) {
          out.push({
            left: null,
            right: l,
            rightStatus: "added",
            leftNo: null,
            rightNo: rightNo++,
          });
        }
      } else if (part.removed) {
        for (const l of lines) {
          out.push({
            left: l,
            right: null,
            leftStatus: "removed",
            leftNo: leftNo++,
            rightNo: null,
          });
        }
      } else {
        for (const l of lines) {
          out.push({
            left: l,
            right: l,
            leftStatus: "unchanged",
            rightStatus: "unchanged",
            leftNo: leftNo++,
            rightNo: rightNo++,
          });
        }
      }
    }
    return out;
  }, [localText, remoteText]);

  const changeIndices = React.useMemo(
    () =>
      rows.map((r, i) => (r.left !== r.right ? i : -1)).filter((i) => i !== -1),
    [rows]
  );
  const [currentChange, setCurrentChange] = React.useState(0);

  // Virtualizer states
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const [scrollTop, setScrollTop] = React.useState(0);
  const [viewportHeight, setViewportHeight] = React.useState<number>(480);

  React.useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setViewportHeight(el.clientHeight || 480);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const totalHeight = rows.length * ITEM_HEIGHT;
  const startIndex = Math.max(
    0,
    Math.floor(scrollTop / ITEM_HEIGHT) - OVERSCAN
  );
  const endIndex = Math.min(
    rows.length - 1,
    Math.ceil((scrollTop + viewportHeight) / ITEM_HEIGHT) + OVERSCAN
  );
  const visibleRows = rows.slice(startIndex, endIndex + 1);
  const offsetY = startIndex * ITEM_HEIGHT;

  const onScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop((e.target as HTMLDivElement).scrollTop);
  };

  const scrollToIndex = (idx: number) => {
    const el = containerRef.current;
    if (!el) return;
    const targetTop = idx * ITEM_HEIGHT - viewportHeight / 2;
    el.scrollTo({ top: Math.max(0, targetTop), behavior: "smooth" });
  };

  const onPrev = () => {
    if (!changeIndices.length) return;
    const next =
      (currentChange - 1 + changeIndices.length) % changeIndices.length;
    setCurrentChange(next);
    scrollToIndex(changeIndices[next]);
  };

  const onNext = () => {
    if (!changeIndices.length) return;
    const next = (currentChange + 1) % changeIndices.length;
    setCurrentChange(next);
    scrollToIndex(changeIndices[next]);
  };

  // Actions
  const keepLocal = () => setRemoteText(localText);
  const keepRemote = () => setLocalText(remoteText);

  const formatJsonBoth = () => {
    try {
      const l = JSON.stringify(JSON.parse(localText), null, 2);
      const r = JSON.stringify(JSON.parse(remoteText), null, 2);
      setLocalText(l);
      setRemoteText(r);
    } catch {
      // ignore non-JSON
    }
  };

  return (
    <div className="space-y-4">
      {/* Inputs */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Local content</label>
          <Textarea
            value={localText}
            onChange={(e) => setLocalText(e.target.value)}
            className="min-h-40 font-mono text-sm"
            placeholder="Paste local JSON here..."
            aria-label="Local content"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Remote content</label>
          <Textarea
            value={remoteText}
            onChange={(e) => setRemoteText(e.target.value)}
            className="min-h-40 font-mono text-sm"
            placeholder="Paste remote JSON here..."
            aria-label="Remote content"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={formatJsonBoth}
            aria-label="Format JSON"
          >
            Format JSON
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={onPrev}
            aria-label="Previous change"
          >
            Previous change
          </Button>
          <Button size="sm" onClick={onNext} aria-label="Next change">
            Next change
          </Button>
          <span className="text-sm text-muted-foreground">
            {changeIndices.length
              ? `Change ${currentChange + 1} of ${changeIndices.length}`
              : "No changes found"}
          </span>
        </div>
      </div>

      {/* Top header with side labels and actions */}
      <div className="rounded-lg border">
        <div className="grid grid-cols-2 items-center gap-0 border-b bg-secondary px-3 py-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="font-semibold">Local</span>
            <Button
              size="sm"
              onClick={keepLocal}
              aria-label="Keep local version"
            >
              Keep this
            </Button>
            <PreviewButton title="Preview local" content={localText} />
          </div>
          <div className="flex items-center justify-end gap-2">
            <span className="font-semibold">Remote</span>
            <Button
              size="sm"
              onClick={keepRemote}
              aria-label="Keep remote version"
            >
              Keep this
            </Button>
            <PreviewButton title="Preview remote" content={remoteText} />
          </div>
        </div>

        {/* Virtualized side-by-side body */}
        <div
          ref={containerRef}
          onScroll={onScroll}
          className="max-h-[60vh] overflow-auto text-sm"
          role="region"
          aria-label="Diff results"
        >
          <div style={{ height: totalHeight, position: "relative" }}>
            <div style={{ transform: `translateY(${offsetY}px)` }}>
              {visibleRows.map((row, i) => {
                const idx = startIndex + i;
                const isLeftRemoved = row.leftStatus === "removed";
                const isRightAdded = row.rightStatus === "added";
                return (
                  <div
                    key={idx}
                    className="grid grid-cols-2"
                    style={{ height: ITEM_HEIGHT }}
                  >
                    {/* Left cell */}
                    <div
                      className={cn(
                        "grid grid-cols-[56px_1fr] items-center border-b pr-2 font-mono leading-6",
                        isLeftRemoved ? "bg-destructive/15" : "bg-background"
                      )}
                    >
                      <div className="select-none text-right text-xs text-muted-foreground pr-2">
                        {row.leftNo ?? ""}
                      </div>
                      <div className="min-h-[1.5rem] whitespace-pre">
                        {row.left != null ? row.left : ""}
                      </div>
                    </div>

                    {/* Right cell */}
                    <div
                      className={cn(
                        "grid grid-cols-[56px_1fr] items-center border-b pl-2 font-mono leading-6",
                        isRightAdded ? "bg-accent" : "bg-background"
                      )}
                    >
                      <div className="select-none text-right text-xs text-muted-foreground pr-2">
                        {row.rightNo ?? ""}
                      </div>
                      <div className="min-h-[1.5rem] whitespace-pre">
                        {row.right != null ? row.right : ""}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PreviewButton({ title, content }: { title: string; content: string }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="secondary" aria-label={title}>
          Preview
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-auto rounded-md border bg-card p-3 font-mono text-sm leading-6">
          {content || (
            <span className="text-muted-foreground">{"No content"}</span>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
