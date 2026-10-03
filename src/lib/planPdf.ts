/**
 * Personal FIRE plan — PDF export.
 *
 * Builds a 3-4 page, plain-English PDF on the client. No backend.
 *
 * jsPDF's built-in Helvetica only knows the WinAnsi character set. Anything
 * outside it (₹, ≈, →, ✓, flag emoji, the narrow no-break space Intl puts in
 * "AED 2.5M") makes jsPDF re-encode the WHOLE line as 16-bit, which prints as
 * spaced-out junk. So every string goes through `pdfSafe()` before it is drawn,
 * and money is formatted by `pdfMoney()` ("Rs 5.13 crore", "AED 2.27 million")
 * instead of Intl.
 *
 * The jsPDF import is DYNAMIC so the ~400 KB library only loads when the user
 * actually clicks "Export my plan".
 */

import type { jsPDF as JsPDF } from "jspdf";
import type {
  AllocationResult,
  AssetClass,
  CountryProfile,
  FreedomProjection,
  Goal,
  GoalProjection,
  UserInput,
} from "@/types";
import { convertCurrency } from "@/lib/fx";
import { categoryMeta as goalCategoryMeta } from "@/lib/goals";
import { windfallCategoryMeta, type WindfallProjection } from "@/lib/windfalls";

export interface PlanPDFInput {
  user: UserInput;
  residentCountry: CountryProfile;
  destinationCountry: CountryProfile;
  freedom: FreedomProjection;
  allocation: AllocationResult;
  goals: Goal[];
  goalProjections: GoalProjection[];
  /** Lump sums the plan already counts (EOSB, property sale…), if any. */
  windfalls?: WindfallProjection[];
  savingsRate: number;
  /** Money already invested, in RESIDENT currency. */
  currentCorpus: number;
  /** Optional Monte Carlo survival % (0-1), if the user has run Reality Check. */
  survivalRate?: number | null;
}

export interface BuildOptions {
  /** Called with every string actually drawn — used by tests to catch junk characters. */
  onText?: (text: string) => void;
  /** Override "today" (tests). */
  now?: Date;
}

// ---------------------------------------------------------------------------
// Text safety
// ---------------------------------------------------------------------------

/** WinAnsi characters in 0x80-0x9F that map to Unicode code points above 0xFF. */
const WIN_ANSI_EXTRA = new Set("€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ");

function isWinAnsi(ch: string): boolean {
  const c = ch.codePointAt(0) ?? 0;
  if (c === 0x0a) return true;
  if (c >= 0x20 && c <= 0x7e) return true;
  if (c >= 0xa0 && c <= 0xff) return true;
  return WIN_ANSI_EXTRA.has(ch);
}

const REPLACEMENTS: Array<[RegExp, string]> = [
  [/₹\s?/g, "Rs "],
  [/[     ]/g, " "],
  [/≈\s?/g, "about "],
  [/\s?→\s?/g, " to "],
  [/\s?←\s?/g, " from "],
  [/≥/g, ">="],
  [/≤/g, "<="],
  [/−/g, "-"],
  [/[✓✔✅☑]/g, ""],
];

/** Make any string printable by jsPDF's standard fonts — never emits junk glyphs. */
export function pdfSafe(text: string): string {
  let out = text;
  for (const [re, rep] of REPLACEMENTS) out = out.replace(re, rep);
  out = Array.from(out)
    .filter(isWinAnsi)
    .join("");
  return out.replace(/ {2,}/g, " ").replace(/^ (?=\S)/, "");
}

// ---------------------------------------------------------------------------
// Money in words people use
// ---------------------------------------------------------------------------

const PDF_PREFIX: Partial<Record<string, string>> = {
  INR: "Rs ",
  USD: "$",
  GBP: "£",
  EUR: "€",
  JPY: "¥",
  CAD: "C$",
  AUD: "A$",
  SGD: "S$",
  MYR: "RM ",
};

function sig3(n: number): string {
  return String(Number(n.toPrecision(3)));
}

/**
 * Money for the PDF, the way people say it out loud.
 *   INR → "Rs 60,500", "Rs 20.5 lakh", "Rs 5.13 crore"
 *   AED → "AED 1,950", "AED 2.27 million"
 * `short` gives axis-label form: "Rs 2 Cr", "AED 500K".
 */
export function pdfMoney(
  amount: number,
  country: Pick<CountryProfile, "currency">,
  opts: { short?: boolean; exact?: boolean } = {},
): string {
  const cur = country.currency;
  const prefix = PDF_PREFIX[cur] ?? `${cur} `;
  const sign = amount < 0 ? "-" : "";
  const n = Math.abs(amount);
  const isINR = cur === "INR";
  const group = (v: number) =>
    new Intl.NumberFormat(isINR ? "en-IN" : "en-US", { maximumFractionDigits: 0 }).format(v);

  let body: string;
  if (isINR && n >= 1e7) body = `${sig3(n / 1e7)}${opts.short ? " Cr" : " crore"}`;
  else if (isINR && n >= 1e5) body = `${sig3(n / 1e5)}${opts.short ? " L" : " lakh"}`;
  else if (!isINR && n >= 1e9) body = `${sig3(n / 1e9)}${opts.short ? "B" : " billion"}`;
  else if (!isINR && n >= 1e6) body = `${sig3(n / 1e6)}${opts.short ? "M" : " million"}`;
  else if (opts.short && n >= 1e3) body = `${sig3(n / 1e3)}K`;
  else if (!opts.exact && n >= 1e3) body = group(Number(n.toPrecision(3)));
  else body = group(Math.round(n));
  return pdfSafe(`${sign}${prefix}${body}`);
}

