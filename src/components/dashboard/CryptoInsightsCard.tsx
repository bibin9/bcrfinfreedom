import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  ExternalLink,
  Search as SearchIcon,
  ShieldAlert,
  Youtube,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { CountryCode } from "@/types";
import {
  cryptoChannels,
  cryptoCountryStance,
  cryptoPitfalls,
  cryptoPrinciples,
  cryptoReadings,
  cryptoYouTubeSearches,
  type CryptoStatus,
} from "@/data/cryptoInsights";

interface Props {
  country: CountryCode;
  countryName: string;
  suggestedCryptoPercent: number;
  suggestedMonthly: number;
  currencySymbol: string;
}

export function CryptoInsightsCard({
  country,
  countryName,
  suggestedCryptoPercent,
  suggestedMonthly,
  currencySymbol,
}: Props) {
  const stance = cryptoCountryStance[country];
  const cryptoAmount = Math.round((suggestedMonthly * suggestedCryptoPercent) / 100);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Crypto — what you need to know before touching it</CardTitle>
        <CardDescription>
          Honest, country-specific guidance. Crypto is a legitimate asset class for a small sleeve
          of your portfolio — but it is also the asset class with the most scams, the most
          leverage-induced ruin, and the most regulatory change.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <Tabs defaultValue="country">
          <TabsList className="flex flex-wrap h-auto">
            <TabsTrigger value="country">In {countryName}</TabsTrigger>
            <TabsTrigger value="principles">Rules to invest by</TabsTrigger>
            <TabsTrigger value="pitfalls">Pitfalls</TabsTrigger>
            <TabsTrigger value="learn">Learn</TabsTrigger>
          </TabsList>

          <TabsContent value="country" className="space-y-3">
            <div className="rounded-lg border border-border p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold">{countryName}</p>
                <StatusPill status={stance.status} />
              </div>
              <div className="mt-2 grid gap-2 text-sm sm:grid-cols-2">
                <KV label="Regulator">{stance.regulator}</KV>
                <KV label="Tax treatment">{stance.tax}</KV>
              </div>
              {stance.onRamps[0] !== "(not legal)" && (
                <div className="mt-2">
                  <p className="text-xs text-muted-foreground">Common licensed on-ramps</p>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {stance.onRamps.map((p) => (
                      <span
                        key={p}
                        className="rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <p className="mt-2 text-xs text-muted-foreground">{stance.note}</p>
            </div>

            {stance.status === "banned" || stance.status === "restricted" ? (
              <div className="rounded-md border border-red-500/30 bg-red-500/5 p-3 text-sm">
                <p className="flex items-center gap-1.5 text-red-500">
                  <ShieldAlert className="h-4 w-4" />
                  <span className="font-semibold">Not legal to trade in {countryName}</span>
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  We don't recommend any allocation. Attempting to access crypto via offshore
                  exchanges from {countryName} may violate local law and put your capital at risk
                  with no legal recourse.
                </p>
              </div>
            ) : (
              <div className="rounded-md border border-primary/30 bg-primary/5 p-3 text-sm">
                <p className="font-semibold">Your suggested crypto sleeve</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Based on your risk profile and country, we suggest{" "}
                  <span className="font-semibold text-foreground">
                    {suggestedCryptoPercent.toFixed(1)}%
                  </span>{" "}
                  of your monthly investment — roughly{" "}
                  <span className="font-semibold text-foreground">
                    {currencySymbol}
                    {cryptoAmount.toLocaleString()}/mo
                  </span>
                  . Stick to Bitcoin + Ethereum, DCA weekly, and do not exceed this cap even in
                  bull markets.
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="principles" className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Six rules that separate the investors who survive crypto cycles from the ones who
              lose everything.
            </p>
            {cryptoPrinciples.map((p) => (
              <div key={p.title} className="rounded-lg border border-border p-3">
                <p className="flex items-center gap-1.5 font-medium">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  {p.title}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{p.detail}</p>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="pitfalls" className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Where most retail investors lose money in crypto. If you avoid these five, you avoid
              90% of the ruin.
            </p>
            {cryptoPitfalls.map((p) => (
              <div
                key={p.title}
                className="rounded-lg border border-red-500/30 bg-red-500/5 p-3"
              >
                <p className="flex items-center gap-1.5 font-medium text-red-500">
                  <AlertTriangle className="h-4 w-4" />
                  {p.title}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{p.detail}</p>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="learn" className="space-y-4">
            <div>
              <p className="mb-2 flex items-center gap-1.5 text-sm font-medium">
                <Youtube className="h-4 w-4" />
                Most viewed on YouTube
              </p>
              <ul className="flex flex-wrap gap-1.5">
                {cryptoYouTubeSearches.map((s) => (
                  <li key={s.url}>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-xs hover:border-primary hover:text-primary"
                    >
                      <SearchIcon className="h-3 w-3" />
                      {s.title}
                      <ExternalLink className="h-3 w-3 opacity-60" />
                    </a>
                  </li>
                ))}
              </ul>
              <p className="mt-1 text-[10px] italic text-muted-foreground">
                Opens YouTube ranked by view count.
              </p>
            </div>

            <div>
              <p className="mb-2 flex items-center gap-1.5 text-sm font-medium">
                <Youtube className="h-4 w-4" />
                Trusted channels
              </p>
              <ul className="space-y-1">
                {cryptoChannels.map((c) => (
                  <li key={c.url} className="text-xs">
                    <a
                      href={c.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-medium hover:text-primary"
                    >
                      {c.title}
                      <ExternalLink className="h-3 w-3 opacity-60" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="mb-2 flex items-center gap-1.5 text-sm font-medium">
                <BookOpen className="h-4 w-4" />
                Study materials
              </p>
              <ul className="space-y-1">
                {cryptoReadings.map((r) => (
                  <li key={r.url} className="text-xs">
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 hover:text-primary"
                    >
                      <span
                        className={`rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide ${typeBadge(
                          r.type,
                        )}`}
                      >
                        {typeLabel(r.type)}
                      </span>
                      <span className="font-medium">{r.title}</span>
                      <ExternalLink className="h-3 w-3 opacity-60" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </TabsContent>
        </Tabs>

        <div className="rounded-md border border-amber-500/30 bg-amber-500/5 p-3 text-xs">
          <p className="font-medium text-amber-600 dark:text-amber-400">
            This is not financial advice
          </p>
          <p className="mt-1 text-muted-foreground">
            Crypto is volatile, speculative, and heavily regulated. Country-specific rules change
            frequently — always verify with your regulator before investing or moving funds.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function StatusPill({ status }: { status: CryptoStatus }) {
  const map: Record<CryptoStatus, { label: string; cls: string }> = {
    legal: { label: "Legal", cls: "bg-emerald-500/15 text-emerald-500" },
    regulated: { label: "Regulated", cls: "bg-blue-500/15 text-blue-500" },
    restricted: { label: "Restricted", cls: "bg-amber-500/15 text-amber-500" },
    unclear: { label: "Unclear", cls: "bg-purple-500/15 text-purple-500" },
    banned: { label: "Banned", cls: "bg-red-500/15 text-red-500" },
  };
  const x = map[status];
  return (
    <span
      className={`rounded px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${x.cls}`}
    >
      {x.label}
    </span>
  );
}

function KV({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-sm">{children}</p>
    </div>
  );
}

function typeBadge(t: "search" | "wiki" | "article" | "book" | "channel" | "regulator"): string {
  switch (t) {
    case "wiki":
      return "bg-blue-500/15 text-blue-500";
    case "article":
      return "bg-emerald-500/15 text-emerald-500";
    case "book":
      return "bg-purple-500/15 text-purple-500";
    case "regulator":
      return "bg-amber-500/15 text-amber-500";
    default:
      return "bg-secondary text-secondary-foreground";
  }
}

function typeLabel(t: "search" | "wiki" | "article" | "book" | "channel" | "regulator"): string {
  switch (t) {
    case "wiki":
      return "Wiki";
    case "article":
      return "Article";
    case "book":
      return "Book";
    case "regulator":
      return "Official";
    default:
      return t;
  }
}
