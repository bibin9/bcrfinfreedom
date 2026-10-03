/**
 * NRI (Non-Resident Indian) tax rules under the Indian Income Tax Act, 1961.
 *
 * ALL CALCULATIONS ARE EDUCATIONAL. Residency rules are frequently amended;
 * CBDT circulars + budget changes can tweak day-counts and thresholds every
 * April. Users must confirm with a CA before acting.
 *
 * Current coverage (FY 2024-25 / AY 2025-26 rules as last updated):
 *   - Residency determination under Section 6
 *   - RNOR eligibility under Section 6(6)
 *   - Deemed-resident rule (introduced FY 2020-21, Finance Act 2020)
 *   - NRE vs NRO account tax treatment
 *   - RNOR-window tax savings estimate
 */

/** The three Indian tax-residency buckets. */
export type ResidencyStatus = "NR" | "RNOR" | "ROR";

export interface ResidencyInput {
  /** Days physically present in India during the current financial year. */
  daysInCurrentFY: number;
  /** Days present in each of the preceding 4 FYs (most-recent-first). */
  daysInPrecedingFYs: [number, number, number, number];
  /** Is the user an Indian citizen or Person of Indian Origin (PIO)? */
  isIndianCitizenOrPIO: boolean;
  /** Returning permanently (took up employment outside India then returned)? */
  returningFromEmployment: boolean;
  /**
   * Total Indian-source income this FY in ₹. Used for the
   * ₹15L deemed-resident threshold (Finance Act 2020).
   */
  indianIncomeINR: number;
  /** Was the person "liable to tax" (ordinary resident) somewhere else? */
  taxedInAnotherCountry: boolean;
  /** How many of the last 10 FYs the user was NON-RESIDENT. */
  nonResidentIn9of10LastYrs: boolean;
  /** Days present in India in the last 7 FYs — for the ≤729 RNOR condition. */
  daysInLast7Years: number;
}

export interface ResidencyResult {
  status: ResidencyStatus;
  explanation: string;
  /** Which rule triggered the status, for display. */
  triggeredBy: string;
  /** True if the deemed-resident (₹15L / 120 days / stateless) rule applied. */
  deemedResident: boolean;
}

const FY_RESIDENT_DAYS_PRIMARY = 182;
const FY_RESIDENT_DAYS_SECONDARY = 60;
const FY_PRECEDING_4YR_SECONDARY_THRESHOLD = 365;
const DEEMED_RES_INCOME_THRESHOLD_INR = 15_00_000; // ₹15 L
const DEEMED_RES_DAYS_LOWER = 120;
const RNOR_LAST_7YR_DAYS_LIMIT = 729;

/**
 * Determine Indian tax residency status for the current FY.
 *
 * Order of evaluation:
 *   1. Resident under Section 6(1): primary 182 or secondary 60+365.
 *      - For Indian citizens leaving/returning, primary 182 applies instead of 60.
 *      - For Indian citizens with Indian income > ₹15L visiting India:
 *        secondary threshold = 120 days.
 *   2. If NOT a resident → NR.
 *   3. If resident → check Section 6(6) RNOR tests. If ANY pass → RNOR.
 *   4. Else → ROR.
 *   5. Deemed-resident rule (Section 6(1A)): Indian citizen with Indian income
 *      > ₹15L AND not liable to tax elsewhere → deemed resident, automatically
 *      RNOR (never ROR by this clause).
 */
