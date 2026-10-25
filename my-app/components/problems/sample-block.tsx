"use client";

import { Check, Copy } from "lucide-react";
import { useCopy } from "@/hooks/use-copy";
import { cn } from "@/lib/utils/cn";

export function CodeBlock({ label, value, className }: { label: string; value: string; className?: string }) {
  const { copied, copy } = useCopy();
  return (
    <div className={cn("min-w-0 overflow-hidden rounded-lg border border-border bg-surface-2/60", className)}>
      <div className="flex items-center justify-between border-b border-border px-3 py-1.5">
        <span className="text-[11px] font-medium tracking-wide text-muted-foreground uppercase">{label}</span>
        <button
          type="button"
          onClick={() => copy(value, label)}
          className="flex cursor-pointer items-center gap-1 rounded px-1.5 py-0.5 text-[11px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          aria-label={`Copy ${label.toLowerCase()}`}
        >
          {copied === label ? <Check className="size-3 text-success" /> : <Copy className="size-3" />}
          {copied === label ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto px-3 py-2.5 font-mono text-[12.5px] leading-relaxed whitespace-pre scrollbar-thin">{value}</pre>
    </div>
  );
}
