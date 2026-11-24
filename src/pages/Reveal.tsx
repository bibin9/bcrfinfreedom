import { useMemo, useState } from "react";
import {
  ArrowRight,
  Calendar,
  Flame,
  PiggyBank,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Term } from "@/components/ui/term";
import { getCountryProfile } from "@/data/countryProfiles";
import { citiesFor } from "@/data/cities";
import { CitySelect } from "@/components/dashboard/CitySelect";
import { calculateAllocation } from "@/lib/allocation";
import { calculateFreedom } from "@/lib/freedom";
import { convertCurrency } from "@/lib/fx";
import { formatCurrency } from "@/lib/formatters";
import { ageAtRate, computeSaveMore, extraPresets } from "@/lib/saveMore";
import type { FreedomInput } from "@/lib/freedom";
import type { CountryProfile, FreedomProjection } from "@/types";
import { toUserInput, useUserStore } from "@/store/userStore";
import { useI18n } from "@/i18n";

/**
 * The "one number, one decision" reveal screen.
 *
 * Shown immediately after onboarding completes. Goal: deliver the headline
 * answer in <10 seconds, then a single CTA into the full dashboard. Anything
 * else here is a distraction.
 */
export function Reveal() {
  const inputs = useUserStore((s) => s.inputs);
  const setPhase = useUserStore((s) => s.setPhase);
  const setFreedomAge = useUserStore((s) => s.setFreedomAge);
  const setSavingsRate = useUserStore((s) => s.setSavingsRate);
  const setRetirementCity = useUserStore((s) => s.setRetirementCity);
  const { t, countryName } = useI18n();
  const r = (key: string, vars?: Record<string, string | number>) => t(`reveal.${key}`, vars);

  const savingsRate = inputs.savingsRate ?? 0.3;
  const currentCorpus = inputs.currentCorpus ?? 0;
  const householdSize = inputs.householdSize ?? "single";
  const annualExpensesOverride = inputs.annualExpensesOverride;
  const freedomAgeInput = inputs.freedomAge;
  const retirementCountryCode = inputs.retirementCountry;

  const complete = toUserInput(inputs);
  const country = complete ? getCountryProfile(complete.country) : null;
  const destinationCountry =
    retirementCountryCode && retirementCountryCode !== complete?.country
      ? getCountryProfile(retirementCountryCode)
      : country;
  const isExpatMode =
    !!destinationCountry && !!country && destinationCountry.code !== country.code;

  const { allocation, freedom, baseInput } = useMemo(() => {
    if (!complete || !country) return { allocation: null, freedom: null, baseInput: null };
    const a = calculateAllocation({
      age: complete.age,
      risk: complete.risk,
      country,
      goal: complete.goal,
      retirementCountry: destinationCountry ?? undefined,
      freedomAge: freedomAgeInput,
    });
    const base: FreedomInput = {
      ...complete,
      expectedReturn: a.expectedReturn,
      savingsRate,
      currentCorpus,
      freedomAge: freedomAgeInput,
      householdSize,
      annualExpensesOverride,
      retirementCountry: retirementCountryCode,
      retirementCity: inputs.retirementCity,
    };
    return { allocation: a, freedom: calculateFreedom(base), baseInput: base };
  }, [
    complete,
    country,
    destinationCountry,
    savingsRate,
    currentCorpus,
    freedomAgeInput,
    householdSize,
    annualExpensesOverride,
    retirementCountryCode,
    inputs.retirementCity,
  ]);

  if (!complete || !country || !destinationCountry || !allocation || !freedom || !baseInput) {
    // Should not happen — guard for safety, send back to onboarding.
    setPhase("onboarding");
    return null;
  }

  const yearsToFire = freedom.yearsToFreedomAtCurrentRate;
  const fireAgeAtCurrentRate =
    yearsToFire != null ? Math.round(complete.age + yearsToFire) : null;
  const onTrack =
    yearsToFire != null && complete.age + yearsToFire <= freedom.freedomAge + 0.5;

  const todayFireNumber = freedom.currentAnnualExpenses * 25;
  // Convert resident-currency corpus into retirement currency for the ratio.
  const corpusInRetCcy = convertCurrency(currentCorpus, country, destinationCountry);
  const fiRatio =
    todayFireNumber > 0 ? Math.min(100, (corpusInRetCcy / todayFireNumber) * 100) : 0;

  // Suggest a faster path. If they're early, suggest age 50; otherwise -5y.
  const fasterAge = Math.max(
    complete.age + 5,
    Math.min(freedom.freedomAge - 5, 50),
  );
  const slowerAge = Math.min(70, freedom.freedomAge + 5);
  // True when today's savings already reach the earlier target age.
  const fasterOnPace = fireAgeAtCurrentRate != null && fireAgeAtCurrentRate <= fasterAge;
  const money = (n: number, c = destinationCountry) => formatCurrency(n, c, { compact: true });

  return (
    <div className="container max-w-2xl py-10 animate-fade-in">
      {/* Eyebrow */}
      <p className="mb-2 flex items-center justify-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-orange-600 dark:text-orange-400">
        <Sparkles className="h-3.5 w-3.5" />
        <Term hint k="FIRE number">{r("eyebrow")}</Term>
      </p>

      {/* THE NUMBER */}
      <h1 className="text-center text-5xl font-extrabold tracking-tight sm:text-6xl">
        <span className="bg-gradient-to-br from-orange-500 to-red-600 bg-clip-text text-transparent">
          {money(freedom.targetCorpus)}
        </span>
      </h1>
      <p className="mt-3 text-center text-base text-muted-foreground sm:text-lg">
        {r("subline", {
          age: freedom.freedomAge,
          inflation: (destinationCountry.inflationRate * 100).toFixed(1),
          country: countryName(destinationCountry.code, destinationCountry.name),
        })}
      </p>
      {citiesFor(destinationCountry.code).length > 0 && (
        <div className="mx-auto mt-3 flex max-w-md flex-col items-center gap-1.5 sm:flex-row sm:justify-center">
          <span className="text-xs text-muted-foreground">{r("cityQuestion")}</span>
          <CitySelect
            country={destinationCountry.code}
            value={inputs.retirementCity}
            onChange={setRetirementCity}
            className="h-8 w-56 text-xs"
          />
        </div>
      )}
      {isExpatMode && (
        <p className="mt-2 text-center text-xs text-muted-foreground">
          {r("expatLine", {
            home: countryName(country.code, country.name),
            dest: countryName(destinationCountry.code, destinationCountry.name),
            amount: money(convertCurrency(freedom.targetCorpus, destinationCountry, country), country),
          })}
        </p>
      )}
      {isExpatMode && destinationCountry.code === "IN" && (
        <p className="mx-auto mt-3 max-w-xl rounded-lg border border-emerald-500/40 bg-emerald-500/5 px-3 py-2 text-center text-xs">
          💡 <strong>{r("rnorTitle")}</strong> {r("rnorBody")}
        </p>
      )}

      {/* Plain-English explainer for someone with zero finance background */}
      <details className="mx-auto mt-4 max-w-xl rounded-lg border border-border bg-muted/30 p-3 text-sm">
        <summary className="cursor-pointer font-medium">{r("whatMeansToggle")}</summary>
        <div className="mt-2 space-y-2 text-xs text-muted-foreground">
          <p>{r("whatMeans1")}</p>
          <p>{r("whatMeans2")}</p>
          <p>
            {r("whatMeans3", { amount: money(freedom.targetCorpus), age: freedom.freedomAge })}
          </p>
          <p>
            {r("whatMeans4", {
              today: money(freedom.currentAnnualExpenses),
              future: money(freedom.annualExpenses),
              age: freedom.freedomAge,
            })}
          </p>
        </div>
      </details>

      {/* One sentence answer */}
      <Card className="mt-6 overflow-hidden border-orange-500/40">
        <div className="bg-gradient-to-br from-orange-500/15 to-red-500/5 px-5 py-4">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Flame className="h-4 w-4 text-orange-500" />
            {r("atAGlance")}
          </div>
        </div>
        <CardContent className="space-y-4 pt-4">
          <p className="rounded-md bg-orange-500/10 px-3 py-2 text-sm">
            {r("targetLine", { age: freedom.freedomAge })}
          </p>
          <RevealStat
            icon={<PiggyBank className="h-5 w-5 text-orange-500" />}
            label={r("saveNowLabel")}
            value={r("perMonth", { amount: formatCurrency(complete.monthlyIncome * savingsRate, country) })}
            sub={r("saveNowSub", {
              pct: (savingsRate * 100).toFixed(0),
              income: formatCurrency(complete.monthlyIncome, country),
            })}
            accent="emerald"
          />
          <RevealStat
            icon={<Calendar className="h-5 w-5 text-orange-500" />}
            label={r("paceLabel")}
            value={
              fireAgeAtCurrentRate != null
                ? r("paceValue", { age: fireAgeAtCurrentRate })
                : r("paceNever")
            }
            sub={
              yearsToFire != null
                ? r("paceSub", {
                    years: Math.round(yearsToFire),
                    pct: (savingsRate * 100).toFixed(0),
                  })
                : r("paceRaise")
            }
            accent={onTrack ? "emerald" : "amber"}
          />
          <RevealStat
            icon={<PiggyBank className="h-5 w-5 text-emerald-500" />}
            label={r("sipLabel", { age: freedom.freedomAge })}
            value={
              freedom.requiredMonthlySIP != null
                ? r("perMonth", { amount: money(freedom.requiredMonthlySIP) })
                : "—"
            }
            sub={
              freedom.monthlyShortfall > 0
                ? r("sipShort", {
                    saved: money(freedom.currentMonthlySavings),
                    gap: money(freedom.monthlyShortfall),
                  })
                : r("sipEnough", { saved: money(freedom.currentMonthlySavings) })
            }
            accent={freedom.monthlyShortfall > 0 ? "amber" : "emerald"}
          />

          <SaveMore
            base={baseInput}
            baseFreedom={freedom}
            home={country}
            dest={destinationCountry}
            expectedReturn={allocation.expectedReturn}
          />

          {/* FI Ratio bar */}
          <div className="rounded-md border border-border bg-background p-3">
            <div className="mb-1.5 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                <Term hint k="FI Ratio">{r("progressLabel")}</Term>
              </span>
              <span className="font-bold text-orange-600 dark:text-orange-400 tabular-nums">
                {fiRatio.toFixed(1)}%
              </span>
            </div>
            <Progress value={fiRatio} aria-label={r("progressLabel")} />
            <p className="mt-2 text-xs text-muted-foreground">
              {r("progressBody", {
                have: money(corpusInRetCcy),
                need: money(todayFireNumber),
              })}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* THE DECISION */}
      <div className="mt-6 space-y-3">
        <p className="text-center text-sm font-semibold text-muted-foreground">
          {r("decisionHeader")}
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          <DecisionTile
            icon={<TrendingDown className="h-4 w-4" />}
            title={r("retireAt", { age: fasterAge })}
            sub={fasterOnPace ? r("fasterOnPace") : r("faster")}
            onClick={() => {
              setFreedomAge(fasterAge);
              // Only ask for more saving when today's savings would not already get there.
              if (!fasterOnPace) setSavingsRate(Math.min(0.6, savingsRate + 0.1));
              setPhase("dashboard");
            }}
          />
          <DecisionTile
            icon={<Flame className="h-4 w-4" />}
            title={r("stickWith", { age: freedom.freedomAge })}
            sub={r("showFullPlan")}
            primary
            onClick={() => setPhase("dashboard")}
          />
          <DecisionTile
            icon={<TrendingUp className="h-4 w-4" />}
            title={r("retireAt", { age: slowerAge })}
            sub={r("slower")}
            onClick={() => {
              setFreedomAge(slowerAge);
              setPhase("dashboard");
            }}
          />
        </div>
      </div>

      {/* Smaller CTA below */}
      <div className="mt-6 flex flex-col items-center gap-2">
        <Button
          size="lg"
          className="bg-orange-600 hover:bg-orange-700"
          onClick={() => setPhase("dashboard")}
        >
          {r("seeFullPlan")}
          <ArrowRight className="h-4 w-4 rtl:rotate-180" />
        </Button>
        <button
          type="button"
          onClick={() => setPhase("onboarding")}
          className="text-xs text-muted-foreground underline-offset-2 hover:underline"
        >
          {r("waitChange")}
        </button>
      </div>

      <p className="mt-8 text-center text-xs text-muted-foreground">
        {r("disclaimer")}
      </p>
    </div>
  );
}

