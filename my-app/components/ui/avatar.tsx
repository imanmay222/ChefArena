import * as React from "react";
import { cn } from "@/lib/utils/cn";

const PALETTE = [
  "from-[#6c5ce7] to-[#9b5cff]",
  "from-[#0ea5e9] to-[#6366f1]",
  "from-[#10b981] to-[#0ea5e9]",
  "from-[#f59e0b] to-[#ef4444]",
  "from-[#ec4899] to-[#8b5cf6]",
  "from-[#14b8a6] to-[#22c55e]",
];

function hashString(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i++) hash = (hash * 31 + value.charCodeAt(i)) | 0;
  return Math.abs(hash);
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

/** Deterministic initials avatar — no remote images needed for the demo. */
function UserAvatar({
  name,
  seed,
  size = "md",
  className,
}: {
  name: string;
  seed?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  const gradient = PALETTE[hashString(seed ?? name) % PALETTE.length];
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br font-semibold text-white select-none",
        gradient,
        size === "xs" && "size-5 text-[9px]",
        size === "sm" && "size-7 text-[11px]",
        size === "md" && "size-8 text-xs",
        size === "lg" && "size-12 text-base",
        size === "xl" && "size-20 text-2xl",
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}

export { UserAvatar };
