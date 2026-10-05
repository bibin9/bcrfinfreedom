import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DEFAULT_CITY_ID, citiesFor } from "@/data/cities";
import type { CountryCode } from "@/types";
import { useI18n } from "@/i18n";

interface Props {
  country: CountryCode;
  value: string | undefined;
  onChange: (cityId: string | undefined) => void;
  className?: string;
}

/** City picker for the retirement country. Renders nothing for countries without city data. */
export function CitySelect({ country, value, onChange, className }: Props) {
  const { t, cityName } = useI18n();
  const cities = citiesFor(country);
  if (cities.length === 0) return null;
  return (
    <Select
      value={value ?? DEFAULT_CITY_ID}
      onValueChange={(v) => onChange(v === DEFAULT_CITY_ID ? undefined : v)}
    >
      <SelectTrigger className={className} aria-label={t("dash.city.aria")}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {cities.map((c) => (
          <SelectItem key={c.id} value={c.id}>
            {cityName(country, c.id, c.name)}
            {c.multiplier !== 1 && (
              <span className="ms-1.5 text-xs text-muted-foreground">
                · {c.multiplier > 1 ? t("dash.city.costlier") : t("dash.city.cheaper")}
              </span>
            )}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
