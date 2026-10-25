"use client";

import Link from "next/link";
import { CalendarDays, Code2, GraduationCap, Hash, Trophy, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { UserAvatar } from "@/components/ui/avatar";
import { RoleBadge } from "@/components/ui/status-badges";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ErrorState } from "@/components/feedback/states";
import { SectionCard } from "@/components/dashboard/section-card";
import { StatTile } from "@/components/dashboard/stat-tile";
import { RatingChart } from "@/components/charts/rating-chart";
import { TopicProgress } from "./topic-progress";
import { AchievementList } from "./achievements";
import { DifficultyBreakdown } from "./difficulty-breakdown";
import { useContests, useProfile } from "@/lib/queries";
import { usePreferences } from "@/hooks/use-preferences";
import { fmtDate, ratingTier } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

export function ProfileView() {
  const { data, isPending, isError, error, refetch } = useProfile();
  const [prefs] = usePreferences();
  const contests = useContests();

  if (isError) return <Card><ErrorState error={error} onRetry={() => refetch()} /></Card>;
  if (isPending || !data) {
    return (
      <div className="grid gap-4">
        <Skeleton className="h-36 rounded-xl" />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-72 rounded-xl" />
      </div>
    );
  }

  const { user, stats } = data;
  const tier = ratingTier(user.rating);
  const history = stats.ratingHistory;
  const lastDelta = history.length > 1 ? history[history.length - 1].rating - history[history.length - 2].rating : null;

  return (
    <div className="grid grid-cols-1 gap-4">
      <Card className="relative overflow-hidden">
        <div className="h-20 bg-gradient-to-r from-primary/25 via-brand-2/15 to-transparent" aria-hidden />
        <div className="flex flex-col gap-4 px-5 pb-5 sm:flex-row sm:items-end">
          <UserAvatar name={user.name} seed={user.id} size="xl" className="-mt-10 ring-4 ring-card" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-semibold tracking-tight">{prefs.showRealName ? user.name : user.handle}</h1>
              <RoleBadge role={user.role} />
            </div>
            <p className="mt-0.5 font-mono text-sm text-muted-foreground">@{user.handle}</p>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <GraduationCap className="size-3.5" /> {user.department}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="size-3.5" /> Batch {user.batch} · joined {fmtDate(user.joinedAt)}
              </span>
            </div>
          </div>
          {user.rating > 0 && (
            <div className="sm:text-right">
              <p className="text-xs text-muted-foreground">{tier.label}</p>
              <p className={cn("font-mono text-3xl font-semibold tabular", tier.className)}>{user.rating}</p>
              <p className="text-xs text-muted-foreground">max {user.maxRating}</p>
            </div>
          )}
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Department rank" icon={Hash} value={stats.departmentRank ? `#${stats.departmentRank}` : "—"} hint={stats.departmentRank ? "Season standings" : "Not ranked"} />
        <StatTile label="Rating" icon={TrendingUp} value={user.rating || "—"} delta={lastDelta !== null ? { value: lastDelta, label: "last contest" } : undefined} hint="Unrated" />
        <StatTile label="Problems solved" icon={Code2} value={stats.problemsSolved} hint="Contest + practice" />
        <StatTile label="Contests attended" icon={Trophy} value={stats.contestsAttended} hint="Weekly rounds" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <SectionCard title="Rating history" description={`${history.length} rated contests`} className="lg:col-span-8">
          <RatingChart history={history} height={240} />
        </SectionCard>
        <SectionCard title="Solved by difficulty" className="lg:col-span-4">
          <DifficultyBreakdown stats={stats} />
        </SectionCard>
        <SectionCard title="Topic-wise progress" description="Solved / attempted per topic" className="lg:col-span-5">
          <TopicProgress stats={stats} />
        </SectionCard>
        <SectionCard title="Recent contests" className="lg:col-span-7" contentClassName="px-0 pb-0">
          {history.length ? (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Contest</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Rank</TableHead>
                  <TableHead className="text-right">Rating</TableHead>
                  <TableHead className="text-right">Δ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...history].reverse().map((h, i, arr) => {
                  const prev = arr[i + 1];
                  const delta = prev ? h.rating - prev.rating : null;
                  const linkable = !!contests.data?.some((c) => c.id === h.contestId);
                  return (
                    <TableRow key={h.contestId}>
                      <TableCell className="font-medium">
                        {linkable ? (
                          <Link href={`/contests/${h.contestId}`} className="hover:text-primary">
                            {h.contestTitle}
                          </Link>
                        ) : (
                          h.contestTitle
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{fmtDate(h.date)}</TableCell>
                      <TableCell className="text-right font-mono tabular">#{h.rank}</TableCell>
                      <TableCell className="text-right font-mono tabular">{h.rating}</TableCell>
                      <TableCell className={cn("text-right font-mono tabular", delta === null ? "text-muted-foreground" : delta >= 0 ? "text-success" : "text-destructive")}>
                        {delta === null ? "—" : `${delta >= 0 ? "+" : ""}${delta}`}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <p className="px-5 pb-5 text-[13px] text-muted-foreground">No rated contests yet.</p>
          )}
        </SectionCard>
        <SectionCard title="Achievements" description={`${stats.achievements.filter((a) => a.earnedAt).length} of ${stats.achievements.length} earned`} className="lg:col-span-12">
          <AchievementList achievements={stats.achievements} />
        </SectionCard>
      </div>
    </div>
  );
}
