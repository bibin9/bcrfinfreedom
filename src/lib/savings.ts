/**
 * Realistic monthly-savings defaults.
 *
 * A flat 30% savings rate is fine for a well-paid professional but fantasy
 * for a Gulf worker who sends half his salary home. So the suggestion starts
 * from what's left AFTER money sent to family, and takes 20% of that.
 */

export const SUGGESTED_SAVE_FRACTION = 0.2;

/** Round to 2 significant figures so the suggestion reads like a human number. */
function friendly(n: number): number {
  if (n <= 0) return 0;
  return Number(n.toPrecision(2));
}

/** Money left each month after sending money home (never negative). */
export function leftAfterRemittance(monthlyIncome: number, monthlyRemittance = 0): number {
  return Math.max(0, monthlyIncome - Math.max(0, monthlyRemittance));
}

/** Suggested monthly savings, in the same currency as the income. */
export function suggestedMonthlySavings(monthlyIncome: number, monthlyRemittance = 0): number {
  return friendly(leftAfterRemittance(monthlyIncome, monthlyRemittance) * SUGGESTED_SAVE_FRACTION);
}

/** Savings amount → savings rate (fraction of income), clamped to 0..1. */
export function savingsRateFromAmount(monthlyIncome: number, monthlySavings: number): number {
  if (monthlyIncome <= 0) return 0;
  return Math.min(1, Math.max(0, monthlySavings / monthlyIncome));
}
