import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Calculator,
  Calendar,
  CheckCircle2,
  Flag,
  Globe2,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Term } from "@/components/ui/term";
import {
  assessResidency,
  compareNREvsNRO,
  estimateRNORTaxSavings,
  marginalRateForIncome,
  projectRNORWindow,
} from "@/lib/nriTax";

const CURRENT_FY = (() => {
  const now = new Date();
  // Indian FY runs 1 Apr → 31 Mar. If month < Apr (0,1,2 = Jan/Feb/Mar), FY is previous calendar year.
  return now.getMonth() < 3 ? now.getFullYear() - 1 : now.getFullYear();
})();

/**
 * Interactive NRI tax calculator — Indian residency determination + RNOR
 * window + NRE/NRO comparison + tax savings estimate.
 *
 * This is BCR FIRE's "why we exist" moment for the UAE / Gulf / global
 * NRI who's planning a return. No other FIRE tool models it; nriretirewise.com
 * has it behind a Pro paywall. This one is free.
 */
export function NRITaxCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Flag className="h-5 w-5 text-saffron" style={{ color: "#ff9933" }} />
          NRI tax calculator
          <span className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
            Section 6 + RNOR
          </span>
        </CardTitle>
        <CardDescription>
          Four tools in one: figure out your Indian residency for the current FY, project your
          RNOR window after a planned return, compare NRE vs NRO deposit yields, and estimate
          how much Indian tax you save by moving foreign assets during RNOR.{" "}
          <strong>Educational — confirm with a CA before acting.</strong>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="residency">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
            <TabsTrigger value="residency">
              <Calculator className="mr-1 h-3.5 w-3.5" /> Status
            </TabsTrigger>
            <TabsTrigger value="rnor">
              <Calendar className="mr-1 h-3.5 w-3.5" /> RNOR window
            </TabsTrigger>
            <TabsTrigger value="nre-nro">
              <TrendingUp className="mr-1 h-3.5 w-3.5" /> NRE vs NRO
            </TabsTrigger>
            <TabsTrigger value="savings">
              <Globe2 className="mr-1 h-3.5 w-3.5" /> Tax saved
            </TabsTrigger>
          </TabsList>

          <TabsContent value="residency" className="mt-4">
            <ResidencyCalculator />
          </TabsContent>
          <TabsContent value="rnor" className="mt-4">
            <RNORWindowCalculator />
          </TabsContent>
          <TabsContent value="nre-nro" className="mt-4">
            <NREvsNROCalculator />
          </TabsContent>
          <TabsContent value="savings" className="mt-4">
            <RNORSavingsCalculator />
          </TabsContent>
        </Tabs>

        <div className="mt-6 flex items-start gap-2 rounded-lg border border-amber-500/40 bg-amber-500/5 p-3 text-xs">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <div>
            <p className="font-semibold text-amber-700 dark:text-amber-300">
              Important — this is an educational estimator.
            </p>
            <p className="mt-0.5 text-muted-foreground">
              India's residency rules change (last big revision: Finance Act 2020 — ₹15 L
              threshold + 120-day rule). CBDT circulars + treaty tie-breakers can override
              defaults. Always confirm your status with a <strong>Chartered Accountant</strong>{" "}
              before relocating or repatriating foreign assets. Numbers below assume FY
              2024-25 slabs and the current statutory day-counts.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ===========================================================================
// 1. Residency Calculator
// ===========================================================================

