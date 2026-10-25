"use client";

import Link from "next/link";
import { useState } from "react";
import { Archive, ArchiveRestore, CalendarPlus, Eye, MoreHorizontal, Pencil, Rocket, Search } from "lucide-react";
import type { Contest, ContestStatus } from "@/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ContestStatusBadge } from "@/components/ui/status-badges";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState, ErrorState, TableSkeleton } from "@/components/feedback/states";
import { ContestPreviewDialog } from "./contest-preview-dialog";
import { useAdminContests, useSetContestLifecycle } from "@/lib/queries";
import { useNow } from "@/hooks/use-now";
import { CONTEST_STATUS_LABEL, getContestStatus } from "@/lib/contests/status";
import { fmtDuration, fmtRelative, fmtShortDateTime } from "@/lib/utils/format";

export function AdminContests() {
  const now = useNow(30_000);
  const { data, isPending, isError, error, refetch } = useAdminContests();
  const lifecycle = useSetContestLifecycle();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<ContestStatus | "all">("all");
  const [archiving, setArchiving] = useState<Contest | null>(null);
  const [previewing, setPreviewing] = useState<Contest | null>(null);

  const q = query.trim().toLowerCase();
  const rows = (data ?? [])
    .filter((c) => !q || c.title.toLowerCase().includes(q) || c.id.includes(q))
    .filter((c) => status === "all" || (now !== null && getContestStatus(c, now) === status));

  return (
    <>
      <PageHeader
        title="Contests"
        description="Create, schedule, publish and archive weekly rounds."
        actions={
          <Button asChild>
            <Link href="/admin/contests/new">
              <CalendarPlus /> New contest
            </Link>
          </Button>
        }
      />
      <Card className="overflow-hidden">
        <div className="flex flex-col gap-2 border-b border-border p-4 sm:flex-row">
          <div className="relative min-w-0 flex-1 sm:max-w-64">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search contests" className="h-8 pl-8 text-[13px]" aria-label="Search contests" />
          </div>
          <Select value={status} onValueChange={(v) => setStatus(v as ContestStatus | "all")}>
            <SelectTrigger size="sm" aria-label="Status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {(Object.keys(CONTEST_STATUS_LABEL) as ContestStatus[]).map((s) => (
                <SelectItem key={s} value={s}>
                  {CONTEST_STATUS_LABEL[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {isError ? (
          <ErrorState error={error} onRetry={() => refetch()} />
        ) : isPending || now === null ? (
          <TableSkeleton />
        ) : rows.length === 0 ? (
          <EmptyState title="No contests match" />
        ) : (
          <Table className="min-w-[760px]">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Contest</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Starts</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead className="text-right">Problems</TableHead>
                <TableHead>Visibility</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((c) => {
                const s = getContestStatus(c, now);
                return (
                  <TableRow key={c.id}>
                    <TableCell>
                      <Link href={`/admin/contests/${c.id}/edit`} className="font-medium hover:text-primary">
                        {c.title}
                      </Link>
                      <p className="font-mono text-[11px] text-muted-foreground">{c.id}</p>
                    </TableCell>
                    <TableCell>
                      <ContestStatusBadge status={s} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">{fmtShortDateTime(c.startsAt)}</TableCell>
                    <TableCell>{fmtDuration(c.durationMinutes)}</TableCell>
                    <TableCell className="text-right font-mono tabular">{c.problemIds.length}</TableCell>
                    <TableCell className="text-muted-foreground">{c.visibility === "department" ? "Department" : "Invite-only"}</TableCell>
                    <TableCell className="text-muted-foreground">{fmtRelative(c.updatedAt, now)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-xs" aria-label={`Actions for ${c.title}`}>
                            <MoreHorizontal />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/contests/${c.id}/edit`}>
                              <Pencil /> Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => setPreviewing(c)}>
                            <Eye /> Preview
                          </DropdownMenuItem>
                          {c.lifecycle === "draft" && (
                            <DropdownMenuItem
                              onSelect={() => lifecycle.mutate({ id: c.id, lifecycle: "published" })}
                              disabled={c.problemIds.length === 0}
                            >
                              <Rocket /> Publish{c.problemIds.length === 0 ? " (needs problems)" : ""}
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          {c.lifecycle === "archived" ? (
                            <DropdownMenuItem onSelect={() => lifecycle.mutate({ id: c.id, lifecycle: "published" })}>
                              <ArchiveRestore /> Restore
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem destructive onSelect={() => setArchiving(c)}>
                              <Archive /> Archive
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Card>

      <AlertDialog open={!!archiving} onOpenChange={(o) => !o && setArchiving(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive {archiving?.title}?</AlertDialogTitle>
            <AlertDialogDescription>Archived contests stay visible in the past tab and keep their final standings, but cannot be edited until restored.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction destructive onClick={() => archiving && lifecycle.mutate({ id: archiving.id, lifecycle: "archived" })}>
              Archive
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <ContestPreviewDialog contest={previewing} onOpenChange={(o) => !o && setPreviewing(null)} />
    </>
  );
}
