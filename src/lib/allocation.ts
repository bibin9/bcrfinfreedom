/**
 * Allocation engine — recommends a portfolio mix from age, risk appetite,
 * country, goal and (for expats) the country the user will retire in.
 *
 *   1. Shares (equity) start from "100 − age", clamped to 25–90%.
 *   2. Risk appetite scales that up or down; unstable economies and short-horizon
 *      goals pull it down.
 *   3. Shares split between home country and the world. Home bias follows where
 *      the user will spend: deep markets with their own currency (India) stay
 *      mostly local; small markets pegged to the US dollar (UAE, Saudi) go global.
 *   4. Expats retiring elsewhere hold a destination-country slice that grows from
 *      30% to 70% of their shares as retirement approaches (glide path), so the
 *      money ends up in the currency they'll spend.
 *   5. Safe money: emergency cash first, then at least 60% of what's left goes to
 *      bonds; gold and property share the rest.
 *   6. Crypto only for aggressive investors under 60 in stable countries, capped
 *      at 5%, funded from international shares.
 *
 * Explanations are written for someone with no finance background.
 */

import type {
  AllocationBreakdown,
  AllocationResult,
  CountryCode,
  CountryProfile,
  FinancialGoal,
  RiskProfile,
} from "@/types";
import { clamp, round } from "@/lib/utils";
import { msg, type I18nMsg } from "@/i18n/msg";

const RISK_MULTIPLIER: Record<RiskProfile, number> = {
  conservative: 0.75,
  moderate: 1.0,
  aggressive: 1.2,
};

const GOAL_EQUITY_TILT: Record<FinancialGoal, number> = {
  early_retirement: +0.05,
  wealth_building: +0.03,
  passive_income: -0.05,
  child_education: -0.07,
  home_purchase: -0.12,
};

/** Share of equity kept in the home market, where a simple formula gets it wrong. */
const HOME_BIAS: Partial<Record<CountryCode, { share: number; reason: string; key: string }>> = {
  IN: {
    share: 0.8,
    key: "dash.alloc.explain.biasIN",
    reason:
      "Most of your shares stay in Indian companies — your future bills are in rupees and India's market is large enough to spread risk.",
  },
  AE: {
    share: 0.35,
    key: "dash.alloc.explain.biasAE",
    reason:
      "Most of your shares are global — the UAE market is small, and the dirham is tied to the US dollar, so global funds carry little currency risk.",
  },
  SA: {
    share: 0.45,
    key: "dash.alloc.explain.biasSA",
    reason:
      "More than half your shares are global — the Saudi market is concentrated in a few sectors, and the riyal is tied to the US dollar.",
  },
  US: {
    share: 0.7,
    key: "dash.alloc.explain.biasUS",
    reason: "Most of your shares stay in the US — it's the world's largest market and your bills are in dollars.",
  },
};

const MIN_BOND_SHARE_OF_SAFE_MONEY = 0.6;

export interface AllocationInput {
  age: number;
  risk: RiskProfile;
  country: CountryProfile;
  goal: FinancialGoal;
  /** Country the user will retire in, if different from `country`. */
  retirementCountry?: CountryProfile;
  /** Target freedom age — drives the expat glide path. */
  freedomAge?: number;
}

/** Fraction of equity held in the retirement country: 30% far out → 70% within 5 years. */
export function destinationEquityShare(yearsToRetirement: number): number {
  if (yearsToRetirement >= 15) return 0.3;
  if (yearsToRetirement <= 5) return 0.7;
  return 0.3 + ((15 - yearsToRetirement) / 10) * 0.4;
}

