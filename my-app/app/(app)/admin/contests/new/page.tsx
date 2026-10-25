import type { Metadata } from "next";
import { PageContainer } from "@/components/layout/page-header";
import { ContestFormPage } from "@/components/admin/contest-form";

export const metadata: Metadata = { title: "New contest" };

// See app/(app)/admin/layout.tsx.
export const instant = false;

export default function NewContestPage() {
  return (
    <PageContainer>
      <ContestFormPage />
    </PageContainer>
  );
}
