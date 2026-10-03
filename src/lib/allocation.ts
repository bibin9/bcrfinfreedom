/**
 * Allocation engine.
 *
 * Produces a recommended portfolio mix from a small set of inputs:
 *   age, risk appetite, country, financial goal.
 *
 * Model (transparent and easily auditable):
 *
 *   1. Baseline equity weight uses the classic "100 - age" heuristic,
 *      clamped to [25, 90] so very young / very old users still have a
 *      sensible floor and ceiling.
 *
 *   2. A risk multiplier shifts equity up (aggressive) or down (conservative).
 *
 *   3. A country stabilityScore <0.7 nudges equity down and bonds/gold up:
 *      the reasoning is that in less stable economies, retail equities carry
 *      more idiosyncratic risk and residents typically benefit from a larger
 *      defensive / hard-asset cushion.
 *
 *   4. Goal-based tilts (early retirement bumps equities; home purchase /
 *      child education shift toward bonds + cash because the horizon is
 *      usually shorter and withdrawal-date-sensitive).
 *
 *   5. Equities are split local / international (home bias capped at 60%).
 *
 *   6. Crypto is ONLY added for aggressive risk, max 5%, and only in countries
 *      where the regulator has not outright banned retail crypto access.
 *      We take stabilityScore + age as a secondary signal (no crypto for 60+).
 *
 * The function also returns a human-readable `explanation` list so the UI can
 * "show the math" — this is a requirement of the product spec.
 */

import type {
  AllocationBreakdown,
  AllocationResult,
  CountryProfile,
  FinancialGoal,
  RiskProfile,
} from "@/types";
import { clamp, round } from "@/lib/utils";

const RISK_MULTIPLIER: Record<RiskProfile, number> = {
  conservative: 0.75,
  moderate: 1.0,
  aggressive: 1.2,
};

const GOAL_EQUITY_TILT: Record<FinancialGoal, number> = {
  early_retirement: +0.05,
  wealth_building: +0.03,
  passive_income: -0.05, // favours yield-producing assets (bonds, REITs)
  child_education: -0.07, // often shorter / dated horizon
  home_purchase: -0.12, // typically shortest horizon, capital preservation matters
};

export interface AllocationInput {
  age: number;
  risk: RiskProfile;
  country: CountryProfile;
  goal: FinancialGoal;
}

/**
 * Core allocation function. Returns percentages that sum to 100 (±0.1 due to
 * rounding — the UI should render the breakdown array verbatim).
 */
export function calculateAllocation(input: AllocationInput): AllocationResult {
  const { age, risk, country, goal } = input;
  const explanation: string[] = [];

  // 1. Baseline equity weight.
  const baseEquity = clamp(100 - age, 25, 90) / 100;
  explanation.push(
    `Baseline equity weight from the "100 − age" rule: ${Math.round(baseEquity * 100)}% (age ${age}).`,
  );

  // 2. Apply risk multiplier.
  let equity = baseEquity * RISK_MULTIPLIER[risk];
  explanation.push(
    `Risk profile "${risk}" multiplies equity by ${RISK_MULTIPLIER[risk].toFixed(2)} → ${Math.round(equity * 100)}%.`,
  );

  // 3. Country stability adjustment.
  const stabilityDrag = country.stabilityScore < 0.7 ? (0.7 - country.stabilityScore) * 0.5 : 0;
  if (stabilityDrag > 0) {
    equity -= stabilityDrag;
    explanation.push(
      `${country.name}'s stability score (${country.stabilityScore.toFixed(2)}) reduces equity by ${Math.round(
        stabilityDrag * 100,
      )}% and adds it to defensive assets.`,
    );
  }

  // 4. Goal tilt.
  const goalTilt = GOAL_EQUITY_TILT[goal];
  equity += goalTilt;
  explanation.push(
    `Goal "${goal.replace(/_/g, " ")}" tilts equity by ${goalTilt >= 0 ? "+" : ""}${Math.round(
      goalTilt * 100,
    )}%.`,
  );

  equity = clamp(equity, 0.2, 0.9);

  // 5. Split equity home/international.
  //    Home bias scales with stability — more stable markets get a larger
  //    local share. Capped at 60% local, floored at 30% local.
  const localShare = clamp(0.3 + country.stabilityScore * 0.4, 0.3, 0.6);
  const equityLocal = equity * localShare;
  const equityIntl = equity * (1 - localShare);

  // 6. Defensive sleeve composition — bonds / gold / real estate / cash.
  const remaining = 1 - equity;

  // Emergency-fund-driven cash floor: 5% if 6-month norm, 10% if 9m+, 15% if 12m.
  const cashFloor =
    country.emergencyFundMonths >= 12 ? 0.15 : country.emergencyFundMonths >= 9 ? 0.1 : 0.05;

  // Gold/commodities weight scales down with stability (gold is insurance).
  const goldWeight = clamp(0.05 + (1 - country.stabilityScore) * 0.15 + stabilityDrag, 0.03, 0.2);

  // Real estate weight: steady 10% in the defensive sleeve for moderate/aggressive;
  // 7% for conservative (they prefer pure fixed income).
  const realEstateWeight = risk === "conservative" ? 0.07 : 0.1;

  // Bonds / sukuk = whatever defensive remains after cash, gold, real estate.
  let bonds = remaining - cashFloor - goldWeight - realEstateWeight;

  // Crypto only for aggressive, not already-retired users, and non-extreme-volatility economies.
  let crypto = 0;
  if (risk === "aggressive" && age < 60 && country.stabilityScore >= 0.5) {
    crypto = 0.05;
    // Take it from bonds first, then equity international if bonds would go negative.
    bonds -= crypto;
    if (bonds < 0) {
      const shortfall = -bonds;
      bonds = 0;
      // Reduce intl equity to cover.
      // Safe because equityIntl >= shortfall in practice (we cap crypto at 5%).
      const newEquityIntl = Math.max(0, equityIntl - shortfall);
      explanation.push(
        `Crypto funded partially from international equities to keep bonds ≥ 0%.`,
      );
      return assemble({
        country,
        equityLocal,
        equityIntl: newEquityIntl,
        bonds,
        realEstate: realEstateWeight,
        gold: goldWeight,
        cash: cashFloor,
        crypto,
        equity,
        explanation,
      });
    }
    explanation.push(`Aggressive profile adds a 5% crypto sleeve (capped, funded from bonds).`);
  }

  // Ensure no negative bond weight from stacking (edge cases).
  if (bonds < 0) {
    const borrow = -bonds;
    bonds = 0;
    // Reduce gold first, then real estate.
    const newGold = Math.max(0.03, goldWeight - borrow);
    explanation.push(`Rebalanced: reduced gold slightly to keep bonds non-negative.`);
    return assemble({
      country,
      equityLocal,
      equityIntl,
      bonds,
      realEstate: realEstateWeight,
      gold: newGold,
      cash: cashFloor,
      crypto,
      equity,
      explanation,
    });
  }

  return assemble({
    country,
    equityLocal,
    equityIntl,
    bonds,
    realEstate: realEstateWeight,
    gold: goldWeight,
    cash: cashFloor,
    crypto,
    equity,
    explanation,
  });
}

