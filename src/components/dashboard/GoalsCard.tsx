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
import { useI18n } from "@/i18n";

type Vars = Record<string, string | number>;

/** Translation keys for GOAL_PRESETS_USD / WINDFALL_PRESETS_USD, in the same order. */
const GOAL_PRESET_KEYS = [
  "ugLocal",
  "ugForeign",
  "pg",
  "wedding",
  "parents",
  "homeDown",
  "land",
  "car",
  "travel",
  "medical",
] as const;
const WINDFALL_PRESET_KEYS = [
  "eosb",
  "property",
  "inheritance",
  "bonus",
  "severance",
  "pension",
  "lic",
] as const;

function useGoalsText() {
  const { t, countryName } = useI18n();
  const g = (key: string, vars?: Vars) => t(`dash.goals.${key}`, vars);
  return { t, g, countryName };
}

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
  const { t, g, countryName } = useGoalsText();
  const { tList } = useI18n();
  const money = (n: number) => formatCurrency(n, destinationCountry, { compact: true });
  const catLabel = (c: GoalCategory) => g(`cat.${c}`);
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
    const finalName = name.trim() || g("defaultName", { category: catLabel(category) });
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

  const presetName = (i: number) => {
    const key = GOAL_PRESET_KEYS[i];
    return key ? g(`preset.${key}`) : GOAL_PRESETS_USD[i]?.name ?? "";
  };
  const applyPreset = (p: (typeof GOAL_PRESETS_USD)[number], i: number) => {
    // Convert the USD preset into destination currency and pick a sensible name.
    const localAmt = Math.round(p.amountUSD * destinationCountry.fxRateToUSD);
    setCategory(p.category);
    setName(presetName(i));
    setAmount(String(localAmt));
    setYear(String(CURRENT_YEAR + p.yearsFromNow));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GoalIcon className="h-5 w-5 text-purple-500" />
          {g("title")}
          <span className="ms-auto rounded-full bg-purple-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400">
            {g("badge")}
          </span>
        </CardTitle>
        <CardDescription>{g("desc")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Combined SIP hero */}
        <div className="grid gap-2 sm:grid-cols-3">
          <MetricTile
            label={g("tileFire")}
            value={fireSIP != null ? `${money(fireSIP)}${t("dash.common.perMonth")}` : "—"}
            hint={g("tileFireHint")}
            accent="orange"
          />
          <MetricTile
            label={g("tileGoals")}
            value={
              totalGoalsSIP > 0 ? `${money(totalGoalsSIP)}${t("dash.common.perMonth")}` : "—"
            }
            hint={g("tileGoalsHint", { n: goals.length })}
            accent="purple"
          />
          <MetricTile
            label={g("tileTotal")}
            value={`${money(totalMonthly)}${t("dash.common.perMonth")}`}
            hint={g("tileTotalHint")}
            accent="emerald"
            emphasise
          />
        </div>

        {/* Add-goal form */}
        <div className="rounded-lg border border-purple-500/30 bg-purple-500/5 p-3">
          <p className="text-xs font-semibold">{g("addTitle")}</p>
          <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-[2fr_1fr_1fr_1fr_auto]">
            <div>
              <Label htmlFor="g-name" className="text-[11px]">
                {g("name")}
              </Label>
              <Input
                id="g-name"
                placeholder={g("namePh")}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-background"
              />
            </div>
            <div>
              <Label htmlFor="g-category" className="text-[11px]">
                {g("category")}
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
                        {m.emoji} {catLabel(c)}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="g-amount" className="text-[11px]">
                {g("amountToday", { currency: destinationCountry.currency })}
              </Label>
              <Input
                id="g-amount"
                type="number"
                min={0}
                value={amount}
                inputMode="numeric"
                placeholder={g("amountPh")}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-background"
              />
            </div>
            <div>
              <Label htmlFor="g-year" className="text-[11px]">
                {g("targetYear")}
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
                <Plus className="h-4 w-4" /> {g("add")}
              </Button>
            </div>
          </div>
          {justAdded && (
            <p className="mt-2 flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" /> {g("added", { name: justAdded })}
            </p>
          )}
          <p className="mt-2 text-[11px] text-muted-foreground">
            {g("todayMoney", {
              country: countryName(destinationCountry.code, destinationCountry.name),
              inflation: (destinationCountry.inflationRate * 100).toFixed(1),
            })}
          </p>
        </div>

        {/* Preset chips */}
        <div>
          <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-purple-500" /> {g("presets")}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {GOAL_PRESETS_USD.map((p, i) => (
              <button
                key={p.name}
                type="button"
                onClick={() => applyPreset(p, i)}
                className="rounded-full border border-border bg-background px-2.5 py-1 text-xs hover:border-purple-500/40 hover:bg-purple-500/5"
              >
                {p.emoji} {presetName(i)}{" "}
                <span className="text-muted-foreground">
                  · {g("plusYears", { n: p.yearsFromNow })}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Goals list */}
        {goals.length === 0 ? (
          <EmptyHint>{g("empty")}</EmptyHint>
        ) : (
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {g("yourGoals", { n: goals.length })}
            </p>
            <div className="overflow-x-auto rounded-md border border-border">
              <table className="w-full text-xs">
                <thead className="bg-muted/40 uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="px-2 py-1.5 text-start font-medium">{g("colGoal")}</th>
                    <th className="px-2 py-1.5 text-end font-medium">{g("colToday")}</th>
                    <th className="px-2 py-1.5 text-end font-medium">{g("colYear")}</th>
                    <th className="px-2 py-1.5 text-end font-medium">{g("colTarget")}</th>
                    <th className="px-2 py-1.5 text-end font-medium">{g("colSip")}</th>
                    <th className="px-2 py-1.5"></th>
                  </tr>
                </thead>
                <tbody>
                  {projections.map((p) => {
                    const cm = categoryMeta(p.goal.category);
                    return (
                      <tr key={p.goal.id} className="border-t border-border">
                        <td className="px-2 py-1.5">
                          <span className="me-1">{cm.emoji}</span>
                          <span className="font-medium">{p.goal.name}</span>
                        </td>
                        <td className="px-2 py-1.5 text-end tabular-nums">
                          {formatCurrency(p.goal.targetAmountToday, destinationCountry, {
                            compact: true,
                          })}
                        </td>
                        <td className="px-2 py-1.5 text-end tabular-nums">
                          {p.goal.targetYear}
                          <span className="ms-1 text-[10px] text-muted-foreground">
                            ({g("plusYears", { n: p.yearsToTarget })})
                          </span>
                        </td>
                        <td className="px-2 py-1.5 text-end tabular-nums text-muted-foreground">
                          {formatCurrency(p.futureAmount, destinationCountry, { compact: true })}
                        </td>
                        <td className="px-2 py-1.5 text-end font-semibold tabular-nums text-purple-600 dark:text-purple-400">
                          {p.monthlySIP != null
                            ? formatCurrency(p.monthlySIP, destinationCountry, { compact: true })
                            : "—"}
                        </td>
                        <td className="px-2 py-1.5 text-end">
                          <Button
                            size="sm"
                            variant="ghost"
                            aria-label={g("deleteGoal")}
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
                      {g("totalGoals")}
                    </td>
                    <td className="px-2 py-1.5 text-end tabular-nums text-purple-600 dark:text-purple-400">
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
          <p className="font-semibold">{g("adviceTitle")}</p>
          <ul className="mt-1 list-disc space-y-0.5 ps-4 text-muted-foreground">
            {tList("dash.goals.advice").map((line) => (
              <li key={line}>{line}</li>
            ))}
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
  const { g } = useGoalsText();
  const w = (key: string, vars?: Vars) => g(`wf.${key}`, vars);
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

  const presetName = (i: number) => {
    const key = WINDFALL_PRESET_KEYS[i];
    return key ? w(`preset.${key}`) : WINDFALL_PRESETS_USD[i]?.name ?? "";
  };
  const applyPreset = (p: (typeof WINDFALL_PRESETS_USD)[number], i: number) => {
    const localAmt = Math.round(p.amountUSD * destinationCountry.fxRateToUSD);
    setCategory(p.category);
    setName(presetName(i));
    setAmount(String(localAmt));
    setYear(String(currentYear + p.yearsFromNow));
  };

  const onAdd = () => {
    const amt = Number(amount);
    const yr = Number(year);
    if (!Number.isFinite(amt) || amt <= 0 || !Number.isFinite(yr) || yr <= currentYear) return;
    const n = name.trim() || w(`cat.${category}`);
    addWindfall({ name: n, category, amount: amt, targetYear: yr });
    setName("");
    setAmount("");
    setYear(String(currentYear + 10));
  };

  return (
    <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3">
      <div className="mb-2 flex items-center gap-2">
        <Gift className="h-4 w-4 text-emerald-500" />
        <p className="text-sm font-semibold">{w("title")}</p>
      </div>
      <p className="mb-3 text-xs text-muted-foreground">{w("desc")}</p>

      {/* Preset chips */}
      <div className="mb-3 flex flex-wrap gap-1.5">
        {WINDFALL_PRESETS_USD.map((p, i) => {
          const m = windfallCategoryMeta(p.category);
          return (
            <button
              key={p.name}
              type="button"
              onClick={() => applyPreset(p, i)}
              className="rounded-full border border-border bg-background px-2.5 py-1 text-[11px] hover:border-emerald-500/40 hover:bg-emerald-500/5"
            >
              {m.emoji} {presetName(i)}
              <span className="ms-1 text-muted-foreground">
                · {g("plusYears", { n: p.yearsFromNow })}
              </span>
            </button>
          );
        })}
      </div>

      {/* Add form */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-[2fr_1fr_1fr_1fr_auto]">
        <div>
          <Label htmlFor="w-name" className="text-[11px]">
            {g("name")}
          </Label>
          <Input
            id="w-name"
            placeholder={w("namePh")}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-background"
          />
        </div>
        <div>
          <Label htmlFor="w-cat" className="text-[11px]">
            {w("type")}
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
                    {m.emoji} {w(`cat.${c}`)}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="w-amt" className="text-[11px]">
            {w("amount", { currency: destinationCountry.currency })}
          </Label>
          <Input
            id="w-amt"
            type="number"
            min={0}
            value={amount}
            inputMode="numeric"
            placeholder="3500000"
            onChange={(e) => setAmount(e.target.value)}
            className="bg-background"
          />
        </div>
        <div>
          <Label htmlFor="w-yr" className="text-[11px]">
            {w("year")}
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
            <Plus className="h-4 w-4" /> {g("add")}
          </Button>
        </div>
      </div>

      {/* List */}
      {windfalls.length > 0 && (
        <div className="mt-3 overflow-x-auto rounded-md border border-border bg-background">
          <table className="w-full text-xs">
            <thead className="bg-muted/40 uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-2 py-1.5 text-start font-medium">{w("colName")}</th>
                <th className="px-2 py-1.5 text-end font-medium">{w("colYear")}</th>
                <th className="px-2 py-1.5 text-end font-medium">{w("colAmount")}</th>
                <th className="px-2 py-1.5 text-end font-medium">{w("colAtRet")}</th>
                <th className="px-2 py-1.5"></th>
              </tr>
            </thead>
            <tbody>
              {projections.map((p) => {
                const m = windfallCategoryMeta(p.windfall.category);
                return (
                  <tr key={p.windfall.id} className="border-t border-border">
                    <td className="px-2 py-1.5">
                      <span className="me-1">{m.emoji}</span>
                      <span className="font-medium">{p.windfall.name}</span>
                    </td>
                    <td className="px-2 py-1.5 text-end tabular-nums">
                      {p.windfall.targetYear}
                      <span className="ms-1 text-[10px] text-muted-foreground">
                        ({g("plusYears", { n: p.yearsUntilReceipt })})
                      </span>
                    </td>
                    <td className="px-2 py-1.5 text-end tabular-nums">
                      {formatCurrency(p.windfall.amount, destinationCountry, { compact: true })}
                    </td>
                    <td className="px-2 py-1.5 text-end font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(p.valueAtRetirement, destinationCountry, { compact: true })}
                    </td>
                    <td className="px-2 py-1.5 text-end">
                      <Button
                        size="sm"
                        variant="ghost"
                        aria-label={w("deleteWf")}
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
                  {w("credit")}
                </td>
                <td className="px-2 py-1.5 text-end tabular-nums text-emerald-600 dark:text-emerald-400">
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
