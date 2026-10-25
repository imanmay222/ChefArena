import type { Metadata } from "next";
import { PageContainer, PageHeader } from "@/components/layout/page-header";
import { MySubmissions } from "@/components/submissions/my-submissions";

export const metadata: Metadata = { title: "Submissions" };

export default function SubmissionsPage() {
  return (
    <PageContainer>
      <PageHeader title="My submissions" description="Every contest and practice submission you've made. Contest rows count toward standings; practice rows never do." />
      <MySubmissions />
    </PageContainer>
  );
}