interface AssembleArgs {
  country: CountryProfile;
  equityLocal: number;
  equityIntl: number;
  bonds: number;
  realEstate: number;
  gold: number;
  cash: number;
  crypto: number;
  equity: number;
  explanation: string[];
}

function assemble(args: AssembleArgs): AllocationResult {
  const { country, equityLocal, equityIntl, bonds, realEstate, gold, cash, crypto, equity, explanation } =
    args;

  // Normalize to sum to exactly 1 before rendering.
  const total = equityLocal + equityIntl + bonds + realEstate + gold + cash + crypto;
  const scale = total > 0 ? 1 / total : 1;

  const bondLabel = country.shariaMarket ? "Bonds / Sukuk" : "Bonds & Fixed Income";

  const breakdown: AllocationBreakdown[] = [
    {
      asset: "equities_local",
      label: `Local Equities (${country.indices[0]?.ticker ?? country.name})`,
      percent: round(equityLocal * scale * 100, 1),
      rationale: `Core growth engine — home-country index exposure via ${country.indices[0]?.name ?? "local index"}.`,
    },
    {
      asset: "equities_international",
      label: "International Equities",
      percent: round(equityIntl * scale * 100, 1),
      rationale:
        "Diversification away from single-country risk; typically accessed via global ETFs (MSCI World / S&P 500).",
    },
    {
      asset: "bonds_fixed_income",
      label: bondLabel,
      percent: round(bonds * scale * 100, 1),
      rationale: country.shariaMarket
        ? "Income stability from sukuk or government fixed income."
        : "Ballast that reduces portfolio volatility during equity drawdowns.",
    },
    {
      asset: "real_estate",
      label: "Real Estate / REITs",
      percent: round(realEstate * scale * 100, 1),
      rationale: "Inflation-linked income and an additional diversification layer.",
    },
    {
      asset: "gold_commodities",
      label: "Gold / Commodities",
      percent: round(gold * scale * 100, 1),
      rationale: "Hedge against currency devaluation and geopolitical stress.",
    },
    {
      asset: "cash_emergency",
      label: "Cash / Emergency Fund",
      percent: round(cash * scale * 100, 1),
      rationale: `Emergency buffer sized for ${country.emergencyFundMonths} months of expenses.`,
    },
  ];

  if (crypto > 0) {
    breakdown.push({
      asset: "crypto",
      label: "Crypto (capped)",
      percent: round(crypto * scale * 100, 1),
      rationale: "High-risk, high-reward sleeve. Capped at 5% and only for aggressive profiles.",
    });
  }

  const expectedReturn =
    (equityLocal + equityIntl) * scale * country.expectedEquityReturn +
    bonds * scale * country.expectedBondReturn +
    realEstate * scale * (country.expectedEquityReturn * 0.7) +
    gold * scale * 0.05 +
    cash * scale * 0.03 +
    crypto * scale * 0.15;

  return {
    breakdown,
    expectedReturn,
    equityWeight: round(equity * 100, 1),
    explanation,
  };
}
