import type { Metadata } from "next";
import { PageContainer } from "@/components/layout/page-header";
import { AdminSubmissions } from "@/components/admin/admin-submissions";

export const metadata: Metadata = { title: "All submissions" };

// See app/(app)/admin/layout.tsx.
export const instant = false;

export default function AdminSubmissionsPage() {
  return (
    <PageContainer wide>
      <AdminSubmissions />
    </PageContainer>
  );
}
