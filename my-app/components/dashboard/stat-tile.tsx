import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils/cn";

export function StatTile({
  label,
  value,
  icon: Icon,
  delta,
  hint,
  loading,
  className,
}: {
  label: string;
  value: React.ReactNode;
  icon: LucideIcon;
  delta?: { value: number; label: string; suffix?: string };
  hint?: React.ReactNode;
  loading?: boolean;
  className?: string;
}) {
  const DeltaIcon = !delta || delta.value === 0 ? Minus : delta.value > 0 ? ArrowUpRight : ArrowDownRight;
  return (
    <Card className={cn("p-4", className)}>
      <div className="flex items-center justify-between">
        <p className="text-[13px] text-muted-foreground">{label}</p>
        <span className="flex size-7 items-center justify-center rounded-md bg-surface-2 text-muted-foreground">
          <Icon className="size-[15px]" />
        </span>
      </div>
      {loading ? (
        <Skeleton className="mt-3 h-7 w-20" />
      ) : (
        <p className="mt-2 text-2xl font-semibold tracking-tight tabular">{value}</p>
      )}
      <div className="mt-1.5 flex min-h-4 items-center gap-1.5 text-xs text-muted-foreground">
        {delta && !loading && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 font-medium tabular",
              delta.value > 0 ? "text-success" : delta.value < 0 ? "text-destructive" : "text-muted-foreground",
            )}
          >
            <DeltaIcon className="size-3.5" />
            {delta.value > 0 ? "+" : ""}
            {delta.value}
            {delta.suffix}
          </span>
        )}
        {delta && !loading && <span>{delta.label}</span>}
        {!delta && hint}
      </div>
    </Card>
  );
}
