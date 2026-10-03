import { describe, it, expect } from "vitest";
import { DEFAULT_CITY_ID, citiesFor, cityMultiplier } from "@/data/cities";
import { calculateFreedom } from "@/lib/freedom";
import { useUserStore } from "@/store/userStore";
import type { CountryCode } from "@/types";

const base = {
  country: "IN" as const,
  age: 35,
  monthlyIncome: 150_000,
  risk: "moderate" as const,
  goal: "wealth_building" as const,
  expectedReturn: 0.09,
  householdSize: "family" as const,
};

describe("city cost of living", () => {
  it("Mumbai family spend is 1.35× the ₹14L big-city average", () => {
    const f = calculateFreedom({ ...base, retirementCity: "mumbai" });
    expect(f.currentAnnualExpenses).toBeCloseTo(14_00_000 * 1.35, 0);
    expect(f.cityName).toBe("Mumbai");
  });

  it("FIRE number scales with the city", () => {
    const avg = calculateFreedom(base);
    const town = calculateFreedom({ ...base, retirementCity: "town" });
    expect(town.targetCorpus / avg.targetCorpus).toBeCloseTo(0.6, 5);
  });

  it("the user's own expenses override the city estimate", () => {
    const f = calculateFreedom({ ...base, retirementCity: "mumbai", annualExpensesOverride: 9_00_000 });
    expect(f.currentAnnualExpenses).toBe(9_00_000);
  });

  it("expat retiring in India uses Indian cities", () => {
    const f = calculateFreedom({
      ...base, country: "AE", monthlyIncome: 35_000, retirementCountry: "IN", retirementCity: "kerala",
    });
    expect(f.currentAnnualExpenses).toBeCloseTo(14_00_000 * 0.85, 0);
  });

  it("unknown city or country without cities falls back to 1×", () => {
    expect(cityMultiplier("IN", "atlantis")).toBe(1);
    expect(cityMultiplier("JP", "tokyo")).toBe(1);
    expect(citiesFor("JP")).toEqual([]);
  });

  it("every city list starts with a 1× default", () => {
    for (const code of ["IN", "AE", "SA", "US", "GB"] as CountryCode[]) {
      const def = citiesFor(code).find((c) => c.id === DEFAULT_CITY_ID);
      expect(def?.multiplier).toBe(1);
    }
  });

  it("changing country clears the city (city ids are per-country)", () => {
    const s = useUserStore.getState();
    s.setRetirementCity("mumbai");
    s.setRetirementCountry("AE");
    expect(useUserStore.getState().inputs.retirementCity).toBeUndefined();
    useUserStore.getState().setRetirementCity("sharjah");
    useUserStore.getState().setCountry("SA");
    expect(useUserStore.getState().inputs.retirementCity).toBeUndefined();
  });
});
