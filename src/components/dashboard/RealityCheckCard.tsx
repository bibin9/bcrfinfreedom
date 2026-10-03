import { useMemo, useState } from "react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertTriangle,
  CheckCircle2,
  Dice5,
  Flame,
  Info,
  ShieldCheck,
  TrendingDown,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Term } from "@/components/ui/term";
import type { CountryProfile, FreedomProjection, RiskProfile } from "@/types";
import { formatCurrency } from "@/lib/formatters";
import { simulateDrawdown, volatilityFromRisk } from "@/lib/drawdown";

interface Props {
  destinationCountry: CountryProfile;
  projection: FreedomProjection;
  risk: RiskProfile;
  expectedReturn: number;
}

/**
 * The Retirement Reality Check tab answers: "Will my money actually last?"
 *
 * Deterministic drawdown + 1,000-path Monte Carlo + Guyton-Klinger
 * guardrails. All math lives in `lib/drawdown.ts`; this file is UI only.
 */
export function RealityCheckCard({
  destinationCountry,
  projection,
  risk,
  expectedReturn,
}: Props) {
  const [withdrawalPct, setWithdrawalPct] = useState(4); // % per year
  const [endAge, setEndAge] = useState(95);

  const retirementAge = projection.freedomAge;
  const startingCorpus = projection.targetCorpus;
  // Current (future-value) annual expenses at retirement age.
  const firstYearExpenses = (startingCorpus * withdrawalPct) / 100;
  const volatility = volatilityFromRisk(risk);

  const result = useMemo(
    () =>
      simulateDrawdown({
        startingCorpus,
        firstYearExpenses,
        retirementAge,
        endAge,
        expectedReturn,
        returnVolatility: volatility,
        inflationRate: destinationCountry.inflationRate,
        nPaths: 1000,
      }),
    [
      startingCorpus,
      firstYearExpenses,
      retirementAge,
      endAge,
      expectedReturn,
      volatility,
      destinationCountry.inflationRate,
    ],
  );

  const survivalPct = Math.round(result.monteCarlo.successRate * 100);
  const detDepletedAge = result.deterministic.depletedAtAge;
  const medianDepletion = result.monteCarlo.medianDepletionAge;

  const headlineTone: "emerald" | "amber" | "red" =
    survivalPct >= 90 ? "emerald" : survivalPct >= 70 ? "amber" : "red";
  const headline =
    survivalPct >= 90
      ? `✅ Your money lasts to age ${endAge} in ${survivalPct}% of scenarios.`
      : survivalPct >= 70
        ? `⏳ Your money lasts to age ${endAge} in ${survivalPct}% of scenarios — borderline.`
        : `⚠️ Your money runs out before ${endAge} in ${100 - survivalPct}% of scenarios.`;
  const subline =
    survivalPct >= 90
      ? `You're in strong shape. The 10th-percentile (bad-luck) path still leaves you with money.`
      : survivalPct >= 70
        ? `Historically survivable but fragile. A bad first decade of market returns could end it. Consider trimming spending by 10% or working 1–2 years longer.`
        : `The ${withdrawalPct}% withdrawal rate is too aggressive for a ${endAge - retirementAge}-year retirement. Try 3.5% or retire 3 years later.`;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-blue-500" />
          Retirement reality check
          <span className="ml-auto rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Will my money last?
          </span>
        </CardTitle>
        <CardDescription>
          You hit your <Term>FIRE number</Term> at age {retirementAge}. Now what? This simulates{" "}
          <strong>1,000 possible futures</strong> — different market returns, different
          inflation years — and tells you the odds your money actually lasts.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* HEADLINE */}
        <HeadlineBanner tone={headlineTone} headline={headline} subline={subline} />

        {/* KEY METRICS */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
          <MetricTile
            icon={<Dice5 className="h-4 w-4" />}
            label="Monte Carlo survival"
            value={`${survivalPct}%`}
            hint={`${result.monteCarlo.nPaths} randomised return paths`}
            accent={headlineTone}
          />
          <MetricTile
            icon={<Flame className="h-4 w-4" />}
            label="Deterministic finish"
            value={
              detDepletedAge != null ? `Runs out at ${detDepletedAge}` : `Lasts past ${endAge}`
            }
            hint={
              detDepletedAge != null ? "At average returns" : `Still ${formatCurrency(result.deterministic.finalCorpus, destinationCountry, { compact: true })} at ${endAge}`
            }
            accent={detDepletedAge != null && detDepletedAge < endAge ? "red" : "emerald"}
          />
          <MetricTile
            icon={<TrendingDown className="h-4 w-4" />}
            label="If it fails, median age"
            value={medianDepletion != null ? `${medianDepletion}` : `—`}
            hint={medianDepletion != null ? "Across depleted paths" : "No failures"}
            accent={medianDepletion != null ? "amber" : "emerald"}
          />
          <MetricTile
            icon={<ShieldCheck className="h-4 w-4" />}
            label="Withdrawal zone"
            value={result.guardrails.zone.toUpperCase()}
            hint={`WR ${(result.guardrails.initialWithdrawalRate * 100).toFixed(2)}% / yr`}
            accent={
              result.guardrails.zone === "bonus" || result.guardrails.zone === "green"
                ? "emerald"
                : result.guardrails.zone === "amber"
                  ? "amber"
                  : "red"
            }
          />
        </div>

        {/* MONTE CARLO CHART */}
        <div>
          <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
            <Dice5 className="h-4 w-4 text-blue-500" />
            Corpus over time — 10 / 50 / 90 percentile bands
          </h3>
          <p className="mb-2 text-[11px] text-muted-foreground">
            The band shows the range of possible outcomes.
            <strong className="text-foreground"> P10 = bad-luck case</strong> (worst 10%),{" "}
            <strong className="text-foreground">P50 = median</strong>,{" "}
            <strong className="text-foreground">P90 = good-luck case</strong> (top 10%). If the
            P10 line dips to zero, your retirement is fragile.
          </p>
          <MonteCarloChart result={result} country={destinationCountry} />
        </div>

        {/* GUARDRAIL CALLOUT */}
        <GuardrailBanner guardrails={result.guardrails} />

        {/* CONTROLS */}
        <div className="rounded-lg border border-border p-3">
          <h3 className="mb-3 flex items-center gap-1.5 text-sm font-semibold">
            <Info className="h-4 w-4 text-muted-foreground" />
            Try different scenarios
          </h3>
          <div className="space-y-4">
            <div>
              <div className="mb-1 flex items-center justify-between">
                <Label htmlFor="wr">Withdrawal rate per year</Label>
                <span className="text-sm font-semibold text-primary tabular-nums">
                  {withdrawalPct.toFixed(1)}%
                </span>
              </div>
              <Slider
                id="wr"
                value={[withdrawalPct * 10]}
                min={20} // 2.0%
                max={70} // 7.0%
                step={1}
                onValueChange={([v]) => setWithdrawalPct(v / 10)}
                aria-label="Withdrawal rate"
              />
              <p className="mt-1 text-[11px] text-muted-foreground">
                4% is the classic FIRE anchor. Try 3% for an ultra-safe plan, 5% to see when
                things get risky.
              </p>
            </div>
            <div>
              <div className="mb-1 flex items-center justify-between">
                <Label htmlFor="end">Plan until age</Label>
                <span className="text-sm font-semibold text-primary tabular-nums">
                  {endAge}
                </span>
              </div>
              <Slider
                id="end"
                value={[endAge]}
                min={75}
                max={105}
                step={1}
                onValueChange={([v]) => setEndAge(v)}
                aria-label="End age"
              />
              <p className="mt-1 text-[11px] text-muted-foreground">
                Default 95. If you have long-lived parents, consider 100+.
              </p>
            </div>
          </div>
        </div>

        {/* ASSUMPTIONS */}
        <details className="rounded-md border border-border bg-muted/30 p-3 text-xs">
          <summary className="cursor-pointer font-medium">
            How does the simulation work? (click to expand)
          </summary>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
            <li>
              <strong>Starting corpus:</strong>{" "}
              {formatCurrency(startingCorpus, destinationCountry, { compact: true })} — your
              projected FIRE number at age {retirementAge}.
            </li>
            <li>
              <strong>Year-1 spending:</strong>{" "}
              {formatCurrency(firstYearExpenses, destinationCountry, { compact: true })} —{" "}
              {withdrawalPct}% of starting corpus. Each year's spend inflates at ~
              {(destinationCountry.inflationRate * 100).toFixed(1)}% + random noise.
            </li>
            <li>
              <strong>Returns:</strong> normally distributed around{" "}
              {(expectedReturn * 100).toFixed(1)}% mean with{" "}
              {(volatility * 100).toFixed(0)}% volatility (based on your {risk} risk profile).
            </li>
            <li>
              <strong>Monte Carlo:</strong> 1,000 independent paths. Success % = fraction of
              paths that still have money at age {endAge}.
            </li>
            <li>
              <strong>Guardrails:</strong> based on <Term k="4% rule">Guyton-Klinger</Term>{" "}
              dynamic withdrawal rules.
            </li>
          </ul>
        </details>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------

function HeadlineBanner({
  tone,
  headline,
  subline,
}: {
  tone: "emerald" | "amber" | "red";
  headline: string;
  subline: string;
}) {
  const borderClass =
    tone === "emerald"
      ? "border-emerald-500/40 bg-emerald-500/5"
      : tone === "red"
        ? "border-red-500/40 bg-red-500/5"
        : "border-amber-500/40 bg-amber-500/5";
  const textClass =
    tone === "emerald"
      ? "text-emerald-700 dark:text-emerald-300"
      : tone === "red"
        ? "text-red-700 dark:text-red-300"
        : "text-amber-700 dark:text-amber-300";
  return (
    <div className={`rounded-lg border-2 p-3 sm:p-4 ${borderClass}`}>
      <p className={`text-sm font-bold sm:text-base ${textClass}`}>{headline}</p>
      <p className="mt-1 text-xs text-muted-foreground sm:text-sm">{subline}</p>
    </div>
  );
}

function MetricTile({
  icon,
  label,
  value,
  hint,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint: string;
  accent: "emerald" | "amber" | "red";
}) {
  const color =
    accent === "emerald"
      ? "text-emerald-600 dark:text-emerald-400"
      : accent === "red"
        ? "text-red-600 dark:text-red-400"
        : "text-amber-600 dark:text-amber-400";
  return (
    <div className="rounded-md border border-border bg-card p-3">
      <p className="flex items-center gap-1 text-[11px] uppercase tracking-wider text-muted-foreground">
        {icon} {label}
      </p>
      <p className={`mt-1 text-base font-bold tabular-nums sm:text-lg ${color}`}>{value}</p>
      <p className="mt-0.5 text-[11px] text-muted-foreground">{hint}</p>
    </div>
  );
}

function GuardrailBanner({
  guardrails,
}: {
  guardrails: ReturnType<typeof simulateDrawdown>["guardrails"];
}) {
  const tone =
    guardrails.zone === "bonus" || guardrails.zone === "green"
      ? "emerald"
      : guardrails.zone === "amber"
        ? "amber"
        : "red";
  const Icon = tone === "emerald" ? CheckCircle2 : AlertTriangle;
  const colors = {
    emerald: "border-emerald-500/40 bg-emerald-500/5 text-emerald-700 dark:text-emerald-300",
    amber: "border-amber-500/40 bg-amber-500/5 text-amber-700 dark:text-amber-300",
    red: "border-red-500/40 bg-red-500/5 text-red-700 dark:text-red-300",
  } as const;
  return (
    <div className={`flex gap-3 rounded-lg border p-3 ${colors[tone]}`}>
      <Icon className="mt-0.5 h-5 w-5 shrink-0" />
      <div>
        <p className="text-sm font-semibold">
          Guyton-Klinger zone: {guardrails.zone.toUpperCase()}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">{guardrails.message}</p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Chart — percentile band + deterministic line + depletion reference.

function MonteCarloChart({
  result,
  country,
}: {
  result: ReturnType<typeof simulateDrawdown>;
  country: CountryProfile;
}) {
  const data = result.monteCarlo.bands.map((b, i) => ({
    age: b.age,
    p10: Math.max(0, b.p10),
    // Recharts stacked area trick: p50 is p50-p10 stacked on p10; p90 is p90-p50 stacked.
    bandLo: Math.max(0, b.p50 - b.p10),
    bandHi: Math.max(0, b.p90 - b.p50),
    median: b.p50,
    deterministic: result.deterministic.years[i]?.corpus ?? 0,
  }));

  return (
    <div className="h-64 w-full sm:h-80" role="img" aria-label="Monte Carlo retirement simulation">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 10, right: 16, bottom: 0, left: 0 }}>
          <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
          <XAxis
            dataKey="age"
            stroke="hsl(var(--muted-foreground))"
            fontSize={11}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            width={60}
            tickFormatter={(v: number) => formatCurrency(v, country, { compact: true })}
          />
          <RTooltip
            contentStyle={{
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: 8,
              fontSize: 12,
              color: "hsl(var(--card-foreground))",
            }}
            formatter={(value: number, name: string) => {
              const labels: Record<string, string> = {
                p10: "P10 (bad case)",
                median: "P50 (median)",
                deterministic: "At avg returns",
              };
              return [formatCurrency(value, country, { compact: true }), labels[name] ?? name];
            }}
            labelFormatter={(age: number) => `Age ${age}`}
          />
          {/* Bad-case floor */}
          <Area
            type="monotone"
            dataKey="p10"
            stackId="1"
            stroke="hsl(0 84% 60%)"
            strokeWidth={1}
            fill="transparent"
            fillOpacity={0}
          />
          {/* P10 → P50 band */}
          <Area
            type="monotone"
            dataKey="bandLo"
            stackId="1"
            stroke="transparent"
            fill="hsl(217 91% 60%)"
            fillOpacity={0.15}
          />
          {/* P50 → P90 band */}
          <Area
            type="monotone"
            dataKey="bandHi"
            stackId="1"
            stroke="transparent"
            fill="hsl(217 91% 60%)"
            fillOpacity={0.25}
          />
          <Line
            type="monotone"
            dataKey="median"
            stroke="hsl(217 91% 60%)"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="deterministic"
            stroke="hsl(24 95% 53%)"
            strokeWidth={2}
            strokeDasharray="4 4"
            dot={false}
          />
          <ReferenceLine
            y={0}
            stroke="hsl(0 84% 60%)"
            strokeDasharray="2 2"
            label={{ value: "Depleted", fill: "hsl(0 84% 60%)", fontSize: 10, position: "insideTopRight" }}
          />
        </ComposedChart>
      </ResponsiveContainer>
      <div className="mt-1 flex flex-wrap gap-3 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-3 bg-blue-500/30 rounded" />
          10–90% range
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-0.5 w-3 bg-blue-500" />
          Median (P50)
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-0.5 w-3 border-t-2 border-dashed border-orange-500" />
          At average returns
        </span>
      </div>
    </div>
  );
}
