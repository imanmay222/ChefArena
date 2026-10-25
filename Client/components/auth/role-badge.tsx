import { ROLE_CONFIG } from "@/lib/auth/roles";
import { cn } from "@/lib/utils";
import type { Role } from "@/types/auth";

const tones: Record<Role, string> = {
  member: "border-success/30 bg-success/10 text-success",
  cp_lead: "border-warning/30 bg-warning/10 text-warning",
  super_admin: "border-accent/30 bg-accent/10 text-accent",
};

export function RoleBadge({ role, className }: { role: Role; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium tracking-wide",
        tones[role],
        className,
      )}
    >
      <span aria-hidden className="size-1.5 rounded-full bg-current" />
      {ROLE_CONFIG[role].label}
    </span>
  );
}
