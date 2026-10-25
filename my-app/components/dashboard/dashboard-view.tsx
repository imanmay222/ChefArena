"use client";

import Link from "next/link";
import { format } from "date-fns";
import { Award, Code2, Hash, Megaphone, Pin, TrendingUp, Trophy } from "lucide-react";
import type { Contest } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ErrorState, EmptyState } from "@/components/feedback/states";
import { RatingChart } from "@/components/charts/rating-chart";
import { TopicProgress } from "@/components/profile/topic-progress";
import { AchievementList } from "@/components/profile/achievements";
import { SubmissionList } from "@/components/submissions/submission-list";
import { useAnnouncements, useContests, useCurrentUser, useProblems, useProfile, useStandings, useSubmissions } from "@/lib/queries";
import { useNow } from "@/hooks/use-now";
import { getContestStatus } from "@/lib/contests/status";
import { fmtDate, fmtRelative, greeting, ratingTier } from "@/lib/utils/format";
import { FeaturedContest } from "./featured-contest";
import { SectionCard } from "./section-card";
import { StatTile } from "./stat-tile";

function Welcome() {
  const now = useNow(60_000);
  const { data: user } = useCurrentUser();
  const { data: contests } = useContests();
  const live = now && contests?.find((c) => getContestStatus(c, now) === "ongoing");

  return (
    <div className="mb-6 flex flex-col gap-1">
      <p className="text-[13px] text-muted-foreground" suppressHydrationWarning>
        {now ? format(now, "EEEE, d MMMM") : " "}
      </p>
      {user && now ? (
        <h1 className="text-xl font-semibold tracking-tight sm:text-[22px]">
          {greeting(new Date(now).getHours())}, {user.name.split(" ")[0]}
          <span className="ml-2 font-mono text-sm font-normal text-muted-foreground">@{user.handle}</span>
        </h1>
      ) : (
        <Skeleton className="h-7 w-64" />
      )}
      <p className="text-sm text-muted-foreground">
        {live ? `${live.shortTitle} is live — every minute counts toward your penalty.` : "Keep the streak alive: one problem a day compounds fast."}
      </p>
    </div>
  );
}

function Stats() {
  const { data, isPending } = useProfile();
  const stats = data?.stats;
  const user = data?.user;
  const history = stats?.ratingHistory ?? [];
  const lastDelta = history.length > 1 ? history[history.length - 1].rating - history[history.length - 2].rating : 0;
  const tier = ratingTier(user?.rating ?? 0);

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <StatTile label="Department rank" icon={Hash} loading={isPending} value={stats?.departmentRank ? `#${stats.departmentRank}` : "—"} hint="Cumulative season points" />
      <StatTile
        label="Rating"
        icon={TrendingUp}
        loading={isPending}
        value={<span className={tier.className}>{user?.rating || "—"}</span>}
        delta={history.length > 1 ? { value: lastDelta, label: "last contest" } : undefined}
        hint={tier.label}
      />
      <StatTile label="Problems solved" icon={Code2} loading={isPending} value={stats?.problemsSolved ?? 0} hint={stats ? `${stats.solvedByDifficulty.hard} hard` : undefined} />
      <StatTile label="Contests attended" icon={Trophy} loading={isPending} value={stats?.contestsAttended ?? 0} hint="Weekly rounds" />
    </div>
  );
}

function RecentContestRow({ contest, live }: { contest: Contest; live: boolean }) {
  const { data: user } = useCurrentUser();
  const { data: standings } = useStandings(contest.id);
  const row = standings?.rows.find((r) => r.participant.id === user?.id);
  return (
    <li>
      <Link href={`/contests/${contest.id}`} className="-mx-2 flex items-center gap-3 rounded-md px-2 py-2.5 transition-colors hover:bg-accent/60">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-surface-2 font-mono text-xs font-semibold text-muted-foreground">
          #{contest.shortTitle.replace(/\D/g, "")}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-medium">{contest.title}</p>
          <p className="text-xs text-muted-foreground">{live ? <span className="font-medium text-success">Live · provisional</span> : fmtDate(contest.startsAt)}</p>
        </div>
        <div className="text-right">
          {standings ? (
            row ? (
              <>
                <p className="font-mono text-[13px] font-semibold tabular">#{row.rank}</p>
                <p className="text-xs text-muted-foreground">
                  {row.solved}/{contest.problemIds.length} solved
                </p>
              </>
            ) : (
              <p className="text-xs text-muted-foreground">Did not participate</p>
            )
          ) : (
            <Skeleton className="h-8 w-14" />
          )}
        </div>
      </Link>
    </li>
  );
}

