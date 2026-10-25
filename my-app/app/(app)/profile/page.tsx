import type { Metadata } from "next";
import { PageContainer } from "@/components/layout/page-header";
import { ProfileView } from "@/components/profile/profile-view";

export const metadata: Metadata = { title: "My Profile" };

export default function ProfilePage() {
  return (
    <PageContainer>
      <ProfileView />
    </PageContainer>
  );
}
