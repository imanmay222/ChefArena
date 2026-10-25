"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, CalendarDays, Clock, FileCode2, Medal, Search, Trophy, Users, X } from "lucide-react";
import type { Contest } from "@/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContestStatusBadge } from "@/components/ui/status-badges";
import { EmptyState, ErrorState } from "@/components/feedback/states";
import { Countdown } from "./countdown";
import { useQueries } from "@tanstack/react-query";
import { qk, useContests, useCurrentUser, useStandings } from "@/lib/queries";
import { services } from "@/lib/services";
import { useNow } from "@/hooks/use-now";
import { contestEndMs, getContestPhase, getContestStatus, type ContestPhase } from "@/lib/contests/status";
import { fmtDuration, fmtShortDateTime } from "@/lib/utils/format";
import { format } from "date-fns";

const PHASE_LABEL: Record<ContestPhase, string> = { upcoming: "Upcoming", ongoing: "Live", past: "Past" };

const EMPTY_MESSAGE: Record<ContestPhase, string> = {
  upcoming: "No upcoming contests match. New weekly rounds are usually published a week ahead.",
  ongoing: "No contest is live right now. Check the upcoming tab for the next round.",
  past: "No past contests match your filters.",
};

type SortKey = "start-asc" | "start-desc" | "duration";
type DurationFilter = "all" | "short" | "long";
type ParticipationFilter = "all" | "participated" | "missed";

function YourResult({ contest }: { contest: Contest }) {
  const { data: user } = useCurrentUser();
  const { data } = useStandings(contest.id);
  if (!data) return <Skeleton className="h-9 w-16" />;
  const row = data.rows.find((r) => r.participant.id === user?.id);
  if (!row) return <p className="text-xs text-muted-foreground">Not attempted</p>;
  return (
    <div className="text-right">
      <p className="font-mono text-base font-semibold tabular">
        #{row.rank}
        <span className="text-xs font-normal text-muted-foreground"> / {data.rows.length}</span>
      </p>
      <p className="text-xs text-muted-foreground">
        {row.solved} solved · {row.penalty} pen
      </p>
    </div>
  );
}

