"use client";

import Link from "next/link";
import { useCurrentUser } from "@/lib/queries";
import { UserAvatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { ROLE_LABEL } from "@/lib/auth/permissions";
import { cn } from "@/lib/utils/cn";

export function SidebarUser({ collapsed }: { collapsed?: boolean }) {
  const { data: user, isPending } = useCurrentUser();
  if (isPending || !user) {
    return <Skeleton className={cn("h-10", collapsed ? "mx-auto w-9" : "w-full")} />;
  }
  return (
    <Link
      href="/profile"
      className={cn(
        "flex items-center gap-2.5 rounded-md p-1.5 transition-colors outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring/50",
        collapsed && "justify-center",
      )}
    >
      <UserAvatar name={user.name} seed={user.id} size="sm" />
      {!collapsed && (
        <span className="min-w-0 flex-1 leading-tight">
          <span className="block truncate text-[13px] font-medium">{user.name}</span>
          <span className="block truncate font-mono text-[11px] text-muted-foreground">
            @{user.handle} · {ROLE_LABEL[user.role]}
          </span>
        </span>
      )}
    </Link>
  );
}
