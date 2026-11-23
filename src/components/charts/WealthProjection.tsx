import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { CountryProfile, FreedomProjection } from "@/types";
import { formatCurrency } from "@/lib/formatters";
import { useI18n } from "@/i18n";

interface Props {
  projection: FreedomProjection;
  country: Pick<CountryProfile, "currency">;
}

export function WealthProjection({ projection, country }: Props) {
  const { t } = useI18n();
  const startAge = projection.projection[0]?.age ?? 0;
  const data = projection.projection.map((p) => {
    const expense = projection.currentAnnualExpenses * Math.pow(1 + projection.inflationRateUsed, p.age - startAge);
    return { ...p, leanTarget: expense * 15, fireTarget: expense * 25, fatTarget: expense * 33 };
  });

  return (
    <div className="h-72 w-full" role="img" aria-label={t("dash.charts.wealthAria")}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 16, bottom: 0, left: 8 }}>
          <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
          <XAxis
            dataKey="age"
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            label={{ value: t("dash.charts.age"), position: "insideBottom", offset: -4, fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
          />
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            width={70}
            tickFormatter={(v: number) => formatCurrency(v, country, { compact: true })}
          />
          <Tooltip
            contentStyle={{
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: 8,
              fontSize: 12,
              color: "hsl(var(--card-foreground))",
            }}
            formatter={(value: number) => [formatCurrency(value, country), t("dash.charts.wealth")]}
            labelFormatter={(age: number) => t("dash.charts.ageN", { age })}
          />
          <Line
            dataKey="leanTarget" name={t("dash.charts.lean")} dot={false}
            stroke="hsl(var(--muted-foreground))"
            strokeDasharray="2 4"
          />
          <Line
            dataKey="fireTarget" name="FIRE 25x (rises with prices)" dot={false}
            stroke="hsl(var(--primary))"
            strokeDasharray="4 4"
          />
          <Line
            dataKey="fatTarget" name={t("dash.charts.fat")} dot={false}
            stroke="hsl(var(--chart-3, 142 71% 45%))"
            strokeDasharray="2 4"
          />
          <Line
            type="monotone"
            dataKey="wealth"
            stroke="hsl(var(--primary))"
            strokeWidth={2.5}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
