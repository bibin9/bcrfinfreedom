import { AlertTriangle, Flame, Lightbulb, Sprout, TrendingUp, Trophy } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible } from "@/components/ui/collapsible";
import { ExportPlanButton } from "@/components/dashboard/ExportPlanButton";
import { Progress } from "@/components/ui/progress";
import { Term } from "@/components/ui/term";
import { WealthProjection } from "@/components/charts/WealthProjection";
import { SavingsRateCurve } from "@/components/charts/SavingsRateCurve";
import type { CountryProfile, FreedomProjection } from "@/types";
import { formatCurrency } from "@/lib/formatters";
import { useI18n } from "@/i18n";
import { citiesFor } from "@/data/cities";

interface Props {
  country: CountryProfile;
  projection: FreedomProjection;
  age: number;
  /** User's current savings rate (0..1) — drives the FIRE curve highlight. */
  savingsRate?: number;
  /** User's current invested corpus — drives the FI Ratio progress meter. */
  currentCorpus?: number;
}

type Vars = Record<string, string | number>;

/** `t` scoped to dash.freedom, plus a years formatter in the user's language. */
function useFreedomText() {
  const { t, countryName, cityName, lang } = useI18n();
  const f = (key: string, vars?: Vars) => t(`dash.freedom.${key}`, vars);
  const years = (v: number | null | undefined) => {
    if (v == null || !Number.isFinite(v)) return "—";
    if (v < 1) return t("dash.common.lessThanYear");
    const r = Math.round(v * 10) / 10;
    return r === 1 ? t("dash.common.year1") : t("dash.common.years", { n: r });
  };
  return { t, f, years, countryName, cityName, lang };
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
  const { f } = useFreedomText();
  const v = (key: string, vars?: Vars) => f(`verdict.${key}`, vars);
  const yearsAhead = yearsLeft != null ? Math.round(yearsLeft) : null;
  const wontMake = yearsLeft == null || yearsAhead == null || yearsAhead > 60;
  let tone: "emerald" | "amber" | "red" = "amber";
  let headline = "";
  let advice = "";
  if (onTrack) {
    tone = "emerald";
    headline = v("onTrackHead", { age: freedomAge });
    advice = v("onTrackAdvice");
  } else if (wontMake) {
    tone = "red";
    headline = v("wontHead");
    advice = v("wontAdvice");
  } else if (shortfall > 0 && yearsAhead != null && yearsAhead > freedomAge - age) {
    headline = v("lateHead", { paceAge: age + yearsAhead, age: freedomAge });
    advice = v("lateAdvice", { years: yearsAhead - (freedomAge - age) });
  } else {
    headline = v("closeHead", { age: freedomAge });
    advice = v("closeAdvice");
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
        <strong className="text-foreground">{v("progressLabel")}</strong>{" "}
        {v("progressBody", { pct: fiRatio.toFixed(1) })}
        {onTrack && fiRatio < 10 && <> {v("earlyNote")}</>}
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
  const { f, years, countryName, cityName } = useFreedomText();
  const yearsLeft = projection.yearsToFreedomAtCurrentRate;
  const freedomAge = projection.freedomAge;
  const money = (n: number) => formatCurrency(n, country, { compact: true });
  const city = projection.cityName
    ? citiesFor(country.code).find((c) => c.name === projection.cityName)
    : undefined;
  const place = city
    ? cityName(country.code, city.id, city.name)
    : projection.cityName ?? countryName(country.code, country.name);

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
          {f("title")}
          <span className="ms-auto rounded-full bg-orange-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-orange-600 dark:text-orange-400">
            {f("badge")}
          </span>
        </CardTitle>
        <CardDescription>
          {f("desc", {
            age: freedomAge,
            country: countryName(country.code, country.name),
            inflation: (projection.inflationRateUsed * 100).toFixed(1),
          })}
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
          <div className="mb-2 flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                <Term hint k="FI Ratio">
                  {f("fiLabel")}
                </Term>
              </p>
              <p className="text-2xl font-bold tabular-nums text-orange-600 dark:text-orange-400">
                {fiRatio.toFixed(1)}%
              </p>
            </div>
            <div className="text-end">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                {f("todayNumber")}
              </p>
              <p className="text-base font-semibold tabular-nums">{money(todayFireNumber)}</p>
              <p className="text-[10px] text-muted-foreground">
                {f("todayBasis", {
                  amount: money(projection.currentAnnualExpenses),
                  basis:
                    projection.expenseBasis === "override"
                      ? f("basisOverride")
                      : f(projection.householdSize === "family" ? "basisFamily" : "basisSingle", {
                          place,
                        }),
                })}
              </p>
            </div>
          </div>
          <Progress value={fiRatio} aria-label={f("fiLabel")} />
          <p className="mt-2 text-[11px] text-muted-foreground">
            {f("fiHint")}{" "}
            {fiRatio < 25
              ? f("phase1")
              : fiRatio < 50
                ? f("phase2")
                : fiRatio < 100
                  ? f("phase3")
                  : f("phase4")}
          </p>
        </div>

        {/* Headline metrics */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
          <Metric
            label={f("mNumber", { age: freedomAge })}
            value={money(projection.targetCorpus)}
            hint={f("mNumberHint", { amount: money(projection.annualExpenses) })}
          />
          <Metric
            label={f("mSpend")}
            value={money(projection.annualExpenses / 12)}
            hint={f("mSpendHint", { amount: money(projection.currentAnnualExpenses / 12) })}
          />
          <Metric
            label={f("mSip", { age: freedomAge })}
            value={projection.requiredMonthlySIP != null ? money(projection.requiredMonthlySIP) : "—"}
            hint={
              projection.monthlyShortfall > 0
                ? f("mShort", { amount: money(projection.monthlyShortfall) })
                : f("mCovered")
            }
            accent={projection.monthlyShortfall > 0 ? "red" : "emerald"}
          />
          <Metric
            label={f("mYears")}
            value={years(yearsLeft)}
            hint={onTrack ? f("mYearsOk") : f("mYearsSlow")}
            accent={onTrack ? "emerald" : "amber"}
          />
        </div>

        {/* PRIMARY CHART — stays visible, the one anchor the eye needs */}
        <div>
          <h3 className="mb-2 text-sm font-medium">{f("chartTitle")}</h3>
          <p className="mb-2 text-[11px] text-muted-foreground">{f("chartHint")}</p>
          <WealthProjection projection={projection} country={country} />
        </div>

        {/* --- Everything below is "nice to have" — folded by default so new */}
        {/*     users aren't overwhelmed. Power users expand what they need. */}

        <Collapsible title={f("tiersTitle")} subtitle={f("tiersSub")}>
          <FireTiers projection={projection} country={country} />
        </Collapsible>

        <Collapsible title={f("curveTitle")} subtitle={f("curveSub")}>
          <p className="mb-2 text-[11px] text-muted-foreground">
            {f("curveHint", {
              real: (Math.max(0.01, country.expectedEquityReturn - country.inflationRate) * 100).toFixed(1),
            })}
          </p>
          <SavingsRateCurve curve={projection.savingsRateCurve} currentRate={savingsRate} />
        </Collapsible>

        <Collapsible title={f("byAgeTitle")}>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {([
              [50, byAge.byAge50],
              [55, byAge.byAge55],
              [60, byAge.byAge60],
            ] as const).map(([a, v]) => (
              <Metric
                key={a}
                label={f("by", { age: a })}
                value={v != null ? money(v) : "—"}
                hint={v != null ? f("inflAdj") : f("pastAge")}
              />
            ))}
          </div>
        </Collapsible>

        {projection.monthlyShortfall > 0 && (
          <IncomeGrowthPlan projection={projection} country={country} raisePercent={raisePercent} />
        )}

        <Collapsible title={f("tipsTitle")} subtitle={f("tipsSub")}>
          <EducationalAdvice projection={projection} country={country} />
        </Collapsible>

        {/* Export CTA — natural place after reading the full plan */}
        <div className="flex flex-col items-center gap-2 rounded-lg border border-orange-500/30 bg-orange-500/5 p-4 text-center">
          <p className="text-sm font-semibold">{f("exportTitle")}</p>
          <p className="text-xs text-muted-foreground">{f("exportBody")}</p>
          <ExportPlanButton size="lg" />
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
  const { f } = useFreedomText();
  const tiers = projection.fireTiers;
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <TierCard
          icon={<Sprout className="h-4 w-4 text-emerald-500" />}
          name="LeanFIRE"
          subtitle={f("tiers.leanSub")}
          target={tiers.lean.targetCorpus}
          years={tiers.lean.yearsAtCurrentSavings}
          country={country}
        />
        <TierCard
          icon={<Flame className="h-4 w-4 text-orange-500" />}
          name="FIRE"
          subtitle={f("tiers.fireSub")}
          target={tiers.standard.targetCorpus}
          years={tiers.standard.yearsAtCurrentSavings}
          country={country}
          highlight
        />
        <TierCard
          icon={<Trophy className="h-4 w-4 text-amber-500" />}
          name="FatFIRE"
          subtitle={f("tiers.fatSub")}
          target={tiers.fat.targetCorpus}
          years={tiers.fat.yearsAtCurrentSavings}
          country={country}
        />
        <TierCard
          icon={<TrendingUp className="h-4 w-4 text-blue-500" />}
          name="CoastFIRE"
          subtitle={f("tiers.coastSub")}
          target={tiers.coastTodayCorpus}
          years={null}
          country={country}
          coastNote
        />
      </div>
      <p className="text-[11px] text-muted-foreground">
        {f("tiers.legend", { age: projection.freedomAge })}
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
  highlight,
  coastNote,
}: {
  icon: React.ReactNode;
  name: string;
  subtitle: string;
  target: number;
  years: number | null;
  country: CountryProfile;
  highlight?: boolean;
  coastNote?: boolean;
}) {
  const { f, years: fmtYears } = useFreedomText();
  // Only the primary FIRE tier keeps strong orange emphasis. The other 3 tiers
  // use a quiet neutral border — hierarchy via contrast, not competing colour.
  const ringClass = highlight
    ? "border-orange-500/50 ring-1 ring-orange-500/40 bg-orange-500/5"
    : "border-border bg-card";
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
      <p className="text-[11px] text-muted-foreground">
        {coastNote
          ? f("tiers.coastNote")
          : years != null
            ? years <= 0
              ? f("tiers.already")
              : f("tiers.atCurrent", { years: fmtYears(years) })
            : f("tiers.unreachable")}
      </p>
    </div>
  );
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
  const { f } = useFreedomText();
  const i = (key: string, vars?: Vars) => f(`income.${key}`, vars);
  const money = (n: number) => formatCurrency(n, country, { compact: true });
  const feasible = raisePercent > 0 && raisePercent < 25;

  return (
    <div className="space-y-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
      <div className="flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-amber-500" />
        <p className="text-sm font-semibold">{i("title")}</p>
      </div>
      <p className="text-xs text-muted-foreground">
        {i("body", {
          age: projection.freedomAge,
          sip: money(projection.requiredMonthlySIP ?? 0),
          saved: money(projection.currentMonthlySavings),
          pct: raisePercent.toFixed(1),
          years: projection.freedomAge - projection.incomePlan[0]!.age,
          income:
            projection.requiredMonthlyIncomeAtFreedom != null
              ? money(projection.requiredMonthlyIncomeAtFreedom)
              : "—",
        })}
      </p>

      {!feasible && (
        <div className="rounded-md border border-red-500/30 bg-red-500/5 p-2 text-xs">
          <p className="flex items-center gap-1.5 font-semibold text-red-500">
            <AlertTriangle className="h-3.5 w-3.5" />
            {i("unrealistic", { pct: raisePercent.toFixed(1) })}
          </p>
          <p className="mt-1 text-muted-foreground">{i("options")}</p>
        </div>
      )}

      <div className="overflow-x-auto rounded-md border border-border bg-background">
        <table className="w-full text-xs">
          <thead className="bg-muted/40 uppercase tracking-wide text-muted-foreground">
            <tr>
              <th scope="col" className="px-2 py-1.5 text-start font-medium">
                {i("colYear")}
              </th>
              <th scope="col" className="px-2 py-1.5 text-start font-medium">
                {i("colAge")}
              </th>
              <th scope="col" className="px-2 py-1.5 text-end font-medium">
                {i("colIncome")}
              </th>
              <th scope="col" className="px-2 py-1.5 text-end font-medium">
                {i("colSip")}
              </th>
            </tr>
          </thead>
          <tbody>
            {projection.incomePlan.map((row) => (
              <tr key={row.age} className="border-t border-border">
                <td className="px-2 py-1.5 font-medium">
                  {row.yearsFromNow === 0 ? i("now") : `+${row.yearsFromNow}`}
                </td>
                <td className="px-2 py-1.5">{row.age}</td>
                <td className="px-2 py-1.5 text-end tabular-nums">{money(row.suggestedMonthlyIncome)}</td>
                <td className="px-2 py-1.5 text-end font-semibold tabular-nums">
                  {money(row.suggestedMonthlySIP)}
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
  const { f, countryName } = useFreedomText();
  const tip = (key: string, vars?: Vars) => ({
    title: f(`tips.${key}Title`, vars),
    detail: f(`tips.${key}Body`, vars),
  });
  const tips: Array<{ title: string; detail: string }> = [];
  const raisePct = projection.requiredAnnualIncomeGrowth * 100;
  const shortfall = projection.monthlyShortfall;
  const inflPct = projection.inflationRateUsed * 100;

  tips.push(
    tip("infl", {
      country: countryName(country.code, country.name),
      pct: inflPct.toFixed(1),
      double: Math.round(72 / inflPct),
      years: projection.freedomAge - (projection.incomePlan[0]?.age ?? 30),
    }),
  );
  if (shortfall > 0 && raisePct > 0 && raisePct < 15) {
    tips.push(tip("raise", { pct: raisePct.toFixed(1) }));
  }
  if (shortfall > 0 && raisePct >= 15) {
    tips.push(
      tip("gap", {
        pct: raisePct.toFixed(1),
        from: projection.freedomAge + 3,
        to: projection.freedomAge + 5,
      }),
    );
  }
  tips.push(tip("budget"), tip("auto"), tip("review"));
  if (country.code === "IN") tips.push(tip("in"));
  if (country.code === "AE" || country.code === "SA") tips.push(tip("gulf"));
  if (country.code === "US") tips.push(tip("us"));

  return (
    <div className="space-y-2 rounded-lg border border-primary/30 bg-primary/5 p-3">
      <p className="flex items-center gap-2 text-sm font-semibold">
        <Lightbulb className="h-4 w-4 text-primary" />
        {f("tips.header")}
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
