"use client";

import Link from "next/link";
import { CalendarPlus, FilePlus2, Gavel, Megaphone, Radio, Trophy, UserPlus, Users, FileCode2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ContestStatusBadge } from "@/components/ui/status-badges";
import { PageHeader } from "@/components/layout/page-header";
import { SectionCard } from "@/components/dashboard/section-card";
import { StatTile } from "@/components/dashboard/stat-tile";
import { ErrorState, EmptyState } from "@/components/feedback/states";
import { AuditFeed } from "./audit-feed";
import { useAdminContests, useAdminOverview, useAdminUsers } from "@/lib/queries";
import { useNow } from "@/hooks/use-now";
import { getContestStatus } from "@/lib/contests/status";
import { fmtDuration, fmtShortDateTime } from "@/lib/utils/format";

const QUICK_ACTIONS = [
  { href: "/admin/contests/new", label: "New contest", icon: CalendarPlus },
  { href: "/admin/problems/new", label: "New problem", icon: FilePlus2 },
  { href: "/admin/participants?invite=1", label: "Invite member", icon: UserPlus },
  { href: "/admin/announcements?new=1", label: "Post announcement", icon: Megaphone },
];

export function AdminOverview() {
  const now = useNow(30_000);
  const overview = useAdminOverview();
  const users = useAdminUsers();
  const contests = useAdminContests();
  const userMap = new Map(users.data?.map((u) => [u.id, u]));
  const live = now ? contests.data?.find((c) => getContestStatus(c, now) === "ongoing") : undefined;
  const o = overview.data;

  return (
    <>
      <PageHeader
        title="Admin overview"
        description="Run the weekly rounds: contests, problems, tests and members."
        actions={
          <Button asChild>
            <Link href="/admin/contests/new">
              <CalendarPlus /> New contest
            </Link>
          </Button>
        }
      />
      {overview.isError ? (
        <Card>
          <ErrorState error={overview.error} onRetry={() => overview.refetch()} />
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatTile label="Participants" icon={Users} loading={!o} value={o?.activeParticipants ?? 0} hint={o ? `${o.pendingInvitations} invitation${o.pendingInvitations === 1 ? "" : "s"} pending` : undefined} />
            <StatTile label="Active contests" icon={Radio} loading={!o} value={o?.activeContests ?? 0} hint={o ? `${o.upcomingContests.length} upcoming or draft` : undefined} />
            <StatTile label="Problems" icon={FileCode2} loading={!o} value={o?.totalProblems ?? 0} hint="In the problem bank" />
            <StatTile label="Submissions" icon={Gavel} loading={!o} value={o?.totalSubmissions ?? 0} hint={o ? `${o.submissionsToday} today · ${Math.round(o.acceptanceRate * 100)}% accepted` : undefined} />
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-12">
            <div className="grid content-start gap-4 lg:col-span-7">
              {live && (
                <Card className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-success/12 text-success">
                      <Trophy className="size-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-semibold">{live.title} is live</p>
                      <p className="text-xs text-muted-foreground">
                        {live.problemIds.length} problems · {fmtDuration(live.durationMinutes)} · {live.registeredCount} registered
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/leaderboard?contest=${live.id}`}>Live standings</Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/admin/announcements?new=1">Post clarification</Link>
                    </Button>
                  </div>
                </Card>
              )}

              <SectionCard title="Upcoming & draft contests" href="/admin/contests" contentClassName="pb-2">
                {!o ? (
                  <Skeleton className="h-24" />
                ) : o.upcomingContests.length === 0 ? (
                  <EmptyState title="Nothing scheduled" description="Create the next weekly round." className="py-6" />
                ) : (
                  <ul className="divide-y divide-border">
                    {o.upcomingContests.map((c) => (
                      <li key={c.id} className="flex items-center gap-3 py-2.5">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[13px] font-medium">{c.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {fmtShortDateTime(c.startsAt)} · {c.problemIds.length} problems assigned
                          </p>
                        </div>
                        {now && <ContestStatusBadge status={getContestStatus(c, now)} />}
                        <Button variant="ghost" size="xs" asChild>
                          <Link href={`/admin/contests/${c.id}/edit`}>Edit</Link>
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </SectionCard>

              <Card className="p-4">
                <p className="mb-3 text-[13px] font-semibold">Quick actions</p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {QUICK_ACTIONS.map((a) => (
                    <Link
                      key={a.href}
                      href={a.href}
                      className="flex flex-col items-start gap-2 rounded-lg border border-border p-3 text-[13px] font-medium transition-colors hover:border-border-strong hover:bg-accent"
                    >
                      <a.icon className="size-4 text-primary" />
                      {a.label}
                    </Link>
                  ))}
                </div>
              </Card>
            </div>

            <SectionCard title="Recent activity" description="From the audit log" href="/admin/audit-logs" className="lg:col-span-5">
              {o ? <AuditFeed events={o.recentActivity} users={userMap} now={now} /> : <Skeleton className="h-48" />}
            </SectionCard>
          </div>
        </>
      )}
    </>
  );
}
