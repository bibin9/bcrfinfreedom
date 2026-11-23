/**
 * Live mutual-fund returns for India.
 *
 * Daily NAVs (the fund's price per unit) come from mfapi.in, a free public
 * mirror of the AMFI NAV file. From the NAV history we compute the real 3- and
 * 5-year yearly growth (CAGR). Funds without a schemeCode, or any failed
 * request, keep the curated numbers in fundCatalog.ts.
 */

import type { MutualFund } from "@/types";

const API = "https://api.mfapi.in/mf";
const CACHE_KEY = "bcr-live-funds-v1";
const CACHE_MS = 12 * 60 * 60 * 1000;

export interface LiveReturns {
  threeYearCagr: number | null;
  fiveYearCagr: number | null;
  navDate: string; // ISO yyyy-mm-dd of the latest NAV
}

interface NavPoint {
  date: Date;
  nav: number;
}

interface MfApiResponse {
  data?: { date: string; nav: string }[];
}

function parseDate(dmy: string): Date | null {
  const [d, m, y] = dmy.split("-").map(Number);
  if (!d || !m || !y) return null;
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d ? date : null;
}

/** NAV on or just before the target date (series is newest-first). */
function navOnOrBefore(points: NavPoint[], target: Date): NavPoint | null {
  for (const p of points) if (p.date.getTime() <= target.getTime()) return p;
  return null;
}

/** Yearly growth over `years`, or null when the fund is younger than that. */
function cagr(points: NavPoint[], years: number): number | null {
  const latest = points[0];
  const start = new Date(latest.date);
  start.setUTCFullYear(start.getUTCFullYear() - years);
  const base = navOnOrBefore(points, start);
  // Reject if the closest older NAV is more than 10 days past the target
  // (fund launched later than that, so the window is not really `years` long).
  if (!base || start.getTime() - base.date.getTime() > 10 * 86400000) return null;
  if (base.nav <= 0 || latest.nav <= 0) return null;
  return Math.pow(latest.nav / base.nav, 1 / years) - 1;
}

/** Only ask for ~5 years + a month of history (the longest window we compute). */
function startDate(): string {
  const d = new Date();
  d.setUTCFullYear(d.getUTCFullYear() - 5);
  d.setUTCDate(d.getUTCDate() - 30);
  return d.toISOString().slice(0, 10);
}

/** Pure: turn an mfapi response into returns. Exported for tests. */
export function computeReturns(res: MfApiResponse): LiveReturns | null {
  const points: NavPoint[] = [];
  for (const row of res.data ?? []) {
    const date = parseDate(row.date);
    const nav = parseFloat(row.nav);
    if (date && Number.isFinite(nav)) points.push({ date, nav });
  }
  if (points.length === 0) return null;
  points.sort((a, b) => b.date.getTime() - a.date.getTime());
  const three = cagr(points, 3);
  const five = cagr(points, 5);
  if (three === null && five === null) return null;
  return {
    threeYearCagr: three,
    fiveYearCagr: five,
    navDate: points[0].date.toISOString().slice(0, 10),
  };
}

/** Pure: overlay live numbers on a curated fund. Exported for tests. */
export function mergeLive(fund: MutualFund, live: LiveReturns | undefined): MutualFund {
  if (!live) return fund;
  const fresh = Number.isFinite(Date.parse(live.navDate)) && Date.now() - Date.parse(live.navDate) <= 7 * 86400000;
  if (!fresh || live.threeYearCagr === null || live.fiveYearCagr === null) return { ...fund, live: false };
  return {
    ...fund,
    threeYearCagr: live.threeYearCagr ?? fund.threeYearCagr,
    fiveYearCagr: live.fiveYearCagr ?? fund.fiveYearCagr,
    // A single card-level badge must never label a curated period as live.
    live: true,
  };
}

type Cache = Record<string, { at: number; value: LiveReturns }>;

function readCache(): Cache {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) ?? "{}") as Cache;
  } catch {
    return {};
  }
}

function writeCache(c: Cache) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(c));
  } catch {
    /* storage full or blocked: live data just won't be cached */
  }
}

/** Fetch live returns keyed by schemeCode. Failures are skipped silently. */
export async function fetchLiveReturns(
  codes: number[],
  signal?: AbortSignal,
): Promise<Record<number, LiveReturns>> {
  const cache = readCache();
  const out: Record<number, LiveReturns> = {};
  const now = Date.now();
  const todo: number[] = [];
  for (const code of codes) {
    const hit = cache[code];
    if (hit && now - hit.at < CACHE_MS) out[code] = hit.value;
    else todo.push(code);
  }
  // mfapi.in drops bursts of parallel calls, so go 3 at a time, retry once.
  const queue = [...todo];
  const worker = async () => {
    for (let code = queue.shift(); code !== undefined; code = queue.shift()) {
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          // The API's cached copies sometimes lack CORS headers, which the browser
          // blocks; a never-seen query string forces a fresh, CORS-enabled reply.
          const bust = attempt > 0 ? `&_=${Date.now()}` : "";
          const r = await fetch(`${API}/${code}?startDate=${startDate()}${bust}`, { signal });
          if (!r.ok) throw new Error(String(r.status));
          const value = computeReturns((await r.json()) as MfApiResponse);
          if (value) {
            out[code] = value;
            cache[code] = { at: now, value };
          }
          break;
        } catch {
          if (signal?.aborted) return;
          if (attempt === 0) await new Promise((res) => setTimeout(res, 800));
          // Still failing: fall back to a stale cache entry if we have one.
          else if (cache[code]) out[code] = cache[code].value;
        }
      }
    }
  };
  await Promise.all(Array.from({ length: Math.min(3, todo.length) }, worker));
  writeCache(cache);
  return out;
}

interface EtfFile {
  funds?: Record<string, LiveReturns>;
}

/**
 * Live returns for US ETFs, keyed by ticker. The numbers are prepared a few
 * times a week by scripts/update-etf-returns.mjs and served from our own site,
 * because browsers cannot call the price sources directly. Any failure returns
 * an empty result and the curated numbers stay in place.
 */
export async function fetchEtfReturns(signal?: AbortSignal): Promise<Record<string, LiveReturns>> {
  try {
    const day = new Date().toISOString().slice(0, 10); // new URL each day so a CDN copy is never stale
    const r = await fetch(`${import.meta.env.BASE_URL}data/us-etf-returns.json?d=${day}`, { signal });
    if (!r.ok) return {};
    const file = (await r.json()) as EtfFile;
    return file.funds ?? {};
  } catch {
    return {};
  }
}
