import { describe, it, expect } from "vitest";
import { newRegimeTax, oldRegimeTax, planIndiaTax } from "@/lib/indiaTax";

describe("newRegimeTax (FY 2025-26)", () => {
  it("₹12.75L gross is tax-free (₹75k std deduction + 87A rebate)", () => {
    expect(newRegimeTax(12_75_000)).toBe(0);
  });

  it("₹20L gross → slab tax + 4% cess", () => {
    // taxable 19.25L: 20k + 40k + 60k + 65k = 1,85,000 × 1.04
    expect(newRegimeTax(20_00_000)).toBeCloseTo(1_92_400, 0);
  });
});

describe("oldRegimeTax", () => {
  it("taxable ≤ ₹5L is rebated to zero", () => {
    expect(oldRegimeTax(5_50_000, 0)).toBe(0);
  });

  it("₹20L gross with ₹2L deductions", () => {
    // taxable 17.5L: 12.5k + 1L + 2.25L = 3,37,500 × 1.04
    expect(oldRegimeTax(20_00_000, 2_00_000)).toBeCloseTo(3_51_000, 0);
  });
});

describe("planIndiaTax", () => {
  const base = { grossAnnual: 20_00_000, basicMonthly: 50_000, monthlySIP: 45_000 };

  it("old regime: EPF eats into 80C, rest split ELSS/PPF, plus NPS", () => {
    const p = planIndiaTax({ ...base, regime: "old", risk: "moderate" });
    expect(p.epfMonthly).toBe(6_000);
    const m = (k: string) => p.buckets.find((b) => b.key === k)?.monthly ?? 0;
    expect(m("elss")).toBe(3_250); // (1.5L − 72k) / 2 / 12
    expect(m("ppf")).toBe(3_250);
    expect(m("nps")).toBe(4_167);
    expect(p.taxSaved).toBeGreaterThan(0);
  });

  it("buckets always add up to the SIP", () => {
    for (const regime of ["old", "new"] as const) {
      for (const risk of ["conservative", "moderate", "aggressive"] as const) {
        const p = planIndiaTax({ ...base, regime, risk });
        const total = p.buckets.reduce((s, b) => s + b.monthly, 0);
        expect(total).toBe(45_000);
      }
    }
  });

  it("new regime: no ELSS or NPS, no deductions", () => {
    const p = planIndiaTax({ ...base, regime: "new", risk: "moderate" });
    expect(p.buckets.find((b) => b.key === "elss")).toBeUndefined();
    expect(p.buckets.find((b) => b.key === "nps")).toBeUndefined();
    expect(p.deductions).toBe(0);
    expect(p.taxSaved).toBe(0);
  });

  it("small SIP is never over-allocated", () => {
    const p = planIndiaTax({ ...base, monthlySIP: 5_000, regime: "old", risk: "aggressive" });
    const total = p.buckets.reduce((s, b) => s + b.monthly, 0);
    expect(total).toBe(5_000);
  });

  it("recommends the cheaper regime", () => {
    const p = planIndiaTax({ ...base, regime: "new", risk: "moderate" });
    const cheaper = p.compare.oldTax < p.compare.newTax ? "old" : "new";
    expect(p.compare.better).toBe(cheaper);
  });
});