function ContestRow({ contest, now }: { contest: Contest; now: number }) {
  const status = getContestStatus(contest, now);
  const phase = getContestPhase(status);
  const start = new Date(contest.startsAt);
  const action =
    phase === "ongoing" && contest.problemIds[0]
      ? { href: `/contests/${contest.id}/problems/${contest.problemIds[0]}`, label: "Enter arena", primary: true }
      : phase === "past"
        ? { href: `/contests/${contest.id}`, label: "Review", primary: false }
        : { href: `/contests/${contest.id}`, label: "View details", primary: false };

  return (
    <Card className="group relative flex flex-col gap-4 p-4 transition-colors hover:border-border-strong sm:flex-row sm:items-center sm:p-5">
      <div className="flex min-w-0 flex-1 items-start gap-4">
        <div className="flex w-12 shrink-0 flex-col items-center rounded-lg border border-border bg-surface-2 py-1.5">
          <span className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">{format(start, "MMM")}</span>
          <span className="text-lg leading-tight font-semibold tabular">{format(start, "d")}</span>
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Link href={`/contests/${contest.id}`} className="truncate text-[15px] font-semibold tracking-tight after:absolute after:inset-0 hover:underline">
              {contest.title}
            </Link>
            <ContestStatusBadge status={status} />
          </div>
          <p className="mt-1 line-clamp-1 text-[13px] text-muted-foreground">{contest.description}</p>
          <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="size-3.5" /> {fmtShortDateTime(contest.startsAt)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-3.5" /> {fmtDuration(contest.durationMinutes)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <FileCode2 className="size-3.5" /> {contest.problemIds.length ? `${contest.problemIds.length} problems` : "Problems TBA"}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Trophy className="size-3.5" /> {contest.scoring.format}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Users className="size-3.5" /> {contest.registeredCount}
            </span>
          </div>
        </div>
      </div>
      <div className="relative z-10 flex items-center justify-between gap-4 border-t border-border pt-3 sm:border-0 sm:pt-0">
        <div className="min-w-24 sm:text-right">
          {phase === "past" ? (
            <YourResult contest={contest} />
          ) : phase === "ongoing" ? (
            <div>
              <p className="text-[11px] text-muted-foreground">Ends in</p>
              <Countdown target={contestEndMs(contest)} className="text-sm font-semibold text-success" />
            </div>
          ) : (
            <div>
              <p className="text-[11px] text-muted-foreground">Starts in</p>
              <Countdown target={contest.startsAt} className="text-sm font-semibold" />
            </div>
          )}
        </div>
        <div className="flex gap-2">
          {phase === "past" && (
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/leaderboard?contest=${contest.id}`} aria-label={`Standings for ${contest.title}`}>
                <Medal />
              </Link>
            </Button>
          )}
          <Button size="sm" variant={action.primary ? "default" : "outline"} asChild>
            <Link href={action.href}>
              {action.label} {action.primary && <ArrowRight />}
            </Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}

export function ContestsView() {
  const now = useNow(30_000);
  const { data, isPending, isError, error, refetch } = useContests();
  const { data: user } = useCurrentUser();
  const [tab, setTab] = useState<ContestPhase | null>(null);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("start-asc");
  const [duration, setDuration] = useState<DurationFilter>("all");
  const [participation, setParticipation] = useState<ParticipationFilter>("all");

  const grouped = useMemo(() => {
    const groups: Record<ContestPhase, Contest[]> = { upcoming: [], ongoing: [], past: [] };
    if (!data || now === null) return groups;
    for (const c of data) {
      const phase = getContestPhase(getContestStatus(c, now));
      if (phase) groups[phase].push(c);
    }
    return groups;
  }, [data, now]);

  const activeTab: ContestPhase = tab ?? (grouped.ongoing.length ? "ongoing" : "upcoming");
  const filtersActive = query !== "" || duration !== "all" || participation !== "all" || sort !== "start-asc";

  // Participation is derived from each past contest's standings.
  const pastStandings = useQueries({
    queries: grouped.past.map((c) => ({ queryKey: qk.standings(c.id), queryFn: () => services.leaderboard.getContestStandings(c.id) })),
  });
  const participatedIds = new Set(
    pastStandings.flatMap((q, i) => (q.data?.rows.some((r) => r.participant.id === user?.id) ? [grouped.past[i].id] : [])),
  );

  const q = query.trim().toLowerCase();
  const visible = grouped[activeTab]
      .filter((c) => activeTab !== "past" || participation === "all" || (participation === "participated") === participatedIds.has(c.id))
      .filter((c) => !q || c.title.toLowerCase().includes(q) || c.description.toLowerCase().includes(q) || c.id.includes(q))
      .filter((c) => duration === "all" || (duration === "short" ? c.durationMinutes <= 120 : c.durationMinutes > 120))
      .sort((a, b) =>
        sort === "duration" ? a.durationMinutes - b.durationMinutes : sort === "start-desc" ? b.startsAt.localeCompare(a.startsAt) : a.startsAt.localeCompare(b.startsAt),
    );

  const clear = () => {
    setQuery("");
    setDuration("all");
    setParticipation("all");
    setSort("start-asc");
  };

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Tabs value={activeTab} onValueChange={(v) => setTab(v as ContestPhase)}>
          <TabsList>
            {(["upcoming", "ongoing", "past"] as const).map((p) => (
              <TabsTrigger key={p} value={p}>
                {PHASE_LABEL[p]}
                <span className="rounded bg-muted px-1 font-mono text-[10px] text-muted-foreground tabular">{grouped[p].length}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-0 flex-1 sm:w-60 sm:flex-none">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search contests" className="h-8 pl-8 text-[13px]" aria-label="Search contests" />
          </div>
          <Select value={duration} onValueChange={(v) => setDuration(v as DurationFilter)}>
            <SelectTrigger size="sm" aria-label="Filter by duration">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any length</SelectItem>
              <SelectItem value="short">Up to 2h</SelectItem>
              <SelectItem value="long">Longer than 2h</SelectItem>
            </SelectContent>
          </Select>
          {activeTab === "past" && (
            <Select value={participation} onValueChange={(v) => setParticipation(v as ParticipationFilter)}>
              <SelectTrigger size="sm" aria-label="Filter by participation">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All rounds</SelectItem>
                <SelectItem value="participated">Participated</SelectItem>
                <SelectItem value="missed">Missed</SelectItem>
              </SelectContent>
            </Select>
          )}
          <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
            <SelectTrigger size="sm" aria-label="Sort contests">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="start-asc">Start time ↑</SelectItem>
              <SelectItem value="start-desc">Start time ↓</SelectItem>
              <SelectItem value="duration">Duration</SelectItem>
            </SelectContent>
          </Select>
          {filtersActive && (
            <Button variant="ghost" size="sm" onClick={clear}>
              <X /> Clear
            </Button>
          )}
        </div>
      </div>

      {isError ? (
        <Card>
          <ErrorState error={error} onRetry={() => refetch()} />
        </Card>
      ) : isPending || now === null ? (
        <div className="grid gap-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <Card>
          <EmptyState
            icon={Trophy}
            title="Nothing here"
            description={EMPTY_MESSAGE[activeTab]}
            action={
              filtersActive ? (
                <Button variant="outline" size="sm" onClick={clear}>
                  Clear filters
                </Button>
              ) : undefined
            }
          />
        </Card>
      ) : (
        <div className="grid gap-3">
          {visible.map((contest) => (
            <ContestRow key={contest.id} contest={contest} now={now} />
          ))}
        </div>
      )}
    </div>
  );
}
