import { cn } from "@/lib/utils";

/** ChefArena's own brand mark: a terminal prompt inside a rounded tile. */
export function ChefArenaMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={cn("size-8", className)}>
      <rect width="32" height="32" rx="8" className="fill-primary" />
      <path
        d="M10 11l5 5-5 5"
        fill="none"
        stroke="#fff"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M17.5 21H22" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

export function ChefArenaLogo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <ChefArenaMark />
      <span className="text-[17px] font-semibold tracking-tight text-foreground">
        Chef<span className="text-muted">Arena</span>
      </span>
    </span>
  );
}
