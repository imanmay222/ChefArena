import type { Metadata } from "next";
import { PageContainer, PageHeader } from "@/components/layout/page-header";
import { ContestsView } from "@/components/contests/contests-view";

export const metadata: Metadata = { title: "Contests" };

export default function ContestsPage() {
  return (
    <PageContainer>
      <PageHeader title="Contests" description="Weekly ICPC-style rounds for the department. Problems unlock when a contest starts." />
      <ContestsView />
    </PageContainer>
  );
}
