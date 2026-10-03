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

const STEPS = [
  { id: 1, label: "Where do you want to invest for FIRE?" },
  { id: 2, label: "About you" },
  { id: 3, label: "Risk & goal" },
] as const;

const goalOptions: Array<{ value: FinancialGoal; label: string; blurb: string }> = [
  { value: "early_retirement", label: "Early retirement", blurb: "Stop needing a paycheque as early as possible." },
  { value: "wealth_building", label: "Long-term wealth building", blurb: "Maximise net worth over decades." },
  { value: "passive_income", label: "Passive income", blurb: "Live off yields and dividends." },
  { value: "child_education", label: "Child's education", blurb: "Fund a university corpus on a timeline." },
  { value: "home_purchase", label: "Home purchase", blurb: "Grow a down payment safely." },
];

const riskLabels: Record<RiskProfile, string> = {
  conservative: "Conservative",
  moderate: "Moderate",
  aggressive: "Aggressive",
};

/** Plain-English explanation of each risk level — shown live under the slider. */
const riskExplainers: Record<RiskProfile, { line: string; example: string; suits: string }> = {
  conservative: {
    line: "Most money in safer instruments (bonds, FDs). Lower ups and downs, lower long-term growth.",
    example: "e.g. 40% stocks, 50% bonds/FDs, 10% gold. Expect ~7% / year long-run.",
    suits: "You lose sleep when markets drop, or you'll need the money in <5 years.",
  },
  moderate: {
    line: "Balanced mix — most people should pick this. Rides out normal market dips.",
    example: "e.g. 65% stocks, 25% bonds, 10% gold. Expect ~9–10% / year long-run.",
    suits: "You can leave money invested for 7+ years and won't panic-sell in a bad year.",
  },
  aggressive: {
    line: "Mostly stocks. Bigger swings, but historically the fastest way to grow wealth over 15+ years.",
    example: "e.g. 85% stocks, 10% bonds, 5% gold. Expect ~11–13% / year long-run.",
    suits: "You're young, income is stable, and you won't touch this money for 15+ years.",
  },
};

