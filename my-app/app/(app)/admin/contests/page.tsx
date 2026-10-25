import type { Metadata } from "next";
import { PageContainer } from "@/components/layout/page-header";
import { AdminContests } from "@/components/admin/admin-contests";

export const metadata: Metadata = { title: "Manage contests" };

// See app/(app)/admin/layout.tsx.
export const instant = false;

export default function AdminContestsPage() {
  return (
    <PageContainer>
      <AdminContests />
    </PageContainer>
  );
}