// ---------------------------------------------------------------------------
// Design tokens
// ---------------------------------------------------------------------------

type RGB = [number, number, number];
const ORANGE: RGB = [234, 88, 12];
const ORANGE_DARK: RGB = [154, 52, 18];
const ORANGE_SOFT: RGB = [251, 146, 60];
const ORANGE_TINT: RGB = [255, 237, 213];
const CREAM: RGB = [255, 247, 237];
const AMBER: RGB = [245, 158, 11];
const INK: RGB = [17, 24, 39];
const BODY: RGB = [55, 65, 81];
const MUTED: RGB = [107, 114, 128];
const LINE: RGB = [229, 231, 235];
const PANEL: RGB = [248, 250, 252];
const GREEN: RGB = [4, 120, 87];
const GREEN_BG: RGB = [236, 253, 245];
const GREEN_LINE: RGB = [167, 243, 208];
const WARN: RGB = [180, 83, 9];
const WARN_BG: RGB = [255, 251, 235];
const WARN_LINE: RGB = [253, 230, 138];
const WHITE: RGB = [255, 255, 255];

/** Mirrors AllocationDonut so the PDF matches the app. */
const ASSET_COLOR: Record<AssetClass, RGB> = {
  equities_local: [16, 185, 129],
  equities_destination: [249, 115, 22],
  equities_international: [5, 150, 105],
  bonds_fixed_income: [59, 130, 246],
  real_estate: [168, 85, 247],
  gold_commodities: [245, 158, 11],
  cash_emergency: [100, 116, 139],
  crypto: [239, 68, 68],
};

const PT = 0.3528; // mm per point

// ---------------------------------------------------------------------------
// Builder
// ---------------------------------------------------------------------------