/** Plain-English "who this suits" for each goal — shown as the blurb below the picker. */
const goalWho: Record<FinancialGoal, string> = {
  early_retirement: "You want the option to quit your job well before 60.",
  wealth_building: "You're not sure of the exact goal — you just want your money to grow.",
  passive_income: "You want rental / dividend income to cover monthly bills someday.",
  child_education: "You have a specific target amount and year (e.g. ₹40 L by 2035).",
  home_purchase: "You need a lump sum for a down payment in the next 3–7 years.",
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

  const [step, setStep] = useState(1);
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

  const riskSlider = useMemo(() => sliderFromRisk(inputs.risk ?? "moderate"), [inputs.risk]);

  const canAdvance =
    step === 1
      ? !!inputs.country
      : step === 2
        ? typeof inputs.age === "number" &&
          inputs.age >= 18 &&
          inputs.age <= 90 &&
          typeof inputs.monthlyIncome === "number" &&
          inputs.monthlyIncome > 0
        : !!inputs.risk && !!inputs.goal;

  const onFinish = () => {
    const complete = toUserInput(inputs);
    if (complete) setPhase("reveal");
  };

  return (
    <div className="container max-w-2xl py-10 animate-fade-in">
      <h1 className="sr-only">Build your FIRE plan</h1>
      <nav aria-label="Onboarding progress" className="mb-6">
        <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Step {step} of {STEPS.length} — {STEPS[step - 1].label}
          </span>
          <span>{Math.round((step / STEPS.length) * 100)}%</span>
        </div>
        <Progress value={(step / STEPS.length) * 100} aria-label="Progress through onboarding" />
      </nav>

      <Card>
        <CardHeader>
          <CardTitle>{STEPS[step - 1].label}</CardTitle>
          <CardDescription>
            {step === 1 && "Pick the market your FIRE corpus will live in — we'll tailor accounts, tax wrappers, currency, and investable vehicles to it."}
            {step === 2 && "Two quick numbers — we pre-fill a sensible median for your country."}
            {step === 3 && "Tell us how much risk you're comfortable with, and what you're saving for."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="country">Where you live & earn now</Label>
                <Select
                  value={inputs.country ?? ""}
                  onValueChange={(v) => setCountry(v as CountryCode)}
                >
                  <SelectTrigger id="country" aria-label="Resident country">
                    <SelectValue placeholder="Select a country" />
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
                    <Loader2 className="h-3 w-3 animate-spin" /> Detecting from your location…
                  </p>
                )}
                {detected && detected === inputs.country && (
                  <p className="text-xs text-muted-foreground">
                    Pre-selected based on your location. Change it freely.
                  </p>
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
                    <strong>I'll retire in a different country</strong>{" "}
                    <span className="text-muted-foreground">
                      (e.g. UAE expat planning to retire in India)
                    </span>
                  </span>
                </label>
                {inputs.retirementCountry != null && inputs.retirementCountry !== inputs.country && (
                  <div className="mt-3 space-y-1.5">
                    <Label htmlFor="retire-country" className="text-xs">
                      Where you'll retire & spend
                    </Label>
                    <Select
                      value={inputs.retirementCountry ?? ""}
                      onValueChange={(v) => setRetirementCountry(v as CountryCode)}
                    >
                      <SelectTrigger id="retire-country" aria-label="Retirement country">
                        <SelectValue placeholder="Select retirement country" />
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
                      Your FIRE number, expenses, and inflation will use{" "}
                      <strong>
                        {getCountryProfile(inputs.retirementCountry).name}
                      </strong>
                      's data. Your salary and investments stay anchored in{" "}
                      <strong>{selected?.name ?? "your home country"}</strong>.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 2 && selected && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="age">Your age today</Label>
                <Input
                  id="age"
                  type="number"
                  min={18}
                  max={90}
                  value={inputs.age ?? ""}
                  placeholder="e.g. 32"
                  onChange={(e) => setAge(Number(e.target.value))}
                />
                <p className="text-xs text-muted-foreground">
                  Every extra year you have = more time for compounding. A ₹5,000/mo SIP started
                  at 22 becomes ~₹3 Cr by 60. Same SIP started at 35 becomes ~₹80 L.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="income">
                  Your take-home monthly income ({selected.currency})
                </Label>
                <Input
                  id="income"
                  type="number"
                  min={0}
                  placeholder={`e.g. ${selected.defaultMonthlyIncome.toLocaleString()}`}
                  value={inputs.monthlyIncome ?? ""}
                  onChange={(e) => setMonthlyIncome(Number(e.target.value))}
                />
                <p className="text-xs text-muted-foreground">
                  <strong>After tax / EPF</strong> — what actually lands in your bank each month.
                  Don't include bonuses; add them later on the dashboard.
                </p>
                {typeof inputs.monthlyIncome === "number" && inputs.monthlyIncome > 0 && (
                  <p className="text-xs text-muted-foreground">
                    ≈ {formatCurrency(inputs.monthlyIncome * 12, selected)} / year.
                  </p>
                )}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>How much market swing can you handle?</Label>
                  <span className="text-sm font-semibold text-primary">
                    {riskLabels[inputs.risk ?? "moderate"]}
                  </span>
                </div>
                <Slider
                  value={[riskSlider]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={([v]) => setRisk(riskFromSlider(v))}
                  aria-label="Risk appetite"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Conservative</span>
                  <span>Moderate</span>
                  <span>Aggressive</span>
                </div>
                {/* Live plain-English explainer for the current selection */}
                {(() => {
                  const r = inputs.risk ?? "moderate";
                  const ex = riskExplainers[r];
                  return (
                    <div className="mt-1 rounded-md border border-primary/30 bg-primary/5 p-2.5">
                      <p className="text-xs font-semibold text-primary">
                        {riskLabels[r]}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{ex.line}</p>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        <strong>{ex.example}</strong>
                      </p>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        <em>Suits you if:</em> {ex.suits}
                      </p>
                    </div>
                  );
                })()}
                <p className="text-[11px] text-muted-foreground">
                  Not sure? Pick <strong>Moderate</strong> — it's what most people should choose.
                  You can change it anytime.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="goal">What are you saving for?</Label>
                <Select
                  value={inputs.goal ?? ""}
                  onValueChange={(v) => setGoal(v as FinancialGoal)}
                >
                  <SelectTrigger id="goal" aria-label="Financial goal">
                    <SelectValue placeholder="Choose a goal" />
                  </SelectTrigger>
                  <SelectContent>
                    {goalOptions.map((g) => (
                      <SelectItem key={g.value} value={g.value}>
                        {g.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {inputs.goal && (
                  <div className="rounded-md border border-border bg-muted/30 p-2.5">
                    <p className="text-xs font-medium">
                      {goalOptions.find((g) => g.value === inputs.goal)?.blurb}
                    </p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      <em>Pick this if:</em> {goalWho[inputs.goal]}
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
              <ArrowLeft className="h-4 w-4" />
              {step === 1 ? "Back" : "Previous"}
            </Button>
            {step < STEPS.length ? (
              <Button onClick={() => setStep(step + 1)} disabled={!canAdvance}>
                Continue <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={onFinish} disabled={!canAdvance}>
                See my plan <ArrowRight className="h-4 w-4" />
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