export function assessResidency(i: ResidencyInput): ResidencyResult {
  const totalPreceding4 = i.daysInPrecedingFYs.reduce((a, b) => a + b, 0);

  // ----- Deemed resident (Section 6(1A), Finance Act 2020) --------------
  if (
    i.isIndianCitizenOrPIO &&
    i.indianIncomeINR > DEEMED_RES_INCOME_THRESHOLD_INR &&
    !i.taxedInAnotherCountry
  ) {
    return {
      status: "RNOR",
      explanation:
        "You are a 'deemed resident' under Section 6(1A) — an Indian citizen with Indian income over ₹15 L and not liable to tax in any other country. You are automatically treated as RNOR: Indian income is fully taxed, foreign income is not.",
      triggeredBy: "Section 6(1A) — deemed resident",
      deemedResident: true,
    };
  }

  // ----- Primary resident test ------------------------------------------
  if (i.daysInCurrentFY >= FY_RESIDENT_DAYS_PRIMARY) {
    return rnor_or_ror(
      i,
      `≥ ${FY_RESIDENT_DAYS_PRIMARY} days in India this FY (Section 6(1)(a))`,
    );
  }

  // ----- Secondary resident test ----------------------------------------
  // Default secondary threshold is 60 days + 365 in last 4 yrs.
  // For Indian citizens / PIO returning for employment or visiting: 182 days
  // (secondary test disabled). Finance Act 2020 lowered that to 120 for
  // Indian citizens with Indian income > ₹15L.
  let secondaryThreshold = FY_RESIDENT_DAYS_SECONDARY;
  if (i.isIndianCitizenOrPIO) {
    secondaryThreshold = FY_RESIDENT_DAYS_PRIMARY; // 182
    if (i.indianIncomeINR > DEEMED_RES_INCOME_THRESHOLD_INR) {
      secondaryThreshold = DEEMED_RES_DAYS_LOWER; // 120 — the Finance Act 2020 change
    }
  }
  if (
    i.daysInCurrentFY >= secondaryThreshold &&
    totalPreceding4 >= FY_PRECEDING_4YR_SECONDARY_THRESHOLD
  ) {
    return rnor_or_ror(
      i,
      `≥ ${secondaryThreshold} days this FY + ≥ 365 days in preceding 4 FYs (Section 6(1)(c))`,
    );
  }

  // ----- Non-resident ----------------------------------------------------
  return {
    status: "NR",
    explanation:
      "You are a Non-Resident (NR) for this FY. Only your Indian-source income is taxable in India. Foreign income (salary earned abroad, foreign bank interest, foreign capital gains) is NOT taxable in India.",
    triggeredBy: "Fails all resident day-count tests",
    deemedResident: false,
  };
}

/** For a user who IS resident, decide if they qualify for RNOR relief. */
function rnor_or_ror(i: ResidencyInput, triggeredBy: string): ResidencyResult {
  const rnorByHistory = i.nonResidentIn9of10LastYrs;
  const rnorByDays = i.daysInLast7Years <= RNOR_LAST_7YR_DAYS_LIMIT;
  // Deemed-resident 15L/120-day branch (Indian income > 15L + 120-181 days):
  const rnorBy120DayBranch =
    i.isIndianCitizenOrPIO &&
    i.indianIncomeINR > DEEMED_RES_INCOME_THRESHOLD_INR &&
    i.daysInCurrentFY >= DEEMED_RES_DAYS_LOWER &&
    i.daysInCurrentFY < FY_RESIDENT_DAYS_PRIMARY;

  if (rnorByHistory || rnorByDays || rnorBy120DayBranch) {
    const reasons: string[] = [];
    if (rnorByHistory) reasons.push("non-resident in 9 of the last 10 FYs");
    if (rnorByDays) reasons.push(`≤ 729 days in India across the last 7 FYs`);
    if (rnorBy120DayBranch)
      reasons.push("Indian citizen earning > ₹15 L, 120–181 days in India (Finance Act 2020)");
    return {
      status: "RNOR",
      explanation: `You are a Resident but Not Ordinarily Resident (RNOR). Indian income is fully taxed; foreign income is NOT taxed. Qualifying because: ${reasons.join("; ")}.`,
      triggeredBy,
      deemedResident: false,
    };
  }
  return {
    status: "ROR",
    explanation:
      "You are Resident and Ordinarily Resident (ROR) — your worldwide income is fully taxable in India this FY. Plan foreign-asset moves accordingly.",
    triggeredBy,
    deemedResident: false,
  };
}

// ===========================================================================
// RNOR window projection — if you return permanently in year X, how many
// FYs will you qualify as RNOR before becoming ROR?
// ===========================================================================

export interface RNORWindowInput {
  /** FY of permanent return to India (e.g. 2026 means FY 2026-27). */
  returnFY: number;
  /** How many of the preceding 10 FYs the user was a Non-Resident. */
  nonResidentFYsInLast10: number;
  /** Average days per year spent in India during the NRI period. */
  avgDaysPerYearAsNRI: number;
}

export interface RNORWindowProjection {
  returnFY: number;
  rnorFYs: number[]; // the FYs expected to qualify as RNOR
  rorFromFY: number;
  explanation: string;
}

