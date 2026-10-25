"use client";

import Link from "next/link";
import { useState } from "react";
import { CheckCircle2, ChevronLeft, ChevronRight, CircleDot, Lock, Search, X } from "lucide-react";
import type { Difficulty, ProblemListItem, Topic } from "@/types";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Hint } from "@/components/ui/tooltip";
import { DifficultyLabel } from "@/components/ui/status-badges";
import { EmptyState, ErrorState, TableSkeleton } from "@/components/feedback/states";
import { useProblems } from "@/lib/queries";
import { TOPICS, TOPIC_LABEL } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

const PAGE_SIZE = 5;
const DIFF_ORDER: Record<Difficulty, number> = { easy: 0, medium: 1, hard: 2 };
type SortKey = "id" | "difficulty" | "solved" | "points";
type StatusFilter = "all" | "solved" | "unsolved";

function StateIcon({ item }: { item: ProblemListItem }) {
  if (item.locked)
    return (
      <Hint label={item.lockReason}>
        <Lock className="size-4 text-muted-foreground" aria-label="Locked" />
      </Hint>
    );
  if (item.state === "solved") return <CheckCircle2 className="size-4 text-success" aria-label="Solved" />;
  if (item.state === "attempted") return <CircleDot className="size-4 text-warning" aria-label="Attempted" />;
  return <span className="block size-4 rounded-full border border-border" aria-label="Not attempted" />;
}

