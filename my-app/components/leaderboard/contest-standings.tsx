"use client";

import { useState } from "react";
import { ArrowDownUp, Info, RefreshCw, Search, Star, X } from "lucide-react";
import type { ContestStandings, ProblemResult, StandingRow } from "@/types";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { UserAvatar } from "@/components/ui/avatar";
import { EmptyState, ErrorState, TableSkeleton } from "@/components/feedback/states";
import { useContests, useCurrentUser, useStandings } from "@/lib/queries";
import { useNow } from "@/hooks/use-now";
import { getContestStatus } from "@/lib/contests/status";
import { fmtClock, fmtTime, ratingTier } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

type SortKey = "rank" | "handle" | "penalty";

function Cell({ result }: { result: ProblemResult }) {
  if (result.solved) {
    return (
      <div
        className={cn(
          "mx-auto flex h-10 w-[68px] flex-col items-center justify-center rounded-md leading-tight",
          result.firstToSolve ? "bg-success/25 ring-1 ring-success/50" : "bg-success/12",
        )}
        title={result.firstToSolve ? "First to solve" : undefined}
      >
        <span className="flex items-center gap-0.5 font-mono text-[13px] font-semibold text-success">
          {result.firstToSolve && <Star className="size-2.5 fill-current" aria-label="First to solve" />}+{result.rejectedAttempts || ""}
        </span>
        <span className="font-mono text-[10px] text-muted-foreground">{fmtClock(result.solvedAtMinute ?? 0)}</span>
      </div>
    );
  }
  if (result.pending) {
    return <div className="mx-auto flex h-10 w-[68px] items-center justify-center rounded-md bg-info/10 font-mono text-[13px] text-info">?</div>;
  }
  if (result.acceptedAfterDeadline) {
    return (
      <div className="mx-auto flex h-10 w-[68px] flex-col items-center justify-center rounded-md border border-dashed border-border leading-tight" title="Accepted after the deadline — not counted">
        <span className="font-mono text-[12px] text-muted-foreground">{result.rejectedAttempts ? `-${result.rejectedAttempts}` : "·"}</span>
        <span className="text-[10px] text-muted-foreground">late AC</span>
      </div>
    );
  }
  if (result.rejectedAttempts > 0) {
    return <div className="mx-auto flex h-10 w-[68px] items-center justify-center rounded-md bg-destructive/10 font-mono text-[13px] font-semibold text-destructive">-{result.rejectedAttempts}</div>;
  }
  return <div className="mx-auto h-10 w-[68px]" aria-label="No attempts" />;
}

function RulesPopover({ penalty }: { penalty: number }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm">
          <Info /> How ranking works
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 text-[13px]">
        <p className="mb-2 font-semibold">ICPC scoring</p>
        <ol className="list-decimal space-y-1.5 pl-4 text-muted-foreground">
          <li>More problems solved ranks higher.</li>
          <li>Ties are broken by lower total penalty.</li>
          <li>Each solved problem adds the minute of its first accepted run…</li>
          <li>…plus {penalty} minutes per rejected attempt before it. Compilation errors are free.</li>
          <li>Attempts after a problem is solved, and anything after the deadline, never count.</li>
          <li>Still tied? Earlier last accepted time wins; full ties share a rank.</li>
        </ol>
      </PopoverContent>
    </Popover>
  );
}

