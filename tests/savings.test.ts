import { describe, it, expect } from "vitest";
import {
  leftAfterRemittance,
  savingsRateFromAmount,
  suggestedMonthlySavings,
} from "@/lib/savings";
import { buildCashFlow } from "@/lib/cashflow";

describe("suggestedMonthlySavings", () => {
  it("is 20% of what's left after money sent home", () => {
    // Gulf worker: AED 6,500 salary, AED 3,000 sent home → 20% of 3,500.
    expect(suggestedMonthlySavings(6500, 3000)).toBe(700);
  });

  it("is 20% of salary when nothing is sent home, rounded to a friendly figure", () => {
    expect(suggestedMonthlySavings(150_000)).toBe(30_000);
    expect(suggestedMonthlySavings(18_345)).toBe(3_700);
  });

  it("never goes negative when remittance exceeds salary", () => {
    expect(leftAfterRemittance(5000, 6000)).toBe(0);
    expect(suggestedMonthlySavings(5000, 6000)).toBe(0);
  });
});

describe("savingsRateFromAmount", () => {
  it("converts an amount into a fraction of salary", () => {
    expect(savingsRateFromAmount(6500, 700)).toBeCloseTo(0.1077, 3);
  });
  it("clamps to 0..1 and handles zero salary", () => {
    expect(savingsRateFromAmount(1000, 2000)).toBe(1);
    expect(savingsRateFromAmount(0, 500)).toBe(0);
  });
});

describe("buildCashFlow with money sent home", () => {
  it("shows remittance as its own flow, separate from living costs and savings", () => {
    const d = buildCashFlow({
      monthlyIncome: 6500,
      monthlyRemittance: 3000,
      savingsRate: 700 / 6500,
      fireSIP: 0,
      goals: [],
    });
    expect(d.totals.remittance).toBe(3000);
    expect(d.totals.savings).toBe(700);
    expect(d.totals.spending).toBe(2800);
    expect(d.totals.remittance + d.totals.savings + d.totals.spending).toBe(6500);
    expect(d.nodes.some((n) => n.id === "remittance")).toBe(true);
  });

  it("caps remittance so flows never exceed income", () => {
    const d = buildCashFlow({
      monthlyIncome: 5000,
      monthlyRemittance: 9000,
      savingsRate: 0.2,
      fireSIP: 0,
      goals: [],
    });
    expect(d.totals.remittance).toBe(4000);
    expect(d.totals.spending).toBe(0);
  });
});
