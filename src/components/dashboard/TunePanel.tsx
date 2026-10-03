import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Term } from "@/components/ui/term";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { countryList } from "@/data/countryProfiles";
import { citiesFor, findCity } from "@/data/cities";
import { CitySelect } from "@/components/dashboard/CitySelect";
import type { CountryCode, CountryProfile, HouseholdSize } from "@/types";
import { formatCurrency } from "@/lib/formatters";

interface Props {
  country: CountryProfile;
  /** Country whose currency / inflation / benchmark drive the FIRE number. */
  destinationCountry: CountryProfile;
  savingsRate: number;
  currentCorpus: number;
  freedomAge: number;
  currentAge: number;
  householdSize: HouseholdSize;
  annualExpensesOverride: number | undefined;
  onSavingsRate: (rate: number) => void;
  onCurrentCorpus: (corpus: number) => void;
  onFreedomAge: (age: number) => void;
  onHouseholdSize: (size: HouseholdSize) => void;
  onAnnualExpensesOverride: (expenses: number | undefined) => void;
  onRetirementCountry: (code: CountryCode | undefined) => void;
  retirementCity: string | undefined;
  onRetirementCity: (cityId: string | undefined) => void;
}

export function TunePanel({
  country,
  destinationCountry,
  savingsRate,
  currentCorpus,
  freedomAge,
  currentAge,
  householdSize,
  annualExpensesOverride,
  onSavingsRate,
  onCurrentCorpus,
  onFreedomAge,
  onHouseholdSize,
  onAnnualExpensesOverride,
  onRetirementCountry,
  retirementCity,
  onRetirementCity,
}: Props) {
  const minFreedom = Math.max(currentAge + 1, 35);
  const maxFreedom = 75;
  // Benchmark + override are always denominated in the RETIREMENT country's
  // currency, so reference that profile.
  const city = findCity(destinationCountry.code, retirementCity);
  const benchmark =
    (householdSize === "family"
      ? destinationCountry.averageAnnualExpensesFamily
      : destinationCountry.averageAnnualExpensesSingle) * (city?.multiplier ?? 1);
  const isExpat = destinationCountry.code !== country.code;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fine-tune</CardTitle>
        <CardDescription>
          Change these and the charts recompute instantly.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Monthly savings rate</Label>
            <span className="text-sm font-semibold text-primary tabular-nums">
              {(savingsRate * 100).toFixed(0)}%
            </span>
          </div>
          <Slider
            value={[Math.round(savingsRate * 100)]}
            min={5}
            max={70}
            step={1}
            onValueChange={([v]) => onSavingsRate(v / 100)}
            aria-label="Monthly savings rate"
          />
          <p className="text-xs text-muted-foreground">
            Most retail savers under-estimate this. Boost it by 1–2% every raise to compound faster.
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Target freedom age</Label>
            <span className="text-sm font-semibold text-primary tabular-nums">
              {freedomAge}
            </span>
          </div>
          <Slider
            value={[Math.min(maxFreedom, Math.max(minFreedom, freedomAge))]}
            min={minFreedom}
            max={maxFreedom}
            step={1}
            onValueChange={([v]) => onFreedomAge(v)}
            aria-label="Target freedom age"
          />
          <p className="text-xs text-muted-foreground">
            Pick when you want the option to stop working. Target <Term>Corpus</Term> and required{" "}
            <Term>SIP</Term> both recompute against this age, adjusted for {destinationCountry.name}'s{" "}
            <Term>Inflation</Term> of {(destinationCountry.inflationRate * 100).toFixed(1)}%.
          </p>
        </div>

        {/* Retirement destination — visible for everyone, opt-in for expats */}
        <div className="space-y-2 rounded-md border border-orange-500/20 bg-orange-500/[0.03] p-2.5">
          <Label className="text-xs">Retirement destination</Label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onRetirementCountry(undefined)}
              className={`rounded-md border px-2.5 py-1.5 text-xs font-medium transition ${
                !isExpat
                  ? "border-orange-500 bg-orange-500/10 text-orange-700 dark:text-orange-300"
                  : "border-border text-muted-foreground hover:bg-muted/40"
              }`}
            >
              Same as home
            </button>
            <button
              type="button"
              onClick={() => {
                // Default to India if not already expat-mode.
                if (!isExpat) onRetirementCountry("IN");
              }}
              className={`rounded-md border px-2.5 py-1.5 text-xs font-medium transition ${
                isExpat
                  ? "border-orange-500 bg-orange-500/10 text-orange-700 dark:text-orange-300"
                  : "border-border text-muted-foreground hover:bg-muted/40"
              }`}
            >
              Different country
            </button>
          </div>
          {isExpat && (
            <>
              <Select
                value={destinationCountry.code}
                onValueChange={(v) => onRetirementCountry(v as CountryCode)}
              >
                <SelectTrigger
                  aria-label="Retirement country"
                  className="bg-background text-xs"
                >
                  <SelectValue />
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
                FIRE number, expenses, and inflation use{" "}
                <strong>{destinationCountry.name}</strong> data. Your salary and
                investments stay anchored in <strong>{country.name}</strong>.
              </p>
            </>
          )}
        </div>

        <div className="space-y-2">
          <Label>Household</Label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onHouseholdSize("single")}
              className={`rounded-md border px-3 py-2 text-xs font-medium transition ${
                householdSize === "single"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:bg-muted/40"
              }`}
            >
              Single
            </button>
            <button
              type="button"
              onClick={() => onHouseholdSize("family")}
              className={`rounded-md border px-3 py-2 text-xs font-medium transition ${
                householdSize === "family"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:bg-muted/40"
              }`}
            >
              Family of 4
            </button>
          </div>
          {citiesFor(destinationCountry.code).length > 0 && (
            <div className="space-y-1 pt-1">
              <Label className="text-xs">Where you'll live after you stop working</Label>
              <CitySelect
                country={destinationCountry.code}
                value={retirementCity}
                onChange={onRetirementCity}
                className="bg-background text-xs"
              />
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            Typical yearly spend in {city?.name ?? destinationCountry.name}:{" "}
            <span className="font-semibold text-foreground">
              {formatCurrency(benchmark, destinationCountry, { compact: true })}/yr
            </span>
            . Used unless you enter your own expenses below.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="expenses">
            Your annual expenses — optional ({destinationCountry.currency})
          </Label>
          <Input
            id="expenses"
            type="number"
            min={0}
            value={annualExpensesOverride || ""}
            placeholder={`Benchmark ${Math.round(benchmark).toLocaleString()}`}
            onChange={(e) => {
              const v = Number(e.target.value);
              onAnnualExpensesOverride(v > 0 ? v : undefined);
            }}
          />
          <p className="text-xs text-muted-foreground">
            Override if you know your actual household spend. Blank = use the{" "}
            {householdSize === "family" ? "family-of-4" : "single"} benchmark.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="corpus">
            Current invested <Term>Corpus</Term> ({country.currency})
          </Label>
          <Input
            id="corpus"
            type="number"
            min={0}
            value={currentCorpus || ""}
            placeholder="0"
            onChange={(e) => onCurrentCorpus(Number(e.target.value) || 0)}
          />
          {currentCorpus > 0 && (
            <p className="text-xs text-muted-foreground">
              Displayed as {formatCurrency(currentCorpus, country)}.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
