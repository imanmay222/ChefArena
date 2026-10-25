import { CheckCircle2, CircleDashed, Clock, Loader2, XCircle, AlertTriangle, Cpu, Archive, FileEdit, CalendarClock, Radio } from "lucide-react";
import type { ContestStatus, Difficulty, Role, SubmissionStatus, Verdict } from "@/types";
import { Badge } from "@/components/ui/badge";
import { CONTEST_STATUS_LABEL } from "@/lib/contests/status";
import { DIFFICULTY_META, VERDICT_META } from "@/lib/utils/format";
import { ROLE_LABEL } from "@/lib/auth/permissions";
import { cn } from "@/lib/utils/cn";

export function ContestStatusBadge({ status, className }: { status: ContestStatus; className?: string }) {
  const map = {
    draft: { variant: "neutral", icon: FileEdit },
    scheduled: { variant: "outline", icon: CalendarClock },
    upcoming: { variant: "info", icon: Clock },
    ongoing: { variant: "success", icon: Radio },
    ended: { variant: "neutral", icon: CheckCircle2 },
    archived: { variant: "outline", icon: Archive },
  } as const;
  const { variant, icon: Icon } = map[status];
  return (
    <Badge variant={variant} className={className}>
      {status === "ongoing" ? (
        <span className="relative flex size-1.5">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-60" />
          <span className="relative inline-flex size-1.5 rounded-full bg-success" />
        </span>
      ) : (
        <Icon />
      )}
      {CONTEST_STATUS_LABEL[status]}
    </Badge>
  );
}

export function VerdictBadge({
  verdict,
  status = "completed",
  short,
  className,
}: {
  verdict: Verdict | null;
  status?: SubmissionStatus;
  short?: boolean;
  className?: string;
}) {
  if (status !== "completed" || !verdict) {
    const label = status === "queued" ? "Queued" : status === "compiling" ? "Compiling" : "Running";
    return (
      <Badge variant="neutral" className={className}>
        {status === "queued" ? <CircleDashed /> : <Loader2 className="animate-spin" />}
        {label}
      </Badge>
    );
  }
  const meta = VERDICT_META[verdict];
  const Icon = verdict === "accepted" ? CheckCircle2 : verdict === "compilation_error" ? Cpu : verdict.includes("limit") ? AlertTriangle : XCircle;
  return (
    <Badge variant={meta.tone} className={className}>
      <Icon />
      {short ? meta.short : meta.label}
    </Badge>
  );
}

export function DifficultyLabel({ difficulty, className }: { difficulty: Difficulty; className?: string }) {
  const meta = DIFFICULTY_META[difficulty];
  return <span className={cn("text-xs font-medium", meta.className, className)}>{meta.label}</span>;
}

export function RoleBadge({ role }: { role: Role }) {
  return <Badge variant={role === "member" ? "outline" : role === "cp_lead" ? "default" : "warning"}>{ROLE_LABEL[role]}</Badge>;
}
