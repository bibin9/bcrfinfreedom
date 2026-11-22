import { describe, expect, it } from "vitest";
import { computeReturns, mergeLive } from "@/lib/liveFunds";

const fmt = (d: Date) =>
  `${String(d.getUTCDate()).padStart(2, "0")}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${d.getUTCFullYear()}`;

/** Newest-first daily series growing 10%/yr over `years` years. */
function series(years: number) {
  const end = Date.UTC(2026, 10, 20);
  const days = Math.round(years * 365.25);
  return Array.from({ length: days + 1 }, (_, i) => ({
    date: fmt(new Date(end - i * 86400000)),
    nav: (100 * Math.pow(1.1, (days - i) / 365.25)).toFixed(4),
  }));
}

describe("computeReturns", () => {
  it("computes ~10% for 3y and 5y on a 10%/yr series", () => {
    const r = computeReturns({ data: series(6) })!;
    expect(r.threeYearCagr).toBeCloseTo(0.1, 2);
    expect(r.fiveYearCagr).toBeCloseTo(0.1, 2);
    expect(r.navDate).toBe("2026-11-20");
  });
  it("returns null for a window longer than the fund's history", () => {
    const r = computeReturns({ data: series(4) })!;
    expect(r.threeYearCagr).toBeCloseTo(0.1, 2);
    expect(r.fiveYearCagr).toBeNull();
  });
  it("returns null when there is no usable data", () => {
    expect(computeReturns({ data: [] })).toBeNull();
    expect(computeReturns({})).toBeNull();
  });
});

describe("mergeLive", () => {
  const fund = { name: "X", category: "index", threeYearCagr: 0.1, fiveYearCagr: 0.2, expenseRatio: 0.01, risk: "low", note: "" } as const;
  it("keeps curated numbers when there is no live data", () => {
    expect(mergeLive({ ...fund }, undefined)).toEqual(fund);
  });
  it("overlays live values and keeps curated ones where live is null", () => {
    const m = mergeLive({ ...fund }, { threeYearCagr: 0.3, fiveYearCagr: null, navDate: "2026-11-20" });
    expect(m.threeYearCagr).toBe(0.3);
    expect(m.fiveYearCagr).toBe(0.2);
    expect(m.live).toBe(true);
  });
});
