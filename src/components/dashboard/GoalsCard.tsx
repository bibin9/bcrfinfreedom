import { useMemo, useState } from "react";
import { CheckCircle2, Gift, Goal as GoalIcon, Plus, Sparkles, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CountryProfile, GoalCategory, GoalProjection, WindfallCategory } from "@/types";
import { formatCurrency } from "@/lib/formatters";
import { GOAL_PRESETS_USD, categoryMeta, projectGoal, totalGoalsMonthlySIP } from "@/lib/goals";
import {
  WINDFALL_CATEGORIES,
  WINDFALL_PRESETS_USD,
  projectWindfalls,
  totalWindfallsAtRetirement,
  windfallCategoryMeta,
} from "@/lib/windfalls";
import { useUserStore } from "@/store/userStore";

interface Props {
  /** Destination country — currency, inflation, and where target amounts live. */
  destinationCountry: CountryProfile;
  /** Blended expected return from allocation. */
  expectedReturn: number;
  /** Required FIRE SIP so we can show the combined "total needed" number. */
  fireSIP: number | null;
  /** User's planned retirement year — for windfall discounting. */
  retirementYear: number;
}

const CURRENT_YEAR = new Date().getFullYear();

export function GoalsCard({ destinationCountry, expectedReturn, fireSIP, retirementYear }: Props) {
  const goals = useUserStore((s) => s.goals);
  const addGoal = useUserStore((s) => s.addGoal);
  const deleteGoal = useUserStore((s) => s.deleteGoal);

  const [name, setName] = useState("");
  const [category, setCategory] = useState<GoalCategory>("education");
  const [amount, setAmount] = useState("");
  const [year, setYear] = useState(String(CURRENT_YEAR + 10));
  const [justAdded, setJustAdded] = useState<string | null>(null);

  const projections = useMemo<GoalProjection[]>(
    () =>
      goals.map((g) =>
        projectGoal(g, CURRENT_YEAR, destinationCountry.inflationRate, expectedReturn),
      ),
    [goals, destinationCountry.inflationRate, expectedReturn],
  );
  const totalGoalsSIP = totalGoalsMonthlySIP(projections);
  const totalMonthly = totalGoalsSIP + (fireSIP ?? 0);

  const onAdd = () => {
    const amt = Number(amount);
    const yr = Number(year);
    if (!Number.isFinite(amt) || amt <= 0) return;
    if (!Number.isFinite(yr) || yr <= CURRENT_YEAR) return;
    const finalName = name.trim() || `${categoryMeta(category).label} goal`;
    addGoal({
      name: finalName,
      category,
      targetAmountToday: amt,
      targetYear: yr,
    });
    setName("");
    setAmount("");
    setYear(String(CURRENT_YEAR + 10));
    setJustAdded(finalName);
    setTimeout(() => setJustAdded(null), 2500);
  };

  const applyPreset = (p: (typeof GOAL_PRESETS_USD)[number]) => {
    // Convert the USD preset into destination currency and pick a sensible name.
    const localAmt = Math.round(p.amountUSD * destinationCountry.fxRateToUSD);
    setCategory(p.category);
    setName(p.name);
    setAmount(String(localAmt));
    setYear(String(CURRENT_YEAR + p.yearsFromNow));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GoalIcon className="h-5 w-5 text-purple-500" />
          Life goals
          <span className="ml-auto rounded-full bg-purple-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400">
            Beyond just FIRE
          </span>
        </CardTitle>
        <CardDescription>
          The FIRE number covers your steady-state living. Add the lumpy spikes here —
          child's education, parents' healthcare, home, wedding, medical reserve. Each
          becomes a separate monthly SIP.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Combined SIP hero */}
        <div className="grid gap-2 sm:grid-cols-3">
          <MetricTile
            label="FIRE SIP"
            value={
              fireSIP != null
                ? `${formatCurrency(fireSIP, destinationCountry, { compact: true })}/mo`
                : "—"
            }
            hint="For your retirement corpus"
            accent="orange"
          />
          <MetricTile
            label="Goals SIP"
            value={
              totalGoalsSIP > 0
                ? `${formatCurrency(totalGoalsSIP, destinationCountry, { compact: true })}/mo`
                : "—"
            }
            hint={`Across ${goals.length} goal${goals.length === 1 ? "" : "s"}`}
            accent="purple"
          />
          <MetricTile
            label="Total needed"
            value={`${formatCurrency(totalMonthly, destinationCountry, { compact: true })}/mo`}
            hint="Automate both — same day"
            accent="emerald"
            emphasise
          />
        </div>

        {/* Add-goal form */}
        <div className="rounded-lg border border-purple-500/30 bg-purple-500/5 p-3">
          <p className="text-xs font-semibold">Add a life goal</p>
          <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-[2fr_1fr_1fr_1fr_auto]">
            <div>
              <Label htmlFor="g-name" className="text-[11px]">
                Name
              </Label>
              <Input
                id="g-name"
                placeholder="e.g. Elder daughter's UG"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-background"
              />
            </div>
            <div>
              <Label htmlFor="g-category" className="text-[11px]">
                Category
              </Label>
              <Select value={category} onValueChange={(v) => setCategory(v as GoalCategory)}>
                <SelectTrigger id="g-category" className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(
                    [
                      "education",
                      "wedding",
                      "home",
                      "medical",
                      "vehicle",
                      "travel",
                      "parents",
                      "other",
                    ] as GoalCategory[]
                  ).map((c) => {
                    const m = categoryMeta(c);
                    return (
                      <SelectItem key={c} value={c}>
                        {m.emoji} {m.label}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="g-amount" className="text-[11px]">
                Amount today ({destinationCountry.currency})
              </Label>
              <Input
                id="g-amount"
                type="number"
                min={0}
                value={amount}
                placeholder="e.g. 4000000"
                onChange={(e) => setAmount(e.target.value)}
                className="bg-background"
              />
            </div>
            <div>
              <Label htmlFor="g-year" className="text-[11px]">
                Target year
              </Label>
              <Input
                id="g-year"
                type="number"
                min={CURRENT_YEAR + 1}
                max={CURRENT_YEAR + 60}
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="bg-background"
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={onAdd}
                className="w-full bg-purple-600 hover:bg-purple-700"
                disabled={!amount || Number(amount) <= 0}
              >
                <Plus className="h-4 w-4" /> Add
              </Button>
            </div>
          </div>
          {justAdded && (
            <p className="mt-2 flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" /> Added "{justAdded}"
            </p>
          )}
          <p className="mt-2 text-[11px] text-muted-foreground">
            Enter the amount in <strong>today's money</strong> — the app inflates it to your
            target year at {destinationCountry.name}'s{" "}
            {(destinationCountry.inflationRate * 100).toFixed(1)}% inflation.
          </p>
        </div>

        {/* Preset chips */}
        <div>
          <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-purple-500" /> Quick presets — tap to fill
            the form
          </p>
          <div className="flex flex-wrap gap-1.5">
            {GOAL_PRESETS_USD.map((p) => (
              <button
                key={p.name}
                type="button"
                onClick={() => applyPreset(p)}
                className="rounded-full border border-border bg-background px-2.5 py-1 text-xs hover:border-purple-500/40 hover:bg-purple-500/5"
              >
                {p.emoji} {p.name}{" "}
                <span className="text-muted-foreground">· +{p.yearsFromNow}y</span>
              </button>
            ))}
          </div>
        </div>

        {/* Goals list */}
        {goals.length === 0 ? (
          <EmptyHint>
            No goals yet. Try tapping <strong>"Parents' healthcare reserve"</strong> or{" "}
            <strong>"Child's undergrad"</strong> above to see how it looks.
          </EmptyHint>
        ) : (
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Your goals ({goals.length})
            </p>
            <div className="overflow-x-auto rounded-md border border-border">
              <table className="w-full text-xs">
                <thead className="bg-muted/40 uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-2 py-1.5 text-left font-medium">Goal</th>
                    <th className="px-2 py-1.5 text-right font-medium">Amount today</th>
                    <th className="px-2 py-1.5 text-right font-medium">By year</th>
                    <th className="px-2 py-1.5 text-right font-medium">At target</th>
                    <th className="px-2 py-1.5 text-right font-medium">SIP/mo</th>
                    <th className="px-2 py-1.5"></th>
                  </tr>
                </thead>
                <tbody>
                  {projections.map((p) => {
                    const cm = categoryMeta(p.goal.category);
                    return (
                      <tr key={p.goal.id} className="border-t border-border">
                        <td className="px-2 py-1.5">
                          <span className="mr-1">{cm.emoji}</span>
                          <span className="font-medium">{p.goal.name}</span>
                        </td>
                        <td className="px-2 py-1.5 text-right tabular-nums">
                          {formatCurrency(p.goal.targetAmountToday, destinationCountry, {
                            compact: true,
                          })}
                        </td>
                        <td className="px-2 py-1.5 text-right tabular-nums">
                          {p.goal.targetYear}
                          <span className="ml-1 text-[10px] text-muted-foreground">
                            (+{p.yearsToTarget}y)
                          </span>
                        </td>
                        <td className="px-2 py-1.5 text-right tabular-nums text-muted-foreground">
                          {formatCurrency(p.futureAmount, destinationCountry, { compact: true })}
                        </td>
                        <td className="px-2 py-1.5 text-right font-semibold tabular-nums text-purple-600 dark:text-purple-400">
                          {p.monthlySIP != null
                            ? formatCurrency(p.monthlySIP, destinationCountry, { compact: true })
                            : "—"}
                        </td>
                        <td className="px-2 py-1.5 text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            aria-label="Delete goal"
                            onClick={() => deleteGoal(p.goal.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5 text-red-500" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                  <tr className="border-t-2 border-border bg-muted/30 font-semibold">
                    <td className="px-2 py-1.5" colSpan={4}>
                      Total goals SIP
                    </td>
                    <td className="px-2 py-1.5 text-right tabular-nums text-purple-600 dark:text-purple-400">
                      {formatCurrency(totalGoalsSIP, destinationCountry, { compact: true })}
                    </td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* WINDFALLS — future lump-sums coming TO you */}
        <WindfallsSection
          destinationCountry={destinationCountry}
          expectedReturn={expectedReturn}
          retirementYear={retirementYear}
        />

        {/* Advice */}
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 text-xs">
          <p className="font-semibold">How to think about goals vs FIRE</p>
          <ul className="mt-1 list-disc space-y-0.5 pl-4 text-muted-foreground">
            <li>
              <strong>FIRE SIP</strong> = never-touch retirement corpus. Withdraw 4% forever.
            </li>
            <li>
              <strong>Goal SIP</strong> = separate sinking fund. Spent down completely on the
              target year.
            </li>
            <li>
              Keep them in <strong>different accounts</strong> — makes it psychologically
              impossible to raid the retirement pot for a wedding.
            </li>
            <li>
              A common Indian metro family runs 3–5 concurrent goals. That's normal.
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

// --------------------------------------------------------------------------

function MetricTile({
  label,
  value,
  hint,
  accent,
  emphasise,
}: {
  label: string;
  value: string;
  hint: string;
  accent: "orange" | "purple" | "emerald";
  emphasise?: boolean;
}) {
  const color =
    accent === "orange"
      ? "text-orange-600 dark:text-orange-400"
      : accent === "purple"
        ? "text-purple-600 dark:text-purple-400"
        : "text-emerald-600 dark:text-emerald-400";
  const border = emphasise
    ? "border-2 border-emerald-500/50 bg-emerald-500/5"
    : "border border-border bg-card";
  return (
    <div className={`rounded-lg p-3 ${border}`}>
      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={`mt-1 text-base font-bold tabular-nums sm:text-lg ${color}`}>{value}</p>
      <p className="mt-0.5 text-[11px] text-muted-foreground">{hint}</p>
    </div>
  );
}

function EmptyHint({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-dashed border-border bg-muted/30 p-3 text-xs text-muted-foreground">
      {children}
    </div>
  );
}

// ===========================================================================
// WINDFALLS SECTION — lump-sums coming TO the user (EOSB, inheritance, etc.)
// Opposite direction of Goals: these REDUCE the required FIRE SIP.
// ===========================================================================

function WindfallsSection({
  destinationCountry,
  expectedReturn,
  retirementYear,
}: {
  destinationCountry: CountryProfile;
  expectedReturn: number;
  retirementYear: number;
}) {
  const windfalls = useUserStore((s) => s.windfalls);
  const addWindfall = useUserStore((s) => s.addWindfall);
  const deleteWindfall = useUserStore((s) => s.deleteWindfall);

  const currentYear = new Date().getFullYear();
  const [name, setName] = useState("");
  const [category, setCategory] = useState<WindfallCategory>("eosb");
  const [amount, setAmount] = useState("");
  const [year, setYear] = useState(String(currentYear + 10));

  const projections = useMemo(
    () => projectWindfalls(windfalls, currentYear, retirementYear, expectedReturn),
    [windfalls, currentYear, retirementYear, expectedReturn],
  );
  const totalAtRetirement = totalWindfallsAtRetirement(projections);

  const applyPreset = (p: (typeof WINDFALL_PRESETS_USD)[number]) => {
    const localAmt = Math.round(p.amountUSD * destinationCountry.fxRateToUSD);
    setCategory(p.category);
    setName(p.name);
    setAmount(String(localAmt));
    setYear(String(currentYear + p.yearsFromNow));
  };

  const onAdd = () => {
    const amt = Number(amount);
    const yr = Number(year);
    if (!Number.isFinite(amt) || amt <= 0 || !Number.isFinite(yr) || yr <= currentYear) return;
    const n = name.trim() || windfallCategoryMeta(category).label;
    addWindfall({ name: n, category, amount: amt, targetYear: yr });
    setName("");
    setAmount("");
    setYear(String(currentYear + 10));
  };

  return (
    <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3">
      <div className="mb-2 flex items-center gap-2">
        <Gift className="h-4 w-4 text-emerald-500" />
        <p className="text-sm font-semibold">
          Future windfalls — lump-sums coming <em>to</em> you
        </p>
      </div>
      <p className="mb-3 text-xs text-muted-foreground">
        EOSB, inheritance, property sale, big bonus, severance. Each one{" "}
        <strong className="text-foreground">reduces your required SIP</strong> — the app
        compounds the amount from receipt date to your retirement and subtracts it from the
        FIRE target.
      </p>

      {/* Preset chips */}
      <div className="mb-3 flex flex-wrap gap-1.5">
        {WINDFALL_PRESETS_USD.map((p) => {
          const m = windfallCategoryMeta(p.category);
          return (
            <button
              key={p.name}
              type="button"
              onClick={() => applyPreset(p)}
              className="rounded-full border border-border bg-background px-2.5 py-1 text-[11px] hover:border-emerald-500/40 hover:bg-emerald-500/5"
            >
              {m.emoji} {p.name}
              <span className="ml-1 text-muted-foreground">· +{p.yearsFromNow}y</span>
            </button>
          );
        })}
      </div>

      {/* Add form */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-[2fr_1fr_1fr_1fr_auto]">
        <div>
          <Label htmlFor="w-name" className="text-[11px]">
            Name
          </Label>
          <Input
            id="w-name"
            placeholder="e.g. Dubai EOSB 2035"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-background"
          />
        </div>
        <div>
          <Label htmlFor="w-cat" className="text-[11px]">
            Type
          </Label>
          <Select value={category} onValueChange={(v) => setCategory(v as WindfallCategory)}>
            <SelectTrigger id="w-cat" className="bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {WINDFALL_CATEGORIES.map((c) => {
                const m = windfallCategoryMeta(c);
                return (
                  <SelectItem key={c} value={c}>
                    {m.emoji} {m.label}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="w-amt" className="text-[11px]">
            Amount ({destinationCountry.currency})
          </Label>
          <Input
            id="w-amt"
            type="number"
            min={0}
            value={amount}
            placeholder="e.g. 3500000"
            onChange={(e) => setAmount(e.target.value)}
            className="bg-background"
          />
        </div>
        <div>
          <Label htmlFor="w-yr" className="text-[11px]">
            Year
          </Label>
          <Input
            id="w-yr"
            type="number"
            min={currentYear + 1}
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="bg-background"
          />
        </div>
        <div className="flex items-end">
          <Button
            onClick={onAdd}
            disabled={!amount || Number(amount) <= 0}
            className="w-full bg-emerald-600 hover:bg-emerald-700"
          >
            <Plus className="h-4 w-4" /> Add
          </Button>
        </div>
      </div>

      {/* List */}
      {windfalls.length > 0 && (
        <div className="mt-3 overflow-x-auto rounded-md border border-border bg-background">
          <table className="w-full text-xs">
            <thead className="bg-muted/40 uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-2 py-1.5 text-left font-medium">Windfall</th>
                <th className="px-2 py-1.5 text-right font-medium">Year</th>
                <th className="px-2 py-1.5 text-right font-medium">Amount</th>
                <th className="px-2 py-1.5 text-right font-medium">At retirement</th>
                <th className="px-2 py-1.5"></th>
              </tr>
            </thead>
            <tbody>
              {projections.map((p) => {
                const m = windfallCategoryMeta(p.windfall.category);
                return (
                  <tr key={p.windfall.id} className="border-t border-border">
                    <td className="px-2 py-1.5">
                      <span className="mr-1">{m.emoji}</span>
                      <span className="font-medium">{p.windfall.name}</span>
                    </td>
                    <td className="px-2 py-1.5 text-right tabular-nums">
                      {p.windfall.targetYear}
                      <span className="ml-1 text-[10px] text-muted-foreground">
                        (+{p.yearsUntilReceipt}y)
                      </span>
                    </td>
                    <td className="px-2 py-1.5 text-right tabular-nums">
                      {formatCurrency(p.windfall.amount, destinationCountry, { compact: true })}
                    </td>
                    <td className="px-2 py-1.5 text-right font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(p.valueAtRetirement, destinationCountry, { compact: true })}
                    </td>
                    <td className="px-2 py-1.5 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        aria-label="Delete windfall"
                        onClick={() => deleteWindfall(p.windfall.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-red-500" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
              <tr className="border-t-2 border-border bg-muted/30 font-semibold">
                <td className="px-2 py-1.5" colSpan={3}>
                  Credit against FIRE target
                </td>
                <td className="px-2 py-1.5 text-right tabular-nums text-emerald-600 dark:text-emerald-400">
                  −{formatCurrency(totalAtRetirement, destinationCountry, { compact: true })}
                </td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
