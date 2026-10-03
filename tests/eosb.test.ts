import { describe, it, expect } from "vitest";
import { difcDews, estimateUAE, saudiEndOfService, uaeGratuity } from "@/lib/eosb";

describe("uaeGratuity (UAE Labour Law 2021)", () => {
  it("nothing under one year of service", () => {
    expect(uaeGratuity(30_000, 0.9)).toBe(0);
  });

  it("21 days per year for the first 5 years", () => {
    // basic 30,000 → daily 1,000 → 105 days
    expect(uaeGratuity(30_000, 5)).toBeCloseTo(105_000, 0);
  });

  it("30 days per year after 5 years", () => {
    // 105 + 5×30 = 255 days
    expect(uaeGratuity(30_000, 10)).toBeCloseTo(255_000, 0);
  });

  it("capped at 2 years' basic salary", () => {
    expect(uaeGratuity(30_000, 30)).toBe(720_000);
  });

  it("projection uses final basic and total service", () => {
    const e = estimateUAE(30_000, 5, 5, 0);
    expect(e.atDeparture).toBeCloseTo(uaeGratuity(30_000, 10), 0);
    expect(e.today).toBeCloseTo(105_000, 0);
  });
});

describe("saudiEndOfService", () => {
  it("full award: half month × first 5 yrs + full month after", () => {
    expect(saudiEndOfService(10_000, 10, "termination")).toBe(75_000);
  });

  it("resignation reductions by service length", () => {
    expect(saudiEndOfService(10_000, 1.5, "resignation")).toBe(0);
    expect(saudiEndOfService(10_000, 3, "resignation")).toBeCloseTo(5_000, 0);
    expect(saudiEndOfService(10_000, 7, "resignation")).toBeCloseTo(30_000, 0);
    expect(saudiEndOfService(10_000, 10, "resignation")).toBe(75_000);
  });
});

describe("difcDews", () => {
  it("5.83% of basic for the first 5 years", () => {
    const d = difcDews(10_000, 5, 0, 0.05, 0);
    expect(d.today).toBeCloseTo(10_000 * 0.0583 * 12 * 5, 0);
    expect(d.atDeparture).toBeCloseTo(d.today, 0);
  });

  it("grows with further contributions and returns", () => {
    const d = difcDews(10_000, 5, 5, 0.05, 0);
    // 5 more years at 8.33% with no return would be 49,980; returns push it higher.
    expect(d.atDeparture - d.today).toBeGreaterThan(49_980);
  });
});
