/**
 * Sinking-fund math for lumpy life goals — child's education, parents'
 * healthcare reserve, home down payment, kid's wedding.
 *
 * Each goal is independent: we compute the future value at the target year
 * (target × (1 + inflation)^years), then the monthly SIP required to grow $0
 * into that future value at the user's expected return.
 *
 * The goals SIP is ADDITIVE to the FIRE SIP — a FIRE plan says "how much you
 * need to stop working forever"; a goal says "how much you need for this
 * specific spike". They fund different buckets.
 */

import type { Goal, GoalProjection } from "@/types";
import { monthlyInvestmentFor } from "@/lib/freedom";

/** Recompute one goal against current inflation/return assumptions. */
export function projectGoal(
  goal: Goal,
  currentYear: number,
  inflationRate: number,
  expectedReturn: number,
): GoalProjection {
  const yearsToTarget = Math.max(0, goal.targetYear - currentYear);
  const futureAmount =
    goal.targetAmountToday * Math.pow(1 + inflationRate, yearsToTarget);
  // Sinking fund starts from 0 — the FIRE corpus stays untouched for the goal.
  const monthlySIP = monthlyInvestmentFor(0, futureAmount, yearsToTarget, expectedReturn);
  return { goal, yearsToTarget, futureAmount, monthlySIP };
}

/** Total monthly SIP across all goals. Nulls (unreachable) are skipped. */
export function totalGoalsMonthlySIP(projections: GoalProjection[]): number {
  return projections.reduce((sum, p) => sum + (p.monthlySIP ?? 0), 0);
}

/**
 * Preset library — realistic "today's-money" amounts a common-man Indian /
 * Gulf-expat household is likely to face. Amounts are LOCAL currency and get
 * converted to the user's retirement currency at pick time by the UI.
 *
 * We express presets in USD to keep the table country-agnostic, and let the
 * caller multiply by `retirementCountry.fxRateToUSD` for a realistic default.
 */
export const GOAL_PRESETS_USD: Array<{
  category: Goal["category"];
  name: string;
  amountUSD: number;
  yearsFromNow: number;
  emoji: string;
}> = [
  {
    category: "education",
    name: "Child's undergrad (local)",
    amountUSD: 5000, // ~₹4L today for a private tier-2 college; ~AED 20K
    yearsFromNow: 15,
    emoji: "🎓",
  },
  {
    category: "education",
    name: "Child's undergrad (foreign)",
    amountUSD: 180_000,
    yearsFromNow: 15,
    emoji: "🌏",
  },
  {
    category: "education",
    name: "Child's postgraduate / MBA",
    amountUSD: 25_000,
    yearsFromNow: 20,
    emoji: "🎓",
  },
  {
    category: "wedding",
    name: "Child's wedding",
    amountUSD: 25_000,
    yearsFromNow: 25,
    emoji: "💍",
  },
  {
    category: "parents",
    name: "Parents' healthcare reserve",
    amountUSD: 25_000,
    yearsFromNow: 5,
    emoji: "👵",
  },
  {
    category: "home",
    name: "Home down payment",
    amountUSD: 40_000,
    yearsFromNow: 5,
    emoji: "🏠",
  },
  {
    category: "home",
    name: "Land / plot purchase",
    amountUSD: 30_000,
    yearsFromNow: 8,
    emoji: "🌾",
  },
  {
    category: "vehicle",
    name: "New car",
    amountUSD: 20_000,
    yearsFromNow: 5,
    emoji: "🚗",
  },
  {
    category: "travel",
    name: "Foreign vacation",
    amountUSD: 6_000,
    yearsFromNow: 3,
    emoji: "✈️",
  },
  {
    category: "medical",
    name: "Medical emergency reserve",
    amountUSD: 15_000,
    yearsFromNow: 2,
    emoji: "🏥",
  },
];

/** Emoji + label lookup for a category. */
export function categoryMeta(cat: Goal["category"]): { emoji: string; label: string } {
  const map: Record<Goal["category"], { emoji: string; label: string }> = {
    education: { emoji: "🎓", label: "Education" },
    wedding: { emoji: "💍", label: "Wedding" },
    home: { emoji: "🏠", label: "Home / Land" },
    medical: { emoji: "🏥", label: "Medical" },
    vehicle: { emoji: "🚗", label: "Vehicle" },
    travel: { emoji: "✈️", label: "Travel" },
    parents: { emoji: "👵", label: "Parents" },
    other: { emoji: "🎯", label: "Other" },
  };
  return map[cat] ?? { emoji: "🎯", label: "Other" };
}
