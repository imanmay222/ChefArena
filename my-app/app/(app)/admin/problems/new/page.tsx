import type { Metadata } from "next";
import { PageContainer } from "@/components/layout/page-header";
import { ProblemFormPage } from "@/components/admin/problem-form";

export const metadata: Metadata = { title: "New problem" };

// See app/(app)/admin/layout.tsx.
export const instant = false;

export default function NewProblemPage() {
  return (
    <PageContainer wide>
      <ProblemFormPage />
    </PageContainer>
  );
}
