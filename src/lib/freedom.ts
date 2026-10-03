/**
 * Financial freedom calculator.
 *
 * Uses the 25× annual-expenses rule (equivalent to a 4% safe-withdrawal rate)
 * as the "freedom corpus" target. All projections are in nominal local
 * currency; the expected blended return comes from the allocation engine.
 *
 * Inputs are intentionally minimal — the spec says "everything else should be
 * intelligently inferred", so we assume:
 *   - a 30% savings rate derived from monthly income (the user can see and
 *     sanity-check the number in the UI; this is a deliberately conservative
 *     default because most retail savers under-estimate their rate).
 *   - Annual expenses = (monthly income × 12) × (1 − savings rate).
 *
 * All interest maths use monthly compounding to match typical SIP/recurring
 * investment cadence in retail products.
 */

import type { CountryCode, ExpenseBasis, FreedomProjection, HouseholdSize, UserInput } from "@/types";
import { getCountryProfile } from "@/data/countryProfiles";
import { convertCurrency } from "@/lib/fx";

export interface FreedomInput extends UserInput {
  /** Blended expected nominal return, usually from `calculateAllocation`. */
  expectedReturn: number;
  /** Fraction of income saved (0..1). Defaults to 0.3 if omitted. */
  savingsRate?: number;
  /** Current invested corpus in RESIDENT-country currency. Defaults to 0. */
  currentCorpus?: number;
  /** Age at which the user wants to be financially free. Defaults to country.retirementAge. */
  freedomAge?: number;
  /** Household size used to pick the benchmark expense number. Defaults to "single". */
  householdSize?: HouseholdSize;
  /** Manual override for current annual expenses, in RETIREMENT-country currency. */
  annualExpensesOverride?: number;
  /**
   * Country the user plans to retire in. When set and different from `country`,
   * the FIRE number, inflation, and retirement-age default are taken from the
   * retirement country; the user's income/corpus (in resident currency) are
   * converted via spot FX so the math stays consistent in retirement currency.
   */
  retirementCountry?: CountryCode;
  /**
   * Expected lump-sum windfalls (future value at retirement, in retirement currency).
   * Subtracted from the FIRE target before computing the required SIP.
   */
  windfallsAtRetirement?: number;
}

const DEFAULT_SAVINGS_RATE = 0.3;
const SWR = 0.04; // 4% safe withdrawal rate → 25× annual expenses target.

/**
 * Monthly contribution required to grow `current` into `target` over `years`,
 * given a nominal annual return `annualReturn`. Returns `null` if the goal is
 * unreachable (e.g. target is zero or years <= 0).
 */
export function monthlyInvestmentFor(
  current: number,
  target: number,
  years: number,
  annualReturn: number,
): number | null {
  if (years <= 0) return null;
  if (target <= current) return 0;
  const n = years * 12;
  const r = annualReturn / 12;
  const futureOfCurrent = current * Math.pow(1 + r, n);
  const gap = target - futureOfCurrent;
  if (gap <= 0) return 0;
  // Future value of an ordinary annuity: FV = PMT * ((1+r)^n - 1) / r
  // => PMT = FV * r / ((1+r)^n - 1)
  if (r === 0) return gap / n;
  return (gap * r) / (Math.pow(1 + r, n) - 1);
}

/**
 * Years needed to grow `current` into `target` when contributing `monthly`
 * at the given annual return. Returns null if unreachable.
 */
export function yearsToTarget(
  current: number,
  target: number,
  monthly: number,
  annualReturn: number,
): number | null {
  if (target <= current) return 0;
  if (monthly <= 0 && annualReturn <= 0) return null;
  const r = annualReturn / 12;

  // If return is zero, linear: months = (target - current) / monthly.
  if (r === 0) {
    if (monthly <= 0) return null;
    return (target - current) / monthly / 12;
  }

  // Solve for n in: current*(1+r)^n + monthly * ((1+r)^n - 1)/r = target
  // Let A = current + monthly/r, B = monthly/r.
  // Then A*(1+r)^n - B = target  =>  (1+r)^n = (target + B) / A
  const A = current + monthly / r;
  const B = monthly / r;
  const ratio = (target + B) / A;
  if (ratio <= 0) return null;
  const n = Math.log(ratio) / Math.log(1 + r);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n / 12;
}

