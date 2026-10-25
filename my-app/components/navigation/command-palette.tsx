"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CornerDownLeft, FileCode2, Search, Trophy } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Kbd } from "@/components/ui/kbd";
import { useContests, useCurrentUser, useProblems } from "@/lib/queries";
import { visibleSections } from "@/lib/navigation";
import { getContestStatus } from "@/lib/contests/status";
import { ContestStatusBadge, DifficultyLabel } from "@/components/ui/status-badges";
import { cn } from "@/lib/utils/cn";
import { useNow } from "@/hooks/use-now";

function PaletteResults({ onSelect }: { onSelect: (href: string) => void }) {
  const { data: user } = useCurrentUser();
  const { data: contests } = useContests();
  const { data: problems } = useProblems();
  const sections = visibleSections(user?.role);
  const now = useNow(60_000) ?? 0;

  return (
    <CommandList>
      <CommandEmpty>No results. Try a contest name or a problem ID like CA102.</CommandEmpty>
      <CommandGroup heading="Contests">
        {contests?.map((c) => (
          <CommandItem key={c.id} value={`contest ${c.title} ${c.id}`} onSelect={() => onSelect(`/contests/${c.id}`)}>
            <Trophy />
            <span className="flex-1 truncate">{c.title}</span>
            <ContestStatusBadge status={getContestStatus(c, now)} />
          </CommandItem>
        ))}
      </CommandGroup>
      <CommandGroup heading="Problems">
        {problems?.map(({ problem, locked }) => (
          <CommandItem
            key={problem.id}
            value={`problem ${problem.id} ${problem.title}`}
            onSelect={() => onSelect(locked && problem.contestId ? `/contests/${problem.contestId}/problems/${problem.id}` : `/problems/${problem.id}`)}
          >
            <FileCode2 />
            <span className="font-mono text-xs text-muted-foreground">{problem.id}</span>
            <span className="flex-1 truncate">{problem.title}</span>
            <DifficultyLabel difficulty={problem.difficulty} />
          </CommandItem>
        ))}
      </CommandGroup>
      {sections.map((section) => (
        <CommandGroup key={section.id} heading={section.label}>
          {section.items.map((item) => (
            <CommandItem key={item.href} value={`${section.label} ${item.label}`} onSelect={() => onSelect(item.href)}>
              <item.icon />
              {item.label}
            </CommandItem>
          ))}
        </CommandGroup>
      ))}
    </CommandList>
  );
}

export function CommandPalette({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={cn(
          "flex h-8 cursor-pointer items-center gap-2 rounded-md border border-border bg-surface-2/60 px-2.5 text-[13px] text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground",
          className,
        )}
        aria-label="Search ChefArena"
      >
        <Search className="size-3.5" />
        <span className="hidden flex-1 truncate text-left whitespace-nowrap sm:inline">Search contests, problems…</span>
        <span className="hidden items-center gap-0.5 sm:flex">
          <Kbd>⌘</Kbd>
          <Kbd>K</Kbd>
        </span>
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent showClose={false} className="top-[18%] max-w-xl translate-y-0 gap-0 overflow-hidden p-0">
          <DialogTitle className="sr-only">Search</DialogTitle>
          <DialogDescription className="sr-only">Search contests, problems and pages</DialogDescription>
          <Command loop>
            <CommandInput placeholder="Search contests, problems, pages…" autoFocus />
            <PaletteResults
              onSelect={(href) => {
                setOpen(false);
                router.push(href);
              }}
            />
            <div className="flex items-center justify-end gap-1.5 border-t border-border px-3 py-2 text-[11px] text-muted-foreground">
              <CornerDownLeft className="size-3" /> to open · <Kbd>Esc</Kbd> to close
            </div>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  );
}
