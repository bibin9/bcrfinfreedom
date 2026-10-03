import { describe, it, expect } from "vitest";
import { projectWindfalls, totalWindfallsAtRetirement } from "@/lib/windfalls";
import type { Windfall } from "@/types";

function w(overrides: Partial<Windfall> = {}): Windfall {
  return {
    id: "w1",
    name: "Test",
    category: "eosb",
    amount: 100_000,
    targetYear: 2030,
    createdAt: Date.now(),
    ...overrides,
  };
}

describe("projectWindfalls", () => {
  it("compounds a windfall from receipt year to retirement year", () => {
    // ₹100K received 2030, retirement 2040, 8% return → 100K * 1.08^10 ≈ ₹215.9K
    const p = projectWindfalls([w({ targetYear: 2030, amount: 100_000 })], 2026, 2040, 0.08);
    expect(p[0].valueAtRetirement).toBeCloseTo(100_000 * Math.pow(1.08, 10), -2);
  });

  it("if windfall is at retirement year, FV equals amount (no compounding)", () => {
    const p = projectWindfalls([w({ targetYear: 2040, amount: 100_000 })], 2026, 2040, 0.08);
    expect(p[0].valueAtRetirement).toBe(100_000);
  });

  it("yearsUntilReceipt is 0 when target is in the past", () => {
    const p = projectWindfalls([w({ targetYear: 2020 })], 2026, 2040, 0.08);
    expect(p[0].yearsUntilReceipt).toBe(0);
  });
});

describe("totalWindfallsAtRetirement", () => {
  it("sums every projection's valueAtRetirement", () => {
    const p = projectWindfalls(
      [
        w({ id: "a", amount: 100_000, targetYear: 2030 }),
        w({ id: "b", amount: 50_000, targetYear: 2035 }),
      ],
      2026,
      2040,
      0.08,
    );
    expect(totalWindfallsAtRetirement(p)).toBeCloseTo(
      p[0].valueAtRetirement + p[1].valueAtRetirement,
      0,
    );
  });

  it("empty input → 0", () => {
    expect(totalWindfallsAtRetirement([])).toBe(0);
  });
});