export function calculateFreedom(input: FreedomInput): FreedomProjection {
  const { country, age, monthlyIncome, expectedReturn } = input;
  const savingsRate = input.savingsRate ?? DEFAULT_SAVINGS_RATE;

  const profile = getCountryProfile(country);
  const retireProfile = input.retirementCountry
    ? getCountryProfile(input.retirementCountry)
    : profile;
  // The destination drives the expense / inflation / retirement-age side of the maths.
  const freedomAge = Math.max(age + 1, input.freedomAge ?? retireProfile.retirementAge);
  const inflation = retireProfile.inflationRate;
  const householdSize: HouseholdSize = input.householdSize ?? "single";

  // Convert RESIDENT-currency inputs into RETIREMENT currency so corpus and
  // benchmark are denominated the same. Single-country (default) case is a
  // no-op since convertCurrency returns the input when from === to.
  const monthlyIncomeRetCcy = convertCurrency(monthlyIncome, profile, retireProfile);
  const currentCorpusRetCcy = convertCurrency(
    input.currentCorpus ?? 0,
    profile,
    retireProfile,
  );

  // Resolve current annual expenses with clear precedence:
  //   1. User-entered override (most trustworthy — they know their own bills).
  //   2. Country benchmark for their household size (realistic mid-lifestyle anchor).
  //
  // We deliberately do NOT default to `income × (1 − savingsRate)`. A high earner
  // with a stated 30% savings rate would see expenses balloon to a number that
  // matches none of their lifestyle — leading to absurd corpus targets like ₹28 Cr
  // for a family that actually spends ~₹14 L/yr today. The benchmark anchors the
  // calculation in real cost-of-living data; the user can dial it up via override
  // if they're at a premium lifestyle.
  const benchmarkExpenses =
    householdSize === "family"
      ? retireProfile.averageAnnualExpensesFamily
      : retireProfile.averageAnnualExpensesSingle;
  let currentAnnualExpenses: number;
  let expenseBasis: ExpenseBasis;
  if (input.annualExpensesOverride != null && input.annualExpensesOverride > 0) {
    currentAnnualExpenses = input.annualExpensesOverride;
    expenseBasis = "override";
  } else {
    currentAnnualExpenses = benchmarkExpenses;
    expenseBasis = "benchmark";
  }

  // Inflate today's expenses to the freedom age — that's what you'll actually spend.
  const yearsToFreedom = freedomAge - age;
  const futureAnnualExpenses =
    currentAnnualExpenses * Math.pow(1 + inflation, yearsToFreedom);
  // 25× FUTURE annual expenses ≈ 4% safe withdrawal for life (inflation-adjusted).
  const targetCorpus = futureAnnualExpenses / SWR;

  // All flows below in RETIREMENT currency. Resident-currency inputs were
  // already converted above; savingsRate is dimensionless.
  const monthlySavings = monthlyIncomeRetCcy * savingsRate;

  const yearsTo = (targetAge: number) =>
    targetAge > age
      ? monthlyInvestmentFor(
          currentCorpusRetCcy,
          // Target scales with the chosen target age since expenses inflate further.
          (currentAnnualExpenses * Math.pow(1 + inflation, targetAge - age)) / SWR,
          targetAge - age,
          expectedReturn,
        )
      : null;

  const monthlyInvestmentRequired = {
    byAge50: yearsTo(50),
    byAge55: yearsTo(55),
    byAge60: yearsTo(60),
  };

  // Treat expected future windfalls (EOSB, inheritance, etc.) as a credit
  // against the FIRE target. Already stated as future-value AT retirement.
  const windfallCredit = Math.max(0, input.windfallsAtRetirement ?? 0);
  const targetCorpusAfterWindfalls = Math.max(0, targetCorpus - windfallCredit);
  const requiredMonthlySIP = monthlyInvestmentFor(
    currentCorpusRetCcy,
    targetCorpusAfterWindfalls,
    yearsToFreedom,
    expectedReturn,
  );

  // Will the user reach the inflation-adjusted target by freedom age at their
  // current savings? Years is measured against the same inflation-adjusted target.
  const yearsToFreedomAtCurrentRate = yearsToTarget(
    currentCorpusRetCcy,
    targetCorpus,
    monthlySavings,
    expectedReturn,
  );

  // If the user's savings aren't enough, what annual income growth is needed
  // so that savingsRate × income eventually reaches requiredMonthlySIP by the
  // chosen freedom age? We solve: income * (1+g)^yearsToFreedom * savingsRate
  //   == requiredMonthlySIP    →    g = (req / (income * savingsRate))^(1/n) - 1
  let requiredAnnualIncomeGrowth = 0;
  let requiredMonthlyIncomeAtFreedom: number | null = null;
  const monthlyShortfall =
    requiredMonthlySIP != null ? Math.max(0, requiredMonthlySIP - monthlySavings) : 0;

  if (
    requiredMonthlySIP != null &&
    requiredMonthlySIP > monthlySavings &&
    yearsToFreedom > 0 &&
    savingsRate > 0 &&
    monthlyIncomeRetCcy > 0
  ) {
    const ratio = requiredMonthlySIP / monthlySavings; // >1
    requiredAnnualIncomeGrowth = Math.pow(ratio, 1 / yearsToFreedom) - 1;
    requiredMonthlyIncomeAtFreedom =
      monthlyIncomeRetCcy * Math.pow(1 + requiredAnnualIncomeGrowth, yearsToFreedom);
  }

  // Year-by-year income + SIP plan assuming the required annual growth rate.
  // Shows a 10-year window (or up to freedomAge if closer) so the user can
  // benchmark raises vs required SIP each year.
  const planYears = Math.min(10, yearsToFreedom);
  const g = requiredAnnualIncomeGrowth;
  const incomePlan: FreedomProjection["incomePlan"] = [];
  for (let y = 0; y <= planYears; y++) {
    const growthFactor = Math.pow(1 + g, y);
    const suggestedIncome = monthlyIncomeRetCcy * growthFactor;
    const suggestedSIP = Math.max(monthlySavings, suggestedIncome * savingsRate);
    incomePlan.push({
      age: age + y,
      yearsFromNow: y,
      suggestedMonthlyIncome: Math.round(suggestedIncome),
      suggestedMonthlySIP: Math.round(suggestedSIP),
    });
  }

  // Year-by-year wealth projection up to age 70 (or 30 years past current age,
  // whichever is longer). Uses current savings as-is — this answers the question
  // "will I get there without a raise?"
  const horizonAge = Math.max(70, age + 30);
  const projection: Array<{ age: number; wealth: number }> = [];
  const r = expectedReturn / 12;
  let wealth = currentCorpusRetCcy;
  projection.push({ age, wealth });
  for (let y = age + 1; y <= horizonAge; y++) {
    for (let m = 0; m < 12; m++) {
      wealth = wealth * (1 + r) + monthlySavings;
    }
    projection.push({ age: y, wealth });
  }

  // ---- FIRE tier breakdown ------------------------------------------------
  // Each tier is a multiple of FUTURE annual expenses (already inflation-adjusted).
  const tierTarget = (mult: number) => futureAnnualExpenses * mult;
  const yearsAt = (target: number) =>
    yearsToTarget(currentCorpusRetCcy, target, monthlySavings, expectedReturn);

  const lean = {
    multiple: 15,
    targetCorpus: tierTarget(15),
    yearsAtCurrentSavings: yearsAt(tierTarget(15)),
  };
  const standard = {
    multiple: 25,
    targetCorpus: tierTarget(25),
    yearsAtCurrentSavings: yearsAt(tierTarget(25)),
  };
  const fat = {
    multiple: 33,
    targetCorpus: tierTarget(33),
    yearsAtCurrentSavings: yearsAt(tierTarget(33)),
  };
  // CoastFIRE: corpus needed TODAY that compounds (no contributions) into the
  // standard FIRE number by the chosen freedom age.
  const coastTodayCorpus =
    yearsToFreedom > 0 ? targetCorpus / Math.pow(1 + expectedReturn, yearsToFreedom) : targetCorpus;

  // ---- Savings-rate curve (Mr Money Mustache classic) ---------------------
  // For each savings rate, compute years-to-FI assuming user keeps current
  // income and lifestyle scales with (1 - SR). Uses real return = nominal − inflation
  // so years are stated in real (today's) terms.
  const realReturn = Math.max(0.01, expectedReturn - inflation);
  const savingsRateCurve: FreedomProjection["savingsRateCurve"] = [];
  for (let pct = 10; pct <= 70; pct += 5) {
    const sr = pct / 100;
    // Annual expenses at this savings rate, anchored on income (so this curve
    // reflects "what if I lived on (1-SR) of income"). Target = 25× those expenses.
    const exp = monthlyIncomeRetCcy * 12 * (1 - sr);
    const tgt = exp * 25;
    const sip = monthlyIncomeRetCcy * sr; // monthly contributions
    const yrs = yearsToTarget(currentCorpusRetCcy, tgt, sip, realReturn);
    savingsRateCurve.push({ savingsRate: sr, yearsToFI: yrs });
  }

  return {
    targetCorpus,
    annualExpenses: futureAnnualExpenses,
    currentAnnualExpenses,
    expenseBasis,
    householdSize,
    freedomAge,
    inflationRateUsed: inflation,
    monthlyInvestmentRequired,
    yearsToFreedomAtCurrentRate,
    projection,
    requiredMonthlySIP,
    currentMonthlySavings: monthlySavings,
    monthlyShortfall,
    requiredAnnualIncomeGrowth,
    requiredMonthlyIncomeAtFreedom,
    incomePlan,
    fireTiers: { lean, standard, fat, coastTodayCorpus },
    savingsRateCurve,
  };
}
