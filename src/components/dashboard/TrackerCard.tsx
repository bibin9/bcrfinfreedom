import { useMemo, useState } from "react";
import {
  CalendarCheck,
  Camera,
  CheckCircle2,
  GitCompareArrows,
  Plus,
  Trash2,
  TrendingUp,
} from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CountryProfile, FreedomProjection } from "@/types";
import { calculateAllocation } from "@/lib/allocation";
import { getCountryProfile } from "@/data/countryProfiles";
import { calculateFreedom } from "@/lib/freedom";
import { formatCurrency } from "@/lib/formatters";
import { toUserInput, useUserStore } from "@/store/userStore";
import type { Scenario } from "@/store/userStore";

type StoreInputs = Scenario["inputs"];

interface Props {
  country: CountryProfile;
  projection: FreedomProjection;
}

const SUGGEST_DAYS = 90; // we recommend a new check-in every quarter

export function TrackerCard({ country, projection }: Props) {
  return (
    <div className="space-y-6">
      <ScenariosSection country={country} projection={projection} />
      <CheckinsSection country={country} projection={projection} />
    </div>
  );
}

// ===========================================================================
// SCENARIOS — save current inputs as a named snapshot, then compare two of them
// ===========================================================================

function ScenariosSection({
  country,
  projection,
}: {
  country: CountryProfile;
  projection: FreedomProjection;
}) {
  const scenarios = useUserStore((s) => s.scenarios);
  const saveScenario = useUserStore((s) => s.saveScenario);
  const applyScenario = useUserStore((s) => s.applyScenario);
  const deleteScenario = useUserStore((s) => s.deleteScenario);
  const inputs = useUserStore((s) => s.inputs);

  const [name, setName] = useState("");
  const [justSaved, setJustSaved] = useState<string | null>(null);
  const [compareIds, setCompareIds] = useState<string[]>([]);

  const onSave = () => {
    const finalName = name.trim() || defaultName(scenarios.length, inputs);
    saveScenario(finalName);
    setName("");
    setJustSaved(finalName);
    setTimeout(() => setJustSaved(null), 2500);
  };

  const toggleCompare = (id: string) => {
    setCompareIds((curr) => {
      if (curr.includes(id)) return curr.filter((x) => x !== id);
      if (curr.length >= 2) return [curr[1], id]; // keep the most recent two
      return [...curr, id];
    });
  };

  const comparePair = useMemo(() => {
    if (compareIds.length !== 2) return null;
    const a = scenarios.find((s) => s.id === compareIds[0]);
    const b = scenarios.find((s) => s.id === compareIds[1]);
    if (!a || !b) return null;
    return { a, b };
  }, [compareIds, scenarios]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5 text-blue-500" />
          Scenarios — save & compare
        </CardTitle>
        <CardDescription>
          Snapshot your current inputs as a named scenario. Tick two to compare them
          side-by-side — useful for "Retire at 55 vs 60" or "Save 30% vs 45%".
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Save UI */}
        <div className="rounded-lg border border-blue-500/30 bg-blue-500/5 p-3">
          <Label htmlFor="scn-name" className="text-xs font-semibold">
            Save current setup as a new scenario
          </Label>
          <div className="mt-1.5 flex flex-col gap-2 sm:flex-row">
            <Input
              id="scn-name"
              placeholder={defaultName(scenarios.length, inputs)}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-background"
            />
            <Button onClick={onSave} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4" /> Save scenario
            </Button>
          </div>
          {justSaved && (
            <p className="mt-2 flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" /> Saved "{justSaved}"
            </p>
          )}
          <CurrentSummary projection={projection} country={country} />
        </div>

        {/* List */}
        {scenarios.length === 0 ? (
          <EmptyHint>
            No scenarios yet. Save your first one above, change a slider, save again,
            then tick the two boxes to compare.
          </EmptyHint>
        ) : (
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Saved scenarios ({scenarios.length})
            </p>
            {scenarios
              .slice()
              .reverse()
              .map((scn) => (
                <ScenarioRow
                  key={scn.id}
                  scn={scn}
                  country={country}
                  isComparing={compareIds.includes(scn.id)}
                  onCompare={() => toggleCompare(scn.id)}
                  onApply={() => applyScenario(scn.id)}
                  onDelete={() => deleteScenario(scn.id)}
                />
              ))}
          </div>
        )}

        {/* Compare */}
        {comparePair && (
          <CompareBlock pair={comparePair} country={country} />
        )}
      </CardContent>
    </Card>
  );
}

