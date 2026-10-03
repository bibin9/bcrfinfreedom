import { describe, it, expect } from "vitest";
import {
  calculateFreedom,
  monthlyInvestmentFor,
  yearsToTarget,
} from "@/lib/freedom";

describe("monthlyInvestmentFor", () => {
  it("returns 0 when target is already met", () => {
    expect(monthlyInvestmentFor(1_000_000, 500_000, 20, 0.08)).toBe(0);
  });

  it("returns null for non-positive years", () => {
    expect(monthlyInvestmentFor(0, 1_000_000, 0, 0.08)).toBeNull();
    expect(monthlyInvestmentFor(0, 1_000_000, -5, 0.08)).toBeNull();
  });

  it("matches the closed-form annuity formula (smoke)", () => {
    // Growing $0 → $1M over 30 years @ 8% should be ~ $670.98 / month.
    const pmt = monthlyInvestmentFor(0, 1_000_000, 30, 0.08)!;
    expect(pmt).toBeGreaterThan(650);
    expect(pmt).toBeLessThan(700);
  });

  it("handles zero-return case without division by zero", () => {
    // $0 → $120,000 over 10 years, 0% return = $1,000 / month.
    expect(monthlyInvestmentFor(0, 120_000, 10, 0)).toBeCloseTo(1_000, 2);
  });

  it("shorter horizon requires larger monthly contribution", () => {
    const short = monthlyInvestmentFor(0, 1_000_000, 10, 0.08)!;
    const long = monthlyInvestmentFor(0, 1_000_000, 30, 0.08)!;
    expect(short).toBeGreaterThan(long);
  });
});

describe("yearsToTarget", () => {
  it("returns 0 if already at target", () => {
    expect(yearsToTarget(500_000, 100_000, 1_000, 0.08)).toBe(0);
  });

  it("is finite and positive for a realistic scenario", () => {
    const yrs = yearsToTarget(0, 1_000_000, 1_000, 0.08);
    expect(yrs).not.toBeNull();
    expect(yrs!).toBeGreaterThan(0);
    expect(yrs!).toBeLessThan(60);
  });

  it("zero return and zero monthly is unreachable (null)", () => {
    expect(yearsToTarget(0, 1_000_000, 0, 0)).toBeNull();
  });

  it("linear case (zero return) matches simple arithmetic", () => {
    // $0 → $120,000 @ $1,000/month with 0% return = 120 months = 10 years.
    expect(yearsToTarget(0, 120_000, 1_000, 0)).toBeCloseTo(10, 2);
  });
});

