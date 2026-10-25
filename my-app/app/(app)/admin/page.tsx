import type { Metadata } from "next";
import { PageContainer } from "@/components/layout/page-header";
import { AdminOverview } from "@/components/admin/admin-overview";

export const metadata: Metadata = { title: "Admin" };

// See app/(app)/admin/layout.tsx.
export const instant = false;

export default function AdminPage() {
  return (
    <PageContainer>
      <AdminOverview />
    </PageContainer>
  );
}
