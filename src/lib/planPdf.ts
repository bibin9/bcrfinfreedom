/**
 * Personal FIRE plan — PDF export.
 *
 * Generates a 3-5 page branded PDF on the client, denominated in the user's
 * retirement-country currency. No backend; everything runs in-browser.
 *
 * The jsPDF import is DYNAMIC (lazy-loaded) so the ~400KB library only lands
 * in the user's browser when they actually click "Export my plan".
 */

import type {
  AllocationResult,
  CountryProfile,
  FreedomProjection,
  Goal,
  GoalProjection,
  UserInput,
} from "@/types";
import { formatCurrency } from "@/lib/formatters";

export interface PlanPDFInput {
  user: UserInput;
  residentCountry: CountryProfile;
  destinationCountry: CountryProfile;
  freedom: FreedomProjection;
  allocation: AllocationResult;
  goals: Goal[];
  goalProjections: GoalProjection[];
  savingsRate: number;
  currentCorpus: number;
  /** Optional Monte Carlo survival % (0-1), if the user has run Reality Check. */
  survivalRate?: number | null;
}

// Brand colours — mirror the FIRE theme in the app.
const ORANGE: [number, number, number] = [234, 88, 12]; // #ea580c
const ORANGE_LIGHT: [number, number, number] = [254, 215, 170];
const DARK_INK: [number, number, number] = [17, 24, 39];
const GRAY_INK: [number, number, number] = [75, 85, 99];
const BORDER: [number, number, number] = [229, 231, 235];

