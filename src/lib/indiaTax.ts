/**
 * India tax-saving layer for resident salaried users (FY 2025-26 rules).
 *
 * New regime (default since FY 2023-24): slabs 0–4L nil, 4–8L 5%, 8–12L 10%,
 *   12–16L 15%, 16–20L 20%, 20–24L 25%, above 30%. ₹75k standard deduction,
 *   87A rebate makes taxable income up to ₹12L tax-free. 80C and 80CCD(1B)
 *   deductions are NOT available.
 * Old regime: slabs 0–2.5L nil, 2.5–5L 5%, 5–10L 20%, above 30%. ₹50k standard
 *   deduction, 87A rebate up to ₹5L taxable. 80C up to ₹1.5L (EPF employee share
 *   counts), 80CCD(1B) extra ₹50k for NPS.
 * 4% health & education cess on both. Surcharge, HRA, home-loan interest and
 * marginal relief are not modelled.
 *
 * PPF interest and maturity are tax-free in both regimes.
 */

import type { RiskProfile } from "@/types";

export type TaxRegime = "old" | "new";

const CESS = 1.04;
const LIMIT_80C = 150_000;
const LIMIT_NPS_1B = 50_000;

function slabTax(taxable: number, slabs: Array<[number, number]>): number {
  let tax = 0;
  let lower = 0;
  for (const [upper, rate] of slabs) {
    if (taxable <= lower) break;
    tax += (Math.min(taxable, upper) - lower) * rate;
    lower = upper;
  }
  return tax;
}

export function newRegimeTax(grossAnnual: number): number {
  const taxable = Math.max(0, grossAnnual - 75_000);
  if (taxable <= 12_00_000) return 0;
  return (
    slabTax(taxable, [
      [4_00_000, 0],
      [8_00_000, 0.05],
      [12_00_000, 0.1],
      [16_00_000, 0.15],
      [20_00_000, 0.2],
      [24_00_000, 0.25],
      [Infinity, 0.3],
    ]) * CESS
  );
}

export function oldRegimeTax(grossAnnual: number, deductions: number): number {
  const taxable = Math.max(0, grossAnnual - 50_000 - deductions);
  if (taxable <= 5_00_000) return 0;
  return (
    slabTax(taxable, [
      [2_50_000, 0],
      [5_00_000, 0.05],
      [10_00_000, 0.2],
      [Infinity, 0.3],
    ]) * CESS
  );
}

export interface TaxBucket {
  key: "elss" | "ppf" | "nps" | "regular";
  label: string;
  monthly: number;
  why: string;
  /** Asset class it adds to — helps the user see it inside the allocation. */
  assetClass: "equity" | "debt" | "mixed";
}

export interface IndiaTaxPlan {
  regime: TaxRegime;
  epfMonthly: number;
  buckets: TaxBucket[];
  deductions: number;
  /** Tax with the suggested accounts, under the chosen regime. */
  taxWithPlan: number;
  /** Tax saved versus not using these accounts (old regime only). */
  taxSaved: number;
  compare: { oldTax: number; newTax: number; better: TaxRegime; difference: number };
}

export interface IndiaTaxInput {
  grossAnnual: number;
  basicMonthly: number;
  monthlySIP: number;
  regime: TaxRegime;
  risk: RiskProfile;
}

/** Share of the 80C room that goes to ELSS (rest to PPF), by risk profile. */
const ELSS_SHARE: Record<RiskProfile, number> = {
  aggressive: 1,
  moderate: 0.5,
  conservative: 0.25,
};

/** New regime: PPF for tax-free debt even without a deduction. */
const NEW_REGIME_PPF_MONTHLY: Record<RiskProfile, number> = {
  aggressive: 0,
  moderate: 6_250,
  conservative: 12_500,
};

export function planIndiaTax(input: IndiaTaxInput): IndiaTaxPlan {
  const { grossAnnual, basicMonthly, regime, risk } = input;
  const sip = Math.max(0, input.monthlySIP);
  const epfMonthly = Math.round(basicMonthly * 0.12);
  const epfAnnual = epfMonthly * 12;

  let remaining = sip;
  const take = (want: number) => {
    const v = Math.max(0, Math.min(Math.round(want), remaining));
    remaining -= v;
    return v;
  };

  const buckets: TaxBucket[] = [];
  if (regime === "old") {
    const room80C = Math.max(0, LIMIT_80C - epfAnnual);
    const elss = take((room80C * ELSS_SHARE[risk]) / 12);
    const ppf = take((room80C * (1 - ELSS_SHARE[risk])) / 12);
    const nps = take(LIMIT_NPS_1B / 12);
    if (elss > 0)
      buckets.push({ key: "elss", label: "ELSS mutual fund", monthly: elss, assetClass: "equity",
        why: "Equity fund with the shortest 80C lock-in (3 years)." });
    if (ppf > 0)
      buckets.push({ key: "ppf", label: "PPF", monthly: ppf, assetClass: "debt",
        why: "Government-backed, tax-free interest. 15-year lock-in — this is your safe debt." });
    if (nps > 0)
      buckets.push({ key: "nps", label: "NPS Tier 1", monthly: nps, assetClass: "mixed",
        why: "Extra ₹50k deduction under 80CCD(1B), on top of 80C. Locked till 60." });
  } else {
    const ppf = take(NEW_REGIME_PPF_MONTHLY[risk]);
    if (ppf > 0)
      buckets.push({ key: "ppf", label: "PPF", monthly: ppf, assetClass: "debt",
        why: "No deduction in the new regime, but interest stays tax-free — the cleanest safe debt." });
  }
  buckets.push({
    key: "regular",
    label: regime === "old" ? "Regular mutual funds / index funds" : "Low-cost index funds",
    monthly: remaining,
    assetClass: "mixed",
    why:
      regime === "old"
        ? "Everything left after the tax-saving accounts, invested per your allocation."
        : "ELSS gives no deduction in the new regime, so cheaper index funds do the same job without a lock-in.",
  });

  const annual = (key: TaxBucket["key"]) =>
    (buckets.find((b) => b.key === key)?.monthly ?? 0) * 12;

  const ded80C = Math.min(LIMIT_80C, epfAnnual + annual("elss") + annual("ppf"));
  const dedNPS = Math.min(LIMIT_NPS_1B, annual("nps"));
  // Regime comparison assumes the old regime is used properly: full 80C + NPS.
  const oldTax = oldRegimeTax(grossAnnual, LIMIT_80C + LIMIT_NPS_1B);
  const newTax = newRegimeTax(grossAnnual);

  const deductions = regime === "old" ? ded80C + dedNPS : 0;
  const taxWithPlan = regime === "old" ? oldRegimeTax(grossAnnual, deductions) : newTax;
  const taxSaved = regime === "old" ? Math.max(0, oldRegimeTax(grossAnnual, epfAnnual) - taxWithPlan) : 0;

  return {
    regime,
    epfMonthly,
    buckets,
    deductions,
    taxWithPlan,
    taxSaved,
    compare: {
      oldTax,
      newTax,
      better: oldTax < newTax ? "old" : "new",
      difference: Math.abs(oldTax - newTax),
    },
  };
}
