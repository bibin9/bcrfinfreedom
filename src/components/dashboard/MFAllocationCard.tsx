import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { CountryProfile, MFAllocation } from "@/types";
import { formatCurrency } from "@/lib/formatters";

interface Props {
  allocation: MFAllocation;
  country: CountryProfile;
  monthlyInvestment: number;
  currentCorpus: number;
}

const EQUITY_COLORS: Record<string, string> = {
  large_cap: "#047857",
  mid_cap: "#10b981",
  small_cap: "#34d399",
  flexi_cap: "#6ee7b7",
  international: "#0ea5e9",
};

const DEBT_COLORS: Record<string, string> = {
  liquid: "#64748b",
  short_duration: "#3b82f6",
  corporate_bond: "#6366f1",
  long_gilt: "#8b5cf6",
};

const SIMPLE_EXPLAINERS: Record<string, string> = {
  large_cap: "Big, well-known companies. Grows steadily, less scary when markets fall.",
  mid_cap: "Medium-sized companies. Grows faster but bigger ups and downs.",
  small_cap: "Small companies. Highest growth, but can fall sharply in bad years.",
  flexi_cap: "The fund manager picks a mix automatically. Good if you don't want to decide.",
  international: "Invests outside your country so one country's problem doesn't hurt you as much.",
  liquid: "Like a savings account — money you can pull out within a day if needed.",
  short_duration: "Lends to companies for 1–3 years. Safer than long-term bonds.",
  corporate_bond: "Lends to large, financially strong companies. Slightly higher return.",
  long_gilt: "Lends to the government for many years. Return depends on interest rates.",
};

