import type { Metadata } from "next";
import { PageContainer } from "@/components/layout/page-header";
import { AuditLogs } from "@/components/admin/audit-logs";

export const metadata: Metadata = { title: "Audit log" };

// See app/(app)/admin/layout.tsx.
export const instant = false;

export default function AuditLogsPage() {
  return (
    <PageContainer>
      <AuditLogs />
    </PageContainer>
  );
}