// --------------------------------------------------------------------------

function RevealStat({
  icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ReactNode;
  label: React.ReactNode;
  value: string;
  sub: string;
  accent: "emerald" | "amber";
}) {
  const accentClass =
    accent === "emerald"
      ? "text-emerald-600 dark:text-emerald-400"
      : "text-amber-600 dark:text-amber-400";
  return (
    <div className="flex items-start gap-3 rounded-md border border-border bg-background p-3">
      <div className="mt-0.5">{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={`text-lg font-bold tabular-nums ${accentClass}`}>{value}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>
      </div>
    </div>
  );
}

function DecisionTile({
  icon,
  title,
  sub,
  onClick,
  primary,
}: {
  icon: React.ReactNode;
  title: string;
  sub: string;
  onClick: () => void;
  primary?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "group flex flex-col items-start gap-1 rounded-lg border p-3 text-start transition",
        primary
          ? "border-orange-500 bg-orange-500/10 hover:bg-orange-500/15"
          : "border-border bg-card hover:border-orange-500/40 hover:bg-orange-500/5",
      ].join(" ")}
    >
      <div
        className={`inline-flex h-7 w-7 items-center justify-center rounded-md ${primary ? "bg-orange-500 text-white" : "bg-orange-500/15 text-orange-600 dark:text-orange-400"}`}
      >
        {icon}
      </div>
      <span className="text-sm font-semibold">{title}</span>
      <span className="text-xs text-muted-foreground">{sub}</span>
    </button>
  );
}