function StandingsTable({ standings, problemCodes, query, sort, onlySolvers }: { standings: ContestStandings; problemCodes: Record<string, string>; query: string; sort: SortKey; onlySolvers: boolean }) {
  const { data: user } = useCurrentUser();
  const q = query.trim().toLowerCase();
  const rows = standings.rows
    .filter((r) => !q || r.participant.handle.toLowerCase().includes(q) || r.participant.name.toLowerCase().includes(q))
    .filter((r) => !onlySolvers || r.solved > 0)
    .sort((a: StandingRow, b: StandingRow) => (sort === "handle" ? a.participant.handle.localeCompare(b.participant.handle) : sort === "penalty" ? a.penalty - b.penalty : 0));

  if (!rows.length) return <EmptyState title="No participants match" description="Try a different handle or clear the filters." />;

  return (
    <div className="overflow-x-auto scrollbar-thin">
      <table className="w-full min-w-[560px] border-collapse text-[13px]">
        <thead>
          <tr className="border-b border-border text-[11px] tracking-wide text-muted-foreground uppercase">
            <th className="sticky left-0 z-10 h-9 w-14 bg-card pl-5 text-left font-medium">Rank</th>
            <th className="sticky left-14 z-10 bg-card px-3 text-left font-medium">Participant</th>
            <th className="w-16 px-2 text-center font-medium">Solved</th>
            <th className="w-20 px-2 text-center font-medium">Penalty</th>
            {standings.problemIds.map((id) => (
              <th key={id} className="w-20 px-1 text-center font-medium" title={id}>
                <span className="font-mono text-xs text-foreground">{problemCodes[id] ?? id}</span>
              </th>
            ))}
            <th className="w-3 pr-5" />
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const me = row.participant.id === user?.id;
            return (
              <tr key={row.participant.id} className={cn("border-b border-border last:border-0", me ? "bg-[color-mix(in_oklab,var(--card),var(--primary)_12%)]" : "hover:bg-accent/40")} aria-current={me ? "true" : undefined}>
                <td className={cn("sticky left-0 z-10 py-1.5 pl-5", me ? "bg-[color-mix(in_oklab,var(--card),var(--primary)_12%)]" : "bg-card")}>
                  {me && <span className="absolute inset-y-0 left-0 w-[3px] bg-primary" aria-hidden />}
                  <span className={cn("font-mono font-semibold tabular", row.rank === 1 ? "text-warning" : row.rank <= 3 ? "text-foreground" : "text-muted-foreground")}>{row.rank}</span>
                </td>
                <td className={cn("sticky left-14 z-10 px-3 py-1.5", me ? "bg-[color-mix(in_oklab,var(--card),var(--primary)_12%)]" : "bg-card")}>
                  <div className="flex min-w-0 items-center gap-2.5">
                    <UserAvatar name={row.participant.name} seed={row.participant.id} size="sm" />
                    <div className="min-w-0">
                      <p className={cn("truncate font-medium", ratingTier(row.participant.rating).className)}>
                        {row.participant.handle}
                        {me && <span className="ml-1.5 text-[11px] font-normal text-primary">(you)</span>}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">{row.participant.name}</p>
                    </div>
                  </div>
                </td>
                <td className="px-2 text-center font-mono text-sm font-semibold tabular">{row.solved}</td>
                <td className="px-2 text-center font-mono text-muted-foreground tabular">{row.penalty}</td>
                {standings.problemIds.map((id) => (
                  <td key={id} className="px-1 py-1.5">
                    <Cell result={row.results[id]} />
                  </td>
                ))}
                <td className="pr-5" />
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function ContestStandingsView({ initialContestId }: { initialContestId?: string }) {
  const now = useNow(1000);
  const contests = useContests();
  const started = now === null ? [] : (contests.data ?? []).filter((c) => ["ongoing", "ended", "archived"].includes(getContestStatus(c, now))).reverse();
  const [selected, setSelected] = useState<string | null>(initialContestId ?? null);
  const contestId = selected && started.some((c) => c.id === selected) ? selected : started[0]?.id ?? "";
  const contest = started.find((c) => c.id === contestId);
  const live = !!contest && now !== null && getContestStatus(contest, now) === "ongoing";
  const standings = useStandings(contestId, live);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("rank");
  const [onlySolvers, setOnlySolvers] = useState(false);
  const problemCodes = Object.fromEntries((contest?.problemIds ?? []).map((id, i) => [id, String.fromCharCode(65 + i)]));
  const filtersActive = query !== "" || sort !== "rank" || onlySolvers;

  if (contests.isPending || now === null) return <TableSkeleton rows={8} />;
  if (!started.length) {
    return (
      <Card>
        <EmptyState title="No contests have started yet" description="Standings appear as soon as the first round begins." />
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-border p-4 lg:flex-row lg:items-center">
        <div className="flex flex-wrap items-center gap-2">
          <Select value={contestId} onValueChange={setSelected}>
            <SelectTrigger size="sm" className="min-w-48" aria-label="Contest">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {started.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {standings.data &&
            (standings.data.state === "provisional" ? (
              <Badge variant="success">
                <span className="relative flex size-1.5">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-60" />
                  <span className="relative inline-flex size-1.5 rounded-full bg-success" />
                </span>
                Provisional · live
              </Badge>
            ) : (
              <Badge variant="neutral">Final</Badge>
            ))}
          {standings.data && (
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
              {standings.isFetching ? <RefreshCw className="size-3 animate-spin" /> : null}
              Updated {fmtTime(standings.data.generatedAt)}
              {live && " · refreshes every 15s"}
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2 lg:ml-auto">
          <div className="relative min-w-0 flex-1 sm:w-52 sm:flex-none">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search participants" className="h-8 pl-8 text-[13px]" aria-label="Search participants" />
          </div>
          <Select value={onlySolvers ? "solvers" : "all"} onValueChange={(v) => setOnlySolvers(v === "solvers")}>
            <SelectTrigger size="sm" aria-label="Filter participants">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Everyone</SelectItem>
              <SelectItem value="solvers">Solved ≥ 1</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
            <SelectTrigger size="sm" aria-label="Sort">
              <ArrowDownUp className="size-3.5" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rank">Rank</SelectItem>
              <SelectItem value="penalty">Penalty</SelectItem>
              <SelectItem value="handle">Handle</SelectItem>
            </SelectContent>
          </Select>
          {filtersActive && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setQuery("");
                setSort("rank");
                setOnlySolvers(false);
              }}
            >
              <X /> Clear
            </Button>
          )}
          <RulesPopover penalty={contest?.scoring.penaltyMinutes ?? 20} />
        </div>
      </div>

      {standings.isError ? (
        <ErrorState error={standings.error} onRetry={() => standings.refetch()} />
      ) : standings.data ? (
        <StandingsTable standings={standings.data} problemCodes={problemCodes} query={query} sort={sort} onlySolvers={onlySolvers} />
      ) : (
        <TableSkeleton rows={8} />
      )}

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-border px-5 py-3 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="inline-block size-3 rounded-sm bg-success/25 ring-1 ring-success/50" /> First to solve
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block size-3 rounded-sm bg-success/12" /> +n solved after n rejections · time of AC
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block size-3 rounded-sm bg-destructive/10" /> -n rejected, unsolved
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block size-3 rounded-sm border border-dashed border-border" /> Accepted after deadline (not counted)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block size-3 rounded-sm bg-info/10" /> Pending judgement
        </span>
      </div>
    </Card>
  );
}
