"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, Code2, Search, X } from "lucide-react";
import type { Contest, Language, Problem, Submission, UserSummary, Verdict } from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { VerdictBadge } from "@/components/ui/status-badges";
import { EmptyState, TableSkeleton } from "@/components/feedback/states";
import { SourceDialog } from "./source-dialog";
import { LANGUAGES, LANGUAGE_ORDER } from "@/lib/editor/languages";
import { VERDICT_META, fmtDateTime, fmtMemory, fmtRuntime } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

const PAGE_SIZE = 8;
type SortKey = "createdAt" | "timeMs" | "memoryKb";

type SortState = { key: SortKey; dir: "asc" | "desc" };

function SortHead({ k, label, className, sort, onSort }: { k: SortKey; label: string; className?: string; sort: SortState; onSort: (s: SortState) => void }) {
  return (
    <TableHead className={className} aria-sort={sort.key === k ? (sort.dir === "asc" ? "ascending" : "descending") : "none"}>
      <button
        className="inline-flex cursor-pointer items-center gap-1 uppercase hover:text-foreground"
        onClick={() => onSort({ key: k, dir: sort.key === k && sort.dir === "desc" ? "asc" : "desc" })}
      >
        {label}
        {sort.key === k && (sort.dir === "asc" ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />)}
      </button>
    </TableHead>
  );
}

export interface SubmissionsTableProps {
  submissions: Submission[] | undefined;
  loading: boolean;
  problems: Map<string, Problem>;
  contests: Map<string, Contest>;
  /** Admin view: show the participant column and enable search by handle. */
  users?: Map<string, UserSummary>;
  rowActions?: (s: Submission) => React.ReactNode;
}

