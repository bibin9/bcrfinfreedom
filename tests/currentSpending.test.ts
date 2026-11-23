import { describe, expect, it } from "vitest";
import { generateRoadmap } from "@/lib/roadmap";
import { calculateAllocation } from "@/lib/allocation";
import { calculateFreedom } from "@/lib/freedom";
import { getCountryProfile } from "@/data/countryProfiles";

const country = getCountryProfile("IN");
const user = { country: "IN" as const, age: 32, monthlyIncome: 120_000, risk: "moderate" as const, goal: "wealth_building" as const };
const allocation = calculateAllocation({ ...user, country });
const freedom = calculateFreedom({ ...user, expectedReturn: allocation.expectedReturn, annualExpensesOverride: 480_000 });

describe("current monthly spending drives the emergency fund", () => {
  it("falls back to the retirement budget when no current spending is given", () => {
    const road = generateRoadmap(user, country, allocation, freedom);
    expect(road[0].title).toContain("3,60,000"); // 9 months x 40,000
  });
  it("uses the person's real spending when it is given", () => {
    const road = generateRoadmap(user, country, allocation, freedom, country, 70_000);
    expect(road[0].title).toContain("6,30,000"); // 9 months x 70,000
  });
  it("ignores zero or negative values", () => {
    const road = generateRoadmap(user, country, allocation, freedom, country, 0);
    expect(road[0].title).toContain("3,60,000");
  });
});

import { computeTwoPaths } from "@/lib/twoPaths";
describe("two-paths story follows the main plan", () => {
  const base = { age: 32, monthlyIncome: 120_000, currentCorpus: 0, savingsRate: 0.3, expectedReturn: 0.09, country };
  it("uses the main plan's retirement age", () => {
    expect(computeTwoPaths({ ...base, retirementAge: 50 }).retirementAge).toBe(50);
    expect(computeTwoPaths(base).retirementAge).toBe(country.retirementAge ?? 60);
  });
  it("uses the main plan's spending when given", () => {
    const own = computeTwoPaths({ ...base, annualExpenses: 480_000 });
    expect(own.requiredMonthlyExpenses).toBeCloseTo((480_000 / 12) * 1.055 ** (own.retirementAge - 32), 0);
  });
});

import { presetsForCountry } from "@/lib/assets";
describe("locked retirement accounts are not counted as spendable by default", () => {
  it.each([["IN", "NPS"], ["US", "401(k)"], ["US", "Traditional IRA"], ["GB", "SIPP"], ["SA", "GOSI pension"], ["SG", "CPF"]])(
    "%s %s defaults to not accessible",
    (code, name) => {
      const p = presetsForCountry(code as never).find((x) => x.name.includes(name));
      expect(p?.liquid).toBe(false);
    },
  );
  it("an ordinary bank account stays accessible", () => {
    expect(presetsForCountry("IN" as never).find((x) => x.name === "Savings account")?.liquid).toBe(true);
  });
});
