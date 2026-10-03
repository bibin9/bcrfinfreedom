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
  name: string;
  tagline: string;
  startAge: number;
  endAge: number;
  color: string;        // tailwind hue used in chip backgrounds
  hsl: string;          // raw HSL used in inline SVG fills
  icon: React.ComponentType<{ className?: string }>;
  money: string[];
  health: string[];
  life: string[];
}

const PHASES: Phase[] = [
  {
    id: "foundation",
    name: "Foundation",
    tagline: "Education, first job, healthy habits",
    startAge: 18,
    endAge: 25,
    color: "blue",
    hsl: "217 91% 60%",
    icon: GraduationCap,
    money: [
      "Pick a career with rising demand — engineering, healthcare, AI, finance, trades",
      "Open your first bank + brokerage account; learn how SIPs and index funds work",
      "Save 10–20% of first paycheck. Even ₹2,000/mo at 22 = ₹1+ Cr at 60",
      "Build a 3-month emergency fund before any investing",
    ],
    health: [
      "Build a daily movement habit (walk 8k steps, gym 3×/week, sport you love)",
      "Sleep 7–8 hrs — sets the brain wiring for the next 40 years",
      "Cook your own food 5+ days/week. Avoid the 'office canteen' weight",
      "No smoking, alcohol in moderation — habits at 20 compound the same as money",
    ],
    life: [
      "Invest in 2–3 deep friendships, not 50 shallow ones",
      "Read 20+ books/yr; pick mentors you'd want to be in 20 years",
      "Travel light, often — explore before responsibilities multiply",
    ],
  },
  {
    id: "build",
    name: "Build",
    tagline: "Career growth · save 30%+ · build the base",
    startAge: 25,
    endAge: 35,
    color: "emerald",
    hsl: "160 84% 39%",
    icon: Briefcase,
    money: [
      "Push savings rate to 30–40%. Each 5% lops 3–5 yrs off your FIRE timeline",
      "Max tax-advantaged accounts: ELSS / PPF / NPS / EPF in India, 401k/IRA in US, ISA in UK",
      "Automate SIPs the day after payday — make it impossible to skip",
      "Take 1 big career bet (switch, side project, certification) every 2–3 years",
    ],
    health: [
      "Annual checkup + bloodwork. Lipid panel, vitamin D, fasting glucose",
      "Strength train 2× / week — muscle mass peaks in 30s, defend it",
      "Limit ultra-processed food; build a 4–5 recipe rotation you actually like",
      "Mental health: therapy, journaling, or meditation — pick one and stick",
    ],
    life: [
      "Pick a life partner deliberately, not by default",
      "Decide deliberately about kids — timing affects every other plan",
      "Start a 'no-screens' weekend ritual: nature, board games, friends",
    ],
  },
  {
    id: "accelerate",
    name: "Accelerate",
    tagline: "Peak earning · family · max SIPs",
    startAge: 35,
    endAge: 50,
    color: "orange",
    hsl: "24 95% 53%",
    icon: TrendingUp,
    money: [
      "Peak earning years — most of your lifetime corpus is built here",
      "Salary should grow 8–12% / yr. Negotiate hard or switch every 3–4 yrs",
      "Buy your primary home with ≤40% of income going to EMI (or rent + invest)",
      "Open separate goals: kids' education, home, FIRE corpus — different time horizons",
      "Term life insurance (10–15× income) + health insurance for the whole family",
    ],
    health: [
      "Cardio + strength + mobility — pick one of each every week",
      "Watch the waistline. Visceral fat in the 40s drives every major disease later",
      "Sleep on a schedule. Phone out of bedroom",
      "Yearly: full bloodwork, dental, eye, skin check. Colonoscopy from 45",
    ],
    life: [
      "Quality time with kids > expensive gifts — be present, not just provider",
      "Strengthen marriage with weekly date nights and shared goals",
      "Mentor someone 10 years behind you — it sharpens your own thinking",
      "Don't sacrifice friendships for work — loneliness kills earlier than smoking",
    ],
  },
  {
    id: "coast",
    name: "Coast",
    tagline: "Transition · mentor · hobbies",
    startAge: 50,
    endAge: 60,
    color: "amber",
    hsl: "38 92% 50%",
    icon: Leaf,
    money: [
      "Once you hit CoastFIRE, you can downshift to work you love",
      "De-risk slightly: lift bond allocation 5–10%; keep equity for inflation cover",
      "Plan tax-efficient withdrawal order (taxable → tax-deferred → tax-free)",
      "Help kids without funding their lives — pay for education, not lifestyle",
    ],
    health: [
      "Add resistance training if you haven't — slows muscle loss after 50",
      "Bone density scan, prostate / breast screening, full cardiac workup",
      "Pickleball / tennis / swimming — joint-friendly cardio you'll do for 20+ yrs",
      "Hearing test by 55 — untreated hearing loss accelerates dementia risk",
    ],
    life: [
      "Pick 2–3 hobbies you'd happily do for 30 years",
      "Reconnect with old friends; widen your social circle deliberately",
      "Start a passion project — write, teach, coach, build something",
      "Spend 1 month / yr somewhere new with your partner",
    ],
  },
  {
    id: "fire",
    name: "FIRE / Retire",
    tagline: "Live off withdrawals · purpose · presence",
    startAge: 60,
    endAge: 75,
    color: "red",
    hsl: "0 84% 60%",
    icon: Flame,
    money: [
      "Withdraw 3.5–4% of corpus per year, rebalance annually",
      "Healthcare buffer: dedicate 12–18 months of expenses in liquid funds",
      "Long-term care insurance evaluation by 65",
      "Estate plan: will, nominees on every account, power of attorney",
    ],
    health: [
      "Strength training is non-negotiable — prevents falls (the #1 elderly killer)",
      "Walk 8–10k steps daily; balance work (single-leg stands, tai chi)",
      "Stay socially active — loneliness in 60s+ = 50% higher dementia risk",
      "Annual cognitive checkup; manage BP, sugar, cholesterol aggressively",
    ],
    life: [
      "Time with grandkids, friends, partner — relationships > possessions",
      "Volunteer or part-time meaningful work — purpose extends lifespan",
      "Travel while you still can — mobility narrows fast after 75",
      "Document family stories, recipes, lessons — your legacy is memory",
    ],
  },
  {
    id: "legacy",
    name: "Legacy",
    tagline: "Wisdom · generosity · presence",
    startAge: 75,
    endAge: 95,
    color: "violet",
    hsl: "271 91% 65%",
    icon: HandHeart,
    money: [
      "Gradual gifting to family / causes (within tax-efficient limits)",
      "Stay in low-volatility instruments for spending, equities for legacy bucket",
      "Review and update will every 2–3 years",
    ],
    health: [
      "Physical therapist + chair-based strength program if mobility drops",
      "Vision, hearing, dental — most underrated quality-of-life levers",
      "Diet: protein-forward (1.2 g/kg) prevents sarcopenia",
    ],
    life: [
      "Daily contact with someone — phone, visit, walking group",
      "Teach what you know — to grandkids, online, in your community",
      "Keep a routine: rising time, walk, meal times. Routine = clarity",
    ],
  },
];