export function SubmissionsTable({ submissions, loading, problems, contests, users, rowActions }: SubmissionsTableProps) {
  const [query, setQuery] = useState("");
  const [verdict, setVerdict] = useState<Verdict | "all">("all");
  const [language, setLanguage] = useState<Language | "all">("all");
  const [contest, setContest] = useState<string>("all");
  const [sort, setSort] = useState<SortState>({ key: "createdAt", dir: "desc" });
  const [page, setPage] = useState(0);
  const [viewing, setViewing] = useState<Submission | null>(null);

  const filtersActive = query !== "" || verdict !== "all" || language !== "all" || contest !== "all";
  const reset = () => {
    setQuery("");
    setVerdict("all");
    setLanguage("all");
    setContest("all");
    setPage(0);
  };
  const q = query.trim().toLowerCase();
  const filtered = (submissions ?? [])
    .filter((s) => {
      if (!q) return true;
      const p = problems.get(s.problemId);
      const u = users?.get(s.userId);
      return [s.id, s.problemId, p?.title, u?.handle, u?.name].some((v) => v?.toLowerCase().includes(q));
    })
    .filter((s) => verdict === "all" || s.verdict === verdict)
    .filter((s) => language === "all" || s.language === language)
    .filter((s) => contest === "all" || (contest === "practice" ? s.kind === "practice" : s.contestId === contest && s.kind === "contest"))
    .sort((a, b) => {
      const dir = sort.dir === "asc" ? 1 : -1;
      if (sort.key === "createdAt") return a.createdAt.localeCompare(b.createdAt) * dir;
      return ((a[sort.key] ?? -1) - (b[sort.key] ?? -1)) * dir;
    });
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pages - 1);
  const visible = filtered.slice(current * PAGE_SIZE, (current + 1) * PAGE_SIZE);


  const set = <T,>(setter: (v: T) => void) => (v: T) => {
    setter(v);
    setPage(0);
  };

  return (
    <>
      <div className="flex flex-col gap-2 border-b border-border p-4 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative min-w-0 flex-1 sm:max-w-64">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => set(setQuery)(e.target.value)}
            placeholder={users ? "Search ID, problem or member" : "Search ID or problem"}
            className="h-8 pl-8 text-[13px]"
            aria-label="Search submissions"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={verdict} onValueChange={(v) => set(setVerdict)(v as Verdict | "all")}>
            <SelectTrigger size="sm" aria-label="Verdict">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All verdicts</SelectItem>
              {(Object.keys(VERDICT_META) as Verdict[]).map((v) => (
                <SelectItem key={v} value={v}>
                  {VERDICT_META[v].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={language} onValueChange={(v) => set(setLanguage)(v as Language | "all")}>
            <SelectTrigger size="sm" aria-label="Language">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All languages</SelectItem>
              {LANGUAGE_ORDER.map((l) => (
                <SelectItem key={l} value={l}>
                  {LANGUAGES[l].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={contest} onValueChange={set(setContest)}>
            <SelectTrigger size="sm" aria-label="Contest">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All contests</SelectItem>
              <SelectItem value="practice">Practice only</SelectItem>
              {[...contests.values()].map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.shortTitle}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {filtersActive && (
            <Button variant="ghost" size="sm" onClick={reset}>
              <X /> Clear
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <TableSkeleton rows={8} />
      ) : visible.length === 0 ? (
        <EmptyState
          icon={Code2}
          title={submissions?.length ? "No submissions match" : "No submissions yet"}
          description={submissions?.length ? "Adjust the filters to see more." : "Your submissions from contests and practice will appear here."}
          action={
            filtersActive ? (
              <Button variant="outline" size="sm" onClick={reset}>
                Clear filters
              </Button>
            ) : undefined
          }
        />
      ) : (
        <Table className="min-w-[860px]">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>ID</TableHead>
              <SortHead k="createdAt" label="Submitted" sort={sort} onSort={setSort} />
              {users && <TableHead>Member</TableHead>}
              <TableHead>Problem</TableHead>
              <TableHead>Contest</TableHead>
              <TableHead>Lang</TableHead>
              <TableHead>Verdict</TableHead>
              <SortHead k="timeMs" label="Time" className="text-right" sort={sort} onSort={setSort} />
              <SortHead k="memoryKb" label="Memory" className="text-right" sort={sort} onSort={setSort} />
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.map((s) => {
              const p = problems.get(s.problemId);
              const c = s.contestId ? contests.get(s.contestId) : undefined;
              const u = users?.get(s.userId);
              return (
                <TableRow key={s.id}>
                  <TableCell className="font-mono text-xs">{s.id}</TableCell>
                  <TableCell className="text-muted-foreground">{fmtDateTime(s.createdAt)}</TableCell>
                  {users && <TableCell className="font-medium">{u?.handle ?? s.userId}</TableCell>}
                  <TableCell>
                    <span className="mr-1.5 font-mono text-xs text-muted-foreground">{s.problemId}</span>
                    {p?.title}
                  </TableCell>
                  <TableCell>
                    {s.kind === "practice" ? (
                      <Badge variant="outline">Practice</Badge>
                    ) : (
                      <span className="text-muted-foreground">{c?.shortTitle ?? s.contestId}</span>
                    )}
                  </TableCell>
                  <TableCell>{LANGUAGES[s.language].label}</TableCell>
                  <TableCell>
                    <VerdictBadge verdict={s.verdict} status={s.status} />
                  </TableCell>
                  <TableCell className={cn("text-right font-mono tabular", s.verdict === "time_limit_exceeded" && "text-warning")}>{fmtRuntime(s.timeMs)}</TableCell>
                  <TableCell className={cn("text-right font-mono tabular", s.verdict === "memory_limit_exceeded" && "text-warning")}>{fmtMemory(s.memoryKb)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="xs" onClick={() => setViewing(s)}>
                        <Code2 /> Source
                      </Button>
                      {rowActions?.(s)}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

      {filtered.length > 0 && (
        <div className="flex items-center justify-between border-t border-border px-4 py-2.5 text-xs text-muted-foreground">
          <span>
            {current * PAGE_SIZE + 1}–{Math.min(filtered.length, (current + 1) * PAGE_SIZE)} of {filtered.length} submissions
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
      <SourceDialog submission={viewing} problemTitle={viewing ? problems.get(viewing.problemId)?.title : undefined} onOpenChange={(o) => !o && setViewing(null)} />
    </>
  );
}
