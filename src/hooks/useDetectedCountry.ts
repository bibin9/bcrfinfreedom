import { useEffect, useState } from "react";
import type { CountryCode } from "@/types";
import { countryProfiles } from "@/data/countryProfiles";

const SUPPORTED: CountryCode[] = Object.keys(countryProfiles) as CountryCode[];

/**
 * Lightweight IP → country geolocation via the free `ipapi.co` endpoint.
 * Falls back silently if the request is blocked, offline, or the detected
 * country isn't supported by the app.
 */
export function useDetectedCountry(): { country: CountryCode | null; loading: boolean } {
  const [country, setCountry] = useState<CountryCode | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 3500);
    fetch("https://ipapi.co/json/", { signal: controller.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { country_code?: string } | null) => {
        const code = data?.country_code as CountryCode | undefined;
        if (code && SUPPORTED.includes(code)) {
          setCountry(code);
        }
      })
      .catch(() => {
        // Silent fallback — user will pick manually.
      })
      .finally(() => {
        window.clearTimeout(timeout);
        setLoading(false);
      });
    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, []);

  return { country, loading };
}