export function PracticeView() {
  const { data, isPending, isError, error, refetch } = useProblems();
  const [query, setQuery] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty | "all">("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [topics, setTopics] = useState<Topic[]>([]);
  const [sort, setSort] = useState<SortKey>("id");
  const [page, setPage] = useState(0);

  const filtersActive = query !== "" || difficulty !== "all" || status !== "all" || topics.length > 0 || sort !== "id";
  const reset = () => {
    setQuery("");
    setDifficulty("all");
    setStatus("all");
    setTopics([]);
    setSort("id");
    setPage(0);
  };
  const toggleTopic = (t: Topic) => {
    setTopics((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
    setPage(0);
  };

  const q = query.trim().toLowerCase();
  const filtered = (data ?? [])
    .filter(({ problem }) => !q || problem.title.toLowerCase().includes(q) || problem.id.toLowerCase().includes(q))
    .filter(({ problem }) => difficulty === "all" || problem.difficulty === difficulty)
    .filter((item) => status === "all" || (status === "solved" ? item.state === "solved" : item.state !== "solved"))
    .filter(({ problem }) => topics.every((t) => problem.topics.includes(t)))
    .sort((a, b) =>
      sort === "difficulty"
        ? DIFF_ORDER[a.problem.difficulty] - DIFF_ORDER[b.problem.difficulty]
        : sort === "solved"
          ? b.problem.solvedCount - a.problem.solvedCount
          : sort === "points"
            ? b.problem.points - a.problem.points
            : a.problem.id.localeCompare(b.problem.id),
    );
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pages - 1);
  const visible = filtered.slice(current * PAGE_SIZE, current * PAGE_SIZE + PAGE_SIZE);
  const solved = data?.filter((p) => p.state === "solved").length ?? 0;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
      <Card className="min-w-0 overflow-hidden">
        <div className="flex flex-col gap-2 border-b border-border p-4 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="relative min-w-0 flex-1 sm:max-w-64">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(0);
              }}
              placeholder="Search by title or ID"
              className="h-8 pl-8 text-[13px]"
              aria-label="Search problems"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Select
              value={difficulty}
              onValueChange={(v) => {
                setDifficulty(v as Difficulty | "all");
                setPage(0);
              }}
            >
              <SelectTrigger size="sm" aria-label="Difficulty">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All difficulties</SelectItem>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={status}
              onValueChange={(v) => {
                setStatus(v as StatusFilter);
                setPage(0);
              }}
            >
              <SelectTrigger size="sm" aria-label="Status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any status</SelectItem>
                <SelectItem value="solved">Solved</SelectItem>
                <SelectItem value="unsolved">Unsolved</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
              <SelectTrigger size="sm" aria-label="Sort">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="id">Sort: ID</SelectItem>
                <SelectItem value="difficulty">Sort: Difficulty</SelectItem>
                <SelectItem value="solved">Sort: Most solved</SelectItem>
                <SelectItem value="points">Sort: Points</SelectItem>
              </SelectContent>
            </Select>
            {filtersActive && (
              <Button variant="ghost" size="sm" onClick={reset}>
                <X /> Clear
              </Button>
            )}
          </div>
        </div>

        {isError ? (
          <ErrorState error={error} onRetry={() => refetch()} />
        ) : isPending ? (
          <TableSkeleton rows={5} />
        ) : visible.length === 0 ? (
          <EmptyState
            title="No problems match"
            description="Try removing a topic or difficulty filter."
            action={
              <Button variant="outline" size="sm" onClick={reset}>
                Clear filters
              </Button>
            }
          />
        ) : (
          <Table className="min-w-[620px]">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-10" />
                <TableHead className="w-20">ID</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Difficulty</TableHead>
                <TableHead className="hidden md:table-cell">Topics</TableHead>
                <TableHead className="text-right">Solved by</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((item) => {
                const { problem } = item;
                const href = item.locked && problem.contestId ? `/contests/${problem.contestId}/problems/${problem.id}` : `/problems/${problem.id}`;
                return (
                  <TableRow key={problem.id} className="group relative">
                    <TableCell>
                      <StateIcon item={item} />
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{problem.id}</TableCell>
                    <TableCell>
                      <Link href={href} className="font-medium after:absolute after:inset-0 group-hover:text-primary">
                        {problem.title}
                      </Link>
                      {item.contestTitle && (
                        <span className={cn("ml-2 text-xs", item.locked ? "text-success" : "text-muted-foreground")}>
                          {item.locked ? `Live in ${item.contestTitle}` : item.contestTitle}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <DifficultyLabel difficulty={problem.difficulty} />
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex gap-1">
                        {problem.topics.map((t) => (
                          <Badge key={t} variant="outline">
                            {TOPIC_LABEL[t]}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono text-muted-foreground tabular">{problem.solvedCount}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}

        {filtered.length > 0 && (
          <div className="flex items-center justify-between border-t border-border px-4 py-2.5 text-xs text-muted-foreground">
            <span>
              Showing {current * PAGE_SIZE + 1}–{Math.min(filtered.length, (current + 1) * PAGE_SIZE)} of {filtered.length}
            </span>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon-xs" disabled={current === 0} onClick={() => setPage(current - 1)} aria-label="Previous page">
                <ChevronLeft />
              </Button>
              <span className="px-1 tabular">
                {current + 1} / {pages}
              </span>
              <Button variant="ghost" size="icon-xs" disabled={current >= pages - 1} onClick={() => setPage(current + 1)} aria-label="Next page">
                <ChevronRight />
              </Button>
            </div>
          </div>
        )}
      </Card>

      <div className="grid content-start gap-4">
        <Card className="p-4">
          <p className="text-[13px] text-muted-foreground">Archive progress</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight tabular">
            {solved}
            <span className="text-base font-normal text-muted-foreground"> / {data?.length ?? 0}</span>
          </p>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-primary/10">
            <div className="h-full rounded-full bg-primary" style={{ width: `${data?.length ? (solved / data.length) * 100 : 0}%` }} />
          </div>
          <p className="mt-3 text-xs text-muted-foreground">Practice submissions are unofficial and never change contest standings.</p>
        </Card>
        <Card className="p-4">
          <p className="mb-3 text-[13px] font-semibold">Topics</p>
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by topic">
            {TOPICS.map((t) => {
              const active = topics.includes(t);
              return (
                <button
                  key={t}
                  onClick={() => toggleTopic(t)}
                  aria-pressed={active}
                  className={cn(
                    "cursor-pointer rounded-md border px-2 py-1 text-xs transition-colors",
                    active ? "border-primary bg-primary-soft text-foreground" : "border-border text-muted-foreground hover:border-border-strong hover:text-foreground",
                  )}
                >
                  {TOPIC_LABEL[t]}
                </button>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
