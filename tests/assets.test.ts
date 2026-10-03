import { describe, it, expect } from "vitest";
import {
  assetsByCategory,
  liquidAssetsValue,
  presetsForCountry,
  totalAssetsValue,
} from "@/lib/assets";
import type { Asset } from "@/types";

function makeAsset(overrides: Partial<Asset> = {}): Asset {
  return {
    id: "a1",
    name: "Test",
    category: "stocks_mf",
    currentValue: 100_000,
    liquid: true,
    updatedAt: Date.now(),
    ...overrides,
  };
}

describe("totalAssetsValue", () => {
  it("sums every value regardless of liquidity", () => {
    const t = totalAssetsValue([
      makeAsset({ currentValue: 100 }),
      makeAsset({ currentValue: 200, liquid: false }),
      makeAsset({ currentValue: 300 }),
    ]);
    expect(t).toBe(600);
  });
});

describe("liquidAssetsValue", () => {
  it("sums only liquid assets", () => {
    const t = liquidAssetsValue([
      makeAsset({ currentValue: 100, liquid: true }),
      makeAsset({ currentValue: 1_000, liquid: false }), // property
      makeAsset({ currentValue: 50, liquid: true }),
    ]);
    expect(t).toBe(150);
  });

  it("returns 0 for empty input", () => {
    expect(liquidAssetsValue([])).toBe(0);
  });
});

describe("assetsByCategory", () => {
  it("buckets and sorts by value desc", () => {
    const b = assetsByCategory([
      makeAsset({ category: "stocks_mf", currentValue: 100 }),
      makeAsset({ category: "stocks_mf", currentValue: 50 }),
      makeAsset({ category: "gold", currentValue: 200 }),
    ]);
    expect(b[0].category).toBe("gold");
    expect(b[0].value).toBe(200);
    expect(b[1].category).toBe("stocks_mf");
    expect(b[1].value).toBe(150);
  });

  it("percentages sum to ~100", () => {
    const b = assetsByCategory([
      makeAsset({ category: "stocks_mf", currentValue: 60 }),
      makeAsset({ category: "gold", currentValue: 40 }),
    ]);
    const sum = b.reduce((s, x) => s + x.pct, 0);
    expect(sum).toBeGreaterThanOrEqual(99);
    expect(sum).toBeLessThanOrEqual(101);
  });
});

describe("presetsForCountry", () => {
  it("India presets include EPF and PPF", () => {
    const p = presetsForCountry("IN");
    const names = p.map((x) => x.name);
    expect(names.some((n) => n.includes("EPF"))).toBe(true);
    expect(names.some((n) => n.includes("PPF"))).toBe(true);
  });

  it("UAE presets include Gratuity/EOSB", () => {
    const p = presetsForCountry("AE");
    const names = p.map((x) => x.name);
    expect(names.some((n) => n.toLowerCase().includes("gratuity"))).toBe(true);
  });

  it("US presets include 401(k) and IRA", () => {
    const p = presetsForCountry("US");
    const names = p.map((x) => x.name);
    expect(names.some((n) => n.includes("401"))).toBe(true);
    expect(names.some((n) => n.includes("IRA"))).toBe(true);
  });

  it("falls back to a generic list for unmapped countries", () => {
    const p = presetsForCountry("EG");
    expect(p.length).toBeGreaterThan(0);
  });
});