function ResidencyCalculator() {
  const [daysThisFY, setDaysThisFY] = useState(90);
  const [daysLast4, setDaysLast4] = useState<[number, number, number, number]>([
    80, 60, 40, 40,
  ]);
  const [isIndianCitizen, setIsIndianCitizen] = useState(true);
  const [indianIncomeL, setIndianIncomeL] = useState(5); // ₹ lakhs
  const [taxedElsewhere, setTaxedElsewhere] = useState(true);
  const [nr9of10, setNr9of10] = useState(true);
  const [daysLast7, setDaysLast7] = useState(600);

  const result = useMemo(
    () =>
      assessResidency({
        daysInCurrentFY: daysThisFY,
        daysInPrecedingFYs: daysLast4,
        isIndianCitizenOrPIO: isIndianCitizen,
        returningFromEmployment: false,
        indianIncomeINR: indianIncomeL * 1_00_000,
        taxedInAnotherCountry: taxedElsewhere,
        nonResidentIn9of10LastYrs: nr9of10,
        daysInLast7Years: daysLast7,
      }),
    [daysThisFY, daysLast4, isIndianCitizen, indianIncomeL, taxedElsewhere, nr9of10, daysLast7],
  );

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Your Indian tax residency for FY {CURRENT_FY}-{String(CURRENT_FY + 1).slice(2)}. Tweak
        the inputs — the status updates live.
      </p>

      {/* Days inputs */}
      <div className="grid gap-3 sm:grid-cols-2">
        <SliderBlock
          label={`Days in India this FY (${daysThisFY})`}
          value={daysThisFY}
          onChange={setDaysThisFY}
          min={0}
          max={365}
          hint="Count ALL days you were physically present — including arrival + departure days."
        />
        <SliderBlock
          label={`Days in last 7 FYs total (${daysLast7})`}
          value={daysLast7}
          onChange={setDaysLast7}
          min={0}
          max={2555}
          hint="If ≤ 729, you qualify for RNOR under one of the Section 6(6) tests."
        />
      </div>

      <div>
        <Label className="text-xs">Days in each of the preceding 4 FYs</Label>
        <div className="mt-1 grid grid-cols-4 gap-2">
          {daysLast4.map((d, i) => (
            <Input
              key={i}
              type="number"
              min={0}
              max={365}
              value={d}
              onChange={(e) => {
                const copy = [...daysLast4] as [number, number, number, number];
                copy[i] = Number(e.target.value) || 0;
                setDaysLast4(copy);
              }}
              className="bg-background text-sm"
              aria-label={`Days in FY -${i + 1}`}
            />
          ))}
        </div>
        <p className="mt-1 text-[11px] text-muted-foreground">
          Total: <strong>{daysLast4.reduce((a, b) => a + b, 0)}</strong> days.{" "}
          {daysLast4.reduce((a, b) => a + b, 0) >= 365 ? "≥ 365 ✓" : "< 365"} — the 60+365
          test requires ≥ 365.
        </p>
      </div>

      {/* Flags */}
      <div className="grid gap-2 sm:grid-cols-2">
        <YesNoRow
          label="Indian citizen or PIO?"
          value={isIndianCitizen}
          onChange={setIsIndianCitizen}
        />
        <YesNoRow
          label="Taxed as resident in another country?"
          value={taxedElsewhere}
          onChange={setTaxedElsewhere}
          hint="If NO + Indian income > ₹15L → deemed-resident rule may apply."
        />
        <div className="space-y-1">
          <Label htmlFor="ind-inc" className="text-xs">
            Indian-source income this FY (₹ lakhs)
          </Label>
          <Input
            id="ind-inc"
            type="number"
            min={0}
            value={indianIncomeL}
            onChange={(e) => setIndianIncomeL(Number(e.target.value) || 0)}
            className="bg-background text-sm"
          />
          <p className="text-[11px] text-muted-foreground">
            Interest on NRO, rent, Indian dividends. The ₹15 L mark triggers the Finance
            Act 2020 120-day rule.
          </p>
        </div>
        <YesNoRow
          label="Were you non-resident in 9 of last 10 FYs?"
          value={nr9of10}
          onChange={setNr9of10}
          hint="One of two RNOR qualifying tests."
        />
      </div>

      {/* RESULT */}
      <ResultBanner status={result.status} explanation={result.explanation}>
        <p className="mt-1 text-[11px] text-muted-foreground">
          Triggered by: <em>{result.triggeredBy}</em>
          {result.deemedResident && (
            <span className="ml-2 rounded-full bg-amber-500/15 px-2 py-0.5 text-amber-700 dark:text-amber-300">
              Deemed resident
            </span>
          )}
        </p>
      </ResultBanner>
    </div>
  );
}

