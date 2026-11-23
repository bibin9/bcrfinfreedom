/**
 * The homepage sample plan ("Arjun & Meera").
 *
 * One source of truth: the homepage preview card and the plan that opens when
 * the visitor clicks it are both computed from SAMPLE_INPUTS with the same
 * engine (calculateAllocation + calculateFreedom), so the numbers can never
 * disagree. Nothing here is hard-coded text.
 */

import { calculateAllocation } from "@/lib/allocation";
import { calculateFreedom } from "@/lib/freedom";
import { getCountryProfile } from "@/data/countryProfiles";
import { toUserInput, type UserStateInputs } from "@/store/userStore";

export const SAMPLE_INPUTS: UserStateInputs = {
  country: "IN",
  age: 32,
  monthlyIncome: 120_000,
  risk: "moderate",
  goal: "wealth_building",
  householdSize: "family",
  retirementCity: "bengaluru",
  savingsRate: 0.3,
  currentCorpus: 0,
  // What they plan to spend per year in retirement, in today's money (₹70,000/month).
  // Matches the monthly spending shown in their cash-flow view, so the sample does not
  // rely on the generic Bengaluru family benchmark (which is far above their income).
  annualExpensesOverride: 840_000,
};

export function computeSamplePlan() {
  const complete = toUserInput(SAMPLE_INPUTS)!;
  const country = getCountryProfile(complete.country);
  const allocation = calculateAllocation({
    age: complete.age,
    risk: complete.risk,
    country,
    goal: complete.goal,
  });
  const freedom = calculateFreedom({
    ...complete,
    expectedReturn: allocation.expectedReturn,
    savingsRate: SAMPLE_INPUTS.savingsRate,
    currentCorpus: SAMPLE_INPUTS.currentCorpus,
    householdSize: SAMPLE_INPUTS.householdSize,
    retirementCity: SAMPLE_INPUTS.retirementCity,
    annualExpensesOverride: SAMPLE_INPUTS.annualExpensesOverride,
  });
  const yearsAtCurrentRate = freedom.yearsToFreedomAtCurrentRate;
  const todayFireNumber = freedom.currentAnnualExpenses * 25;
  return {
    country,
    freedom,
    /** Age they reach freedom if they keep saving at today's rate (null = never). */
    ageAtCurrentRate:
      yearsAtCurrentRate != null ? Math.round(complete.age + yearsAtCurrentRate) : null,
    yearsAtCurrentRate,
    onTrack:
      yearsAtCurrentRate != null && complete.age + yearsAtCurrentRate <= freedom.freedomAge + 0.5,
    fiRatioPct:
      todayFireNumber > 0
        ? Math.min(100, ((SAMPLE_INPUTS.currentCorpus ?? 0) / todayFireNumber) * 100)
        : 0,
  };
}
