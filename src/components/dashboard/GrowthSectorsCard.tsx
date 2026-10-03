import { Sparkles, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  GROWTH_SECTORS_UPDATED_AT,
  globalGrowthSectors,
  localGrowthSectors,
} from "@/data/growthSectors";
import type { CountryProfile } from "@/types";

interface Props {
  country: CountryProfile;
}

function SectorRow({ name, growth, rationale }: { name: string; growth: number; rationale: string }) {
  return (
    <li className="rounded-md border border-border p-3">
      <div className="flex items-center justify-between gap-3">
        <p className="font-medium">{name}</p>
        <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground tabular-nums">
          <TrendingUp className="h-3 w-3" />
          {growth}%
        </span>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{rationale}</p>
    </li>
  );
}

export function GrowthSectorsCard({ country }: Props) {
  const local = localGrowthSectors[country.code] ?? [];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Growing markets
            </CardTitle>
            <CardDescription>
              Three global themes and three specific to {country.name}.
            </CardDescription>
          </div>
          <span className="rounded-md border border-border px-2 py-0.5 text-[11px] text-muted-foreground">
            Updated {GROWTH_SECTORS_UPDATED_AT}
          </span>
        </div>
      </CardHeader>
      <CardContent className="grid gap-6 md:grid-cols-2">
        <section>
          <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Global
          </h3>
          <ul className="space-y-2">
            {globalGrowthSectors.map((s) => (
              <SectorRow key={s.name} name={s.name} growth={s.growthPercent} rationale={s.rationale} />
            ))}
          </ul>
        </section>
        <section>
          <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {country.name}
          </h3>
          <ul className="space-y-2">
            {local.length === 0 ? (
              <li className="rounded-md border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                No local theme data yet for this country.
              </li>
            ) : (
              local.map((s) => (
                <SectorRow key={s.name} name={s.name} growth={s.growthPercent} rationale={s.rationale} />
              ))
            )}
          </ul>
        </section>
      </CardContent>
    </Card>
  );
}
