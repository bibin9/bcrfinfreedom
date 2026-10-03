import {
  ArrowRight,
  Calculator,
  ChevronRight,
  Flame,
  Globe2,
  GraduationCap,
  PlayCircle,
  ShieldCheck,
  Sparkles,
  Sprout,
  Target,
  TrendingUp,
  Users,
  Waves,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Disclaimer } from "@/components/layout/Disclaimer";
import { useI18n } from "@/i18n";
import { useUserStore } from "@/store/userStore";

const featureIcons = [Globe2, GraduationCap, ShieldCheck] as const;
const featureKeys = ["Country", "Beginner", "Private"] as const;

export function Landing() {
  const { t } = useI18n();
  const setPhase = useUserStore((s) => s.setPhase);
  const setCountry = useUserStore((s) => s.setCountry);
  const setAge = useUserStore((s) => s.setAge);
  const setMonthlyIncome = useUserStore((s) => s.setMonthlyIncome);
  const setRisk = useUserStore((s) => s.setRisk);
  const setGoal = useUserStore((s) => s.setGoal);
  const setHouseholdSize = useUserStore((s) => s.setHouseholdSize);

  /** One-click: fill a realistic sample persona and jump straight to the Reveal. */
  const trySample = () => {
    setCountry("IN");
    setAge(32);
    setMonthlyIncome(120_000);
    setRisk("moderate");
    setGoal("wealth_building");
    setHouseholdSize("family");
    setPhase("reveal");
  };

  return (
    <div className="animate-fade-in">
      {/* ================================================================ */}
      {/* HERO — full-bleed gradient background with illustration on side */}
      {/* ================================================================ */}
      <section className="relative overflow-hidden border-b border-border">
        {/* Gradient wash */}
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-gradient-to-br from-orange-100/40 via-amber-50/30 to-red-100/20 dark:from-orange-950/30 dark:via-amber-950/20 dark:to-red-950/20"
        />
        {/* Decorative floating shapes */}
        <div
          aria-hidden
          className="absolute -top-20 left-10 h-64 w-64 rounded-full bg-orange-300/20 blur-3xl dark:bg-orange-500/10"
        />
        <div
          aria-hidden
          className="absolute -bottom-20 right-10 h-64 w-64 rounded-full bg-amber-300/20 blur-3xl dark:bg-red-500/10"
        />

        <div className="container relative py-12 md:py-20">
          <div className="grid items-center gap-8 lg:grid-cols-[1.1fr_1fr] lg:gap-12">
            {/* LEFT — copy + CTAs */}
            <div className="text-center lg:text-left">
              <span className="inline-flex items-center gap-2 rounded-full border border-orange-500/40 bg-orange-500/10 px-3 py-1 text-xs font-medium text-orange-700 dark:text-orange-300">
                <Flame className="h-3.5 w-3.5" />
                {t("landing.chip")}
              </span>
              <h1 className="mt-6 text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
                {t("landing.heroStart")}{" "}
                <span className="bg-gradient-to-br from-orange-500 to-red-600 bg-clip-text text-transparent">
                  {t("landing.heroHighlight")}
                </span>
                {t("landing.heroEnd")}
              </h1>
              <p className="mt-5 text-base text-muted-foreground sm:text-lg md:text-xl">
                {t("landing.heroSub")}
              </p>
              <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center lg:justify-start">
                <Button
                  size="lg"
                  onClick={() => setPhase("onboarding")}
                  className="bg-orange-600 text-base shadow-lg shadow-orange-500/20 hover:bg-orange-700 sm:text-lg"
                >
                  {t("landing.ctaPrimary")}
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => window.dispatchEvent(new Event("bcr-fire:open-help"))}
                  className="border-orange-500/40 text-base sm:text-lg"
                >
                  <GraduationCap className="h-4 w-4" />
                  {t("landing.ctaSecondary")}
                </Button>
              </div>
              <p className="mt-4 text-xs text-muted-foreground">{t("landing.bullets")}</p>

              {/* Sample link */}
              <button
                type="button"
                onClick={trySample}
                className="mt-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
              >
                <PlayCircle className="h-3.5 w-3.5" />
                {t("landing.tryExample")}
              </button>
            </div>

            {/* RIGHT — live preview card ("Arjun & Meera's plan") */}
            <div className="relative">
              <LivePlanPreview onClick={trySample} />
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* TRUST STRIP — big numbers + flags                                */}
      {/* ================================================================ */}
      <section className="border-b border-border bg-card/40">
        <div className="container py-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatBlock number="15" label="countries" icon={<Globe2 className="h-4 w-4" />} />
            <StatBlock number="4" label="languages" icon={<Users className="h-4 w-4" />} />
            <StatBlock number="100%" label="free, forever" icon={<Sparkles className="h-4 w-4" />} />
            <StatBlock number="0" label="data leaves device" icon={<ShieldCheck className="h-4 w-4" />} />
          </div>
          <CountryStrip />
        </div>
      </section>

      {/* ================================================================ */}
      {/* 6-FEATURE GRID — the "questions FIRE answers"                    */}
      {/* ================================================================ */}
      <section className="container py-14 md:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            6 big questions. One tool.
          </h2>
          <p className="mt-3 text-muted-foreground">
            Every piece of your retirement plan — the number, the timing, the taxes, the
            trade-offs — in plain language with no finance jargon required.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            icon={<Target className="h-5 w-5" />}
            title="How much do I really need?"
            body="A country-specific FIRE number using your real inflation, benchmark expenses, and household size — not a generic US calculator."
            accent="orange"
          />
          <FeatureCard
            icon={<Zap className="h-5 w-5" />}
            title="Will my money last?"
            body="Monte Carlo simulation across 1,000 possible futures tells you the odds your savings survive to age 95."
            accent="red"
          />
          <FeatureCard
            icon={<TrendingUp className="h-5 w-5" />}
            title="When can I retire?"
            body="Live sliders show how one extra savings percentage point shaves years off your freedom date."
            accent="emerald"
          />
          <FeatureCard
            icon={<ShieldCheck className="h-5 w-5" />}
            title="Can I spend safely?"
            body="Guyton-Klinger withdrawal guardrails tell you when to spend more and when to pull back."
            accent="blue"
          />
          <FeatureCard
            icon={<Waves className="h-5 w-5" />}
            title="Where does my money go?"
            body="Sankey diagram shows every rupee flowing from paycheque to Essentials, FIRE SIP, and goal buckets."
            accent="purple"
          />
          <FeatureCard
            icon={<Calculator className="h-5 w-5" />}
            title="What about NRI tax?"
            body="Section 6 residency + RNOR window + NRE vs NRO + tax savings — the 4 tools returning NRIs actually need."
            accent="amber"
          />
        </div>
      </section>

      {/* ================================================================ */}
      {/* HOW IT WORKS — 4-step horizontal walkthrough                     */}
      {/* ================================================================ */}
      <section className="border-y border-border bg-card/40 py-14 md:py-20">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              How it works
            </h2>
            <p className="mt-3 text-muted-foreground">
              From blank screen to actionable plan in under 2 minutes.
            </p>
          </div>

          <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StepCard
              n={1}
              icon={<Globe2 className="h-6 w-6" />}
              title="Tell us where you live"
              body="Pick your country (and your retirement country if different). We tailor currency, inflation, tax wrappers to it."
            />
            <StepCard
              n={2}
              icon={<Users className="h-6 w-6" />}
              title="Two numbers about you"
              body="Age + take-home income. We suggest sensible defaults so you can skip ahead if you want."
            />
            <StepCard
              n={3}
              icon={<Sprout className="h-6 w-6" />}
              title="Pick your risk & goal"
              body="Plain-English risk slider with example portfolios. No 'MIFID-II style' quizzes."
            />
            <StepCard
              n={4}
              icon={<Flame className="h-6 w-6" />}
              title="See your FIRE number"
              body="Big orange number. Clear verdict: on track, close, or needs work. Everything else drills down from there."
            />
          </ol>
        </div>
      </section>

      {/* ================================================================ */}
      {/* 3 EYEBROW FEATURES (translated from original) + Built By         */}
      {/* ================================================================ */}
      <section className="container py-14 md:py-20">
        <div className="grid gap-4 md:grid-cols-3 md:gap-6">
          {featureIcons.map((Icon, idx) => {
            const key = featureKeys[idx];
            return (
              <Card key={key} className="border-orange-500/20 transition hover:shadow-md hover:shadow-orange-500/10">
                <CardContent className="p-6">
                  <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-md bg-orange-500/10 text-orange-600 dark:text-orange-400">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold">{t(`landing.feature${key}Title`)}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t(`landing.feature${key}Body`)}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Built-by card — personal touch */}
        <div className="mx-auto mt-10 max-w-2xl rounded-xl border border-orange-500/20 bg-gradient-to-br from-orange-500/5 to-amber-500/5 p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-500/15 text-xl">
              🇦🇪
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider text-orange-600 dark:text-orange-400">
                {t("landing.builtByHeading")}
              </p>
              <p className="mt-1 font-medium">{t("landing.builtByBody")}</p>
              <p className="mt-1.5 text-sm text-muted-foreground">{t("landing.builtBySub")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================ */}
      {/* CLOSING CTA — big, final, hard to miss                           */}
      {/* ================================================================ */}
      <section className="relative overflow-hidden border-t border-border">
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-red-500/10 dark:from-orange-900/30 dark:via-amber-900/20 dark:to-red-900/30"
        />
        <div className="container py-14 text-center md:py-20">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
            Ready to answer:{" "}
            <span className="bg-gradient-to-br from-orange-500 to-red-600 bg-clip-text text-transparent">
              when can I stop working?
            </span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            2 minutes. No signup. Your data stays on your device.
          </p>
          <Button
            size="lg"
            onClick={() => setPhase("onboarding")}
            className="mt-8 bg-orange-600 text-base shadow-lg shadow-orange-500/20 hover:bg-orange-700 sm:text-lg"
          >
            {t("landing.ctaPrimary")}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </section>

      <section className="container mt-6 max-w-3xl pb-12">
        <Disclaimer />
      </section>
    </div>
  );
}

