"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Role } from "@/types";
import { useCurrentUser } from "@/lib/queries";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Client-side role gate for admin screens. This only improves UX — the mock
 * services also check roles, and the Go backend must enforce them for real.
 */
export function AdminGate({ roles = ["cp_lead", "super_admin"], children }: { roles?: Role[]; children: React.ReactNode }) {
  const router = useRouter();
  const { data: user, isPending } = useCurrentUser();
  const allowed = !!user && roles.includes(user.role);

  useEffect(() => {
    if (!isPending && !allowed) router.replace(user ? "/forbidden" : "/login");
  }, [isPending, allowed, user, router]);

  if (!allowed) {
    return (
      <div className="mx-auto w-full max-w-[1360px] space-y-4 px-4 py-6 sm:px-6 lg:px-8 lg:py-8" aria-busy>
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }
  return <>{children}</>;
}
