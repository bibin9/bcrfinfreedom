import { describe, it, expect } from "vitest";
import { calculateAllocation, destinationEquityShare } from "@/lib/allocation";
import { countryProfiles, getCountryProfile } from "@/data/countryProfiles";
import type { AllocationResult, CountryCode, RiskProfile } from "@/types";

const pct = (a: AllocationResult, asset: string) =>
  a.breakdown.find((b) => b.asset === asset)?.percent ?? 0;

describe("Mumbai advisor: Indian allocation", () => {
  const a = calculateAllocation({
    age: 35,
    risk: "moderate",
    country: getCountryProfile("IN"),
    goal: "wealth_building",
  });

  it("holds a meaningful bond share (was 2.5%)", () => {
    expect(pct(a, "bonds_fixed_income")).toBeGreaterThanOrEqual(12);
  });

  it("keeps most shares in Indian companies (international was 28.6%)", () => {
    expect(pct(a, "equities_international")).toBeLessThanOrEqual(15);
    expect(pct(a, "equities_local")).toBeGreaterThan(pct(a, "equities_international") * 3);
  });
});

describe("Dubai advisor: Gulf allocation", () => {
  it("UAE resident holds more global than local shares", () => {
    const a = calculateAllocation({
      age: 38,
      risk: "moderate",
      country: getCountryProfile("AE"),
      goal: "wealth_building",
    });
    expect(pct(a, "equities_international")).toBeGreaterThan(pct(a, "equities_local"));
  });
});

describe("expat glide path", () => {
  const ae = getCountryProfile("AE");
  const india = getCountryProfile("IN");
  const equityTotal = (a: AllocationResult) =>
    pct(a, "equities_local") + pct(a, "equities_destination") + pct(a, "equities_international");

  it("destination share rises from 30% to 70% of shares", () => {
    expect(destinationEquityShare(25)).toBe(0.3);
    expect(destinationEquityShare(10)).toBeCloseTo(0.5, 5);
    expect(destinationEquityShare(3)).toBe(0.7);
  });

  it("22 years out: ~30% of shares in India", () => {
    const a = calculateAllocation({
      age: 38, risk: "moderate", country: ae, goal: "wealth_building",
      retirementCountry: india, freedomAge: 60,
    });
    expect(pct(a, "equities_destination") / equityTotal(a)).toBeCloseTo(0.3, 1);
  });

  it("3 years out: ~70% of shares in India", () => {
    const a = calculateAllocation({
      age: 57, risk: "moderate", country: ae, goal: "wealth_building",
      retirementCountry: india, freedomAge: 60,
    });
    expect(pct(a, "equities_destination") / equityTotal(a)).toBeCloseTo(0.7, 1);
  });

  it("no destination line when retiring at home", () => {
    const a = calculateAllocation({
      age: 38, risk: "moderate", country: india, goal: "wealth_building",
      retirementCountry: india,
    });
    expect(a.breakdown.find((b) => b.asset === "equities_destination")).toBeUndefined();
  });
});

describe("invariants across every country, risk and age", () => {
  const codes = Object.keys(countryProfiles) as CountryCode[];
  const risks: RiskProfile[] = ["conservative", "moderate", "aggressive"];

  it("sums to 100%, no negatives, bonds ≥ gold + property", () => {
    for (const code of codes) {
      for (const risk of risks) {
        for (const age of [22, 35, 50, 65]) {
          const a = calculateAllocation({
            age, risk, country: getCountryProfile(code), goal: "wealth_building",
          });
          const sum = a.breakdown.reduce((s, b) => s + b.percent, 0);
          expect(sum).toBeGreaterThan(99.4);
          expect(sum).toBeLessThan(100.6);
          for (const b of a.breakdown) expect(b.percent).toBeGreaterThanOrEqual(0);
          expect(pct(a, "bonds_fixed_income")).toBeGreaterThanOrEqual(
            pct(a, "gold_commodities") + pct(a, "real_estate") - 0.2,
          );
        }
      }
    }
  });

  it("crypto never reduces bonds", () => {
    const base = { age: 30, country: getCountryProfile("US"), goal: "wealth_building" as const };
    const aggressive = calculateAllocation({ ...base, risk: "aggressive" });
    expect(pct(aggressive, "crypto")).toBeGreaterThan(0);
    const safe =
      pct(aggressive, "bonds_fixed_income") +
      pct(aggressive, "gold_commodities") +
      pct(aggressive, "real_estate");
    expect(pct(aggressive, "bonds_fixed_income")).toBeGreaterThanOrEqual(safe * 0.59);
  });
});
