import type { Metadata } from "next";
import { Suspense } from "react";
import { PageContainer } from "@/components/layout/page-header";
import { ContestDetail, ContestDetailSkeleton } from "@/components/contests/contest-detail";

export const metadata: Metadata = { title: "Contest" };

export default function ContestPage({ params }: PageProps<"/contests/[contestId]">) {
  return (
    <PageContainer>
      <Suspense fallback={<ContestDetailSkeleton />}>{params.then(({ contestId }) => <ContestDetail contestId={contestId} />)}</Suspense>
    </PageContainer>
  );
}
