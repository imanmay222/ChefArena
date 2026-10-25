import type { Metadata } from "next";
import { PageContainer } from "@/components/layout/page-header";
import { AdminProblems } from "@/components/admin/admin-problems";

export const metadata: Metadata = { title: "Problem bank" };

// See app/(app)/admin/layout.tsx.
export const instant = false;

export default function AdminProblemsPage() {
  return (
    <PageContainer>
      <AdminProblems />
    </PageContainer>
  );
}