// ---------------------------------------------------------------------------

export function LifePlanCard({ age, freedomAge, country, projection }: Props) {
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
          Your life plan
          <span className="ml-auto rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-red-600 dark:text-red-400">
            Money · health · relationships
          </span>
        </CardTitle>
        <CardDescription>
          Financial freedom isn't just a number — it's a sequence of decades, each with its own
          priorities. Here's the path from 18 to 90+, with the current decade highlighted for you.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Life timeline visualization */}
        <LifeTimeline phases={PHASES} age={age} freedomAge={freedomAge} />

        {/* Life progress bar */}
        <div className="rounded-lg border border-border bg-muted/30 p-3">
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              Age {age} of ~85 (avg life expectancy)
            </span>
            <span className="font-semibold tabular-nums">{lifePct.toFixed(0)}% lived</span>
          </div>
          <Progress value={lifePct} aria-label="Life lived" />
          <p className="mt-2 text-[11px] text-muted-foreground">
            You have about <strong>{Math.max(0, 85 - age)} years</strong> of life ahead and{" "}
            <strong>{Math.max(0, freedomAge - age)} years</strong> until FIRE — that's the working
            window the rest of the app is built around.
          </p>
        </div>

        {/* CURRENT FOCUS — most important section */}
        <CurrentFocus phase={currentPhase} nextPhase={nextPhase} age={age} country={country} projection={projection} />

        {/* All phases (collapsible decade-by-decade) */}
        <div>
          <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold">
            <Sparkles className="h-4 w-4 text-orange-500" />
            All life phases — what to focus on, decade by decade
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
            The one rule that ties it all together
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Money buys time. Health spends it. Relationships fill it. Underweight any of the three
            and the other two stop mattering. Optimise <em>all three together</em> — every decade,
            every month, every Sunday plan.
          </p>
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

  const xFor = (a: number) => padX + ((a - minAge) / (maxAge - minAge)) * (W - 2 * padX);

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-card p-2">
      <svg viewBox={`0 0 ${W} ${H}`} className="block min-w-[640px] w-full" role="img"
        aria-label="Life plan timeline from age 18 to 95">
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
                {p.name}
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
            YOU
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
              FIRE @ {freedomAge}
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
            You are in the · {phase.name} · phase
          </p>
          <p className="mt-0.5 text-lg font-bold" style={{ color: `hsl(${phase.hsl})` }}>
            <Icon className="mb-0.5 mr-1 inline h-5 w-5" />
            {phase.tagline}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
            Years in this phase
          </p>
          <p className="text-lg font-bold tabular-nums" style={{ color: `hsl(${phase.hsl})` }}>
            {yearsLeftInPhase}
          </p>
        </div>
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-3">
        <FocusColumn icon={<Coins className="h-4 w-4" />} title="Money this decade" items={phase.money} hsl={phase.hsl} />
        <FocusColumn icon={<Activity className="h-4 w-4" />} title="Health this decade" items={phase.health} hsl={phase.hsl} />
        <FocusColumn icon={<Users className="h-4 w-4" />} title="Life this decade" items={phase.life} hsl={phase.hsl} />
      </div>

      {nextPhase && (
        <div className="mt-3 rounded-md border border-border bg-background/60 p-2.5">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
            Up next at age {nextPhase.startAge}
          </p>
          <p className="text-xs font-medium">
            <strong style={{ color: `hsl(${nextPhase.hsl})` }}>{nextPhase.name}</strong> —{" "}
            {nextPhase.tagline}
          </p>
        </div>
      )}

      <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-muted-foreground sm:grid-cols-4">
        <Stat label="Country" value={country.name} />
        <Stat label="FIRE target" value={`age ${projection.freedomAge}`} />
        <Stat
          label="At current savings"
          value={
            projection.yearsToFreedomAtCurrentRate != null
              ? `~${Math.round(projection.yearsToFreedomAtCurrentRate)} yrs`
              : "unreachable"
          }
        />
        <Stat label="Phase color" value={phase.name} />
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
            {phase.name}
            <span className="text-xs font-normal text-muted-foreground">
              · age {phase.startAge}–{phase.endAge}
            </span>
            {isCurrent && (
              <span className="rounded-full bg-orange-500/15 px-2 py-0.5 text-[10px] font-semibold text-orange-600 dark:text-orange-400">
                You are here
              </span>
            )}
          </p>
          <p className="text-xs text-muted-foreground">{phase.tagline}</p>
        </div>
        <span className="text-xs text-muted-foreground group-open:rotate-180 transition">
          ▾
        </span>
      </summary>
      <div className="grid gap-2 border-t border-border p-3 md:grid-cols-3">
        <FocusColumn icon={<Coins className="h-4 w-4" />} title="Money" items={phase.money} hsl={phase.hsl} />
        <FocusColumn icon={<Activity className="h-4 w-4" />} title="Health" items={phase.health} hsl={phase.hsl} />
        <FocusColumn icon={<Users className="h-4 w-4" />} title="Life" items={phase.life} hsl={phase.hsl} />
      </div>
    </details>
  );
}

// ---------------------------------------------------------------------------

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}