// ===========================================================================
// 2. RNOR Window Projection
// ===========================================================================

function RNORWindowCalculator() {
  const [returnFY, setReturnFY] = useState(CURRENT_FY + 1);
  const [nrYears, setNrYears] = useState(10);
  const [avgDays, setAvgDays] = useState(60);

  const projection = useMemo(
    () =>
      projectRNORWindow({
        returnFY,
        nonResidentFYsInLast10: nrYears,
        avgDaysPerYearAsNRI: avgDays,
      }),
    [returnFY, nrYears, avgDays],
  );

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Project your <Term k="RNOR">RNOR</Term> window after a planned return. The 2 FYs
        immediately after return are usually RNOR — this is <strong>the window</strong> to
        liquidate foreign assets without Indian tax.
      </p>

      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <Label htmlFor="r-fy" className="text-xs">
            FY of permanent return
          </Label>
          <Input
            id="r-fy"
            type="number"
            min={CURRENT_FY}
            max={CURRENT_FY + 20}
            value={returnFY}
            onChange={(e) => setReturnFY(Number(e.target.value) || CURRENT_FY + 1)}
            className="bg-background"
          />
          <p className="mt-1 text-[11px] text-muted-foreground">
            FY {returnFY}-{String(returnFY + 1).slice(2)} starts on 1 April {returnFY}.
          </p>
        </div>
        <SliderBlock
          label={`Non-resident in ${nrYears} of last 10 FYs`}
          value={nrYears}
          onChange={setNrYears}
          min={0}
          max={10}
          hint="Classic long-term NRI = 9 or 10."
        />
        <SliderBlock
          label={`Avg days in India per NRI yr (${avgDays})`}
          value={avgDays}
          onChange={setAvgDays}
          min={0}
          max={180}
          hint="Lower = better for RNOR qualifying."
        />
      </div>

      {/* Timeline */}
      <div>
        <h4 className="mb-2 text-sm font-semibold">Your 5-FY timeline post-return</h4>
        <div className="grid grid-cols-5 gap-1 overflow-hidden rounded-md border border-border">
          {[0, 1, 2, 3, 4].map((offset) => {
            const fy = returnFY + offset;
            const isRNOR = projection.rnorFYs.includes(fy);
            const isROR = fy >= projection.rorFromFY;
            const bg = isRNOR
              ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/40"
              : isROR
                ? "bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/30"
                : "bg-muted/30 text-muted-foreground";
            const label = isRNOR ? "RNOR" : isROR ? "ROR" : "—";
            return (
              <div key={offset} className={`border p-2 text-center ${bg}`}>
                <p className="text-[11px] text-muted-foreground">
                  FY {fy}-{String(fy + 1).slice(2)}
                </p>
                <p className="text-sm font-bold">{label}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/5 p-3">
        <p className="flex items-center gap-1.5 text-sm font-semibold">
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          {projection.rnorFYs.length > 0
            ? `${projection.rnorFYs.length} RNOR FY${projection.rnorFYs.length === 1 ? "" : "s"} available`
            : "No RNOR window — ROR immediately"}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">{projection.explanation}</p>
        {projection.rnorFYs.length > 0 && (
          <ul className="mt-2 list-disc space-y-0.5 pl-5 text-[11px] text-muted-foreground">
            <li>
              Repatriate foreign salary, bonuses, severance before FY {projection.rorFromFY}.
            </li>
            <li>Sell foreign stocks / mutual funds — LTCG not taxable in India during RNOR.</li>
            <li>Close foreign bank accounts (interest income excluded).</li>
            <li>Convert NRE deposits — they lose tax-free status when you become ROR.</li>
          </ul>
        )}
      </div>
    </div>
  );
}

// ===========================================================================
// 3. NRE vs NRO Comparison
// ===========================================================================

function NREvsNROCalculator() {
  const [principal, setPrincipal] = useState(50_00_000); // ₹50 L
  const [rate, setRate] = useState(7); // 7%
  const [slabPct, setSlabPct] = useState(30);

  const r = useMemo(
    () =>
      compareNREvsNRO({
        principalINR: principal,
        interestRate: rate / 100,
        marginalTaxRate: slabPct / 100,
      }),
    [principal, rate, slabPct],
  );

  const diff = r.nreNetInterest - r.nroNetInterest;

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        NRE accounts earn <strong>tax-free interest</strong> for non-residents and are fully
        repatriable. NRO interest is taxed at your <strong>marginal slab + TDS</strong>. Use
        this to see the yield gap on your deposit.
      </p>

      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <Label htmlFor="n-prin" className="text-xs">
            Deposit amount (₹)
          </Label>
          <Input
            id="n-prin"
            type="number"
            min={0}
            value={principal}
            onChange={(e) => setPrincipal(Number(e.target.value) || 0)}
            className="bg-background"
          />
        </div>
        <SliderBlock
          label={`Interest rate (${rate.toFixed(1)}%)`}
          value={Math.round(rate * 10)}
          onChange={(v) => setRate(v / 10)}
          min={30}
          max={90}
          hint="Typical NRE/NRO rate 6.5–8%."
        />
        <SliderBlock
          label={`Marginal tax rate (${slabPct}%)`}
          value={slabPct}
          onChange={setSlabPct}
          min={0}
          max={30}
          step={5}
          hint="New-regime slab for Indian income."
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <MetricTile
          label="NRE account"
          value={`₹ ${Math.round(r.nreNetInterest).toLocaleString()} / yr`}
          hint={`Effective yield ${(r.nreEffectiveYield * 100).toFixed(2)}% — tax-free + repatriable`}
          accent="emerald"
        />
        <MetricTile
          label="NRO account"
          value={`₹ ${Math.round(r.nroNetInterest).toLocaleString()} / yr`}
          hint={`Effective yield ${(r.nroEffectiveYield * 100).toFixed(2)}% — after ${slabPct}% tax`}
          accent="amber"
        />
      </div>

      <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 text-xs">
        <p className="font-semibold">Verdict</p>
        <p className="mt-1 text-muted-foreground">
          NRE earns you{" "}
          <strong className="text-foreground">
            ₹ {Math.round(diff).toLocaleString()} / yr
          </strong>{" "}
          more on the same deposit. On a 10-year horizon, that's{" "}
          <strong className="text-foreground">
            ₹ {Math.round(diff * 10).toLocaleString()}
          </strong>{" "}
          of tax drag avoided. Prefer NRE when funding from foreign salary; NRO is only
          mandatory for Indian-source income (rent, Indian dividends).
        </p>
      </div>
    </div>
  );
}

// ===========================================================================
// 4. RNOR Window Tax Savings
// ===========================================================================

function RNORSavingsCalculator() {
  const [foreignIncomeL, setForeignIncomeL] = useState(25); // ₹25L
  const [rnorYears, setRnorYears] = useState(2);
  const [slabPct, setSlabPct] = useState(30);

  const r = useMemo(
    () =>
      estimateRNORTaxSavings({
        foreignIncomeINR: foreignIncomeL * 1_00_000,
        rnorYears,
        marginalTaxRate: slabPct / 100,
      }),
    [foreignIncomeL, rnorYears, slabPct],
  );

  const suggested = marginalRateForIncome(foreignIncomeL * 1_00_000) * 100;

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        If you have significant foreign income during your RNOR window, the Indian tax saved
        is often enough to pay for an international move several times over. This is the
        single biggest financial reason to time your return carefully.
      </p>

      <div className="grid gap-3 sm:grid-cols-3">
        <SliderBlock
          label={`Annual foreign income (${foreignIncomeL} L)`}
          value={foreignIncomeL}
          onChange={setForeignIncomeL}
          min={0}
          max={200}
          hint="Foreign salary + dividends + capital gains + bank interest."
        />
        <SliderBlock
          label={`RNOR years (${rnorYears})`}
          value={rnorYears}
          onChange={setRnorYears}
          min={0}
          max={3}
          hint="Usually 2 for long-term NRIs; 0–1 otherwise."
        />
        <SliderBlock
          label={`Marginal slab (${slabPct}%)`}
          value={slabPct}
          onChange={setSlabPct}
          min={0}
          max={30}
          step={5}
          hint={`Suggested from income: ${suggested.toFixed(0)}%`}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <MetricTile
          label="Foreign income shielded"
          value={`₹ ${Math.round(r.totalForeignIncome / 1_00_000).toLocaleString()} L`}
          hint={`${rnorYears} FY × ₹${foreignIncomeL} L / yr`}
          accent="emerald"
        />
        <MetricTile
          label="Indian tax saved"
          value={`₹ ${Math.round(r.totalTaxSaved / 1_00_000).toLocaleString()} L`}
          hint={`At ${slabPct}% marginal rate`}
          accent="emerald"
          emphasise
        />
      </div>

      <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/5 p-3 text-xs">
        <p className="font-semibold">What to do during your RNOR window</p>
        <ol className="mt-1 list-decimal space-y-0.5 pl-5 text-muted-foreground">
          <li>Realise foreign capital gains early — not taxed in India as RNOR.</li>
          <li>Receive deferred bonuses + severance from previous employer.</li>
          <li>Transfer foreign savings to Indian NRE account before FY {CURRENT_FY + 2}.</li>
          <li>Keep records of RNOR qualification — expect an Income Tax Department query 2–3 FYs later.</li>
          <li>File Form FA (Foreign Assets schedule) even if income is RNOR-exempt.</li>
        </ol>
      </div>
    </div>
  );
}

// ===========================================================================
// Small UI building blocks
// ===========================================================================

function SliderBlock({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  hint,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
  hint?: string;
}) {
  return (
    <div>
      <Label className="text-xs">{label}</Label>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={([v]) => onChange(v)}
        className="mt-2"
        aria-label={label}
      />
      {hint && <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

function YesNoRow({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
  hint?: string;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      <Select value={value ? "yes" : "no"} onValueChange={(v) => onChange(v === "yes")}>
        <SelectTrigger className="bg-background">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="yes">Yes</SelectItem>
          <SelectItem value="no">No</SelectItem>
        </SelectContent>
      </Select>
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

function ResultBanner({
  status,
  explanation,
  children,
}: {
  status: "NR" | "RNOR" | "ROR";
  explanation: string;
  children?: React.ReactNode;
}) {
  const map = {
    NR: {
      border: "border-emerald-500/40 bg-emerald-500/5",
      text: "text-emerald-700 dark:text-emerald-300",
      label: "NR — Non-Resident",
    },
    RNOR: {
      border: "border-blue-500/40 bg-blue-500/5",
      text: "text-blue-700 dark:text-blue-300",
      label: "RNOR — Resident, Not Ordinarily Resident",
    },
    ROR: {
      border: "border-amber-500/40 bg-amber-500/5",
      text: "text-amber-700 dark:text-amber-300",
      label: "ROR — Resident & Ordinarily Resident",
    },
  }[status];
  return (
    <div className={`rounded-lg border-2 p-3 ${map.border}`}>
      <p className={`text-sm font-bold ${map.text}`}>{map.label}</p>
      <p className="mt-1 text-xs text-muted-foreground">{explanation}</p>
      {children}
    </div>
  );
}

function MetricTile({
  label,
  value,
  hint,
  accent,
  emphasise,
}: {
  label: string;
  value: string;
  hint: string;
  accent: "emerald" | "amber";
  emphasise?: boolean;
}) {
  const color =
    accent === "emerald"
      ? "text-emerald-600 dark:text-emerald-400"
      : "text-amber-600 dark:text-amber-400";
  const border = emphasise
    ? "border-2 border-emerald-500/50 bg-emerald-500/5"
    : "border border-border bg-card";
  return (
    <div className={`rounded-lg p-3 ${border}`}>
      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={`mt-1 text-base font-bold tabular-nums sm:text-lg ${color}`}>{value}</p>
      <p className="mt-0.5 text-[11px] text-muted-foreground">{hint}</p>
    </div>
  );
}
