import type { CountryProfile } from "@/types";

/**
 * Currency conversion via the USD pivot rate baked into each CountryProfile.
 *
 * Rates are **illustrative spot snapshots** — fine for FIRE-planning order-of-magnitude
 * answers, not for live remittance pricing. We expose the date so the UI can
 * disclose the vintage.
 */
export const FX_RATES_DATED = "2026-06";

/**
 * Convert `amount` denominated in `from`'s currency to `to`'s currency.
 *
 * Math: each profile stores `fxRateToUSD` = units of local per 1 USD, so
 *   amountUSD = amount / from.fxRateToUSD
 *   amountTo  = amountUSD * to.fxRateToUSD
 */
export function convertCurrency(
  amount: number,
  from: CountryProfile,
  to: CountryProfile,
): number {
  if (from.code === to.code) return amount;
  return (amount / from.fxRateToUSD) * to.fxRateToUSD;
}

/** Conservative buffer to suggest when corpus and spend are in different currencies. */
export const FX_VOLATILITY_BUFFER_PCT = 0.15;
