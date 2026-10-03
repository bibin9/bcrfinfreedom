/**
 * End-of-service benefits for Gulf residents.
 *
 * UAE mainland — Federal Decree-Law 33/2021 (in force Feb 2022):
 *   21 days' basic wage per year for the first 5 years, 30 days per year after,
 *   pro-rated for part years, nothing under 1 year, total capped at 2 years'
 *   basic wage. Resignation no longer reduces the payout. Daily wage = basic / 30.
 *
 * DIFC — since Feb 2020 gratuity is replaced by DEWS: employer contributes
 *   5.83% of basic monthly for the first 5 years of service, 8.33% after.
 *
 * Saudi Arabia — Labour Law Art. 84/85: half a month's wage per year for the
 *   first 5 years, one month per year after. On resignation: under 2 years
 *   nothing, 2–5 years one third, 5–10 years two thirds, 10+ years in full.
 *
 * Educational estimates — contracts, unpaid leave and free-zone rules vary.
 */

export function uaeGratuity(basicMonthly: number, yearsOfService: number): number {
  if (basicMonthly <= 0 || yearsOfService < 1) return 0;
  const first = Math.min(yearsOfService, 5);
  const after = Math.max(0, yearsOfService - 5);
  const days = 21 * first + 30 * after;
  const amount = (basicMonthly / 30) * days;
  return Math.min(amount, basicMonthly * 24);
}

export type SaudiExitReason = "termination" | "resignation";

export function saudiEndOfService(
  monthlyWage: number,
  yearsOfService: number,
  reason: SaudiExitReason,
): number {
  if (monthlyWage <= 0 || yearsOfService <= 0) return 0;
  const full =
    0.5 * monthlyWage * Math.min(yearsOfService, 5) +
    monthlyWage * Math.max(0, yearsOfService - 5);
  if (reason === "termination") return full;
  if (yearsOfService < 2) return 0;
  if (yearsOfService < 5) return full / 3;
  if (yearsOfService < 10) return (full * 2) / 3;
  return full;
}

/**
 * DEWS balance at departure. Contributions are made monthly on the basic wage
 * (growing yearly at `basicGrowth`) and compound at `annualReturn`.
 * Past service is approximated as contributions at today's basic with no growth.
 */
export function difcDews(
  basicMonthly: number,
  yearsServed: number,
  extraYears: number,
  annualReturn: number,
  basicGrowth: number,
): { today: number; atDeparture: number } {
  const rateFor = (serviceYear: number) => (serviceYear < 5 ? 0.0583 : 0.0833);
  let today = 0;
  for (let y = 0; y < Math.floor(yearsServed); y++) today += basicMonthly * rateFor(y) * 12;
  const partial = yearsServed - Math.floor(yearsServed);
  today += basicMonthly * rateFor(Math.floor(yearsServed)) * 12 * partial;

  const r = annualReturn / 12;
  let balance = today;
  const months = Math.round(extraYears * 12);
  for (let m = 0; m < months; m++) {
    const serviceYear = yearsServed + m / 12;
    const basic = basicMonthly * Math.pow(1 + basicGrowth, Math.floor(m / 12));
    balance = balance * (1 + r) + basic * rateFor(serviceYear);
  }
  return { today, atDeparture: balance };
}

export interface EOSBEstimate {
  today: number;
  atDeparture: number;
  basicAtDeparture: number;
  totalYears: number;
  capped: boolean;
}

/** UAE mainland: accrued today and projected at departure (final basic drives the payout). */
export function estimateUAE(
  basicMonthly: number,
  yearsServed: number,
  extraYears: number,
  basicGrowth: number,
): EOSBEstimate {
  const totalYears = yearsServed + extraYears;
  const basicAtDeparture = basicMonthly * Math.pow(1 + basicGrowth, extraYears);
  const atDeparture = uaeGratuity(basicAtDeparture, totalYears);
  return {
    today: uaeGratuity(basicMonthly, yearsServed),
    atDeparture,
    basicAtDeparture,
    totalYears,
    capped: atDeparture >= basicAtDeparture * 24 - 0.5,
  };
}

export function estimateSaudi(
  monthlyWage: number,
  yearsServed: number,
  extraYears: number,
  wageGrowth: number,
  reason: SaudiExitReason,
): EOSBEstimate {
  const totalYears = yearsServed + extraYears;
  const wageAtDeparture = monthlyWage * Math.pow(1 + wageGrowth, extraYears);
  return {
    today: saudiEndOfService(monthlyWage, yearsServed, reason),
    atDeparture: saudiEndOfService(wageAtDeparture, totalYears, reason),
    basicAtDeparture: wageAtDeparture,
    totalYears,
    capped: false,
  };
}
