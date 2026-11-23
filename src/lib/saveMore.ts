/**
 * "What if I saved a little more each month?"
 *
 * Re-runs the same freedom calculation with only the savings rate changed, so
 * everything else (spending, target age, expected return, inflation) is
 * identical in both scenarios. The extra amount is in the currency the person
 * earns in; it is turned into a savings rate against their monthly income.
 */

import { calculateFreedom, type FreedomInput } from "@/lib/freedom";
import type { FreedomProjection } from "@/types";

export interface SaveMoreResult {
  /** Savings rate with the extra amount added (capped at 90% of income). */
  newRate: number;
  /** The extra amount that was actually applied (may be lower than asked if capped). */
  appliedExtra: number;
  freedom: FreedomProjection;
  /** Age freedom is reached at the new rate (null = never). */
  age: number | null;
  /** Whole years sooner than today's rate (null if either never reaches). */
  yearsSooner: number | null;
}

export function ageAtRate(age: number, f: FreedomProjection): number | null {
  return f.yearsToFreedomAtCurrentRate != null ? Math.round(age + f.yearsToFreedomAtCurrentRate) : null;
}

export function computeSaveMore(
  base: FreedomInput,
  baseFreedom: FreedomProjection,
  extraMonthly: number,
): SaveMoreResult | null {
  if (!(base.monthlyIncome > 0) || !(extraMonthly > 0)) return null;
  const baseRate = base.savingsRate ?? 0;
  const newRate = Math.min(0.9, baseRate + extraMonthly / base.monthlyIncome);
  const appliedExtra = (newRate - baseRate) * base.monthlyIncome;
  if (appliedExtra <= 0) return null;
  const freedom = calculateFreedom({ ...base, savingsRate: newRate });
  const age = ageAtRate(base.age, freedom);
  const baseAge = ageAtRate(base.age, baseFreedom);
  return {
    newRate,
    appliedExtra,
    freedom,
    age,
    yearsSooner: age != null && baseAge != null ? baseAge - age : null,
  };
}

/** Round to a friendly 1/2/5 × 10^k step so buttons read "AED 200", not "AED 187". */
export function niceStep(value: number): number {
  if (!(value > 0)) return 0;
  const pow = Math.pow(10, Math.floor(Math.log10(value)));
  const m = value / pow;
  const nice = m < 1.5 ? 1 : m < 3.5 ? 2 : m < 7.5 ? 5 : 10;
  return nice * pow;
}

/** Three sensible "save a bit more" amounts: about 2%, 5% and 10% of monthly income. */
export function extraPresets(monthlyIncome: number): number[] {
  const out = [0.02, 0.05, 0.1].map((p) => niceStep(monthlyIncome * p)).filter((n) => n > 0);
  return Array.from(new Set(out));
}
