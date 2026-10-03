import { describe, it, expect } from "vitest";
import { calculateAllocation } from "@/lib/allocation";
import { countryProfiles } from "@/data/countryProfiles";

const SUM_TOLERANCE = 0.2; // percent — rounding to 1 decimal can drift slightly.

function sumOf(result: ReturnType<typeof calculateAllocation>): number {
  return result.breakdown.reduce((acc, b) => acc + b.percent, 0);
}

describe("calculateAllocation", () => {
  it("produces allocations summing to ~100% for every country profile", () => {
    for (const country of Object.values(countryProfiles)) {
      const result = calculateAllocation({ age: 30, risk: "moderate", country, goal: "wealth_building" });
      expect(Math.abs(sumOf(result) - 100)).toBeLessThan(SUM_TOLERANCE);
    }
  });

  it("uses the 100-age baseline — younger investors get more equity than older", () => {
    const us = countryProfiles.US;
    const young = calculateAllocation({ age: 25, risk: "moderate", country: us, goal: "wealth_building" });
    const old = calculateAllocation({ age: 60, risk: "moderate", country: us, goal: "wealth_building" });
    expect(young.equityWeight).toBeGreaterThan(old.equityWeight);
  });

  it("aggressive profile holds more equity than conservative at the same age", () => {
    const us = countryProfiles.US;
    const agg = calculateAllocation({ age: 35, risk: "aggressive", country: us, goal: "wealth_building" });
    const con = calculateAllocation({ age: 35, risk: "conservative", country: us, goal: "wealth_building" });
    expect(agg.equityWeight).toBeGreaterThan(con.equityWeight);
  });

  it("only adds crypto for aggressive profiles under 60 in stable enough markets", () => {
    const us = countryProfiles.US;
    const eg = countryProfiles.EG; // stabilityScore 0.4 → crypto should be excluded

    const aggUS = calculateAllocation({ age: 35, risk: "aggressive", country: us, goal: "wealth_building" });
    const modUS = calculateAllocation({ age: 35, risk: "moderate", country: us, goal: "wealth_building" });
    const oldUS = calculateAllocation({ age: 65, risk: "aggressive", country: us, goal: "wealth_building" });
    const aggEG = calculateAllocation({ age: 35, risk: "aggressive", country: eg, goal: "wealth_building" });

    const cryptoOf = (r: ReturnType<typeof calculateAllocation>) =>
      r.breakdown.find((b) => b.asset === "crypto")?.percent ?? 0;

    expect(cryptoOf(aggUS)).toBeGreaterThan(0);
    expect(cryptoOf(aggUS)).toBeLessThanOrEqual(5);
    expect(cryptoOf(modUS)).toBe(0);
    expect(cryptoOf(oldUS)).toBe(0);
    expect(cryptoOf(aggEG)).toBe(0);
  });

  it("labels fixed income as 'Sukuk' in Sharia markets", () => {
    const uae = calculateAllocation({
      age: 35,
      risk: "moderate",
      country: countryProfiles.AE,
      goal: "wealth_building",
    });
    const us = calculateAllocation({
      age: 35,
      risk: "moderate",
      country: countryProfiles.US,
      goal: "wealth_building",
    });
    const uaeBonds = uae.breakdown.find((b) => b.asset === "bonds_fixed_income");
    const usBonds = us.breakdown.find((b) => b.asset === "bonds_fixed_income");
    expect(uaeBonds?.label.toLowerCase()).toContain("sukuk");
    expect(usBonds?.label.toLowerCase()).not.toContain("sukuk");
  });

  it("less stable economies get a larger cash + gold defensive cushion", () => {
    const stable = calculateAllocation({
      age: 35,
      risk: "moderate",
      country: countryProfiles.SG,
      goal: "wealth_building",
    });
    const volatile = calculateAllocation({
      age: 35,
      risk: "moderate",
      country: countryProfiles.EG,
      goal: "wealth_building",
    });
    const defensive = (r: ReturnType<typeof calculateAllocation>) =>
      (r.breakdown.find((b) => b.asset === "cash_emergency")?.percent ?? 0) +
      (r.breakdown.find((b) => b.asset === "gold_commodities")?.percent ?? 0);

    expect(defensive(volatile)).toBeGreaterThan(defensive(stable));
  });

  it("home purchase goal reduces equity vs early retirement at same age/risk/country", () => {
    const us = countryProfiles.US;
    const retire = calculateAllocation({ age: 35, risk: "moderate", country: us, goal: "early_retirement" });
    const home = calculateAllocation({ age: 35, risk: "moderate", country: us, goal: "home_purchase" });
    expect(retire.equityWeight).toBeGreaterThan(home.equityWeight);
  });

  it("never returns a negative percent for any asset", () => {
    for (const country of Object.values(countryProfiles)) {
      for (const risk of ["conservative", "moderate", "aggressive"] as const) {
        for (const age of [22, 35, 50, 65]) {
          const r = calculateAllocation({ age, risk, country, goal: "wealth_building" });
          for (const b of r.breakdown) {
            expect(b.percent, `${country.code}/${risk}/${age}/${b.asset}`).toBeGreaterThanOrEqual(0);
          }
        }
      }
    }
  });

  it("returns a non-empty explanation trail for the UI", () => {
    const r = calculateAllocation({
      age: 30,
      risk: "moderate",
      country: countryProfiles.IN,
      goal: "wealth_building",
    });
    expect(r.explanation.length).toBeGreaterThanOrEqual(3);
    expect(r.explanation.some((line) => line.includes("100"))).toBe(true);
  });
});
