/**
 * Real-asset tracker helpers.
 *
 * Users record individual holdings (EPF balance, gold grams × spot price,
 * Zerodha portfolio value, flat market value) and we sum the LIQUID ones
 * into an effective `currentCorpus` for the FIRE calculation.
 *
 * Country-specific presets ship with every CountryProfile so Indian users
 * see EPF/NPS/PPF, UAE users see Gratuity/DEWS, US users see 401(k)/IRA.
 */

import type { Asset, AssetCategory, CountryCode } from "@/types";

export interface AssetPreset {
  name: string;
  category: AssetCategory;
  liquid: boolean;
}

const CATEGORY_META: Record<
  AssetCategory,
  { emoji: string; label: string; defaultLiquid: boolean }
> = {
  stocks_mf: { emoji: "📈", label: "Stocks / Mutual Funds / ETFs", defaultLiquid: true },
  retirement: { emoji: "🏦", label: "Retirement account", defaultLiquid: true },
  fd_bonds: { emoji: "💵", label: "FD / Bonds / Debt funds", defaultLiquid: true },
  gold: { emoji: "🥇", label: "Gold / Precious metals", defaultLiquid: true },
  insurance: { emoji: "🛡️", label: "Insurance / LIC / Endowment", defaultLiquid: false },
  real_estate: { emoji: "🏠", label: "Real estate / Property", defaultLiquid: false },
  crypto: { emoji: "₿", label: "Crypto", defaultLiquid: true },
  cash: { emoji: "💰", label: "Cash / Savings", defaultLiquid: true },
  gratuity: { emoji: "📋", label: "Gratuity / EOSB", defaultLiquid: true },
  other: { emoji: "📦", label: "Other", defaultLiquid: true },
};

export function categoryMeta(cat: AssetCategory) {
  return CATEGORY_META[cat] ?? CATEGORY_META.other;
}

export const ASSET_CATEGORIES: AssetCategory[] = [
  "stocks_mf",
  "retirement",
  "fd_bonds",
  "gold",
  "insurance",
  "real_estate",
  "crypto",
  "cash",
  "gratuity",
  "other",
];

/**
 * Country-aware preset list. Picks defaults the user is most likely to have
 * for their jurisdiction — one-tap adds to the form.
 */
