import type { Metadata } from "next";
import { PageContainer, PageHeader } from "@/components/layout/page-header";
import { NotificationsView } from "@/components/notifications/notifications-view";

export const metadata: Metadata = { title: "Notifications" };

export default function NotificationsPage() {
  return (
    <PageContainer className="max-w-4xl">
      <PageHeader title="Notifications" description="Contest reminders, verdicts, results, editorials and announcements." />
      <NotificationsView />
    </PageContainer>
  );
}
