import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Term } from "@/components/ui/term";
import type { CompoundingPoint, CountryProfile } from "@/types";
import {
  costOfWaitingCurves,
  mergeSensitivity,
  projectSIP,
  returnSensitivity,
  ruleOf72,
} from "@/lib/compounding";
import { formatCurrency } from "@/lib/formatters";

interface Props {
  country: CountryProfile;
  age: number;
  expectedReturn: number;
  suggestedMonthly: number;
}

const SENSITIVITY_RETURNS = [0.06, 0.08, 0.1, 0.12, 0.15];
const SENSITIVITY_COLORS: Record<string, string> = {
  r60: "#94a3b8",
  r80: "#3b82f6",
  r100: "#10b981",
  r120: "#f59e0b",
  r150: "#ef4444",
};

export function CompoundingCard({ country, age, expectedReturn, suggestedMonthly }: Props) {
  const [monthly, setMonthly] = useState(Math.max(500, Math.round(suggestedMonthly)));
  const [years, setYears] = useState(Math.max(10, Math.min(40, 60 - age)));
  const [rate, setRate] = useState(Math.round(expectedReturn * 100));

  const r = rate / 100;

  // 1. Power of time — same SIP, different CAGRs
  const sensitivity = useMemo(
    () => returnSensitivity(monthly, SENSITIVITY_RETURNS, years),
    [monthly, years],
  );
  const sensitivityData = useMemo(() => mergeSensitivity(sensitivity), [sensitivity]);

  // 2. Cost of waiting — start now vs +5 / +10 years
  const targetAge = age + years;
  const costCurves = useMemo(
    () => costOfWaitingCurves([age, age + 5, age + 10], targetAge, monthly, r),
    [age, targetAge, monthly, r],
  );
  const costData = useMemo(() => mergeCostCurves(costCurves, targetAge), [costCurves, targetAge]);

  // 3. Principal vs gains — stacked area
  const projection = useMemo(
    () => projectSIP(monthly, r, years, 0, age),
    [monthly, r, years, age],
  );
  const projectionLast = projection[projection.length - 1];
  const gainsShare =
    projectionLast.total > 0
      ? (projectionLast.gains / projectionLast.total) * 100
      : 0;

  // 4. Rule of 72
  const doublingYears = ruleOf72(r);

  return (
    <Card>
      <CardHeader>
        <CardTitle>The power of <Term hint>Compounding</Term></CardTitle>
        <CardDescription>
          Small changes to how long, how much, and at what rate — massively change the outcome.
          Play with the sliders and watch the curves diverge.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 md:grid-cols-3">
          <SliderBlock
            label="Monthly investment"
            value={formatCurrency(monthly, country, { maximumFractionDigits: 0 })}
          >
            <Slider
              value={[monthly]}
              min={500}
              max={Math.max(50_000, suggestedMonthly * 3)}
              step={500}
              onValueChange={([v]) => setMonthly(v)}
              aria-label="Monthly investment"
            />
          </SliderBlock>
          <SliderBlock label="Horizon" value={`${years} years`}>
            <Slider
              value={[years]}
              min={5}
              max={45}
              step={1}
              onValueChange={([v]) => setYears(v)}
              aria-label="Horizon in years"
            />
          </SliderBlock>
          <SliderBlock label="Expected return" value={`${rate}%`}>
            <Slider
              value={[rate]}
              min={4}
              max={18}
              step={1}
              onValueChange={([v]) => setRate(v)}
              aria-label="Expected return"
            />
          </SliderBlock>
        </div>

        <Tabs defaultValue="power">
          <TabsList className="flex flex-wrap h-auto">
            <TabsTrigger value="power">Power of time</TabsTrigger>
            <TabsTrigger value="waiting">Cost of waiting</TabsTrigger>
            <TabsTrigger value="split">Principal vs gains</TabsTrigger>
            <TabsTrigger value="rule72">Rule of 72</TabsTrigger>
          </TabsList>

          <TabsContent value="power" className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Same {formatCurrency(monthly, country, { maximumFractionDigits: 0 })}/month for{" "}
              {years} years — watch how much a few percent of extra CAGR compounds into.
            </p>
            <div className="h-56 w-full sm:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sensitivityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="year"
                    tickLine={false}
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={11}
                  />
                  <YAxis
                    tickFormatter={(v) => compact(v, country)}
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={11}
                    width={70}
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(value: number, name) => [
                      formatCurrency(value, country, { compact: true }),
                      labelForReturnKey(String(name)),
                    ]}
                    labelFormatter={(y) => `Year ${y}`}
                  />
                  <Legend formatter={(key) => labelForReturnKey(String(key))} />
                  {SENSITIVITY_RETURNS.map((ret) => {
                    const key = `r${Math.round(ret * 1000)}`;
                    return (
                      <Line
                        key={key}
                        type="monotone"
                        dataKey={key}
                        stroke={SENSITIVITY_COLORS[key]}
                        strokeWidth={2}
                        dot={false}
                      />
                    );
                  })}
                </LineChart>
              </ResponsiveContainer>
            </div>
            <KeyTakeaway>
              A 4-point CAGR difference (8% → 12%) over {years} years can{" "}
              <strong>more than double</strong> your final corpus. That's compounding, not luck.
            </KeyTakeaway>
          </TabsContent>

          <TabsContent value="waiting" className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Three identical investors — one starts at your age {age}, one waits 5 years, one
              waits 10 years. Everyone stops at age {targetAge}. Same monthly SIP, same return.
            </p>
            <div className="h-56 w-full sm:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={costData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="age"
                    tickLine={false}
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={11}
                  />
                  <YAxis
                    tickFormatter={(v) => compact(v, country)}
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={11}
                    width={70}
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(value: number, name) => [
                      formatCurrency(value, country, { compact: true }),
                      `Started at ${String(name).replace("start_", "age ")}`,
                    ]}
                    labelFormatter={(a) => `Age ${a}`}
                  />
                  <Legend
                    formatter={(key) => `Started at age ${String(key).replace("start_", "")}`}
                  />
                  <Line
                    type="monotone"
                    dataKey={`start_${age}`}
                    stroke="#10b981"
                    strokeWidth={2.5}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey={`start_${age + 5}`}
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey={`start_${age + 10}`}
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <CostOfWaitingSummary
              curves={costCurves}
              country={country}
              startAge={age}
              targetAge={targetAge}
            />
          </TabsContent>

          <TabsContent value="split" className="space-y-3">
            <p className="text-sm text-muted-foreground">
              The green area is what <strong>you</strong> put in. The orange area is what{" "}
              <strong>compounding</strong> added on top.
            </p>
            <div className="h-56 w-full sm:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={projection}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="year"
                    tickLine={false}
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={11}
                  />
                  <YAxis
                    tickFormatter={(v) => compact(v, country)}
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={11}
                    width={70}
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(value: number, name) => [
                      formatCurrency(value, country, { compact: true }),
                      name === "principalInvested" ? "Principal invested" : "Compound gains",
                    ]}
                    labelFormatter={(y) => `Year ${y}`}
                  />
                  <Legend
                    formatter={(key) =>
                      key === "principalInvested" ? "Principal invested" : "Compound gains"
                    }
                  />
                  <Area
                    type="monotone"
                    dataKey="principalInvested"
                    stackId="1"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.45}
                  />
                  <Area
                    type="monotone"
                    dataKey="gains"
                    stackId="1"
                    stroke="#f59e0b"
                    fill="#f59e0b"
                    fillOpacity={0.55}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <Stat
                label="Principal invested"
                value={formatCurrency(projectionLast.principalInvested, country, { compact: true })}
              />
              <Stat
                label="Compound gains"
                value={formatCurrency(projectionLast.gains, country, { compact: true })}
                accent="amber"
              />
              <Stat
                label="Compounding share"
                value={`${gainsShare.toFixed(0)}%`}
                accent="emerald"
              />
            </div>
            {gainsShare > 50 && (
              <KeyTakeaway>
                Over {years} years, <strong>{gainsShare.toFixed(0)}% of the final corpus</strong>{" "}
                comes from compound gains — not from what you put in.
              </KeyTakeaway>
            )}
          </TabsContent>

          <TabsContent value="rule72" className="space-y-4">
            <p className="text-sm text-muted-foreground">
              A mental shortcut: <strong>72 ÷ return rate</strong> ≈ years to double your money.
              Decent approximation for returns between 4% and 15%.
            </p>
            <div className="rounded-lg border border-border p-5">
              <p className="text-sm text-muted-foreground">At {rate}% annual return</p>
              <p className="mt-1 text-3xl font-semibold tabular-nums">
                {Number.isFinite(doublingYears) ? doublingYears.toFixed(1) : "—"} years
              </p>
              <p className="text-xs text-muted-foreground">to double your money</p>
            </div>
            <div className="grid gap-2">
              {[0.06, 0.08, 0.1, 0.12, 0.15].map((ret) => (
                <div
                  key={ret}
                  className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm"
                >
                  <span className="font-medium">{(ret * 100).toFixed(0)}% return</span>
                  <span className="text-muted-foreground">
                    doubles every{" "}
                    <span className="font-semibold text-foreground tabular-nums">
                      {ruleOf72(ret).toFixed(1)} yrs
                    </span>
                  </span>
                </div>
              ))}
            </div>
            <KeyTakeaway>
              At 12%, a lump sum doubles every 6 years — so it 8× in 18 years, 32× in 30 years.
              This is why time-in-market beats timing-the-market.
            </KeyTakeaway>
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