/**
 * Project the RNOR window after a return. Simplified model: a long-term NRI
 * (NR for 9+ of last 10) qualifies as RNOR for the 2 FYs immediately after
 * return, then ROR from FY+3. Users with partial NRI history may qualify
 * for less (or none).
 */
export function projectRNORWindow(i: RNORWindowInput): RNORWindowProjection {
  // Classic long-term NRI returnee: NR for 9+ of last 10 FYs AND low day-count
  // in India (<= 729/7yr avg → ≤ ~104 days/yr) → qualifies for 2 full RNOR FYs.
  if (i.nonResidentFYsInLast10 >= 9 && i.avgDaysPerYearAsNRI <= 104) {
    return {
      returnFY: i.returnFY,
      rnorFYs: [i.returnFY, i.returnFY + 1],
      rorFromFY: i.returnFY + 2,
      explanation:
        "Classic long-term NRI return — 2 full RNOR FYs starting with the return year. Repatriate and liquidate foreign assets during this window to avoid Indian tax.",
    };
  }
  // Shorter NRI history or more India-days → likely only 1 RNOR FY.
  if (i.nonResidentFYsInLast10 >= 7 || i.avgDaysPerYearAsNRI <= 120) {
    return {
      returnFY: i.returnFY,
      rnorFYs: [i.returnFY],
      rorFromFY: i.returnFY + 1,
      explanation:
        "Partial RNOR qualification — one FY of RNOR status, then full ROR from the following FY. Act on foreign-asset moves fast.",
    };
  }
  return {
    returnFY: i.returnFY,
    rnorFYs: [],
    rorFromFY: i.returnFY,
    explanation:
      "No RNOR window available — your NRI history is too short or your India day-count too high. You will be fully ROR from the return FY itself.",
  };
}

// ===========================================================================
// NRE vs NRO account comparison
// ===========================================================================

export interface NREvsNROInput {
  /** Deposit / principal in INR. */
  principalINR: number;
  /** Annual interest rate on the deposit, decimal. */
  interestRate: number;
  /** Marginal income-tax slab the user falls into (0.30 = 30%). */
  marginalTaxRate: number;
}

export interface NREvsNROResult {
  grossAnnualInterest: number;
  nreNetInterest: number; // tax-free for non-residents
  nroNetInterest: number; // interest minus marginal tax
  nreEffectiveYield: number; // decimal
  nroEffectiveYield: number;
}

export function compareNREvsNRO(i: NREvsNROInput): NREvsNROResult {
  const gross = i.principalINR * i.interestRate;
  const nreNet = gross; // NRE interest fully tax-free in India for non-residents
  const nroNet = gross * (1 - i.marginalTaxRate);
  return {
    grossAnnualInterest: gross,
    nreNetInterest: nreNet,
    nroNetInterest: nroNet,
    nreEffectiveYield: nreNet / i.principalINR,
    nroEffectiveYield: nroNet / i.principalINR,
  };
}

// ===========================================================================
// RNOR window tax savings estimate — the "why RNOR matters" headline number.
// ===========================================================================

export interface RNORTaxSavingsInput {
  /** Expected annual foreign income (foreign salary, dividends, FD interest) in INR equivalent. */
  foreignIncomeINR: number;
  /** Number of RNOR FYs available (0, 1 or 2 typically). */
  rnorYears: number;
  /** Marginal tax slab in India (decimal) — tax saved per rupee of foreign income. */
  marginalTaxRate: number;
}

export interface RNORTaxSavingsResult {
  totalForeignIncome: number;
  totalTaxSaved: number;
}

export function estimateRNORTaxSavings(i: RNORTaxSavingsInput): RNORTaxSavingsResult {
  const totalForeignIncome = i.foreignIncomeINR * i.rnorYears;
  return {
    totalForeignIncome,
    totalTaxSaved: totalForeignIncome * i.marginalTaxRate,
  };
}

// ===========================================================================
// Indian income-tax slab helper (new regime, FY 2024-25) — for approximate
// marginal rate inference. Used as a default when the user doesn't type one.
// ===========================================================================

/** New-regime slab marginal rate for a given total income. */
export function marginalRateForIncome(incomeINR: number): number {
  if (incomeINR <= 3_00_000) return 0;
  if (incomeINR <= 7_00_000) return 0.05;
  if (incomeINR <= 10_00_000) return 0.1;
  if (incomeINR <= 12_00_000) return 0.15;
  if (incomeINR <= 15_00_000) return 0.2;
  return 0.3;
}