export async function buildPlanPDF(input: PlanPDFInput, options: BuildOptions = {}): Promise<JsPDF> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  const res = input.residentCountry;
  const dest = input.destinationCountry;
  const fr = input.freedom;
  const isExpat = res.code !== dest.code;
  const now = options.now ?? new Date();
  const dateText = now.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 16;
  const CW = W - 2 * M;
  const TOP = 28;
  const BOTTOM = H - 20;
  let y = 0;

  // ---- money shorthands ---------------------------------------------------
  const dMoney = (n: number) => pdfMoney(n, dest);
  const rMoney = (n: number) => pdfMoney(n, res);
  /** Destination amount, with "(about AED x)" for expats. */
  const dualMoney = (n: number) =>
    isExpat ? `${dMoney(n)} (about ${rMoney(convertCurrency(n, dest, res))})` : dMoney(n);

  // ---- text primitives (the ONLY way text reaches the page) ---------------
  function font(size: number, style: "normal" | "bold" | "italic" = "normal", color: RGB = INK) {
    doc.setFont("helvetica", style);
    doc.setFontSize(size);
    doc.setTextColor(...color);
  }
  function text(
    s: string | string[],
    x: number,
    yy: number,
    opts?: { align?: "left" | "center" | "right"; charSpace?: number },
  ) {
    const clean = Array.isArray(s) ? s.map(pdfSafe) : pdfSafe(s);
    (Array.isArray(clean) ? clean : [clean]).forEach((line) => options.onText?.(line));
    doc.text(clean, x, yy, opts);
  }
  function wrap(s: string, width: number): string[] {
    return doc.splitTextToSize(pdfSafe(s), width) as string[];
  }
  const lineH = (size: number) => size * PT * 1.42;
  function width(s: string): number {
    return doc.getTextWidth(pdfSafe(s));
  }

  // ---- page flow -----------------------------------------------------------
  function runningHeader() {
    drawLogo(M, 9, 7);
    font(9, "bold", INK);
    text("BCR FIRE", M + 9.5, 13.8);
    font(9, "normal", MUTED);
    text("Your financial freedom plan", M + 9.5 + width("BCR FIRE ") + 1.5, 13.8);
    text(dateText, W - M, 13.8, { align: "right" });
    doc.setDrawColor(...LINE);
    doc.setLineWidth(0.3);
    doc.line(M, 19, W - M, 19);
  }
  function newPage() {
    doc.addPage();
    runningHeader();
    y = TOP;
  }
  function ensure(h: number) {
    if (y + h > BOTTOM) newPage();
  }

  /** `keepWith` = height of the content that must stay on the same page as the title. */
  function sectionTitle(title: string, intro?: string, keepWith = 20) {
    font(9.5, "normal", BODY);
    const introLines = intro ? wrap(intro, CW) : [];
    ensure(16 + introLines.length * lineH(9.5) + keepWith);
    doc.setFillColor(...ORANGE);
    doc.roundedRect(M, y - 4.6, 1.6, 6, 0.8, 0.8, "F");
    font(14, "bold", INK);
    text(title, M + 4.5, y);
    y += 6.5;
    if (introLines.length) {
      font(9.5, "normal", BODY);
      text(introLines, M, y);
      y += introLines.length * lineH(9.5) + 2;
    }
    y += 2;
  }

  function paragraph(s: string, size = 9.5, color: RGB = BODY, x = M, w = CW) {
    font(size, "normal", color);
    const lines = wrap(s, w);
    lines.forEach((l) => {
      ensure(lineH(size));
      font(size, "normal", color);
      text(l, x, y);
      y += lineH(size);
    });
  }

  /** Box with a bold title + body, sized to its content. */
  function callout(title: string, bodyText: string, tone: "warn" | "good" | "info") {
    const palette =
      tone === "warn"
        ? { bg: WARN_BG, line: WARN_LINE, ink: WARN }
        : tone === "good"
          ? { bg: GREEN_BG, line: GREEN_LINE, ink: GREEN }
          : { bg: CREAM, line: ORANGE_TINT, ink: ORANGE_DARK };
    const innerW = CW - 12;
    font(11, "bold");
    const tLines = wrap(title, innerW);
    font(9.5, "normal");
    const bLines = wrap(bodyText, innerW);
    const h = 7.5 + tLines.length * lineH(11) + 1 + (bLines.length - 1) * lineH(9.5) + 5.5;
    ensure(h + 4);
    doc.setFillColor(...palette.bg);
    doc.setDrawColor(...palette.line);
    doc.setLineWidth(0.3);
    doc.roundedRect(M, y, CW, h, 2.5, 2.5, "FD");
    doc.setFillColor(...palette.ink);
    doc.roundedRect(M, y, 1.8, h, 0.9, 0.9, "F");
    let yy = y + 7.5;
    font(11, "bold", palette.ink);
    text(tLines, M + 7, yy);
    yy += tLines.length * lineH(11) + 1;
    font(9.5, "normal", BODY);
    text(bLines, M + 7, yy);
    y += h + 5;
  }

  /** Clean table: muted header, hairline rows, wrapped cells, page-break safe. */
  function table(
    headers: string[],
    rows: Array<Array<string | { text: string; bold?: boolean; muted?: boolean; dot?: RGB }>>,
    widths: number[],
    opts: { align?: Array<"left" | "right">; size?: number } = {},
  ) {
    const size = opts.size ?? 9.5;
    const align = opts.align ?? headers.map(() => "left" as const);
    const pad = 2.5;
    const drawHeader = () => {
      font(7.5, "bold", MUTED);
      let x = M;
      headers.forEach((h, i) => {
        const tx = align[i] === "right" ? x + widths[i] - pad : x + pad;
        text(h.toUpperCase(), tx, y + 4, { align: align[i], charSpace: 0.2 });
        x += widths[i];
      });
      y += 6.5;
      doc.setDrawColor(...INK);
      doc.setLineWidth(0.4);
      doc.line(M, y, M + CW, y);
    };
    ensure(14);
    drawHeader();
    rows.forEach((row) => {
      const cells = row.map((c) => (typeof c === "string" ? { text: c } : c));
      const cellLines = cells.map((c, i) => {
        font(c.muted ? size - 1 : size, c.bold ? "bold" : "normal");
        const indent = c.dot ? 4.5 : 0;
        return wrap(c.text, widths[i] - 2 * pad - indent);
      });
      const rowH =
        Math.max(...cellLines.map((l, i) => l.length * lineH(cells[i].muted ? size - 1 : size))) + 4.5;
      if (y + rowH > BOTTOM) {
        newPage();
        drawHeader();
      }
      let x = M;
      cells.forEach((c, i) => {
        const s = c.muted ? size - 1 : size;
        font(s, c.bold ? "bold" : "normal", c.muted ? MUTED : INK);
        const baseY = y + 3 + s * PT;
        let tx = align[i] === "right" ? x + widths[i] - pad : x + pad;
        if (c.dot) {
          doc.setFillColor(...c.dot);
          doc.circle(tx + 1.4, baseY - 1.1, 1.4, "F");
          tx += 4.5;
        }
        text(cellLines[i], tx, baseY, { align: align[i] });
        x += widths[i];
      });
      y += rowH;
      doc.setDrawColor(...LINE);
      doc.setLineWidth(0.25);
      doc.line(M, y, M + CW, y);
    });
    y += 5;
  }

  // ---- drawing helpers -------------------------------------------------------
  /** Bezier path from absolute points: start, then [c1, c2, end] triples. */
  function bezierShape(
    start: [number, number],
    curves: Array<[[number, number], [number, number], [number, number]]>,
    style: "F" | "S" | "FD",
  ) {
    let [px, py] = start;
    const segs = curves.map(([c1, c2, e]) => {
      const seg = [c1[0] - px, c1[1] - py, c2[0] - px, c2[1] - py, e[0] - px, e[1] - py];
      [px, py] = e;
      return seg;
    });
    doc.lines(segs, start[0], start[1], [1, 1], style, true);
  }

  /** Flame mark: base centre (cx, by), height h. */
  function drawFlame(cx: number, by: number, h: number, outer: RGB, inner: RGB) {
    const P = (x: number, yy: number, s: number): [number, number] => [cx + x * h * s, by - yy * h * s];
    const flame = (s: number, color: RGB) => {
      doc.setFillColor(...color);
      bezierShape(
        P(0, 0, s),
        [
          [P(-0.42, 0, s), P(-0.48, 0.38, s), P(-0.26, 0.62, s)],
          [P(-0.16, 0.74, s), P(-0.05, 0.84, s), P(0.04, 1, s)],
          [P(0.24, 0.78, s), P(0.46, 0.5, s), P(0.4, 0.22, s)],
          [P(0.35, 0.06, s), P(0.18, 0, s), P(0, 0, s)],
        ],
        "F",
      );
    };
    flame(1, outer);
    flame(0.55, inner);
  }

  function drawLogo(x: number, yy: number, size: number) {
    doc.setFillColor(...ORANGE);
    doc.roundedRect(x, yy, size, size, size * 0.22, size * 0.22, "F");
    drawFlame(x + size / 2, yy + size * 0.84, size * 0.68, WHITE, ORANGE_TINT);
  }

  // =========================================================================
  // PAGE 1 — the plan on one page
  // =========================================================================
  const bandH = 64;
  doc.setFillColor(...ORANGE);
  doc.rect(0, 0, W, bandH, "F");
  // Soft decorative circles, clipped by the band.
  doc.setFillColor(...ORANGE_SOFT);
  doc.circle(W - 8, 6, 34, "F");
  doc.setFillColor(...ORANGE);
  doc.circle(W - 8, 6, 24, "F");
  doc.setFillColor(...WHITE);
  doc.rect(0, bandH, W, 40, "F");

  // Logo tile
  doc.setFillColor(...WHITE);
  doc.roundedRect(M, 14, 13, 13, 3, 3, "F");
  drawFlame(M + 6.5, 25, 9, ORANGE, AMBER);
  font(12, "bold", WHITE);
  text("BCR FIRE", M + 17, 19.6);
  font(8.5, "normal", ORANGE_TINT);
  text("by BibinCutRiver", M + 17, 24.4);

  font(25, "bold", WHITE);
  text("Your financial freedom plan", M, 43);
  font(10, "normal", WHITE);
  const whereText = isExpat
    ? `living in ${the(res.name)} and planning to retire in ${the(dest.name)}${fr.cityName ? ` (${fr.cityName})` : ""}`
    : `living in ${the(dest.name)}${fr.cityName ? ` (${fr.cityName})` : ""}`;
  text(wrap(`Prepared on ${dateText} for a ${input.user.age}-year-old ${whereText}.`, CW - 30), M, 51);

  y = bandH + 12;

  // ---- Hero: the FIRE number ------------------------------------------------
  {
    const padX = 8;
    const innerW = CW - 2 * padX;
    const spendLine = fr.cityName ? `living in ${fr.cityName}` : `living in ${dest.name}`;
    const explain =
      `At ${fr.freedomAge}, ${spendLine} will cost about ${dMoney(fr.annualExpenses)} a year ` +
      `(prices go up about ${(fr.inflationRateUsed * 100).toFixed(1)}% every year). ` +
      `Save 25 times that and you can take out about 4% each year to live on, for the rest of your life.`;
    font(9.5, "normal");
    const explainLines = wrap(explain, innerW);
    const heroH = 30 + (isExpat ? 6 : 0) + (explainLines.length - 1) * lineH(9.5) + 7;

    doc.setFillColor(...CREAM);
    doc.setDrawColor(...ORANGE_TINT);
    doc.setLineWidth(0.4);
    doc.roundedRect(M, y, CW, heroH, 3, 3, "FD");

    let yy = y + 9;
    font(8, "bold", ORANGE_DARK);
    text("THE MONEY YOU NEED TO STOP WORKING", M + padX, yy, { charSpace: 0.35 });
    yy += 13;
    const big = dMoney(fr.targetCorpus);
    font(32, "bold", ORANGE);
    text(big, M + padX, yy);
    const bigW = width(big);
    font(11, "normal", BODY);
    text(`by age ${fr.freedomAge}`, M + padX + bigW + 3, yy);
    yy += 7;
    if (isExpat) {
      font(9.5, "normal", MUTED);
      text(
        `About ${rMoney(convertCurrency(fr.targetCorpus, dest, res))} at today's exchange rate`,
        M + padX,
        yy,
      );
      yy += 6;
    }
    yy += 1;
    font(9.5, "normal", BODY);
    text(explainLines, M + padX, yy);
    y += heroH + 6;
  }

  // ---- Three number tiles ------------------------------------------------------
  const years = fr.yearsToFreedomAtCurrentRate;
  const paceAge = years != null ? Math.round(input.user.age + years) : null;
  const onTrack = years != null && input.user.age + years <= fr.freedomAge + 0.5;
  const sip = fr.requiredMonthlySIP;
  {
    const gap = 4;
    const tileW = (CW - 2 * gap) / 3;
    const tiles: Array<{ label: string; value: string; sub: string; accent?: RGB }> = [
      {
        label: "Save each month",
        value: sip != null ? dMoney(sip) : "-",
        sub:
          sip != null
            ? isExpat
              ? `About ${rMoney(convertCurrency(sip, dest, res))}, to be free by ${fr.freedomAge}`
              : `To be free by age ${fr.freedomAge}`
            : `Your goal age is too close - pick a later age`,
        accent: ORANGE,
      },
      {
        label: "You save now",
        value: dMoney(fr.currentMonthlySavings),
        sub: isExpat
          ? `${rMoney(input.user.monthlyIncome * input.savingsRate)} a month - ${Math.round(input.savingsRate * 100)}% of your pay`
          : `${Math.round(input.savingsRate * 100)}% of your take-home pay`,
      },
      {
        label: "Free at age",
        value: paceAge != null && paceAge <= 100 ? String(paceAge) : "Not yet",
        sub:
          paceAge != null && paceAge <= 100
            ? `At your current pace (your goal: ${fr.freedomAge})`
            : "Save more to get a date",
        accent: onTrack ? GREEN : WARN,
      },
    ];
    font(8, "normal");
    const subLines = tiles.map((t) => wrap(t.sub, tileW - 10));
    const tileH = 22 + Math.max(...subLines.map((l) => l.length)) * lineH(8) + 2;
    tiles.forEach((t, i) => {
      const x = M + i * (tileW + gap);
      doc.setFillColor(...PANEL);
      doc.setDrawColor(...LINE);
      doc.setLineWidth(0.3);
      doc.roundedRect(x, y, tileW, tileH, 2.5, 2.5, "FD");
      font(7.5, "bold", MUTED);
      text(t.label.toUpperCase(), x + 5, y + 7.5, { charSpace: 0.3 });
      font(17, "bold", t.accent ?? INK);
      text(t.value, x + 5, y + 16.5);
      font(8, "normal", MUTED);
      text(subLines[i], x + 5, y + 22);
    });
    y += tileH + 6;
  }

  // ---- Verdict --------------------------------------------------------------
  if (sip == null) {
    callout(
      "Your goal age is very close",
      `There isn't enough time left to build the full amount by ${fr.freedomAge}. Pick a later age in the app and the plan will show a monthly amount you can work towards.`,
      "warn",
    );
  } else if (fr.monthlyShortfall > 0) {
    const later =
      paceAge != null && paceAge <= 100
        ? `, cut one regular cost, or plan to stop working at ${paceAge} instead of ${fr.freedomAge}`
        : " or cut one regular cost";
    callout(
      `You're short by ${dualMoney(fr.monthlyShortfall)} a month`,
      `That's normal at the start - most people close the gap step by step. Put part of every pay rise into savings${later}. Any of these moves you closer.`,
      "warn",
    );
  } else {
    callout(
      "You're on track",
      `If you keep saving ${dMoney(fr.currentMonthlySavings)} a month, you can stop working by ${fr.freedomAge}. Save a little more after each pay rise and you could get there sooner.`,
      "good",
    );
  }

  // ---- First 3 steps ----------------------------------------------------------
  {
    const monthlySpendRes = input.user.monthlyIncome * (1 - input.savingsRate);
    const emergency = monthlySpendRes * res.emergencyFundMonths;
    const invest = sip != null && sip > 0 ? Math.min(sip, fr.currentMonthlySavings) : fr.currentMonthlySavings;
    const steps = [
      `Set up an automatic monthly investment of ${isExpat ? rMoney(convertCurrency(invest, dest, res)) : dMoney(invest)} for the day after your salary arrives. Money you never see, you never spend.`,
      `Keep ${res.emergencyFundMonths} months of spending (about ${rMoney(emergency)}) in a separate savings account for emergencies - job loss, medical bills, a trip home.`,
      `Look at this plan once a year, on your birthday. Not every month - short-term ups and downs don't matter.`,
    ];
    font(11, "bold");
    ensure(30);
    font(11, "bold", INK);
    text("Your first 3 steps", M, y);
    y += 6;
    steps.forEach((s, i) => {
      font(9.5, "normal");
      const lines = wrap(s, CW - 12);
      const h = lines.length * lineH(9.5);
      ensure(h + 4);
      doc.setDrawColor(...ORANGE);
      doc.setLineWidth(0.5);
      doc.roundedRect(M, y - 3.4, 4.2, 4.2, 0.8, 0.8, "S");
      font(7, "bold", ORANGE);
      text(String(i + 1), M + 2.1, y - 0.3, { align: "center" });
      font(9.5, "normal", BODY);
      text(lines, M + 8, y);
      y += h + 3;
    });
  }

  // =========================================================================
  // PAGE 2 — where the money goes + growth chart
  // =========================================================================
  newPage();
  const monthlyInvestRes = input.user.monthlyIncome * input.savingsRate;
  const sharesPct = input.allocation.breakdown
    .filter((b) => b.asset.startsWith("equities"))
    .reduce((s, b) => s + b.percent, 0);
  sectionTitle(
    "Where to put your monthly savings",
    `You invest ${rMoney(monthlyInvestRes)} a month. Here is a simple way to split it. About ${Math.round(sharesPct)}% goes into shares to grow your money; the rest goes into safer places so one bad year doesn't hurt too much.`,
  );

  // Stacked bar
  {
    const barH = 7;
    let x = M;
    const total = input.allocation.breakdown.reduce((s, b) => s + b.percent, 0) || 100;
    doc.setFillColor(...LINE);
    doc.roundedRect(M, y, CW, barH, 1.5, 1.5, "F");
    input.allocation.breakdown.forEach((b) => {
      const w = (b.percent / total) * CW;
      if (w <= 0) return;
      doc.setFillColor(...(ASSET_COLOR[b.asset] ?? MUTED));
      doc.rect(x, y, w, barH, "F");
      if (w > 9) {
        font(7, "bold", WHITE);
        text(`${Math.round(b.percent)}%`, x + w / 2, y + 4.7, { align: "center" });
      }
      x += w;
    });
    y += barH + 7;
  }

  table(
    ["What", "Share", "Each month", "Why it's here"],
    input.allocation.breakdown.map((b) => [
      { text: b.label, bold: true, dot: ASSET_COLOR[b.asset] ?? MUTED },
      `${b.percent}%`,
      rMoney((monthlyInvestRes * b.percent) / 100),
      { text: b.rationale, muted: true },
    ]),
    [52, 16, 28, CW - 96],
    { align: ["left", "right", "right", "left"] },
  );
  font(8.5, "italic", MUTED);
  paragraph(
    `Expected growth: about ${(input.allocation.expectedReturn * 100).toFixed(1)}% a year on average over the long run. Some years will be negative - that is normal. The people who do best simply keep investing.`,
    8.5,
    MUTED,
  );
  y += 4;

  // ---- Growth chart -----------------------------------------------------------
  const proj = fr.projection.filter((p) => Number.isFinite(p.wealth));
  if (proj.length > 2) {
    const chartH = 64;
    sectionTitle(
      "How your money could grow",
      `If you keep investing ${dMoney(fr.currentMonthlySavings)} a month (no pay rises counted) and it grows about ${(input.allocation.expectedReturn * 100).toFixed(1)}% a year. All amounts in ${dest.currency}.`,
      chartH + 4,
    );
    const axisW = 20;
    const cx0 = M + axisW;
    const cw = CW - axisW - 2;
    const cy0 = y + 4;
    const ch = chartH - 14;
    const minAge = proj[0].age;
    const maxAge = proj[proj.length - 1].age;
    const maxWealth = Math.max(fr.targetCorpus, ...proj.map((p) => p.wealth));
    const yMax = niceCeil(maxWealth * 1.08);
    const X = (age: number) => cx0 + ((age - minAge) / Math.max(1, maxAge - minAge)) * cw;
    const Y = (v: number) => cy0 + ch - (Math.max(0, v) / yMax) * ch;

    // gridlines + y labels
    for (let i = 0; i <= 4; i++) {
      const v = (yMax / 4) * i;
      const gy = Y(v);
      doc.setDrawColor(...LINE);
      doc.setLineWidth(0.2);
      doc.line(cx0, gy, cx0 + cw, gy);
      font(7, "normal", MUTED);
      text(i === 0 ? "0" : pdfMoney(v, dest, { short: true }), cx0 - 2, gy + 1, { align: "right" });
    }
    // area + line
    const pts = proj.map((p) => [X(p.age), Y(p.wealth)] as [number, number]);
    const area: number[][] = [];
    let prev: [number, number] = [pts[0][0], Y(0)];
    for (const pt of pts) {
      area.push([pt[0] - prev[0], pt[1] - prev[1]]);
      prev = pt;
    }
    area.push([0, Y(0) - prev[1]]);
    doc.setFillColor(...ORANGE_TINT);
    doc.lines(area, pts[0][0], Y(0), [1, 1], "F", true);
    const path: number[][] = [];
    for (let i = 1; i < pts.length; i++) path.push([pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]]);
    doc.setDrawColor(...ORANGE);
    doc.setLineWidth(0.8);
    doc.lines(path, pts[0][0], pts[0][1], [1, 1], "S", false);

    // target line
    const ty = Y(fr.targetCorpus);
    doc.setDrawColor(...GREEN);
    doc.setLineWidth(0.5);
    doc.setLineDashPattern([1.6, 1.2], 0);
    doc.line(cx0, ty, cx0 + cw, ty);
    // goal-age marker
    if (fr.freedomAge >= minAge && fr.freedomAge <= maxAge) {
      doc.setDrawColor(...MUTED);
      doc.setLineWidth(0.3);
      doc.line(X(fr.freedomAge), cy0, X(fr.freedomAge), cy0 + ch);
    }
    doc.setLineDashPattern([], 0);
    font(7.5, "bold", GREEN);
    text(`Your FIRE number: ${pdfMoney(fr.targetCorpus, dest, { short: true })}`, cx0 + 2, ty - 1.6);
    if (fr.freedomAge >= minAge && fr.freedomAge <= maxAge) {
      font(7, "normal", MUTED);
      const gx = X(fr.freedomAge);
      const nearRight = gx > cx0 + cw - 22;
      text(`Goal: age ${fr.freedomAge}`, nearRight ? gx - 1.5 : gx + 1.5, cy0 + 3, {
        align: nearRight ? "right" : "left",
      });
    }
    // x labels
    font(7, "normal", MUTED);
    const step = maxAge - minAge > 30 ? 10 : 5;
    for (let a = Math.ceil(minAge / step) * step; a <= maxAge; a += step) {
      text(String(a), X(a), cy0 + ch + 4.5, { align: "center" });
    }
    text("Your age", cx0 + cw, cy0 + ch + 9, { align: "right" });
    // legend
    doc.setFillColor(...ORANGE);
    doc.rect(cx0, cy0 + ch + 7.2, 5, 1.2, "F");
    text("Money you will have", cx0 + 7, cy0 + ch + 9);
    y = cy0 + chartH + 6;
  }

  // =========================================================================
  // Goals, lump sums, the numbers behind the plan — flows on from page 2
  // =========================================================================

  if (input.goalProjections.length > 0) {
    sectionTitle(
      "Your life goals",
      `Money for these is saved separately from your FIRE money. Costs grow with prices, so the "cost then" is what it will really take. Amounts in ${dest.currency}.`,
    );
    const goalName = (g: Goal) => readableName(g.name, goalCategoryMeta(g.category).label);
    table(
      ["Goal", "Year", "Cost today", "Cost then", "Save / month"],
      input.goalProjections.map((p) => [
        { text: goalName(p.goal), bold: true },
        String(p.goal.targetYear),
        dMoney(p.goal.targetAmountToday),
        dMoney(p.futureAmount),
        p.monthlySIP != null ? dMoney(p.monthlySIP) : "Too soon",
      ]),
      [58, 18, 34, 34, CW - 144],
      { align: ["left", "left", "right", "right", "right"] },
    );
    const totalGoals = input.goalProjections.reduce((s, p) => s + (p.monthlySIP ?? 0), 0);
    const fireSip = sip ?? 0;
    callout(
      `Total to save each month: ${dualMoney(fireSip + totalGoals)}`,
      `${dMoney(fireSip)} for freedom + ${dMoney(totalGoals)} for your goals.`,
      "info",
    );
  }

  if (input.windfalls && input.windfalls.length > 0) {
    sectionTitle(
      "Money you expect to receive",
      "Lump sums like end-of-service pay are already counted in your plan - they lower what you need to save each month.",
    );
    table(
      ["What", "Year", "Amount", `Worth at ${fr.freedomAge}`],
      input.windfalls.map((w) => {
        return [
          { text: readableName(w.windfall.name, windfallCategoryMeta(w.windfall.category).label), bold: true },
          String(w.windfall.targetYear),
          dMoney(w.windfall.amount),
          dMoney(w.valueAtRetirement),
        ];
      }),
      [72, 22, 40, CW - 134],
      { align: ["left", "left", "right", "right"] },
    );
  }

  if (isExpat && dest.code === "IN") {
    callout(
      "Moving back to India? Use your tax-free window",
      "After many years abroad you usually get up to 2 financial years (sometimes 3) as an RNOR, when income and gains earned outside India are not taxed in India. Sell foreign investments and bring the money home in this window. Check the exact dates with a tax adviser before you move.",
      "info",
    );
  }

  sectionTitle("The numbers behind this plan", "Change any of these in the app and the plan updates instantly.");
  {
    const rate = convertCurrency(1, res, dest);
    const rows: Array<[string, string]> = [
      ["Monthly take-home pay", rMoney(input.user.monthlyIncome)],
      ["Part you save", `${Math.round(input.savingsRate * 100)}% (${rMoney(monthlyInvestRes)} a month)`],
      ["Money already invested", input.currentCorpus > 0 ? rMoney(input.currentCorpus) : "Nothing yet - that's fine"],
      ["Household", fr.householdSize === "family" ? "Family" : "Just me"],
      [
        "Yearly spending today",
        `${dMoney(fr.currentAnnualExpenses)} - ${
          fr.expenseBasis === "override"
            ? "your own figure"
            : fr.expenseBasis === "income"
              ? "based on your pay"
              : `typical for ${fr.cityName ?? the(dest.name)}`
        }`,
      ],
      ["Prices rising (inflation)", `${(fr.inflationRateUsed * 100).toFixed(1)}% a year`],
      ["Expected growth of investments", `${(input.allocation.expectedReturn * 100).toFixed(1)}% a year`],
      ["Stop-work goal", `Age ${fr.freedomAge}`],
    ];
    if (isExpat) {
      const destPrefix = PDF_PREFIX[dest.currency] ?? `${dest.currency} `;
      rows.push([
        "Exchange rate used",
        `1 ${res.currency} = ${destPrefix}${rate.toFixed(rate < 1 ? 4 : 2)} (rates change every day)`,
      ]);
    }
    if (input.survivalRate != null) {
      rows.push(["Chance the money lasts to 95", `${Math.round(input.survivalRate * 100)}% (1,000 market simulations)`]);
    }
    rows.forEach(([k, v], i) => {
      font(9.5, "normal");
      const vLines = wrap(v, CW - 72);
      const h = vLines.length * lineH(9.5) + 3.5;
      ensure(h);
      if (i % 2 === 0) {
        doc.setFillColor(...PANEL);
        doc.rect(M, y - 4.2, CW, h, "F");
      }
      font(9.5, "normal", MUTED);
      text(k, M + 3, y);
      font(9.5, "bold", INK);
      text(vLines, M + 70, y);
      y += h;
    });
    y += 5;
  }

  sectionTitle("Words used in this plan");
  {
    const words: Array<[string, string]> = [
      ["FIRE", "Financial Independence, Retire Early. Having enough saved that work becomes a choice, not a need."],
      ["FIRE number", "The total you need invested so its growth can pay your bills for life."],
      ["Monthly investment (SIP)", "A fixed amount invested automatically every month, like a bill you pay to your future self."],
      ["Inflation", `Prices going up every year. ${pdfMoney(100, dest)} of shopping today will cost about ${pdfMoney(100 * Math.pow(1 + fr.inflationRateUsed, 10), dest, { exact: true })} in 10 years.`],
      ["Shares", "Small pieces of real companies. They swing up and down but grow the most over many years."],
      ["Bonds and deposits", "Lending money for fixed interest. Slower, but steadier - they cushion the bad years."],
    ];
    words.forEach(([term, def]) => {
      font(9, "normal");
      const lines = wrap(def, CW - 52);
      const h = lines.length * lineH(9) + 2.5;
      ensure(h);
      font(9, "bold", INK);
      text(term, M, y);
      font(9, "normal", BODY);
      text(lines, M + 50, y);
      y += h;
    });
    y += 4;
  }

  // ---- Keep in mind + disclaimer ------------------------------------------------
  const accounts = res.taxAdvantagedAccounts
    .map((a) => pdfSafe(a.name).trim())
    .filter(Boolean)
    .slice(0, 3);
  sectionTitle("Keep in mind");
  const tips = [
    accounts.length
      ? `Find out which tax-saving or workplace schemes you can use in ${the(res.name)} - for example ${accounts.join(", ")}.`
      : null,
    `If your real spending is different from the typical figure above, enter your own number in the app - it makes the plan much more accurate.`,
    isExpat
      ? `Exchange rates move. Keep a little extra (10-15%) as a cushion because you earn in ${res.currency} but will spend in ${dest.currency}.`
      : null,
    `Never stop your monthly investment because the market fell. Falls are when your money buys the most.`,
  ].filter((t): t is string => !!t);
  tips.forEach((tip) => {
    font(9.5, "normal");
    const lines = wrap(tip, CW - 7);
    ensure(lines.length * lineH(9.5) + 2);
    doc.setFillColor(...ORANGE);
    doc.circle(M + 1.2, y - 1.2, 0.9, "F");
    font(9.5, "normal", BODY);
    text(lines, M + 5, y);
    y += lines.length * lineH(9.5) + 2;
  });
  y += 4;

  {
    const disclaimer =
      "This plan is an educational estimate, not financial advice. It uses average figures for your country, which may be out of date, and markets do not move in straight lines - real returns, prices and exchange rates will differ. Before investing, speak to a licensed adviser (SEBI in India, SCA or DFSA in the UAE, CMA in Saudi Arabia, FCA in the UK, SEC in the US). Past performance does not guarantee future returns.";
    font(8, "normal");
    const lines = wrap(disclaimer, CW - 10);
    const h = 10 + (lines.length - 1) * lineH(8) + 5;
    ensure(h);
    doc.setFillColor(...PANEL);
    doc.setDrawColor(...LINE);
    doc.setLineWidth(0.3);
    doc.roundedRect(M, y, CW, h, 2, 2, "FD");
    font(8, "bold", BODY);
    text("Important", M + 5, y + 5.5);
    font(8, "normal", MUTED);
    text(lines, M + 5, y + 10);
    y += h;
  }

  // ---- Footers on every page -------------------------------------------------------
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setDrawColor(...LINE);
    doc.setLineWidth(0.3);
    doc.line(M, H - 13, W - M, H - 13);
    font(7.5, "normal", MUTED);
    text("BCR FIRE by BibinCutRiver  ·  Educational guide only, not financial advice", M, H - 8);
    text(`Page ${i} of ${pageCount}`, W - M, H - 8, { align: "right" });
  }

  return doc;
}

