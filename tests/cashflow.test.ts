import { describe, it, expect } from "vitest";
import { buildCashFlow } from "@/lib/cashflow";
import { layoutSankey } from "@/lib/sankey";

describe("buildCashFlow", () => {
  it("savings follow the user's savings rate, not an expense benchmark", () => {
    const d = buildCashFlow({ monthlyIncome: 150_000, savingsRate: 0.3, fireSIP: 0, goals: [] });
    expect(d.totals.savings).toBe(45_000);
    expect(d.totals.spending).toBe(105_000);
  });

  it("spending buckets sum exactly to spending", () => {
    const d = buildCashFlow({ monthlyIncome: 100_001, savingsRate: 0.27, fireSIP: 0, goals: [] });
    expect(d.totals.essentials + d.totals.discretionary + d.totals.buffer).toBe(d.totals.spending);
  });

  it("income node never exceeds the entered income (regression: AED 35K shown as AED 50K)", () => {
    const d = buildCashFlow({ monthlyIncome: 35_000, savingsRate: 0.3, fireSIP: 20_000, goals: [] });
    const layout = layoutSankey(d.nodes, d.links, { width: 700, height: 300 });
    const incomeNode = layout.nodes.find((n) => n.id === "income")!;
    expect(incomeNode.value).toBe(35_000);
  });

  it("FIRE SIP is capped by savings and the gap is reported as shortfall", () => {
    const d = buildCashFlow({ monthlyIncome: 50_000, savingsRate: 0.2, fireSIP: 25_000, goals: [] });
    expect(d.totals.savings).toBe(10_000);
    expect(d.totals.fireSIP).toBe(10_000);
    expect(d.totals.shortfall).toBe(15_000);
    expect(d.totals.unallocated).toBe(0);
  });

  it("goals take what's left after FIRE, remainder is unallocated", () => {
    const d = buildCashFlow({
      monthlyIncome: 100_000,
      savingsRate: 0.5,
      fireSIP: 30_000,
      goals: [{ id: "g1", name: "Child UG", monthlySIP: 15_000 }],
    });
    expect(d.totals.fireSIP).toBe(30_000);
    expect(d.totals.goalsSIP).toBe(15_000);
    expect(d.totals.unallocated).toBe(5_000);
    expect(d.totals.shortfall).toBe(0);
  });

  it("zero savings rate → no savings node or destinations", () => {
    const d = buildCashFlow({ monthlyIncome: 50_000, savingsRate: 0, fireSIP: 10_000, goals: [] });
    expect(d.nodes.find((n) => n.id === "savings")).toBeUndefined();
    expect(d.nodes.find((n) => n.id === "fire")).toBeUndefined();
    expect(d.totals.shortfall).toBe(10_000);
  });

  it("dataset is layout-ready", () => {
    const d = buildCashFlow({
      monthlyIncome: 100_000,
      savingsRate: 0.4,
      fireSIP: 25_000,
      goals: [{ id: "g1", name: "Goal", monthlySIP: 8_000 }],
    });
    const layout = layoutSankey(d.nodes, d.links, { width: 700, height: 300 });
    expect(layout.nodes.length).toBe(d.nodes.length);
    for (const l of layout.links) {
      expect(l.path).toContain("C ");
      expect(l.thickness).toBeGreaterThan(0);
    }
  });
});

describe("layoutSankey", () => {
  it("columns are laid out left to right", () => {
    const d = buildCashFlow({
      monthlyIncome: 100_000,
      savingsRate: 0.4,
      fireSIP: 25_000,
      goals: [{ id: "g1", name: "Goal", monthlySIP: 10_000 }],
    });
    const layout = layoutSankey(d.nodes, d.links, { width: 800, height: 300 });
    const x = (col: number) => layout.nodes.find((n) => n.column === col)!.x;
    expect(x(1)).toBeGreaterThan(x(0));
    expect(x(2)).toBeGreaterThan(x(1));
  });

  it("handles empty links gracefully", () => {
    const layout = layoutSankey(
      [{ id: "a", label: "A", column: 0, color: "0 0% 50%" }],
      [],
      { width: 400, height: 200 },
    );
    expect(layout.nodes.length).toBe(1);
    expect(layout.links.length).toBe(0);
  });
});
