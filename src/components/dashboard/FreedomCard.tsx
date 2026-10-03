import { AlertTriangle, Flame, Lightbulb, Sprout, TrendingUp, Trophy } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible } from "@/components/ui/collapsible";
import { ExportPlanButton } from "@/components/dashboard/ExportPlanButton";
import { Progress } from "@/components/ui/progress";
import { Term } from "@/components/ui/term";
import { WealthProjection } from "@/components/charts/WealthProjection";
import { SavingsRateCurve } from "@/components/charts/SavingsRateCurve";
import type { CountryProfile, FreedomProjection } from "@/types";
import { formatCurrency, formatYears } from "@/lib/formatters";

interface Props {
  country: CountryProfile;
  projection: FreedomProjection;
  age: number;
  /** User's current savings rate (0..1) — drives the FIRE curve highlight. */
  savingsRate?: number;
  /** User's current invested corpus — drives the FI Ratio progress meter. */
  currentCorpus?: number;
}

function Metric({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: string;
  hint?: string;
  accent?: "emerald" | "red" | "amber";
}) {
  const color =
    accent === "emerald"
      ? "text-emerald-500"
      : accent === "red"
        ? "text-red-500"
        : accent === "amber"
          ? "text-amber-500"
          : "text-foreground";
  return (
    <div className="rounded-lg border border-border p-3">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={`mt-1 text-base font-semibold tabular-nums sm:text-lg ${color}`}>{value}</p>
      {hint && <p className="mt-0.5 text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

/**
 * The single most important sentence on the whole dashboard — a plain-English,
 * jargon-free verdict a finance newbie can act on in under 5 seconds.
 * Everything else on this card is optional detail.
 */
function PlainVerdict({
  onTrack,
  yearsLeft,
  freedomAge,
  age,
  shortfall,
  fiRatio,
}: {
  onTrack: boolean;
  yearsLeft: number | null;
  freedomAge: number;
  age: number;
  shortfall: number;
  fiRatio: number;
}) {
  const yearsAhead = yearsLeft != null ? Math.round(yearsLeft) : null;
  const wontMake = yearsLeft == null || yearsAhead == null || yearsAhead > 60;
  let tone: "emerald" | "amber" | "red" = "amber";
  let headline = "";
  let advice = "";
  if (onTrack) {
    tone = "emerald";
    headline = `✅ Your savings are on pace to reach FIRE by age ${freedomAge}.`;
    advice = `If you keep saving at this rate, it compounds into your FIRE number in time. Put the SIP on autopilot and log a quarterly check-in on the Tracker tab.`;
  } else if (wontMake) {
    tone = "red";
    headline = `⚠️ At your current savings pace, you likely won't reach FIRE within a normal lifetime.`;
    advice = `Two levers matter most: raise your savings rate (biggest impact) or push your freedom age 5–10 years later. Try both on the sliders and watch this box change.`;
  } else if (shortfall > 0 && yearsAhead != null && yearsAhead > freedomAge - age) {
    tone = "amber";
    headline = `⏳ At this pace you'll reach FIRE around age ${age + yearsAhead}, not ${freedomAge}.`;
    advice = `That's ${yearsAhead - (freedomAge - age)} years later than your target. Bump your savings rate 5% or extend your freedom age — the app recomputes live.`;
  } else {
    tone = "amber";
    headline = `🎯 Close — your savings pace falls just short of FIRE by age ${freedomAge}.`;
    advice = `Tune your savings rate on the right to close the gap. Every extra 1% you save shaves months off your FIRE date.`;
  }

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
      <p className="mt-1 text-xs text-muted-foreground sm:text-sm">{advice}</p>
      <p className="mt-1.5 text-[11px] text-muted-foreground">
        <strong className="text-foreground">Progress so far:</strong> you've built{" "}
        <strong className="text-foreground">{fiRatio.toFixed(1)}%</strong> of today's FIRE
        number.
        {onTrack && fiRatio < 10 && (
          <> "On pace" is a forecast from your monthly savings — the corpus itself is still early.</>
        )}
      </p>
    </div>
  );
}

// --------------------------------------------------------------------------

export function FreedomCard({
  country,
  projection,
  age,
  savingsRate = 0.3,
  currentCorpus = 0,
}: Props) {
  const yearsLeft = projection.yearsToFreedomAtCurrentRate;
  const freedomAge = projection.freedomAge;

  // FI Ratio: how far along you are toward the FIRE number, in real terms.
  // (Compares today's corpus to today's-equivalent FIRE number, i.e. 25× current expenses.)
  const todayFireNumber = projection.currentAnnualExpenses * 25;
  const fiRatio =
    todayFireNumber > 0 ? Math.min(100, (currentCorpus / todayFireNumber) * 100) : 0;

  const byAge = projection.monthlyInvestmentRequired;
  const onTrack =
    yearsLeft != null && freedomAge - age >= yearsLeft && projection.monthlyShortfall <= 1;
  const raisePercent = projection.requiredAnnualIncomeGrowth * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-orange-500" />
          Your FIRE number
          <span className="ml-auto rounded-full bg-orange-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-orange-600 dark:text-orange-400">
            Financial Independence · Retire Early
          </span>
        </CardTitle>
        <CardDescription>
          The <Term>FIRE</Term> movement says: save aggressively, invest in low-cost{" "}
          <Term k="Index fund">index funds</Term>, and quit work when your portfolio is{" "}
          <strong>25× your annual spend</strong> — the <Term k="4% rule">4% rule</Term>.
          Numbers below are inflated to age {freedomAge} at {country.name}'s{" "}
          <Term>Inflation</Term> of {(projection.inflationRateUsed * 100).toFixed(1)}%.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Plain-English verdict — the ONE sentence a finance newbie needs to hear first */}
        <PlainVerdict
          onTrack={onTrack}
          yearsLeft={yearsLeft}
          freedomAge={freedomAge}
          age={age}
          shortfall={projection.monthlyShortfall}
          fiRatio={fiRatio}
        />

        {/* FI Ratio hero */}
        <div className="rounded-lg border border-orange-500/30 bg-gradient-to-br from-orange-500/10 to-amber-500/5 p-4">
          <div className="mb-2 flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                <Term hint k="FI Ratio">FI Ratio</Term> · how close you are
              </p>
              <p className="text-2xl font-bold tabular-nums text-orange-600 dark:text-orange-400">
                {fiRatio.toFixed(1)}%
              </p>
            </div>
            <div className="text-right">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                Today's FIRE number
              </p>
              <p className="text-base font-semibold tabular-nums">
                {formatCurrency(todayFireNumber, country, { compact: true })}
              </p>
              <p className="text-[10px] text-muted-foreground">
                25× {formatCurrency(projection.currentAnnualExpenses, country, { compact: true })}
                /yr ·{" "}
                {projection.expenseBasis === "override"
                  ? "your entered expenses"
                  : `${country.name} ${projection.householdSize === "family" ? "family" : "single"} benchmark`}
              </p>
            </div>
          </div>
          <Progress value={fiRatio} aria-label="FI Ratio" />
          <p className="mt-2 text-[11px] text-muted-foreground">
            Hit 100% and you're financially independent at today's lifestyle.{" "}
            {fiRatio < 25
              ? "Early days — savings rate matters more than returns."
              : fiRatio < 50
                ? "Foundation phase — compounding is starting to kick in."
                : fiRatio < 100
                  ? "Acceleration phase — last 50% comes much faster than the first."
                  : "Congrats — by today's spending you've reached FIRE."}
          </p>
        </div>

        {/* Headline metrics */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
          <Metric
            label={`FIRE number @ ${freedomAge}`}
            value={formatCurrency(projection.targetCorpus, country, { compact: true })}
            hint={`25× future spend ${formatCurrency(projection.annualExpenses, country, { compact: true })}/yr`}
          />
          <Metric
            label="Future monthly spend"
            value={formatCurrency(projection.annualExpenses / 12, country, { compact: true })}
            hint={`Today: ${formatCurrency(projection.currentAnnualExpenses / 12, country, { compact: true })}/mo`}
          />
          <Metric
            label={`Required SIP to age ${freedomAge}`}
            value={
              projection.requiredMonthlySIP != null
                ? formatCurrency(projection.requiredMonthlySIP, country, { compact: true })
                : "—"
            }
            hint={
              projection.monthlyShortfall > 0
                ? `Short by ${formatCurrency(projection.monthlyShortfall, country, { compact: true })}/mo`
                : "You're covered at your current savings"
            }
            accent={projection.monthlyShortfall > 0 ? "red" : "emerald"}
          />
          <Metric
            label="Years to FIRE"
            value={formatYears(yearsLeft ?? NaN)}
            hint={onTrack ? "At current savings + return" : "Too slow — push savings up"}
            accent={onTrack ? "emerald" : "amber"}
          />
        </div>

        {/* PRIMARY CHART — stays visible, the one anchor the eye needs */}
        <div>
          <h3 className="mb-2 text-sm font-medium">Wealth curve vs FIRE tiers</h3>
          <p className="mb-2 text-[11px] text-muted-foreground">
            Where your blue line crosses each dashed tier is the year you hit that level of
            FIRE.
          </p>
          <WealthProjection projection={projection} country={country} />
        </div>

        {/* --- Everything below is "nice to have" — folded by default so new */}
        {/*     users aren't overwhelmed. Power users expand what they need. */}

        <Collapsible title="FIRE tiers (LeanFIRE / FatFIRE / CoastFIRE)" subtitle="pick your flavour">
          <FireTiers projection={projection} country={country} />
        </Collapsible>

        <Collapsible
          title="Years to FIRE vs savings rate"
          subtitle="the single biggest lever"
        >
          <p className="mb-2 text-[11px] text-muted-foreground">
            Doubling your savings rate roughly halves your time to freedom. Real return basis:{" "}
            {((Math.max(0.01, country.expectedEquityReturn - country.inflationRate)) * 100).toFixed(1)}%/yr.
          </p>
          <SavingsRateCurve curve={projection.savingsRateCurve} currentRate={savingsRate} />
        </Collapsible>

        <Collapsible title="What SIP would hit FIRE by age 50 / 55 / 60?">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <Metric
              label="By 50"
              value={byAge.byAge50 != null ? formatCurrency(byAge.byAge50, country, { compact: true }) : "—"}
              hint={byAge.byAge50 != null ? "Inflation-adjusted" : "Already past this age"}
            />
            <Metric
              label="By 55"
              value={byAge.byAge55 != null ? formatCurrency(byAge.byAge55, country, { compact: true }) : "—"}
              hint={byAge.byAge55 != null ? "Inflation-adjusted" : "Already past this age"}
            />
            <Metric
              label="By 60"
              value={byAge.byAge60 != null ? formatCurrency(byAge.byAge60, country, { compact: true }) : "—"}
              hint={byAge.byAge60 != null ? "Inflation-adjusted" : "Already past this age"}
            />
          </div>
        </Collapsible>

        {projection.monthlyShortfall > 0 && (
          <IncomeGrowthPlan projection={projection} country={country} raisePercent={raisePercent} />
        )}

        <Collapsible title="Educational tips based on your plan" subtitle="country-specific">
          <EducationalAdvice projection={projection} country={country} />
        </Collapsible>

        {/* Export CTA — natural place after reading the full plan */}
        <div className="flex flex-col items-center gap-2 rounded-lg border border-orange-500/30 bg-orange-500/5 p-4 text-center">
          <p className="text-sm font-semibold">Take your plan with you</p>
          <p className="text-xs text-muted-foreground">
            A 4-page personalised PDF — cover, numbers, allocation, goals, and your next 5
            moves. Share with your partner, your advisor, or future-you.
          </p>
          <PlanExportInline />
        </div>
      </CardContent>
    </Card>
  );
}

// --------------------------------------------------------------------------

function FireTiers({
  projection,
  country,
}: {
  projection: FreedomProjection;
  country: CountryProfile;
}) {
  const t = projection.fireTiers;
  return (
    <div className="space-y-2">
      {/* Icons stay colored (small identity cue), tiles themselves get a */}
      {/*  consistent orange accent — only the "FIRE" primary stays highlighted. */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <TierCard
          icon={<Sprout className="h-4 w-4 text-emerald-500" />}
          name="LeanFIRE"
          subtitle="15× spend · frugal"
          target={t.lean.targetCorpus}
          years={t.lean.yearsAtCurrentSavings}
          country={country}
          accent="orange"
        />
        <TierCard
          icon={<Flame className="h-4 w-4 text-orange-500" />}
          name="FIRE"
          subtitle="25× spend · classic 4%"
          target={t.standard.targetCorpus}
          years={t.standard.yearsAtCurrentSavings}
          country={country}
          accent="orange"
          highlight
        />
        <TierCard
          icon={<Trophy className="h-4 w-4 text-amber-500" />}
          name="FatFIRE"
          subtitle="33× spend · 3% comfortable"
          target={t.fat.targetCorpus}
          years={t.fat.yearsAtCurrentSavings}
          country={country}
          accent="orange"
        />
        <TierCard
          icon={<TrendingUp className="h-4 w-4 text-blue-500" />}
          name="CoastFIRE"
          subtitle={`Save this today, stop saving`}
          target={t.coastTodayCorpus}
          years={null}
          country={country}
          accent="orange"
          coastNote
        />
      </div>
      <p className="text-[11px] text-muted-foreground">
        <strong>LeanFIRE</strong> = retire on a tight budget · <strong>FIRE</strong> = the standard
        4% rule · <strong>FatFIRE</strong> = comfortable lifestyle on 3% withdrawals ·{" "}
        <strong>CoastFIRE</strong> = the corpus you need <em>today</em>; if you stop adding new
        money it still compounds into your full FIRE number by age {projection.freedomAge}.
      </p>
    </div>
  );
}

function TierCard({
  icon,
  name,
  subtitle,
  target,
  years,
  country,
  accent,
  highlight,
  coastNote,
}: {
  icon: React.ReactNode;
  name: string;
  subtitle: string;
  target: number;
  years: number | null;
  country: CountryProfile;
  accent: "emerald" | "orange" | "amber" | "blue";
  highlight?: boolean;
  coastNote?: boolean;
}) {
  // Only the primary FIRE tier keeps strong orange emphasis. The other 3 tiers
  // use a quiet neutral border — hierarchy via contrast, not competing colour.
  const ringClass = highlight
    ? "border-orange-500/50 ring-1 ring-orange-500/40 bg-orange-500/5"
    : "border-border bg-card";
  void accent;
  return (
    <div className={`rounded-lg border p-3 ${ringClass}`}>
      <div className="flex items-center gap-1.5">
        {icon}
        <p className="text-sm font-semibold">{name}</p>
      </div>
      <p className="text-[11px] text-muted-foreground">{subtitle}</p>
      <p className="mt-1.5 text-base font-bold tabular-nums sm:text-lg">
        {formatCurrency(target, country, { compact: true })}
      </p>
      {coastNote ? (
        <p className="text-[11px] text-muted-foreground">If you can hit this, you're done.</p>
      ) : (
        <p className="text-[11px] text-muted-foreground">
          {years != null
            ? years <= 0
              ? "Already there"
              : `${formatYears(years)} at current savings`
            : "Unreachable at current savings"}
        </p>
      )}
    </div>
  );
}

// --------------------------------------------------------------------------

function PlanExportInline() {
  return <ExportPlanButton size="lg" />;
}

// --------------------------------------------------------------------------

function IncomeGrowthPlan({
  projection,
  country,
  raisePercent,
}: {
  projection: FreedomProjection;
  country: CountryProfile;
  raisePercent: number;
}) {
  const feasible = raisePercent > 0 && raisePercent < 25;

  return (
    <div className="space-y-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
      <div className="flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-amber-500" />
        <p className="text-sm font-semibold">Your current income isn't enough — here's the fix</p>
      </div>
      <p className="text-xs text-muted-foreground">
        To hit age {projection.freedomAge} financial freedom, your SIP needs to reach{" "}
        <span className="font-semibold text-foreground">
          {formatCurrency(projection.requiredMonthlySIP ?? 0, country, { compact: true })}/mo
        </span>{" "}
        — currently you save{" "}
        <span className="font-semibold text-foreground">
          {formatCurrency(projection.currentMonthlySavings, country, { compact: true })}/mo
        </span>
        . At your current savings rate, your monthly income needs to grow{" "}
        <span className="font-semibold text-amber-600 dark:text-amber-400">
          {raisePercent.toFixed(1)}% per year
        </span>{" "}
        for the next {projection.freedomAge - projection.incomePlan[0]!.age} years — reaching{" "}
        <span className="font-semibold text-foreground">
          {projection.requiredMonthlyIncomeAtFreedom != null
            ? formatCurrency(projection.requiredMonthlyIncomeAtFreedom, country, { compact: true })
            : "—"}
          /mo
        </span>{" "}
        by age {projection.freedomAge}.
      </p>

      {!feasible && (
        <div className="rounded-md border border-red-500/30 bg-red-500/5 p-2 text-xs">
          <p className="flex items-center gap-1.5 font-semibold text-red-500">
            <AlertTriangle className="h-3.5 w-3.5" />
            That growth rate ({raisePercent.toFixed(1)}%/yr) is unrealistic for salary income.
          </p>
          <p className="mt-1 text-muted-foreground">
            Realistic options: (a) push your freedom age 3–5 years later, (b) raise your savings
            rate, (c) add a side income stream, (d) shift allocation toward higher expected return
            if your risk appetite allows.
          </p>
        </div>
      )}

      <div className="overflow-x-auto rounded-md border border-border bg-background">
        <table className="w-full text-xs">
          <thead className="bg-muted/40 uppercase tracking-wide text-muted-foreground">
            <tr>
              <th scope="col" className="px-2 py-1.5 text-left font-medium">
                Year
              </th>
              <th scope="col" className="px-2 py-1.5 text-left font-medium">
                Age
              </th>
              <th scope="col" className="px-2 py-1.5 text-right font-medium">
                Suggested income/mo
              </th>
              <th scope="col" className="px-2 py-1.5 text-right font-medium">
                Suggested SIP/mo
              </th>
            </tr>
          </thead>
          <tbody>
            {projection.incomePlan.map((row) => (
              <tr key={row.age} className="border-t border-border">
                <td className="px-2 py-1.5 font-medium">{row.yearsFromNow === 0 ? "Now" : `+${row.yearsFromNow}`}</td>
                <td className="px-2 py-1.5">{row.age}</td>
                <td className="px-2 py-1.5 text-right tabular-nums">
                  {formatCurrency(row.suggestedMonthlyIncome, country, { compact: true })}
                </td>
                <td className="px-2 py-1.5 text-right font-semibold tabular-nums">
                  {formatCurrency(row.suggestedMonthlySIP, country, { compact: true })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------

function EducationalAdvice({
  projection,
  country,
}: {
  projection: FreedomProjection;
  country: CountryProfile;
}) {
  const tips: Array<{ title: string; detail: string }> = [];
  const raisePct = projection.requiredAnnualIncomeGrowth * 100;
  const shortfall = projection.monthlyShortfall;

  // Country-agnostic structural advice
  tips.push({
    title: `Inflation is the silent thief in ${country.name}`,
    detail: `At ${(projection.inflationRateUsed * 100).toFixed(1)}%/yr, costs roughly double every ${Math.round(72 / (projection.inflationRateUsed * 100))} years. That's why today's "comfortable" corpus won't feel comfortable in ${projection.freedomAge - (projection.incomePlan[0]?.age ?? 30)} years — we size the target for what you'll actually spend then, not today.`,
  });

  if (shortfall > 0 && raisePct > 0 && raisePct < 15) {
    tips.push({
      title: `Aim for a ${raisePct.toFixed(1)}% raise every year`,
      detail: `The current job market typically rewards skills-in-demand with 8–12% raises. Benchmark your comp on Glassdoor / Levels.fyi / AmbitionBox annually. If your employer won't match the market, switching jobs every 3–4 years historically produces higher lifetime income than staying.`,
    });
  }

  if (shortfall > 0 && raisePct >= 15) {
    tips.push({
      title: "The gap is too big for salary growth alone",
      detail: `A ${raisePct.toFixed(1)}% year-on-year raise is above what most salary careers produce. Consider: (a) pushing freedom age to ${projection.freedomAge + 3}–${projection.freedomAge + 5}, (b) raising savings rate toward 40–50%, (c) adding a side income (freelance, dividends, rent), or (d) increasing portfolio risk modestly if you have a long horizon.`,
    });
  }

  tips.push({
    title: "The 50/30/20 starting point",
    detail: `A widely-used budget: 50% needs, 30% wants, 20% savings. But for an ambitious freedom age, many real-world FIRE-pursuers push savings to 30–50%. Your current savings rate is the single biggest lever you control.`,
  });

  tips.push({
    title: "Automate the SIP on payday",
    detail: `Set up an auto-debit SIP within 2 days of your salary credit. Research on spending behaviour (Thaler, Benartzi — "Save More Tomorrow") shows people stick to savings targets ~3× better when money leaves the account before they see it.`,
  });

  tips.push({
    title: "Review annually, not monthly",
    detail: `Check the plan on your birthday or January 1. Don't rebalance on every market dip — that's where most retail investors lose money. Compounding rewards consistency, not activity.`,
  });

  if (country.code === "IN") {
    tips.push({
      title: "India-specific: max out tax-advantaged accounts first",
      detail: `Before regular mutual funds, fill your ELSS (80C), NPS Tier-1 (80CCD), and PPF limits. These reduce your tax outgo by 20–30% of contributions — an instant, risk-free boost to your effective savings rate.`,
    });
  }

  if (country.code === "AE" || country.code === "SA") {
    tips.push({
      title: "Gulf-specific: plan for end-of-service and residency change",
      detail: `No personal tax means your gross = net — a massive compounding advantage. But benefits pause when you leave the country: keep at least 12 months of expenses in a home-country account, and invest through a broker that supports your eventual residency country (Interactive Brokers is the usual choice).`,
    });
  }

  if (country.code === "US") {
    tips.push({
      title: "US-specific: fill the 401(k) match first, then IRA",
      detail: `Employer 401(k) match is a literal 50–100% instant return on your contribution — fill it before any other investment. Then max the Roth IRA ($7,000/yr in 2024, tax-free growth). Any savings beyond that can go into a taxable brokerage account for flexibility.`,
    });
  }

  return (
    <div className="space-y-2 rounded-lg border border-primary/30 bg-primary/5 p-3">
      <p className="flex items-center gap-2 text-sm font-semibold">
        <Lightbulb className="h-4 w-4 text-primary" />
        Education — what the data says you should do next
      </p>
      <ul className="space-y-2">
        {tips.map((t) => (
          <li key={t.title} className="rounded-md border border-border bg-background p-2.5">
            <p className="text-sm font-medium">{t.title}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{t.detail}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
