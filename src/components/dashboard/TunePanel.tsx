import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
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
import { useI18n } from "@/i18n";

interface Props {
  country: CountryProfile;
  /** Country whose currency / inflation / benchmark drive the FIRE number. */
  destinationCountry: CountryProfile;
  savingsRate: number;
  /** Monthly take-home, resident currency — to show savings as an amount. */
  monthlyIncome: number;
  /** Money sent home each month, resident currency. */
  monthlyRemittance: number;
  onMonthlyRemittance: (amount: number) => void;
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
  monthlyIncome,
  monthlyRemittance,
  onMonthlyRemittance,
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
  const { t, countryName, cityName } = useI18n();
  const d = (key: string, vars?: Record<string, string | number>) => t(`dash.tune.${key}`, vars);
  const destName = countryName(destinationCountry.code, destinationCountry.name);
  const homeName = countryName(country.code, country.name);
  const place = city ? cityName(destinationCountry.code, city.id, city.name) : destName;

  const toggleClass = (on: boolean, tone: "orange" | "primary") =>
    `rounded-md border px-2.5 py-1.5 text-xs font-medium transition ${
      on
        ? tone === "orange"
          ? "border-orange-500 bg-orange-500/10 text-orange-700 dark:text-orange-300"
          : "border-primary bg-primary/10 text-primary"
        : "border-border text-muted-foreground hover:bg-muted/40"
    }`;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{d("title")}</CardTitle>
        <CardDescription>{d("desc")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>{d("savePart")}</Label>
            <span className="text-sm font-semibold text-primary tabular-nums">
              {(savingsRate * 100).toFixed(0)}%
            </span>
          </div>
          <Slider
            value={[Math.round(savingsRate * 100)]}
            min={1}
            max={70}
            step={1}
            onValueChange={([v]) => onSavingsRate(v / 100)}
            aria-label={d("savePart")}
          />
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">
              {d("saveAmount", { amount: formatCurrency(monthlyIncome * savingsRate, country) })}
            </span>{" "}
            {d("saveHint")}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="remittance">{d("remitLabel", { currency: country.currency })}</Label>
          <Input
            id="remittance"
            type="number"
            inputMode="numeric"
            min={0}
            value={monthlyRemittance || ""}
            placeholder="0"
            onChange={(e) => onMonthlyRemittance(Number(e.target.value) || 0)}
          />
          <p className="text-xs text-muted-foreground">{d("remitHint")}</p>
          {monthlyIncome > 0 && monthlyRemittance + monthlyIncome * savingsRate > monthlyIncome && (
            <p role="alert" className="text-xs font-medium text-red-600 dark:text-red-400">
              {d("remitTooHigh")}
            </p>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>{d("freedomAge")}</Label>
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
            aria-label={d("freedomAge")}
          />
          <p className="text-xs text-muted-foreground">
            {d("freedomAgeHint", {
              country: destName,
              inflation: (destinationCountry.inflationRate * 100).toFixed(1),
            })}
          </p>
        </div>

        {/* Retirement destination — visible for everyone, opt-in for expats */}
        <div className="space-y-2 rounded-md border border-orange-500/20 bg-orange-500/[0.03] p-2.5">
          <Label className="text-xs">{d("destination")}</Label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onRetirementCountry(undefined)}
              className={toggleClass(!isExpat, "orange")}
            >
              {d("sameAsHome")}
            </button>
            <button
              type="button"
              onClick={() => {
                // Default to India if not already expat-mode.
                if (!isExpat) onRetirementCountry("IN");
              }}
              className={toggleClass(isExpat, "orange")}
            >
              {d("differentCountry")}
            </button>
          </div>
          {isExpat && (
            <>
              <Select
                value={destinationCountry.code}
                onValueChange={(v) => onRetirementCountry(v as CountryCode)}
              >
                <SelectTrigger aria-label={d("destination")} className="bg-background text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {countryList.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      {c.flag} {countryName(c.code, c.name)} ({c.currency})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[11px] text-muted-foreground">
                {d("destNote", { dest: destName, home: homeName })}
              </p>
            </>
          )}
        </div>

        <div className="space-y-2">
          <Label>{d("household")}</Label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onHouseholdSize("single")}
              className={toggleClass(householdSize === "single", "primary")}
            >
              {d("single")}
            </button>
            <button
              type="button"
              onClick={() => onHouseholdSize("family")}
              className={toggleClass(householdSize === "family", "primary")}
            >
              {d("family")}
            </button>
          </div>
          {citiesFor(destinationCountry.code).length > 0 && (
            <div className="space-y-1 pt-1">
              <Label className="text-xs">{d("cityLabel")}</Label>
              <CitySelect
                country={destinationCountry.code}
                value={retirementCity}
                onChange={onRetirementCity}
                className="bg-background text-xs"
              />
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            {d("typicalSpend", {
              place,
              amount: formatCurrency(benchmark, destinationCountry, { compact: true }),
            })}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="expenses">
            {d("expensesLabel", { currency: destinationCountry.currency })}
          </Label>
          <Input
            id="expenses"
            type="number"
            inputMode="numeric"
            min={0}
            value={annualExpensesOverride || ""}
            placeholder={d("expensesPlaceholder", {
              amount: Math.round(benchmark).toLocaleString(),
            })}
            onChange={(e) => {
              const v = Number(e.target.value);
              onAnnualExpensesOverride(v > 0 ? v : undefined);
            }}
          />
          <p className="text-xs text-muted-foreground">
            {d(householdSize === "family" ? "expensesHintFamily" : "expensesHintSingle")}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="corpus">{d("corpusLabel", { currency: country.currency })}</Label>
          <Input
            id="corpus"
            type="number"
            inputMode="numeric"
            min={0}
            value={currentCorpus || ""}
            placeholder="0"
            onChange={(e) => onCurrentCorpus(Number(e.target.value) || 0)}
          />
          {currentCorpus > 0 && (
            <p className="text-xs text-muted-foreground">
              {d("corpusShown", { amount: formatCurrency(currentCorpus, country) })}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
