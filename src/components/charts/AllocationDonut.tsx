import { useMemo } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { AllocationBreakdown } from "@/types";
import { useI18n } from "@/i18n";

const ASSET_COLORS: Record<AllocationBreakdown["asset"], string> = {
  equities_local: "#10b981",
  equities_destination: "#f97316",
  equities_international: "#059669",
  bonds_fixed_income: "#3b82f6",
  real_estate: "#a855f7",
  gold_commodities: "#f59e0b",
  cash_emergency: "#64748b",
  crypto: "#ef4444",
};

interface Props {
  breakdown: AllocationBreakdown[];
}

export function AllocationDonut({ breakdown }: Props) {
  const { t, tm } = useI18n();
  const data = useMemo(
    () =>
      breakdown
        .filter((b) => b.percent > 0)
        .map((b) => ({ ...b, label: b.labelMsg ? tm(b.labelMsg) : b.label, value: b.percent })),
    [breakdown, tm],
  );

  return (
    <div className="h-64 w-full" role="img" aria-label={t("dash.alloc.donutAria")}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="label"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={2}
            strokeWidth={0}
          >
            {data.map((d) => (
              <Cell key={d.asset} fill={ASSET_COLORS[d.asset]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: 8,
              fontSize: 12,
              color: "hsl(var(--card-foreground))",
            }}
            formatter={(value: number, _name, props) => [
              `${value.toFixed(1)}%`,
              props.payload.label,
            ]}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export { ASSET_COLORS };
