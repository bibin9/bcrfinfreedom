/**
 * Retirement drawdown (decumulation) simulator.
 *
 * Three outputs:
 *   1. Deterministic path — single run at expected return & inflation.
 *   2. Monte Carlo stress test — N randomised paths through Normal(mean, σ);
 *      we report survival % and the 10 / 50 / 90 percentile corpus bands.
 *   3. Guyton-Klinger guardrails — Green / Amber / Red / Bonus zones for the
 *      current year's withdrawal rate.
 *
 * All amounts are in RETIREMENT-country currency (what you spend in retirement).
 */

export interface DrawdownInput {
  /** Future corpus at the moment retirement begins. */
  startingCorpus: number;
  /** Future annual expenses in year 1 of retirement (inflation-adjusted). */
  firstYearExpenses: number;
  /** Age the user retires. */
  retirementAge: number;
  /** Age to simulate until (default 95). */
  endAge?: number;
  /** Nominal annual return mean. */
  expectedReturn: number;
  /** Nominal annual return standard deviation (volatility). */
  returnVolatility: number;
  /** Mean annual inflation rate. */
  inflationRate: number;
  /** Inflation standard deviation (set small — long-run inflation is sticky). */
  inflationVolatility?: number;
  /** How many Monte Carlo paths to simulate (default 1,000). */
  nPaths?: number;
}

export interface YearlyPoint {
  age: number;
  corpus: number;
  spending: number;
}

export interface DrawdownResult {
  /** Deterministic single-path run at expected return + inflation. */
  deterministic: {
    years: YearlyPoint[];
    depletedAtAge: number | null;
    finalCorpus: number;
  };
  /** Monte Carlo aggregate across all paths. */
  monteCarlo: {
    nPaths: number;
    successRate: number;
    /** Age at which each path ran out (null = never, i.e. still had money at endAge). */
    depletionAges: Array<number | null>;
    /** 10 / 50 / 90 percentile corpus at each age. */
    bands: Array<{ age: number; p10: number; p50: number; p90: number }>;
    /** Median surviving age across depletion events (null if none depleted). */
    medianDepletionAge: number | null;
  };
  /** Guyton-Klinger withdrawal rate guardrail status for year 1. */
  guardrails: {
    initialWithdrawalRate: number;
    zone: "bonus" | "green" | "amber" | "red";
    message: string;
    suggestedAdjustmentPct: number;
  };
}

// ---------------------------------------------------------------------------
// Pseudo-random number generator — Mulberry32. Seeded so that identical
// inputs always produce the same Monte Carlo result (otherwise the chart
// would re-roll on every re-render and look buggy).

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Standard-normal sample via Box-Muller using a seeded uniform rng. */
function makeNormal(rng: () => number): () => number {
  let spare: number | null = null;
  return function () {
    if (spare != null) {
      const v = spare;
      spare = null;
      return v;
    }
    // Box-Muller.
    let u = 0;
    let v = 0;
    while (u === 0) u = rng();
    while (v === 0) v = rng();
    const mag = Math.sqrt(-2.0 * Math.log(u));
    const z0 = mag * Math.cos(2.0 * Math.PI * v);
    const z1 = mag * Math.sin(2.0 * Math.PI * v);
    spare = z1;
    return z0;
  };
}

// ---------------------------------------------------------------------------
// Single deterministic run — spending inflates each year, corpus grows at
// (nominal) expectedReturn, next year's withdrawal comes off the top.

function simulatePath(
  startCorpus: number,
  startSpend: number,
  retireAge: number,
  endAge: number,
  returnSeq: number[],
  inflationSeq: number[],
): { years: YearlyPoint[]; depletedAtAge: number | null; finalCorpus: number } {
  const years: YearlyPoint[] = [];
  let corpus = startCorpus;
  let spending = startSpend;
  let depletedAtAge: number | null = null;

  for (let i = 0; i <= endAge - retireAge; i++) {
    const age = retireAge + i;
    // Withdraw at start of year.
    corpus -= spending;
    if (corpus <= 0) {
      corpus = 0;
      if (depletedAtAge == null) depletedAtAge = age;
    }
    // Grow the remainder at this year's return.
    corpus = corpus * (1 + returnSeq[i]);
    years.push({ age, corpus, spending });
    // Inflate next year's spend.
    spending = spending * (1 + inflationSeq[i]);
  }
  return { years, depletedAtAge, finalCorpus: corpus };
}

// ---------------------------------------------------------------------------
// Guyton-Klinger guardrail band for year 1.
//
// The initial withdrawal rate (initialWR = firstYearSpend / startingCorpus) is
// the anchor. If it's well under 4% you're in BONUS territory — you can
// likely spend more. If it's over 5% you're pulling too hard and need to cut.
//
// Thresholds (close to classic Guyton-Klinger):
//   WR ≤ 3.2%   → BONUS   (can increase spending ~10%)
//   WR ≤ 4.0%   → GREEN   (healthy baseline)
//   WR ≤ 5.0%   → AMBER   (watch, consider -10%)
//   WR  > 5.0%  → RED     (unsustainable, cut 20%+)

