"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Crown, Info, Minus, Search } from "lucide-react";
import type { DepartmentRow } from "@/types";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserAvatar } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState, ErrorState, TableSkeleton } from "@/components/feedback/states";
import { useCurrentUser, useDepartmentLeaderboard } from "@/lib/queries";
import { ratingTier } from "@/lib/utils/format";
import { PARTICIPATION_POINTS, PODIUM_BONUS } from "@/lib/scoring/department";
import { cn } from "@/lib/utils/cn";

type SortKey = "points" | "rating" | "solved" | "contests";

function Movement({ row }: { row: DepartmentRow }) {
  const delta = row.previousRank - row.rank;
  if (delta === 0)
    return (
      <span className="inline-flex items-center text-muted-foreground" aria-label="No change">
        <Minus className="size-3" />
      </span>
    );
  return (
    <span className={cn("inline-flex items-center gap-0.5 font-mono text-xs tabular", delta > 0 ? "text-success" : "text-destructive")} aria-label={`${delta > 0 ? "Up" : "Down"} ${Math.abs(delta)}`}>
      {delta > 0 ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />}
      {Math.abs(delta)}
    </span>
  );
}

function Podium({ rows, me }: { rows: DepartmentRow[]; me?: string }) {
  const order = [rows[1], rows[0], rows[2]].filter(Boolean);
  return (
    <div className="mb-4 grid grid-cols-3 items-end gap-2 sm:gap-3">
      {order.map((row) => {
        const first = row.rank === 1;
        return (
          <Card
            key={row.participant.id}
            className={cn(
              "relative flex flex-col items-center overflow-hidden px-2 pt-4 pb-3 text-center sm:px-4",
              first && "border-warning/40 pt-6 pb-4",
              row.participant.id === me && "ring-1 ring-primary/50",
            )}
          >
            {first && <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-warning/12 to-transparent" aria-hidden />}
            <div className="relative">
              {first && <Crown className="absolute -top-4 left-1/2 size-4 -translate-x-1/2 text-warning" aria-hidden />}
              <UserAvatar name={row.participant.name} seed={row.participant.id} size={first ? "lg" : "md"} />
              <span
                className={cn(
                  "absolute -right-1.5 -bottom-1 flex size-5 items-center justify-center rounded-full border-2 border-card font-mono text-[10px] font-bold",
                  first ? "bg-warning text-black" : "bg-muted text-foreground",
                )}
              >
                {row.rank}
              </span>
            </div>
            <p className={cn("mt-2.5 w-full truncate text-[13px] font-semibold", ratingTier(row.rating).className)}>{row.participant.handle}</p>
            <p className="font-mono text-base font-semibold tabular sm:text-lg">{row.points.toLocaleString()}</p>
            <p className="text-[11px] text-muted-foreground">points</p>
          </Card>
        );
      })}
    </div>
  );
}

export function DepartmentLeaderboard() {
  const { data, isPending, isError, error, refetch } = useDepartmentLeaderboard();
  const { data: user } = useCurrentUser();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("points");

  if (isError) return <Card><ErrorState error={error} onRetry={() => refetch()} /></Card>;
  if (isPending) return <Card><TableSkeleton rows={8} /></Card>;

  const q = query.trim().toLowerCase();
  const rows = data
    .filter((r) => !q || r.participant.handle.toLowerCase().includes(q) || r.participant.name.toLowerCase().includes(q))
    .sort((a, b) =>
      sort === "rating" ? b.rating - a.rating : sort === "solved" ? b.problemsSolved - a.problemsSolved : sort === "contests" ? b.contestsAttended - a.contestsAttended : a.rank - b.rank,
    );

  return (
    <div>
      {data.length >= 3 && <Podium rows={data.slice(0, 3)} me={user?.id} />}
      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center">
          <p className="flex items-start gap-1.5 text-xs text-muted-foreground sm:max-w-md">
            <Info className="mt-px size-3.5 shrink-0" />
            Season points: {PARTICIPATION_POINTS} per contest + problem points solved + {PODIUM_BONUS.join("/")} podium bonus. Independent of ICPC penalty.
          </p>
          <div className="flex gap-2 sm:ml-auto">
            <div className="relative min-w-0 flex-1 sm:w-52">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search members" className="h-8 pl-8 text-[13px]" aria-label="Search members" />
            </div>
            <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
              <SelectTrigger size="sm" aria-label="Sort by">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="points">Points</SelectItem>
                <SelectItem value="rating">Rating</SelectItem>
                <SelectItem value="solved">Problems solved</SelectItem>
                <SelectItem value="contests">Contests</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        {rows.length === 0 ? (
          <EmptyState title="No members match" />
        ) : (
          <Table className="min-w-[640px]">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-16">Rank</TableHead>
                <TableHead className="w-12">Δ</TableHead>
                <TableHead>Member</TableHead>
                <TableHead className="text-right">Rating</TableHead>
                <TableHead className="text-right">Solved</TableHead>
                <TableHead className="text-right">Contests</TableHead>
                <TableHead className="text-right">Points</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => {
                const me = r.participant.id === user?.id;
                const tier = ratingTier(r.rating);
                return (
                  <TableRow key={r.participant.id} className={cn(me && "bg-primary-soft hover:bg-primary-soft")}>
                    <TableCell className="font-mono font-semibold tabular">{r.rank}</TableCell>
                    <TableCell>
                      <Movement row={r} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <UserAvatar name={r.participant.name} seed={r.participant.id} size="sm" />
                        <div>
                          <p className={cn("font-medium", tier.className)}>
                            {r.participant.handle}
                            {me && <span className="ml-1.5 text-[11px] font-normal text-primary">(you)</span>}
                          </p>
                          <p className="text-xs text-muted-foreground">{r.participant.name}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={cn("font-mono font-semibold tabular", tier.className)}>{r.rating || "—"}</span>
                      <p className="text-[11px] text-muted-foreground">{tier.label}</p>
                    </TableCell>
                    <TableCell className="text-right font-mono tabular">{r.problemsSolved}</TableCell>
                    <TableCell className="text-right font-mono tabular">{r.contestsAttended}</TableCell>
                    <TableCell className="text-right font-mono font-semibold tabular">{r.points.toLocaleString()}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