export function DashboardView() {
  const now = useNow(30_000);
  const contests = useContests();
  const profile = useProfile();
  const submissions = useSubmissions();
  const problems = useProblems();
  const announcements = useAnnouncements();
  const problemMap = new Map(problems.data?.map((p) => [p.problem.id, p.problem]));
  const past = now ? (contests.data ?? []).filter((c) => ["ongoing", "ended", "archived"].includes(getContestStatus(c, now))).reverse() : [];

  return (
    <>
      <Welcome />
      <Stats />

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="lg:col-span-8">
          {contests.isError ? (
            <ErrorState error={contests.error} onRetry={() => contests.refetch()} />
          ) : contests.data && now ? (
            <FeaturedContest contests={contests.data} now={now} />
          ) : (
            <Skeleton className="h-[296px] w-full rounded-xl" />
          )}
        </div>

        <SectionCard title="Announcements" description="From your CP leads" className="lg:col-span-4" contentClassName="pb-3">
          {announcements.data ? (
            announcements.data.length ? (
              <ul className="-mt-1 divide-y divide-border">
                {announcements.data.slice(0, 3).map((a) => (
                  <li key={a.id} className="py-2.5">
                    <div className="flex items-center gap-1.5">
                      {a.pinned && <Pin className="size-3 shrink-0 text-primary" aria-label="Pinned" />}
                      <p className="truncate text-[13px] font-medium">{a.title}</p>
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{a.body}</p>
                    <p className="mt-1 text-[11px] text-muted-foreground/80">{now ? fmtRelative(a.createdAt, now) : ""}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState icon={Megaphone} title="No announcements" className="py-6" />
            )
          ) : (
            <div className="space-y-3">
              <Skeleton className="h-12" />
              <Skeleton className="h-12" />
              <Skeleton className="h-12" />
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="Rating history"
          description="Last six rated contests"
          href="/profile"
          hrefLabel="Profile"
          className="lg:col-span-8"
          action={
            profile.data && profile.data.user.maxRating > 0 ? (
              <Badge variant="outline" className="font-mono">
                max {profile.data.user.maxRating}
              </Badge>
            ) : null
          }
        >
          {profile.data ? <RatingChart history={profile.data.stats.ratingHistory} /> : <Skeleton className="h-[220px] w-full" />}
        </SectionCard>

        <SectionCard title="Recent submissions" href="/submissions" className="lg:col-span-4" contentClassName="pb-2">
          {submissions.data ? (
            submissions.data.length ? (
              <SubmissionList submissions={submissions.data.slice(0, 5)} problems={problemMap} />
            ) : (
              <EmptyState title="No submissions yet" description="Open a problem and hit Submit to see verdicts here." className="py-8" />
            )
          ) : (
            <div className="space-y-2">
              {Array.from({ length: 5 }, (_, i) => (
                <Skeleton key={i} className="h-10" />
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard title="Recent contests" description="Your placement in each round" href="/contests" className="lg:col-span-5" contentClassName="pb-2">
          {contests.data && now ? (
            past.length ? (
              <ul className="divide-y divide-border">
                {past.slice(0, 3).map((c) => (
                  <RecentContestRow key={c.id} contest={c} live={getContestStatus(c, now) === "ongoing"} />
                ))}
              </ul>
            ) : (
              <EmptyState icon={Trophy} title="No completed contests yet" className="py-8" />
            )
          ) : (
            <Skeleton className="h-28" />
          )}
        </SectionCard>

        <SectionCard title="Topic progress" description="Solved vs attempted" className="lg:col-span-4">
          {profile.data ? <TopicProgress stats={profile.data.stats} limit={5} /> : <Skeleton className="h-40" />}
        </SectionCard>

        <SectionCard title="Achievements" href="/profile" className="lg:col-span-3" action={<Award className="size-4 text-muted-foreground" />}>
          {profile.data ? <AchievementList achievements={profile.data.stats.achievements.slice(0, 4)} compact /> : <Skeleton className="h-40" />}
        </SectionCard>
      </div>
    </>
  );
}