function assessGuardrails(initialWR: number): DrawdownResult["guardrails"] {
  if (initialWR <= 0.032) {
    return {
      initialWithdrawalRate: initialWR,
      zone: "bonus",
      message:
        "Bonus — you're pulling less than 3.2% of your corpus. Historically you can safely increase spending by ~10% and still have the money outlive you.",
      suggestedAdjustmentPct: 10,
    };
  }
  if (initialWR <= 0.04) {
    return {
      initialWithdrawalRate: initialWR,
      zone: "green",
      message:
        "Healthy — right at the classic 4% safe-withdrawal zone. Spend as planned; the portfolio should last a 30+ year retirement.",
      suggestedAdjustmentPct: 0,
    };
  }
  if (initialWR <= 0.05) {
    return {
      initialWithdrawalRate: initialWR,
      zone: "amber",
      message:
        "Caution — above the 4% rule. Historically survivable in most market regimes, but a bad first decade could put the plan at risk. Trim discretionary spending by ~10% to buy insurance.",
      suggestedAdjustmentPct: -10,
    };
  }
  return {
    initialWithdrawalRate: initialWR,
    zone: "red",
    message:
      "Danger — pulling more than 5% a year. Significant risk of running out in a 30-year retirement, especially if markets dip early. Cut spending 20%+ or delay retirement 2–3 years.",
    suggestedAdjustmentPct: -20,
  };
}

// ---------------------------------------------------------------------------
// Main entry point.

export function simulateDrawdown(input: DrawdownInput): DrawdownResult {
  const endAge = input.endAge ?? 95;
  const nPaths = input.nPaths ?? 1000;
  const infVol = input.inflationVolatility ?? 0.015;
  const years = endAge - input.retirementAge + 1;

  // ---- 1. Deterministic path ----
  const detReturns = new Array(years).fill(input.expectedReturn);
  const detInflation = new Array(years).fill(input.inflationRate);
  const deterministic = simulatePath(
    input.startingCorpus,
    input.firstYearExpenses,
    input.retirementAge,
    endAge,
    detReturns,
    detInflation,
  );

  // ---- 2. Monte Carlo ----
  // Seed from the inputs so results are stable across re-renders.
  const seed =
    Math.round(input.startingCorpus) ^
    Math.round(input.firstYearExpenses * 1000) ^
    Math.round(input.expectedReturn * 100000) ^
    Math.round(input.inflationRate * 100000) ^
    input.retirementAge;
  const rng = mulberry32(seed || 1);
  const normal = makeNormal(rng);

  const depletionAges: Array<number | null> = [];
  // corpusByAge[age] = array of corpus values across paths; used for percentiles.
  const corpusByAge: number[][] = Array.from({ length: years }, () => []);

  for (let p = 0; p < nPaths; p++) {
    const returnSeq = new Array(years)
      .fill(0)
      .map(() => input.expectedReturn + normal() * input.returnVolatility);
    const inflationSeq = new Array(years)
      .fill(0)
      .map(() => Math.max(0, input.inflationRate + normal() * infVol));
    const path = simulatePath(
      input.startingCorpus,
      input.firstYearExpenses,
      input.retirementAge,
      endAge,
      returnSeq,
      inflationSeq,
    );
    depletionAges.push(path.depletedAtAge);
    path.years.forEach((y, idx) => {
      corpusByAge[idx].push(y.corpus);
    });
  }

  const bands = corpusByAge.map((arr, idx) => {
    const sorted = [...arr].sort((a, b) => a - b);
    return {
      age: input.retirementAge + idx,
      p10: sorted[Math.floor(sorted.length * 0.1)] ?? 0,
      p50: sorted[Math.floor(sorted.length * 0.5)] ?? 0,
      p90: sorted[Math.floor(sorted.length * 0.9)] ?? 0,
    };
  });

  const survivors = depletionAges.filter((a) => a == null).length;
  const successRate = survivors / nPaths;

  const depletedAgesOnly = depletionAges.filter((a): a is number => a != null);
  depletedAgesOnly.sort((a, b) => a - b);
  const medianDepletionAge =
    depletedAgesOnly.length > 0
      ? depletedAgesOnly[Math.floor(depletedAgesOnly.length * 0.5)]
      : null;

  // ---- 3. Guardrails ----
  const initialWR =
    input.startingCorpus > 0 ? input.firstYearExpenses / input.startingCorpus : 0;
  const guardrails = assessGuardrails(initialWR);

  return {
    deterministic,
    monteCarlo: {
      nPaths,
      successRate,
      depletionAges,
      bands,
      medianDepletionAge,
    },
    guardrails,
  };
}

// ---------------------------------------------------------------------------
// Volatility heuristic from risk profile — rough but good enough for a
// stress-test visualisation. Values are long-run equity-market norms, scaled
// down for mixed portfolios.

export function volatilityFromRisk(
  risk: "conservative" | "moderate" | "aggressive",
): number {
  // Approx stddev of annual nominal returns.
  if (risk === "conservative") return 0.07;
  if (risk === "aggressive") return 0.16;
  return 0.12;
}
