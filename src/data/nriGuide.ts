/**
 * Indian NRI investing guide.
 *
 * NRIs (Non-Resident Indians) have a specialised menu of India-side investment
 * options alongside whatever their country of residence offers. Most people
 * have never had these options laid out in one place, so this file is
 * intentionally exhaustive.
 *
 * Regulatory note: all products mentioned are governed by RBI / SEBI /
 * FEMA. US-resident NRIs face additional FATCA constraints — many Indian
 * mutual funds refuse US/Canada residents. This guide flags that inline.
 *
 * Nothing here is investment advice. Verify all limits, tax rates and
 * eligibility with a SEBI-registered advisor and a cross-border tax
 * professional before acting.
 */

export interface NRIAccount {
  name: string;
  fullName: string;
  purpose: string;
  currency: string;
  repatriable: boolean;
  taxed: string;
  whenToUse: string;
}

export const nriAccounts: NRIAccount[] = [
  {
    name: "NRE",
    fullName: "Non-Resident External Account",
    purpose: "Park foreign income in INR — fully repatriable.",
    currency: "INR (funded from foreign currency)",
    repatriable: true,
    taxed:
      "Interest is tax-free in India. Check your residence country's tax treaty.",
    whenToUse:
      "When you want to send foreign income home and keep the option to take it back out. Most SIPs into Indian mutual funds are routed through an NRE account.",
  },
  {
    name: "NRO",
    fullName: "Non-Resident Ordinary Account",
    purpose: "Handle Indian-source income like rent, dividends, pension.",
    currency: "INR",
    repatriable: true,
    taxed: "Interest is taxable in India; TDS applies (up to 30% + surcharge).",
    whenToUse:
      "If you earn rent or dividends in India, or inherit money — it must go through an NRO account. Limited annual repatriation (USD 1M/yr).",
  },
  {
    name: "FCNR (B)",
    fullName: "Foreign Currency Non-Resident (Bank) Deposit",
    purpose: "Fixed deposit in foreign currency — no FX risk.",
    currency: "USD, GBP, EUR, JPY, AUD, CAD etc.",
    repatriable: true,
    taxed: "Interest is tax-free in India. 1–5 year tenure.",
    whenToUse:
      "For NRIs who want capital protected in hard currency and decent interest — ideal parking for funds earmarked to return to residence country.",
  },
  {
    name: "RFC",
    fullName: "Resident Foreign Currency Account",
    purpose: "For NRIs returning to India permanently.",
    currency: "Foreign currency",
    repatriable: true,
    taxed: "Interest taxable once you're a resident.",
    whenToUse:
      "Opened within 90 days of return to India to retain foreign-currency wealth without converting to INR immediately.",
  },
  {
    name: "PIS",
    fullName: "Portfolio Investment Scheme",
    purpose: "Buy individual Indian stocks from abroad.",
    currency: "INR (routed via NRE or NRO)",
    repatriable: true,
    taxed: "STCG 20% / LTCG 12.5% (2024 slabs).",
    whenToUse:
      "Only if you want to pick individual Indian stocks. Most NRIs are better off in mutual funds via NRE without PIS paperwork.",
  },
];

// ---------------------------------------------------------------------------

export interface NRIInvestmentOption {
  title: string;
  category: "equity" | "debt" | "gold" | "real_estate" | "retirement" | "gift_city";
  whatItIs: string;
  expectedGrowth: string;
  risk: string;
  bestFor: string;
  keyNote?: string;
}

