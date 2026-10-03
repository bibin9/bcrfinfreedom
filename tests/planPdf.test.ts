import { describe, it, expect } from "vitest";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { getCountryProfile } from "@/data/countryProfiles";
import { calculateAllocation } from "@/lib/allocation";
import { calculateFreedom } from "@/lib/freedom";
import { projectGoal } from "@/lib/goals";
import { projectWindfalls, totalWindfallsAtRetirement } from "@/lib/windfalls";
import { buildPlanPDF, pdfMoney, pdfSafe, type PlanPDFInput } from "@/lib/planPdf";
import type { CountryCode, Goal, RiskProfile, Windfall } from "@/types";

const YEAR = 2026;

function persona(p: {
  country: CountryCode;
  retire?: CountryCode;
  city?: string;
  age: number;
  income: number;
  risk: RiskProfile;
  corpus?: number;
  goals?: Goal[];
  windfalls?: Windfall[];
}): PlanPDFInput {
  const res = getCountryProfile(p.country);
  const dest = getCountryProfile(p.retire ?? p.country);
  const user = { country: p.country, age: p.age, monthlyIncome: p.income, risk: p.risk, goal: "early_retirement" as const };
  const allocation = calculateAllocation({ ...user, country: res, retirementCountry: dest });
  const retirementYear = YEAR + (dest.retirementAge - p.age);
  const windfalls = projectWindfalls(p.windfalls ?? [], YEAR, retirementYear, allocation.expectedReturn);
  const freedom = calculateFreedom({
    ...user,
    expectedReturn: allocation.expectedReturn,
    savingsRate: 0.3,
    currentCorpus: p.corpus ?? 0,
    retirementCountry: p.retire,
    retirementCity: p.city,
    windfallsAtRetirement: totalWindfallsAtRetirement(windfalls),
  });
  const goals = p.goals ?? [];
  return {
    user,
    residentCountry: res,
    destinationCountry: dest,
    freedom,
    allocation,
    goals,
    goalProjections: goals.map((g) => projectGoal(g, YEAR, dest.inflationRate, allocation.expectedReturn)),
    windfalls,
    savingsRate: 0.3,
    currentCorpus: p.corpus ?? 0,
  };
}

const PERSONAS: Record<string, PlanPDFInput> = {
  gulfWorker: persona({
    country: "AE",
    retire: "IN",
    city: "kerala",
    age: 34,
    income: 6500,
    risk: "conservative",
    goals: [
      { id: "g1", name: "വീട് (house)", category: "home", targetAmountToday: 4_000_000, targetYear: 2032, createdAt: 0 },
      { id: "g2", name: "🎓", category: "education", targetAmountToday: 1_500_000, targetYear: 2040, createdAt: 0 },
    ],
    windfalls: [
      { id: "w1", name: "UAE End-of-Service (EOSB)", category: "eosb", amount: 900_000, targetYear: 2050, createdAt: 0 },
    ],
  }),
  mumbai: persona({ country: "IN", city: "mumbai", age: 35, income: 150_000, risk: "moderate", corpus: 1_200_000 }),
  us: persona({ country: "US", age: 40, income: 9000, risk: "aggressive", corpus: 250_000 }),
};

/** Every character jsPDF's Helvetica (WinAnsi) can draw. */
const WIN_ANSI_EXTRA = "€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ";
function printable(s: string) {
  return Array.from(s).every((ch) => {
    const c = ch.codePointAt(0)!;
    return (c >= 0x20 && c <= 0x7e) || (c >= 0xa0 && c <= 0xff) || WIN_ANSI_EXTRA.includes(ch);
  });
}

describe("pdfSafe", () => {
  it("replaces symbols the PDF font cannot draw", () => {
    expect(pdfSafe("₹5.13Cr")).toBe("Rs 5.13Cr");
    expect(pdfSafe("🇦🇪 UAE → 🇮🇳 India")).toBe("UAE to India");
    expect(pdfSafe("≈ AED 2.5M ✓")).toBe("about AED 2.5M ");
    expect(pdfSafe("25× · — €")).toBe("25× · — €");
  });
});

describe("pdfMoney", () => {
  const IN = getCountryProfile("IN");
  const AE = getCountryProfile("AE");
  it("uses lakh / crore for rupees", () => {
    expect(pdfMoney(51_300_000, IN)).toBe("Rs 5.13 crore");
    expect(pdfMoney(2_050_000, IN)).toBe("Rs 20.5 lakh");
    expect(pdfMoney(60_489, IN)).toBe("Rs 60,500");
    expect(pdfMoney(20_000_000, IN, { short: true })).toBe("Rs 2 Cr");
  });
  it("uses million for other currencies", () => {
    expect(pdfMoney(2_270_000, AE)).toBe("AED 2.27 million");
    expect(pdfMoney(1_950, AE)).toBe("AED 1,950");
    expect(pdfMoney(500_000, AE, { short: true })).toBe("AED 500K");
  });
});

describe("buildPlanPDF", () => {
  for (const [name, input] of Object.entries(PERSONAS)) {
    it(`${name}: draws only printable characters`, async () => {
      const drawn: string[] = [];
      const doc = await buildPlanPDF(input, { onText: (t) => drawn.push(t), now: new Date(YEAR, 9, 3) });
      const bad = drawn.filter((t) => !printable(t));
      expect(bad).toEqual([]);
      expect(drawn.join(" ")).not.toMatch(/₹|→|≈|undefined|NaN/);
      expect(doc.getNumberOfPages()).toBeGreaterThanOrEqual(3);
      // PLAN_PDF_OUT=<dir> writes the files so a human can eyeball the layout.
      const out = process.env.PLAN_PDF_OUT;
      if (out) writeFileSync(join(out, `${name}.pdf`), Buffer.from(doc.output("arraybuffer")));
    });
  }

  it("gulf worker: shows rupees in words and the RNOR tip", async () => {
    const drawn: string[] = [];
    await buildPlanPDF(PERSONAS.gulfWorker, { onText: (t) => drawn.push(t) });
    const all = drawn.join(" ");
    expect(all).toMatch(/Rs [\d.]+ crore/);
    expect(all).toMatch(/About AED [\d.]+ million at today's exchange rate/);
    expect(all).toContain("tax-free window");
    expect(all).toContain("Education"); // emoji-only goal name falls back to its category
  });
});
