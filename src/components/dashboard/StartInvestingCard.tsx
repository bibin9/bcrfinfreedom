import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import type { CountryCode, FundCategory } from "@/types";
import { fundTypeGuides, startGuides } from "@/data/startGuide";
import { fundTypeResources } from "@/data/learningResources";
import { LearnResources } from "./LearnResources";

interface Props {
  country: CountryCode;
}

export function StartInvestingCard({ country }: Props) {
  const guide = startGuides[country];
  const [query, setQuery] = useState("");

  const visibleTypes = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return fundTypeGuides;
    return fundTypeGuides.filter((g) =>
      [g.label, g.whatItIs, g.whoItIsFor, g.category].some((f) =>
        f.toLowerCase().includes(q),
      ),
    );
  }, [query]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Start investing — a beginner's guide</CardTitle>
        <CardDescription>
          No jargon. A straight-to-the-point walkthrough plus plain-English explanations of
          every fund type.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="steps">
          <TabsList>
            <TabsTrigger value="steps">How to start (5 steps)</TabsTrigger>
            <TabsTrigger value="types">What each fund type means</TabsTrigger>
          </TabsList>

          <TabsContent value="steps" className="space-y-4">
            <p className="text-sm text-muted-foreground">{guide.intro}</p>

            <div className="rounded-md border border-border p-3 text-xs">
              <p className="text-muted-foreground">Platforms most people use in your country</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {guide.platforms.map((p) => (
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
              {guide.steps.map((s, i) => (
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

            <p className="rounded-md border border-primary/30 bg-primary/5 p-3 text-sm">
              💡 <strong>Good to know:</strong> {guide.note}
            </p>
          </TabsContent>

          <TabsContent value="types" className="space-y-3">
            <Input
              type="search"
              placeholder="Search: small cap, index, ETF, international, bond…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search fund types"
            />

            {visibleTypes.length === 0 ? (
              <p className="rounded-md border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
                No fund types match "{query}".
              </p>
            ) : (
              <div className="space-y-2">
                {visibleTypes.map((g) => (
                  <FundTypeAccordion key={g.category} guide={g} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function FundTypeAccordion({
  guide,
}: {
  guide: {
    category: FundCategory;
    label: string;
    whatItIs: string;
    howItWorks: string;
    expectedGrowth: string;
    risk: string;
    whoItIsFor: string;
    minimum: string;
    lockIn: string;
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
          <p className="font-medium">{guide.label}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{guide.whatItIs}</p>
        </div>
        <ChevronDown
          className={`h-4 w-4 flex-none text-muted-foreground transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open && (
        <div className="space-y-3 border-t border-border px-3 py-3 text-sm">
          <Row label="How it works" value={guide.howItWorks} />
          <Row label="What you could earn" value={guide.expectedGrowth} accent="emerald" />
          <Row label="The risk" value={guide.risk} accent="red" />
          <Row label="Best for" value={guide.whoItIsFor} />
          <div className="grid gap-3 sm:grid-cols-2">
            <Row label="Minimum" value={guide.minimum} compact />
            <Row label="Lock-in" value={guide.lockIn} compact />
          </div>
          {fundTypeResources[guide.category] && (
            <LearnResources
              resources={fundTypeResources[guide.category]}
              heading={`Learn more about ${guide.label.toLowerCase()}`}
            />
          )}
        </div>
      )}
    </div>
  );
}

function Row({
  label,
  value,
  accent,
  compact,
}: {
  label: string;
  value: string;
  accent?: "emerald" | "red";
  compact?: boolean;
}) {
  const accentClass =
    accent === "emerald"
      ? "text-emerald-500"
      : accent === "red"
        ? "text-red-500"
        : "text-foreground";
  return (
    <div className={compact ? "" : "space-y-0.5"}>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={`${accentClass}`}>{value}</p>
    </div>
  );
}
