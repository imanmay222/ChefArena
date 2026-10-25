import type { Metadata } from "next";
import { PageContainer } from "@/components/layout/page-header";
import { AdminGate } from "@/components/admin/admin-gate";
import { UsersTable } from "@/components/admin/users-table";

export const metadata: Metadata = { title: "User management" };

// See app/(app)/admin/layout.tsx.
export const instant = false;

export default function UsersPage() {
  return (
    <AdminGate roles={["super_admin"]}>
      <PageContainer>
        <UsersTable mode="users" />
      </PageContainer>
    </AdminGate>
  );
}
