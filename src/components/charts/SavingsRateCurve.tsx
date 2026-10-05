import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { FreedomProjection } from "@/types";
import { useI18n } from "@/i18n";

interface Props {
  curve: FreedomProjection["savingsRateCurve"];
  /** User's current savings rate (0..1) so we can highlight the matching bar. */
  currentRate: number;
}

/**
 * Classic FIRE visualization: x-axis is savings rate, y-axis is years until
 * you can retire. The user's current bar is highlighted in primary; everything
 * else is muted so the trade-off jumps out: doubling your savings rate
 * roughly halves your years-to-FI.
 */
export function SavingsRateCurve({ curve, currentRate }: Props) {
  const { t } = useI18n();
  const data = curve.map((p) => ({
    savingsRate: Math.round(p.savingsRate * 100),
    yearsToFI: p.yearsToFI != null ? Math.round(p.yearsToFI * 10) / 10 : null,
  }));

  // Round current rate to nearest 5% to match bin spacing.
  const currentBin = Math.round((currentRate * 100) / 5) * 5;

  return (
    <div className="h-56 w-full sm:h-64" role="img" aria-label={t("dash.charts.curveAria")}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 12, bottom: 4, left: 0 }}>
          <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="savingsRate"
            stroke="hsl(var(--muted-foreground))"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: number) => `${v}%`}
            label={{
              value: t("dash.charts.savingsRate"),
              position: "insideBottom",
              offset: -2,
              fontSize: 11,
              fill: "hsl(var(--muted-foreground))",
            }}
          />
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            width={40}
            tickFormatter={(v: number) => `${v}y`}
          />
          <Tooltip
            contentStyle={{
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: 8,
              fontSize: 12,
              color: "hsl(var(--card-foreground))",
            }}
            formatter={(value: number) => [
              t("dash.charts.yearsN", { n: value }),
              t("dash.charts.yearsToFire"),
            ]}
            labelFormatter={(rate: number) => t("dash.charts.saveN", { n: rate })}
          />
          <ReferenceLine
            x={currentBin}
            stroke="hsl(var(--primary))"
            strokeDasharray="4 4"
            label={{
              value: t("dash.charts.you"),
              fill: "hsl(var(--primary))",
              fontSize: 11,
              position: "top",
            }}
          />
          <Bar dataKey="yearsToFI" radius={[3, 3, 0, 0]}>
            {data.map((d) => (
              <Cell
                key={d.savingsRate}
                fill={
                  d.savingsRate === currentBin
                    ? "hsl(var(--primary))"
                    : "hsl(var(--muted-foreground) / 0.35)"
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
