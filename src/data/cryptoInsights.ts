/**
 * Country-by-country regulatory stance on crypto + general investor insights.
 *
 * Facts in this file are a curated snapshot and can go stale quickly — crypto
 * regulation changes multiple times per year in most jurisdictions. Always
 * verify with the linked regulator before acting.
 */

import type { CountryCode } from "@/types";

export type CryptoStatus = "legal" | "regulated" | "restricted" | "unclear" | "banned";

export interface CryptoCountry {
  status: CryptoStatus;
  regulator: string;
  tax: string;
  onRamps: string[];
  note: string;
}

export const cryptoCountryStance: Record<CountryCode, CryptoCountry> = {
  IN: {
    status: "regulated",
    regulator: "MeitY + Income Tax Dept",
    tax: "30% flat on gains + 1% TDS per trade. No loss offset. Separate head.",
    onRamps: ["CoinDCX", "WazirX", "CoinSwitch"],
    note: "Crypto is legal to hold/trade but taxed punitively. Not legal tender. RBI and govt have repeatedly flagged systemic risk concerns.",
  },
  US: {
    status: "regulated",
    regulator: "SEC + CFTC + IRS",
    tax: "Treated as property. Short-term gains taxed as income, long-term at 0/15/20%.",
    onRamps: ["Coinbase", "Kraken", "Fidelity Crypto"],
    note: "Spot Bitcoin and Ethereum ETFs are SEC-approved (IBIT, FBTC, ETHA etc.) — the lowest-friction way for US investors to get exposure inside a regular brokerage.",
  },
  GB: {
    status: "regulated",
    regulator: "FCA",
    tax: "Capital gains tax. £3,000 annual allowance (2024/25).",
    onRamps: ["Coinbase UK", "Kraken", "Bitstamp"],
    note: "Retail derivatives/leveraged crypto products are banned. FCA enforces strict marketing rules — 'Don't invest unless you're prepared to lose all your money.'",
  },
  CA: {
    status: "regulated",
    regulator: "CSA (provincial securities commissions)",
    tax: "Gains taxed as capital gains (50% inclusion) or business income if frequent.",
    onRamps: ["Wealthsimple Crypto", "Newton", "Bitbuy"],
    note: "Canada was the first to approve a spot Bitcoin ETF (BTCC). Exchanges must register as restricted dealers.",
  },
  AU: {
    status: "regulated",
    regulator: "ASIC + AUSTRAC",
    tax: "Capital gains tax. 50% discount if held >12 months. Treated as CGT asset.",
    onRamps: ["Swyftx", "CoinSpot", "Independent Reserve"],
    note: "Exchanges must register with AUSTRAC. No spot ETF yet; exposure via ASX-listed products (EBTC).",
  },
  SG: {
    status: "regulated",
    regulator: "MAS",
    tax: "No capital gains tax. Income tax if trading is your business.",
    onRamps: ["Coinhako", "Independent Reserve SG", "Crypto.com"],
    note: "MAS licenses payment service providers under the PSA. Retail advertising of crypto is tightly restricted.",
  },
  DE: {
    status: "regulated",
    regulator: "BaFin",
    tax: "Tax-free if held >12 months. Otherwise taxed as income.",
    onRamps: ["Bitpanda", "Bison", "Kraken"],
    note: "Germany has some of the most tax-favourable rules for long-term holders — one of the few developed nations with a holding-period exemption.",
  },
  AE: {
    status: "regulated",
    regulator: "VARA (Dubai) + SCA (UAE-wide) + FSRA (ADGM)",
    tax: "No personal income tax or capital gains tax on crypto.",
    onRamps: ["BitOasis", "Binance (VARA-licensed)", "Rain"],
    note: "UAE is actively building crypto-friendly regulation. Dubai's VARA is a dedicated crypto regulator. Still — no tax ≠ no risk.",
  },
  SA: {
    status: "unclear",
    regulator: "SAMA + CMA (no clear crypto law yet)",
    tax: "No personal income or CGT on crypto (same as general tax regime).",
    onRamps: ["Rain (via UAE)", "Binance"],
    note: "Crypto is not formally regulated. SAMA has warned against speculation. Exercise extra caution with custody and off-ramps.",
  },
  JP: {
    status: "regulated",
    regulator: "FSA + JVCEA",
    tax: "Treated as miscellaneous income — up to 55% marginal rate. Very punitive.",
    onRamps: ["bitFlyer", "Coincheck", "GMO Coin"],
    note: "Japan legalised crypto as a payment method in 2017. Licensed exchanges only. Margin trading capped at 2×.",
  },
  MY: {
    status: "regulated",
    regulator: "Securities Commission Malaysia",
    tax: "No CGT. Income tax if trading is business activity.",
    onRamps: ["Luno", "MX Global", "Tokenize"],
    note: "Only SC-registered Digital Asset Exchanges can legally operate. Otherwise platforms are illegal.",
  },
  PH: {
    status: "regulated",
    regulator: "BSP + SEC",
    tax: "Capital gains treated as ordinary income. Stocks-equivalent treatment proposed.",
    onRamps: ["PDAX", "Coins.ph", "Binance (BSP-licensed)"],
    note: "BSP licenses VASPs. Crypto is used widely for remittances; see PDAX for PHP on/off ramps.",
  },
  PK: {
    status: "banned",
    regulator: "SBP + FBR",
    tax: "All crypto trading is banned. Any gains are technically illegal.",
    onRamps: ["(not legal)"],
    note: "The State Bank of Pakistan banned all crypto in 2018. A Pakistan Crypto Council was announced in 2025 but nothing is live yet. Very high legal risk.",
  },
  BD: {
    status: "banned",
    regulator: "Bangladesh Bank",
    tax: "Banned — trading is punishable under foreign exchange law.",
    onRamps: ["(not legal)"],
    note: "Crypto is illegal to trade, hold, or use in Bangladesh. Violations carry imprisonment under AML laws.",
  },
  EG: {
    status: "restricted",
    regulator: "Central Bank of Egypt",
    tax: "Not applicable — trading is prohibited under Islamic ruling (Dar al-Ifta 2018).",
    onRamps: ["(not legal)"],
    note: "Crypto is effectively banned. The central bank has repeatedly warned that crypto trading requires a license it does not issue.",
  },
};