describe("calculateFreedom", () => {
  it("uses the 25x rule applied to the country/household expense benchmark", () => {
    // US single benchmark = $55k/yr today. At 2.5% inflation over (67−30)=37 yrs
    // the future spend is $55k * 1.025^37 ≈ $138k. Target = 25 * $138k ≈ $3.46M.
    // (The 30% savingsRate is now irrelevant to target — benchmark drives it.)
    const result = calculateFreedom({
      country: "US",
      age: 30,
      monthlyIncome: 10_000,
      risk: "moderate",
      goal: "wealth_building",
      expectedReturn: 0.08,
    });
    expect(result.expenseBasis).toBe("benchmark");
    expect(result.currentAnnualExpenses).toBeCloseTo(55_000, 0);
    expect(result.annualExpenses).toBeCloseTo(55_000 * Math.pow(1.025, 37), -3);
    expect(result.targetCorpus).toBeCloseTo(result.annualExpenses * 25, -3);
  });

  it("uses the explicit annualExpensesOverride when supplied", () => {
    const result = calculateFreedom({
      country: "US",
      age: 30,
      monthlyIncome: 10_000,
      risk: "moderate",
      goal: "wealth_building",
      expectedReturn: 0.08,
      annualExpensesOverride: 84_000,
    });
    expect(result.expenseBasis).toBe("override");
    expect(result.currentAnnualExpenses).toBe(84_000);
    // 25× future expenses, inflated 37 yrs at 2.5%.
    expect(result.targetCorpus).toBeCloseTo(
      84_000 * Math.pow(1.025, 37) * 25,
      -3,
    );
  });

  it("emits nulls for ages that have already passed", () => {
    const result = calculateFreedom({
      country: "US",
      age: 55,
      monthlyIncome: 10_000,
      risk: "moderate",
      goal: "wealth_building",
      expectedReturn: 0.08,
    });
    expect(result.monthlyInvestmentRequired.byAge50).toBeNull();
    expect(result.monthlyInvestmentRequired.byAge55).toBeNull();
    expect(result.monthlyInvestmentRequired.byAge60).toBeGreaterThan(0);
  });

  it("projection runs to at least age 70 and is monotonically increasing with positive savings", () => {
    const result = calculateFreedom({
      country: "IN",
      age: 28,
      monthlyIncome: 80_000,
      risk: "moderate",
      goal: "wealth_building",
      expectedReturn: 0.1,
    });
    const last = result.projection[result.projection.length - 1];
    expect(last.age).toBeGreaterThanOrEqual(70);
    for (let i = 1; i < result.projection.length; i++) {
      expect(result.projection[i].wealth).toBeGreaterThan(result.projection[i - 1].wealth);
    }
  });

  it("higher savingsRate keeps target corpus the same but accelerates freedom", () => {
    // Under the benchmark-driven model the target corpus is decoupled from
    // savingsRate (it depends on country expense benchmark + inflation only).
    // A higher savingsRate increases monthlySavings → shortens years-to-FIRE.
    const lo = calculateFreedom({
      country: "US",
      age: 30,
      monthlyIncome: 10_000,
      risk: "moderate",
      goal: "wealth_building",
      expectedReturn: 0.08,
      savingsRate: 0.1,
    });
    const hi = calculateFreedom({
      country: "US",
      age: 30,
      monthlyIncome: 10_000,
      risk: "moderate",
      goal: "wealth_building",
      expectedReturn: 0.08,
      savingsRate: 0.5,
    });
    expect(hi.targetCorpus).toBeCloseTo(lo.targetCorpus, -3);
    expect(hi.yearsToFreedomAtCurrentRate!).toBeLessThan(lo.yearsToFreedomAtCurrentRate!);
    expect(hi.currentMonthlySavings).toBeGreaterThan(lo.currentMonthlySavings);
  });

  it("expat mode: target corpus uses retirement-country benchmark/inflation", () => {
    // UAE resident retiring in India. Family-of-4 household.
    // India family benchmark = ₹14L/yr. Inflation 5.5%, retirement age 60.
    // For a 35-year-old, future expenses = 14L * 1.055^25 ≈ ₹53.4L; target = 25× ≈ ₹13.4Cr.
    const expat = calculateFreedom({
      country: "AE",
      age: 35,
      monthlyIncome: 35_000, // AED
      risk: "moderate",
      goal: "wealth_building",
      expectedReturn: 0.08,
      householdSize: "family",
      retirementCountry: "IN",
    });
    // Target corpus is denominated in INR (India = retirement currency).
    expect(expat.currentAnnualExpenses).toBeCloseTo(1_400_000, -3);
    expect(expat.targetCorpus).toBeGreaterThan(50_000_000); // > ₹5 Cr
    expect(expat.targetCorpus).toBeLessThan(200_000_000); // < ₹20 Cr
    expect(expat.inflationRateUsed).toBeCloseTo(0.055, 3);
  });

  it("factors in currentCorpus when computing required monthly", () => {
    const none = calculateFreedom({
      country: "US",
      age: 30,
      monthlyIncome: 10_000,
      risk: "moderate",
      goal: "wealth_building",
      expectedReturn: 0.08,
      currentCorpus: 0,
    });
    const head = calculateFreedom({
      country: "US",
      age: 30,
      monthlyIncome: 10_000,
      risk: "moderate",
      goal: "wealth_building",
      expectedReturn: 0.08,
      currentCorpus: 500_000,
    });
    expect(head.monthlyInvestmentRequired.byAge60!).toBeLessThan(
      none.monthlyInvestmentRequired.byAge60!,
    );
  });
});
