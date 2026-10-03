import { useMemo, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  nriAccounts,
  nriOptions,
  nriPlatforms,
  nriStartSteps,
  nriUSACanadaNote,
} from "@/data/nriGuide";
import { nriResources } from "@/data/learningResources";
import { LearnResources } from "./LearnResources";

interface Props {
  residenceCountryCode: string;
  /** Optional slot — Dashboard passes the NRI tax calculator trigger button here. */
  taxCalculator?: React.ReactNode;
}

const CATEGORY_LABEL: Record<string, string> = {
  equity: "Stocks / Equity",
  debt: "Fixed income / Debt",
  gold: "Gold",
  real_estate: "Real Estate",
  retirement: "Retirement",
  gift_city: "GIFT City (IFSC)",
};

export function NRIOptionsCard({ residenceCountryCode, taxCalculator }: Props) {
  const [query, setQuery] = useState("");
  const isUSorCanada = residenceCountryCode === "US" || residenceCountryCode === "CA";

  const filteredOptions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return nriOptions;
    return nriOptions.filter((o) =>
      [o.title, o.whatItIs, o.bestFor, CATEGORY_LABEL[o.category] ?? ""].some((f) =>
        f.toLowerCase().includes(q),
      ),
    );
  }, [query]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>🇮🇳 Indian NRI investment options</CardTitle>
        <CardDescription>
          A full menu of India-side options for Non-Resident Indians — on top of whatever your
          residence country offers. Many NRIs have never seen this in one place.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {taxCalculator && (
          <div className="mb-4 flex flex-col items-start gap-2 rounded-lg border border-orange-500/30 bg-orange-500/5 p-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold">Residency, RNOR, NRE vs NRO — all in one tool</p>
              <p className="text-xs text-muted-foreground">
                If you're thinking about returning to India, run the numbers before you book flights.
              </p>
            </div>
            {taxCalculator}
          </div>
        )}
        {isUSorCanada && (
          <div className="mb-4 rounded-md border border-amber-500/30 bg-amber-500/5 p-3 text-xs">
            <p className="font-semibold text-amber-600 dark:text-amber-400">
              Important for US / Canada residents
            </p>
            <p className="mt-1 text-muted-foreground">{nriUSACanadaNote}</p>
          </div>
        )}

        <Tabs defaultValue="options">
          <TabsList className="flex flex-wrap h-auto">
            <TabsTrigger value="options">Investment options</TabsTrigger>
            <TabsTrigger value="accounts">NRE / NRO / FCNR</TabsTrigger>
            <TabsTrigger value="start">How to start</TabsTrigger>
          </TabsList>

          <TabsContent value="options" className="space-y-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                className="pl-9"
                placeholder="Search: mutual fund, FCNR, GIFT City, NPS, real estate…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search NRI options"
              />
            </div>

            {filteredOptions.length === 0 ? (
              <p className="rounded-md border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
                No options match "{query}".
              </p>
            ) : (
              <div className="space-y-2">
                {filteredOptions.map((o) => (
                  <OptionAccordion key={o.title} option={o} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="accounts" className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Before any NRI investment, you need the right type of bank account. Here's what
              each one does in plain language.
            </p>
            {nriAccounts.map((a) => (
              <div key={a.name} className="rounded-lg border border-border p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold">
                      {a.name}{" "}
                      <span className="ml-1 text-xs font-normal text-muted-foreground">
                        ({a.fullName})
                      </span>
                    </p>
                    <p className="mt-0.5 text-sm text-muted-foreground">{a.purpose}</p>
                  </div>
                  <span
                    className={`rounded px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${
                      a.repatriable
                        ? "bg-emerald-500/15 text-emerald-500"
                        : "bg-red-500/15 text-red-500"
                    }`}
                  >
                    {a.repatriable ? "Repatriable" : "Not repatriable"}
                  </span>
                </div>
                <div className="mt-2 grid gap-2 text-xs sm:grid-cols-2">
                  <KV label="Currency">{a.currency}</KV>
                  <KV label="Tax">{a.taxed}</KV>
                </div>
                <p className="mt-2 text-xs">
                  <span className="font-medium">Use it when:</span>{" "}
                  <span className="text-muted-foreground">{a.whenToUse}</span>
                </p>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="start" className="space-y-4">
            <p className="text-sm text-muted-foreground">
              A realistic 5-step path for any NRI to start investing in India. This is the same
              sequence most NRIs follow, regardless of residence country.
            </p>

            <div className="rounded-md border border-border p-3 text-xs">
              <p className="text-muted-foreground">NRI-friendly platforms</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {nriPlatforms.map((p) => (
                  <span
                    key={p}
                    className="rounded-md bg-secondary px-2 py-0.5 font-medium text-secondary-foreground"
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>

            <ol className="space-y-3">
              {nriStartSteps.map((s, i) => (
                <li key={i} className="flex gap-3 rounded-lg border border-border p-3">
                  <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium">{s.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{s.detail}</p>
                  </div>
                </li>
              ))}
            </ol>

            <LearnResources
              heading="NRI study materials & YouTube primers"
              resources={nriResources}
            />

            <div className="rounded-md border border-primary/30 bg-primary/5 p-3 text-xs">
              <p className="font-medium">Quick wins before you complicate things</p>
              <ul className="ml-4 mt-1 list-disc space-y-0.5 text-muted-foreground">
                <li>
                  Open NRE + NRO together — don't try to pick just one. You'll need NRO the
                  moment you receive any Indian rent, dividend, or inheritance.
                </li>
                <li>
                  FCNR(B) in USD at 5%+ is a low-effort, tax-free parking instrument for NRIs
                  planning to return — better than most money-market funds back home.
                </li>
                <li>
                  Use a CA who specialises in NRI tax — DTAA (Double Taxation Avoidance)
                  benefits are claim-only; they don't apply automatically.
                </li>
              </ul>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function OptionAccordion({
  option,
}: {
  option: {
    title: string;
    category: string;
    whatItIs: string;
    expectedGrowth: string;
    risk: string;
    bestFor: string;
    keyNote?: string;
  };
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-lg border border-border">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left"
        aria-expanded={open}
      >
        <div>
          <p className="font-medium">{option.title}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {CATEGORY_LABEL[option.category] ?? option.category}
          </p>
        </div>
        <ChevronDown
          className={`h-4 w-4 flex-none text-muted-foreground transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open && (
        <div className="space-y-3 border-t border-border px-3 py-3 text-sm">
          <KV label="What it is">{option.whatItIs}</KV>
          <KV label="What you could earn" accent="emerald">
            {option.expectedGrowth}
          </KV>
          <KV label="The risk" accent="red">
            {option.risk}
          </KV>
          <KV label="Best for">{option.bestFor}</KV>
          {option.keyNote && (
            <div className="rounded-md border border-amber-500/30 bg-amber-500/5 p-2 text-xs text-amber-600 dark:text-amber-400">
              <strong>Note: </strong>
              {option.keyNote}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function KV({
  label,
  children,
  accent,
}: {
  label: string;
  children: React.ReactNode;
  accent?: "emerald" | "red";
}) {
  const color =
    accent === "emerald"
      ? "text-emerald-500"
      : accent === "red"
        ? "text-red-500"
        : "text-foreground";
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={color}>{children}</p>
    </div>
  );
}