// --------------------------------------------------------------------------

/**
 * "What if I saved a little more each month?" Same calculation, only the
 * monthly saving changes, so the person can see exactly what the extra buys.
 */
function SaveMore({
  base,
  baseFreedom,
  home,
  dest,
  expectedReturn,
}: {
  base: FreedomInput;
  baseFreedom: FreedomProjection;
  home: CountryProfile;
  dest: CountryProfile;
  expectedReturn: number;
}) {
  const { t } = useI18n();
  const r = (key: string, vars?: Record<string, string | number>) => t(`reveal.${key}`, vars);
  const presets = useMemo(() => extraPresets(base.monthlyIncome), [base.monthlyIncome]);
  const [extra, setExtra] = useState<number>(presets[0] ?? 0);
  const [typed, setTyped] = useState("");
  const homeMoney = (n: number) => formatCurrency(n, home);

  const badInput = typed !== "" && !(Number(typed) > 0);
  const computed = useMemo(
    () => computeSaveMore(base, baseFreedom, extra),
    [base, baseFreedom, extra],
  );
  // An invalid typed amount shows only the hint, never a stale comparison.
  const result = badInput ? null : computed;
  const baseAge = ageAtRate(base.age, baseFreedom);
  const capped = result != null && result.appliedExtra < extra - 0.5;

  const ageText = (a: number | null) => (a != null ? r("whatIfAge", { age: a }) : r("whatIfNever"));
  const verdict = !result
    ? null
    : result.age != null && baseAge == null
      ? r("whatIfFirstTime")
      : result.yearsSooner != null && result.yearsSooner >= 1
        ? r("whatIfSooner", { years: result.yearsSooner })
        : r("whatIfNoChange");

  return (
    <div className="rounded-md border border-border bg-background p-3">
      <p className="text-sm font-semibold">{r("whatIfTitle")}</p>
      <p className="mt-2 text-xs text-muted-foreground">{r("whatIfPick")}</p>
      <div className="mt-1.5 flex flex-wrap gap-2">
        {presets.map((p) => (
          <button
            key={p}
            type="button"
            aria-pressed={extra === p && typed === ""}
            onClick={() => {
              setExtra(p);
              setTyped("");
            }}
            className={[
              "min-h-10 rounded-full border px-4 text-sm font-medium tabular-nums transition",
              extra === p && typed === ""
                ? "border-orange-500 bg-orange-500/15 text-orange-700 dark:text-orange-300"
                : "border-border hover:bg-secondary",
            ].join(" ")}
          >
            +{homeMoney(p)}
          </button>
        ))}
      </div>
      <label className="mt-2 flex flex-col gap-1 text-xs text-muted-foreground">
        {r("whatIfCustom", { currency: home.currency })}
        <input
          type="number"
          inputMode="numeric"
          min={1}
          value={typed}
          onChange={(e) => {
            setTyped(e.target.value);
            const n = Number(e.target.value);
            if (n > 0) setExtra(n);
          }}
          className="h-10 w-40 rounded-md border border-border bg-background px-3 text-sm text-foreground"
        />
      </label>
      {badInput && <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">{r("whatIfBad")}</p>}

      {result && (
        <>
          <div className="mt-3 grid grid-cols-2 gap-2 text-center">
            <div className="rounded-md border border-border p-2">
              <p className="text-xs font-medium text-muted-foreground">{r("whatIfNow")}</p>
              <p className="mt-1 text-xs text-muted-foreground">{r("whatIfSaveRow")}</p>
              <p className="text-sm font-bold tabular-nums">{homeMoney(base.monthlyIncome * (base.savingsRate ?? 0))}</p>
              <p className="mt-1 text-xs text-muted-foreground">{r("whatIfAgeRow")}</p>
              <p className="text-sm font-bold">{ageText(baseAge)}</p>
            </div>
            <div className="rounded-md border border-emerald-500/50 bg-emerald-500/5 p-2">
              <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                {r("whatIfWith", { amount: homeMoney(result.appliedExtra) })}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{r("whatIfSaveRow")}</p>
              <p className="text-sm font-bold tabular-nums">
                {homeMoney(base.monthlyIncome * result.newRate)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{r("whatIfAgeRow")}</p>
              <p className="text-sm font-bold">{ageText(result.age)}</p>
            </div>
          </div>
          {verdict && <p className="mt-2 text-sm font-medium">{verdict}</p>}
          {capped && (
            <p className="mt-1 text-xs text-muted-foreground">
              {r("whatIfCapped", { amount: homeMoney(result.appliedExtra) })}
            </p>
          )}
          <p className="mt-2 text-xs text-muted-foreground">
            {r("whatIfSame", {
              age: baseFreedom.freedomAge,
              ret: (expectedReturn * 100).toFixed(1),
              infl: (dest.inflationRate * 100).toFixed(1),
            })}
          </p>
        </>
      )}
      <p className="mt-2 text-xs text-muted-foreground">{r("whatIfBudget")}</p>
    </div>
  );
}
