import { BarChart3 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ReturnComparison } from "@/components/charts/ReturnComparison";
import type { CountryProfile } from "@/types";

interface Props {
  country: CountryProfile;
}

export function ReturnsCard({ country }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-primary" />
          Expected returns by asset class
        </CardTitle>
        <CardDescription>
          Long-run nominal expectations for {country.name}. Inflation in this market averages{" "}
          {(country.inflationRate * 100).toFixed(1)}% — deduct that to think in real terms.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ReturnComparison country={country} />
      </CardContent>
    </Card>
  );
}