function CurrentSummary({
  projection,
  country,
}: {
  projection: FreedomProjection;
  country: CountryProfile;
}) {
  return (
    <p className="mt-2 text-[11px] text-muted-foreground">
      Current setup: FIRE number{" "}
      <strong className="text-foreground">
        {formatCurrency(projection.targetCorpus, country, { compact: true })}
      </strong>
      , freedom age <strong className="text-foreground">{projection.freedomAge}</strong>,
      required SIP{" "}
      <strong className="text-foreground">
        {projection.requiredMonthlySIP != null
          ? formatCurrency(projection.requiredMonthlySIP, country, { compact: true }) +
            "/mo"
          : "—"}
      </strong>
      .
    </p>
  );
}

function ScenarioRow({
  scn,
  country,
  isComparing,
  onCompare,
  onApply,
  onDelete,
}: {
  scn: Scenario;
  country: CountryProfile;
  isComparing: boolean;
  onCompare: () => void;
  onApply: () => void;
  onDelete: () => void;
}) {
  const proj = useScenarioProjection(scn);
  return (
    <div
      className={[
        "flex flex-col gap-2 rounded-md border p-3 transition sm:flex-row sm:items-center sm:gap-3",
        isComparing ? "border-blue-500 bg-blue-500/5" : "border-border",
      ].join(" ")}
    >
      <label className="flex shrink-0 items-center gap-2">
        <input
          type="checkbox"
          checked={isComparing}
          onChange={onCompare}
          className="h-4 w-4 rounded border-border"
          aria-label={`Add ${scn.name} to comparison`}
        />
      </label>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{scn.name}</p>
        <p className="text-[11px] text-muted-foreground">
          {scn.inputs.householdSize === "family" ? "Family" : "Single"} ·{" "}
          {((scn.inputs.savingsRate ?? 0.3) * 100).toFixed(0)}% savings · FIRE @{" "}
          {scn.inputs.freedomAge ?? country.retirementAge}
        </p>
        {proj && (
          <p className="text-[11px] text-muted-foreground">
            Target{" "}
            <strong className="text-foreground">
              {formatCurrency(proj.targetCorpus, country, { compact: true })}
            </strong>{" "}
            · SIP{" "}
            <strong className="text-foreground">
              {proj.requiredMonthlySIP != null
                ? formatCurrency(proj.requiredMonthlySIP, country, { compact: true }) +
                  "/mo"
                : "—"}
            </strong>{" "}
            · Years{" "}
            <strong className="text-foreground">
              {proj.yearsToFreedomAtCurrentRate != null
                ? Math.round(proj.yearsToFreedomAtCurrentRate)
                : "—"}
            </strong>
          </p>
        )}
      </div>
      <div className="flex shrink-0 gap-1">
        <Button size="sm" variant="outline" onClick={onApply}>
          Apply
        </Button>
        <Button
          size="sm"
          variant="ghost"
          aria-label="Delete scenario"
          onClick={onDelete}
        >
          <Trash2 className="h-4 w-4 text-red-500" />
        </Button>
      </div>
    </div>
  );
}

