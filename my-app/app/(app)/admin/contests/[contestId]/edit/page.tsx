import type { Metadata } from "next";
import { Suspense } from "react";
import { PageContainer } from "@/components/layout/page-header";
import { ContestFormPage } from "@/components/admin/contest-form";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = { title: "Edit contest" };

// See app/(app)/admin/layout.tsx.
export const instant = false;

export default function EditContestPage({ params }: PageProps<"/admin/contests/[contestId]/edit">) {
  return (
    <PageContainer>
      <Suspense fallback={<Skeleton className="h-[600px] rounded-xl" />}>{params.then(({ contestId }) => <ContestFormPage contestId={contestId} />)}</Suspense>
    </PageContainer>
  );
}
