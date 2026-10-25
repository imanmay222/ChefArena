"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, CheckCheck } from "lucide-react";
import { useMarkAllNotificationsRead, useMarkNotificationRead, useNotifications } from "@/lib/queries";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { NotificationIcon } from "@/components/feedback/notification-icon";
import { useNow } from "@/hooks/use-now";
import { fmtRelative } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";
import { useState } from "react";

export function NotificationsMenu() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const now = useNow(30_000);
  const { data } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();
  const unread = data?.filter((n) => !n.read).length ?? 0;
  const recent = data?.slice(0, 5) ?? [];

  return (
    <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon-sm" className="relative" aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`}>
            <Bell />
            {unread > 0 && (
              <span className="absolute top-1 right-1 flex min-w-3.5 items-center justify-center rounded-full bg-primary px-[3px] text-[9px] leading-3.5 font-semibold text-primary-foreground ring-2 ring-background tabular">
                {unread}
              </span>
            )}
          </Button>
        </PopoverTrigger>
      <PopoverContent align="end" className="w-[min(22rem,calc(100vw-2rem))] p-0">
        <div className="flex items-center justify-between border-b border-border px-3.5 py-2.5">
          <p className="text-[13px] font-semibold">Notifications</p>
          <Button variant="ghost" size="xs" disabled={!unread || markAll.isPending} onClick={() => markAll.mutate()}>
            <CheckCheck /> Mark all read
          </Button>
        </div>
        <ul className="max-h-80 overflow-y-auto scrollbar-thin">
          {recent.length === 0 && <li className="px-4 py-8 text-center text-[13px] text-muted-foreground">You&apos;re all caught up.</li>}
          {recent.map((n) => (
            <li key={n.id}>
              <button
                className={cn(
                  "flex w-full cursor-pointer items-start gap-3 border-b border-border px-3.5 py-3 text-left transition-colors last:border-0 hover:bg-accent/60",
                  !n.read && "bg-primary-soft/40",
                )}
                onClick={() => {
                  if (!n.read) markRead.mutate(n.id);
                  setOpen(false);
                  if (n.href) router.push(n.href);
                }}
              >
                <NotificationIcon type={n.type} />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="truncate text-[13px] font-medium">{n.title}</span>
                    {!n.read && <span className="size-1.5 shrink-0 rounded-full bg-primary" aria-label="Unread" />}
                  </span>
                  <span className="mt-0.5 line-clamp-2 block text-xs text-muted-foreground">{n.body}</span>
                  <span className="mt-1 block text-[11px] text-muted-foreground/80">{now ? fmtRelative(n.createdAt, now) : " "}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
        <div className="border-t border-border p-1.5">
          <Button variant="ghost" size="sm" className="w-full" asChild>
            <Link href="/notifications" onClick={() => setOpen(false)}>
              View all notifications
            </Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
