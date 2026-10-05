import { BarChart3 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ReturnComparison } from "@/components/charts/ReturnComparison";
import type { CountryProfile } from "@/types";
import { useI18n } from "@/i18n";

interface Props {
  country: CountryProfile;
}

export function ReturnsCard({ country }: Props) {
  const { t, countryName } = useI18n();
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-primary" />
          {t("dash.returns.title")}
        </CardTitle>
        <CardDescription>
          {t("dash.returns.desc", {
            country: countryName(country.code, country.name),
            inflation: (country.inflationRate * 100).toFixed(1),
          })}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ReturnComparison country={country} />
      </CardContent>
    </Card>
  );
}
