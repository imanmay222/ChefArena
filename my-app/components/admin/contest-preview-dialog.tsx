"use client";

import { CalendarDays, Clock, FileCode2, Trophy } from "lucide-react";
import type { Contest } from "@/types";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ContestStatusBadge } from "@/components/ui/status-badges";
import { useNow } from "@/hooks/use-now";
import { getContestStatus } from "@/lib/contests/status";
import { fmtDuration, fmtShortDateTime } from "@/lib/utils/format";

/** Shows a contest the way members will see it in the contest list. */
export function ContestPreviewDialog({ contest, onOpenChange }: { contest: Contest | null; onOpenChange: (open: boolean) => void }) {
  const now = useNow(30_000);
  return (
    <Dialog open={!!contest} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Member preview</DialogTitle>
          <DialogDescription>How this contest appears to members{contest?.lifecycle === "draft" ? " once published" : ""}.</DialogDescription>
        </DialogHeader>
        {contest && (
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[15px] font-semibold">{contest.title || "Untitled contest"}</p>
              {now && <ContestStatusBadge status={getContestStatus({ ...contest, lifecycle: contest.lifecycle === "draft" ? "published" : contest.lifecycle }, now)} />}
            </div>
            <p className="mt-1 text-[13px] text-muted-foreground">{contest.description}</p>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="size-3.5" /> {fmtShortDateTime(contest.startsAt)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="size-3.5" /> {fmtDuration(contest.durationMinutes)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <FileCode2 className="size-3.5" /> {contest.problemIds.length} problems (hidden until start)
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Trophy className="size-3.5" /> ICPC · {contest.scoring.penaltyMinutes} min penalty
              </span>
            </div>
            {contest.rules.length > 0 && (
              <ol className="mt-4 list-decimal space-y-1 border-t border-border pt-3 pl-4 text-xs text-muted-foreground">
                {contest.rules.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ol>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
