import type { Metadata } from "next";
import { Suspense } from "react";
import { PageContainer } from "@/components/layout/page-header";
import { ProblemFormPage } from "@/components/admin/problem-form";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = { title: "Edit problem" };

// See app/(app)/admin/layout.tsx.
export const instant = false;

export default function EditProblemPage({ params }: PageProps<"/admin/problems/[problemId]/edit">) {
  return (
    <PageContainer wide>
      <Suspense fallback={<Skeleton className="h-[640px] rounded-xl" />}>{params.then(({ problemId }) => <ProblemFormPage problemId={problemId} />)}</Suspense>
    </PageContainer>
  );
}
