import { describe, it, expect } from "vitest";
import { simulateDrawdown, volatilityFromRisk } from "@/lib/drawdown";

describe("simulateDrawdown — deterministic", () => {
  it("safe 4% withdrawal leaves money at end for a moderate portfolio", () => {
    const r = simulateDrawdown({
      startingCorpus: 10_000_000,
      firstYearExpenses: 400_000, // 4%
      retirementAge: 60,
      endAge: 95,
      expectedReturn: 0.09,
      returnVolatility: 0.12,
      inflationRate: 0.05,
      nPaths: 200, // smaller for test speed
    });
    expect(r.deterministic.depletedAtAge).toBeNull();
    expect(r.deterministic.finalCorpus).toBeGreaterThan(0);
  });

  it("8% withdrawal depletes before 95 at modest returns", () => {
    const r = simulateDrawdown({
      startingCorpus: 10_000_000,
      firstYearExpenses: 800_000, // 8%
      retirementAge: 60,
      endAge: 95,
      expectedReturn: 0.07,
      returnVolatility: 0.12,
      inflationRate: 0.05,
      nPaths: 200,
    });
    expect(r.deterministic.depletedAtAge).not.toBeNull();
    expect(r.deterministic.depletedAtAge!).toBeLessThan(95);
  });
});

describe("simulateDrawdown — Monte Carlo", () => {
  it("4% / 60-95 at moderate risk has survival > 50% (realistic for 35-yr window)", () => {
    const r = simulateDrawdown({
      startingCorpus: 10_000_000,
      firstYearExpenses: 400_000,
      retirementAge: 60,
      endAge: 95,
      expectedReturn: 0.09,
      returnVolatility: 0.12,
      inflationRate: 0.05,
      nPaths: 500,
    });
    // Trinity-style 4% rule is tested on 30 yrs; 35 yrs + 12% vol lowers survival.
    // Historical analogue: ~55-70%. Deterministic should always survive at these params.
    expect(r.monteCarlo.successRate).toBeGreaterThan(0.5);
    expect(r.deterministic.depletedAtAge).toBeNull();
  });

  it("6% at low returns has low survival rate", () => {
    const r = simulateDrawdown({
      startingCorpus: 10_000_000,
      firstYearExpenses: 600_000,
      retirementAge: 60,
      endAge: 95,
      expectedReturn: 0.05,
      returnVolatility: 0.15,
      inflationRate: 0.05,
      nPaths: 500,
    });
    expect(r.monteCarlo.successRate).toBeLessThan(0.5);
  });

  it("same inputs produce identical results (seeded PRNG)", () => {
    const args = {
      startingCorpus: 10_000_000,
      firstYearExpenses: 400_000,
      retirementAge: 60,
      endAge: 95,
      expectedReturn: 0.09,
      returnVolatility: 0.12,
      inflationRate: 0.05,
      nPaths: 100,
    };
    const a = simulateDrawdown(args);
    const b = simulateDrawdown(args);
    expect(a.monteCarlo.successRate).toBe(b.monteCarlo.successRate);
    expect(a.monteCarlo.bands[10].p50).toBe(b.monteCarlo.bands[10].p50);
  });

  it("produces monotonically-ordered percentile bands (p10 ≤ p50 ≤ p90)", () => {
    const r = simulateDrawdown({
      startingCorpus: 10_000_000,
      firstYearExpenses: 400_000,
      retirementAge: 60,
      endAge: 95,
      expectedReturn: 0.09,
      returnVolatility: 0.12,
      inflationRate: 0.05,
      nPaths: 300,
    });
    for (const band of r.monteCarlo.bands) {
      expect(band.p10).toBeLessThanOrEqual(band.p50);
      expect(band.p50).toBeLessThanOrEqual(band.p90);
    }
  });
});

describe("simulateDrawdown — guardrails", () => {
  it("3% WR → bonus zone", () => {
    const r = simulateDrawdown({
      startingCorpus: 10_000_000,
      firstYearExpenses: 300_000, // 3%
      retirementAge: 60,
      expectedReturn: 0.08,
      returnVolatility: 0.1,
      inflationRate: 0.04,
      nPaths: 50,
    });
    expect(r.guardrails.zone).toBe("bonus");
  });

  it("4% WR → green zone", () => {
    const r = simulateDrawdown({
      startingCorpus: 10_000_000,
      firstYearExpenses: 400_000,
      retirementAge: 60,
      expectedReturn: 0.08,
      returnVolatility: 0.1,
      inflationRate: 0.04,
      nPaths: 50,
    });
    expect(r.guardrails.zone).toBe("green");
  });

  it("6% WR → red zone", () => {
    const r = simulateDrawdown({
      startingCorpus: 10_000_000,
      firstYearExpenses: 600_000,
      retirementAge: 60,
      expectedReturn: 0.08,
      returnVolatility: 0.1,
      inflationRate: 0.04,
      nPaths: 50,
    });
    expect(r.guardrails.zone).toBe("red");
  });
});

describe("volatilityFromRisk", () => {
  it("is monotonically increasing with risk", () => {
    expect(volatilityFromRisk("conservative")).toBeLessThan(volatilityFromRisk("moderate"));
    expect(volatilityFromRisk("moderate")).toBeLessThan(volatilityFromRisk("aggressive"));
  });
});
