import type { Metadata } from "next";
import { PageContainer, PageHeader } from "@/components/layout/page-header";
import { PracticeView } from "@/components/practice/practice-view";

export const metadata: Metadata = { title: "Practice" };

export default function PracticePage() {
  return (
    <PageContainer>
      <PageHeader title="Practice archive" description="Upsolve problems from past rounds at your own pace. Problems from a live contest unlock here once it ends." />
      <PracticeView />
    </PageContainer>
  );
}