export const nriOptions: NRIInvestmentOption[] = [
  {
    title: "Indian Mutual Funds via NRE",
    category: "equity",
    whatItIs:
      "Diversified equity / debt mutual funds — same schemes that resident Indians invest in, paid from your NRE account.",
    expectedGrowth: "10–14% a year for large-cap equity funds, over 7+ years.",
    risk:
      "Medium to high for equity; low for debt funds. In a bad year equity can fall 20–30%.",
    bestFor:
      "The default choice for Gulf-based, UK, Singapore, and Europe-based NRIs who plan to send monthly SIPs.",
    keyNote:
      "US and Canada-based NRIs: most fund houses refuse you due to FATCA. Only a few (Nippon India, UTI, SBI Mutual, L&T, ICICI Pru) accept US/Canada NRIs with extra paperwork.",
  },
  {
    title: "Direct Indian Equities via PIS",
    category: "equity",
    whatItIs:
      "Pick individual stocks listed on NSE/BSE through a PIS-enabled broker.",
    expectedGrowth: "Highly variable — matches your picks.",
    risk:
      "High. Single-stock risk, plus the cost and paperwork of PIS makes this unattractive for most.",
    bestFor:
      "NRIs with significant capital (>₹25L) and active interest in Indian stock research.",
  },
  {
    title: "ETFs on Indian Exchanges",
    category: "equity",
    whatItIs:
      "Exchange-traded funds tracking Nifty 50, Bank Nifty, Nasdaq 100, gold, etc. — bought through an Indian demat/PIS account.",
    expectedGrowth: "10–13% for Nifty 50 ETFs over 10+ years.",
    risk: "Medium — same as the underlying index.",
    bestFor:
      "NRIs who want the lowest-cost equity exposure and are comfortable buying on an exchange.",
  },
  {
    title: "NRE Fixed Deposits",
    category: "debt",
    whatItIs:
      "Bank fixed deposit in INR, funded from foreign remittance. Interest is tax-free in India.",
    expectedGrowth: "6.5–7.5% a year, guaranteed.",
    risk:
      "Very low (bank failure only). FX risk — INR may weaken against your residence currency.",
    bestFor:
      "Conservative NRIs, emergency corpus, short-term goals (1–5 years).",
    keyNote:
      "Premature withdrawal usually allowed with a small interest penalty.",
  },
  {
    title: "FCNR(B) Deposits",
    category: "debt",
    whatItIs:
      "Fixed deposit in your foreign currency (USD, GBP, EUR, etc.). No FX risk.",
    expectedGrowth: "4.5–6% a year depending on currency and tenure.",
    risk: "Very low.",
    bestFor:
      "NRIs who may return to their residence country and want zero INR exposure on a portion of wealth.",
  },
  {
    title: "Sovereign Gold Bonds (SGB)",
    category: "gold",
    whatItIs:
      "Government-issued bonds priced at the gold rate, paying 2.5% interest on top.",
    expectedGrowth: "Gold price appreciation + 2.5% interest.",
    risk:
      "Low-medium. Tied to gold price; 8-year lock-in with exit after 5 years.",
    bestFor:
      "NRIs wanting gold exposure without storing physical gold. Tax-free on maturity for residents; taxed for NRIs.",
    keyNote:
      "As of 2024, fresh SGB issuances have paused; available in secondary market at a discount.",
  },
  {
    title: "Real Estate in India",
    category: "real_estate",
    whatItIs:
      "Residential or commercial property in India. Agricultural land is prohibited for NRIs.",
    expectedGrowth: "5–8% a year in capital appreciation + 2–3% rental yield (gross).",
    risk:
      "Medium. Illiquid; maintenance, tenant and tax management from abroad is challenging.",
    bestFor:
      "NRIs planning to eventually return or use the property themselves. Not great as a pure investment.",
    keyNote:
      "Rental income must be routed through NRO account and is taxable in India.",
  },
  {
    title: "National Pension System (NPS) — Tier 1",
    category: "retirement",
    whatItIs:
      "Government-sponsored retirement account with equity, corporate debt, and government bond options.",
    expectedGrowth: "9–11% a year on the equity-heavy option over 20+ years.",
    risk: "Low to medium — mix depends on your chosen asset allocation.",
    bestFor:
      "NRIs aged 18–70 who want a low-cost, disciplined retirement wrapper in India.",
    keyNote:
      "Tax deduction up to ₹2L/year under 80CCD; 60% lump sum at 60, rest as annuity.",
  },
  {
    title: "GIFT City (IFSC) — USD investing from India",
    category: "gift_city",
    whatItIs:
      "Financial zone in Gujarat where NRIs can invest in USD-denominated products — global funds, AIFs, insurance, FDs — without FEMA restrictions.",
    expectedGrowth: "Varies by product (equity: 8–12%; USD FDs: 4–5%).",
    risk: "Varies by product.",
    bestFor:
      "Sophisticated NRIs wanting to keep USD holdings in India with favourable taxation (no TDS on most products).",
    keyNote:
      "Platforms: Zerodha GIFT, HDFC Securities IFSC, ICICI Direct IFSC. Minimum ticket often USD 5,000–10,000.",
  },
];

// ---------------------------------------------------------------------------

export interface NRIStep {
  title: string;
  detail: string;
}

export const nriStartSteps: NRIStep[] = [
  {
    title: "Open an NRE + NRO account pair",
    detail:
      "Use HDFC NRI, ICICI NRI, Kotak, or SBI NRI. Most banks allow fully online opening via video-KYC. NRE for foreign income inbound, NRO for any India-side income.",
  },
  {
    title: "Get Mutual Fund KYC done (one-time)",
    detail:
      "On CAMS/KFintech or through ICICI Direct / HDFC Securities / Groww NRI / INDmoney. You'll need: PAN, passport, visa/OCI, overseas address proof, and a cancelled NRE cheque.",
  },
  {
    title: "Pick 1–2 starter funds",
    detail:
      "For most NRIs: UTI Nifty 50 Index Fund (passive core) + Parag Parikh Flexi Cap (diversified, global tilt). Add HDFC Short Term Debt for the safe sleeve.",
  },
  {
    title: "Set up monthly SIP from your NRE account",
    detail:
      "Any amount ≥ ₹500/month works. Auto-debit goes from your NRE account directly to the fund. No repatriation issues later.",
  },
  {
    title: "File Indian tax return annually",
    detail:
      "Even if you have only NRE interest (tax-free), it's wise to file to claim TDS refunds on any NRO income or capital gains. Use a CA who specialises in NRI returns — worth it.",
  },
];

export const nriUSACanadaNote =
  "⚠️ US and Canada residents: FATCA + CRS reporting make most Indian mutual funds off-limits. Use INDmoney, Zerodha Coin (limited set), or the few NRI-friendly AMCs (Nippon India, UTI, SBI MF, L&T, ICICI Pru). GIFT City products are a great workaround. Consult a cross-border tax advisor — PFIC rules in the US make direct ownership of Indian mutual funds very tax-inefficient.";

export const nriPlatforms = [
  "ICICI Direct NRI",
  "HDFC Securities NRI",
  "Kotak Securities NRI",
  "Zerodha NRI (no PIS currently)",
  "Groww NRI",
  "INDmoney (US/Canada NRI-friendly)",
  "FundsIndia NRI",
];
