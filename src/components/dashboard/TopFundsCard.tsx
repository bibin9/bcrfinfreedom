import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CountryCode, FundCategory, MutualFund } from "@/types";
import { getTopFunds, FUND_CATALOGUE_UPDATED_AT } from "@/data/fundCatalog";
import {
  fundTypeResources,
  generalChannels,
  generalResources,
} from "@/data/learningResources";
import { LearnResources } from "./LearnResources";

interface Props {
  country: CountryCode;
  shariaMarket: boolean;
}

const CATEGORY_LABEL: Record<FundCategory, string> = {
  large_cap: "Large Cap · Big companies",
  mid_cap: "Mid Cap · Growing companies",
  small_cap: "Small Cap · Early-stage",
  flexi_cap: "Flexi / Multi Cap",
  index: "Index · Whole market",
  international: "International",
  debt: "Debt / Bonds",
  hybrid: "Hybrid · Stocks + bonds",
  elss: "ELSS · Tax-saving",
  etf: "ETF",
  sukuk: "Sukuk · Islamic bonds",
};

type FilterCategory = "all" | FundCategory;
type SortKey = "growth" | "cost" | "risk";

const RISK_ORDER: Record<"low" | "medium" | "high", number> = {
  low: 1,
  medium: 2,
  high: 3,
};

export function TopFundsCard({ country, shariaMarket }: Props) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterCategory>("all");
  const [sort, setSort] = useState<SortKey>("growth");
  const [shariaOnly, setShariaOnly] = useState(false);

  const funds = useMemo(() => getTopFunds(country), [country]);

  const availableCategories = useMemo(() => {
    return Array.from(new Set<FundCategory>(funds.map((f) => f.category)));
  }, [funds]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = funds.filter((f) => {
      if (filter !== "all" && f.category !== filter) return false;
      if (shariaOnly && !f.shariaCompliant) return false;
      if (q) {
        const hay = `${f.name} ${CATEGORY_LABEL[f.category]} ${f.note}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    const sorted = [...base];
    if (sort === "growth") {
      sorted.sort((a, b) => b.fiveYearCagr - a.fiveYearCagr);
    } else if (sort === "cost") {
      sorted.sort((a, b) => a.expenseRatio - b.expenseRatio);
    } else {
      sorted.sort((a, b) => RISK_ORDER[a.risk] - RISK_ORDER[b.risk]);
    }
    return sorted;
  }, [funds, filter, sort, shariaOnly, query]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Search best funds in your country</CardTitle>
        <CardDescription>
          Hand-picked well-known funds across every category. Type to search, filter by type,
          sort by what matters to you. Numbers approximate as of {FUND_CATALOGUE_UPDATED_AT}.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            className="pl-9"
            placeholder="Try: small cap, index, international, ETF, HDFC, Vanguard…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search funds by name or category"
          />
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
          <div className="w-full sm:min-w-[190px] sm:flex-1">
            <Select value={filter} onValueChange={(v) => setFilter(v as FilterCategory)}>
              <SelectTrigger aria-label="Fund category">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {availableCategories.map((c) => (
                  <SelectItem key={c} value={c}>
                    {CATEGORY_LABEL[c]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-full sm:w-auto sm:min-w-[170px]">
            <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
              <SelectTrigger aria-label="Sort funds">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="growth">Highest past growth</SelectItem>
                <SelectItem value="cost">Cheapest fee</SelectItem>
                <SelectItem value="risk">Lowest risk first</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {shariaMarket && (
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={shariaOnly}
                onChange={(e) => setShariaOnly(e.target.checked)}
                className="h-4 w-4 rounded border-border"
              />
              Sharia-compliant only
            </label>
          )}
        </div>

        {filtered.length === 0 ? (
          <p className="rounded-md border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
            No funds match your search. Try a different keyword or remove filters.
          </p>
        ) : (
          <ul className="space-y-2">
            {filtered.map((f, i) => (
              <FundRow key={`${f.name}-${i}`} fund={f} />
            ))}
          </ul>
        )}

        {filter === "all" ? (
          <LearnResources
            heading="Study materials & YouTube primers"
            resources={{
              searches: fundTypeResources.index.searches,
              channels: generalChannels,
              readings: generalResources,
            }}
          />
        ) : (
          <LearnResources
            heading={`Study ${CATEGORY_LABEL[filter].toLowerCase()}`}
            resources={fundTypeResources[filter]}
          />
        )}

        <div className="space-y-1.5 rounded-md border border-amber-500/30 bg-amber-500/5 p-3 text-xs">
          <p className="font-medium text-amber-600 dark:text-amber-400">
            Important before you invest
          </p>
          <ul className="ml-4 list-disc space-y-0.5 text-muted-foreground">
            <li>
              Past performance does <strong>not</strong> guarantee future returns. A fund that
              grew 25%/yr may grow 5% next year.
            </li>
            <li>
              Always check the latest factsheet on the fund house's website before putting
              money in.
            </li>
            <li>
              Start with one fund and a small amount. Don't buy 5 funds at once — it's harder
              to manage and easier to over-diversify.
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

function FundRow({ fund }: { fund: MutualFund }) {
  const riskColor =
    fund.risk === "low"
      ? "bg-blue-500/15 text-blue-500"
      : fund.risk === "medium"
        ? "bg-amber-500/15 text-amber-500"
        : "bg-red-500/15 text-red-500";
  const riskLabel =
    fund.risk === "low" ? "Low risk" : fund.risk === "medium" ? "Medium risk" : "High risk";
  return (
    <li className="rounded-lg border border-border p-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="break-words text-sm font-semibold sm:text-base">{fund.name}</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground sm:text-xs">
            {CATEGORY_LABEL[fund.category]}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className={`rounded px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide ${riskColor}`}
          >
            {riskLabel}
          </span>
          {fund.shariaCompliant && (
            <span className="rounded bg-emerald-500/15 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-emerald-500">
              Sharia
            </span>
          )}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-xs sm:gap-3">
        <Stat
          label="5-year yearly growth"
          hint="Average yearly return over the past 5 years"
          value={`${(fund.fiveYearCagr * 100).toFixed(1)}%`}
          accent="emerald"
        />
        <Stat
          label="3-year yearly growth"
          hint="Average yearly return over the past 3 years"
          value={`${(fund.threeYearCagr * 100).toFixed(1)}%`}
        />
        <Stat
          label="Yearly fee"
          hint="What the fund charges per year — lower is better"
          value={`${(fund.expenseRatio * 100).toFixed(2)}%`}
        />
      </div>

      <p className="mt-2 text-sm">{fund.note}</p>
    </li>
  );
}

function Stat({
  label,
  hint,
  value,
  accent,
}: {
  label: string;
  hint: string;
  value: string;
  accent?: "emerald";
}) {
  const accentClass = accent === "emerald" ? "text-emerald-500" : "text-foreground";
  return (
    <div title={hint} className="rounded-md border border-border px-2 py-1.5">
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={`mt-0.5 text-base font-semibold tabular-nums ${accentClass}`}>{value}</p>
    </div>
  );
}
