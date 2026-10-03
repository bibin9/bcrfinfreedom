import { describe, it, expect } from "vitest";
import { projectGoal, totalGoalsMonthlySIP } from "@/lib/goals";
import type { Goal } from "@/types";

function makeGoal(overrides: Partial<Goal> = {}): Goal {
  return {
    id: "test",
    name: "Test",
    category: "education",
    targetAmountToday: 4_000_000,
    targetYear: new Date().getFullYear() + 10,
    createdAt: Date.now(),
    ...overrides,
  };
}

describe("projectGoal", () => {
  it("inflates target amount to the target year", () => {
    const now = 2026;
    // 40L today at 6% inflation over 10 years → ~71.6L
    const p = projectGoal(makeGoal({ targetYear: 2036 }), now, 0.06, 0.1);
    expect(p.futureAmount).toBeCloseTo(4_000_000 * Math.pow(1.06, 10), -3);
    expect(p.yearsToTarget).toBe(10);
  });

  it("returns a positive monthly SIP for a reachable goal", () => {
    const p = projectGoal(makeGoal({ targetYear: 2036 }), 2026, 0.06, 0.1);
    expect(p.monthlySIP).not.toBeNull();
    expect(p.monthlySIP!).toBeGreaterThan(0);
  });

  it("years is 0 when target is in the past", () => {
    const p = projectGoal(makeGoal({ targetYear: 2020 }), 2026, 0.06, 0.1);
    expect(p.yearsToTarget).toBe(0);
    expect(p.monthlySIP).toBeNull(); // unreachable — no time
  });

  it("shorter horizon → bigger monthly SIP for same target", () => {
    const short = projectGoal(makeGoal({ targetYear: 2030 }), 2026, 0.06, 0.1);
    const long = projectGoal(makeGoal({ targetYear: 2046 }), 2026, 0.06, 0.1);
    expect(short.monthlySIP!).toBeGreaterThan(long.monthlySIP!);
  });
});

describe("totalGoalsMonthlySIP", () => {
  it("sums non-null monthly SIPs across projections", () => {
    const a = projectGoal(makeGoal({ id: "a", targetYear: 2035 }), 2026, 0.06, 0.1);
    const b = projectGoal(makeGoal({ id: "b", targetYear: 2040 }), 2026, 0.06, 0.1);
    expect(totalGoalsMonthlySIP([a, b])).toBeCloseTo(
      (a.monthlySIP ?? 0) + (b.monthlySIP ?? 0),
      0,
    );
  });

  it("treats unreachable goals as zero", () => {
    const past = projectGoal(makeGoal({ targetYear: 2020 }), 2026, 0.06, 0.1);
    expect(totalGoalsMonthlySIP([past])).toBe(0);
  });
});
