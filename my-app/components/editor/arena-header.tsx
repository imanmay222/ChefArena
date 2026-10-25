"use client";

import Link from "next/link";
import { ArrowLeft, Check, ChevronLeft, ChevronRight, History, Timer } from "lucide-react";
import type { SolveState } from "@/types";
import { Button } from "@/components/ui/button";
import { Hint } from "@/components/ui/tooltip";
import { BrandMark } from "@/components/layout/brand";
import { ThemeToggle } from "@/components/navigation/theme-toggle";
import { UserMenu } from "@/components/navigation/user-menu";
import { useNow } from "@/hooks/use-now";
import { fmtCountdown } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

export interface ArenaNavItem {
  id: string;
  code: string;
  title: string;
  state: SolveState;
  href: string;
}

export function ArenaHeader({
  backHref,
  backLabel,
  title,
  badge,
  endsAt,
  items,
  currentId,
  onOpenHistory,
}: {
  backHref: string;
  backLabel: string;
  title: string;
  badge?: React.ReactNode;
  endsAt?: number;
  items: ArenaNavItem[];
  currentId: string;
  onOpenHistory: () => void;
}) {
  const now = useNow(1000);
  const index = items.findIndex((i) => i.id === currentId);
  const prev = index > 0 ? items[index - 1] : null;
  const next = index >= 0 && index < items.length - 1 ? items[index + 1] : null;
  const remaining = endsAt && now ? endsAt - now : null;
  const urgent = remaining !== null && remaining < 15 * 60_000;

  return (
    <header className="flex h-12 shrink-0 items-center gap-2 border-b border-border bg-sidebar px-2 sm:px-3">
      <Hint label={backLabel}>
        <Button variant="ghost" size="icon-sm" asChild>
          <Link href={backHref} aria-label={backLabel}>
            <ArrowLeft />
          </Link>
        </Button>
      </Hint>
      <BrandMark className="hidden size-6 rounded-md sm:inline-flex" />
      <div className="flex min-w-0 items-center gap-2">
        <span className="truncate text-[13px] font-semibold">{title}</span>
        <span className="hidden sm:inline-flex">{badge}</span>
      </div>

      <nav aria-label="Problems" className="mx-auto flex items-center gap-1">
        <Hint label={prev ? `Previous: ${prev.title}` : "No previous problem"}>
          <Button variant="ghost" size="icon-xs" disabled={!prev} asChild={!!prev} aria-label="Previous problem">
            {prev ? (
              <Link href={prev.href}>
                <ChevronLeft />
              </Link>
            ) : (
              <ChevronLeft />
            )}
          </Button>
        </Hint>
        <div className="hidden items-center gap-1 md:flex">
          {items.map((item) => (
            <Hint key={item.id} label={item.title}>
              <Link
                href={item.href}
                aria-current={item.id === currentId ? "page" : undefined}
                aria-label={`Problem ${item.code}: ${item.title}${item.state === "solved" ? " (solved)" : ""}`}
                className={cn(
                  "relative flex size-7 items-center justify-center rounded-md border font-mono text-xs font-semibold transition-colors",
                  item.id === currentId ? "border-primary bg-primary-soft text-foreground" : "border-border text-muted-foreground hover:border-border-strong hover:text-foreground",
                  item.state === "solved" && item.id !== currentId && "border-success/40 text-success",
                )}
              >
                {item.code}
                {item.state === "solved" && (
                  <span className="absolute -top-1 -right-1 flex size-3 items-center justify-center rounded-full bg-success text-white">
                    <Check className="size-2" strokeWidth={4} />
                  </span>
                )}
                {item.state === "attempted" && <span className="absolute -top-0.5 -right-0.5 size-1.5 rounded-full bg-warning" />}
              </Link>
            </Hint>
          ))}
        </div>
        <span className="px-1 font-mono text-xs whitespace-nowrap text-muted-foreground tabular md:hidden">
          {index + 1} / {items.length}
        </span>
        <span className="hidden px-1 font-mono text-xs text-muted-foreground tabular md:inline">
          {index + 1}/{items.length}
        </span>
        <Hint label={next ? `Next: ${next.title}` : "No next problem"}>
          <Button variant="ghost" size="icon-xs" disabled={!next} asChild={!!next} aria-label="Next problem">
            {next ? (
              <Link href={next.href}>
                <ChevronRight />
              </Link>
            ) : (
              <ChevronRight />
            )}
          </Button>
        </Hint>
      </nav>

      <div className="flex items-center gap-1">
        {endsAt && (
          <div
            className={cn(
              "flex h-8 items-center gap-1.5 rounded-md border px-2 font-mono text-[13px] font-medium tabular",
              urgent ? "border-warning/40 bg-warning/10 text-warning" : "border-border bg-card",
              remaining !== null && remaining <= 0 && "text-muted-foreground",
            )}
            role="timer"
            aria-label="Time remaining"
          >
            <Timer className="size-3.5" />
            {remaining === null ? "--:--:--" : remaining <= 0 ? "Ended" : fmtCountdown(remaining)}
          </div>
        )}
        <Hint label="Submission history">
          <Button variant="ghost" size="icon-sm" onClick={onOpenHistory} aria-label="Submission history" className="hidden sm:inline-flex">
            <History />
          </Button>
        </Hint>
        <span className="hidden sm:inline-flex">
          <ThemeToggle />
        </span>
        <UserMenu />
      </div>
    </header>
  );
}
