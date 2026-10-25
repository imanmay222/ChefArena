"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, type TooltipContentProps } from "recharts";
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";
import { LineChart as LineChartIcon } from "lucide-react";
import type { RatingPoint } from "@/types";
import { EmptyState } from "@/components/feedback/states";
import { fmtDate } from "@/lib/utils/format";

function RatingTooltip({ active, payload }: TooltipContentProps<ValueType, NameType>) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload as RatingPoint & { delta: number | null };
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-pop">
      <p className="font-medium text-popover-foreground">{point.contestTitle}</p>
      <p className="mt-0.5 text-muted-foreground">{fmtDate(point.date)}</p>
      <div className="mt-1.5 flex items-center gap-3">
        <span className="font-mono text-sm font-semibold text-popover-foreground tabular">{point.rating}</span>
        {point.delta !== null && (
          <span className={`font-mono tabular ${point.delta >= 0 ? "text-success" : "text-destructive"}`}>
            {point.delta >= 0 ? "+" : ""}
            {point.delta}
          </span>
        )}
        <span className="text-muted-foreground">Rank #{point.rank}</span>
      </div>
    </div>
  );
}

export function RatingChart({ history, height = 220 }: { history: RatingPoint[]; height?: number }) {
  if (!history.length) {
    return <EmptyState icon={LineChartIcon} title="No rated contests yet" description="Your rating history appears after your first rated weekly contest." className="py-10" />;
  }
  const data = history.map((p, i) => ({ ...p, label: p.contestTitle.replace("Weekly ", ""), delta: i ? p.rating - history[i - 1].rating : null }));
  const ratings = history.map((h) => h.rating);
  const min = Math.floor((Math.min(...ratings) - 40) / 50) * 50;
  const max = Math.ceil((Math.max(...ratings) + 40) / 50) * 50;

  return (
    <div style={{ height }} className="w-full" role="img" aria-label={`Rating history: ${history.map((h) => `${h.contestTitle} ${h.rating}`).join(", ")}`}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -12 }}>
          <defs>
            <linearGradient id="rating-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.16} />
              <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="var(--chart-grid)" strokeWidth={1} />
          <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} dy={6} />
          <YAxis domain={[min, max]} tickLine={false} axisLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} width={48} tickCount={4} />
          <Tooltip content={RatingTooltip} cursor={{ stroke: "var(--border-strong)", strokeWidth: 1 }} />
          <Area
            type="monotone"
            dataKey="rating"
            stroke="var(--chart-1)"
            strokeWidth={2}
            fill="url(#rating-fill)"
            dot={{ r: 4, fill: "var(--chart-1)", stroke: "var(--card)", strokeWidth: 2 }}
            activeDot={{ r: 5, fill: "var(--chart-1)", stroke: "var(--card)", strokeWidth: 2 }}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
