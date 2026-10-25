"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Check, CheckCheck, ChevronRight } from "lucide-react";
import type { NotificationType } from "@/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState, ErrorState, TableSkeleton } from "@/components/feedback/states";
import { NotificationIcon } from "@/components/feedback/notification-icon";
import { useMarkAllNotificationsRead, useMarkNotificationRead, useNotifications } from "@/lib/queries";
import { useNow } from "@/hooks/use-now";
import { fmtDateTime, fmtRelative } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

const TYPE_LABEL: Record<NotificationType, string> = {
  contest_reminder: "Contest reminders",
  submission_result: "Submission results",
  announcement: "Announcements",
  contest_result: "Contest results",
  editorial: "Editorials",
};

export function NotificationsView() {
  const router = useRouter();
  const now = useNow(30_000);
  const { data, isPending, isError, error, refetch } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [type, setType] = useState<NotificationType | "all">("all");

  const unread = data?.filter((n) => !n.read).length ?? 0;
  const items = (data ?? []).filter((n) => (filter === "all" || !n.read) && (type === "all" || n.type === type));

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as "all" | "unread")}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unread">
              Unread <span className="rounded bg-muted px-1 font-mono text-[10px] tabular">{unread}</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex gap-2 sm:ml-auto">
          <Select value={type} onValueChange={(v) => setType(v as NotificationType | "all")}>
            <SelectTrigger size="sm" aria-label="Notification type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {(Object.keys(TYPE_LABEL) as NotificationType[]).map((t) => (
                <SelectItem key={t} value={t}>
                  {TYPE_LABEL[t]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" disabled={!unread || markAll.isPending} onClick={() => markAll.mutate()}>
            <CheckCheck /> Mark all read
          </Button>
        </div>
      </div>
      {isError ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : isPending ? (
        <TableSkeleton rows={5} />
      ) : items.length === 0 ? (
        <EmptyState icon={Bell} title={filter === "unread" ? "You're all caught up" : "No notifications"} description="Contest reminders, verdicts and announcements will show up here." />
      ) : (
        <ul className="divide-y divide-border">
          {items.map((n) => (
            <li key={n.id} className={cn("group flex items-start gap-3 px-4 py-3.5 transition-colors sm:px-5", !n.read && "bg-primary-soft/40")}>
              <NotificationIcon type={n.type} />
              <button
                className="min-w-0 flex-1 cursor-pointer text-left"
                onClick={() => {
                  if (!n.read) markRead.mutate(n.id);
                  if (n.href) router.push(n.href);
                }}
              >
                <div className="flex items-center gap-2">
                  <p className="truncate text-[13px] font-medium">{n.title}</p>
                  {!n.read && <span className="size-1.5 shrink-0 rounded-full bg-primary" aria-label="Unread" />}
                </div>
                <p className="mt-0.5 text-[13px] text-muted-foreground">{n.body}</p>
                <p className="mt-1 text-[11px] text-muted-foreground/80" title={fmtDateTime(n.createdAt)}>
                  {TYPE_LABEL[n.type]} · {now ? fmtRelative(n.createdAt, now) : ""}
                </p>
              </button>
              <div className="flex shrink-0 items-center gap-1">
                {!n.read && (
                  <Button variant="ghost" size="xs" onClick={() => markRead.mutate(n.id)} aria-label={`Mark "${n.title}" as read`}>
                    <Check /> <span className="hidden sm:inline">Mark read</span>
                  </Button>
                )}
                {n.href && <ChevronRight className="hidden size-4 text-muted-foreground sm:block" aria-hidden />}
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
