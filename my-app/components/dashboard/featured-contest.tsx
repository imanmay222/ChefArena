"use client";

import Link from "next/link";
import { ArrowRight, CalendarClock, Check, Clock, Medal, Timer, Users } from "lucide-react";
import type { Contest } from "@/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ContestStatusBadge } from "@/components/ui/status-badges";
import { Countdown } from "@/components/contests/countdown";
import { useContestProblems, useCurrentUser, useStandings } from "@/lib/queries";
import { contestEndMs, contestStartMs, getContestStatus } from "@/lib/contests/status";
import { fmtDuration, fmtShortDateTime } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

function LiveDetails({ contest, now }: { contest: Contest; now: number }) {
  const { data: user } = useCurrentUser();
  const { data: problems } = useContestProblems(contest.id);
  const { data: standings } = useStandings(contest.id, true);
  const myRow = standings?.rows.find((r) => r.participant.id === user?.id);
  const start = contestStartMs(contest);
  const end = contestEndMs(contest);
  const progress = Math.min(100, ((now - start) / (end - start)) * 100);

  return (
    <>
      <div className="mt-5 grid gap-5 sm:grid-cols-[auto_1fr] sm:items-end">
        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">Ends in</p>
          <Countdown target={end} variant="blocks" />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:justify-self-end sm:text-right">
          <div>
            <p className="text-xs text-muted-foreground">Your rank</p>
            <p className="mt-0.5 font-mono text-lg font-semibold tabular">{myRow ? `#${myRow.rank}` : "—"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Solved</p>
            <p className="mt-0.5 font-mono text-lg font-semibold tabular">
              {myRow?.solved ?? 0}
              <span className="text-muted-foreground">/{contest.problemIds.length}</span>
            </p>
          </div>
        </div>
      </div>
      <div className="mt-4 h-1 overflow-hidden rounded-full bg-primary/10" aria-label={`${Math.round(progress)}% of contest time elapsed`}>
        <div className="h-full rounded-full bg-gradient-to-r from-primary to-brand-2" style={{ width: `${progress}%` }} />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {problems
          ? problems.map(({ problem, state }) => (
              <Link
                key={problem.id}
                href={`/contests/${contest.id}/problems/${problem.id}`}
                className={cn(
                  "flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-[13px] transition-colors hover:border-border-strong hover:bg-accent",
                  state === "solved" ? "border-success/30 bg-success/8" : "border-border",
                )}
              >
                <span className={cn("flex size-5 items-center justify-center rounded font-mono text-[11px] font-semibold", state === "solved" ? "bg-success text-white" : "bg-surface-2 text-muted-foreground")}>
                  {state === "solved" ? <Check className="size-3" strokeWidth={3} /> : problem.code}
                </span>
                <span className="max-w-[10rem] truncate">{problem.title}</span>
              </Link>
            ))
          : [0, 1, 2].map((i) => <Skeleton key={i} className="h-8 w-32" />)}
      </div>
    </>
  );
}

export function FeaturedContest({ contests, now }: { contests: Contest[]; now: number }) {
  const live = contests.find((c) => getContestStatus(c, now) === "ongoing");
  const next = contests.find((c) => ["upcoming", "scheduled"].includes(getContestStatus(c, now)));
  const featured = live ?? next;

  if (!featured) {
    return (
      <Card className="flex flex-col items-center justify-center p-8 text-center">
        <CalendarClock className="mb-2 size-5 text-muted-foreground" />
        <p className="text-sm font-medium">No contests scheduled</p>
        <p className="mt-1 text-[13px] text-muted-foreground">The next weekly round will appear here once a CP lead publishes it.</p>
      </Card>
    );
  }

  const status = getContestStatus(featured, now);
  const firstProblem = featured.problemIds[0];

  return (
    <Card className="relative overflow-hidden">
      <div className="pointer-events-none absolute -top-24 -right-24 size-64 rounded-full bg-primary/10 blur-3xl" aria-hidden />
      <div className="relative p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <ContestStatusBadge status={status} />
          <span className="text-xs text-muted-foreground">
            {featured.scoring.format} · {featured.problemIds.length || "—"} problems · {fmtDuration(featured.durationMinutes)}
          </span>
        </div>
        <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold tracking-tight sm:text-xl">{featured.title}</h2>
            <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Clock className="size-3.5" /> {fmtShortDateTime(featured.startsAt)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Users className="size-3.5" /> {featured.registeredCount} registered
              </span>
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={live ? `/leaderboard?contest=${featured.id}` : `/contests/${featured.id}`}>
                {live ? <Medal /> : null} {live ? "Standings" : "View details"}
              </Link>
            </Button>
            {live && firstProblem && (
              <Button size="sm" asChild>
                <Link href={`/contests/${featured.id}/problems/${firstProblem}`}>
                  Enter arena <ArrowRight />
                </Link>
              </Button>
            )}
          </div>
        </div>

        {live ? (
          <LiveDetails contest={live} now={now} />
        ) : (
          <div className="mt-5">
            <p className="mb-2 text-xs font-medium text-muted-foreground">Starts in</p>
            <Countdown target={featured.startsAt} variant="blocks" />
          </div>
        )}
      </div>
      {live && next && (
        <Link
          href={`/contests/${next.id}`}
          className="relative flex items-center justify-between gap-3 border-t border-border bg-surface-2/50 px-5 py-2.5 text-[13px] transition-colors hover:bg-accent/60 sm:px-6"
        >
          <span className="flex min-w-0 items-center gap-2">
            <Timer className="size-3.5 shrink-0 text-muted-foreground" />
            <span className="text-muted-foreground">Next up</span>
            <span className="truncate font-medium">{next.title}</span>
          </span>
          <span className="shrink-0 text-xs text-muted-foreground">
            in <Countdown target={next.startsAt} className="text-foreground" />
          </span>
        </Link>
      )}
    </Card>
  );
}
