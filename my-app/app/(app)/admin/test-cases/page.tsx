import type { Metadata } from "next";
import { Suspense } from "react";
import { PageContainer } from "@/components/layout/page-header";
import { TestCaseManager } from "@/components/admin/test-case-manager";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = { title: "Test cases" };

// See app/(app)/admin/layout.tsx.
export const instant = false;

export default function TestCasesPage({ searchParams }: PageProps<"/admin/test-cases">) {
  return (
    <PageContainer>
      <Suspense fallback={<Skeleton className="h-96 rounded-xl" />}>
        {searchParams.then((sp) => (
          <TestCaseManager initialProblemId={typeof sp.problem === "string" ? sp.problem : undefined} />
        ))}
      </Suspense>
    </PageContainer>
  );
}