function labelForReturnKey(key: string): string {
  const m = /^r(\d+)$/.exec(key);
  if (!m) return key;
  return `${(Number(m[1]) / 10).toFixed(0)}% CAGR`;
}

function compact(value: number, country: CountryProfile): string {
  return formatCurrency(value, country, { compact: true });
}

function SliderBlock({
  label,
  value,
  children,
}: {
  label: string;
  value: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <span className="text-sm font-semibold text-primary tabular-nums">{value}</span>
      </div>
      {children}
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: "emerald" | "amber";
}) {
  const accentClass =
    accent === "emerald"
      ? "text-emerald-500"
      : accent === "amber"
        ? "text-amber-500"
        : "text-foreground";
  return (
    <div className="rounded-md border border-border p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`mt-1 text-xl font-semibold tabular-nums ${accentClass}`}>{value}</p>
    </div>
  );
}

function KeyTakeaway({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-primary/30 bg-primary/5 p-3 text-sm">
      💡 {children}
    </div>
  );
}

/**
 * Merge start-age curves into rows keyed by age, where each row has
 * start_<age> columns. Earlier starters extend further left on the x-axis.
 */
function mergeCostCurves(
  curves: Array<{ startAge: number; points: CompoundingPoint[] }>,
  targetAge: number,
): Array<Record<string, number>> {
  const minStart = Math.min(...curves.map((c) => c.startAge));
  const rows: Array<Record<string, number>> = [];
  for (let a = minStart; a <= targetAge; a++) {
    const row: Record<string, number> = { age: a };
    for (const c of curves) {
      const p = c.points.find((pt) => pt.age === a);
      if (p) row[`start_${c.startAge}`] = p.total;
    }
    rows.push(row);
  }
  return rows;
}

function CostOfWaitingSummary({
  curves,
  country,
  startAge,
  targetAge,
}: {
  curves: Array<{ startAge: number; points: CompoundingPoint[] }>;
  country: CountryProfile;
  startAge: number;
  targetAge: number;
}) {
  const finals = curves.map((c) => ({
    startAge: c.startAge,
    total: c.points[c.points.length - 1]?.total ?? 0,
  }));
  const earliest = finals[0];
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {finals.map((f) => {
        const delay = f.startAge - startAge;
        const missing = earliest.total - f.total;
        return (
          <div key={f.startAge} className="rounded-md border border-border p-3">
            <p className="text-xs text-muted-foreground">
              Start at {f.startAge} → age {targetAge}
            </p>
            <p className="mt-1 text-lg font-semibold tabular-nums">
              {formatCurrency(f.total, country, { compact: true })}
            </p>
            {delay > 0 && missing > 0 && (
              <p className="text-xs text-red-500">
                −{formatCurrency(missing, country, { compact: true })} vs starting now
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
