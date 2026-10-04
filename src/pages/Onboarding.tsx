import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Disclaimer } from "@/components/layout/Disclaimer";
import { countryList, getCountryProfile } from "@/data/countryProfiles";
import { useDetectedCountry } from "@/hooks/useDetectedCountry";
import { toUserInput, useUserStore } from "@/store/userStore";
import type { CountryCode, FinancialGoal, RiskProfile } from "@/types";
import { formatCurrency } from "@/lib/formatters";
import { savingsRateFromAmount, suggestedMonthlySavings } from "@/lib/savings";
import { useI18n } from "@/i18n";

const STEP_KEYS = ["step1", "step2", "step3"] as const;
const GOALS: FinancialGoal[] = [
  "early_retirement",
  "wealth_building",
  "passive_income",
  "child_education",
  "home_purchase",
];
const riskKey: Record<RiskProfile, string> = {
  conservative: "riskConservative",
  moderate: "riskModerate",
  aggressive: "riskAggressive",
};

function riskFromSlider(v: number): RiskProfile {
  return v <= 33 ? "conservative" : v <= 66 ? "moderate" : "aggressive";
}
function sliderFromRisk(r: RiskProfile): number {
  return r === "conservative" ? 20 : r === "moderate" ? 50 : 85;
}

export function Onboarding() {
  const inputs = useUserStore((s) => s.inputs);
  const setCountry = useUserStore((s) => s.setCountry);
  const setRetirementCountry = useUserStore((s) => s.setRetirementCountry);
  const setAge = useUserStore((s) => s.setAge);
  const setMonthlyIncome = useUserStore((s) => s.setMonthlyIncome);
  const setRisk = useUserStore((s) => s.setRisk);
  const setGoal = useUserStore((s) => s.setGoal);
  const setPhase = useUserStore((s) => s.setPhase);
  const setSavingsRate = useUserStore((s) => s.setSavingsRate);
  const setMonthlyRemittance = useUserStore((s) => s.setMonthlyRemittance);
  const { t } = useI18n();
  const o = (key: string, vars?: Record<string, string | number>) => t(`onboarding.${key}`, vars);

  const [step, setStep] = useState(1);
  // Until the user types their own savings figure, keep it in sync with the
  // suggestion (which moves with income and money sent home). Someone coming
  // back to edit answers already has a figure — don't overwrite it.
  const [savingsTouched, setSavingsTouched] = useState(() => inputs.age != null);
  const { country: detected, loading: detecting } = useDetectedCountry();

  // Auto-apply detected country if user hasn't picked one yet.
  useEffect(() => {
    if (!inputs.country && detected) setCountry(detected);
  }, [detected, inputs.country, setCountry]);

  const selected = inputs.country ? getCountryProfile(inputs.country) : undefined;

  // Seed income default whenever country changes and income is empty.
  useEffect(() => {
    if (selected && inputs.monthlyIncome == null) {
      setMonthlyIncome(selected.defaultMonthlyIncome);
    }
  }, [selected, inputs.monthlyIncome, setMonthlyIncome]);

  const income = inputs.monthlyIncome ?? 0;
  const remittance = inputs.monthlyRemittance ?? 0;
  const suggestedSavings = suggestedMonthlySavings(income, remittance);
  const savingsAmount = Math.round(income * (inputs.savingsRate ?? 0));
  const overBudget = income > 0 && savingsAmount + remittance > income;

  useEffect(() => {
    if (!savingsTouched && income > 0) {
      setSavingsRate(savingsRateFromAmount(income, suggestedSavings));
    }
  }, [savingsTouched, income, suggestedSavings, setSavingsRate]);

  const riskSlider = useMemo(() => sliderFromRisk(inputs.risk ?? "moderate"), [inputs.risk]);

  const canAdvance =
    step === 1
      ? !!inputs.country
      : step === 2
        ? typeof inputs.age === "number" &&
          inputs.age >= 18 &&
          inputs.age <= 90 &&
          typeof inputs.monthlyIncome === "number" &&
          inputs.monthlyIncome > 0 &&
          (inputs.savingsRate ?? 0) > 0 &&
          !overBudget
        : !!inputs.risk && !!inputs.goal;

  const onFinish = () => {
    const complete = toUserInput(inputs);
    if (complete) setPhase("reveal");
  };

  return (
    <div className="container max-w-2xl py-10 animate-fade-in">
      <h1 className="sr-only">{o("pageTitle")}</h1>
      <nav aria-label={o("progressLabel")} className="mb-6">
        <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {o("stepN", { n: step, total: STEP_KEYS.length })} — {o(`${STEP_KEYS[step - 1]}Title`)}
          </span>
          <span>{Math.round((step / STEP_KEYS.length) * 100)}%</span>
        </div>
        <Progress value={(step / STEP_KEYS.length) * 100} aria-label={o("progressLabel")} />
      </nav>

      <Card>
        <CardHeader>
          <CardTitle>{o(`${STEP_KEYS[step - 1]}Title`)}</CardTitle>
          <CardDescription>{o(`${STEP_KEYS[step - 1]}Description`)}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="country">{o("countryLabel")}</Label>
                <Select
                  value={inputs.country ?? ""}
                  onValueChange={(v) => setCountry(v as CountryCode)}
                >
                  <SelectTrigger id="country" aria-label="Resident country">
                    <SelectValue placeholder={o("countryPlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    {countryList.map((c) => (
                      <SelectItem key={c.code} value={c.code}>
                        {c.flag} {c.name} ({c.currency})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {detecting && (
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" /> {o("detecting")}
                  </p>
                )}
                {detected && detected === inputs.country && (
                  <p className="text-xs text-muted-foreground">{o("detected")}</p>
                )}
              </div>

              {/* Expat / dual-country toggle */}
              <div className="rounded-lg border border-orange-500/30 bg-orange-500/5 p-3">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="mt-0.5 h-4 w-4 rounded border-border"
                    checked={inputs.retirementCountry != null && inputs.retirementCountry !== inputs.country}
                    onChange={(e) => {
                      if (!e.target.checked) {
                        setRetirementCountry(undefined);
                      } else if (inputs.country) {
                        // Default the picker to India for Gulf residents, else US, else leave blank.
                        const preset: CountryCode | undefined =
                          inputs.country === "AE" || inputs.country === "SA"
                            ? "IN"
                            : inputs.country === "US"
                              ? "GB"
                              : "IN";
                        setRetirementCountry(preset);
                      }
                    }}
                  />
                  <span className="text-sm">
                    <strong>{o("expatCheckbox")}</strong>{" "}
                    <span className="text-muted-foreground">{o("expatHint")}</span>
                  </span>
                </label>
                {inputs.retirementCountry != null && inputs.retirementCountry !== inputs.country && (
                  <div className="mt-3 space-y-1.5">
                    <Label htmlFor="retire-country" className="text-xs">
                      {o("retireCountryLabel")}
                    </Label>
                    <Select
                      value={inputs.retirementCountry ?? ""}
                      onValueChange={(v) => setRetirementCountry(v as CountryCode)}
                    >
                      <SelectTrigger id="retire-country" aria-label="Retirement country">
                        <SelectValue placeholder={o("retireCountryPlaceholder")} />
                      </SelectTrigger>
                      <SelectContent>
                        {countryList.map((c) => (
                          <SelectItem key={c.code} value={c.code}>
                            {c.flag} {c.name} ({c.currency})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-[11px] text-muted-foreground">
                      {o("retireCountryNote", {
                        dest: getCountryProfile(inputs.retirementCountry).name,
                        home: selected?.name ?? "",
                      })}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 2 && selected && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="age">{o("ageLabel")}</Label>
                <Input
                  id="age"
                  type="number"
                  inputMode="numeric"
                  min={18}
                  max={90}
                  value={inputs.age ?? ""}
                  placeholder={o("agePlaceholder")}
                  onChange={(e) => setAge(Number(e.target.value))}
                />
                <p className="text-xs text-muted-foreground">{o("ageHint")}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="income">{o("incomeLabel", { currency: selected.currency })}</Label>
                <Input
                  id="income"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  placeholder={selected.defaultMonthlyIncome.toLocaleString()}
                  value={inputs.monthlyIncome ?? ""}
                  onChange={(e) => setMonthlyIncome(Number(e.target.value))}
                />
                <p className="text-xs text-muted-foreground">{o("incomeHint")}</p>
                {income > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {o("perYear", { amount: formatCurrency(income * 12, selected) })}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="remittance">{o("remitLabel", { currency: selected.currency })}</Label>
                <Input
                  id="remittance"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  placeholder="0"
                  value={inputs.monthlyRemittance || ""}
                  onChange={(e) => setMonthlyRemittance(Number(e.target.value) || 0)}
                />
                <p className="text-xs text-muted-foreground">{o("remitHint")}</p>
              </div>
              <div className="space-y-2 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3">
                <Label htmlFor="savings">{o("savingsLabel", { currency: selected.currency })}</Label>
                <Input
                  id="savings"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  className="bg-background"
                  value={savingsAmount || ""}
                  placeholder={String(suggestedSavings)}
                  onChange={(e) => {
                    setSavingsTouched(true);
                    setSavingsRate(savingsRateFromAmount(income, Number(e.target.value) || 0));
                  }}
                />
                {income > 0 && savingsAmount > 0 && (
                  <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                    {o("savingsPercent", { pct: Math.round((savingsAmount / income) * 100) })}
                  </p>
                )}
                {overBudget && (
                  <p role="alert" className="text-xs font-medium text-red-600 dark:text-red-400">
                    {o("savingsTooHigh")}
                  </p>
                )}
                {suggestedSavings > 0 && savingsAmount !== suggestedSavings && (
                  <p className="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
                    <span>{o("savingsSuggested", { amount: formatCurrency(suggestedSavings, selected) })}</span>
                    <button
                      type="button"
                      className="font-medium text-emerald-700 underline underline-offset-2 dark:text-emerald-400"
                      onClick={() => {
                        setSavingsTouched(false);
                        setSavingsRate(savingsRateFromAmount(income, suggestedSavings));
                      }}
                    >
                      {o("savingsUseSuggestion")}
                    </button>
                  </p>
                )}
                <p className="text-xs text-muted-foreground">{o("savingsHint")}</p>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>{o("riskLabel")}</Label>
                  <span className="text-sm font-semibold text-primary">
                    {o(riskKey[inputs.risk ?? "moderate"])}
                  </span>
                </div>
                <Slider
                  value={[riskSlider]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={([v]) => setRisk(riskFromSlider(v))}
                  aria-label={o("riskAria")}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{o("riskConservative")}</span>
                  <span>{o("riskModerate")}</span>
                  <span>{o("riskAggressive")}</span>
                </div>
                {/* Live plain-English explainer for the current selection */}
                {(() => {
                  const r = inputs.risk ?? "moderate";
                  return (
                    <div className="mt-1 rounded-md border border-primary/30 bg-primary/5 p-2.5">
                      <p className="text-xs font-semibold text-primary">{o(riskKey[r])}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{o(`risk.${r}.line`)}</p>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        <strong>{o(`risk.${r}.example`)}</strong>
                      </p>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        <em>{o("riskSuitsPrefix")}</em> {o(`risk.${r}.suits`)}
                      </p>
                    </div>
                  );
                })()}
                <p className="text-[11px] text-muted-foreground">{o("riskNotSure")}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="goal">{o("goalLabel")}</Label>
                <Select
                  value={inputs.goal ?? ""}
                  onValueChange={(v) => setGoal(v as FinancialGoal)}
                >
                  <SelectTrigger id="goal" aria-label="Financial goal">
                    <SelectValue placeholder={o("goalPlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    {GOALS.map((g) => (
                      <SelectItem key={g} value={g}>
                        {o(`goals.${g}.label`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {inputs.goal && (
                  <div className="rounded-md border border-border bg-muted/30 p-2.5">
                    <p className="text-xs font-medium">{o(`goals.${inputs.goal}.blurb`)}</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      <em>{o("goalPickIf")}</em> {o(`goals.${inputs.goal}.who`)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <Button
              variant="ghost"
              onClick={() => (step > 1 ? setStep(step - 1) : setPhase("landing"))}
            >
              <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
              {step === 1 ? t("common.back") : t("common.previous")}
            </Button>
            {step < STEP_KEYS.length ? (
              <Button onClick={() => setStep(step + 1)} disabled={!canAdvance}>
                {t("common.continue")} <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </Button>
            ) : (
              <Button onClick={onFinish} disabled={!canAdvance}>
                {o("seePlanButton")} <ArrowRight className="h-4 w-4 rtl:rotate-180" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="mt-6">
        <Disclaimer country={selected} compact />
      </div>
    </div>
  );
}
