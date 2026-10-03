/**
 * Living-cost multipliers for the city someone will live in after they stop
 * working, relative to the country benchmark in countryProfiles.ts.
 *
 * Rough relative cost-of-living levels (rent dominates), rounded so they read
 * as estimates — not precise indices. India's benchmark (₹14 L/yr family) is a
 * big-city average, so Mumbai sits above it and hometowns sit well below.
 * UAE / Saudi benchmarks are Dubai / Riyadh levels.
 */

import type { CountryCode } from "@/types";

export interface CityCost {
  id: string;
  name: string;
  multiplier: number;
}

export const DEFAULT_CITY_ID = "average";

const CITIES: Partial<Record<CountryCode, CityCost[]>> = {
  IN: [
    { id: "average", name: "Big-city average", multiplier: 1 },
    { id: "mumbai", name: "Mumbai", multiplier: 1.35 },
    { id: "delhi", name: "Delhi NCR", multiplier: 1.15 },
    { id: "bengaluru", name: "Bengaluru", multiplier: 1.15 },
    { id: "hyderabad", name: "Hyderabad", multiplier: 1 },
    { id: "chennai", name: "Chennai", multiplier: 1 },
    { id: "pune", name: "Pune", multiplier: 1 },
    { id: "kolkata", name: "Kolkata", multiplier: 0.9 },
    { id: "kerala", name: "Kochi / Thiruvananthapuram", multiplier: 0.85 },
    { id: "tier2", name: "Smaller city (Coimbatore, Jaipur, Lucknow…)", multiplier: 0.8 },
    { id: "town", name: "Hometown / small town", multiplier: 0.6 },
  ],
  AE: [
    { id: "average", name: "Dubai", multiplier: 1 },
    { id: "abudhabi", name: "Abu Dhabi", multiplier: 0.95 },
    { id: "sharjah", name: "Sharjah / Ajman", multiplier: 0.75 },
    { id: "northern", name: "Ras Al Khaimah / Fujairah", multiplier: 0.7 },
  ],
  SA: [
    { id: "average", name: "Riyadh", multiplier: 1 },
    { id: "jeddah", name: "Jeddah", multiplier: 0.95 },
    { id: "eastern", name: "Dammam / Al Khobar", multiplier: 0.9 },
    { id: "other", name: "Smaller city", multiplier: 0.75 },
  ],
  US: [
    { id: "average", name: "National average", multiplier: 1 },
    { id: "nyc_sf", name: "New York / San Francisco", multiplier: 1.6 },
    { id: "major", name: "Boston / Seattle / Los Angeles", multiplier: 1.35 },
    { id: "lower", name: "Lower-cost city or town", multiplier: 0.85 },
  ],
  GB: [
    { id: "average", name: "National average", multiplier: 1 },
    { id: "london", name: "London", multiplier: 1.35 },
    { id: "other", name: "Smaller city or town", multiplier: 0.85 },
  ],
};

export function citiesFor(country: CountryCode): CityCost[] {
  return CITIES[country] ?? [];
}

export function findCity(country: CountryCode, cityId: string | undefined): CityCost | undefined {
  if (!cityId) return undefined;
  return CITIES[country]?.find((c) => c.id === cityId);
}

export function cityMultiplier(country: CountryCode, cityId: string | undefined): number {
  return findCity(country, cityId)?.multiplier ?? 1;
}