/** "United Arab Emirates" → "the United Arab Emirates". */
function the(countryName: string): string {
  return /^(United|Philippines|Netherlands)/.test(countryName) ? `the ${countryName}` : countryName;
}

/**
 * User-typed names may be in Malayalam, Hindi or Arabic, which the PDF font
 * cannot draw. Lead with the English category so the row still makes sense.
 */
function readableName(name: string, categoryLabel: string): string {
  const safe = pdfSafe(name).trim();
  const lostLetters = /\p{L}/u.test(name.replace(/[\x20-\x7e\xa0-\xff]/g, ""));
  const keptLetters = (safe.match(/[A-Za-z]/g) ?? []).length;
  if (keptLetters < 2) return categoryLabel;
  return lostLetters ? `${categoryLabel} ${safe}` : safe;
}

/** Round up to a "nice" axis maximum (1, 2, 2.5, 5 × 10^n). */
function niceCeil(v: number): number {
  if (v <= 0) return 1;
  const exp = Math.pow(10, Math.floor(Math.log10(v)));
  const f = v / exp;
  const nice = f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10;
  return nice * exp;
}

/** Build the plan and trigger the browser download. */
export async function generatePlanPDF(input: PlanPDFInput): Promise<void> {
  const doc = await buildPlanPDF(input);
  const today = new Date().toISOString().slice(0, 10);
  doc.save(`BCR_FIRE_Plan_${input.destinationCountry.code}_${today}.pdf`);
}