// =============================================================================
// Component pieces
// =============================================================================

/**
 * "Arjun & Meera's plan" live preview card — this is the single most powerful visual
 * element because the user sees exactly what they'll build in 2 minutes.
 * Clickable → fills sample data → jumps to Reveal.
 */
function LivePlanPreview({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group block w-full text-left transition hover:scale-[1.02]"
      aria-label="See a sample plan — Arjun and Meera, 32, Bangalore"
    >
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-xl shadow-orange-500/5">
        {/* Header strip */}
        <div className="flex items-center justify-between border-b border-border bg-muted/30 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-orange-500 to-red-600">
              <Flame className="h-3.5 w-3.5 text-white" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground leading-none">Sample plan</p>
              <p className="text-sm font-semibold leading-tight">🇮🇳 Arjun & Meera, 32 · Bangalore</p>
            </div>
          </div>
          <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            ✓ On track
          </span>
        </div>

        {/* FIRE number hero */}
        <div className="bg-gradient-to-br from-orange-500/10 to-amber-500/5 px-4 py-5 text-center">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
            Their FIRE number
          </p>
          <p className="mt-1 bg-gradient-to-br from-orange-500 to-red-600 bg-clip-text text-4xl font-extrabold tabular-nums text-transparent sm:text-5xl">
            ₹5.7 Cr
          </p>
          <p className="mt-1 text-xs text-muted-foreground">at age 58 · 26 years from now</p>
        </div>

        {/* Metric row */}
        <div className="grid grid-cols-3 gap-2 border-t border-border px-3 py-3">
          <MiniStat label="SIP" value="₹28k" sub="/month" />
          <MiniStat label="FI Ratio" value="18%" sub="today" />
          <MiniStat label="Years to FIRE" value="26" sub="years" />
        </div>

        {/* Mini chart — growth curve */}
        <div className="border-t border-border px-3 pt-2">
          <MiniGrowthChart />
          <p className="pb-3 text-center text-[10px] text-muted-foreground">
            Projected wealth · age 32 → 95
          </p>
        </div>

        {/* Hover CTA */}
        <div className="flex items-center justify-center gap-1.5 border-t border-border bg-muted/20 px-4 py-2.5 text-xs font-medium text-orange-600 group-hover:bg-orange-500/10 dark:text-orange-400">
          <span>See their full plan</span>
          <ChevronRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
        </div>
      </div>
    </button>
  );
}