export function calculateAllocation(input: AllocationInput): AllocationResult {
  const { age, risk, country, goal } = input;
  const destination =
    input.retirementCountry && input.retirementCountry.code !== country.code
      ? input.retirementCountry
      : null;
  const explanation: string[] = [];
  const explanationMsgs: I18nMsg[] = [];
  /** Record one explanation line in English and as a translatable message. */
  const say = (text: string, key: string, vars?: Record<string, string | number>) => {
    explanation.push(text);
    explanationMsgs.push(msg(`dash.alloc.explain.${key}`, vars));
  };
  const goalKey = `onboarding.goals.${goal}.label`;

  // 1–2. How much in shares.
  const baseEquity = clamp(100 - age, 25, 90) / 100;
  say(
    `Starting point: at ${age}, keep about ${Math.round(baseEquity * 100)}% in shares — the "100 minus your age" rule of thumb. Younger people have more time to ride out market falls.`,
    "start",
    { age, pct: Math.round(baseEquity * 100) },
  );

  let equity = baseEquity * RISK_MULTIPLIER[risk];
  if (risk !== "moderate") {
    say(
      risk === "aggressive"
        ? `You chose aggressive, so shares go up to ${Math.round(equity * 100)}% — more growth, bigger swings.`
        : `You chose conservative, so shares come down to ${Math.round(equity * 100)}% — steadier, slower growth.`,
      risk,
      { pct: Math.round(equity * 100) },
    );
  }

  const stabilityDrag = country.stabilityScore < 0.7 ? (0.7 - country.stabilityScore) * 0.5 : 0;
  if (stabilityDrag > 0) {
    equity -= stabilityDrag;
    say(
      `${country.name}'s economy swings more than most, so ${Math.round(stabilityDrag * 100)}% moves from shares into safer assets.`,
      "stability",
      { countryKey: `countries.${country.code}`, pct: Math.round(stabilityDrag * 100) },
    );
  }

  const goalTilt = GOAL_EQUITY_TILT[goal];
  equity = clamp(equity + goalTilt, 0.2, 0.9);
  if (goalTilt < 0) {
    say(
      `Your goal (${goal.replace(/_/g, " ")}) needs money on a fixed date, so ${Math.round(-goalTilt * 100)}% less goes into shares.`,
      "goalShort",
      { goalKey, pct: Math.round(-goalTilt * 100) },
    );
  } else {
    say(
      `Your goal (${goal.replace(/_/g, " ")}) is long-term, so shares get a small ${Math.round(goalTilt * 100)}% boost.`,
      "goalLong",
      { goalKey, pct: Math.round(goalTilt * 100) },
    );
  }

  // 3–4. Where the shares go.
  const bias = HOME_BIAS[country.code];
  let homeShare = bias?.share ?? clamp(0.3 + country.stabilityScore * 0.4, 0.3, 0.6);

  let equityDest = 0;
  if (destination) {
    const years = Math.max(0, (input.freedomAge ?? destination.retirementAge) - age);
    const destShare = destinationEquityShare(years);
    equityDest = equity * destShare;
    // You're leaving — your current country's market matters less.
    homeShare *= 0.5;
    say(
      `You'll retire in ${destination.name}, so ${Math.round(destShare * 100)}% of your shares go into ${destination.name}'s market. This rises to 70% in your last 5 years of work, so your money is already in the currency you'll spend.`,
      "expat",
      { countryKey: `countries.${destination.code}`, pct: Math.round(destShare * 100) },
    );
  } else if (bias) {
    explanation.push(bias.reason);
    explanationMsgs.push(msg(bias.key));
  }

  const nonDestEquity = equity - equityDest;
  const equityLocal = nonDestEquity * homeShare;
  let equityIntl = nonDestEquity - equityLocal;

  // 5. Safe money.
  const remaining = 1 - equity;
  const cash =
    country.emergencyFundMonths >= 12 ? 0.15 : country.emergencyFundMonths >= 9 ? 0.1 : 0.05;
  const rest = Math.max(0, remaining - cash);

  let gold = clamp(0.05 + (1 - country.stabilityScore) * 0.15 + stabilityDrag, 0.03, 0.2);
  let realEstate = risk === "conservative" ? 0.04 : 0.06;
  const spaceForGoldAndProperty = rest * (1 - MIN_BOND_SHARE_OF_SAFE_MONEY);
  if (gold + realEstate > spaceForGoldAndProperty) {
    const k = spaceForGoldAndProperty / (gold + realEstate);
    gold *= k;
    realEstate *= k;
  }
  const bonds = rest - gold - realEstate;
  say(
    `Safe money: ${country.emergencyFundMonths} months of expenses as emergency cash, then most of the rest in bonds — they hold steady when share prices fall.`,
    "safe",
    { months: country.emergencyFundMonths },
  );

  // 6. Crypto.
  let crypto = 0;
  if (risk === "aggressive" && age < 60 && country.stabilityScore >= 0.5) {
    crypto = Math.min(0.05, equityIntl);
    equityIntl -= crypto;
    say(
      `Because you chose aggressive, a small ${Math.round(crypto * 100)}% crypto slice is taken from international shares. It's capped so a crash can't sink your plan.`,
      "crypto",
      { pct: Math.round(crypto * 100) },
    );
  }

  return assemble({
    country,
    destination,
    equityLocal,
    equityIntl,
    equityDest,
    bonds,
    realEstate,
    gold,
    cash,
    crypto,
    equity,
    explanation,
    explanationMsgs,
  });
}

interface AssembleArgs {
  country: CountryProfile;
  destination: CountryProfile | null;
  equityLocal: number;
  equityIntl: number;
  equityDest: number;
  bonds: number;
  realEstate: number;
  gold: number;
  cash: number;
  crypto: number;
  equity: number;
  explanation: string[];
  explanationMsgs: I18nMsg[];
}

function bondKey(country: CountryProfile): string {
  if (country.code === "IN") return "bondsIN";
  return country.shariaMarket ? "bondsSharia" : "bondsOther";
}

