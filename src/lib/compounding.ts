/**
 * Compounding utilities — the "show them the magic" layer.
 *
 * Four independent calculations power the compounding card:
 *
 *   1. projectSIP(monthly, annualReturn, years, currentCorpus)
 *      Year-by-year total value, principal invested, and compound gains.
 *
 *   2. costOfWaitingCurves(startAges, toAge, monthly, annualReturn)
 *      A family of projections starting at different ages but stopping at the
 *      same target age — the classic "start at 25 vs 35" visual.
 *
 *   3. ruleOf72(annualReturn)
 *      Doubling time in years.
 *
 *   4. returnSensitivity(monthly, returns, years)
 *      Same SIP + horizon, varied return assumption — shows exponential
 *      divergence between 6/8/12/15% CAGRs.
 */

import type { CompoundingPoint } from "@/types";

/** Monthly compounding of a SIP plus an optional starting corpus. */
export function projectSIP(
  monthly: number,
  annualReturn: number,
  years: number,
  currentCorpus = 0,
  startingAge = 0,
): CompoundingPoint[] {
  const r = annualReturn / 12;
  const points: CompoundingPoint[] = [];
  let wealth = currentCorpus;
  let principalInvested = currentCorpus;

  points.push({
    year: 0,
    age: startingAge,
    principalInvested,
    gains: 0,
    total: wealth,
  });

  for (let y = 1; y <= years; y++) {
    for (let m = 0; m < 12; m++) {
      wealth = wealth * (1 + r) + monthly;
      principalInvested += monthly;
    }
    points.push({
      year: y,
      age: startingAge + y,
      principalInvested,
      gains: Math.max(0, wealth - principalInvested),
      total: wealth,
    });
  }
  return points;
}

/** The classic "cost of waiting" curves — same monthly SIP, different start ages. */
export function costOfWaitingCurves(
  startAges: number[],
  toAge: number,
  monthly: number,
  annualReturn: number,
): Array<{ startAge: number; points: CompoundingPoint[] }> {
  return startAges.map((startAge) => ({
    startAge,
    points: projectSIP(monthly, annualReturn, Math.max(0, toAge - startAge), 0, startAge),
  }));
}

/** Doubling time in years using the Rule of 72 (a decent approximation for 4–15%). */
export function ruleOf72(annualReturn: number): number {
  if (annualReturn <= 0) return Infinity;
  return 72 / (annualReturn * 100);
}

/** Same SIP + horizon, multiple return assumptions — shows exponential divergence. */
export function returnSensitivity(
  monthly: number,
  returns: number[],
  years: number,
): Array<{ returnRate: number; points: CompoundingPoint[] }> {
  return returns.map((r) => ({ returnRate: r, points: projectSIP(monthly, r, years) }));
}

/**
 * Merge a return-sensitivity bundle into a single chart-friendly array where
 * each entry has one key per return rate. Used by Recharts LineChart.
 */
export function mergeSensitivity(
  bundle: Array<{ returnRate: number; points: CompoundingPoint[] }>,
): Array<Record<string, number>> {
  if (bundle.length === 0) return [];
  const horizon = bundle[0].points.length;
  const rows: Array<Record<string, number>> = [];
  for (let i = 0; i < horizon; i++) {
    const row: Record<string, number> = { year: bundle[0].points[i].year };
    for (const b of bundle) {
      row[`r${Math.round(b.returnRate * 1000)}`] = b.points[i]?.total ?? 0;
    }
    rows.push(row);
  }
  return rows;
}
