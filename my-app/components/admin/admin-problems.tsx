"use client";

import Link from "next/link";
import { useState } from "react";
import { FilePlus2, FlaskConical, Pencil, Search } from "lucide-react";
import type { Difficulty } from "@/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DifficultyLabel } from "@/components/ui/status-badges";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState, ErrorState, TableSkeleton } from "@/components/feedback/states";
import { useAdminProblems } from "@/lib/queries";

export function AdminProblems() {
  const { data, isPending, isError, error, refetch } = useAdminProblems();
  const [query, setQuery] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty | "all">("all");
  const q = query.trim().toLowerCase();
  const rows = (data ?? [])
    .filter((p) => !q || p.title.toLowerCase().includes(q) || p.id.toLowerCase().includes(q))
    .filter((p) => difficulty === "all" || p.difficulty === difficulty);

  return (
    <>
      <PageHeader
        title="Problem bank"
        description="Statements, limits, test data and reference solutions."
        actions={
          <Button asChild>
            <Link href="/admin/problems/new">
              <FilePlus2 /> New problem
            </Link>
          </Button>
        }
      />
      <Card className="overflow-hidden">
        <div className="flex flex-col gap-2 border-b border-border p-4 sm:flex-row">
          <div className="relative min-w-0 flex-1 sm:max-w-64">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search problems" className="h-8 pl-8 text-[13px]" aria-label="Search problems" />
          </div>
          <Select value={difficulty} onValueChange={(v) => setDifficulty(v as Difficulty | "all")}>
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
        </div>
        {isError ? (
          <ErrorState error={error} onRetry={() => refetch()} />
        ) : isPending ? (
          <TableSkeleton />
        ) : rows.length === 0 ? (
          <EmptyState title="No problems match" />
        ) : (
          <Table className="min-w-[760px]">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>ID</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Difficulty</TableHead>
                <TableHead className="text-right">Points</TableHead>
                <TableHead>Contest</TableHead>
                <TableHead className="text-right">Tests</TableHead>
                <TableHead className="text-right">Solved</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((p) => {
                const hidden = p.testCases.filter((t) => t.kind === "hidden").length;
                return (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono text-xs">{p.id}</TableCell>
                    <TableCell className="font-medium">{p.title}</TableCell>
                    <TableCell>
                      <DifficultyLabel difficulty={p.difficulty} />
                    </TableCell>
                    <TableCell className="text-right font-mono tabular">{p.points}</TableCell>
                    <TableCell className="text-muted-foreground">{p.contestId ? `${p.contestId}${p.code ? ` · ${p.code}` : ""}` : "—"}</TableCell>
                    <TableCell className="text-right font-mono text-xs tabular">
                      {p.testCases.length - hidden} + <span className="text-muted-foreground">{hidden} hidden</span>
                    </TableCell>
                    <TableCell className="text-right font-mono tabular">{p.solvedCount}</TableCell>
                    <TableCell>{p.published ? <Badge variant="success">Published</Badge> : <Badge variant="neutral">Draft</Badge>}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="xs" asChild>
                          <Link href={`/admin/test-cases?problem=${p.id}`}>
                            <FlaskConical /> Tests
                          </Link>
                        </Button>
                        <Button variant="ghost" size="xs" asChild>
                          <Link href={`/admin/problems/${p.id}/edit`}>
                            <Pencil /> Edit
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Card>
    </>
  );
}
