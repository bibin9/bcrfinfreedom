import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { CountryProfile } from "@/types";
import { useI18n } from "@/i18n";

interface Props {
  country: CountryProfile;
}

/**
 * Bar chart comparing expected nominal returns for the main asset classes
 * available in the user's country.
 */
export function ReturnComparison({ country }: Props) {
  const { t } = useI18n();
  const c = (key: string) => t(`dash.charts.${key}`);
  const data = [
    { name: c("localEq"), return: country.expectedEquityReturn * 100, color: "#10b981" },
    { name: c("intlEq"), return: 7.5, color: "#059669" },
    {
      name: country.shariaMarket ? c("sukuk") : c("bonds"),
      return: country.expectedBondReturn * 100,
      color: "#3b82f6",
    },
    { name: c("reits"), return: country.expectedEquityReturn * 0.7 * 100, color: "#a855f7" },
    { name: c("gold"), return: 5, color: "#f59e0b" },
    { name: c("cash"), return: 3, color: "#64748b" },
  ];

  return (
    <div className="h-64 w-full" role="img" aria-label={c("returnsAria")}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 16, bottom: 0, left: 0 }}>
          <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="name"
            stroke="hsl(var(--muted-foreground))"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            interval={0}
          />
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: number) => `${v}%`}
          />
          <Tooltip
            contentStyle={{
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: 8,
              fontSize: 12,
              color: "hsl(var(--card-foreground))",
            }}
            formatter={(value: number) => [`${value.toFixed(1)}%`, c("expected")]}
          />
          <Bar dataKey="return" radius={[6, 6, 0, 0]}>
            {data.map((d) => (
              <Cell key={d.name} fill={d.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
