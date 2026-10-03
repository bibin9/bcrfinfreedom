import { describe, it, expect } from "vitest";
import { formatCurrency } from "@/lib/formatters";
import { convertCurrency } from "@/lib/fx";
import { getCountryProfile } from "@/data/countryProfiles";

describe("formatCurrency compact", () => {
  it("keeps ₹1.5L as 1.5L (regression: rounded to ₹2L)", () => {
    const s = formatCurrency(150_000, { currency: "INR" }, { compact: true });
    expect(s).toContain("1.5");
    expect(s).not.toMatch(/₹\s?2\s?L/);
  });

  it("keeps AED 10,500 as 10.5K, not 11K", () => {
    const s = formatCurrency(10_500, { currency: "AED" }, { compact: true });
    expect(s).toContain("10.5");
  });

  it("standard notation is unchanged", () => {
    const s = formatCurrency(45_000, { currency: "INR" });
    expect(s).toContain("45,000");
  });
});

describe("expat FI ratio currency (regression)", () => {
  it("AED corpus must be converted before comparing with an INR FIRE number", () => {
    const ae = getCountryProfile("AE");
    const inr = getCountryProfile("IN");
    const corpusAED = 100_000;
    const fireNumberINR = 4_00_00_000; // ₹4 Cr
    const naive = corpusAED / fireNumberINR;
    const correct = convertCurrency(corpusAED, ae, inr) / fireNumberINR;
    expect(correct / naive).toBeGreaterThan(20); // AED→INR ≈ 22.6
  });
});
