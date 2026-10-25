"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import type { AuditEvent } from "@/types";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState, ErrorState, TableSkeleton } from "@/components/feedback/states";
import { AUDIT_LABEL } from "./audit-feed";
import { useAdminUsers, useAuditLogs } from "@/lib/queries";
import { fmtDateTime } from "@/lib/utils/format";

const TARGETS: AuditEvent["targetType"][] = ["contest", "problem", "testcase", "user", "submission", "announcement"];

export function AuditLogs() {
  const { data, isPending, isError, error, refetch } = useAuditLogs();
  const users = useAdminUsers();
  const [query, setQuery] = useState("");
  const [target, setTarget] = useState<AuditEvent["targetType"] | "all">("all");
  const [actor, setActor] = useState("all");
  const userMap = new Map(users.data?.map((u) => [u.id, u]));
  const actors = [...new Set((data ?? []).map((e) => e.actorId))];
  const q = query.trim().toLowerCase();
  const rows = (data ?? [])
    .filter((e) => target === "all" || e.targetType === target)
    .filter((e) => actor === "all" || e.actorId === actor)
    .filter((e) => !q || e.targetLabel.toLowerCase().includes(q) || e.action.includes(q) || (e.detail ?? "").toLowerCase().includes(q));

  return (
    <>
      <PageHeader title="Audit log" description="Every administrative change, newest first. Retained by the backend in production." />
      <Card className="overflow-hidden">
        <div className="flex flex-col gap-2 border-b border-border p-4 sm:flex-row">
          <div className="relative min-w-0 flex-1 sm:max-w-64">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search target or detail" className="h-8 pl-8 text-[13px]" aria-label="Search audit log" />
          </div>
          <div className="flex gap-2">
            <Select value={target} onValueChange={(v) => setTarget(v as AuditEvent["targetType"] | "all")}>
              <SelectTrigger size="sm" aria-label="Target type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All targets</SelectItem>
                {TARGETS.map((t) => (
                  <SelectItem key={t} value={t} className="capitalize">
                    {t === "testcase" ? "Test cases" : `${t[0].toUpperCase()}${t.slice(1)}s`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={actor} onValueChange={setActor}>
              <SelectTrigger size="sm" aria-label="Actor">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All actors</SelectItem>
                {actors.map((a) => (
                  <SelectItem key={a} value={a}>
                    {userMap.get(a)?.handle ?? a}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        {isError ? (
          <ErrorState error={error} onRetry={() => refetch()} />
        ) : isPending ? (
          <TableSkeleton />
        ) : rows.length === 0 ? (
          <EmptyState title="No events match" />
        ) : (
          <Table className="min-w-[760px]">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Timestamp</TableHead>
                <TableHead>Actor</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Detail</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((e) => {
                const u = userMap.get(e.actorId);
                return (
                  <TableRow key={e.id}>
                    <TableCell className="font-mono text-xs text-muted-foreground">{fmtDateTime(e.createdAt)}</TableCell>
                    <TableCell>
                      <span className="flex items-center gap-2">
                        <UserAvatar name={u?.name ?? e.actorId} seed={e.actorId} size="xs" />
                        {u?.handle ?? e.actorId}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono">
                        {e.action}
                      </Badge>
                      <span className="ml-2 hidden text-xs text-muted-foreground xl:inline">{AUDIT_LABEL[e.action]}</span>
                    </TableCell>
                    <TableCell className="font-medium">{e.targetLabel}</TableCell>
                    <TableCell className="text-muted-foreground">{e.detail ?? "—"}</TableCell>
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
