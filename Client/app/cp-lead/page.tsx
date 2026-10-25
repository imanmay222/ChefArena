import type { Metadata } from "next";
import { ProtectedDashboard } from "@/components/layout/protected-dashboard";

export const metadata: Metadata = {
  title: "CP Lead",
};

export default function CpLeadDashboardPage() {
  return (
    <ProtectedDashboard
      role="cp_lead"
      heading="Welcome to the CP Lead workspace."
      description="The CP Lead dashboard will be developed in a future phase. For now, this page confirms that your demo sign-in and role-based routing work."
    />
  );
}
