import { useMemo, useState } from "react";
import { CalendarClock, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { NRITaxDrawer } from "@/components/dashboard/NRITaxDrawer";
import { projectRNORWindow } from "@/lib/nriTax";
import { useI18n } from "@/i18n";

interface Props {
  age: number;
  freedomAge: number;
  /** Where they live now — used only for wording. */
  residentCountryName: string;
}

/**
 * For people abroad who'll retire in India. The RNOR years after moving back
 * are the single biggest tax decision of their move — this puts it on the
 * main screens instead of behind the NRI checkbox.
 */
export function RNORWindowCard({ age, freedomAge, residentCountryName }: Props) {
  const { t } = useI18n();
  const r = (key: string, vars?: Record<string, string | number>) => t(`dash.rnor.${key}`, vars);
  const thisYear = new Date().getFullYear();
  const [returnYear, setReturnYear] = useState(thisYear + Math.max(1, freedomAge - age));
  const [yearsAbroad, setYearsAbroad] = useState(10);

  const rnor = useMemo(
    () =>
      projectRNORWindow({
        returnFY: returnYear,
        nonResidentFYsInLast10: Math.min(10, yearsAbroad),
        avgDaysPerYearAsNRI: 60,
      }),
    [returnYear, yearsAbroad],
  );

  const years = [0, 1, 2, 3].map((o) => returnYear + o);
  const lastTaxFreeYear = rnor.rnorFYs[rnor.rnorFYs.length - 1];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarClock className="h-5 w-5 text-orange-500" />
          {r("title")}
        </CardTitle>
        <CardDescription>{r("desc", { country: residentCountryName })}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs">{r("returnYear")}</Label>
              <span className="text-sm font-semibold tabular-nums text-orange-600 dark:text-orange-400">
                {returnYear}
              </span>
            </div>
            <Slider
              value={[returnYear]}
              min={thisYear}
              max={thisYear + 40}
              step={1}
              onValueChange={([v]) => setReturnYear(v)}
              aria-label={r("returnYearAria")}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs">{r("yearsAbroad")}</Label>
              <span className="text-sm font-semibold tabular-nums">{yearsAbroad}</span>
            </div>
            <Slider
              value={[yearsAbroad]}
              min={1}
              max={20}
              step={1}
              onValueChange={([v]) => setYearsAbroad(v)}
              aria-label={r("yearsAbroadAria")}
            />
          </div>
        </div>

        {/* Timeline */}
        <div className="grid grid-cols-4 gap-1.5">
          {years.map((y) => {
            const taxFree = rnor.rnorFYs.includes(y);
            return (
              <div
                key={y}
                className={`rounded-md border p-2 text-center ${
                  taxFree
                    ? "border-emerald-500/50 bg-emerald-500/10"
                    : "border-border bg-muted/30"
                }`}
              >
                <p className="text-[11px] text-muted-foreground">{r("fy", { y, y2: y + 1 })}</p>
                <p
                  className={`text-xs font-semibold ${
                    taxFree ? "text-emerald-700 dark:text-emerald-300" : "text-muted-foreground"
                  }`}
                >
                  {taxFree ? r("taxFree") : r("taxed")}
                </p>
              </div>
            );
          })}
        </div>

        {rnor.rnorFYs.length > 0 ? (
          <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/5 p-3 text-sm">
            <p className="font-semibold">
              {r("doBefore", { year: (lastTaxFreeYear ?? returnYear) + 1 })}
            </p>
            <ul className="mt-2 space-y-1.5 text-xs">
              {[
                r("do1"),
                r("do2"),
                r("do3", { country: residentCountryName }),
                r("do4"),
              ].map((item) => (
                <li key={item} className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="rounded-lg border border-amber-500/40 bg-amber-500/5 p-3 text-xs">
            {r("noWindow", { n: yearsAbroad })}
          </p>
        )}

        <div className="flex flex-col gap-2 border-t border-border pt-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[11px] text-muted-foreground">
            {r("footnote")}
          </p>
          <div className="shrink-0">
            <NRITaxDrawer />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