function bondExamples(country: CountryProfile): string {
  if (country.code === "IN") return "PPF, debt mutual funds, government bonds";
  if (country.shariaMarket) return "sukuk and government bonds";
  return "government bonds and bond funds";
}

function assemble(a: AssembleArgs): AllocationResult {
  const total =
    a.equityLocal + a.equityIntl + a.equityDest + a.bonds + a.realEstate + a.gold + a.cash + a.crypto;
  const scale = total > 0 ? 1 / total : 1;
  const pct = (v: number) => round(v * scale * 100, 1);
  const index = a.country.indices[0];
  const L = (k: string, vars?: Record<string, string | number>) => msg(`dash.alloc.label.${k}`, vars);
  const W = (k: string, vars?: Record<string, string | number>) => msg(`dash.alloc.why.${k}`, vars);

  const breakdown: AllocationBreakdown[] = [
    {
      asset: "equities_local",
      label: `${a.country.name} shares (${index?.ticker ?? "local index"})`,
      percent: pct(a.equityLocal),
      rationale: `Your country's biggest companies, through ${index?.name ?? "the local index"}. The main engine that grows your money over decades.`,
      labelMsg: L("local", {
        countryKey: `countries.${a.country.code}`,
        ticker: index?.ticker ?? "",
      }),
      rationaleMsg: W("local", { index: index?.name ?? "" }),
    },
  ];

  if (a.destination) {
    const dIndex = a.destination.indices[0];
    breakdown.push({
      asset: "equities_destination",
      label: `${a.destination.name} shares (${dIndex?.ticker ?? "index"})`,
      percent: pct(a.equityDest),
      rationale: `Shares in the country you'll retire in, so your savings grow in the currency you'll spend. This slice grows as retirement gets closer.`,
      labelMsg: L("destination", {
        countryKey: `countries.${a.destination.code}`,
        ticker: dIndex?.ticker ?? "",
      }),
      rationaleMsg: W("destination"),
    });
  }

  breakdown.push(
    {
      asset: "equities_international",
      label: "Global shares",
      percent: pct(a.equityIntl),
      rationale:
        "Companies around the world through low-cost global index funds, so you're not betting everything on one economy.",
      labelMsg: L("global"),
      rationaleMsg: W("global"),
    },
    {
      asset: "bonds_fixed_income",
      label: a.country.shariaMarket ? "Bonds / Sukuk" : "Bonds & fixed income",
      percent: pct(a.bonds),
      rationale: `Steady, lower-risk investments (${bondExamples(a.country)}). They cushion you when share prices fall.`,
      labelMsg: L(a.country.shariaMarket ? "bondsSharia" : "bonds"),
      rationaleMsg: W(bondKey(a.country)),
    },
    {
      asset: "real_estate",
      label: "Property (REITs)",
      percent: pct(a.realEstate),
      rationale: "Earns rent-like income from offices and malls, without buying a flat yourself.",
      labelMsg: L("property"),
      rationaleMsg: W("property"),
    },
    {
      asset: "gold_commodities",
      label: "Gold",
      percent: pct(a.gold),
      rationale: "Protects you when your currency weakens or markets panic. Gold ETFs or bonds, not jewellery.",
      labelMsg: L("gold"),
      rationaleMsg: W("gold"),
    },
    {
      asset: "cash_emergency",
      label: "Emergency cash",
      percent: pct(a.cash),
      rationale: `About ${a.country.emergencyFundMonths} months of expenses you can reach instantly if you lose your job or fall ill.`,
      labelMsg: L("cash"),
      rationaleMsg: W("cash", { months: a.country.emergencyFundMonths }),
    },
  );

  if (a.crypto > 0) {
    breakdown.push({
      asset: "crypto",
      label: "Crypto (capped)",
      percent: pct(a.crypto),
      rationale: "A small, high-risk bet. Capped at 5% so a crash can't hurt your plan.",
      labelMsg: L("crypto"),
      rationaleMsg: W("crypto"),
    });
  }

  const destEquityReturn = a.destination?.expectedEquityReturn ?? a.country.expectedEquityReturn;
  const expectedReturn =
    (a.equityLocal + a.equityIntl) * scale * a.country.expectedEquityReturn +
    a.equityDest * scale * destEquityReturn +
    a.bonds * scale * a.country.expectedBondReturn +
    a.realEstate * scale * (a.country.expectedEquityReturn * 0.7) +
    a.gold * scale * 0.05 +
    a.cash * scale * 0.03 +
    a.crypto * scale * 0.15;

  return {
    breakdown,
    expectedReturn,
    equityWeight: round(a.equity * 100, 1),
    explanation: a.explanation,
    explanationMsgs: a.explanationMsgs,
  };
}
