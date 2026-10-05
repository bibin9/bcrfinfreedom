import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AllocationDonut, ASSET_COLORS } from "@/components/charts/AllocationDonut";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { AllocationResult, CountryProfile } from "@/types";
import { formatCurrency, formatPercent } from "@/lib/formatters";
import { useI18n } from "@/i18n";

interface Props {
  allocation: AllocationResult;
  country: CountryProfile;
  monthlyInvestment: number;
  currentCorpus: number;
}

export function AllocationCard({
  allocation,
  country,
  monthlyInvestment,
  currentCorpus,
}: Props) {
  const { t, tm } = useI18n();
  const d = (key: string, vars?: Record<string, string | number>) => t(`dash.alloc.${key}`, vars);
  const lbl = (b: AllocationResult["breakdown"][number]) => (b.labelMsg ? tm(b.labelMsg) : b.label);
  const why = (b: AllocationResult["breakdown"][number]) =>
    b.rationaleMsg ? tm(b.rationaleMsg) : b.rationale;
  const explanation =
    allocation.explanationMsgs && allocation.explanationMsgs.length === allocation.explanation.length
      ? allocation.explanationMsgs.map(tm)
      : allocation.explanation;
  const amountFor = (percent: number) => (monthlyInvestment * percent) / 100;
  const corpusAmountFor = (percent: number) => (currentCorpus * percent) / 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{d("title")}</CardTitle>
        <CardDescription>
          {d("desc", {
            equity: Math.round(allocation.equityWeight),
            ret: formatPercent(allocation.expectedReturn),
          })}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 grid gap-2 rounded-lg border border-border p-3 text-xs sm:grid-cols-2">
          <div>
            <p className="text-muted-foreground">{d("monthlyInvestment")}</p>
            <p className="text-base font-semibold tabular-nums">
              {formatCurrency(monthlyInvestment, country)}
              <span className="ms-1 text-xs font-normal text-muted-foreground">{d("perMonth")}</span>
            </p>
          </div>
          {currentCorpus > 0 && (
            <div>
              <p className="text-muted-foreground">{d("currentCorpus")}</p>
              <p className="text-base font-semibold tabular-nums">
                {formatCurrency(currentCorpus, country)}
              </p>
            </div>
          )}
        </div>

        <Tabs defaultValue="breakdown">
          <TabsList>
            <TabsTrigger value="breakdown">{d("tabBreakdown")}</TabsTrigger>
            <TabsTrigger value="chart">{d("tabChart")}</TabsTrigger>
            <TabsTrigger value="math">{d("tabWhy")}</TabsTrigger>
          </TabsList>

          <TabsContent value="chart" className="grid gap-6 md:grid-cols-[1fr_1fr]">
            <AllocationDonut breakdown={allocation.breakdown} />
            <ul className="space-y-2 self-center text-sm">
              {allocation.breakdown
                .filter((b) => b.percent > 0)
                .map((b) => (
                  <li key={b.asset} className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-2">
                      <span
                        aria-hidden
                        className="h-2.5 w-2.5 flex-none rounded-full"
                        style={{ background: ASSET_COLORS[b.asset] }}
                      />
                      <span>{lbl(b)}</span>
                    </span>
                    <span className="text-end">
                      <span className="font-medium tabular-nums">{b.percent.toFixed(1)}%</span>
                      <span className="ms-2 text-xs text-muted-foreground tabular-nums">
                        {formatCurrency(amountFor(b.percent), country)}
                        {t("dash.common.perMonth")}
                      </span>
                    </span>
                  </li>
                ))}
            </ul>
          </TabsContent>

          <TabsContent value="breakdown">
            {/* Mobile: stacked cards (each asset is a single tappable block). */}
            <div className="space-y-2 sm:hidden">
              {allocation.breakdown
                .filter((b) => b.percent > 0)
                .map((b) => (
                  <div key={b.asset} className="rounded-lg border border-border p-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className="flex min-w-0 items-center gap-2">
                        <span
                          aria-hidden
                          className="h-2.5 w-2.5 flex-none rounded-full"
                          style={{ background: ASSET_COLORS[b.asset] }}
                        />
                        <span className="truncate font-medium">{lbl(b)}</span>
                      </span>
                      <span className="flex-none text-sm font-semibold tabular-nums">
                        {b.percent.toFixed(1)}%
                      </span>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                          {d("monthly")}
                        </p>
                        <p className="font-semibold tabular-nums">
                          {formatCurrency(amountFor(b.percent), country)}
                        </p>
                      </div>
                      {currentCorpus > 0 && (
                        <div>
                          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                            {d("ofCorpus")}
                          </p>
                          <p className="font-semibold tabular-nums">
                            {formatCurrency(corpusAmountFor(b.percent), country)}
                          </p>
                        </div>
                      )}
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">{why(b)}</p>
                  </div>
                ))}
            </div>
            {/* ≥sm: compact table */}
            <div className="hidden overflow-x-auto rounded-lg border border-border sm:block">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th scope="col" className="px-3 py-2 text-start font-medium">
                      {d("colAsset")}
                    </th>
                    <th scope="col" className="px-3 py-2 text-end font-medium">
                      %
                    </th>
                    <th scope="col" className="px-3 py-2 text-end font-medium">
                      {d("monthly")}
                    </th>
                    {currentCorpus > 0 && (
                      <th scope="col" className="px-3 py-2 text-end font-medium">
                        {d("ofCorpus")}
                      </th>
                    )}
                    <th scope="col" className="hidden px-3 py-2 text-start font-medium md:table-cell">
                      {d("colWhy")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {allocation.breakdown
                    .filter((b) => b.percent > 0)
                    .map((b) => (
                      <tr key={b.asset} className="border-t border-border align-top">
                        <td className="px-3 py-2">
                          <span className="flex items-center gap-2">
                            <span
                              aria-hidden
                              className="h-2.5 w-2.5 flex-none rounded-full"
                              style={{ background: ASSET_COLORS[b.asset] }}
                            />
                            <span className="font-medium">{lbl(b)}</span>
                          </span>
                          <p className="mt-0.5 text-xs text-muted-foreground md:hidden">
                            {why(b)}
                          </p>
                        </td>
                        <td className="px-3 py-2 text-end font-semibold tabular-nums">
                          {b.percent.toFixed(1)}%
                        </td>
                        <td className="px-3 py-2 text-end font-semibold tabular-nums">
                          {formatCurrency(amountFor(b.percent), country)}
                        </td>
                        {currentCorpus > 0 && (
                          <td className="px-3 py-2 text-end tabular-nums">
                            {formatCurrency(corpusAmountFor(b.percent), country)}
                          </td>
                        )}
                        <td className="hidden px-3 py-2 text-xs text-muted-foreground md:table-cell">
                          {why(b)}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="math" className="space-y-2">
            <p className="text-xs text-muted-foreground">{d("howWeArrived")}</p>
            <ol className="ms-4 list-decimal space-y-1.5 text-sm">
              {explanation.map((line, i) => (
                <li key={i} className="text-muted-foreground">
                  <span className="text-foreground">{line}</span>
                </li>
              ))}
            </ol>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
