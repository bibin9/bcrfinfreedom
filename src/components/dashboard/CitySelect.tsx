import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DEFAULT_CITY_ID, citiesFor } from "@/data/cities";
import type { CountryCode } from "@/types";

interface Props {
  country: CountryCode;
  value: string | undefined;
  onChange: (cityId: string | undefined) => void;
  className?: string;
}

/** City picker for the retirement country. Renders nothing for countries without city data. */
export function CitySelect({ country, value, onChange, className }: Props) {
  const cities = citiesFor(country);
  if (cities.length === 0) return null;
  return (
    <Select
      value={value ?? DEFAULT_CITY_ID}
      onValueChange={(v) => onChange(v === DEFAULT_CITY_ID ? undefined : v)}
    >
      <SelectTrigger className={className} aria-label="City you'll live in after you stop working">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {cities.map((c) => (
          <SelectItem key={c.id} value={c.id}>
            {c.name}
            {c.multiplier !== 1 && (
              <span className="ml-1.5 text-xs text-muted-foreground">
                {c.multiplier > 1 ? "· costlier" : "· cheaper"}
              </span>
            )}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