export async function generatePlanPDF(input: PlanPDFInput): Promise<void> {
  // Lazy-import jsPDF — only pay the download cost on first use.
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  const isExpat = input.residentCountry.code !== input.destinationCountry.code;
  const today = new Date().toISOString().slice(0, 10);
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 18;
  const contentW = pageW - 2 * margin;

  // Short helpers.
  const money = (n: number) =>
    formatCurrency(n, input.destinationCountry, { compact: true });

  function drawFooter(pageNum: number, pageCount: number) {
    doc.setFillColor(...ORANGE);
    doc.rect(0, pageH - 10, pageW, 10, "F");
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text(
      "BCR FIRE  ·  by BibinCutRiver  ·  Educational use only, not financial advice",
      margin,
      pageH - 3.5,
    );
    doc.text(`${pageNum} / ${pageCount}`, pageW - margin, pageH - 3.5, { align: "right" });
  }

  function newPage() {
    doc.addPage();
    cursorY = margin;
  }

  function ensureSpace(needed: number) {
    if (cursorY + needed > pageH - 20) newPage();
  }

  function h1(text: string) {
    ensureSpace(14);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...ORANGE);
    doc.text(text, margin, cursorY);
    cursorY += 7;
    doc.setDrawColor(...ORANGE);
    doc.setLineWidth(0.5);
    doc.line(margin, cursorY, pageW - margin, cursorY);
    cursorY += 5;
  }

  function h2(text: string) {
    ensureSpace(10);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...DARK_INK);
    doc.text(text, margin, cursorY);
    cursorY += 6;
  }

  function body(text: string) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...DARK_INK);
    const lines = doc.splitTextToSize(text, contentW) as string[];
    lines.forEach((line) => {
      ensureSpace(5);
      doc.text(line, margin, cursorY);
      cursorY += 5;
    });
  }

  function kv(rows: Array<[string, string]>) {
    doc.setFontSize(10);
    const col1W = 65;
    rows.forEach(([k, v]) => {
      ensureSpace(6);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...GRAY_INK);
      doc.text(k, margin, cursorY);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...DARK_INK);
      doc.text(v, margin + col1W, cursorY);
      doc.setDrawColor(...BORDER);
      doc.setLineWidth(0.2);
      doc.line(margin, cursorY + 1.5, pageW - margin, cursorY + 1.5);
      cursorY += 5.5;
    });
    cursorY += 2;
  }

  function metricBox(label: string, value: string, hint?: string, color = ORANGE) {
    ensureSpace(22);
    doc.setDrawColor(...color);
    doc.setFillColor(255, 247, 237);
    doc.roundedRect(margin, cursorY, contentW, 20, 2, 2, "FD");
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...GRAY_INK);
    doc.text(label.toUpperCase(), margin + 4, cursorY + 5);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...color);
    doc.text(value, margin + 4, cursorY + 12);
    if (hint) {
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...GRAY_INK);
      doc.text(hint, margin + 4, cursorY + 17);
    }
    cursorY += 23;
  }

  function simpleTable(headers: string[], rows: string[][], colWidths: number[]) {
    const rowH = 6;
    const headerY = cursorY;
    ensureSpace(rowH * (rows.length + 1));
    // Header row.
    doc.setFillColor(...ORANGE);
    doc.rect(margin, cursorY, contentW, rowH, "F");
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    let x = margin + 2;
    headers.forEach((h, i) => {
      doc.text(h, x, cursorY + 4);
      x += colWidths[i];
    });
    cursorY += rowH;
    // Body rows.
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...DARK_INK);
    rows.forEach((row, rIdx) => {
      ensureSpace(rowH);
      if (rIdx % 2 === 0) {
        doc.setFillColor(249, 250, 251);
        doc.rect(margin, cursorY, contentW, rowH, "F");
      }
      x = margin + 2;
      row.forEach((cell, i) => {
        const lines = doc.splitTextToSize(cell, colWidths[i] - 4) as string[];
        doc.text(lines[0] ?? "", x, cursorY + 4);
        x += colWidths[i];
      });
      cursorY += rowH;
    });
    doc.setDrawColor(...BORDER);
    doc.setLineWidth(0.2);
    doc.rect(margin, headerY, contentW, cursorY - headerY);
    cursorY += 3;
  }

  // =========== Page 1 — Cover ===========
  let cursorY = margin;

  // Big orange banner
  doc.setFillColor(...ORANGE);
  doc.rect(0, 0, pageW, 70, "F");
  doc.setFillColor(...ORANGE_LIGHT);
  // Flame circle
  doc.circle(pageW / 2, 30, 14, "F");
  // Draw a simple flame (triangle-ish)
  doc.setFillColor(...ORANGE);
  const cx = pageW / 2;
  const cy = 30;
  doc.triangle(cx - 5, cy + 6, cx + 5, cy + 6, cx, cy - 8, "F");
  doc.circle(cx, cy + 5, 3, "F");

  doc.setFontSize(28);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text("BCR FIRE", pageW / 2, 55, { align: "center" });
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("Your Personal FIRE Plan", pageW / 2, 63, { align: "center" });

  cursorY = 85;
  doc.setFontSize(10);
  doc.setTextColor(...GRAY_INK);
  doc.text(`Generated ${today}`, pageW / 2, cursorY, { align: "center" });
  cursorY += 15;

  // Hero: FIRE number
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...GRAY_INK);
  doc.text("Your FIRE number", pageW / 2, cursorY, { align: "center" });
  cursorY += 10;
  doc.setFontSize(36);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...ORANGE);
  doc.text(money(input.freedom.targetCorpus), pageW / 2, cursorY, { align: "center" });
  cursorY += 10;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...GRAY_INK);
  doc.text(
    `25× your future yearly spend at age ${input.freedom.freedomAge}`,
    pageW / 2,
    cursorY,
    { align: "center" },
  );
  cursorY += 15;

  // Who this plan is for
  doc.setFontSize(10);
  doc.setTextColor(...DARK_INK);
  const context = isExpat
    ? `${input.residentCountry.flag} Living ${input.residentCountry.name} → ${input.destinationCountry.flag} Retiring ${input.destinationCountry.name}`
    : `${input.destinationCountry.flag} ${input.destinationCountry.name}`;
  const persona = `Age ${input.user.age} · ${input.user.risk} risk · ${input.user.goal.replace(/_/g, " ")}`;
  doc.text(context, pageW / 2, cursorY, { align: "center" });
  cursorY += 6;
  doc.text(persona, pageW / 2, cursorY, { align: "center" });

  // Footer tagline
  doc.setFontSize(9);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(...GRAY_INK);
  const tagline =
    "A UAE-based banking-payments IT developer built this FIRE tool for himself.";
  doc.text(tagline, pageW / 2, pageH - 20, { align: "center" });

  // =========== Page 2 — The numbers ===========
  newPage();
  h1("Your FIRE at a glance");

  const years = input.freedom.yearsToFreedomAtCurrentRate;
  const yearsText =
    years != null && years <= 60
      ? `${Math.round(years)} years at current savings`
      : "Not reachable at current savings";

  metricBox(
    `FIRE number at age ${input.freedom.freedomAge}`,
    money(input.freedom.targetCorpus),
    `25× future spend of ${money(input.freedom.annualExpenses)}/yr (${input.destinationCountry.name})`,
  );
  metricBox(
    "Required monthly SIP",
    input.freedom.requiredMonthlySIP != null
      ? `${money(input.freedom.requiredMonthlySIP)}/mo`
      : "—",
    input.freedom.monthlyShortfall > 0
      ? `Current ${money(input.freedom.currentMonthlySavings)}/mo — short by ${money(input.freedom.monthlyShortfall)}/mo`
      : `You are currently saving enough`,
  );
  metricBox("Years to FIRE", yearsText, `Target: age ${input.freedom.freedomAge}`);
  if (input.survivalRate != null) {
    const pct = Math.round(input.survivalRate * 100);
    metricBox(
      "Monte Carlo survival",
      `${pct}%`,
      `Across 1,000 randomised return paths to age 95`,
    );
  }

  cursorY += 2;
  h2("Your inputs");
  kv([
    [
      "Monthly income",
      formatCurrency(input.user.monthlyIncome, input.residentCountry, { compact: true }) +
        "/mo",
    ],
    ["Savings rate", `${(input.savingsRate * 100).toFixed(0)}%`],
    [
      "Current invested corpus",
      formatCurrency(input.currentCorpus, input.residentCountry, { compact: true }),
    ],
    ["Household size", input.freedom.householdSize === "family" ? "Family of 4" : "Single"],
    [
      "Expense basis",
      input.freedom.expenseBasis === "override"
        ? "Your entered expenses"
        : `${input.destinationCountry.name} benchmark`,
    ],
    ["Inflation assumed", `${(input.freedom.inflationRateUsed * 100).toFixed(1)}% / yr`],
    ["Blended expected return", `${(input.allocation.expectedReturn * 100).toFixed(1)}% / yr`],
  ]);

  // =========== Page 3 — Allocation + Goals ===========
  newPage();
  h1("Recommended allocation");
  body(
    `Blended expected return: ${(input.allocation.expectedReturn * 100).toFixed(1)}%/yr. Equity sleeve: ${input.allocation.equityWeight}%. Numbers below are the share of each monthly contribution that goes into each asset class.`,
  );
  cursorY += 2;

  simpleTable(
    ["Asset class", "Weight", "Monthly amount"],
    input.allocation.breakdown.map((b) => [
      b.label,
      `${b.percent}%`,
      formatCurrency(
        Math.round((input.user.monthlyIncome * input.savingsRate * b.percent) / 100),
        input.residentCountry,
        { compact: true },
      ),
    ]),
    [90, 30, 50],
  );

  if (input.goals.length > 0) {
    cursorY += 4;
    h1("Life goals");
    body(
      `In addition to the FIRE corpus, these are the lumpy life goals the plan has sized a dedicated monthly SIP for. All amounts in ${input.destinationCountry.name} currency.`,
    );
    cursorY += 2;
    simpleTable(
      ["Goal", "By year", "Today", "At target", "SIP/mo"],
      input.goalProjections.map((p) => [
        p.goal.name,
        String(p.goal.targetYear),
        money(p.goal.targetAmountToday),
        money(p.futureAmount),
        p.monthlySIP != null ? money(p.monthlySIP) : "—",
      ]),
      [55, 20, 30, 35, 30],
    );
    const totalGoals = input.goalProjections.reduce(
      (s, p) => s + (p.monthlySIP ?? 0),
      0,
    );
    cursorY += 2;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...DARK_INK);
    doc.text(
      `Total goals SIP: ${money(totalGoals)}/mo`,
      margin,
      cursorY,
    );
    cursorY += 6;
    const fireSIP = input.freedom.requiredMonthlySIP ?? 0;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...GRAY_INK);
    doc.text(
      `Grand total monthly savings needed = FIRE SIP (${money(fireSIP)}) + Goals (${money(totalGoals)}) = ${money(fireSIP + totalGoals)}/mo`,
      margin,
      cursorY,
    );
  }

  // =========== Page 4 — Action plan + disclaimer ===========
  newPage();
  h1("Your next 5 moves");
  const moves: string[] = [
    `Automate a ${input.freedom.requiredMonthlySIP != null ? money(input.freedom.requiredMonthlySIP) : "monthly"} SIP on the day after payday — people who automate save ~3× better.`,
    `Max out tax-advantaged accounts in ${input.residentCountry.name} first (${input.residentCountry.taxAdvantagedAccounts
      .map((a) => a.name)
      .slice(0, 3)
      .join(", ")}).`,
    `Build a ${input.residentCountry.emergencyFundMonths}-month emergency fund in a liquid account before increasing equity risk.`,
    `Review this plan annually — on your birthday or on 1 January. Not monthly.`,
    `If your real monthly spend differs from the ${input.destinationCountry.name} benchmark, enter it as your override on the dashboard.`,
  ];
  moves.forEach((m, i) => {
    ensureSpace(10);
    doc.setFillColor(...ORANGE);
    doc.circle(margin + 2, cursorY - 1.5, 2.5, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text(String(i + 1), margin + 2, cursorY - 0.5, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...DARK_INK);
    const lines = doc.splitTextToSize(m, contentW - 10) as string[];
    doc.text(lines, margin + 8, cursorY);
    cursorY += lines.length * 5 + 2;
  });

  cursorY += 6;
  h1("Disclaimer");
  body(
    "This plan is an educational projection, not financial advice. Numbers use publicly-available country averages and may be out of date. Markets are uncertain; actual returns and inflation will vary from these assumptions. Consult a SEBI / SCA / FCA / SEC-registered advisor before acting. Past performance does not guarantee future results.",
  );

  cursorY += 4;
  body(
    `Data vintage: country assumptions last reviewed per the app's Local Context panel. FX rates used in this plan are illustrative spot values and move constantly.`,
  );

  // Finalise — stamp footers on every page.
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    drawFooter(i, pageCount);
  }

  // Save with a descriptive filename.
  const filename = `BCR_FIRE_Plan_${input.destinationCountry.code}_${today}.pdf`;
  doc.save(filename);
}
