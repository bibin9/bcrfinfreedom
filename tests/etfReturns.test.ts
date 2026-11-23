import { describe, expect, it } from "vitest";
import { computeEtfReturns, pointsFromYahoo, type PricePoint } from "@/lib/etfReturns";

/** One price per day from `start`, growing at `annual` per year. */
function series(start: string, years: number, annual: number): PricePoint[] {
  const out: PricePoint[] = [];
  const t0 = Date.parse(`${start}T00:00:00Z`);
  const days = Math.round(years * 365.25);
  for (let i = 0; i <= days; i++) {
    out.push({ date: new Date(t0 + i * 86_400_000).toISOString().slice(0, 10), price: 100 * (1 + annual) ** (i / 365.25) });
  }
  return out;
}

describe("computeEtfReturns", () => {
  it("recovers the yearly growth of a steadily growing price", () => {
    const r = computeEtfReturns(series("2020-01-01", 6, 0.1))!;
    expect(r.threeYearCagr).toBeCloseTo(0.1, 2);
    expect(r.fiveYearCagr).toBeCloseTo(0.1, 2);
  });
  it("gives no 5-year figure when the fund is only 4 years old", () => {
    const r = computeEtfReturns(series("2022-11-01", 4, 0.08))!;
    expect(r.threeYearCagr).toBeCloseTo(0.08, 2);
    expect(r.fiveYearCagr).toBeNull();
  });
  it("returns null when no window is long enough, or there is no data", () => {
    expect(computeEtfReturns(series("2026-01-01", 0.5, 0.1))).toBeNull();
    expect(computeEtfReturns([])).toBeNull();
  });
  it("ignores bad rows and unsorted input, and reports the latest date", () => {
    const pts = series("2020-01-01", 6, 0.1).reverse();
    pts.push({ date: "not-a-date", price: 5 }, { date: "2026-01-01", price: NaN });
    const r = computeEtfReturns(pts)!;
    expect(r.navDate).toBe(series("2020-01-01", 6, 0.1).at(-1)!.date);
    expect(r.fiveYearCagr).toBeCloseTo(0.1, 2);
  });
  it("can show a negative return", () => {
    expect(computeEtfReturns(series("2020-01-01", 6, -0.02))!.fiveYearCagr!).toBeLessThan(0);
  });
});

describe("pointsFromYahoo", () => {
  it("reads adjusted close and skips missing prices", () => {
    const pts = pointsFromYahoo({
      chart: { result: [{ timestamp: [1700000000, 1700086400, 1700172800], indicators: { adjclose: [{ adjclose: [10, null, 12] }], quote: [{ close: [1, 2, 3] }] } }] },
    });
    expect(pts.map((p) => p.price)).toEqual([10, 12]);
    expect(pts[0].date).toBe("2023-11-14");
  });
  it("falls back to close when adjusted close is missing, and survives junk", () => {
    expect(pointsFromYahoo({ chart: { result: [{ timestamp: [1700000000], indicators: { quote: [{ close: [7] }] } }] } })[0].price).toBe(7);
    expect(pointsFromYahoo(null)).toEqual([]);
    expect(pointsFromYahoo({})).toEqual([]);
  });
});

import { afterEach, vi } from "vitest";
import { fetchEtfReturns, mergeLive } from "@/lib/liveFunds";

describe("fetchEtfReturns never breaks the page", () => {
  afterEach(() => vi.unstubAllGlobals());
  it("returns nothing when the file is missing or the network fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));
    expect(await fetchEtfReturns()).toEqual({});
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    expect(await fetchEtfReturns()).toEqual({});
  });
  it("reads the funds from the file", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({ funds: { VTI: { threeYearCagr: 0.1, fiveYearCagr: 0.08, navDate: "2026-11-20" } } }) }));
    expect((await fetchEtfReturns()).VTI.fiveYearCagr).toBe(0.08);
  });
  it("an old file is not shown as live", () => {
    const fund = { name: "X", ticker: "VTI", category: "etf" as const, threeYearCagr: 0.1, fiveYearCagr: 0.1, expenseRatio: 0.0003, risk: "medium" as const, note: "" };
    const old = { threeYearCagr: 0.2, fiveYearCagr: 0.2, navDate: "2020-01-01" };
    expect(mergeLive(fund, old).live).toBe(false);
    expect(mergeLive(fund, old).threeYearCagr).toBe(0.1);
  });
});
