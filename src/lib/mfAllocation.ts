/**
 * Mutual-fund sub-allocation engine.
 *
 * Takes the coarse allocation from `calculateAllocation` (equity / bonds etc.)
 * and splits each sleeve into actionable fund categories:
 *
 *   Equity sleeve →
 *     large-cap, mid-cap, small-cap, flexi-cap, international
 *
 *   Debt sleeve →
 *     liquid, short-duration, corporate bond, long-gilt
 *
 * The split is driven by risk profile:
 *
 *                        large  mid   small flexi intl
 *   conservative         60%    10%    5%   10%   15%
 *   moderate             45%    20%   10%   10%   15%
 *   aggressive           30%    25%   20%   10%   15%
 *
 * The "international" slice is the international-equities percent already
 * decided by the top-level allocator, re-expressed as a share of the equity
 * sleeve so the split still sums to 100 and the math ties back cleanly.
 *
 * Debt split:
 *   conservative:  liquid 25 / short 45 / corp 20 / gilt 10
 *   moderate:      liquid 20 / short 40 / corp 25 / gilt 15
 *   aggressive:    liquid 15 / short 30 / corp 35 / gilt 20
 */

import type {
  AllocationResult,
  DebtSubAllocation,
  DebtSubCategory,
  EquitySubAllocation,
  EquitySubCategory,
  MFAllocation,
  RiskProfile,
} from "@/types";
import { round } from "@/lib/utils";

const EQUITY_SPLITS: Record<
  RiskProfile,
  Record<Exclude<EquitySubCategory, "international">, number>
> = {
  conservative: { large_cap: 0.7, mid_cap: 0.1, small_cap: 0.05, flexi_cap: 0.15 },
  moderate: { large_cap: 0.52, mid_cap: 0.2, small_cap: 0.1, flexi_cap: 0.18 },
  aggressive: { large_cap: 0.35, mid_cap: 0.28, small_cap: 0.2, flexi_cap: 0.17 },
};

const DEBT_SPLITS: Record<RiskProfile, Record<DebtSubCategory, number>> = {
  conservative: { liquid: 0.25, short_duration: 0.45, corporate_bond: 0.2, long_gilt: 0.1 },
  moderate: { liquid: 0.2, short_duration: 0.4, corporate_bond: 0.25, long_gilt: 0.15 },
  aggressive: { liquid: 0.15, short_duration: 0.3, corporate_bond: 0.35, long_gilt: 0.2 },
};

const EQUITY_RATIONALE: Record<EquitySubCategory, string> = {
  large_cap:
    "Top ~100 companies by market cap. Lower drawdowns, steadier compounding — the stability core of the equity sleeve.",
  mid_cap:
    "Ranks 101–250. Higher growth, higher volatility. Typically 8–10 years to express its edge.",
  small_cap:
    "Beyond rank 250. The most volatile sleeve — but historically the highest long-run CAGR when held through cycles.",
  flexi_cap:
    "Manager allocates across large/mid/small dynamically. A lower-decision-cost way to stay invested through regimes.",
  international:
    "Global diversification away from single-country risk. Pairs well with a home-index core.",
};

const DEBT_RATIONALE: Record<DebtSubCategory, string> = {
  liquid:
    "Cash-equivalent parking with overnight / 7-day securities. Used for the emergency corpus.",
  short_duration: "1–3 year duration. Lower interest-rate risk, steadier than long bonds.",
  corporate_bond: "High-grade corporate debt. Modest yield premium over government bonds.",
  long_gilt:
    "Long-duration government securities. Rate-sensitive, best suited for a falling-rate regime or duration matching.",
};

export function calculateMFAllocation(
  allocation: AllocationResult,
  risk: RiskProfile,
): MFAllocation {
  // Read the local vs international equity split from the top-level engine.
  const localEquity = allocation.breakdown.find((b) => b.asset === "equities_local")?.percent ?? 0;
  const intlEquity =
    allocation.breakdown.find((b) => b.asset === "equities_international")?.percent ?? 0;
  const bondsPercent =
    allocation.breakdown.find((b) => b.asset === "bonds_fixed_income")?.percent ?? 0;

  const totalEquity = localEquity + intlEquity;

  // Express local equity as a share of the equity sleeve, then split using the
  // risk-based weights for large/mid/small/flexi.
  const localShareOfEquity = totalEquity > 0 ? localEquity / totalEquity : 0;
  const intlShareOfEquity = totalEquity > 0 ? intlEquity / totalEquity : 0;

  const split = EQUITY_SPLITS[risk];
  // large_cap / mid_cap / small_cap / flexi_cap are all drawn from the LOCAL
  // slice (international is its own category, already decided upstream).
  const equity: EquitySubAllocation[] = (
    Object.entries(split) as Array<[Exclude<EquitySubCategory, "international">, number]>
  ).map(([category, w]) => {
    const percentOfEquity = round(w * localShareOfEquity * 100, 1);
    return {
      category,
      label: labelFor(category),
      percentOfEquity,
      percentOfPortfolio: round((percentOfEquity * totalEquity) / 100, 1),
      rationale: EQUITY_RATIONALE[category],
    };
  });
  equity.push({
    category: "international",
    label: "International Equities",
    percentOfEquity: round(intlShareOfEquity * 100, 1),
    percentOfPortfolio: round(intlEquity, 1),
    rationale: EQUITY_RATIONALE.international,
  });

  // Normalize rounding drift so equity sleeve sums to 100%.
  const equityPercentSum = equity.reduce((s, e) => s + e.percentOfEquity, 0);
  if (equityPercentSum > 0 && Math.abs(equityPercentSum - 100) > 0.05) {
    const factor = 100 / equityPercentSum;
    equity.forEach((e) => {
      e.percentOfEquity = round(e.percentOfEquity * factor, 1);
    });
  }

  const debtSplit = DEBT_SPLITS[risk];
  const debt: DebtSubAllocation[] = (
    Object.entries(debtSplit) as Array<[DebtSubCategory, number]>
  ).map(([category, w]) => {
    const percentOfDebt = round(w * 100, 1);
    return {
      category,
      label: labelFor(category),
      percentOfDebt,
      percentOfPortfolio: round((percentOfDebt * bondsPercent) / 100, 1),
      rationale: DEBT_RATIONALE[category],
    };
  });

  return { equity, debt };
}

function labelFor(c: EquitySubCategory | DebtSubCategory): string {
  switch (c) {
    case "large_cap":
      return "Large Cap";
    case "mid_cap":
      return "Mid Cap";
    case "small_cap":
      return "Small Cap";
    case "flexi_cap":
      return "Flexi / Multi Cap";
    case "international":
      return "International Equities";
    case "liquid":
      return "Liquid / Overnight";
    case "short_duration":
      return "Short Duration";
    case "corporate_bond":
      return "Corporate Bond";
    case "long_gilt":
      return "Long Duration Gilt";
  }
}