function MiniStat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-md border border-border bg-background px-2 py-1.5 text-center">
      <p className="text-[9px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="text-sm font-bold tabular-nums">{value}</p>
      <p className="text-[9px] text-muted-foreground">{sub}</p>
    </div>
  );
}

/** A tiny growth-curve illustration — not real data, just suggesting a shape. */
function MiniGrowthChart() {
  return (
    <svg viewBox="0 0 200 60" className="h-16 w-full" role="img" aria-label="Projected growth">
      <defs>
        <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(24 95% 53%)" stopOpacity="0.3" />
          <stop offset="100%" stopColor="hsl(24 95% 53%)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d="M 0 55 Q 50 50 80 42 Q 120 32 160 15 L 200 5 L 200 60 L 0 60 Z"
        fill="url(#area)"
      />
      <path
        d="M 0 55 Q 50 50 80 42 Q 120 32 160 15 L 200 5"
        fill="none"
        stroke="hsl(24 95% 53%)"
        strokeWidth="2"
      />
      {/* FIRE marker */}
      <circle cx="160" cy="15" r="4" fill="hsl(24 95% 53%)" />
      <text x="156" y="10" fontSize="7" fill="hsl(24 95% 53%)" fontWeight="700">
        FIRE
      </text>
    </svg>
  );
}

