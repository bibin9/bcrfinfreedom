/**
 * Build Sankey nodes + links for the user's cash-flow visualisation.
 *
 * Everything here is in RESIDENT currency — it shows today's paycheque.
 * Savings come from the user's own savings rate (same number as Fine-tune),
 * never from the retirement-country expense benchmark, which describes a
 * future lifestyle in possibly another currency.
 *
 * Layout (3 columns):
 *   Col 0: income
 *   Col 1: Sent home / Essentials / Discretionary / Buffer / Savings
 *   Col 2: savings destinations — FIRE SIP, each goal SIP (top 5), unallocated
 */

import type { SankeyLink, SankeyNode } from "@/lib/sankey";

export interface CashFlowGoal {
  id: string;
  name: string;
  /** Monthly SIP in RESIDENT currency. */
  monthlySIP: number;
}

export interface CashFlowInput {
  /** Monthly take-home, resident currency. */
  monthlyIncome: number;
  /** Fraction of income saved (0..1) — the Fine-tune slider value. */
  savingsRate: number;
  /** Money sent to family back home each month, resident currency. */
  monthlyRemittance?: number;
  /** Required FIRE SIP, already converted to resident currency. */
  fireSIP: number;
  goals: CashFlowGoal[];
}

export interface CashFlowDataset {
  nodes: SankeyNode[];
  links: SankeyLink[];
  totals: {
    income: number;
    /** Money sent home — capped so it never exceeds income minus savings. */
    remittance: number;
    /** Own living costs: income − savings − remittance. */
    spending: number;
    essentials: number;
    discretionary: number;
    buffer: number;
    savings: number;
    fireSIP: number;
    goalsSIP: number;
    unallocated: number;
    /** FIRE + goal SIPs the savings can't cover. */
    shortfall: number;
  };
}

const ESSENTIALS_FRACTION = 0.55;
const DISCRETIONARY_FRACTION = 0.3;

const CAT_COLORS = {
  income: "24 95% 53%",
  remittance: "330 81% 60%",
  essentials: "0 72% 51%",
  discretionary: "38 92% 50%",
  buffer: "271 65% 55%",
  savings: "160 84% 39%",
  fire: "24 95% 53%",
  goal: "217 91% 60%",
  unallocated: "220 9% 60%",
} as const;

export function buildCashFlow(input: CashFlowInput): CashFlowDataset {
  const income = Math.max(0, Math.round(input.monthlyIncome));
  const rate = Math.min(1, Math.max(0, input.savingsRate));

  const savings = Math.round(income * rate);
  const remittance = Math.min(
    Math.max(0, Math.round(input.monthlyRemittance ?? 0)),
    income - savings,
  );
  const spending = income - savings - remittance;
  const essentials = Math.round(spending * ESSENTIALS_FRACTION);
  const discretionary = Math.round(spending * DISCRETIONARY_FRACTION);
  const buffer = spending - essentials - discretionary;

  const fireSlice = Math.min(Math.max(0, Math.round(input.fireSIP)), savings);
  let remaining = savings - fireSlice;

  const goalSlices: Array<{ goal: CashFlowGoal; value: number }> = [];
  const topGoals = input.goals
    .filter((g) => g.monthlySIP > 0)
    .sort((a, b) => b.monthlySIP - a.monthlySIP)
    .slice(0, 5);
  for (const g of topGoals) {
    const v = Math.min(Math.round(g.monthlySIP), remaining);
    if (v <= 0) break;
    goalSlices.push({ goal: g, value: v });
    remaining -= v;
  }
  const goalsSlice = goalSlices.reduce((s, x) => s + x.value, 0);
  const unallocated = remaining;

  const wantedSIPs =
    Math.max(0, input.fireSIP) + input.goals.reduce((s, g) => s + Math.max(0, g.monthlySIP), 0);
  const shortfall = Math.max(0, Math.round(wantedSIPs - savings));

  const nodes: SankeyNode[] = [
    { id: "income", label: "Income", column: 0, color: CAT_COLORS.income, sub: "/month" },
  ];
  const links: SankeyLink[] = [];

  const addBucket = (id: string, label: string, sub: string, color: string, value: number) => {
    if (value <= 0) return;
    nodes.push({ id, label, column: 1, color, sub });
    links.push({ source: "income", target: id, value });
  };
  addBucket("remittance", "Sent home", "family back home", CAT_COLORS.remittance, remittance);
  addBucket("essentials", "Essentials", "rent · food · transport", CAT_COLORS.essentials, essentials);
  addBucket("discretionary", "Discretionary", "dining · leisure", CAT_COLORS.discretionary, discretionary);
  addBucket("buffer", "Buffer", "health · kids · misc", CAT_COLORS.buffer, buffer);
  addBucket(
    "savings",
    "Savings",
    `${Math.round(rate * 100)}% of income`,
    CAT_COLORS.savings,
    savings,
  );

  const addDestination = (id: string, label: string, sub: string, color: string, value: number) => {
    if (value <= 0) return;
    nodes.push({ id, label, column: 2, color, sub });
    links.push({ source: "savings", target: id, value });
  };
  addDestination("fire", "FIRE SIP", "retirement corpus", CAT_COLORS.fire, fireSlice);
  for (const { goal, value } of goalSlices) {
    const label = goal.name.length > 22 ? goal.name.slice(0, 20) + "…" : goal.name;
    addDestination(`goal_${goal.id}`, label, "goal fund", CAT_COLORS.goal, value);
  }
  addDestination("unalloc", "Unallocated", "extra buffer", CAT_COLORS.unallocated, unallocated);

  return {
    nodes,
    links,
    totals: {
      income,
      remittance,
      spending,
      essentials,
      discretionary,
      buffer,
      savings,
      fireSIP: fireSlice,
      goalsSIP: goalsSlice,
      unallocated,
      shortfall,
    },
  };
}