function CompareBlock({
  pair,
  country,
}: {
  pair: { a: Scenario; b: Scenario };
  country: CountryProfile;
}) {
  const pA = useScenarioProjection(pair.a);
  const pB = useScenarioProjection(pair.b);
  if (!pA || !pB) return null;

  const rows: Array<{ k: string; a: string; b: string; better?: "a" | "b" }> = [
    {
      k: "Freedom age",
      a: String(pA.freedomAge),
      b: String(pB.freedomAge),
      better: pA.freedomAge < pB.freedomAge ? "a" : pB.freedomAge < pA.freedomAge ? "b" : undefined,
    },
    {
      k: "Target corpus",
      a: formatCurrency(pA.targetCorpus, country, { compact: true }),
      b: formatCurrency(pB.targetCorpus, country, { compact: true }),
      better: pA.targetCorpus < pB.targetCorpus ? "a" : pB.targetCorpus < pA.targetCorpus ? "b" : undefined,
    },
    {
      k: "Required SIP / mo",
      a: pA.requiredMonthlySIP != null ? formatCurrency(pA.requiredMonthlySIP, country, { compact: true }) : "—",
      b: pB.requiredMonthlySIP != null ? formatCurrency(pB.requiredMonthlySIP, country, { compact: true }) : "—",
      better:
        (pA.requiredMonthlySIP ?? Infinity) < (pB.requiredMonthlySIP ?? Infinity)
          ? "a"
          : (pB.requiredMonthlySIP ?? Infinity) < (pA.requiredMonthlySIP ?? Infinity)
            ? "b"
            : undefined,
    },
    {
      k: "Years to FIRE",
      a: pA.yearsToFreedomAtCurrentRate != null ? Math.round(pA.yearsToFreedomAtCurrentRate) + " yrs" : "—",
      b: pB.yearsToFreedomAtCurrentRate != null ? Math.round(pB.yearsToFreedomAtCurrentRate) + " yrs" : "—",
      better:
        (pA.yearsToFreedomAtCurrentRate ?? Infinity) < (pB.yearsToFreedomAtCurrentRate ?? Infinity)
          ? "a"
          : (pB.yearsToFreedomAtCurrentRate ?? Infinity) < (pA.yearsToFreedomAtCurrentRate ?? Infinity)
            ? "b"
            : undefined,
    },
    {
      k: "Monthly shortfall",
      a: pA.monthlyShortfall > 0 ? formatCurrency(pA.monthlyShortfall, country, { compact: true }) : "—",
      b: pB.monthlyShortfall > 0 ? formatCurrency(pB.monthlyShortfall, country, { compact: true }) : "—",
      better:
        pA.monthlyShortfall < pB.monthlyShortfall
          ? "a"
          : pB.monthlyShortfall < pA.monthlyShortfall
            ? "b"
            : undefined,
    },
  ];

  return (
    <div className="rounded-lg border border-blue-500/30 bg-blue-500/5 p-3">
      <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold">
        <GitCompareArrows className="h-4 w-4 text-blue-500" />
        Side-by-side: {pair.a.name} vs {pair.b.name}
      </h3>
      <div className="overflow-x-auto rounded-md border border-border bg-background">
        <table className="w-full text-xs">
          <thead className="bg-muted/40 uppercase tracking-wide text-muted-foreground">
            <tr>
              <th scope="col" className="px-2 py-1.5 text-left font-medium">
                Metric
              </th>
              <th scope="col" className="px-2 py-1.5 text-right font-medium">
                {pair.a.name}
              </th>
              <th scope="col" className="px-2 py-1.5 text-right font-medium">
                {pair.b.name}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.k} className="border-t border-border">
                <td className="px-2 py-1.5 font-medium">{r.k}</td>
                <td
                  className={`px-2 py-1.5 text-right tabular-nums ${r.better === "a" ? "font-bold text-emerald-600 dark:text-emerald-400" : ""}`}
                >
                  {r.a}
                </td>
                <td
                  className={`px-2 py-1.5 text-right tabular-nums ${r.better === "b" ? "font-bold text-emerald-600 dark:text-emerald-400" : ""}`}
                >
                  {r.b}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-[11px] text-muted-foreground">
        Green = the better number for that metric. "Apply" any row to load that scenario
        back into your live inputs.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Re-run the FIRE calc with the inputs from a saved scenario.

function useScenarioProjection(scn: Scenario) {
  return useMemo(() => {
    const complete = toUserInput({ ...scn.inputs });
    if (!complete) return null;
    const resident = getCountryProfile(complete.country);
    const retirement = scn.inputs.retirementCountry
      ? getCountryProfile(scn.inputs.retirementCountry)
      : undefined;
    const a = calculateAllocation({
      age: complete.age,
      risk: complete.risk,
      country: resident,
      goal: complete.goal,
      retirementCountry: retirement,
      freedomAge: scn.inputs.freedomAge,
    });
    return calculateFreedom({
      ...complete,
      expectedReturn: a.expectedReturn,
      savingsRate: scn.inputs.savingsRate ?? 0.3,
      currentCorpus: scn.inputs.currentCorpus ?? 0,
      freedomAge: scn.inputs.freedomAge,
      householdSize: scn.inputs.householdSize ?? "single",
      annualExpensesOverride: scn.inputs.annualExpensesOverride,
      retirementCountry: scn.inputs.retirementCountry,
      retirementCity: scn.inputs.retirementCity,
    });
  }, [scn]);
}

function defaultName(idx: number, inputs: StoreInputs): string {
  const sr = Math.round((inputs.savingsRate ?? 0.3) * 100);
  const fa = inputs.freedomAge ?? "default";
  return `${sr}% save · FIRE @${fa} (#${idx + 1})`;
}

// ===========================================================================
// CHECK-INS — quarterly self-report of corpus → 5-year FI Ratio chart
// ===========================================================================

function CheckinsSection({
  country,
  projection,
}: {
  country: CountryProfile;
  projection: FreedomProjection;
}) {
  const checkins = useUserStore((s) => s.checkins);
  const addCheckin = useUserStore((s) => s.addCheckin);
  const deleteCheckin = useUserStore((s) => s.deleteCheckin);
  const liveInputs = useUserStore((s) => s.inputs);

  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [corpus, setCorpus] = useState<string>("");
  const [income, setIncome] = useState<string>("");
  const [note, setNote] = useState("");

  // Today's FIRE number for FI Ratio. Recomputed against projection's current expenses.
  const todayFireNumber = projection.currentAnnualExpenses * 25;

  const daysSinceLast = useMemo(() => {
    if (checkins.length === 0) return null;
    const last = checkins[checkins.length - 1];
    return Math.floor((Date.now() - new Date(last.date).getTime()) / 86_400_000);
  }, [checkins]);

  const overdue = daysSinceLast == null || daysSinceLast >= SUGGEST_DAYS;

  const onAdd = () => {
    const c = Number(corpus);
    const m = Number(income);
    if (!Number.isFinite(c) || c <= 0) return;
    addCheckin({
      date,
      corpus: c,
      monthlyIncome: Number.isFinite(m) && m > 0 ? m : liveInputs.monthlyIncome ?? 0,
      note: note.trim() || undefined,
    });
    setCorpus("");
    setIncome("");
    setNote("");
  };

  // Chart data: FI Ratio over time + a current-trajectory continuation line.
  const chartData = useMemo(() => {
    return checkins.map((c) => ({
      date: c.date,
      fiRatio:
        todayFireNumber > 0 ? Math.min(200, (c.corpus / todayFireNumber) * 100) : 0,
      corpus: c.corpus,
    }));
  }, [checkins, todayFireNumber]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarCheck className="h-5 w-5 text-emerald-500" />
          Quarterly check-in
          {overdue && checkins.length > 0 && (
            <span className="ml-auto rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold text-amber-600 dark:text-amber-400">
              Time for a check-in
            </span>
          )}
        </CardTitle>
        <CardDescription>
          Log your corpus every 3 months. Over a few years this becomes a real picture
          of your FIRE trajectory — actual, not projected.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Add new */}
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3">
          <p className="text-xs font-semibold">Log this quarter's numbers</p>
          <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_1fr_auto]">
            <div>
              <Label htmlFor="ck-date" className="text-[11px]">
                Date
              </Label>
              <Input
                id="ck-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-background"
              />
            </div>
            <div>
              <Label htmlFor="ck-corpus" className="text-[11px]">
                Corpus ({country.currency})
              </Label>
              <Input
                id="ck-corpus"
                type="number"
                min={0}
                value={corpus}
                placeholder="2500000"
                onChange={(e) => setCorpus(e.target.value)}
                className="bg-background"
              />
            </div>
            <div>
              <Label htmlFor="ck-income" className="text-[11px]">
                Monthly income (optional)
              </Label>
              <Input
                id="ck-income"
                type="number"
                min={0}
                value={income}
                placeholder={String(liveInputs.monthlyIncome ?? "")}
                onChange={(e) => setIncome(e.target.value)}
                className="bg-background"
              />
            </div>
            <div className="flex items-end">
              <Button onClick={onAdd} className="w-full bg-emerald-600 hover:bg-emerald-700">
                <Plus className="h-4 w-4" /> Log
              </Button>
            </div>
          </div>
          <div className="mt-2">
            <Label htmlFor="ck-note" className="text-[11px]">
              Note (optional — promotion, market move, etc.)
            </Label>
            <Input
              id="ck-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Got a raise, switched jobs, Q1 bonus credited"
              className="bg-background"
            />
          </div>
        </div>

        {/* Chart */}
        {checkins.length >= 2 ? (
          <div>
            <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
              <TrendingUp className="h-4 w-4 text-emerald-500" /> FI Ratio over time
            </h3>
            <FiRatioChart data={chartData} />
            <p className="mt-1 text-[11px] text-muted-foreground">
              FI Ratio = your reported corpus ÷ today's FIRE number (25× current spend).
              Cross 100% = FI at today's lifestyle.
            </p>
          </div>
        ) : (
          <EmptyHint>
            Log at least 2 check-ins to see a trajectory chart. Most people do this every
            3 months on a fixed day (e.g. April 1, July 1, October 1, January 1).
          </EmptyHint>
        )}

        {/* History */}
        {checkins.length > 0 && (
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              History
            </p>
            <div className="overflow-x-auto rounded-md border border-border">
              <table className="w-full text-xs">
                <thead className="bg-muted/40 uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-2 py-1.5 text-left font-medium">Date</th>
                    <th className="px-2 py-1.5 text-right font-medium">Corpus</th>
                    <th className="px-2 py-1.5 text-right font-medium">FI Ratio</th>
                    <th className="px-2 py-1.5 text-left font-medium">Note</th>
                    <th className="px-2 py-1.5"></th>
                  </tr>
                </thead>
                <tbody>
                  {checkins
                    .slice()
                    .reverse()
                    .map((c) => {
                      const ratio =
                        todayFireNumber > 0 ? (c.corpus / todayFireNumber) * 100 : 0;
                      return (
                        <tr key={c.id} className="border-t border-border">
                          <td className="px-2 py-1.5">{c.date}</td>
                          <td className="px-2 py-1.5 text-right tabular-nums">
                            {formatCurrency(c.corpus, country, { compact: true })}
                          </td>
                          <td className="px-2 py-1.5 text-right tabular-nums">
                            {ratio.toFixed(1)}%
                          </td>
                          <td className="px-2 py-1.5 text-muted-foreground">
                            {c.note ?? "—"}
                          </td>
                          <td className="px-2 py-1.5 text-right">
                            <Button
                              size="sm"
                              variant="ghost"
                              aria-label="Delete check-in"
                              onClick={() => deleteCheckin(c.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5 text-red-500" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function FiRatioChart({
  data,
}: {
  data: Array<{ date: string; fiRatio: number; corpus: number }>;
}) {
  return (
    <div className="h-56 w-full sm:h-72" role="img" aria-label="FI Ratio over time">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
          <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
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
            width={42}
            tickFormatter={(v: number) => `${v.toFixed(0)}%`}
          />
          <RTooltip
            contentStyle={{
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: 8,
              fontSize: 12,
              color: "hsl(var(--card-foreground))",
            }}
            formatter={(v: number) => [`${v.toFixed(1)}%`, "FI Ratio"]}
          />
          <ReferenceLine
            y={100}
            stroke="hsl(24 95% 53%)"
            strokeDasharray="4 4"
            label={{ value: "FIRE 100%", fill: "hsl(24 95% 53%)", fontSize: 10, position: "insideTopRight" }}
          />
          <Line
            type="monotone"
            dataKey="fiRatio"
            stroke="hsl(160 84% 39%)"
            strokeWidth={2.5}
            dot={{ r: 3.5, fill: "hsl(160 84% 39%)" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// ===========================================================================

function EmptyHint({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-dashed border-border bg-muted/30 p-3 text-xs text-muted-foreground">
      {children}
    </div>
  );
}