function StatBlock({
  number,
  label,
  icon,
}: {
  number: string;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400">
        {icon}
      </div>
      <div>
        <p className="text-xl font-bold tabular-nums leading-none sm:text-2xl">{number}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  body,
  accent,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  accent: "orange" | "red" | "emerald" | "blue" | "purple" | "amber";
}) {
  const color = {
    orange: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
    red: "bg-red-500/10 text-red-600 dark:text-red-400",
    emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    purple: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
    amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  }[accent];
  return (
    <Card className="group transition hover:border-orange-500/40 hover:shadow-md hover:shadow-orange-500/5">
      <CardContent className="p-5">
        <div className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${color}`}>
          {icon}
        </div>
        <h3 className="mt-3 font-semibold">{title}</h3>
        <p className="mt-1.5 text-sm text-muted-foreground">{body}</p>
      </CardContent>
    </Card>
  );
}

function StepCard({
  n,
  icon,
  title,
  body,
}: {
  n: number;
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <li className="relative rounded-xl border border-border bg-card p-5">
      <div className="absolute -top-3 left-5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-red-600 text-xs font-bold text-white shadow-md shadow-orange-500/30">
        {n}
      </div>
      <div className="mt-2 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400">
        {icon}
      </div>
      <h3 className="mt-3 font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{body}</p>
    </li>
  );
}

function CountryStrip() {
  const flags = ["🇮🇳", "🇦🇪", "🇸🇦", "🇺🇸", "🇬🇧", "🇨🇦", "🇦🇺", "🇸🇬", "🇩🇪", "🇯🇵", "🇲🇾", "🇵🇭", "🇵🇰", "🇧🇩", "🇪🇬"];
  return (
    <div className="mt-4 flex flex-wrap items-center justify-center gap-2 border-t border-border pt-4 opacity-80">
      {flags.map((f, i) => (
        <span
          key={i}
          className="text-lg transition hover:scale-125"
          aria-hidden
          title={`Country ${i + 1}`}
        >
          {f}
        </span>
      ))}
    </div>
  );
}

