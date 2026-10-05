import {
  Activity,
  Brain,
  Briefcase,
  Coins,
  Flame,
  GraduationCap,
  HandHeart,
  HeartPulse,
  Leaf,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { CountryProfile, FreedomProjection } from "@/types";
import { useI18n } from "@/i18n";

interface Props {
  age: number;
  freedomAge: number;
  country: CountryProfile;
  projection: FreedomProjection;
}

// ---------------------------------------------------------------------------
// Phases — each is a chunk of life with money / health / life priorities.
// Ages overlap intentionally where they reflect overlapping seasons.

interface Phase {
  id: string;
  startAge: number;
  endAge: number;
  color: string;        // tailwind hue used in chip backgrounds
  hsl: string;          // raw HSL used in inline SVG fills
  icon: React.ComponentType<{ className?: string }>;
}

/** Display text for a phase, in the user's language (dash.life.phases.<id>). */
interface PhaseText {
  name: string;
  tagline: string;
  money: string[];
  health: string[];
  life: string[];
}

const PHASES: Phase[] = [
  { id: "foundation", startAge: 18, endAge: 25, color: "blue", hsl: "217 91% 60%", icon: GraduationCap },
  { id: "build", startAge: 25, endAge: 35, color: "emerald", hsl: "160 84% 39%", icon: Briefcase },
  { id: "accelerate", startAge: 35, endAge: 50, color: "orange", hsl: "24 95% 53%", icon: TrendingUp },
  { id: "coast", startAge: 50, endAge: 60, color: "amber", hsl: "38 92% 50%", icon: Leaf },
  { id: "fire", startAge: 60, endAge: 75, color: "red", hsl: "0 84% 60%", icon: Flame },
  { id: "legacy", startAge: 75, endAge: 95, color: "violet", hsl: "271 91% 65%", icon: HandHeart },
];

function usePhaseText() {
  const { t, tList } = useI18n();
  return (id: string): PhaseText => ({
    name: t(`dash.life.phases.${id}.name`),
    tagline: t(`dash.life.phases.${id}.tagline`),
    money: tList(`dash.life.phases.${id}.money`),
    health: tList(`dash.life.phases.${id}.health`),
    life: tList(`dash.life.phases.${id}.life`),
  });
}

// ---------------------------------------------------------------------------

export function LifePlanCard({ age, freedomAge, country, projection }: Props) {
  const { t } = useI18n();
  const l = (key: string, vars?: Record<string, string | number>) => t(`dash.life.${key}`, vars);
  const currentPhase =
    PHASES.find((p) => age >= p.startAge && age < p.endAge) ?? PHASES[PHASES.length - 1];
  const nextPhase = PHASES[PHASES.indexOf(currentPhase) + 1];

  // Where the user is in life, 0–100% on a 18–95 scale.
  const lifePct = clamp(((age - 18) / (95 - 18)) * 100, 0, 100);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HeartPulse className="h-5 w-5 text-red-500" />
          {l("title")}
          <span className="ms-auto rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-red-600 dark:text-red-400">
            {l("badge")}
          </span>
        </CardTitle>
        <CardDescription>{l("desc")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Life timeline visualization */}
        <LifeTimeline phases={PHASES} age={age} freedomAge={freedomAge} />

        {/* Life progress bar */}
        <div className="rounded-lg border border-border bg-muted/30 p-3">
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{l("lifeAge", { age })}</span>
            <span className="font-semibold tabular-nums">
              {l("lived", { pct: lifePct.toFixed(0) })}
            </span>
          </div>
          <Progress value={lifePct} aria-label={l("livedAria")} />
          <p className="mt-2 text-[11px] text-muted-foreground">
            {l("ahead", { life: Math.max(0, 85 - age), work: Math.max(0, freedomAge - age) })}
          </p>
        </div>

        {/* CURRENT FOCUS — most important section */}
        <CurrentFocus phase={currentPhase} nextPhase={nextPhase} age={age} country={country} projection={projection} />

        {/* All phases (collapsible decade-by-decade) */}
        <div>
          <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold">
            <Sparkles className="h-4 w-4 text-orange-500" />
            {l("allPhases")}
          </h3>
          <div className="space-y-2">
            {PHASES.map((p) => (
              <PhaseAccordion
                key={p.id}
                phase={p}
                isCurrent={p.id === currentPhase.id}
              />
            ))}
          </div>
        </div>

        {/* Closing guidance */}
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
          <p className="flex items-center gap-2 text-sm font-semibold">
            <Brain className="h-4 w-4 text-primary" />
            {l("ruleTitle")}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{l("ruleBody")}</p>
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// LifeTimeline — horizontal SVG visualization of all phases with age markers
// and the user's current age and freedom age marked.

function LifeTimeline({
  phases,
  age,
  freedomAge,
}: {
  phases: Phase[];
  age: number;
  freedomAge: number;
}) {
  const minAge = 18;
  const maxAge = 95;
  const W = 1000;
  const H = 150;
  const padX = 40;
  const trackY = 64;
  const trackH = 36;

  const { t } = useI18n();
  const text = usePhaseText();
  const xFor = (a: number) => padX + ((a - minAge) / (maxAge - minAge)) * (W - 2 * padX);

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-card p-2">
      <svg viewBox={`0 0 ${W} ${H}`} className="block min-w-[640px] w-full" role="img"
        aria-label={t("dash.life.timelineAria")}>
        {/* Phase bands */}
        {phases.map((p) => {
          const x1 = xFor(p.startAge);
          const x2 = xFor(p.endAge);
          const isCurrent = age >= p.startAge && age < p.endAge;
          return (
            <g key={p.id}>
              <rect
                x={x1}
                y={trackY}
                width={x2 - x1}
                height={trackH}
                fill={`hsl(${p.hsl})`}
                opacity={isCurrent ? 0.95 : 0.5}
                rx={6}
              />
              <text
                x={(x1 + x2) / 2}
                y={trackY + trackH / 2 + 5}
                textAnchor="middle"
                fontSize="14"
                fontWeight="700"
                fill="white"
              >
                {text(p.id).name}
              </text>
              <text
                x={(x1 + x2) / 2}
                y={trackY + trackH + 18}
                textAnchor="middle"
                fontSize="11"
                fill={`hsl(${p.hsl})`}
                fontWeight="600"
              >
                {p.startAge}–{p.endAge}
              </text>
            </g>
          );
        })}

        {/* Age markers along the bottom */}
        {[20, 30, 40, 50, 60, 70, 80, 90].map((a) => (
          <g key={a}>
            <line
              x1={xFor(a)}
              y1={trackY + trackH + 28}
              x2={xFor(a)}
              y2={trackY + trackH + 34}
              stroke="hsl(var(--muted-foreground))"
              strokeWidth="1"
            />
          </g>
        ))}

        {/* Current age marker */}
        <g>
          <line
            x1={xFor(age)}
            y1={trackY - 18}
            x2={xFor(age)}
            y2={trackY + trackH + 4}
            stroke="hsl(var(--foreground))"
            strokeWidth="2"
            strokeDasharray="2 3"
          />
          <circle cx={xFor(age)} cy={trackY - 22} r="10" fill="hsl(var(--foreground))" />
          <text
            x={xFor(age)}
            y={trackY - 18}
            textAnchor="middle"
            fontSize="10"
            fontWeight="700"
            fill="hsl(var(--background))"
          >
            {age}
          </text>
          <text
            x={xFor(age)}
            y={trackY - 36}
            textAnchor="middle"
            fontSize="10"
            fontWeight="600"
            fill="hsl(var(--foreground))"
          >
            {t("dash.life.you")}
          </text>
        </g>

        {/* FIRE flag */}
        {freedomAge > age && freedomAge < maxAge && (
          <g>
            <line
              x1={xFor(freedomAge)}
              y1={trackY + trackH + 4}
              x2={xFor(freedomAge)}
              y2={trackY + trackH + 36}
              stroke="hsl(24 95% 53%)"
              strokeWidth="2"
            />
            <polygon
              points={`${xFor(freedomAge)},${trackY + trackH + 4} ${xFor(freedomAge) + 18},${trackY + trackH + 12} ${xFor(freedomAge)},${trackY + trackH + 20}`}
              fill="hsl(24 95% 53%)"
            />
            <text
              x={xFor(freedomAge) + 22}
              y={trackY + trackH + 16}
              fontSize="11"
              fontWeight="700"
              fill="hsl(24 95% 53%)"
            >
              {t("dash.life.fireAt", { age: freedomAge })}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}

// ---------------------------------------------------------------------------

function CurrentFocus({
  phase,
  nextPhase,
  age,
  country,
  projection,
}: {
  phase: Phase;
  nextPhase: Phase | undefined;
  age: number;
  country: CountryProfile;
  projection: FreedomProjection;
}) {
  const { t, countryName } = useI18n();
  const l = (key: string, vars?: Record<string, string | number>) => t(`dash.life.${key}`, vars);
  const text = usePhaseText();
  const cur = text(phase.id);
  const next = nextPhase ? text(nextPhase.id) : null;
  const Icon = phase.icon;
  const yearsLeftInPhase = Math.max(0, phase.endAge - age);
  return (
    <div
      className="rounded-lg border-2 p-4 shadow-sm"
      style={{
        borderColor: `hsl(${phase.hsl} / 0.5)`,
        background: `linear-gradient(135deg, hsl(${phase.hsl} / 0.12), hsl(${phase.hsl} / 0.03))`,
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
            {l("inPhase", { phase: cur.name })}
          </p>
          <p className="mt-0.5 text-lg font-bold" style={{ color: `hsl(${phase.hsl})` }}>
            <Icon className="mb-0.5 me-1 inline h-5 w-5" />
            {cur.tagline}
          </p>
        </div>
        <div className="text-end">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
            {l("yearsInPhase")}
          </p>
          <p className="text-lg font-bold tabular-nums" style={{ color: `hsl(${phase.hsl})` }}>
            {yearsLeftInPhase}
          </p>
        </div>
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-3">
        <FocusColumn icon={<Coins className="h-4 w-4" />} title={l("moneyDecade")} items={cur.money} hsl={phase.hsl} />
        <FocusColumn icon={<Activity className="h-4 w-4" />} title={l("healthDecade")} items={cur.health} hsl={phase.hsl} />
        <FocusColumn icon={<Users className="h-4 w-4" />} title={l("lifeDecade")} items={cur.life} hsl={phase.hsl} />
      </div>

      {nextPhase && next && (
        <div className="mt-3 rounded-md border border-border bg-background/60 p-2.5">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
            {l("upNext", { age: nextPhase.startAge })}
          </p>
          <p className="text-xs font-medium">
            <strong style={{ color: `hsl(${nextPhase.hsl})` }}>{next.name}</strong> — {next.tagline}
          </p>
        </div>
      )}

      <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-muted-foreground sm:grid-cols-4">
        <Stat label={l("statCountry")} value={countryName(country.code, country.name)} />
        <Stat label={l("statTarget")} value={l("statTargetValue", { age: projection.freedomAge })} />
        <Stat
          label={l("statPace")}
          value={
            projection.yearsToFreedomAtCurrentRate != null
              ? l("statPaceValue", { n: Math.round(projection.yearsToFreedomAtCurrentRate) })
              : l("statPaceNever")
          }
        />
        <Stat label={l("statPhase")} value={cur.name} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-background/60 p-1.5">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="text-xs font-semibold text-foreground">{value}</p>
    </div>
  );
}

function FocusColumn({
  icon,
  title,
  items,
  hsl,
}: {
  icon: React.ReactNode;
  title: string;
  items: string[];
  hsl: string;
}) {
  return (
    <div className="rounded-md border border-border bg-background/70 p-2.5">
      <p
        className="mb-1 flex items-center gap-1.5 text-xs font-semibold"
        style={{ color: `hsl(${hsl})` }}
      >
        {icon} {title}
      </p>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item} className="flex gap-1.5 text-[11px] text-muted-foreground">
            <span style={{ color: `hsl(${hsl})` }}>•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ---------------------------------------------------------------------------

function PhaseAccordion({ phase, isCurrent }: { phase: Phase; isCurrent: boolean }) {
  const { t } = useI18n();
  const text = usePhaseText()(phase.id);
  const Icon = phase.icon;
  return (
    <details
      open={isCurrent}
      className="group rounded-md border border-border bg-card transition"
      style={isCurrent ? { borderColor: `hsl(${phase.hsl} / 0.5)` } : undefined}
    >
      <summary className="flex cursor-pointer items-center gap-3 p-3 [&::-webkit-details-marker]:hidden">
        <span
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
          style={{ background: `hsl(${phase.hsl} / 0.15)`, color: `hsl(${phase.hsl})` }}
        >
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="flex items-baseline gap-2 text-sm font-semibold">
            {text.name}
            <span className="text-xs font-normal text-muted-foreground">
              · {t("dash.life.ages", { from: phase.startAge, to: phase.endAge })}
            </span>
            {isCurrent && (
              <span className="rounded-full bg-orange-500/15 px-2 py-0.5 text-[10px] font-semibold text-orange-600 dark:text-orange-400">
                {t("dash.life.youAreHere")}
              </span>
            )}
          </p>
          <p className="text-xs text-muted-foreground">{text.tagline}</p>
        </div>
        <span className="text-xs text-muted-foreground group-open:rotate-180 transition">
          ▾
        </span>
      </summary>
      <div className="grid gap-2 border-t border-border p-3 md:grid-cols-3">
        <FocusColumn icon={<Coins className="h-4 w-4" />} title={t("dash.life.money")} items={text.money} hsl={phase.hsl} />
        <FocusColumn icon={<Activity className="h-4 w-4" />} title={t("dash.life.health")} items={text.health} hsl={phase.hsl} />
        <FocusColumn icon={<Users className="h-4 w-4" />} title={t("dash.life.lifeCol")} items={text.life} hsl={phase.hsl} />
      </div>
    </details>
  );
}

// ---------------------------------------------------------------------------

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}
