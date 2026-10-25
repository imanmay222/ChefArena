import Link from "next/link";
import { cn } from "@/lib/utils/cn";

export function BrandMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "relative inline-flex size-8 shrink-0 items-center justify-center rounded-[9px] bg-gradient-to-br from-primary to-brand-2 text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.25)]",
        className,
      )}
      aria-hidden
    >
      <svg viewBox="0 0 24 24" className="size-[62%]" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 18.5 12 5l7 13.5" />
        <path d="M8.6 13.5h6.8" />
        <path d="M3.5 18.5h3M17.5 18.5h3" opacity={0.6} />
      </svg>
    </span>
  );
}

export function Brand({ collapsed, href = "/dashboard", className, tagline = true }: { collapsed?: boolean; href?: string; className?: string; tagline?: boolean }) {
  return (
    <Link href={href} className={cn("flex items-center gap-2.5 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring/50", className)}>
      <BrandMark />
      {!collapsed && (
        <span className="flex flex-col leading-none">
          <span className="text-[15px] font-semibold tracking-tight">
            Chef<span className="text-gradient-brand">Arena</span>
          </span>
          {tagline && <span className="mt-1 text-[10px] font-medium tracking-[0.14em] whitespace-nowrap text-muted-foreground uppercase">Think · Code · Compete</span>}
        </span>
      )}
    </Link>
  );
}