const PRESETS_BY_COUNTRY: Partial<Record<CountryCode, AssetPreset[]>> = {
  IN: [
    { name: "EPF (Employee Provident Fund)", category: "retirement", liquid: true },
    { name: "PPF (Public Provident Fund)", category: "retirement", liquid: true },
    { name: "NPS (National Pension System)", category: "retirement", liquid: true },
    { name: "ELSS Mutual Funds", category: "stocks_mf", liquid: true },
    { name: "Mutual Fund portfolio", category: "stocks_mf", liquid: true },
    { name: "Stocks (Zerodha / Groww)", category: "stocks_mf", liquid: true },
    { name: "Bank FD", category: "fd_bonds", liquid: true },
    { name: "Sovereign Gold Bonds (SGB)", category: "gold", liquid: true },
    { name: "Physical gold / jewellery", category: "gold", liquid: true },
    { name: "LIC endowment / ULIP", category: "insurance", liquid: false },
    { name: "Flat / apartment", category: "real_estate", liquid: false },
    { name: "Savings account", category: "cash", liquid: true },
  ],
  AE: [
    { name: "End-of-Service Gratuity (EOSB)", category: "gratuity", liquid: true },
    { name: "DEWS workplace savings", category: "retirement", liquid: true },
    { name: "Interactive Brokers portfolio", category: "stocks_mf", liquid: true },
    { name: "Emirates NBD mutual funds", category: "stocks_mf", liquid: true },
    { name: "Local real estate (Dubai / AD)", category: "real_estate", liquid: false },
    { name: "AED savings account", category: "cash", liquid: true },
    { name: "Gold (DGCX / jewellery)", category: "gold", liquid: true },
    { name: "Home-country property", category: "real_estate", liquid: false },
  ],
  SA: [
    { name: "GOSI pension", category: "retirement", liquid: true },
    { name: "End-of-Service award", category: "gratuity", liquid: true },
    { name: "Al Rajhi mutual funds", category: "stocks_mf", liquid: true },
    { name: "Saudi stocks (Tadawul)", category: "stocks_mf", liquid: true },
    { name: "SAR deposit", category: "cash", liquid: true },
    { name: "Gold", category: "gold", liquid: true },
  ],
  US: [
    { name: "401(k)", category: "retirement", liquid: true },
    { name: "Traditional IRA", category: "retirement", liquid: true },
    { name: "Roth IRA", category: "retirement", liquid: true },
    { name: "HSA", category: "retirement", liquid: true },
    { name: "Vanguard / Fidelity brokerage", category: "stocks_mf", liquid: true },
    { name: "I-Bonds / Treasuries", category: "fd_bonds", liquid: true },
    { name: "Home (primary residence)", category: "real_estate", liquid: false },
    { name: "High-yield savings", category: "cash", liquid: true },
  ],
  GB: [
    { name: "Stocks & Shares ISA", category: "retirement", liquid: true },
    { name: "SIPP", category: "retirement", liquid: true },
    { name: "Workplace pension", category: "retirement", liquid: true },
    { name: "Vanguard portfolio", category: "stocks_mf", liquid: true },
    { name: "Premium Bonds", category: "fd_bonds", liquid: true },
    { name: "UK property", category: "real_estate", liquid: false },
    { name: "Cash savings", category: "cash", liquid: true },
  ],
  CA: [
    { name: "RRSP", category: "retirement", liquid: true },
    { name: "TFSA", category: "retirement", liquid: true },
    { name: "FHSA", category: "retirement", liquid: true },
    { name: "Non-registered brokerage", category: "stocks_mf", liquid: true },
    { name: "Canadian property", category: "real_estate", liquid: false },
    { name: "GIC", category: "fd_bonds", liquid: true },
  ],
  SG: [
    { name: "CPF", category: "retirement", liquid: true },
    { name: "SRS", category: "retirement", liquid: true },
    { name: "Endowus / Syfe", category: "stocks_mf", liquid: true },
    { name: "SGD fixed deposit", category: "fd_bonds", liquid: true },
    { name: "HDB / condo", category: "real_estate", liquid: false },
  ],
};

const GENERIC_PRESETS: AssetPreset[] = [
  { name: "Brokerage portfolio", category: "stocks_mf", liquid: true },
  { name: "Fixed deposit", category: "fd_bonds", liquid: true },
  { name: "Gold / bullion", category: "gold", liquid: true },
  { name: "Savings account", category: "cash", liquid: true },
  { name: "Primary residence", category: "real_estate", liquid: false },
  { name: "Crypto", category: "crypto", liquid: true },
];

export function presetsForCountry(code: CountryCode): AssetPreset[] {
  return PRESETS_BY_COUNTRY[code] ?? GENERIC_PRESETS;
}

/** Total value across all assets, in resident-country currency. */
export function totalAssetsValue(assets: Asset[]): number {
  return assets.reduce((sum, a) => sum + (a.currentValue || 0), 0);
}

/** Sum of just the LIQUID assets — this is what feeds the FIRE calc. */
export function liquidAssetsValue(assets: Asset[]): number {
  return assets.reduce((sum, a) => sum + (a.liquid ? a.currentValue : 0), 0);
}

/** Breakdown by category — for the donut / stacked chart. */
export function assetsByCategory(
  assets: Asset[],
): Array<{ category: AssetCategory; label: string; emoji: string; value: number; pct: number }> {
  const total = totalAssetsValue(assets) || 1;
  const buckets = new Map<AssetCategory, number>();
  for (const a of assets) {
    buckets.set(a.category, (buckets.get(a.category) ?? 0) + a.currentValue);
  }
  return Array.from(buckets.entries())
    .map(([cat, v]) => {
      const meta = categoryMeta(cat);
      return {
        category: cat,
        label: meta.label,
        emoji: meta.emoji,
        value: v,
        pct: Math.round((v / total) * 100),
      };
    })
    .sort((a, b) => b.value - a.value);
}
