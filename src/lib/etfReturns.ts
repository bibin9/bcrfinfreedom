/**
 * Growth numbers for US ETFs, computed from daily prices.
 *
 * Browsers are not allowed to call the free price sources directly (they block
 * other websites), so scripts/update-etf-returns.mjs fetches the prices on a
 * server a few times a week and saves the results in public/data/us-etf-returns.json.
 * The app reads that file. This file holds the pure maths, shared by both.
 *
 * Prices are "adjusted close": they include dividends reinvested, so the growth
 * is the fair "total return" an investor actually earned.
 */

export interface PricePoint {
  /** ISO date yyyy-mm-dd */
  date: string;
  price: number;
}

export interface EtfReturns {
  threeYearCagr: number | null;
  fiveYearCagr: number | null;
  /** ISO date of the latest price used. */
  navDate: string;
}

const DAY = 86_400_000;

function yearsBefore(iso: string, years: number): number {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCFullYear(d.getUTCFullYear() - years);
  return d.getTime();
}

/** Yearly growth over `years` from ascending daily points, or null if there is not enough history. */
function cagr(points: PricePoint[], years: number): number | null {
  const latest = points[points.length - 1];
  const target = yearsBefore(latest.date, years);
  let base: PricePoint | null = null;
  for (let i = points.length - 1; i >= 0; i--) {
    if (Date.parse(`${points[i].date}T00:00:00Z`) <= target) {
      base = points[i];
      break;
    }
  }
  // The closest older price must be within 10 days of the target date,
  // otherwise the fund is younger than the window and the figure would be wrong.
  if (!base || target - Date.parse(`${base.date}T00:00:00Z`) > 10 * DAY) return null;
  if (base.price <= 0 || latest.price <= 0) return null;
  return Math.pow(latest.price / base.price, 1 / years) - 1;
}

/** Pure: 3- and 5-year yearly growth. Returns null when there is no usable data. */
export function computeEtfReturns(input: PricePoint[]): EtfReturns | null {
  const points = input
    .filter((p) => /^\d{4}-\d{2}-\d{2}$/.test(p.date) && Number.isFinite(p.price))
    .sort((a, b) => (a.date < b.date ? -1 : 1));
  if (points.length === 0) return null;
  const three = cagr(points, 3);
  const five = cagr(points, 5);
  if (three === null && five === null) return null;
  return { threeYearCagr: three, fiveYearCagr: five, navDate: points[points.length - 1].date };
}

/** Pure: turn a Yahoo "chart" response into price points (skips missing prices). */
export function pointsFromYahoo(json: unknown): PricePoint[] {
  const r = (json as { chart?: { result?: Array<Record<string, unknown>> } })?.chart?.result?.[0] as
    | {
        timestamp?: number[];
        indicators?: { adjclose?: Array<{ adjclose?: Array<number | null> }>; quote?: Array<{ close?: Array<number | null> }> };
      }
    | undefined;
  const ts = r?.timestamp ?? [];
  const prices = r?.indicators?.adjclose?.[0]?.adjclose ?? r?.indicators?.quote?.[0]?.close ?? [];
  const out: PricePoint[] = [];
  ts.forEach((t, i) => {
    const p = prices[i];
    if (typeof p === "number" && Number.isFinite(p)) {
      out.push({ date: new Date(t * 1000).toISOString().slice(0, 10), price: p });
    }
  });
  return out;
}
