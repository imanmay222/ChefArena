import type { Metadata } from "next";
import { Suspense } from "react";
import { PageContainer } from "@/components/layout/page-header";
import { AdminAnnouncements } from "@/components/admin/admin-announcements";
import { TableSkeleton } from "@/components/feedback/states";

export const metadata: Metadata = { title: "Announcements" };

// See app/(app)/admin/layout.tsx.
export const instant = false;

export default function AdminAnnouncementsPage({ searchParams }: PageProps<"/admin/announcements">) {
  return (
    <PageContainer className="max-w-5xl">
      <Suspense fallback={<TableSkeleton rows={4} />}>{searchParams.then((sp) => <AdminAnnouncements openNew={sp.new === "1"} />)}</Suspense>
    </PageContainer>
  );
}
