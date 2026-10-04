import { useMemo } from "react";
import { AlertTriangle, Waves } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CashFlowSankey } from "@/components/charts/CashFlowSankey";
import { buildCashFlow } from "@/lib/cashflow";
import { convertCurrency } from "@/lib/fx";
import { projectGoal } from "@/lib/goals";
import type { CountryProfile, FreedomProjection, Goal } from "@/types";
import { formatCurrency } from "@/lib/formatters";

interface Props {
  /** Resident country — the chart is drawn in its currency. */
  country: CountryProfile;
  /** Retirement country — FIRE and goal SIPs are computed in its currency. */
  destinationCountry: CountryProfile;
  monthlyIncome: number;
  /** Money sent home each month, resident currency. */
  monthlyRemittance?: number;
  savingsRate: number;
  freedom: FreedomProjection;
  expectedReturn: number;
  goals: Goal[];
}

export function CashFlowCard({
  country,
  destinationCountry,
  monthlyIncome,
  monthlyRemittance = 0,
  savingsRate,
  freedom,
  expectedReturn,
  goals,
}: Props) {
  const data = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const toResident = (v: number) => convertCurrency(v, destinationCountry, country);
    return buildCashFlow({
      monthlyIncome,
      monthlyRemittance,
      savingsRate,
      fireSIP: toResident(freedom.requiredMonthlySIP ?? 0),
      goals: goals.map((g) => {
        const p = projectGoal(g, currentYear, destinationCountry.inflationRate, expectedReturn);
        return { id: g.id, name: g.name, monthlySIP: toResident(p.monthlySIP ?? 0) };
      }),
    });
  }, [
    country,
    destinationCountry,
    monthlyIncome,
    monthlyRemittance,
    savingsRate,
    freedom.requiredMonthlySIP,
    goals,
    expectedReturn,
  ]);

  const t = data.totals;
  const savingsRatePct = t.income > 0 ? (t.savings / t.income) * 100 : 0;
  const fmt = (v: number) => formatCurrency(v, country, { compact: true });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Waves className="h-5 w-5 text-orange-500" />
          Monthly cash flow
          <span className="ml-auto rounded-full bg-orange-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-orange-600 dark:text-orange-400">
            Where your money goes
          </span>
        </CardTitle>
        <CardDescription>
          Follow your monthly take-home from paycheque to destination. Each strip's width is
          the amount flowing through it. Hover any flow for the exact number.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <CashFlowSankey data={data} country={country} />

        <div
          className={`grid grid-cols-2 gap-2 ${t.remittance > 0 ? "sm:grid-cols-5" : "sm:grid-cols-4"}`}
        >
          <Stat label="Monthly income" value={fmt(t.income)} />
          {t.remittance > 0 && <Stat label="Sent home" value={fmt(t.remittance)} />}
          <Stat label="Living costs" value={fmt(t.spending)} />
          <Stat label="Saving" value={fmt(t.savings)} />
          <Stat
            label="Savings rate"
            value={`${savingsRatePct.toFixed(0)}%`}
            highlight={savingsRatePct >= 20 ? "emerald" : savingsRatePct >= 10 ? "amber" : "red"}
          />
        </div>

        {t.shortfall > 0 && (
          <div className="flex items-start gap-2 rounded-md border border-amber-500/40 bg-amber-500/5 p-2.5 text-xs">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <p>
              Your FIRE and goal SIPs need <strong>{fmt(t.shortfall)}/month more</strong> than
              you currently save. Save a little more after each pay rise (Fine-tune), or pick
              a later freedom age. Small steps add up.
            </p>
          </div>
        )}

        <p className="text-[11px] text-muted-foreground">
          {t.remittance > 0 ? "Money sent home is kept separate from your own costs. " : ""}
          Living costs are split 55 / 30 / 15 across essentials / discretionary / buffer as a
          rough guide. Savings follow your Fine-tune savings rate.
        </p>
      </CardContent>
    </Card>
  );
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: "emerald" | "amber" | "red";
}) {
  const color =
    highlight === "emerald"
      ? "text-emerald-600 dark:text-emerald-400"
      : highlight === "amber"
        ? "text-amber-600 dark:text-amber-400"
        : highlight === "red"
          ? "text-red-600 dark:text-red-400"
          : "text-foreground";
  return (
    <div className="rounded-md border border-border bg-card p-2">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={`text-sm font-bold tabular-nums sm:text-base ${color}`}>{value}</p>
    </div>
  );
}