// --------------------------------------------------------------------------

export interface CryptoPrinciple {
  title: string;
  detail: string;
}

export const cryptoPrinciples: CryptoPrinciple[] = [
  {
    title: "Treat it as risk capital",
    detail:
      "Only invest money you can afford to lose 100% of. A 70-90% drawdown has happened multiple times in every major crypto since 2011.",
  },
  {
    title: "Cap your allocation",
    detail:
      "Most advisors suggest 1-5% of total portfolio. Even passionate crypto investors rarely recommend going above 10%.",
  },
  {
    title: "Prefer established assets",
    detail:
      "Bitcoin and Ethereum together make up ~70% of total crypto market cap. 'Altcoins' outside the top 20 have a very high failure rate — most lose >95% of value within 4 years.",
  },
  {
    title: "Dollar-cost average (DCA), don't time",
    detail:
      "Buying a small, fixed amount weekly or monthly avoids the 'bought the top' problem. Timing crypto cycles reliably is unicorn-rare.",
  },
  {
    title: "Self-custody or regulated custody only",
    detail:
      "Keep crypto either in a hardware wallet you control, or on a regulated exchange with insurance. Avoid unregistered exchanges — many have failed (FTX, Celsius, Voyager).",
  },
  {
    title: "Tax matters more than you think",
    detail:
      "In India, 30% flat tax + 1% TDS makes net returns much lower than headline. In Germany, holding >1 year makes gains tax-free. Always model post-tax.",
  },
];

export const cryptoPitfalls: CryptoPrinciple[] = [
  {
    title: "Don't chase leverage",
    detail:
      "3x / 10x / 100x leverage liquidates most retail traders. Binance, Bybit etc. publicly share that >80% of retail leveraged traders lose money.",
  },
  {
    title: "Avoid 'guaranteed yield' products",
    detail:
      "Anyone promising 20%+ annual yield on stablecoins is almost certainly running a risk you don't see. Anchor, Celsius, BlockFi — all collapsed.",
  },
  {
    title: "Ignore influencer picks",
    detail:
      "Paid promotions of small-cap coins are rampant. SEC has charged multiple celebrities for undisclosed promotion of 'pump-and-dump' tokens.",
  },
  {
    title: "NFTs and meme coins are lottery tickets",
    detail:
      "The vast majority go to zero. A few become famous — survivorship bias. If you invest here, treat it as entertainment, not retirement money.",
  },
  {
    title: "Seed phrases are irreplaceable",
    detail:
      "Lose it, lose everything. Don't photograph, email, or store digitally. Write on steel or paper, store in 2+ locations you trust.",
  },
];

// --------------------------------------------------------------------------

export interface CryptoResource {
  title: string;
  url: string;
  type: "search" | "wiki" | "article" | "book" | "channel" | "regulator";
}

const yt = (q: string): CryptoResource => ({
  title: q,
  url: `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}&sp=CAMSAhAB`,
  type: "search",
});

export const cryptoYouTubeSearches: CryptoResource[] = [
  yt("bitcoin explained for beginners"),
  yt("how to buy bitcoin safely"),
  yt("what is ethereum explained simply"),
  yt("crypto hardware wallet setup ledger"),
  yt("bitcoin dollar cost averaging strategy"),
];

export const cryptoChannels: CryptoResource[] = [
  {
    title: "Andreas Antonopoulos",
    url: "https://www.youtube.com/@aantonop",
    type: "channel",
  },
  {
    title: "Coin Bureau",
    url: "https://www.youtube.com/@CoinBureau",
    type: "channel",
  },
  {
    title: "Ben Felix — Bitcoin videos",
    url: "https://www.youtube.com/@BenFelixCSI",
    type: "channel",
  },
];

export const cryptoReadings: CryptoResource[] = [
  {
    title: "Bitcoin whitepaper (Satoshi Nakamoto)",
    url: "https://bitcoin.org/bitcoin.pdf",
    type: "wiki",
  },
  {
    title: "Ethereum.org — Learn",
    url: "https://ethereum.org/en/learn/",
    type: "wiki",
  },
  {
    title: "Investopedia — Cryptocurrency",
    url: "https://www.investopedia.com/terms/c/cryptocurrency.asp",
    type: "article",
  },
  {
    title: "The Bitcoin Standard (Saifedean Ammous)",
    url: "https://en.wikipedia.org/wiki/The_Bitcoin_Standard",
    type: "book",
  },
  {
    title: "SEC — Crypto investor bulletin",
    url: "https://www.sec.gov/investor/alerts/ia_bitcoin.pdf",
    type: "regulator",
  },
];
