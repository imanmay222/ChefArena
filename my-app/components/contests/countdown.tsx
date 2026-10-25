"use client";

import { useNow } from "@/hooks/use-now";
import { fmtCountdown, splitCountdown } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

/** Live countdown. Renders a stable placeholder until hydrated. */
export function Countdown({ target, variant = "inline", className }: { target: string | number; variant?: "inline" | "blocks"; className?: string }) {
  const now = useNow(1000);
  const targetMs = typeof target === "number" ? target : new Date(target).getTime();
  const remaining = now === null ? null : Math.max(0, targetMs - now);

  if (variant === "inline") {
    return (
      <span className={cn("font-mono tabular", className)} suppressHydrationWarning>
        {remaining === null ? "--:--:--" : fmtCountdown(remaining)}
      </span>
    );
  }

  const parts = remaining === null ? null : splitCountdown(remaining);
  const units = parts
    ? [
        ...(parts.days > 0 ? [{ v: parts.days, l: "days" }] : []),
        { v: parts.hours, l: "hrs" },
        { v: parts.minutes, l: "min" },
        ...(parts.days > 0 ? [] : [{ v: parts.seconds, l: "sec" }]),
      ]
    : [
        { v: null, l: "hrs" },
        { v: null, l: "min" },
        { v: null, l: "sec" },
      ];

  return (
    <div className={cn("flex items-end gap-1.5", className)} role="timer" aria-live="off">
      {units.map((u, i) => (
        <div key={u.l} className="flex items-end gap-1.5">
          {i > 0 && <span className="pb-4 font-mono text-lg text-muted-foreground/50">:</span>}
          <div className="text-center">
            <div className="min-w-[2.6rem] rounded-md border border-border bg-surface-2 px-1.5 py-1 font-mono text-xl font-semibold tabular">
              {u.v === null ? "--" : String(u.v).padStart(2, "0")}
            </div>
            <div className="mt-1 text-[10px] tracking-wide text-muted-foreground uppercase">{u.l}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
