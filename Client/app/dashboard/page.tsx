import type { Metadata } from "next";
import { ProtectedDashboard } from "@/components/layout/protected-dashboard";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function MemberDashboardPage() {
  return (
    <ProtectedDashboard
      role="member"
      heading="Welcome to your workspace."
      description="Your member dashboard will be developed in a future phase. For now, this page confirms that your demo sign-in and role-based routing work."
    />
  );
}
