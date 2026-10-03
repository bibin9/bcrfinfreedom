import { useMemo } from "react";
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
import { calculateAllocation } from "@/lib/allocation";
import { calculateFreedom } from "@/lib/freedom";
import { convertCurrency } from "@/lib/fx";
import { formatCurrency } from "@/lib/formatters";
import { toUserInput, useUserStore } from "@/store/userStore";

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

  const { allocation, freedom } = useMemo(() => {
    if (!complete || !country) return { allocation: null, freedom: null };
    const a = calculateAllocation({
      age: complete.age,
      risk: complete.risk,
      country,
      goal: complete.goal,
    });
    const f = calculateFreedom({
      ...complete,
      expectedReturn: a.expectedReturn,
      savingsRate,
      currentCorpus,
      freedomAge: freedomAgeInput,
      householdSize,
      annualExpensesOverride,
      retirementCountry: retirementCountryCode,
    });
    return { allocation: a, freedom: f };
  }, [
    complete,
    country,
    savingsRate,
    currentCorpus,
    freedomAgeInput,
    householdSize,
    annualExpensesOverride,
    retirementCountryCode,
  ]);

  if (!complete || !country || !destinationCountry || !allocation || !freedom) {
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

  return (
    <div className="container max-w-2xl py-10 animate-fade-in">
      {/* Eyebrow */}
      <p className="mb-2 flex items-center justify-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-orange-600 dark:text-orange-400">
        <Sparkles className="h-3.5 w-3.5" />
        Your <Term hint k="FIRE number">FIRE number</Term>
      </p>

      {/* THE NUMBER */}
      <h1 className="text-center text-5xl font-extrabold tracking-tight sm:text-6xl">
        <span className="bg-gradient-to-br from-orange-500 to-red-600 bg-clip-text text-transparent">
          {formatCurrency(freedom.targetCorpus, destinationCountry, { compact: true })}
        </span>
      </h1>
      <p className="mt-3 text-center text-base text-muted-foreground sm:text-lg">
        That's <strong className="text-foreground">25× your future yearly spend</strong> at
        age {freedom.freedomAge}, inflated at {destinationCountry.name}'s{" "}
        {(destinationCountry.inflationRate * 100).toFixed(1)}% <Term>Inflation</Term>.
      </p>
      {isExpatMode && (
        <p className="mt-2 text-center text-xs text-muted-foreground">
          {country.flag} Living {country.name} · {destinationCountry.flag} Retiring{" "}
          {destinationCountry.name} · ≈{" "}
          {formatCurrency(
            convertCurrency(freedom.targetCorpus, destinationCountry, country),
            country,
            { compact: true },
          )}{" "}
          at today's FX
        </p>
      )}

      {/* Plain-English explainer for someone with zero finance background */}
      <details className="mx-auto mt-4 max-w-xl rounded-lg border border-border bg-muted/30 p-3 text-sm">
        <summary className="cursor-pointer font-medium">
          🤔 What does this number actually mean? (read me first if you're new)
        </summary>
        <div className="mt-2 space-y-2 text-xs text-muted-foreground">
          <p>
            Imagine you stop working tomorrow. You'd still need money for groceries, rent,
            kids, holidays — every year, for the rest of your life.
          </p>
          <p>
            The <strong className="text-foreground">FIRE rule</strong> says: if your
            savings are <strong>25 times</strong> what you spend in a year, you can pull
            out 4% every year — your investments grow on the other 96%, and the money
            never runs out.
          </p>
          <p>
            So <strong className="text-foreground">
              {formatCurrency(freedom.targetCorpus, destinationCountry, { compact: true })}
            </strong>{" "}
            isn't a "rich person" target — it's just the amount that, invested and earning
            normal returns, can pay your bills forever starting at age{" "}
            <strong className="text-foreground">{freedom.freedomAge}</strong>.
          </p>
          <p>
            The number looks big partly because of <strong>inflation</strong> — what
            costs ₹14 lakh today will cost ₹36 lakh in 18 years. The app builds that in.
          </p>
        </div>
      </details>

      {/* One sentence answer */}
      <Card className="mt-6 overflow-hidden border-orange-500/40">
        <div className="bg-gradient-to-br from-orange-500/15 to-red-500/5 px-5 py-4">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Flame className="h-4 w-4 text-orange-500" />
            At a glance
          </div>
        </div>
        <CardContent className="space-y-4 pt-4">
          <RevealStat
            icon={<Calendar className="h-5 w-5 text-orange-500" />}
            label="At your current savings rate you'll hit FIRE around"
            value={
              fireAgeAtCurrentRate != null
                ? `age ${fireAgeAtCurrentRate}`
                : "longer than 60 years away"
            }
            sub={
              yearsToFire != null
                ? `${Math.round(yearsToFire)} years from today (savings rate ${(savingsRate * 100).toFixed(0)}%)`
                : "Try raising your savings rate"
            }
            accent={onTrack ? "emerald" : "amber"}
          />
          <RevealStat
            icon={<PiggyBank className="h-5 w-5 text-emerald-500" />}
            label={<>Required monthly <Term>SIP</Term> to hit your target age</>}
            value={
              freedom.requiredMonthlySIP != null
                ? `${formatCurrency(freedom.requiredMonthlySIP, destinationCountry, { compact: true })}/mo`
                : "—"
            }
            sub={
              freedom.monthlyShortfall > 0
                ? `You currently save ${formatCurrency(freedom.currentMonthlySavings, destinationCountry, { compact: true })}/mo — short by ${formatCurrency(freedom.monthlyShortfall, destinationCountry, { compact: true })}/mo`
                : `You're already saving enough at ${formatCurrency(freedom.currentMonthlySavings, destinationCountry, { compact: true })}/mo`
            }
            accent={freedom.monthlyShortfall > 0 ? "amber" : "emerald"}
          />

          {/* FI Ratio bar */}
          <div className="rounded-md border border-border bg-background p-3">
            <div className="mb-1.5 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                <Term hint k="FI Ratio">FI Ratio</Term> (today's spend)
              </span>
              <span className="font-bold text-orange-600 dark:text-orange-400 tabular-nums">
                {fiRatio.toFixed(1)}%
              </span>
            </div>
            <Progress value={fiRatio} aria-label="FI Ratio" />
            <p className="mt-2 text-[11px] text-muted-foreground">
              You have{" "}
              <strong>
                {formatCurrency(
                  convertCurrency(currentCorpus, country, destinationCountry),
                  destinationCountry,
                  { compact: true },
                )}
              </strong>{" "}
              of <strong>{formatCurrency(todayFireNumber, destinationCountry, { compact: true })}</strong>{" "}
              needed to be FI <em>today</em>.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* THE DECISION */}
      <div className="mt-6 space-y-3">
        <p className="text-center text-sm font-semibold text-muted-foreground">
          Want it sooner or later? Pick one — you can change anything later.
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          <DecisionTile
            icon={<TrendingDown className="h-4 w-4" />}
            title={`Retire at ${fasterAge}`}
            sub="Faster — needs higher savings rate"
            onClick={() => {
              setFreedomAge(fasterAge);
              setSavingsRate(Math.min(0.6, savingsRate + 0.1));
              setPhase("dashboard");
            }}
          />
          <DecisionTile
            icon={<Flame className="h-4 w-4" />}
            title={`Stick with ${freedom.freedomAge}`}
            sub="Show me the full plan"
            primary
            onClick={() => setPhase("dashboard")}
          />
          <DecisionTile
            icon={<TrendingUp className="h-4 w-4" />}
            title={`Retire at ${slowerAge}`}
            sub="Slower — easier monthly SIP"
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
          See my full plan
          <ArrowRight className="h-4 w-4" />
        </Button>
        <button
          type="button"
          onClick={() => setPhase("onboarding")}
          className="text-xs text-muted-foreground underline-offset-2 hover:underline"
        >
          Wait, let me change my inputs
        </button>
      </div>

      <p className="mt-8 text-center text-[11px] text-muted-foreground">
        Educational only · Not financial advice · You can edit everything from the dashboard
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
        <p className="mt-0.5 text-[11px] text-muted-foreground">{sub}</p>
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
        "group flex flex-col items-start gap-1 rounded-lg border p-3 text-left transition",
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
