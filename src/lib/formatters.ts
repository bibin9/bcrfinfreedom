import type { CountryProfile } from "@/types";

const currencyLocales: Record<string, string> = {
  AED: "en-AE",
  SAR: "ar-SA",
  INR: "en-IN",
  USD: "en-US",
  GBP: "en-GB",
  CAD: "en-CA",
  AUD: "en-AU",
  SGD: "en-SG",
  EUR: "de-DE",
  JPY: "ja-JP",
  MYR: "ms-MY",
  PHP: "en-PH",
  PKR: "en-PK",
  BDT: "bn-BD",
  EGP: "ar-EG",
};

export function formatCurrency(
  value: number,
  country: Pick<CountryProfile, "currency">,
  opts: { maximumFractionDigits?: number; compact?: boolean } = {},
): string {
  const locale = currencyLocales[country.currency] ?? "en-US";
  const { maximumFractionDigits = 0, compact } = opts;
  try {
    // Compact notation needs significant digits, not fraction digits — otherwise
    // ₹1.5L rounds to ₹2L and AED 10.5K to AED 11K.
    const precision: Intl.NumberFormatOptions = compact
      ? { notation: "compact", maximumSignificantDigits: 3 }
      : { notation: "standard", maximumFractionDigits };
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: country.currency,
      ...precision,
    }).format(value);
  } catch {
    return `${country.currency} ${value.toFixed(maximumFractionDigits)}`;
  }
}

export function formatPercent(value: number, decimals = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

export function formatYears(value: number): string {
  if (!Number.isFinite(value)) return "—";
  if (value < 1) return "< 1 yr";
  const rounded = Math.round(value * 10) / 10;
  return `${rounded} yr${rounded === 1 ? "" : "s"}`;
}
