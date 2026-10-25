import type { Metadata } from "next";
import { PageContainer } from "@/components/layout/page-header";
import { DashboardView } from "@/components/dashboard/dashboard-view";

export const metadata: Metadata = { title: "Overview" };

export default function DashboardPage() {
  return (
    <PageContainer>
      <DashboardView />
    </PageContainer>
  );
}