export function MFAllocationCard({
  allocation,
  country,
  monthlyInvestment,
  currentCorpus,
}: Props) {
  const equityData = useMemo(
    () =>
      allocation.equity
        .filter((e) => e.percentOfEquity > 0)
        .map((e) => ({ ...e, value: e.percentOfEquity })),
    [allocation.equity],
  );
  const debtData = useMemo(
    () =>
      allocation.debt
        .filter((d) => d.percentOfDebt > 0)
        .map((d) => ({ ...d, value: d.percentOfDebt })),
    [allocation.debt],
  );

  const amountOfPortfolio = (pct: number) => (monthlyInvestment * pct) / 100;
  const corpusOfPortfolio = (pct: number) => (currentCorpus * pct) / 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle>How to split your investments</CardTitle>
        <CardDescription>
          Exact amounts you should direct into each type of fund every month — shown as a
          compact table so you can compare slices side-by-side.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="equity">
          <TabsList>
            <TabsTrigger value="equity">Stocks (growth)</TabsTrigger>
            <TabsTrigger value="debt">Bonds (safer)</TabsTrigger>
          </TabsList>

          <TabsContent value="equity" className="space-y-4">
            <SubDonut data={equityData} colorMap={EQUITY_COLORS} label="Stock sleeve" />
            <SleeveTable
              rows={allocation.equity
                .filter((e) => e.percentOfEquity > 0)
                .map((e) => ({
                  key: e.category,
                  label: e.label,
                  color: EQUITY_COLORS[e.category],
                  percentOfPortfolio: e.percentOfPortfolio,
                  percentOfSleeve: e.percentOfEquity,
                  explainer: SIMPLE_EXPLAINERS[e.category] ?? e.rationale,
                }))}
              sleeveLabel="of stocks"
              country={country}
              amountOfPortfolio={amountOfPortfolio}
              corpusOfPortfolio={corpusOfPortfolio}
              currentCorpus={currentCorpus}
            />
          </TabsContent>

          <TabsContent value="debt" className="space-y-4">
            <SubDonut data={debtData} colorMap={DEBT_COLORS} label="Debt sleeve" />
            <SleeveTable
              rows={allocation.debt
                .filter((d) => d.percentOfDebt > 0)
                .map((d) => ({
                  key: d.category,
                  label: d.label,
                  color: DEBT_COLORS[d.category],
                  percentOfPortfolio: d.percentOfPortfolio,
                  percentOfSleeve: d.percentOfDebt,
                  explainer: SIMPLE_EXPLAINERS[d.category] ?? d.rationale,
                }))}
              sleeveLabel="of bonds"
              country={country}
              amountOfPortfolio={amountOfPortfolio}
              corpusOfPortfolio={corpusOfPortfolio}
              currentCorpus={currentCorpus}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

interface SleeveRow {
  key: string;
  label: string;
  color: string;
  percentOfPortfolio: number;
  percentOfSleeve: number;
  explainer: string;
}

function SleeveTable({
  rows,
  sleeveLabel,
  country,
  amountOfPortfolio,
  corpusOfPortfolio,
  currentCorpus,
}: {
  rows: SleeveRow[];
  sleeveLabel: string;
  country: CountryProfile;
  amountOfPortfolio: (pct: number) => number;
  corpusOfPortfolio: (pct: number) => number;
  currentCorpus: number;
}) {
  return (
    <>
      {/* Mobile card layout */}
      <div className="space-y-2 sm:hidden">
        {rows.map((r) => (
          <div key={r.key} className="rounded-lg border border-border p-3">
            <div className="flex items-start justify-between gap-2">
              <span className="flex min-w-0 items-center gap-2">
                <span
                  aria-hidden
                  className="h-2.5 w-2.5 flex-none rounded-full"
                  style={{ background: r.color }}
                />
                <span className="truncate font-medium">{r.label}</span>
              </span>
              <span className="flex-none text-sm font-semibold tabular-nums">
                {r.percentOfPortfolio.toFixed(1)}%
              </span>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
              <div>
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  Monthly
                </p>
                <p className="font-semibold tabular-nums">
                  {formatCurrency(amountOfPortfolio(r.percentOfPortfolio), country)}
                </p>
              </div>
              {currentCorpus > 0 && (
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    Of corpus
                  </p>
                  <p className="font-semibold tabular-nums">
                    {formatCurrency(corpusOfPortfolio(r.percentOfPortfolio), country)}
                  </p>
                </div>
              )}
            </div>
            <p className="mt-1.5 text-[11px] text-muted-foreground">
              {r.percentOfSleeve.toFixed(1)}% {sleeveLabel}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{r.explainer}</p>
          </div>
        ))}
      </div>
      {/* ≥sm: compact table */}
      <div className="hidden overflow-x-auto rounded-lg border border-border sm:block">
        <table className="w-full text-sm">
        <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th scope="col" className="px-3 py-2 text-left font-medium">
              Type
            </th>
            <th scope="col" className="px-3 py-2 text-right font-medium">
              % total
            </th>
            <th scope="col" className="hidden px-3 py-2 text-right font-medium sm:table-cell">
              % {sleeveLabel}
            </th>
            <th scope="col" className="px-3 py-2 text-right font-medium">
              Monthly
            </th>
            {currentCorpus > 0 && (
              <th scope="col" className="px-3 py-2 text-right font-medium">
                Of corpus
              </th>
            )}
            <th scope="col" className="hidden px-3 py-2 text-left font-medium md:table-cell">
              What it means
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.key} className="border-t border-border align-top">
              <td className="px-3 py-2">
                <span className="flex items-center gap-2">
                  <span
                    aria-hidden
                    className="h-2.5 w-2.5 flex-none rounded-full"
                    style={{ background: r.color }}
                  />
                  <span className="font-medium">{r.label}</span>
                </span>
                <p className="mt-0.5 text-xs text-muted-foreground md:hidden">{r.explainer}</p>
              </td>
              <td className="px-3 py-2 text-right font-semibold tabular-nums">
                {r.percentOfPortfolio.toFixed(1)}%
              </td>
              <td className="hidden px-3 py-2 text-right tabular-nums text-muted-foreground sm:table-cell">
                {r.percentOfSleeve.toFixed(1)}%
              </td>
              <td className="px-3 py-2 text-right font-semibold tabular-nums">
                {formatCurrency(amountOfPortfolio(r.percentOfPortfolio), country)}
              </td>
              {currentCorpus > 0 && (
                <td className="px-3 py-2 text-right tabular-nums">
                  {formatCurrency(corpusOfPortfolio(r.percentOfPortfolio), country)}
                </td>
              )}
              <td className="hidden px-3 py-2 text-xs text-muted-foreground md:table-cell">
                {r.explainer}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </>
  );
}

function SubDonut({
  data,
  colorMap,
  label,
}: {
  data: Array<{ category: string; label: string; value: number }>;
  colorMap: Record<string, string>;
  label: string;
}) {
  return (
    <div className="mx-auto h-48 w-full max-w-xs" role="img" aria-label={label}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="label"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={2}
            strokeWidth={0}
          >
            {data.map((d) => (
              <Cell key={d.category} fill={colorMap[d.category] ?? "#888"} />
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
