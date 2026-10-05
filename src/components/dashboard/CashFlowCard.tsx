import { useMemo } from "react";
import { AlertTriangle, Waves } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CashFlowSankey } from "@/components/charts/CashFlowSankey";
import { buildCashFlow } from "@/lib/cashflow";
import { convertCurrency } from "@/lib/fx";
import { projectGoal } from "@/lib/goals";
import type { CountryProfile, FreedomProjection, Goal } from "@/types";
import { formatCurrency } from "@/lib/formatters";
import { useI18n } from "@/i18n";

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
  const { t: tr } = useI18n();
  const d = (key: string, vars?: Record<string, string | number>) => tr(`dash.cashflow.${key}`, vars);
  const raw = useMemo(() => {
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

  // Translate the fixed node labels; goal nodes keep the user's own goal names.
  const data = useMemo(() => {
    const pct = raw.totals.income > 0 ? Math.round((raw.totals.savings / raw.totals.income) * 100) : 0;
    return {
      ...raw,
      nodes: raw.nodes.map((n) => {
        if (n.id.startsWith("goal_")) return { ...n, sub: tr("dash.cashflow.node.goalSub") };
        if (n.id === "savings")
          return { ...n, label: d("node.savings"), sub: d("node.savingsSub", { pct }) };
        return { ...n, label: d(`node.${n.id}`), sub: d(`node.${n.id}Sub`) };
      }),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [raw, tr]);

  const t = data.totals;
  const savingsRatePct = t.income > 0 ? (t.savings / t.income) * 100 : 0;
  const fmt = (v: number) => formatCurrency(v, country, { compact: true });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Waves className="h-5 w-5 text-orange-500" />
          {d("title")}
          <span className="ms-auto rounded-full bg-orange-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-orange-600 dark:text-orange-400">
            {d("badge")}
          </span>
        </CardTitle>
        <CardDescription>{d("desc")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <CashFlowSankey data={data} country={country} />

        <div
          className={`grid grid-cols-2 gap-2 ${t.remittance > 0 ? "sm:grid-cols-5" : "sm:grid-cols-4"}`}
        >
          <Stat label={d("statIncome")} value={fmt(t.income)} />
          {t.remittance > 0 && <Stat label={d("statSent")} value={fmt(t.remittance)} />}
          <Stat label={d("statLiving")} value={fmt(t.spending)} />
          <Stat label={d("statSaving")} value={fmt(t.savings)} />
          <Stat
            label={d("statRate")}
            value={`${savingsRatePct.toFixed(0)}%`}
            highlight={savingsRatePct >= 20 ? "emerald" : savingsRatePct >= 10 ? "amber" : "red"}
          />
        </div>

        {t.shortfall > 0 && (
          <div className="flex items-start gap-2 rounded-md border border-amber-500/40 bg-amber-500/5 p-2.5 text-xs">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
            <p>{d("shortfall", { amount: fmt(t.shortfall) })}</p>
          </div>
        )}

        <p className="text-[11px] text-muted-foreground">
          {t.remittance > 0 ? `${d("noteRemit")} ` : ""}
          {d("noteSplit")}
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
