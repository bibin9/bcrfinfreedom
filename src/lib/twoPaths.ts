/**
 * Compares two realistic life trajectories for the same person:
 *
 *   1. "Disciplined" — invests `savingsRate` of income monthly at the
 *      portfolio's expected return until retirement, then draws down at a
 *      safe withdrawal rate to cover expenses.
 *   2. "Drift" — lifestyle inflation eats most of the income. Saves only
 *      ~3% at bank-deposit rates (~4% nominal), then at retirement is
 *      forced to withdraw the same expenses and watches the corpus
 *      deplete in a few years.
 *
 * Both paths start with the same age, same currentCorpus, and attempt to
 * maintain the same retirement lifestyle (annual expenses at the savingsRate).
 * Everything is nominal local currency, monthly compounding.
 */
import type { CountryProfile } from "@/types";

export interface TwoPathsInput {
  age: number;
  monthlyIncome: number;
  currentCorpus: number;
  savingsRate: number;
  expectedReturn: number;
  country: CountryProfile;
}

export interface PathPoint {
  age: number;
  disciplined: number;
  drift: number;
}

export interface TwoPathsResult {
  points: PathPoint[];
  retirementAge: number;
  endAge: number;
  requiredMonthlyExpenses: number;
  disciplined: {
    finalAtRetirement: number;
    passiveMonthlyIncome: number;
    totalContributed: number;
    endCorpus: number;
  };
  drift: {
    finalAtRetirement: number;
    passiveMonthlyIncome: number;
    totalContributed: number;
    ageWealthRunsOut: number | null;
    monthlyShortfall: number;
    endCorpus: number;
  };
}

const DRIFT_SAVINGS_RATE = 0.03; // lifestyle creep leaves only ~3% saved
const DRIFT_RETURN = 0.04; // stuck in bank deposits / FDs
const DRAWDOWN_RETURN = 0.06; // conservative post-retirement portfolio return
const SWR = 0.04;

export function computeTwoPaths(input: TwoPathsInput): TwoPathsResult {
  const { age, monthlyIncome, currentCorpus, savingsRate, expectedReturn, country } = input;
  const retirementAge = Math.max(age + 1, country.retirementAge ?? 60);
  const endAge = 85;

  const discMonthly = monthlyIncome * savingsRate;
  const driftMonthly = monthlyIncome * DRIFT_SAVINGS_RATE;
  // Both paths try to maintain the disciplined lifestyle in retirement.
  const annualExpenses = monthlyIncome * 12 * (1 - savingsRate);
  const monthlyWithdrawal = annualExpenses / 12;

  let disciplined = currentCorpus;
  let drift = currentCorpus;
  let discContributed = 0;
  let driftContributed = 0;

  const points: PathPoint[] = [{ age, disciplined, drift }];
  let discAtRetirement = 0;
  let driftAtRetirement = 0;
  let driftAgeRunsOut: number | null = null;

  for (let a = age + 1; a <= endAge; a++) {
    if (a <= retirementAge) {
      // Accumulation — different rates + contributions
      const rDisc = expectedReturn / 12;
      const rDrift = DRIFT_RETURN / 12;
      for (let m = 0; m < 12; m++) {
        disciplined = disciplined * (1 + rDisc) + discMonthly;
        drift = drift * (1 + rDrift) + driftMonthly;
      }
      discContributed += discMonthly * 12;
      driftContributed += driftMonthly * 12;
      if (a === retirementAge) {
        discAtRetirement = disciplined;
        driftAtRetirement = drift;
      }
    } else {
      // Retirement drawdown — same expenses for both
      const r = DRAWDOWN_RETURN / 12;
      for (let m = 0; m < 12; m++) {
        disciplined = Math.max(0, disciplined * (1 + r) - monthlyWithdrawal);
        drift = Math.max(0, drift * (1 + r) - monthlyWithdrawal);
      }
      if (driftAgeRunsOut === null && drift <= 0) {
        driftAgeRunsOut = a;
      }
    }
    points.push({ age: a, disciplined, drift });
  }

  const driftPassive = (driftAtRetirement * SWR) / 12;

  return {
    points,
    retirementAge,
    endAge,
    requiredMonthlyExpenses: monthlyWithdrawal,
    disciplined: {
      finalAtRetirement: discAtRetirement,
      passiveMonthlyIncome: (discAtRetirement * SWR) / 12,
      totalContributed: discContributed,
      endCorpus: disciplined,
    },
    drift: {
      finalAtRetirement: driftAtRetirement,
      passiveMonthlyIncome: driftPassive,
      totalContributed: driftContributed,
      ageWealthRunsOut: driftAgeRunsOut,
      monthlyShortfall: Math.max(0, monthlyWithdrawal - driftPassive),
      endCorpus: drift,
    },
  };
}
