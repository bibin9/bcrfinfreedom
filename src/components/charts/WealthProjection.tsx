import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { CountryProfile, FreedomProjection } from "@/types";
import { formatCurrency } from "@/lib/formatters";

interface Props {
  projection: FreedomProjection;
  country: Pick<CountryProfile, "currency">;
}

export function WealthProjection({ projection, country }: Props) {
  const data = projection.projection;

  return (
    <div className="h-72 w-full" role="img" aria-label="Projected wealth over time">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 16, bottom: 0, left: 8 }}>
          <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
          <XAxis
            dataKey="age"
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            label={{ value: "Age", position: "insideBottom", offset: -4, fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
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
            formatter={(value: number) => [formatCurrency(value, country), "Wealth"]}
            labelFormatter={(age: number) => `Age ${age}`}
          />
          <ReferenceLine
            y={projection.fireTiers.lean.targetCorpus}
            stroke="hsl(var(--muted-foreground))"
            strokeDasharray="2 4"
            label={{
              value: "LeanFIRE 15×",
              fill: "hsl(var(--muted-foreground))",
              fontSize: 10,
              position: "insideTopRight",
            }}
          />
          <ReferenceLine
            y={projection.targetCorpus}
            stroke="hsl(var(--primary))"
            strokeDasharray="4 4"
            label={{
              value: "FIRE 25×",
              fill: "hsl(var(--primary))",
              fontSize: 11,
              position: "insideTopRight",
            }}
          />
          <ReferenceLine
            y={projection.fireTiers.fat.targetCorpus}
            stroke="hsl(var(--chart-3, 142 71% 45%))"
            strokeDasharray="2 4"
            label={{
              value: "FatFIRE 33×",
              fill: "hsl(142 71% 45%)",
              fontSize: 10,
              position: "insideTopRight",
            }}
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
