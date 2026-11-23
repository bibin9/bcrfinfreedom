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
import { useLiveFunds } from "@/hooks/useLiveFunds";
import { useI18n } from "@/i18n";

interface Props {
  country: CountryCode;
  shariaMarket: boolean;
}

const CATEGORY_LABEL: Record<FundCategory, string> = {
  large_cap: "Large Cap · Big companies",
  mid_cap: "Mid Cap · Growing companies",
  small_cap: "Small Cap · Smaller listed companies",
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

const CATEGORY_ML: Record<FundCategory, string> = {
  large_cap: "വലിയ കമ്പനികൾ", mid_cap: "ഇടത്തരം കമ്പനികൾ", small_cap: "ചെറിയ കമ്പനികൾ",
  flexi_cap: "പല വലുപ്പത്തിലുള്ള കമ്പനികൾ", index: "ഒരു കൂട്ടം കമ്പനികളെ പിന്തുടരുന്ന ഫണ്ട്",
  international: "വിദേശ കമ്പനികൾ", debt: "കടപ്പത്രങ്ങൾ", hybrid: "ഓഹരിയും കടപ്പത്രവും",
  elss: "പഴയ നികുതി രീതിയിൽ ഇളവ് ലഭിക്കാവുന്ന ഫണ്ട്", etf: "ഓഹരിപോലെ വാങ്ങാവുന്ന ഫണ്ട്", sukuk: "ഇസ്ലാമിക കടപ്പത്രങ്ങൾ",
};

export function TopFundsCard({ country, shariaMarket }: Props) {
  const { lang } = useI18n();
  const ml = lang === "ml";
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterCategory>("all");
  const [sort, setSort] = useState<SortKey>("cost");
  const [shariaOnly, setShariaOnly] = useState(false);

  const curated = useMemo(() => getTopFunds(country), [country]);
  const { funds, loading, liveCount, asOf } = useLiveFunds(curated);

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
        <CardTitle>{ml ? "ഫണ്ടുകളെക്കുറിച്ച് പഠിക്കാം, താരതമ്യം ചെയ്യാം" : "Learn about and compare funds"}</CardTitle>
        <CardDescription>
          {ml ? "ഇത് വാങ്ങാനുള്ള ശുപാർശയല്ല. ഫണ്ടിന്റെ പേരോ തരമോ നൽകി തിരയാം. ചെലവും നഷ്ടസാധ്യതയും കൂടി നോക്കണം. " : "Examples for learning, not a buy list. Search by name or type and compare costs and risk. "}
          {liveCount > 0 && asOf
            ? (ml ? `${liveCount} ഫണ്ടുകളുടെ വളർച്ച സമീപകാല ദൈനംദിന വിലകളിൽ നിന്ന് കണക്കാക്കി (ഏറ്റവും പുതിയ തീയതി ${asOf}). മറ്റുള്ളവ ${FUND_CATALOGUE_UPDATED_AT}-ലെ ഏകദേശ വിവരങ്ങളാണ്.` : `Growth for ${liveCount} funds is worked out from recent daily prices (latest ${asOf}). The other numbers are rough, as of ${FUND_CATALOGUE_UPDATED_AT}.`)
            : loading
              ? (ml ? "പുതിയ വിലവിവരങ്ങൾ പരിശോധിക്കുന്നു…" : "Checking the latest prices…")
              : (ml ? `${FUND_CATALOGUE_UPDATED_AT}-ലെ ഏകദേശ വിവരങ്ങൾ. നിക്ഷേപിക്കും മുമ്പ് ഫണ്ട് സ്ഥാപനത്തിന്റെ പുതിയ വിവരങ്ങൾ പരിശോധിക്കുക.` : `Numbers approximate as of ${FUND_CATALOGUE_UPDATED_AT}. Verify the fund house's current factsheet before acting.`)}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            className="pl-9"
            placeholder={ml ? "ഫണ്ടിന്റെ പേര് നൽകൂ: HDFC, Vanguard…" : "Try: small cap, index, international, ETF, HDFC, Vanguard…"}
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
                <SelectItem value="all">{ml ? "എല്ലാ തരങ്ങളും" : "All categories"}</SelectItem>
                {availableCategories.map((c) => (
                  <SelectItem key={c} value={c}>
                    {ml ? CATEGORY_ML[c] : CATEGORY_LABEL[c]}
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
                <SelectItem value="growth">{ml ? "മുൻകാല വളർച്ച കൂടുതൽ" : "Highest past growth"}</SelectItem>
                <SelectItem value="cost">{ml ? "വാർഷിക ചെലവ് കുറവ്" : "Cheapest fee"}</SelectItem>
                <SelectItem value="risk">{ml ? "നഷ്ടസാധ്യത കുറവുള്ളവ ആദ്യം" : "Lowest risk first"}</SelectItem>
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
            {ml ? "ഈ പേരിൽ ഫണ്ട് കണ്ടില്ല. മറ്റൊരു പേര് നൽകി നോക്കൂ." : "No funds match your search. Try a different keyword or remove filters."}
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
            {ml ? "നിക്ഷേപിക്കും മുമ്പ് ശ്രദ്ധിക്കുക" : "Important before you invest"}
          </p>
          <ul className="ml-4 list-disc space-y-0.5 text-muted-foreground">
            <li>
              {ml ? "മുൻകാല ലാഭം ഇനിയും ലഭിക്കുമെന്ന് ഉറപ്പില്ല. പണം നഷ്ടപ്പെടാനും സാധ്യതയുണ്ട്." : "Past performance does not guarantee future returns. Losses are possible."}
            </li>
            <li>
              {ml ? "ഫണ്ട് സ്ഥാപനത്തിന്റെ വെബ്സൈറ്റിലെ പുതിയ വിവരങ്ങളും ചെലവും പരിശോധിക്കുക." : "Check the fund house's current factsheet, plan type and fees before investing."}
            </li>
            <li>
              {ml ? "കൂടിയ മുൻകാല ലാഭമോ കുറഞ്ഞ ചെലവോ മാത്രം നോക്കി തീരുമാനിക്കരുത്. നിങ്ങളുടെ ആവശ്യവും സമയവും കൂടി കണക്കിലെടുക്കണം." : "High past growth or a low fee alone does not establish suitability. Consider your time horizon, needs and risk."}
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

function FundRow({ fund }: { fund: MutualFund }) {
  const { lang } = useI18n();
  const ml = lang === "ml";
  const riskColor =
    fund.risk === "low"
      ? "bg-blue-500/15 text-blue-500"
      : fund.risk === "medium"
        ? "bg-amber-500/15 text-amber-500"
        : "bg-red-500/15 text-red-500";
  const riskLabel =
    fund.risk === "low" ? (ml ? "നഷ്ടസാധ്യത കുറവ്" : "Low risk") : fund.risk === "medium" ? (ml ? "ഇടത്തരം നഷ്ടസാധ്യത" : "Medium risk") : (ml ? "നഷ്ടസാധ്യത കൂടുതൽ" : "High risk");
  return (
    <li className="rounded-lg border border-border p-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="break-words text-sm font-semibold sm:text-base">{fund.name}</p>
          <p className="mt-0.5 text-xs text-muted-foreground sm:text-xs">
            {ml ? CATEGORY_ML[fund.category] : CATEGORY_LABEL[fund.category]}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className={`rounded px-2 py-0.5 text-xs font-medium uppercase tracking-wide ${riskColor}`}
          >
            {riskLabel}
          </span>
          {fund.live && (
            <span
              title={ml ? "3, 5 വർഷത്തെ വളർച്ച സമീപകാല ദൈനംദിന വിലകളിൽ നിന്ന് കണക്കാക്കിയത്. തത്സമയ വിലയല്ല." : "3-year and 5-year growth worked out from recent daily prices. Not a live price feed."}
              className="rounded bg-sky-500/15 px-2 py-0.5 text-xs font-medium uppercase tracking-wide text-sky-500"
            >
              {ml ? "പുതിയ വിലക്കണക്ക്" : "Recent prices"}
            </span>
          )}
          {fund.shariaCompliant && (
            <span className="rounded bg-emerald-500/15 px-2 py-0.5 text-xs font-medium uppercase tracking-wide text-emerald-500">
              Sharia
            </span>
          )}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-xs sm:gap-3">
        <Stat
          label={ml ? "5 വർഷത്തെ വാർഷിക വളർച്ച" : "5-year yearly growth"}
          hint="Average yearly return over the past 5 years"
          value={`${(fund.fiveYearCagr * 100).toFixed(1)}%`}
          accent="emerald"
        />
        <Stat
          label={ml ? "3 വർഷത്തെ വാർഷിക വളർച്ച" : "3-year yearly growth"}
          hint="Average yearly return over the past 3 years"
          value={`${(fund.threeYearCagr * 100).toFixed(1)}%`}
        />
        <Stat
          label={ml ? "വാർഷിക ചെലവ്" : "Yearly fee"}
          hint="What the fund charges per year — lower is better"
          value={`${(fund.expenseRatio * 100).toFixed(2)}%`}
        />
      </div>

      <p className="mt-2 text-sm">{ml ? "പലരുടെ പണം ഒന്നിച്ചുചേർത്ത് നിക്ഷേപിക്കുന്ന സംവിധാനമാണ് ഫണ്ട്. ഇതിലെ തുകയും ലാഭവും ഉറപ്പുള്ളതല്ല. വാങ്ങുന്നതിന് മുമ്പ് പുതിയ വിവരങ്ങൾ പരിശോധിക്കുക." : fund.note}</p>
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
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={`mt-0.5 text-base font-semibold tabular-nums ${accentClass}`}>{value}</p>
    </div>
  );
}
