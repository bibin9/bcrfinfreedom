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

/**
 * Second sample: a young person earning in Dubai (AED) who plans to move back
 * to Kerala. Shows the two-country feature: income in one currency, retirement
 * spending in another. Spending override is in the retirement currency (₹):
 * ₹40,000/month at today's prices for a single person in Kochi.
 */
export const SAMPLE_DUBAI_KERALA: UserStateInputs = {
  country: "AE",
  retirementCountry: "IN",
  retirementCity: "kerala",
  age: 26,
  monthlyIncome: 9_000,
  risk: "moderate",
  goal: "early_retirement",
  householdSize: "single",
  savingsRate: 0.3,
  currentCorpus: 0,
  annualExpensesOverride: 480_000,
};

export type SampleKey = "family" | "dubai";
export const SAMPLES: Record<SampleKey, UserStateInputs> = {
  family: SAMPLE_INPUTS,
  dubai: SAMPLE_DUBAI_KERALA,
};

export function computeSamplePlan(inputs: UserStateInputs = SAMPLE_INPUTS) {
  const complete = toUserInput(inputs)!;
  const home = getCountryProfile(complete.country);
  // Money on the preview is shown in the retirement country's currency, exactly as the Reveal page does.
  const country = inputs.retirementCountry ? getCountryProfile(inputs.retirementCountry) : home;
  const allocation = calculateAllocation({
    age: complete.age,
    risk: complete.risk,
    country: home,
    goal: complete.goal,
    retirementCountry: country,
  });
  const freedom = calculateFreedom({
    ...complete,
    expectedReturn: allocation.expectedReturn,
    savingsRate: inputs.savingsRate,
    currentCorpus: inputs.currentCorpus,
    householdSize: inputs.householdSize,
    retirementCountry: inputs.retirementCountry,
    retirementCity: inputs.retirementCity,
    annualExpensesOverride: inputs.annualExpensesOverride,
  });
  const yearsAtCurrentRate = freedom.yearsToFreedomAtCurrentRate;
  const todayFireNumber = freedom.currentAnnualExpenses * 25;
  return {
    home,
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
        ? Math.min(100, ((inputs.currentCorpus ?? 0) / todayFireNumber) * 100)
        : 0,
  };
}
