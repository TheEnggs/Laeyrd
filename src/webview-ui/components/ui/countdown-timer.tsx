import React, { useEffect, useState } from "react";

function formatTime(seconds: number) {
  if (seconds <= 0) return "00:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  if (h > 0) {
    // Show hours:minutes:seconds
    return `${h.toString().padStart(2, "0")}:${m
      .toString()
      .padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  } else if (m > 0) {
    // Show minutes:seconds
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  } else {
    // Show seconds only
    return `00:${s.toString().padStart(2, "0")}`;
  }
}

export default function CountdownTimer({ expiresIn }: { expiresIn: number }) {
  const [remaining, setRemaining] = useState(expiresIn);

  useEffect(() => {
    setRemaining(expiresIn);
    if (expiresIn <= 0) return;
    const interval = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [expiresIn]);

  return (
    <span
      className={`font-mono tabular-nums px-2 py-1 rounded ${
        remaining === 0
          ? "bg-destructive/10 text-destructive"
          : "bg-muted/30 text-foreground"
      }`}
      title={remaining === 0 ? "Expired" : undefined}
    >
      {remaining === 0 ? "Expired" : formatTime(remaining)}
    </span>
  );
}
