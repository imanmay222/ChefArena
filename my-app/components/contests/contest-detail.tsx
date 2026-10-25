"use client";

import Link from "next/link";
import { ArrowRight, Check, Clock, FileQuestion, Lock, Medal, Megaphone, Pin, ScrollText } from "lucide-react";
import type { Contest } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ContestStatusBadge, DifficultyLabel } from "@/components/ui/status-badges";
import { UserAvatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/feedback/states";
import { Countdown } from "./countdown";
import { useAnnouncements, useContest, useContestProblems, useCurrentUser, useStandings } from "@/lib/queries";
import { useNow } from "@/hooks/use-now";
import { contestEndMs, getContestStatus } from "@/lib/contests/status";
import { fmtDateTime, fmtDuration, fmtRelative } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

export function ContestDetailSkeleton() {
  return (
    <div className="space-y-4" aria-busy>
      <Skeleton className="h-5 w-24" />
      <Skeleton className="h-8 w-80" />
      <Skeleton className="h-4 w-full max-w-xl" />
      <div className="grid gap-4 pt-4 lg:grid-cols-[1fr_340px]">
        <Skeleton className="h-72 rounded-xl" />
        <Skeleton className="h-72 rounded-xl" />
      </div>
    </div>
  );
}

function ProblemsCard({ contest, started }: { contest: Contest; started: boolean }) {
  const { data, isPending } = useContestProblems(contest.id, started);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Problems</CardTitle>
        <span className="text-xs text-muted-foreground">{contest.problemIds.length || "—"} problems</span>
      </CardHeader>
      {!started ? (
        <EmptyState icon={Lock} title="Problems are hidden until the contest starts" description="They will appear here and in the arena the moment the timer hits zero." className="pt-4" />
      ) : isPending ? (
        <div className="space-y-2 px-5 pb-5">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-10" />
          ))}
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-10">#</TableHead>
              <TableHead>Problem</TableHead>
              <TableHead className="hidden sm:table-cell">Difficulty</TableHead>
              <TableHead className="text-right">Points</TableHead>
              <TableHead className="hidden text-right sm:table-cell">Solved by</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.map(({ problem, state }) => (
              <TableRow key={problem.id} className="group relative">
                <TableCell className="font-mono font-semibold text-muted-foreground">{problem.code}</TableCell>
                <TableCell>
                  <Link href={`/contests/${contest.id}/problems/${problem.id}`} className="font-medium after:absolute after:inset-0 group-hover:text-primary">
                    {problem.title}
                  </Link>
                  <span className="ml-2 hidden font-mono text-xs text-muted-foreground md:inline">{problem.id}</span>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <DifficultyLabel difficulty={problem.difficulty} />
                </TableCell>
                <TableCell className="text-right font-mono tabular">{problem.points}</TableCell>
                <TableCell className="hidden text-right font-mono text-muted-foreground tabular sm:table-cell">{problem.solvedCount}</TableCell>
                <TableCell>
                  {state === "solved" ? (
                    <span className="flex size-5 items-center justify-center rounded-full bg-success text-white" aria-label="Solved">
                      <Check className="size-3" strokeWidth={3} />
                    </span>
                  ) : state === "attempted" ? (
                    <span className="block size-2 rounded-full bg-warning" aria-label="Attempted" />
                  ) : null}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Card>
  );
}

function StandingsPreview({ contest }: { contest: Contest }) {
  const { data: user } = useCurrentUser();
  const { data } = useStandings(contest.id);
  if (!data) return <Skeleton className="h-40 rounded-xl" />;
  const me = data.rows.find((r) => r.participant.id === user?.id);
  return (
    <Card>
      <CardHeader>
        <CardTitle>{data.state === "final" ? "Final standings" : "Live standings"}</CardTitle>
        <Link href={`/leaderboard?contest=${contest.id}`} className="text-xs font-medium text-muted-foreground hover:text-foreground">
          Full board
        </Link>
      </CardHeader>
      <CardContent className="pb-4">
        {data.rows.length === 0 ? (
          <p className="text-[13px] text-muted-foreground">No submissions yet.</p>
        ) : (
          <ol className="space-y-1">
            {data.rows.slice(0, 3).map((r) => (
              <li key={r.participant.id} className={cn("flex items-center gap-2.5 rounded-md px-2 py-1.5 text-[13px]", r.participant.id === user?.id && "bg-primary-soft")}>
                <span className={cn("w-5 font-mono text-xs", r.rank === 1 ? "text-warning" : "text-muted-foreground")}>{r.rank}</span>
                <UserAvatar name={r.participant.name} seed={r.participant.id} size="xs" />
                <span className="flex-1 truncate">{r.participant.handle}</span>
                <span className="font-mono text-xs tabular">{r.solved}</span>
                <span className="w-9 text-right font-mono text-xs text-muted-foreground tabular">{r.penalty}</span>
              </li>
            ))}
          </ol>
        )}
        {me && (
          <div className="mt-3 grid grid-cols-3 gap-2 border-t border-border pt-3 text-center">
            <div>
              <p className="text-[11px] text-muted-foreground">Your rank</p>
              <p className="font-mono text-base font-semibold tabular">#{me.rank}</p>
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground">Solved</p>
              <p className="font-mono text-base font-semibold tabular">{me.solved}</p>
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground">Penalty</p>
              <p className="font-mono text-base font-semibold tabular">{me.penalty}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function ContestDetail({ contestId }: { contestId: string }) {
  const now = useNow(1000);
  const { data: contest, isPending } = useContest(contestId);
  const announcements = useAnnouncements(contestId);

  if (isPending || now === null) return <ContestDetailSkeleton />;
  if (!contest) {
    return (
      <Card>
        <EmptyState
          icon={FileQuestion}
          title="Contest not found"
          description="It may have been removed or isn't published yet."
          action={
            <Button variant="outline" size="sm" asChild>
              <Link href="/contests">Back to contests</Link>
            </Button>
          }
        />
      </Card>
    );
  }

  const status = getContestStatus(contest, now);
  const started = ["ongoing", "ended", "archived"].includes(status);
  const live = status === "ongoing";
  const firstProblem = contest.problemIds[0];

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <div className="mb-2 flex items-center gap-2">
            <ContestStatusBadge status={status} />
            <span className="text-xs text-muted-foreground">
              {contest.scoring.format} · {contest.visibility === "department" ? "Department" : "Invite-only"}
            </span>
          </div>
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">{contest.title}</h1>
          <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">{contest.description}</p>
        </div>
        <div className="flex shrink-0 gap-2">
          {started && (
            <Button variant="outline" asChild>
              <Link href={`/leaderboard?contest=${contest.id}`}>
                <Medal /> Standings
              </Link>
            </Button>
          )}
          {started && firstProblem && (
            <Button asChild>
              <Link href={`/contests/${contest.id}/problems/${firstProblem}`}>
                {live ? "Enter arena" : "Upsolve"} <ArrowRight />
              </Link>
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="grid min-w-0 content-start gap-4">
          <ProblemsCard contest={contest} started={started} />

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ScrollText className="size-4 text-muted-foreground" /> Rules
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-2.5">
                {contest.rules.map((rule, i) => (
                  <li key={i} className="flex gap-3 text-[13px] leading-relaxed">
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-surface-2 font-mono text-[10px] text-muted-foreground">{i + 1}</span>
                    {rule}
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Megaphone className="size-4 text-muted-foreground" /> Announcements
              </CardTitle>
            </CardHeader>
            <CardContent>
              {announcements.data?.length ? (
                <ul className="space-y-3">
                  {announcements.data.map((a) => (
                    <li key={a.id} className="rounded-lg border border-border p-3">
                      <div className="flex items-center gap-2">
                        {a.pinned && <Pin className="size-3 text-primary" aria-label="Pinned" />}
                        <p className="text-[13px] font-medium">{a.title}</p>
                        <span className="ml-auto text-[11px] text-muted-foreground">{fmtRelative(a.createdAt, now)}</span>
                      </div>
                      <p className="mt-1 text-[13px] text-muted-foreground">{a.body}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[13px] text-muted-foreground">{announcements.isPending ? "Loading…" : "No announcements for this contest yet."}</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid content-start gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="size-4 text-muted-foreground" /> Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!started || live ? (
                <div className="mb-4 rounded-lg border border-border bg-surface-2/50 p-3">
                  <p className="mb-2 text-xs text-muted-foreground">{live ? "Ends in" : "Starts in"}</p>
                  <Countdown target={live ? contestEndMs(contest) : contest.startsAt} variant="blocks" />
                </div>
              ) : null}
              <dl className="grid gap-2.5 text-[13px]">
                {[
                  ["Starts", fmtDateTime(contest.startsAt)],
                  ["Ends", fmtDateTime(new Date(contestEndMs(contest)).toISOString())],
                  ["Duration", fmtDuration(contest.durationMinutes)],
                  ["Penalty", `${contest.scoring.penaltyMinutes} min per rejected attempt`],
                  ["Compilation errors", contest.scoring.penalizeCompilationError ? "Penalised" : "Not penalised"],
                  ["Registered", `${contest.registeredCount} members`],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">{k}</dt>
                    <dd className="text-right">{v}</dd>
                  </div>
                ))}
              </dl>
            </CardContent>
          </Card>
          {started && <StandingsPreview contest={contest} />}
        </div>
      </div>
    </div>
  );
}
