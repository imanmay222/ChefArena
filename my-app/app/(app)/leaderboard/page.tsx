import type { Metadata } from "next";
import { Suspense } from "react";
import { PageContainer, PageHeader } from "@/components/layout/page-header";
import { LeaderboardView } from "@/components/leaderboard/leaderboard-view";
import { TableSkeleton } from "@/components/feedback/states";

export const metadata: Metadata = { title: "Leaderboard" };

export default function LeaderboardPage({ searchParams }: PageProps<"/leaderboard">) {
  return (
    <PageContainer>
      <PageHeader title="Leaderboard" description="Live ICPC standings for each round, and the cumulative department season table." />
      <Suspense fallback={<TableSkeleton rows={8} />}>
        {searchParams.then((sp) => {
          const contest = typeof sp.contest === "string" ? sp.contest : undefined;
          const tab = sp.view === "department" ? "department" : "contest";
          return <LeaderboardView initialContestId={contest} initialTab={tab} />;
        })}
      </Suspense>
    </PageContainer>
  );
}
