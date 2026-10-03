import { useMemo, useState } from "react";
import { Landmark, Lightbulb } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Term } from "@/components/ui/term";
import { planIndiaTax, type TaxRegime } from "@/lib/indiaTax";
import { formatCurrency } from "@/lib/formatters";
import type { CountryProfile, RiskProfile } from "@/types";

interface Props {
  country: CountryProfile; // India
  monthlyIncome: number; // take-home
  monthlySIP: number;
  risk: RiskProfile;
}

const ASSET_CHIP: Record<string, string> = {
  equity: "bg-orange-500/10 text-orange-700 dark:text-orange-300",
  debt: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  mixed: "bg-muted text-muted-foreground",
};

/**
 * Shows how a resident Indian's monthly SIP should flow through EPF / PPF /
 * ELSS / NPS before regular funds — and, crucially, whether any of that
 * saves tax under the regime they're actually on.
 */
export function IndiaTaxCard({ country, monthlyIncome, monthlySIP, risk }: Props) {
  const defaultGross = Math.round((monthlyIncome * 12 * 1.25) / 10_000) * 10_000;
  const [gross, setGross] = useState(defaultGross);
  const [basic, setBasic] = useState(Math.round((defaultGross * 0.4) / 12 / 1000) * 1000);
  const [regime, setRegime] = useState<TaxRegime>("new");

  const plan = useMemo(
    () => planIndiaTax({ grossAnnual: gross, basicMonthly: basic, monthlySIP, regime, risk }),
    [gross, basic, monthlySIP, regime, risk],
  );

  const inr = (v: number) => formatCurrency(v, country);
  const inrC = (v: number) => formatCurrency(v, country, { compact: true });
  const { compare } = plan;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Landmark className="h-5 w-5 text-orange-500" />
          India tax-saving accounts
          <span className="ml-auto rounded-full bg-orange-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-orange-600 dark:text-orange-400">
            Fill these first
          </span>
        </CardTitle>
        <CardDescription>
          Before your SIP goes into regular funds, route part of it through{" "}
          <Term>EPF</Term>, <Term>PPF</Term>, <Term>ELSS</Term> and <Term>NPS</Term>. Whether
          that saves tax depends on which regime you file under — so start there.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <Label htmlFor="tax-gross" className="text-xs">
              Annual gross salary (₹)
            </Label>
            <Input
              id="tax-gross"
              type="number"
              min={0}
              value={gross || ""}
              onChange={(e) => setGross(Number(e.target.value) || 0)}
            />
            <p className="text-[11px] text-muted-foreground">
              Before tax and EPF — on your payslip or Form 16. Pre-filled from your take-home.
            </p>
          </div>
          <div className="space-y-1">
            <Label htmlFor="tax-basic" className="text-xs">
              Basic salary per month (₹)
            </Label>
            <Input
              id="tax-basic"
              type="number"
              min={0}
              value={basic || ""}
              onChange={(e) => setBasic(Number(e.target.value) || 0)}
            />
            <p className="text-[11px] text-muted-foreground">
              EPF is 12% of this. Usually 40–50% of gross.
            </p>
          </div>
        </div>

        {/* Regime picker + recommendation */}
        <div className="space-y-2">
          <Label className="text-xs">Which tax regime do you file under?</Label>
          <div className="grid grid-cols-2 gap-2">
            {(["new", "old"] as TaxRegime[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRegime(r)}
                className={`rounded-md border px-3 py-2 text-xs font-medium transition ${
                  regime === r
                    ? "border-orange-500 bg-orange-500/10 text-orange-700 dark:text-orange-300"
                    : "border-border text-muted-foreground hover:bg-muted/40"
                }`}
              >
                {r === "new" ? "New regime (default)" : "Old regime"}
              </button>
            ))}
          </div>
          <div className="flex items-start gap-2 rounded-md border border-primary/30 bg-primary/5 p-2.5 text-xs">
            <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <p>
              On a {inrC(gross)} salary: new regime tax ≈ <strong>{inr(compare.newTax)}</strong>,
              old regime with full 80C + NPS ≈ <strong>{inr(compare.oldTax)}</strong>.{" "}
              {compare.difference < 5_000 ? (
                <>They're roughly equal for you.</>
              ) : (
                <>
                  The <strong>{compare.better} regime</strong> saves about{" "}
                  <strong>{inr(compare.difference)}/yr</strong>.
                </>
              )}{" "}
              HRA and home-loan interest aren't included — they can tip the balance toward the
              old regime.
            </p>
          </div>
        </div>

        {/* EPF note */}
        <p className="text-xs text-muted-foreground">
          <strong className="text-foreground">{inr(plan.epfMonthly)}/month</strong> already goes
          to EPF from your salary (12% of basic, plus an equal employer share). That's on top
          of your SIP — add your EPF balance under My assets so it counts toward FIRE.
        </p>

        {/* Bucket table */}
        <div className="overflow-x-auto rounded-md border border-border">
          <table className="w-full text-xs">
            <thead className="bg-muted/40 uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-2 py-1.5 text-left font-medium">Account</th>
                <th className="px-2 py-1.5 text-right font-medium">Per month</th>
                <th className="px-2 py-1.5 text-right font-medium">Per year</th>
                <th className="hidden px-2 py-1.5 text-left font-medium sm:table-cell">Why</th>
              </tr>
            </thead>
            <tbody>
              {plan.buckets.map((b) => (
                <tr key={b.key} className="border-t border-border align-top">
                  <td className="px-2 py-1.5">
                    <span className="font-medium">{b.label}</span>
                    <span className={`ml-1.5 rounded px-1.5 py-0.5 text-[10px] ${ASSET_CHIP[b.assetClass]}`}>
                      {b.assetClass}
                    </span>
                    <p className="mt-0.5 text-[11px] text-muted-foreground sm:hidden">{b.why}</p>
                  </td>
                  <td className="px-2 py-1.5 text-right tabular-nums font-semibold">{inr(b.monthly)}</td>
                  <td className="px-2 py-1.5 text-right tabular-nums">{inr(b.monthly * 12)}</td>
                  <td className="hidden px-2 py-1.5 text-muted-foreground sm:table-cell">{b.why}</td>
                </tr>
              ))}
              <tr className="border-t-2 border-border bg-muted/30 font-semibold">
                <td className="px-2 py-1.5">Your monthly SIP</td>
                <td className="px-2 py-1.5 text-right tabular-nums">{inr(monthlySIP)}</td>
                <td className="px-2 py-1.5 text-right tabular-nums">{inr(monthlySIP * 12)}</td>
                <td className="hidden sm:table-cell" />
              </tr>
            </tbody>
          </table>
        </div>

        {regime === "old" ? (
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-border p-3">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Deductions claimed</p>
              <p className="mt-1 text-lg font-bold tabular-nums">{inr(plan.deductions)}</p>
              <p className="text-[11px] text-muted-foreground">80C (incl. EPF) + 80CCD(1B)</p>
            </div>
            <div className="rounded-lg border-2 border-emerald-500/50 bg-emerald-500/5 p-3">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Tax saved per year</p>
              <p className="mt-1 text-lg font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                {inr(plan.taxSaved)}
              </p>
              <p className="text-[11px] text-muted-foreground">vs using only EPF for 80C</p>
            </div>
          </div>
        ) : (
          <p className="rounded-md border border-border bg-muted/30 p-2.5 text-xs text-muted-foreground">
            Under the new regime these accounts give <strong>no deduction</strong>, so there's
            no reason to lock money into ELSS. PPF still earns tax-free interest. Ask HR about{" "}
            <strong>employer NPS (80CCD(2))</strong> — up to 14% of basic is deductible even in
            the new regime.
          </p>
        )}

        <p className="text-[11px] text-muted-foreground">
          FY 2025-26 rules, including 4% cess. Surcharge, HRA, home-loan interest and other
          deductions aren't modelled. Educational estimate — confirm with a CA before filing.
        </p>
      </CardContent>
    </Card>
  );
}
