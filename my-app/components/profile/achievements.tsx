import { Flame, Medal, Sparkles, Target, Trophy, Zap } from "lucide-react";
import type { Achievement } from "@/types";
import { fmtDate } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

const ICONS = { flame: Flame, zap: Zap, trophy: Trophy, target: Target, medal: Medal, sparkles: Sparkles };

export function AchievementList({ achievements, compact }: { achievements: Achievement[]; compact?: boolean }) {
  if (!achievements.length) return <p className="py-6 text-center text-[13px] text-muted-foreground">No badges yet — your first accepted contest solution earns one.</p>;
  const sorted = [...achievements].sort((a, b) => Number(!!b.earnedAt) - Number(!!a.earnedAt));
  return (
    <ul className={cn("grid gap-2", compact ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2")}>
      {sorted.map((a) => {
        const Icon = ICONS[a.icon];
        const earned = !!a.earnedAt;
        return (
          <li key={a.id} className={cn("flex items-center gap-3 rounded-lg border border-border p-2.5", !earned && "border-dashed")}>
            <span
              className={cn(
                "flex size-9 shrink-0 items-center justify-center rounded-lg",
                earned ? "bg-gradient-to-br from-primary/20 to-brand-2/20 text-primary" : "bg-surface-2 text-muted-foreground",
              )}
            >
              <Icon className="size-[18px]" />
            </span>
            <div className="min-w-0 flex-1">
              <p className={cn("truncate text-[13px] font-medium", !earned && "text-muted-foreground")}>{a.title}</p>
              {earned ? (
                <p className="truncate text-xs text-muted-foreground">{compact ? fmtDate(a.earnedAt!) : a.description}</p>
              ) : a.progress ? (
                <div className="mt-1 flex items-center gap-2">
                  <div className="h-1 flex-1 overflow-hidden rounded-full bg-primary/10">
                    <div className="h-full rounded-full bg-primary/60" style={{ width: `${(a.progress.current / a.progress.target) * 100}%` }} />
                  </div>
                  <span className="font-mono text-[11px] text-muted-foreground tabular">
                    {a.progress.current}/{a.progress.target}
                  </span>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">Locked</p>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
