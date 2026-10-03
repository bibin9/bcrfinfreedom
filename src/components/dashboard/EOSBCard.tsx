import { useMemo, useState } from "react";
import { AlertTriangle, Briefcase, CheckCircle2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Term } from "@/components/ui/term";
import { difcDews, estimateSaudi, estimateUAE, type SaudiExitReason } from "@/lib/eosb";
import { convertCurrency } from "@/lib/fx";
import { formatCurrency } from "@/lib/formatters";
import type { CountryProfile } from "@/types";
import { useUserStore } from "@/store/userStore";

interface Props {
  residentCountry: CountryProfile; // AE or SA
  destinationCountry: CountryProfile;
  monthlyIncome: number;
  age: number;
  freedomAge: number;
  expectedReturn: number;
}

type UAEMode = "mainland" | "difc";

/**
 * The single biggest "invisible asset" for Gulf expats. Estimates the payout
 * and lets the user add it as a windfall in their departure year, which
 * reduces the required FIRE SIP.
 */
export function EOSBCard({
  residentCountry,
  destinationCountry,
  monthlyIncome,
  age,
  freedomAge,
  expectedReturn,
}: Props) {
  const isUAE = residentCountry.code === "AE";
  const windfalls = useUserStore((s) => s.windfalls);
  const assets = useUserStore((s) => s.assets);
  const addWindfall = useUserStore((s) => s.addWindfall);
  const deleteWindfall = useUserStore((s) => s.deleteWindfall);

  const [basic, setBasic] = useState(Math.round(monthlyIncome * (isUAE ? 0.6 : 0.75)));
  const [yearsServed, setYearsServed] = useState(3);
  const [leaveAge, setLeaveAge] = useState(Math.max(age + 1, Math.min(freedomAge, 75)));
  const [mode, setMode] = useState<UAEMode>("mainland");
  const [reason, setReason] = useState<SaudiExitReason>("termination");
  const [added, setAdded] = useState(false);
  const basicGrowth = 0.03;

  const extraYears = Math.max(0, leaveAge - age);
  const departureYear = new Date().getFullYear() + extraYears;

  const estimate = useMemo(() => {
    if (!isUAE) return estimateSaudi(basic, yearsServed, extraYears, basicGrowth, reason);
    if (mode === "difc") {
      const d = difcDews(basic, yearsServed, extraYears, expectedReturn, basicGrowth);
      return { ...d, basicAtDeparture: basic, totalYears: yearsServed + extraYears, capped: false };
    }
    return estimateUAE(basic, yearsServed, extraYears, basicGrowth);
  }, [isUAE, mode, basic, yearsServed, extraYears, reason, expectedReturn]);

  const fmt = (v: number) => formatCurrency(v, residentCountry, { compact: true });
  const existingEosb = windfalls.find((w) => w.category === "eosb");
  const hasGratuityAsset = assets.some((a) => a.category === "gratuity");
  const isExpat = destinationCountry.code !== residentCountry.code;

  const addAsWindfall = () => {
    if (existingEosb) deleteWindfall(existingEosb.id);
    addWindfall({
      name: isUAE ? (mode === "difc" ? "DIFC DEWS payout" : "UAE gratuity (EOSB)") : "Saudi end-of-service award",
      category: "eosb",
      amount: Math.round(convertCurrency(estimate.atDeparture, residentCountry, destinationCountry)),
      targetYear: departureYear,
      note: "Estimated by the EOSB calculator",
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  const label = isUAE
    ? mode === "difc"
      ? "DEWS balance"
      : "Gratuity"
    : "End-of-service award";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-orange-500" />
          {isUAE ? "UAE end-of-service gratuity" : "Saudi end-of-service award"}
          <span className="ml-auto rounded-full bg-orange-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-orange-600 dark:text-orange-400">
            Your hidden asset
          </span>
        </CardTitle>
        <CardDescription>
          Most Gulf expats forget this lump sum when planning. It's paid when you leave your
          job — estimate it here and add it to your plan so it lowers the SIP you need.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isUAE && (
          <div className="grid grid-cols-2 gap-2">
            {(["mainland", "difc"] as UAEMode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`rounded-md border px-3 py-2 text-xs font-medium transition ${
                  mode === m
                    ? "border-orange-500 bg-orange-500/10 text-orange-700 dark:text-orange-300"
                    : "border-border text-muted-foreground hover:bg-muted/40"
                }`}
              >
                {m === "mainland" ? "Mainland / most free zones" : "DIFC employer (DEWS)"}
              </button>
            ))}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <Label htmlFor="eosb-basic" className="text-xs">
              {isUAE ? "Basic monthly salary" : "Monthly wage (basic + housing)"} (
              {residentCountry.currency})
            </Label>
            <Input
              id="eosb-basic"
              type="number"
              min={0}
              value={basic || ""}
              onChange={(e) => setBasic(Number(e.target.value) || 0)}
            />
            <p className="text-[11px] text-muted-foreground">
              {isUAE
                ? "Basic only — not housing or transport allowances. Check your contract; it's usually 50–60% of the package."
                : "Saudi awards use the full wage including housing allowance."}
            </p>
          </div>
          <div className="space-y-1">
            <Label htmlFor="eosb-years" className="text-xs">
              Years with current employer
            </Label>
            <Input
              id="eosb-years"
              type="number"
              min={0}
              max={45}
              step={0.5}
              value={yearsServed}
              onChange={(e) => setYearsServed(Math.max(0, Number(e.target.value) || 0))}
            />
            <p className="text-[11px] text-muted-foreground">
              Service with a previous employer was usually paid out when you left.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs">Age you expect to leave this job</Label>
            <span className="text-sm font-semibold tabular-nums text-orange-600 dark:text-orange-400">
              {leaveAge} · {departureYear}
            </span>
          </div>
          <Slider
            value={[leaveAge]}
            min={age + 1}
            max={Math.max(age + 2, 75)}
            step={1}
            onValueChange={([v]) => setLeaveAge(v)}
            aria-label="Age you expect to leave this job"
          />
        </div>

        {!isUAE && (
          <div className="grid grid-cols-2 gap-2">
            {(["termination", "resignation"] as SaudiExitReason[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setReason(r)}
                className={`rounded-md border px-3 py-2 text-xs font-medium transition ${
                  reason === r
                    ? "border-orange-500 bg-orange-500/10 text-orange-700 dark:text-orange-300"
                    : "border-border text-muted-foreground hover:bg-muted/40"
                }`}
              >
                {r === "termination" ? "Contract ends / employer terminates" : "I resign"}
              </button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg border border-border p-3">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
              {label} today
            </p>
            <p className="mt-1 text-lg font-bold tabular-nums">{fmt(estimate.today)}</p>
            <p className="text-[11px] text-muted-foreground">If you left now</p>
          </div>
          <div className="rounded-lg border-2 border-orange-500/50 bg-orange-500/5 p-3">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
              {label} at age {leaveAge}
            </p>
            <p className="mt-1 text-lg font-bold tabular-nums text-orange-600 dark:text-orange-400">
              {fmt(estimate.atDeparture)}
            </p>
            <p className="text-[11px] text-muted-foreground">
              {estimate.totalYears.toFixed(1)} yrs of service
              {isExpat &&
                ` · ≈ ${formatCurrency(convertCurrency(estimate.atDeparture, residentCountry, destinationCountry), destinationCountry, { compact: true })}`}
            </p>
          </div>
        </div>

        {estimate.capped && (
          <p className="text-[11px] text-amber-700 dark:text-amber-300">
            Capped at 2 years' basic salary — the UAE legal maximum.
          </p>
        )}

        {hasGratuityAsset && (
          <div className="flex items-start gap-2 rounded-md border border-amber-500/40 bg-amber-500/5 p-2.5 text-xs">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <p>
              You also listed gratuity under My assets. Keep only one — the windfall below
              already includes everything accrued so far, so counting both would double it.
            </p>
          </div>
        )}

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            {existingEosb
              ? `In your plan: ${existingEosb.name}, ${existingEosb.targetYear}.`
              : "Not in your plan yet."}
          </p>
          <Button
            onClick={addAsWindfall}
            disabled={estimate.atDeparture <= 0}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {added ? <CheckCircle2 className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {added ? "Added to your plan" : existingEosb ? "Update in my plan" : "Add to my plan"}
          </Button>
        </div>

        <p className="text-[11px] text-muted-foreground">
          Assumes {(basicGrowth * 100).toFixed(0)}% yearly salary growth.{" "}
          {isUAE
            ? mode === "difc"
              ? <>DEWS contributions: 5.83% of basic for the first 5 years, 8.33% after, invested at your plan's expected return.</>
              : <>UAE Labour Law 2021: 21 days' basic per year for the first 5 years, 30 days after. <Term>EOSB</Term> is paid in full even if you resign.</>
            : "Saudi Labour Law: half a month per year for 5 years, a full month after. Resigning reduces it (nothing under 2 years)."}{" "}
          Educational estimate — confirm with HR.
        </p>
      </CardContent>
    </Card>
  );
}
