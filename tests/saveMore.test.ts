import { describe, expect, it } from "vitest";
import { SAMPLE_DUBAI_KERALA, SAMPLES, computeSamplePlan } from "@/lib/samplePlan";
import { calculateAllocation } from "@/lib/allocation";
import { calculateFreedom } from "@/lib/freedom";
import { computeSaveMore, extraPresets, niceStep } from "@/lib/saveMore";
import { getCountryProfile } from "@/data/countryProfiles";
import { toUserInput } from "@/store/userStore";

function baseFor(inputs = SAMPLE_DUBAI_KERALA) {
  const c = toUserInput(inputs)!;
  const home = getCountryProfile(c.country);
  const dest = inputs.retirementCountry ? getCountryProfile(inputs.retirementCountry) : home;
  const a = calculateAllocation({ age: c.age, risk: c.risk, country: home, goal: c.goal, retirementCountry: dest });
  const input = {
    ...c,
    expectedReturn: a.expectedReturn,
    savingsRate: inputs.savingsRate,
    currentCorpus: inputs.currentCorpus,
    householdSize: inputs.householdSize,
    annualExpensesOverride: inputs.annualExpensesOverride,
    retirementCountry: inputs.retirementCountry,
    retirementCity: inputs.retirementCity,
  };
  return { input, freedom: calculateFreedom(input) };
}

describe("both homepage samples: preview equals the plan that opens", () => {
  for (const [key, inputs] of Object.entries(SAMPLES)) {
    it(key, () => {
      const plan = computeSamplePlan(inputs);
      const { freedom } = baseFor(inputs);
      expect(plan.freedom.targetCorpus).toBe(freedom.targetCorpus);
      expect(plan.freedom.requiredMonthlySIP).toBe(freedom.requiredMonthlySIP);
      expect(plan.freedom.currentMonthlySavings).toBe(freedom.currentMonthlySavings);
    });
  }
  it("the Dubai sample shows money in rupees (retirement country)", () => {
    expect(computeSamplePlan(SAMPLE_DUBAI_KERALA).country.currency).toBe("INR");
    expect(computeSamplePlan(SAMPLE_DUBAI_KERALA).home.currency).toBe("AED");
  });
});

describe("save a little more", () => {
  it("saving AED 200 more reaches freedom no later, with everything else unchanged", () => {
    const { input, freedom } = baseFor();
    const r = computeSaveMore(input, freedom, 200)!;
    expect(r).not.toBeNull();
    expect(r.freedom.targetCorpus).toBe(freedom.targetCorpus);
    expect(r.freedom.freedomAge).toBe(freedom.freedomAge);
    expect(r.freedom.currentAnnualExpenses).toBe(freedom.currentAnnualExpenses);
    expect(r.freedom.currentMonthlySavings).toBeGreaterThan(freedom.currentMonthlySavings);
    expect(r.appliedExtra).toBeCloseTo(200, 6);
    if (r.age != null && freedom.yearsToFreedomAtCurrentRate != null) {
      expect(r.age).toBeLessThanOrEqual(Math.round(input.age + freedom.yearsToFreedomAtCurrentRate));
      expect(r.yearsSooner!).toBeGreaterThanOrEqual(0);
    }
  });
  it("ignores zero, negative or income-less requests", () => {
    const { input, freedom } = baseFor();
    expect(computeSaveMore(input, freedom, 0)).toBeNull();
    expect(computeSaveMore(input, freedom, -50)).toBeNull();
    expect(computeSaveMore({ ...input, monthlyIncome: 0 }, freedom, 200)).toBeNull();
  });
  it("caps at 90% of income and reports what was applied", () => {
    const { input, freedom } = baseFor();
    const r = computeSaveMore(input, freedom, 1_000_000)!;
    expect(r.newRate).toBeCloseTo(0.9, 9);
    expect(r.appliedExtra).toBeLessThan(1_000_000);
  });
  it("presets are round numbers", () => {
    expect(niceStep(187)).toBe(200);
    expect(extraPresets(9000)).toEqual([200, 500, 1000]);
    expect(extraPresets(0)).toEqual([]);
  });
});
