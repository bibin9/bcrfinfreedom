import { describe, expect, it } from "vitest";
import { SAMPLE_INPUTS, computeSamplePlan } from "@/lib/samplePlan";
import { calculateAllocation } from "@/lib/allocation";
import { calculateFreedom } from "@/lib/freedom";
import { toUserInput } from "@/store/userStore";
import { getCountryProfile } from "@/data/countryProfiles";

describe("homepage sample plan", () => {
  it("preview numbers equal what the Reveal page computes from the same inputs", () => {
    const plan = computeSamplePlan();
    // Reproduce Reveal.tsx's calculation independently.
    const c = toUserInput(SAMPLE_INPUTS)!;
    const country = getCountryProfile(c.country);
    const a = calculateAllocation({ age: c.age, risk: c.risk, country, goal: c.goal, retirementCountry: country });
    const f = calculateFreedom({
      ...c,
      expectedReturn: a.expectedReturn,
      savingsRate: SAMPLE_INPUTS.savingsRate ?? 0.3,
      currentCorpus: SAMPLE_INPUTS.currentCorpus ?? 0,
      householdSize: SAMPLE_INPUTS.householdSize ?? "single",
      annualExpensesOverride: SAMPLE_INPUTS.annualExpensesOverride,
      retirementCountry: SAMPLE_INPUTS.retirementCountry,
      retirementCity: SAMPLE_INPUTS.retirementCity,
    });
    expect(plan.freedom.targetCorpus).toBe(f.targetCorpus);
    expect(plan.freedom.requiredMonthlySIP).toBe(f.requiredMonthlySIP);
    expect(plan.ageAtCurrentRate).toBe(Math.round(c.age + f.yearsToFreedomAtCurrentRate!));
  });
});
