import type { Metadata } from "next";
import { PageContainer, PageHeader } from "@/components/layout/page-header";
import { SettingsView } from "@/components/settings/settings-view";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <PageContainer className="max-w-3xl">
      <PageHeader title="Settings" description="Preferences are saved on this device. Nothing sensitive is stored in the browser." />
      <SettingsView />
    </PageContainer>
  );
}
