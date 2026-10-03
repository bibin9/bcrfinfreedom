/**
 * Country-specific investment ecosystem data.
 *
 * Figures are curated from publicly available sources (central bank inflation
 * targets, regulator websites, common retirement ages) and are approximations
 * intended for educational modelling — not live market data.
 *
 * Each profile captures:
 *   - Currency and default income pre-fill
 *   - Major local stock indices
 *   - Tax-advantaged / pension accounts available to residents
 *   - Popular retail investment vehicles (including Sharia-compliant where relevant)
 *   - Inflation, recommended emergency fund size, retirement age
 *   - A stability score (0..1) that the allocation engine uses to nudge
 *     the defensive asset weight upwards in volatile economies.
 *   - Expected long-run nominal returns for local equities and fixed income.
 */

import type { CountryCode, CountryProfile } from "@/types";

/**
 * When the country dataset was last reviewed against public sources.
 * Bump this month-string whenever inflation rates, expected returns,
 * benchmarks, or account limits are revisited. Surfaced in the UI so
 * users know the data's vintage.
 */
export const COUNTRY_DATA_LAST_REVIEWED = "2026-06";

export const countryProfiles: Record<CountryCode, CountryProfile> = {
  AE: {
    code: "AE",
    name: "United Arab Emirates",
    currency: "AED",
    currencySymbol: "د.إ",
    defaultMonthlyIncome: 18000,
    indices: [
      { name: "Dubai Financial Market General Index", ticker: "DFMGI" },
      { name: "Abu Dhabi Securities Exchange Index", ticker: "ADI" },
    ],
    taxAdvantagedAccounts: [
      {
        name: "End-of-Service Gratuity (EOSB)",
        description:
          "Statutory lump-sum benefit paid by employers at end of service; the UAE has no personal income tax so most tax-advantaged concepts do not apply.",
      },
      {
        name: "DIFC / ADGM Employee Workplace Savings (DEWS / ADGM ESP)",
        description:
          "Opt-in funded savings plan that replaces EOSB for employees in the financial free zones.",
      },
    ],
    investmentVehicles: [
      { name: "Emirates NBD / FAB mutual funds", category: "mutual_fund" },
      { name: "iShares MSCI UAE ETF", category: "etf" },
      { name: "Emirates REIT", category: "reit", shariaCompliant: true },
      { name: "UAE Federal Sukuk", category: "sukuk", shariaCompliant: true },
      { name: "Gold (Dubai Gold & Commodities Exchange)", category: "gold" },
    ],
    shariaMarket: true,
    inflationRate: 0.025,
    emergencyFundMonths: 6,
    retirementAge: 60,
    pensionNote:
      "Emiratis are covered by GPSSA pensions; expatriates rely on end-of-service gratuity and private savings.",
    regulatoryBody: "Securities and Commodities Authority (SCA)",
    stabilityScore: 0.82,
    expectedEquityReturn: 0.08,
    expectedBondReturn: 0.04,
    disclaimer:
      "Investment products in the UAE are regulated by the SCA (or DFSA/FSRA in the DIFC/ADGM free zones). Verify licences before investing.",
    averageAnnualExpensesSingle: 144000,
    averageAnnualExpensesFamily: 360000,
    fxRateToUSD: 3.67,
    flag: "🇦🇪",
  },

  SA: {
    code: "SA",
    name: "Saudi Arabia",
    currency: "SAR",
    currencySymbol: "﷼",
    defaultMonthlyIncome: 15000,
    indices: [
      { name: "Tadawul All Share Index", ticker: "TASI" },
      { name: "MSCI Tadawul 30", ticker: "MT30" },
    ],
    taxAdvantagedAccounts: [
      {
        name: "GOSI contributions",
        description:
          "Mandatory social insurance contributions for Saudi nationals; forms the base pension.",
      },
      {
        name: "Employer-sponsored savings plans",
        description:
          "Increasingly offered under CMA guidelines; voluntary defined-contribution style vehicles.",
      },
    ],
    investmentVehicles: [
      { name: "Al Rajhi Capital mutual funds", category: "mutual_fund", shariaCompliant: true },
      { name: "Saudi Government Sukuk", category: "sukuk", shariaCompliant: true },
      { name: "iShares MSCI Saudi Arabia ETF (KSA)", category: "etf" },
      { name: "REITs listed on Tadawul", category: "reit", shariaCompliant: true },
      { name: "Gold bullion", category: "gold" },
    ],
    shariaMarket: true,
    inflationRate: 0.025,
    emergencyFundMonths: 6,
    retirementAge: 60,
    pensionNote:
      "GOSI provides the core retirement pension for Saudi nationals; expatriates rely on end-of-service benefits and private savings.",
    regulatoryBody: "Capital Market Authority (CMA)",
    stabilityScore: 0.78,
    expectedEquityReturn: 0.085,
    expectedBondReturn: 0.04,
    disclaimer:
      "All investment products must be offered through a CMA-licensed institution. Retail derivatives access is restricted.",
    averageAnnualExpensesSingle: 120000,
    averageAnnualExpensesFamily: 300000,
    fxRateToUSD: 3.75,
    flag: "🇸🇦",
  },

  IN: {
    code: "IN",
    name: "India",
    currency: "INR",
    currencySymbol: "₹",
    defaultMonthlyIncome: 60000,
    indices: [
      { name: "NIFTY 50", ticker: "NIFTY" },
      { name: "BSE SENSEX", ticker: "SENSEX" },
      { name: "NIFTY Next 50", ticker: "NIFTYJR" },
    ],
    taxAdvantagedAccounts: [
      {
        name: "Public Provident Fund (PPF)",
        description: "15-year government savings scheme with EEE tax treatment.",
        annualLimit: 150000,
      },
      {
        name: "Employee Provident Fund (EPF)",
        description: "Employer-employee contribution retirement scheme.",
      },
      {
        name: "National Pension System (NPS)",
        description:
          "Market-linked retirement account with additional Sec 80CCD(1B) deduction of ₹50,000.",
        annualLimit: 50000,
      },
      {
        name: "ELSS Mutual Funds",
        description: "Equity-linked savings scheme with 3-year lock-in, eligible under Sec 80C.",
        annualLimit: 150000,
      },
    ],
    investmentVehicles: [
      { name: "Nippon India / HDFC / ICICI index funds", category: "mutual_fund" },
      { name: "Nifty 50 / Nifty Next 50 ETFs", category: "etf" },
      { name: "Embassy Office Parks REIT", category: "reit" },
      { name: "Sovereign Gold Bonds (SGB)", category: "gold" },
      { name: "Government securities via RBI Retail Direct", category: "bond" },
    ],
    shariaMarket: false,
    inflationRate: 0.055,
    emergencyFundMonths: 9,
    retirementAge: 60,
    pensionNote:
      "EPF + NPS together form the primary retirement corpus for salaried workers; self-employed typically rely on PPF + NPS + equity SIPs.",
    regulatoryBody: "Securities and Exchange Board of India (SEBI)",
    stabilityScore: 0.7,
    expectedEquityReturn: 0.11,
    expectedBondReturn: 0.07,
    disclaimer:
      "Mutual funds are subject to market risk. Read all scheme-related documents carefully. Registered with SEBI.",
    averageAnnualExpensesSingle: 600000,
    averageAnnualExpensesFamily: 1400000,
    fxRateToUSD: 83,
    flag: "🇮🇳",
  },

  US: {
    code: "US",
    name: "United States",
    currency: "USD",
    currencySymbol: "$",
    defaultMonthlyIncome: 6000,
    indices: [
      { name: "S&P 500", ticker: "SPX" },
      { name: "Nasdaq Composite", ticker: "IXIC" },
      { name: "Dow Jones Industrial Average", ticker: "DJI" },
    ],
    taxAdvantagedAccounts: [
      {
        name: "401(k)",
        description: "Employer-sponsored pre-tax (or Roth) retirement account.",
        annualLimit: 23000,
      },
      {
        name: "Traditional IRA",
        description: "Tax-deferred individual retirement account.",
        annualLimit: 7000,
      },
      {
        name: "Roth IRA",
        description: "After-tax IRA with tax-free qualified withdrawals.",
        annualLimit: 7000,
      },
      {
        name: "HSA",
        description:
          "Triple tax-advantaged health savings account; investable once balance threshold is met.",
        annualLimit: 4150,
      },
    ],
    investmentVehicles: [
      { name: "Vanguard VTI / VTSAX (total market)", category: "etf" },
      { name: "Vanguard VOO (S&P 500)", category: "etf" },
      { name: "Vanguard BND (total bond market)", category: "etf" },
      { name: "VNQ (US REIT index)", category: "reit" },
      { name: "Treasury I-Bonds / TIPS", category: "bond" },
    ],
    shariaMarket: false,
    inflationRate: 0.025,
    emergencyFundMonths: 6,
    retirementAge: 67,
    pensionNote:
      "Social Security provides a partial pension; most retirement income comes from 401(k) / IRA balances.",
    regulatoryBody: "Securities and Exchange Commission (SEC) / FINRA",
    stabilityScore: 0.9,
    expectedEquityReturn: 0.085,
    expectedBondReturn: 0.04,
    disclaimer:
      "Securities offered in the US are regulated by the SEC. Past performance is not indicative of future results.",
    averageAnnualExpensesSingle: 55000,
    averageAnnualExpensesFamily: 110000,
    fxRateToUSD: 1,
    flag: "🇺🇸",
  },

  GB: {
    code: "GB",
    name: "United Kingdom",
    currency: "GBP",
    currencySymbol: "£",
    defaultMonthlyIncome: 3500,
    indices: [
      { name: "FTSE 100", ticker: "UKX" },
      { name: "FTSE 250", ticker: "MCX" },
      { name: "FTSE All-Share", ticker: "ASX" },
    ],
    taxAdvantagedAccounts: [
      {
        name: "Stocks & Shares ISA",
        description: "Tax-free investment wrapper for UK residents.",
        annualLimit: 20000,
      },
      {
        name: "Lifetime ISA (LISA)",
        description:
          "25% government bonus for first-home or retirement savings (under-40 opening).",
        annualLimit: 4000,
      },
      {
        name: "SIPP",
        description:
          "Self-invested personal pension; contributions receive tax relief at the marginal rate.",
      },
    ],
    investmentVehicles: [
      { name: "Vanguard FTSE Global All Cap", category: "mutual_fund" },
      { name: "iShares Core FTSE 100 (ISF)", category: "etf" },
      { name: "UK Gilts (government bonds)", category: "bond" },
      { name: "British Land / Segro REITs", category: "reit" },
    ],
    shariaMarket: false,
    inflationRate: 0.03,
    emergencyFundMonths: 6,
    retirementAge: 67,
    pensionNote:
      "State Pension supplements workplace pensions and SIPPs; auto-enrolment is mandatory above earnings threshold.",
    regulatoryBody: "Financial Conduct Authority (FCA)",
    stabilityScore: 0.88,
    expectedEquityReturn: 0.075,
    expectedBondReturn: 0.04,
    disclaimer:
      "Investments can fall in value. Tax treatment depends on individual circumstances and may change. FCA-regulated advice is recommended.",
    averageAnnualExpensesSingle: 32000,
    averageAnnualExpensesFamily: 70000,
    fxRateToUSD: 0.79,
    flag: "🇬🇧",
  },

  CA: {
    code: "CA",
    name: "Canada",
    currency: "CAD",
    currencySymbol: "C$",
    defaultMonthlyIncome: 5500,
    indices: [
      { name: "S&P/TSX Composite", ticker: "GSPTSE" },
      { name: "S&P/TSX 60", ticker: "TX60" },
    ],
    taxAdvantagedAccounts: [
      {
        name: "RRSP",
        description: "Registered Retirement Savings Plan; contributions are tax-deductible.",
      },
      {
        name: "TFSA",
        description: "Tax-Free Savings Account; withdrawals and growth are tax-free.",
        annualLimit: 7000,
      },
      {
        name: "FHSA",
        description: "First Home Savings Account combining RRSP deduction + TFSA-style growth.",
        annualLimit: 8000,
      },
    ],
    investmentVehicles: [
      { name: "Vanguard VEQT / VGRO (all-in-one ETFs)", category: "etf" },
      { name: "iShares XIC (TSX composite)", category: "etf" },
      { name: "Canadian government bonds (via ZAG/XBB)", category: "bond" },
      { name: "REIT ETFs (ZRE, XRE)", category: "reit" },
    ],
    shariaMarket: false,
    inflationRate: 0.025,
    emergencyFundMonths: 6,
    retirementAge: 65,
    pensionNote:
      "CPP + OAS form the public pillar; RRSP/TFSA/employer pensions fill the rest.",
    regulatoryBody: "Canadian Securities Administrators (CSA) / IIROC",
    stabilityScore: 0.88,
    expectedEquityReturn: 0.075,
    expectedBondReturn: 0.04,
    disclaimer:
      "Registered plans have annual limits and tax rules that vary by province. Consult a CFP / IIROC-regulated advisor.",
    averageAnnualExpensesSingle: 48000,
    averageAnnualExpensesFamily: 95000,
    fxRateToUSD: 1.36,
    flag: "🇨🇦",
  },

  AU: {
    code: "AU",
    name: "Australia",
    currency: "AUD",
    currencySymbol: "A$",
    defaultMonthlyIncome: 7000,
    indices: [
      { name: "S&P/ASX 200", ticker: "XJO" },
      { name: "S&P/ASX 300", ticker: "XKO" },
    ],
    taxAdvantagedAccounts: [
      {
        name: "Superannuation",
        description:
          "Compulsory employer contributions (currently 11.5%); concessional tax on contributions and earnings.",
      },
      {
        name: "Salary Sacrifice into Super",
        description:
          "Voluntary pre-tax top-ups up to the concessional cap.",
        annualLimit: 30000,
      },
    ],
    investmentVehicles: [
      { name: "Vanguard VAS (ASX 300)", category: "etf" },
      { name: "Vanguard VGS (developed world ex-AU)", category: "etf" },
      { name: "Australian government bonds (VGB)", category: "bond" },
      { name: "A-REITs (VAP)", category: "reit" },
    ],
    shariaMarket: false,
    inflationRate: 0.03,
    emergencyFundMonths: 6,
    retirementAge: 67,
    pensionNote:
      "Superannuation is the primary retirement pillar; Age Pension is means-tested.",
    regulatoryBody: "Australian Securities and Investments Commission (ASIC)",
    stabilityScore: 0.87,
    expectedEquityReturn: 0.08,
    expectedBondReturn: 0.04,
    disclaimer:
      "Product disclosure statements should be reviewed. ASIC regulates financial services and advice in Australia.",
    averageAnnualExpensesSingle: 55000,
    averageAnnualExpensesFamily: 110000,
    fxRateToUSD: 1.50,
    flag: "🇦🇺",
  },

  SG: {
    code: "SG",
    name: "Singapore",
    currency: "SGD",
    currencySymbol: "S$",
    defaultMonthlyIncome: 6500,
    indices: [
      { name: "Straits Times Index", ticker: "STI" },
    ],
    taxAdvantagedAccounts: [
      {
        name: "CPF (Central Provident Fund)",
        description:
          "Compulsory savings covering retirement (OA/SA/RA), housing, and healthcare.",
      },
      {
        name: "Supplementary Retirement Scheme (SRS)",
        description: "Voluntary tax-deferred retirement account.",
        annualLimit: 15300,
      },
    ],
    investmentVehicles: [
      { name: "SPDR STI ETF (ES3)", category: "etf" },
      { name: "Nikko AM REIT ETF (CFA)", category: "reit" },
      { name: "Singapore Savings Bonds (SSB)", category: "bond" },
      { name: "Endowus / Syfe global portfolios", category: "mutual_fund" },
    ],
    shariaMarket: false,
    inflationRate: 0.025,
    emergencyFundMonths: 6,
    retirementAge: 63,
    pensionNote:
      "CPF LIFE provides lifelong payouts from retirement age; SRS is a voluntary top-up layer.",
    regulatoryBody: "Monetary Authority of Singapore (MAS)",
    stabilityScore: 0.92,
    expectedEquityReturn: 0.07,
    expectedBondReturn: 0.035,
    disclaimer:
      "All capital-markets products are regulated by MAS. SRS investment options vary by provider.",
    averageAnnualExpensesSingle: 60000,
    averageAnnualExpensesFamily: 150000,
    fxRateToUSD: 1.34,
    flag: "🇸🇬",
  },

  DE: {
    code: "DE",
    name: "Germany",
    currency: "EUR",
    currencySymbol: "€",
    defaultMonthlyIncome: 4200,
    indices: [
      { name: "DAX 40", ticker: "DAX" },
      { name: "MDAX", ticker: "MDAX" },
    ],
    taxAdvantagedAccounts: [
      {
        name: "Riester-Rente",
        description:
          "State-subsidised private pension with government top-ups and tax deductions.",
      },
      {
        name: "Rürup-Rente (Basisrente)",
        description:
          "Private pension with deductible contributions; well suited to the self-employed.",
      },
      {
        name: "Betriebliche Altersvorsorge (bAV)",
        description: "Employer-sponsored occupational pension.",
      },
    ],
    investmentVehicles: [
      { name: "MSCI World UCITS ETFs (iShares, Xtrackers)", category: "etf" },
      { name: "DAX UCITS ETF", category: "etf" },
      { name: "German Bunds", category: "bond" },
      { name: "European REITs", category: "reit" },
    ],
    shariaMarket: false,
    inflationRate: 0.025,
    emergencyFundMonths: 6,
    retirementAge: 67,
    pensionNote:
      "Gesetzliche Rentenversicherung is the statutory pillar; Riester / Rürup / bAV provide the private pillars.",
    regulatoryBody: "Bundesanstalt für Finanzdienstleistungsaufsicht (BaFin)",
    stabilityScore: 0.9,
    expectedEquityReturn: 0.07,
    expectedBondReturn: 0.03,
    disclaimer:
      "Investment services in Germany are supervised by BaFin. Kapitalertragsteuer applies to investment gains.",
    averageAnnualExpensesSingle: 36000,
    averageAnnualExpensesFamily: 75000,
    fxRateToUSD: 0.92,
    flag: "🇩🇪",
  },

  JP: {
    code: "JP",
    name: "Japan",
    currency: "JPY",
    currencySymbol: "¥",
    defaultMonthlyIncome: 350000,
    indices: [
      { name: "Nikkei 225", ticker: "N225" },
      { name: "TOPIX", ticker: "TOPX" },
    ],
    taxAdvantagedAccounts: [
      {
        name: "NISA (new, from 2024)",
        description:
          "Lifetime tax-free wrapper of up to ¥18m; ¥3.6m annual investment cap.",
        annualLimit: 3600000,
      },
      {
        name: "iDeCo",
        description:
          "Individual-type defined contribution pension with tax-deductible contributions.",
      },
    ],
    investmentVehicles: [
      { name: "eMAXIS Slim All Country / S&P 500", category: "mutual_fund" },
      { name: "TOPIX / Nikkei 225 ETFs", category: "etf" },
      { name: "Japanese Government Bonds (JGB)", category: "bond" },
      { name: "J-REITs", category: "reit" },
    ],
    shariaMarket: false,
    inflationRate: 0.02,
    emergencyFundMonths: 6,
    retirementAge: 65,
    pensionNote:
      "Kōsei Nenkin (employees) + Kokumin Nenkin (basic) form the public pillars; iDeCo and corporate DC plans add private savings.",
    regulatoryBody: "Financial Services Agency (FSA)",
    stabilityScore: 0.88,
    expectedEquityReturn: 0.06,
    expectedBondReturn: 0.015,
    disclaimer:
      "All securities businesses are regulated by the FSA. Currency risk applies to non-JPY investments.",
    averageAnnualExpensesSingle: 3600000,
    averageAnnualExpensesFamily: 7500000,
    fxRateToUSD: 150,
    flag: "🇯🇵",
  },

  MY: {
    code: "MY",
    name: "Malaysia",
    currency: "MYR",
    currencySymbol: "RM",
    defaultMonthlyIncome: 5000,
    indices: [
      { name: "FTSE Bursa Malaysia KLCI", ticker: "KLCI" },
    ],
    taxAdvantagedAccounts: [
      {
        name: "EPF (KWSP)",
        description:
          "Mandatory provident fund; Account 1 for retirement, Account 2 for approved uses.",
      },
      {
        name: "Private Retirement Scheme (PRS)",
        description:
          "Voluntary scheme with up to RM3,000 personal tax relief.",
        annualLimit: 3000,
      },
    ],
    investmentVehicles: [
      { name: "Amanah Saham (ASB, ASM)", category: "mutual_fund", shariaCompliant: true },
      { name: "FBM KLCI ETF", category: "etf" },
      { name: "Malaysian Government Sukuk (MGS-i)", category: "sukuk", shariaCompliant: true },
      { name: "KLCC REIT / Sunway REIT", category: "reit" },
    ],
    shariaMarket: true,
    inflationRate: 0.03,
    emergencyFundMonths: 6,
    retirementAge: 60,
    pensionNote:
      "EPF is the primary retirement pillar; PRS provides a tax-advantaged top-up.",
    regulatoryBody: "Securities Commission Malaysia (SC)",
    stabilityScore: 0.75,
    expectedEquityReturn: 0.07,
    expectedBondReturn: 0.04,
    disclaimer:
      "Products must be approved by the SC. Shariah-compliant products are screened by the SC's Shariah Advisory Council.",
    averageAnnualExpensesSingle: 48000,
    averageAnnualExpensesFamily: 110000,
    fxRateToUSD: 4.40,
    flag: "🇲🇾",
  },

  PH: {
    code: "PH",
    name: "Philippines",
    currency: "PHP",
    currencySymbol: "₱",
    defaultMonthlyIncome: 35000,
    indices: [
      { name: "PSEi", ticker: "PSEI" },
    ],
    taxAdvantagedAccounts: [
      {
        name: "PERA",
        description:
          "Personal Equity and Retirement Account; 5% tax credit on contributions.",
        annualLimit: 100000,
      },
      {
        name: "SSS / GSIS",
        description: "Mandatory social security (private) or government service insurance system.",
      },
    ],
    investmentVehicles: [
      { name: "BPI / BDO / Sun Life UITFs and mutual funds", category: "mutual_fund" },
      { name: "First Metro Philippine Equity ETF (FMETF)", category: "etf" },
      { name: "Retail Treasury Bonds (RTB)", category: "bond" },
      { name: "Philippine REITs (AREIT, MREIT)", category: "reit" },
    ],
    shariaMarket: false,
    inflationRate: 0.045,
    emergencyFundMonths: 9,
    retirementAge: 60,
    pensionNote:
      "SSS / GSIS provide a modest base pension; PERA and mutual funds/UITFs form the voluntary pillars.",
    regulatoryBody: "Securities and Exchange Commission (SEC PH)",
    stabilityScore: 0.65,
    expectedEquityReturn: 0.09,
    expectedBondReturn: 0.055,
    disclaimer:
      "Mutual funds, UITFs, and listed securities are regulated by the SEC / BSP. Currency and liquidity risk apply.",
    averageAnnualExpensesSingle: 360000,
    averageAnnualExpensesFamily: 800000,
    fxRateToUSD: 57,
    flag: "🇵🇭",
  },

  PK: {
    code: "PK",
    name: "Pakistan",
    currency: "PKR",
    currencySymbol: "₨",
    defaultMonthlyIncome: 120000,
    indices: [
      { name: "KSE-100", ticker: "KSE100" },
    ],
    taxAdvantagedAccounts: [
      {
        name: "Voluntary Pension Scheme (VPS)",
        description:
          "SECP-regulated pension vehicle with tax credits on contributions.",
      },
      {
        name: "Employees' Old-Age Benefits Institution (EOBI)",
        description: "Mandatory pension scheme for employees of registered firms.",
      },
    ],
    investmentVehicles: [
      { name: "Meezan Islamic Fund / Al Meezan VPS", category: "mutual_fund", shariaCompliant: true },
      { name: "National Investment Trust (NIT) funds", category: "mutual_fund" },
      { name: "Government of Pakistan Ijarah Sukuk", category: "sukuk", shariaCompliant: true },
      { name: "Pakistan Investment Bonds (PIB)", category: "bond" },
      { name: "Gold (via PMEX)", category: "gold" },
    ],
    shariaMarket: true,
    inflationRate: 0.12,
    emergencyFundMonths: 12,
    retirementAge: 60,
    pensionNote:
      "EOBI pensions are modest; VPS and mutual funds form the backbone of voluntary retirement saving.",
    regulatoryBody: "Securities and Exchange Commission of Pakistan (SECP)",
    stabilityScore: 0.45,
    expectedEquityReturn: 0.15,
    expectedBondReturn: 0.12,
    disclaimer:
      "High inflation and currency volatility can materially erode real returns. SECP-registered funds only.",
    averageAnnualExpensesSingle: 1200000,
    averageAnnualExpensesFamily: 2800000,
    fxRateToUSD: 280,
    flag: "🇵🇰",
  },

  BD: {
    code: "BD",
    name: "Bangladesh",
    currency: "BDT",
    currencySymbol: "৳",
    defaultMonthlyIncome: 45000,
    indices: [
      { name: "DSEX", ticker: "DSEX" },
      { name: "DS30", ticker: "DS30" },
    ],
    taxAdvantagedAccounts: [
      {
        name: "Deposit Pension Scheme (DPS)",
        description:
          "Long-term bank savings scheme eligible for investment tax rebate.",
      },
      {
        name: "Sanchayapatra (National Savings Certificates)",
        description:
          "Government savings certificates with preferential rates (subject to caps).",
      },
    ],
    investmentVehicles: [
      { name: "ICB AMCL / LankaBangla mutual funds", category: "mutual_fund" },
      { name: "DSE-listed equities", category: "etf" },
      { name: "Bangladesh Government Treasury Bonds", category: "bond" },
      { name: "Islamic Sukuk (ijara)", category: "sukuk", shariaCompliant: true },
    ],
    shariaMarket: true,
    inflationRate: 0.09,
    emergencyFundMonths: 12,
    retirementAge: 59,
    pensionNote:
      "Public pensions cover government workers; private-sector retirement typically relies on provident funds and DPS.",
    regulatoryBody: "Bangladesh Securities and Exchange Commission (BSEC)",
    stabilityScore: 0.5,
    expectedEquityReturn: 0.12,
    expectedBondReturn: 0.09,
    disclaimer:
      "Retail investors should use BSEC-licensed brokers. Liquidity on the DSE can be limited.",
    averageAnnualExpensesSingle: 480000,
    averageAnnualExpensesFamily: 1100000,
    fxRateToUSD: 110,
    flag: "🇧🇩",
  },

  EG: {
    code: "EG",
    name: "Egypt",
    currency: "EGP",
    currencySymbol: "£E",
    defaultMonthlyIncome: 15000,
    indices: [
      { name: "EGX 30", ticker: "EGX30" },
      { name: "EGX 70 EWI", ticker: "EGX70" },
    ],
    taxAdvantagedAccounts: [
      {
        name: "Private Pension Funds (FRA-registered)",
        description:
          "Voluntary employer- or individual-sponsored pension funds regulated by the FRA.",
      },
      {
        name: "National Social Insurance",
        description:
          "Mandatory social insurance administered by NOSI; forms the base pension.",
      },
    ],
    investmentVehicles: [
      { name: "CIB / EFG Hermes mutual funds", category: "mutual_fund" },
      { name: "EGX 30 ETF", category: "etf" },
      { name: "Egyptian Treasury Bills & Bonds", category: "bond" },
      { name: "Sovereign Sukuk", category: "sukuk", shariaCompliant: true },
      { name: "Gold (EGX-listed gold ETF)", category: "gold" },
    ],
    shariaMarket: true,
    inflationRate: 0.2,
    emergencyFundMonths: 12,
    retirementAge: 60,
    pensionNote:
      "Social insurance pensions are modest; private pensions and T-bills are common supplements for professionals.",
    regulatoryBody: "Financial Regulatory Authority (FRA) / EGX",
    stabilityScore: 0.4,
    expectedEquityReturn: 0.22,
    expectedBondReturn: 0.18,
    disclaimer:
      "High inflation and EGP devaluation risk can materially affect real returns. Use FRA-licensed intermediaries only.",
    averageAnnualExpensesSingle: 180000,
    averageAnnualExpensesFamily: 420000,
    fxRateToUSD: 49,
    flag: "🇪🇬",
  },
};

export const countryList: CountryProfile[] = Object.values(countryProfiles).sort((a, b) =>
  a.name.localeCompare(b.name),
);

export function getCountryProfile(code: CountryCode): CountryProfile {
  return countryProfiles[code];
}
