import type { Metadata } from "next";
import { ProtectedDashboard } from "@/components/layout/protected-dashboard";

export const metadata: Metadata = {
  title: "Administration",
};

export default function AdminDashboardPage() {
  return (
    <ProtectedDashboard
      role="super_admin"
      heading="Welcome to the administration workspace."
      description="The administration dashboard will be developed in a future phase. For now, this page confirms that your demo sign-in and role-based routing work."
    />
  );
}
