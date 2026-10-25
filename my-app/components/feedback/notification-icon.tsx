import { BookOpen, CalendarClock, FileCheck2, Megaphone, Trophy } from "lucide-react";
import type { NotificationType } from "@/types";
import { cn } from "@/lib/utils/cn";

const MAP: Record<NotificationType, { icon: typeof Megaphone; className: string }> = {
  contest_reminder: { icon: CalendarClock, className: "bg-info/12 text-info" },
  submission_result: { icon: FileCheck2, className: "bg-success/12 text-success" },
  announcement: { icon: Megaphone, className: "bg-primary-soft text-primary" },
  contest_result: { icon: Trophy, className: "bg-warning/14 text-warning" },
  editorial: { icon: BookOpen, className: "bg-brand-2/12 text-brand-2" },
};

export function NotificationIcon({ type, className }: { type: NotificationType; className?: string }) {
  const { icon: Icon, className: tone } = MAP[type];
  return (
    <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-lg", tone, className)}>
      <Icon className="size-4" />
    </span>
  );
}
