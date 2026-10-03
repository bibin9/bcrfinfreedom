import { useMemo } from "react";
import { AlertTriangle, ShieldCheck, Sparkles } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { CountryProfile, UserInput } from "@/types";
import { computeTwoPaths } from "@/lib/twoPaths";
import { formatCurrency } from "@/lib/formatters";

interface Props {
  complete: UserInput;
  country: CountryProfile;
  expectedReturn: number;
  savingsRate: number;
  currentCorpus: number;
}

export function TwoPathsCard({
  complete,
  country,
  expectedReturn,
  savingsRate,
  currentCorpus,
}: Props) {
  const paths = useMemo(
    () =>
      computeTwoPaths({
        age: complete.age,
        monthlyIncome: complete.monthlyIncome,
        currentCorpus,
        savingsRate,
        expectedReturn,
        country,
      }),
    [complete, country, expectedReturn, savingsRate, currentCorpus],
  );

  const gap = paths.disciplined.finalAtRetirement - paths.drift.finalAtRetirement;
  const multiplier =
    paths.drift.finalAtRetirement > 0
      ? paths.disciplined.finalAtRetirement / paths.drift.finalAtRetirement
      : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Two paths — discipline vs drift</CardTitle>
        <CardDescription>
          Same age, same income, same country. What changes is whether you invest with discipline
          now — or drift into your 60s without a plan. Watch how the paths diverge.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <Tabs defaultValue="chart">
          <TabsList className="flex flex-wrap h-auto">
            <TabsTrigger value="chart">Wealth curves</TabsTrigger>
            <TabsTrigger value="timeline">Life timeline</TabsTrigger>
            <TabsTrigger value="stats">Side-by-side</TabsTrigger>
          </TabsList>

          <TabsContent value="chart" className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Both people start at age {complete.age} with the same corpus. The green curve
              invests {(savingsRate * 100).toFixed(0)}% of income at{" "}
              {(expectedReturn * 100).toFixed(1)}%. The red curve saves only 3% in bank deposits at
              ~4%. Both try to maintain the same lifestyle after age {paths.retirementAge}.
            </p>
            <div className="h-64 w-full sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={paths.points} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gDisc" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                    </linearGradient>
                    <linearGradient id="gDrift" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0.03} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="age"
                    tickLine={false}
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={11}
                  />
                  <YAxis
                    tickFormatter={(v) => formatCurrency(v, country, { compact: true })}
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={11}
                    width={70}
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(value: number, name) => [
                      formatCurrency(value, country, { compact: true }),
                      name === "disciplined" ? "Disciplined" : "Drifting",
                    ]}
                    labelFormatter={(a) => `Age ${a}`}
                  />
                  <Legend
                    formatter={(key) => (key === "disciplined" ? "Disciplined" : "Drifting")}
                  />
                  <ReferenceLine
                    x={paths.retirementAge}
                    stroke="hsl(var(--muted-foreground))"
                    strokeDasharray="3 3"
                    label={{
                      value: `Retirement ${paths.retirementAge}`,
                      fontSize: 10,
                      fill: "hsl(var(--muted-foreground))",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="disciplined"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fill="url(#gDisc)"
                  />
                  <Area
                    type="monotone"
                    dataKey="drift"
                    stroke="#ef4444"
                    strokeWidth={2}
                    fill="url(#gDrift)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <div className="rounded-md border border-emerald-500/30 bg-emerald-500/5 p-3 text-sm">
                <p className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="h-4 w-4" />
                  <span className="font-semibold">Disciplined at age {paths.retirementAge}</span>
                </p>
                <p className="mt-1 tabular-nums">
                  {formatCurrency(paths.disciplined.finalAtRetirement, country, { compact: true })}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Passive income ≈{" "}
                  <span className="font-semibold text-foreground">
                    {formatCurrency(paths.disciplined.passiveMonthlyIncome, country, {
                      compact: true,
                    })}
                    /mo
                  </span>{" "}
                  at 4% SWR.
                </p>
              </div>
              <div className="rounded-md border border-red-500/30 bg-red-500/5 p-3 text-sm">
                <p className="flex items-center gap-1.5 text-red-500">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="font-semibold">Drifting at age {paths.retirementAge}</span>
                </p>
                <p className="mt-1 tabular-nums">
                  {formatCurrency(paths.drift.finalAtRetirement, country, { compact: true })}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Passive income ≈{" "}
                  <span className="font-semibold text-foreground">
                    {formatCurrency(paths.drift.passiveMonthlyIncome, country, { compact: true })}
                    /mo
                  </span>
                  {paths.drift.monthlyShortfall > 0 && (
                    <>
                      {" "}— short by{" "}
                      <span className="font-semibold text-red-500">
                        {formatCurrency(paths.drift.monthlyShortfall, country, { compact: true })}
                        /mo
                      </span>
                    </>
                  )}
                </p>
              </div>
            </div>

            {multiplier && multiplier > 1.5 && (
              <div className="rounded-md border border-primary/30 bg-primary/5 p-3 text-sm">
                <p className="flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span>
                    At retirement, the disciplined path has{" "}
                    <strong>{multiplier.toFixed(1)}× more</strong> — a gap of{" "}
                    <strong>{formatCurrency(gap, country, { compact: true })}</strong>. You don't
                    earn that gap — compounding does, if you let it.
                  </span>
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="timeline" className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Five moments on the two paths — same age, same salary, very different feelings.
            </p>
            <LifeTimeline age={complete.age} retirementAge={paths.retirementAge} />
          </TabsContent>

          <TabsContent value="stats" className="space-y-3">
            <ComparisonTable paths={paths} country={country} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

const tooltipStyle = {
  background: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 8,
  fontSize: 12,
  color: "hsl(var(--card-foreground))",
} as const;

// --------------------------------------------------------------------------

interface Milestone {
  age: (now: number, retire: number) => number;
  label: string;
  disciplined: string;
  drift: string;
}

const MILESTONES: Milestone[] = [
  {
    age: (now) => Math.max(now, 30),
    label: "Early career",
    disciplined:
      "Starts SIPs, treats savings as a non-negotiable bill. Boring habits, big future.",
    drift: "Upgrades phone, car, lifestyle every 2 years. 'I'll start investing next year.'",
  },
  {
    age: () => 45,
    label: "Mid-life",
    disciplined:
      "Corpus is quietly doing the heavy lifting. Reduced stress about layoffs or emergencies.",
    drift: "Rising EMIs, kids' school fees, ageing parents. Savings barely exist.",
  },
  {
    age: (_, retire) => retire,
    label: "Retirement age",
    disciplined:
      "Optional to keep working. Passive income covers lifestyle. Can choose purpose over pay.",
    drift:
      "Cannot afford to stop. Keeps working in reduced-pay roles, anxious about medical bills.",
  },
  {
    age: () => 70,
    label: "Ageing",
    disciplined:
      "Travels, spends time with family, funds grandkids' education if they want. Dignity intact.",
    drift:
      "Dependent on children financially. Medical costs crush the little savings. Lifestyle cuts.",
  },
  {
    age: () => 80,
    label: "Late life",
    disciplined:
      "Leaves a legacy — inheritance, time, peace. Decisions driven by values, not fear.",
    drift:
      "Outlives the savings. Government pension / family support = no choice in how life is lived.",
  },
];

function LifeTimeline({ age, retirementAge }: { age: number; retirementAge: number }) {
  return (
    <ol className="space-y-2">
      {MILESTONES.map((m, i) => {
        const atAge = m.age(age, retirementAge);
        return (
          <li key={i} className="rounded-lg border border-border p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="font-medium">{m.label}</p>
              <span className="rounded bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                age {atAge}
              </span>
            </div>
            <div className="mt-2 grid gap-2 text-sm sm:grid-cols-2">
              <div className="rounded-md border border-emerald-500/30 bg-emerald-500/5 p-2">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
                  Disciplined
                </p>
                <p className="mt-0.5 text-xs">{m.disciplined}</p>
              </div>
              <div className="rounded-md border border-red-500/30 bg-red-500/5 p-2">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-red-500">
                  Drifting
                </p>
                <p className="mt-0.5 text-xs">{m.drift}</p>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

// --------------------------------------------------------------------------

function ComparisonTable({
  paths,
  country,
}: {
  paths: ReturnType<typeof computeTwoPaths>;
  country: CountryProfile;
}) {
  const rows: Array<{ label: string; disciplined: string; drift: string; hint?: string }> = [
    {
      label: "Total you contribute",
      disciplined: formatCurrency(paths.disciplined.totalContributed, country, { compact: true }),
      drift: formatCurrency(paths.drift.totalContributed, country, { compact: true }),
      hint: "Disciplined saves more now — but it's automated, not painful.",
    },
    {
      label: `Corpus at age ${paths.retirementAge}`,
      disciplined: formatCurrency(paths.disciplined.finalAtRetirement, country, { compact: true }),
      drift: formatCurrency(paths.drift.finalAtRetirement, country, { compact: true }),
    },
    {
      label: "Monthly passive income",
      disciplined:
        formatCurrency(paths.disciplined.passiveMonthlyIncome, country, { compact: true }) + "/mo",
      drift: formatCurrency(paths.drift.passiveMonthlyIncome, country, { compact: true }) + "/mo",
      hint: "At the 4% safe withdrawal rate.",
    },
    {
      label: "Monthly shortfall vs lifestyle",
      disciplined: "—",
      drift:
        paths.drift.monthlyShortfall > 0
          ? formatCurrency(paths.drift.monthlyShortfall, country, { compact: true }) + "/mo"
          : "—",
      hint: "What drifting path has to cover from children / pension / reduced life.",
    },
    {
      label: "Age wealth runs out",
      disciplined: paths.disciplined.endCorpus > 0 ? `past ${paths.endAge}` : `≈ ${paths.endAge}`,
      drift: paths.drift.ageWealthRunsOut ? `${paths.drift.ageWealthRunsOut}` : `past ${paths.endAge}`,
    },
  ];

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th scope="col" className="px-3 py-2 text-left font-medium">
              Metric
            </th>
            <th scope="col" className="px-3 py-2 text-right font-medium text-emerald-600 dark:text-emerald-400">
              Disciplined
            </th>
            <th scope="col" className="px-3 py-2 text-right font-medium text-red-500">
              Drifting
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.label} className="border-t border-border align-top">
              <td className="px-3 py-2">
                <p className="font-medium">{r.label}</p>
                {r.hint && <p className="mt-0.5 text-[11px] text-muted-foreground">{r.hint}</p>}
              </td>
              <td className="px-3 py-2 text-right font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                {r.disciplined}
              </td>
              <td className="px-3 py-2 text-right font-semibold tabular-nums text-red-500">
                {r.drift}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
