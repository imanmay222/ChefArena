import type { Metadata } from "next";
import { Suspense } from "react";
import { PageContainer } from "@/components/layout/page-header";
import { UsersTable } from "@/components/admin/users-table";
import { TableSkeleton } from "@/components/feedback/states";

export const metadata: Metadata = { title: "Participants" };

// See app/(app)/admin/layout.tsx.
export const instant = false;

export default function ParticipantsPage({ searchParams }: PageProps<"/admin/participants">) {
  return (
    <PageContainer>
      <Suspense fallback={<TableSkeleton />}>{searchParams.then((sp) => <UsersTable mode="participants" openInvite={sp.invite === "1"} />)}</Suspense>
    </PageContainer>
  );
}
