/**
 * Future windfall / lump-sum math.
 *
 * A windfall is money the user EXPECTS to receive on a specific future year:
 * EOSB (end-of-service gratuity), inheritance, property sale, bonus, severance,
 * insurance payout, pension commutation.
 *
 * For FIRE planning: each windfall grows at the expected return from its
 * receipt date to the retirement date. The sum of those future values is a
 * credit against the FIRE target → reduces the required monthly SIP.
 */

import type { Windfall, WindfallCategory } from "@/types";

const CATEGORY_META: Record<WindfallCategory, { emoji: string; label: string }> = {
  eosb: { emoji: "💼", label: "EOSB / End-of-service" },
  inheritance: { emoji: "🏛️", label: "Inheritance" },
  property_sale: { emoji: "🏠", label: "Property sale" },
  bonus: { emoji: "💰", label: "Big bonus / RSU vest" },
  severance: { emoji: "📄", label: "Severance" },
  insurance_payout: { emoji: "🛡️", label: "Insurance payout" },
  pension_commute: { emoji: "🏦", label: "Pension lump-sum" },
  other: { emoji: "🎁", label: "Other" },
};

export function windfallCategoryMeta(c: WindfallCategory) {
  return CATEGORY_META[c] ?? CATEGORY_META.other;
}

export const WINDFALL_CATEGORIES: WindfallCategory[] = [
  "eosb",
  "inheritance",
  "property_sale",
  "bonus",
  "severance",
  "insurance_payout",
  "pension_commute",
  "other",
];

export interface WindfallPreset {
  category: WindfallCategory;
  name: string;
  /** Amount in USD today — scaled by retirement-country FX by the caller. */
  amountUSD: number;
  /** Rough default year offset from now (user adjusts). */
  yearsFromNow: number;
}

export const WINDFALL_PRESETS_USD: WindfallPreset[] = [
  { category: "eosb", name: "UAE End-of-Service (EOSB)", amountUSD: 40_000, yearsFromNow: 10 },
  { category: "property_sale", name: "Flat / villa sale", amountUSD: 150_000, yearsFromNow: 15 },
  { category: "inheritance", name: "Parental inheritance", amountUSD: 100_000, yearsFromNow: 20 },
  { category: "bonus", name: "Big one-off bonus / RSU vest", amountUSD: 20_000, yearsFromNow: 3 },
  { category: "severance", name: "Severance package", amountUSD: 30_000, yearsFromNow: 5 },
  {
    category: "pension_commute",
    name: "Pension lump-sum commutation",
    amountUSD: 50_000,
    yearsFromNow: 25,
  },
  {
    category: "insurance_payout",
    name: "LIC endowment maturity",
    amountUSD: 15_000,
    yearsFromNow: 10,
  },
];

export interface WindfallProjection {
  windfall: Windfall;
  yearsUntilReceipt: number;
  /** FV at retirement age — compounded forward at the expected return. */
  valueAtRetirement: number;
}

/** Discount every windfall to its future value at retirement age. */
export function projectWindfalls(
  windfalls: Windfall[],
  currentYear: number,
  retirementYear: number,
  expectedReturn: number,
): WindfallProjection[] {
  return windfalls.map((w) => {
    const yearsUntilReceipt = Math.max(0, w.targetYear - currentYear);
    const yearsBetweenReceiptAndRetirement = Math.max(0, retirementYear - w.targetYear);
    // If received before retirement → compound to retirement.
    // If received AT or AFTER retirement → use nominal (already in retirement window).
    const fv = w.amount * Math.pow(1 + expectedReturn, yearsBetweenReceiptAndRetirement);
    return {
      windfall: w,
      yearsUntilReceipt,
      valueAtRetirement: fv,
    };
  });
}

/** Sum of future values at retirement — credit against the FIRE target. */
export function totalWindfallsAtRetirement(projections: WindfallProjection[]): number {
  return projections.reduce((s, p) => s + p.valueAtRetirement, 0);
}
