/**
 * Curated top-fund catalogue per country.
 *
 * IMPORTANT LEGAL / MODELLING NOTE
 * --------------------------------
 * The 3-year and 5-year CAGR numbers below are **illustrative approximations
 * compiled from publicly available fact-sheets up to early 2025**. They are
 * NOT live market data, NOT a recommendation, and NOT a solicitation to invest.
 *
 * Past performance is NOT an indicator of future returns. This catalogue is an
 * educational reference to show users what categories exist in their market —
 * users MUST verify current factsheet data with a licensed distributor
 * (e.g. AMFI in India, Morningstar, fund house website) before investing.
 *
 * Every fund listed is chosen because it is a long-standing, well-known
 * scheme in its market — we deliberately avoid obscure or niche funds where
 * data quality is poor.
 */

import type { CountryCode, MutualFund } from "@/types";

export const FUND_CATALOGUE_UPDATED_AT = "2025-Q1";

export const fundCatalog: Record<CountryCode, MutualFund[]> = {
  IN: [
    { name: "Parag Parikh Flexi Cap Fund", category: "flexi_cap", threeYearCagr: 0.22, fiveYearCagr: 0.26, expenseRatio: 0.007, risk: "high", note: "Global + India flexi-cap with concentrated conviction bets; long-term compounder." },
    { name: "HDFC Index S&P BSE Sensex Fund", category: "index", threeYearCagr: 0.155, fiveYearCagr: 0.17, expenseRatio: 0.002, risk: "medium", note: "Low-cost Sensex tracker — the passive core many portfolios start with." },
    { name: "Nippon India Small Cap Fund", category: "small_cap", threeYearCagr: 0.28, fiveYearCagr: 0.3, expenseRatio: 0.016, risk: "high", note: "Consistently strong small-cap performer; expect deep drawdowns between wins." },
    { name: "Mirae Asset Large Cap Fund", category: "large_cap", threeYearCagr: 0.155, fiveYearCagr: 0.18, expenseRatio: 0.0155, risk: "medium", note: "Large-cap stalwart — steady compounding, moderate volatility." },
    { name: "Axis Midcap Fund", category: "mid_cap", threeYearCagr: 0.2, fiveYearCagr: 0.22, expenseRatio: 0.0175, risk: "high", note: "Quality-growth bias in the mid-cap space; better downside protection than peers." },
    { name: "ICICI Prudential Bluechip Fund", category: "large_cap", threeYearCagr: 0.18, fiveYearCagr: 0.19, expenseRatio: 0.016, risk: "medium", note: "Conservative large-cap with a long track record; good for first-time equity investors." },
    { name: "Quant Active Fund", category: "flexi_cap", threeYearCagr: 0.22, fiveYearCagr: 0.25, expenseRatio: 0.0175, risk: "high", note: "Momentum + VLRT model, higher churn; can look very different YoY." },
    { name: "Axis Long Term Equity Fund (ELSS)", category: "elss", threeYearCagr: 0.15, fiveYearCagr: 0.16, expenseRatio: 0.0155, risk: "medium", note: "Tax-saving (80C) with 3-year lock-in; quality-growth tilt." },
    { name: "Motilal Oswal Nasdaq 100 ETF", category: "international", threeYearCagr: 0.13, fiveYearCagr: 0.17, expenseRatio: 0.0058, risk: "high", note: "US tech exposure via a rupee-denominated ETF; adds global diversification." },
    { name: "HDFC Short Term Debt Fund", category: "debt", threeYearCagr: 0.065, fiveYearCagr: 0.07, expenseRatio: 0.0075, risk: "low", note: "Short-duration debt for the stability sleeve; better tax efficiency than an FD over 3+ years." },
  ],

  US: [
    { name: "Vanguard Total Stock Market ETF (VTI)", category: "etf", threeYearCagr: 0.1, fiveYearCagr: 0.135, expenseRatio: 0.0003, risk: "medium", note: "Entire US equity market in one ticker. The bedrock US portfolio holding." },
    { name: "Vanguard S&P 500 ETF (VOO)", category: "large_cap", threeYearCagr: 0.105, fiveYearCagr: 0.14, expenseRatio: 0.0003, risk: "medium", note: "500 largest US companies; the default benchmark most active funds fail to beat." },
    { name: "Vanguard Total International Stock ETF (VXUS)", category: "international", threeYearCagr: 0.04, fiveYearCagr: 0.06, expenseRatio: 0.0007, risk: "medium", note: "Non-US developed + emerging markets. Global diversification." },
    { name: "Vanguard Total Bond Market ETF (BND)", category: "debt", threeYearCagr: -0.005, fiveYearCagr: 0.01, expenseRatio: 0.0003, risk: "low", note: "US investment-grade bond benchmark — the stability sleeve's core holding." },
    { name: "Vanguard Mid-Cap ETF (VO)", category: "mid_cap", threeYearCagr: 0.08, fiveYearCagr: 0.11, expenseRatio: 0.0004, risk: "high", note: "Mid-cap US equities — often under-represented in S&P 500 allocations." },
    { name: "Vanguard Small-Cap ETF (VB)", category: "small_cap", threeYearCagr: 0.06, fiveYearCagr: 0.105, expenseRatio: 0.0005, risk: "high", note: "Broad US small-cap exposure with a large-sample factor tilt." },
    { name: "Schwab US Dividend Equity ETF (SCHD)", category: "large_cap", threeYearCagr: 0.08, fiveYearCagr: 0.13, expenseRatio: 0.0006, risk: "medium", note: "Quality dividend growers — better downside capture than the S&P 500." },
    { name: "Invesco QQQ Trust (QQQ)", category: "large_cap", threeYearCagr: 0.14, fiveYearCagr: 0.2, expenseRatio: 0.002, risk: "high", note: "Nasdaq-100 — tech-heavy; strong cycles but deeper drawdowns." },
    { name: "Vanguard Real Estate ETF (VNQ)", category: "etf", threeYearCagr: 0.02, fiveYearCagr: 0.05, expenseRatio: 0.0012, risk: "medium", note: "US REIT basket — inflation-linked income layer." },
    { name: "Vanguard Emerging Markets ETF (VWO)", category: "international", threeYearCagr: 0.02, fiveYearCagr: 0.04, expenseRatio: 0.0008, risk: "high", note: "Emerging markets exposure including China, India, Brazil — high beta diversifier." },
  ],

  GB: [
    { name: "Vanguard FTSE Global All Cap Index", category: "index", threeYearCagr: 0.08, fiveYearCagr: 0.1, expenseRatio: 0.0023, risk: "medium", note: "Global equity index — a common ISA/SIPP core for UK DIY investors." },
    { name: "Vanguard LifeStrategy 80% Equity", category: "hybrid", threeYearCagr: 0.06, fiveYearCagr: 0.08, expenseRatio: 0.0022, risk: "medium", note: "Ready-made 80/20 equity/bond multi-asset fund; one-fund portfolio." },
    { name: "iShares Core FTSE 100 ETF (ISF)", category: "large_cap", threeYearCagr: 0.07, fiveYearCagr: 0.06, expenseRatio: 0.0007, risk: "medium", note: "UK FTSE 100 tracker — yield-heavy, cyclical tilt." },
    { name: "iShares Core MSCI World ETF (SWDA)", category: "international", threeYearCagr: 0.09, fiveYearCagr: 0.11, expenseRatio: 0.002, risk: "medium", note: "Developed-world equities ex-UK home bias — diversification default." },
    { name: "Fundsmith Equity", category: "flexi_cap", threeYearCagr: 0.07, fiveYearCagr: 0.11, expenseRatio: 0.0094, risk: "medium", note: "Quality-growth global equity fund with a low turnover philosophy." },
    { name: "Vanguard US Equity Index", category: "large_cap", threeYearCagr: 0.105, fiveYearCagr: 0.135, expenseRatio: 0.001, risk: "medium", note: "Cheap US exposure; often combined with a global tracker." },
    { name: "Royal London Short Term Money Market Fund", category: "debt", threeYearCagr: 0.035, fiveYearCagr: 0.02, expenseRatio: 0.001, risk: "low", note: "Cash-equivalent — useful parking venue during rate-high regimes." },
    { name: "iShares Core UK Gilts ETF (IGLT)", category: "debt", threeYearCagr: -0.04, fiveYearCagr: -0.02, expenseRatio: 0.0007, risk: "low", note: "UK government bonds — duration sleeve; rate-sensitive." },
    { name: "Legal & General UK Index", category: "index", threeYearCagr: 0.065, fiveYearCagr: 0.055, expenseRatio: 0.001, risk: "medium", note: "Broad UK equity tracker; lower-cost alternative to FTSE 100 ETFs." },
    { name: "HSBC FTSE All-World Index Fund", category: "index", threeYearCagr: 0.08, fiveYearCagr: 0.1, expenseRatio: 0.0013, risk: "medium", note: "Global index fund alternative to Vanguard FTSE Global All Cap." },
  ],

  AE: [
    { name: "Emirates Islamic Global Sukuk Fund", category: "sukuk", threeYearCagr: 0.03, fiveYearCagr: 0.025, expenseRatio: 0.012, risk: "low", shariaCompliant: true, note: "Shariah-compliant global sukuk exposure for income and capital preservation." },
    { name: "Emirates NBD Emerging Markets Equity Fund", category: "international", threeYearCagr: 0.02, fiveYearCagr: 0.04, expenseRatio: 0.018, risk: "high", note: "Emerging markets equity basket for diversification beyond GCC." },
    { name: "iShares MSCI UAE ETF (UAE)", category: "large_cap", threeYearCagr: 0.05, fiveYearCagr: 0.07, expenseRatio: 0.0059, risk: "medium", note: "UAE large-cap exposure via a USD-denominated ETF." },
    { name: "iShares Core MSCI World (SWDA)", category: "international", threeYearCagr: 0.09, fiveYearCagr: 0.11, expenseRatio: 0.002, risk: "medium", note: "Developed-world equities via a UCITS ETF accessible from DIFC." },
    { name: "Franklin Templeton Shariah Global Equity", category: "flexi_cap", threeYearCagr: 0.08, fiveYearCagr: 0.1, expenseRatio: 0.014, risk: "medium", shariaCompliant: true, note: "Actively managed global Shariah-compliant equity fund." },
    { name: "Emirates REIT", category: "etf", threeYearCagr: 0.03, fiveYearCagr: 0.02, expenseRatio: 0.011, risk: "medium", shariaCompliant: true, note: "Shariah-compliant REIT invested in UAE commercial property." },
    { name: "Abu Dhabi Islamic Bank Money Market Fund", category: "debt", threeYearCagr: 0.03, fiveYearCagr: 0.025, expenseRatio: 0.007, risk: "low", shariaCompliant: true, note: "Shariah-compliant liquidity vehicle for the cash sleeve." },
    { name: "Invesco S&P 500 UCITS ETF", category: "large_cap", threeYearCagr: 0.105, fiveYearCagr: 0.14, expenseRatio: 0.0005, risk: "medium", note: "US large-cap exposure via a UCITS ETF (USD)." },
    { name: "Mashreq Al-Islami Income Fund", category: "debt", threeYearCagr: 0.03, fiveYearCagr: 0.026, expenseRatio: 0.01, risk: "low", shariaCompliant: true, note: "Sukuk-focused income fund for retail investors." },
    { name: "ADIB Global Sukuk Fund", category: "sukuk", threeYearCagr: 0.028, fiveYearCagr: 0.026, expenseRatio: 0.012, risk: "low", shariaCompliant: true, note: "Global sukuk exposure with monthly dividend distribution." },
  ],

  SA: [
    { name: "Al Rajhi Saudi Equity Fund", category: "large_cap", threeYearCagr: 0.08, fiveYearCagr: 0.1, expenseRatio: 0.015, risk: "medium", shariaCompliant: true, note: "Actively managed Shariah-compliant Saudi equity fund." },
    { name: "Riyad Equity Fund", category: "large_cap", threeYearCagr: 0.07, fiveYearCagr: 0.09, expenseRatio: 0.014, risk: "medium", shariaCompliant: true, note: "Long-standing Saudi equity fund with broad large-cap exposure." },
    { name: "SNB Capital Al Raed Fund", category: "flexi_cap", threeYearCagr: 0.075, fiveYearCagr: 0.095, expenseRatio: 0.014, risk: "high", shariaCompliant: true, note: "Multi-cap Saudi equities; actively managed." },
    { name: "Jadwa Saudi Equity Fund", category: "large_cap", threeYearCagr: 0.07, fiveYearCagr: 0.1, expenseRatio: 0.015, risk: "medium", shariaCompliant: true, note: "Research-driven Saudi large-cap fund from a well-known boutique." },
    { name: "iShares MSCI Saudi Arabia ETF (KSA)", category: "etf", threeYearCagr: 0.06, fiveYearCagr: 0.08, expenseRatio: 0.0074, risk: "medium", note: "USD ETF — accessible to international investors via US brokers." },
    { name: "Al Rajhi Global Sukuk Fund", category: "sukuk", threeYearCagr: 0.03, fiveYearCagr: 0.025, expenseRatio: 0.01, risk: "low", shariaCompliant: true, note: "Global sukuk income fund; backbone of the fixed-income sleeve." },
    { name: "SNB Capital Saudi Riyal Murabaha Fund", category: "debt", threeYearCagr: 0.038, fiveYearCagr: 0.028, expenseRatio: 0.005, risk: "low", shariaCompliant: true, note: "Shariah-compliant SAR money-market equivalent." },
    { name: "HSBC Saudi Equity Trading Fund", category: "flexi_cap", threeYearCagr: 0.07, fiveYearCagr: 0.09, expenseRatio: 0.013, risk: "high", shariaCompliant: true, note: "Actively traded Saudi equity fund; higher churn." },
    { name: "Derayah Financial Global REIT Fund", category: "etf", threeYearCagr: 0.02, fiveYearCagr: 0.035, expenseRatio: 0.012, risk: "medium", shariaCompliant: true, note: "Global Shariah-compliant REIT exposure for the real-estate sleeve." },
    { name: "Riyad Sukuk Fund", category: "sukuk", threeYearCagr: 0.028, fiveYearCagr: 0.027, expenseRatio: 0.008, risk: "low", shariaCompliant: true, note: "Saudi-focused sukuk portfolio; lower-cost alternative." },
  ],

  SG: [
    { name: "SPDR Straits Times Index ETF (ES3)", category: "large_cap", threeYearCagr: 0.06, fiveYearCagr: 0.05, expenseRatio: 0.003, risk: "medium", note: "Singapore STI tracker — yield-heavy bank + REIT tilt." },
    { name: "Nikko AM Singapore STI ETF (G3B)", category: "large_cap", threeYearCagr: 0.06, fiveYearCagr: 0.05, expenseRatio: 0.003, risk: "medium", note: "Alternate STI tracker with slightly different replication method." },
    { name: "Nikko AM REIT ETF (CFA)", category: "etf", threeYearCagr: 0.01, fiveYearCagr: 0.02, expenseRatio: 0.006, risk: "medium", note: "Basket of Singapore-listed REITs for passive property income." },
    { name: "Endowus Flagship 100% Equity Portfolio", category: "flexi_cap", threeYearCagr: 0.085, fiveYearCagr: 0.1, expenseRatio: 0.004, risk: "high", note: "Robo-advised global equity portfolio using institutional share classes." },
    { name: "Syfe Core Equity100", category: "flexi_cap", threeYearCagr: 0.085, fiveYearCagr: 0.1, expenseRatio: 0.004, risk: "high", note: "Diversified global equity portfolio (ARK, QQQ, SPY) via a robo-advisor." },
    { name: "iShares Core S&P 500 UCITS ETF (CSPX)", category: "large_cap", threeYearCagr: 0.105, fiveYearCagr: 0.14, expenseRatio: 0.0007, risk: "medium", note: "US S&P 500 via UCITS — tax-efficient for Singapore residents." },
    { name: "Vanguard FTSE All-World UCITS ETF (VWRA)", category: "international", threeYearCagr: 0.08, fiveYearCagr: 0.1, expenseRatio: 0.0022, risk: "medium", note: "Accumulating global equity ETF — common Singapore core." },
    { name: "ABF Singapore Bond Index Fund (A35)", category: "debt", threeYearCagr: 0.01, fiveYearCagr: 0.005, expenseRatio: 0.003, risk: "low", note: "Singapore government bond index fund; stability sleeve." },
    { name: "Phillip SING Income ETF (OVQ)", category: "etf", threeYearCagr: 0.04, fiveYearCagr: 0.05, expenseRatio: 0.007, risk: "medium", note: "Income-focused Singapore equities." },
    { name: "StashAway General Investing (Aggressive)", category: "flexi_cap", threeYearCagr: 0.08, fiveYearCagr: 0.09, expenseRatio: 0.008, risk: "high", note: "Robo-advised ETF portfolio; SRS-compatible." },
  ],

  CA: [
    { name: "Vanguard All-Equity ETF (VEQT)", category: "flexi_cap", threeYearCagr: 0.09, fiveYearCagr: 0.11, expenseRatio: 0.0024, risk: "high", note: "100% global equity one-ticker portfolio — Canadian favourite." },
    { name: "Vanguard Balanced ETF (VBAL)", category: "hybrid", threeYearCagr: 0.05, fiveYearCagr: 0.07, expenseRatio: 0.0024, risk: "medium", note: "60/40 global equity/bond one-ticker portfolio." },
    { name: "Vanguard Growth ETF (VGRO)", category: "hybrid", threeYearCagr: 0.075, fiveYearCagr: 0.09, expenseRatio: 0.0024, risk: "medium", note: "80/20 global equity/bond — common RRSP/TFSA core." },
    { name: "iShares Core S&P/TSX Capped Composite (XIC)", category: "large_cap", threeYearCagr: 0.08, fiveYearCagr: 0.09, expenseRatio: 0.0006, risk: "medium", note: "Canadian equity market tracker at rock-bottom cost." },
    { name: "iShares Core S&P 500 Index ETF (XUS)", category: "large_cap", threeYearCagr: 0.105, fiveYearCagr: 0.14, expenseRatio: 0.0009, risk: "medium", note: "US S&P 500 in CAD." },
    { name: "Vanguard FTSE Developed All Cap Ex North America (VIU)", category: "international", threeYearCagr: 0.05, fiveYearCagr: 0.06, expenseRatio: 0.002, risk: "medium", note: "International developed equities — complements a US + Canada core." },
    { name: "BMO Aggregate Bond Index ETF (ZAG)", category: "debt", threeYearCagr: -0.005, fiveYearCagr: 0.01, expenseRatio: 0.0009, risk: "low", note: "Canadian aggregate bond index — stability sleeve." },
    { name: "iShares S&P/TSX Capped REIT Index (XRE)", category: "etf", threeYearCagr: 0.03, fiveYearCagr: 0.03, expenseRatio: 0.0061, risk: "medium", note: "Canadian REIT basket." },
    { name: "TD US Index Fund-e", category: "index", threeYearCagr: 0.105, fiveYearCagr: 0.14, expenseRatio: 0.0035, risk: "medium", note: "US S&P 500 as a mutual fund for automated RRSP contributions." },
    { name: "Mawer Global Equity Fund", category: "flexi_cap", threeYearCagr: 0.075, fiveYearCagr: 0.1, expenseRatio: 0.012, risk: "medium", note: "Well-regarded actively managed global equity fund." },
  ],

  AU: [
    { name: "Vanguard Australian Shares Index ETF (VAS)", category: "large_cap", threeYearCagr: 0.085, fiveYearCagr: 0.09, expenseRatio: 0.0007, risk: "medium", note: "ASX 300 tracker — core Australian equity holding." },
    { name: "Vanguard MSCI Index International Shares ETF (VGS)", category: "international", threeYearCagr: 0.11, fiveYearCagr: 0.13, expenseRatio: 0.0018, risk: "medium", note: "Hedged developed-world equity ex-AU; common pair with VAS." },
    { name: "BetaShares Australia 200 ETF (A200)", category: "large_cap", threeYearCagr: 0.085, fiveYearCagr: 0.09, expenseRatio: 0.0004, risk: "medium", note: "Lower-cost ASX 200 tracker — competitor to VAS." },
    { name: "Vanguard Diversified High Growth Index ETF (VDHG)", category: "hybrid", threeYearCagr: 0.08, fiveYearCagr: 0.1, expenseRatio: 0.0027, risk: "high", note: "90/10 one-ticker diversified portfolio." },
    { name: "iShares S&P 500 ETF (IVV)", category: "large_cap", threeYearCagr: 0.105, fiveYearCagr: 0.14, expenseRatio: 0.0004, risk: "medium", note: "US S&P 500 exposure listed on ASX." },
    { name: "Vanguard Australian Fixed Interest Index (VAF)", category: "debt", threeYearCagr: -0.01, fiveYearCagr: 0.005, expenseRatio: 0.0015, risk: "low", note: "AUD-denominated investment-grade bond index." },
    { name: "Vanguard Australian Property Securities (VAP)", category: "etf", threeYearCagr: 0.03, fiveYearCagr: 0.05, expenseRatio: 0.0023, risk: "medium", note: "A-REIT basket for property income exposure." },
    { name: "Magellan Global Fund", category: "flexi_cap", threeYearCagr: 0.06, fiveYearCagr: 0.08, expenseRatio: 0.0135, risk: "medium", note: "Concentrated global equity fund; well-known Australian manager." },
    { name: "BetaShares Diversified All Growth ETF (DHHF)", category: "flexi_cap", threeYearCagr: 0.085, fiveYearCagr: 0.11, expenseRatio: 0.0019, risk: "high", note: "100% equity diversified one-ticker portfolio." },
    { name: "VanEck MSCI International Quality ETF (QUAL)", category: "international", threeYearCagr: 0.1, fiveYearCagr: 0.13, expenseRatio: 0.004, risk: "medium", note: "Global quality-factor equities." },
  ],

  DE: [
    { name: "iShares Core MSCI World UCITS ETF (SWDA)", category: "international", threeYearCagr: 0.09, fiveYearCagr: 0.11, expenseRatio: 0.002, risk: "medium", note: "Global developed equity — the German DIY default core." },
    { name: "Xtrackers MSCI World UCITS ETF", category: "international", threeYearCagr: 0.09, fiveYearCagr: 0.11, expenseRatio: 0.0019, risk: "medium", note: "Alternative MSCI World tracker from Xtrackers." },
    { name: "iShares Core DAX UCITS ETF", category: "large_cap", threeYearCagr: 0.075, fiveYearCagr: 0.08, expenseRatio: 0.0016, risk: "medium", note: "German blue-chip tracker." },
    { name: "Vanguard FTSE All-World UCITS ETF (VWCE)", category: "international", threeYearCagr: 0.08, fiveYearCagr: 0.1, expenseRatio: 0.0022, risk: "medium", note: "Accumulating global equity ETF — most popular German one-fund core." },
    { name: "iShares Core Euro Government Bond UCITS ETF", category: "debt", threeYearCagr: -0.02, fiveYearCagr: -0.005, expenseRatio: 0.0009, risk: "low", note: "Euro-area government bond tracker." },
    { name: "iShares MSCI Emerging Markets IMI UCITS ETF", category: "international", threeYearCagr: 0.02, fiveYearCagr: 0.04, expenseRatio: 0.0018, risk: "high", note: "EM equity exposure — diversification for global cores." },
    { name: "iShares STOXX Europe 600 UCITS ETF", category: "large_cap", threeYearCagr: 0.06, fiveYearCagr: 0.075, expenseRatio: 0.002, risk: "medium", note: "Broad European equity benchmark." },
    { name: "Xtrackers S&P 500 UCITS ETF", category: "large_cap", threeYearCagr: 0.105, fiveYearCagr: 0.14, expenseRatio: 0.0009, risk: "medium", note: "US large-cap exposure in EUR." },
    { name: "iShares Global Corp Bond UCITS ETF", category: "debt", threeYearCagr: 0.0, fiveYearCagr: 0.015, expenseRatio: 0.002, risk: "low", note: "Global investment-grade corporate bonds." },
    { name: "Lyxor MSCI World Information Technology ETF", category: "etf", threeYearCagr: 0.14, fiveYearCagr: 0.19, expenseRatio: 0.003, risk: "high", note: "Thematic global tech exposure for aggressive sleeves." },
  ],

  JP: [
    { name: "eMAXIS Slim All Country", category: "international", threeYearCagr: 0.11, fiveYearCagr: 0.14, expenseRatio: 0.0006, risk: "medium", note: "Low-cost global equity fund — dominant NISA / iDeCo choice." },
    { name: "eMAXIS Slim S&P 500", category: "large_cap", threeYearCagr: 0.13, fiveYearCagr: 0.17, expenseRatio: 0.0009, risk: "medium", note: "US S&P 500 tracker — another NISA crowd favourite." },
    { name: "Nomura TOPIX ETF", category: "large_cap", threeYearCagr: 0.12, fiveYearCagr: 0.09, expenseRatio: 0.0006, risk: "medium", note: "Core Japanese equity benchmark." },
    { name: "Nikkei 225 ETF (1321)", category: "large_cap", threeYearCagr: 0.13, fiveYearCagr: 0.1, expenseRatio: 0.0022, risk: "medium", note: "Nikkei-225 tracker for Japan equity exposure." },
    { name: "SBI All-Country Index", category: "international", threeYearCagr: 0.11, fiveYearCagr: 0.14, expenseRatio: 0.0011, risk: "medium", note: "Alternative to eMAXIS Slim All Country with slightly higher cost." },
    { name: "NEXT FUNDS TOPIX Core 30 ETF", category: "large_cap", threeYearCagr: 0.1, fiveYearCagr: 0.08, expenseRatio: 0.0008, risk: "medium", note: "Japan's 30 largest listed companies." },
    { name: "Japan Bond Index Fund", category: "debt", threeYearCagr: -0.005, fiveYearCagr: 0.0, expenseRatio: 0.0015, risk: "low", note: "Japanese government bond index — stability sleeve." },
    { name: "Rakuten VTI Fund", category: "large_cap", threeYearCagr: 0.13, fiveYearCagr: 0.165, expenseRatio: 0.0019, risk: "medium", note: "Wrapper around Vanguard's VTI for JPY investors." },
    { name: "NEXT FUNDS Nasdaq-100 ETF", category: "large_cap", threeYearCagr: 0.16, fiveYearCagr: 0.21, expenseRatio: 0.0022, risk: "high", note: "Nasdaq-100 exposure listed in JPY." },
    { name: "Nissay Nikkei 225 Index Fund", category: "index", threeYearCagr: 0.13, fiveYearCagr: 0.1, expenseRatio: 0.0014, risk: "medium", note: "Nissay's low-cost Nikkei 225 index fund." },
  ],

  MY: [
    { name: "Public Islamic Opportunities Fund", category: "flexi_cap", threeYearCagr: 0.06, fiveYearCagr: 0.07, expenseRatio: 0.015, risk: "medium", shariaCompliant: true, note: "Long-running Shariah equity fund from Public Mutual." },
    { name: "Amanah Saham Bumiputera (ASB)", category: "hybrid", threeYearCagr: 0.05, fiveYearCagr: 0.055, expenseRatio: 0.0, risk: "low", shariaCompliant: true, note: "Government-backed fixed-unit-price scheme; widely held by Malaysians." },
    { name: "Amanah Saham Malaysia (ASM)", category: "hybrid", threeYearCagr: 0.05, fiveYearCagr: 0.055, expenseRatio: 0.0, risk: "low", shariaCompliant: true, note: "Open to all Malaysians; similar structure to ASB." },
    { name: "FTSE Bursa Malaysia KLCI ETF (FBMKLCI-EA)", category: "large_cap", threeYearCagr: 0.05, fiveYearCagr: 0.04, expenseRatio: 0.005, risk: "medium", note: "Domestic large-cap index via an ETF listed on Bursa." },
    { name: "Principal Islamic Asia Pacific Equity Fund", category: "international", threeYearCagr: 0.06, fiveYearCagr: 0.08, expenseRatio: 0.016, risk: "high", shariaCompliant: true, note: "Shariah-compliant Asia-Pacific equity exposure." },
    { name: "Maybank Islamic Income-I Fund", category: "debt", threeYearCagr: 0.035, fiveYearCagr: 0.035, expenseRatio: 0.008, risk: "low", shariaCompliant: true, note: "Sukuk and Islamic money-market instruments." },
    { name: "RHB Islamic Bond Fund", category: "sukuk", threeYearCagr: 0.04, fiveYearCagr: 0.04, expenseRatio: 0.01, risk: "low", shariaCompliant: true, note: "Sukuk-focused fund for income and stability." },
    { name: "Kenanga Islamic Fund", category: "large_cap", threeYearCagr: 0.06, fiveYearCagr: 0.065, expenseRatio: 0.015, risk: "medium", shariaCompliant: true, note: "Actively managed Shariah Malaysian equity fund." },
    { name: "AmanahRaya Islamic REIT", category: "etf", threeYearCagr: 0.03, fiveYearCagr: 0.04, expenseRatio: 0.012, risk: "medium", shariaCompliant: true, note: "Shariah-compliant Malaysian REIT." },
    { name: "Public Mutual PB Growth Fund", category: "flexi_cap", threeYearCagr: 0.05, fiveYearCagr: 0.06, expenseRatio: 0.015, risk: "medium", note: "Conventional multi-cap Malaysian growth fund." },
  ],

  PH: [
    { name: "Sun Life Prosperity Philippine Equity Fund", category: "large_cap", threeYearCagr: 0.04, fiveYearCagr: 0.05, expenseRatio: 0.02, risk: "medium", note: "PSEi-focused large-cap mutual fund." },
    { name: "First Metro Philippine Equity ETF (FMETF)", category: "etf", threeYearCagr: 0.04, fiveYearCagr: 0.045, expenseRatio: 0.005, risk: "medium", note: "The only Philippine-equity ETF — PSEi tracker." },
    { name: "BPI Philippine Equity Index Fund", category: "index", threeYearCagr: 0.04, fiveYearCagr: 0.045, expenseRatio: 0.01, risk: "medium", note: "Low-cost PSEi tracker as a UITF." },
    { name: "BDO Equity Fund", category: "large_cap", threeYearCagr: 0.04, fiveYearCagr: 0.05, expenseRatio: 0.015, risk: "medium", note: "Actively managed Philippine equity UITF." },
    { name: "ATRAM Global Consumer Trends Feeder Fund", category: "international", threeYearCagr: 0.08, fiveYearCagr: 0.1, expenseRatio: 0.022, risk: "high", note: "Feeder into a global consumer-trends fund." },
    { name: "Sun Life Prosperity Dollar World Equity Index", category: "international", threeYearCagr: 0.09, fiveYearCagr: 0.11, expenseRatio: 0.017, risk: "medium", note: "USD-denominated MSCI World feeder." },
    { name: "BPI Short Term Fund", category: "debt", threeYearCagr: 0.04, fiveYearCagr: 0.035, expenseRatio: 0.006, risk: "low", note: "Short-term peso fixed income." },
    { name: "ALFM Peso Bond Fund", category: "debt", threeYearCagr: 0.04, fiveYearCagr: 0.035, expenseRatio: 0.009, risk: "low", note: "Peso-denominated government + corporate bond fund." },
    { name: "Philequity Fund", category: "flexi_cap", threeYearCagr: 0.05, fiveYearCagr: 0.055, expenseRatio: 0.015, risk: "medium", note: "Long-standing actively managed Philippine equity fund." },
    { name: "Philippine Stock Index Fund Corp (PSIF)", category: "index", threeYearCagr: 0.04, fiveYearCagr: 0.045, expenseRatio: 0.013, risk: "medium", note: "PSEi tracker mutual fund." },
  ],

  PK: [
    { name: "Al-Meezan Islamic Fund", category: "flexi_cap", threeYearCagr: 0.18, fiveYearCagr: 0.16, expenseRatio: 0.025, risk: "high", shariaCompliant: true, note: "Flagship Shariah equity fund from Pakistan's largest Islamic asset manager." },
    { name: "Meezan Islamic Income Fund", category: "sukuk", threeYearCagr: 0.15, fiveYearCagr: 0.12, expenseRatio: 0.012, risk: "low", shariaCompliant: true, note: "Shariah-compliant income fund — low volatility sleeve." },
    { name: "Al-Meezan Sovereign Fund", category: "debt", threeYearCagr: 0.15, fiveYearCagr: 0.115, expenseRatio: 0.0125, risk: "low", shariaCompliant: true, note: "Government Ijarah Sukuk focused — sovereign quality." },
    { name: "NIT-Islamic Equity Fund", category: "large_cap", threeYearCagr: 0.17, fiveYearCagr: 0.15, expenseRatio: 0.022, risk: "high", shariaCompliant: true, note: "Islamic equity fund from the National Investment Trust." },
    { name: "UBL Stock Advantage Fund", category: "large_cap", threeYearCagr: 0.16, fiveYearCagr: 0.14, expenseRatio: 0.025, risk: "high", note: "Conventional KSE-100 focused equity fund." },
    { name: "HBL Islamic Stock Fund", category: "flexi_cap", threeYearCagr: 0.17, fiveYearCagr: 0.14, expenseRatio: 0.025, risk: "high", shariaCompliant: true, note: "HBL's Shariah equity fund." },
    { name: "NIT Government Bond Fund", category: "debt", threeYearCagr: 0.155, fiveYearCagr: 0.12, expenseRatio: 0.012, risk: "low", note: "Pakistan government debt fund." },
    { name: "ABL Islamic Income Fund", category: "sukuk", threeYearCagr: 0.145, fiveYearCagr: 0.115, expenseRatio: 0.013, risk: "low", shariaCompliant: true, note: "Short-duration sukuk exposure." },
    { name: "MCB-Arif Habib Islamic Saving Fund", category: "debt", threeYearCagr: 0.14, fiveYearCagr: 0.11, expenseRatio: 0.012, risk: "low", shariaCompliant: true, note: "Islamic money-market fund." },
    { name: "Al-Meezan Pension Fund (Equity)", category: "large_cap", threeYearCagr: 0.17, fiveYearCagr: 0.15, expenseRatio: 0.018, risk: "high", shariaCompliant: true, note: "VPS equity sub-fund — tax-credit eligible." },
  ],

  BD: [
    { name: "ICB AMCL Islamic Mutual Fund", category: "large_cap", threeYearCagr: 0.07, fiveYearCagr: 0.08, expenseRatio: 0.015, risk: "medium", shariaCompliant: true, note: "Shariah-compliant equity fund from ICB AMCL." },
    { name: "DBH First Mutual Fund", category: "flexi_cap", threeYearCagr: 0.06, fiveYearCagr: 0.07, expenseRatio: 0.018, risk: "medium", note: "Closed-end equity fund listed on DSE." },
    { name: "VIPB Accelerated Income Unit Fund", category: "hybrid", threeYearCagr: 0.07, fiveYearCagr: 0.075, expenseRatio: 0.015, risk: "medium", note: "Open-end balanced fund from VIPB." },
    { name: "SEML Lecture Equity Management Fund", category: "large_cap", threeYearCagr: 0.065, fiveYearCagr: 0.07, expenseRatio: 0.02, risk: "medium", note: "Closed-end Bangladesh equity fund." },
    { name: "Popular Life First Mutual Fund", category: "flexi_cap", threeYearCagr: 0.065, fiveYearCagr: 0.07, expenseRatio: 0.018, risk: "medium", note: "Closed-end multi-cap fund." },
    { name: "LankaBangla Finance Liquidity Fund", category: "debt", threeYearCagr: 0.08, fiveYearCagr: 0.075, expenseRatio: 0.008, risk: "low", note: "Short-duration liquidity fund." },
    { name: "IFIL Islamic Mutual Fund-1", category: "large_cap", threeYearCagr: 0.07, fiveYearCagr: 0.07, expenseRatio: 0.018, risk: "medium", shariaCompliant: true, note: "Islamic multi-cap fund." },
    { name: "EBL NRB Mutual Fund", category: "flexi_cap", threeYearCagr: 0.06, fiveYearCagr: 0.07, expenseRatio: 0.018, risk: "medium", note: "NRB-focused equity fund." },
    { name: "Prime Bank 1st ICB A MF", category: "large_cap", threeYearCagr: 0.065, fiveYearCagr: 0.07, expenseRatio: 0.017, risk: "medium", note: "Closed-end equity fund." },
    { name: "Sanchayapatra (Pensioner)", category: "debt", threeYearCagr: 0.115, fiveYearCagr: 0.115, expenseRatio: 0.0, risk: "low", note: "Government savings certificate — preferential rates within caps." },
  ],

  EG: [
    { name: "CIB Equity Fund (Istithmar)", category: "large_cap", threeYearCagr: 0.2, fiveYearCagr: 0.18, expenseRatio: 0.02, risk: "high", note: "Long-standing Egyptian equity fund from CIB." },
    { name: "AAIB Money Market Fund", category: "debt", threeYearCagr: 0.2, fiveYearCagr: 0.15, expenseRatio: 0.005, risk: "low", note: "EGP-denominated money-market fund — benefits from high local rates." },
    { name: "Banque Misr First Equity Fund", category: "large_cap", threeYearCagr: 0.19, fiveYearCagr: 0.17, expenseRatio: 0.022, risk: "high", note: "Broad Egyptian equity exposure from Banque Misr." },
    { name: "NBE Fund 3 (Money Market)", category: "debt", threeYearCagr: 0.21, fiveYearCagr: 0.16, expenseRatio: 0.006, risk: "low", note: "Large, liquid money-market fund from National Bank of Egypt." },
    { name: "EFG Hermes Saudi Arabia Equity Fund", category: "international", threeYearCagr: 0.09, fiveYearCagr: 0.11, expenseRatio: 0.018, risk: "medium", note: "GCC equity exposure for diversification outside EGP." },
    { name: "Beltone Money Market Fund", category: "debt", threeYearCagr: 0.2, fiveYearCagr: 0.15, expenseRatio: 0.006, risk: "low", note: "Daily-liquidity EGP money market fund." },
    { name: "HC Money Market Fund", category: "debt", threeYearCagr: 0.2, fiveYearCagr: 0.15, expenseRatio: 0.006, risk: "low", note: "EGP money-market fund." },
    { name: "Al Ahli Islamic Investment Fund", category: "large_cap", threeYearCagr: 0.18, fiveYearCagr: 0.16, expenseRatio: 0.02, risk: "high", shariaCompliant: true, note: "Shariah-compliant Egyptian equity fund." },
    { name: "Commercial International Bank Gold Fund", category: "etf", threeYearCagr: 0.25, fiveYearCagr: 0.2, expenseRatio: 0.012, risk: "medium", note: "Gold-backed fund — useful EGP devaluation hedge." },
    { name: "EGX 30 Index Fund", category: "index", threeYearCagr: 0.19, fiveYearCagr: 0.17, expenseRatio: 0.01, risk: "high", note: "EGX 30 index exposure." },
  ],
};

export function getTopFunds(code: CountryCode): MutualFund[] {
  return fundCatalog[code] ?? [];
}

/** Rank funds by 5-year CAGR (falls back to 3-year) for a top-N view. */
export function topFundsByPerformance(code: CountryCode, limit = 10): MutualFund[] {
  return [...getTopFunds(code)]
    .sort((a, b) => {
      const aScore = a.fiveYearCagr || a.threeYearCagr;
      const bScore = b.fiveYearCagr || b.threeYearCagr;
      return bScore - aScore;
    })
    .slice(0, limit);
}
