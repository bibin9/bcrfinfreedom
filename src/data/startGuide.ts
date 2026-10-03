/**
 * Beginner-first investment guide.
 *
 * Two pieces of data:
 *
 *   1. fundTypeGuides
 *        Plain-English explainers for every fund category — what it is,
 *        what you could earn, the risks, who it suits, minimum ticket size,
 *        and lock-in rules. No jargon. A 16-year-old should understand this.
 *
 *   2. startSteps
 *        Country-specific, numbered step-by-step on how to *actually begin*
 *        investing — which documents, which platforms, which ticket size.
 *        These reference real platforms that a typical retail investor in
 *        each country would use. Platform names are illustrative, not
 *        recommendations.
 */
import type { CountryCode, FundCategory } from "@/types";

export interface FundTypeGuide {
  category: FundCategory;
  label: string;
  /** 1-line plain-English summary — the "cocktail party" version. */
  whatItIs: string;
  /** How the growth actually happens (no jargon). */
  howItWorks: string;
  /** Typical yearly return expectation over 5+ years, in everyday words. */
  expectedGrowth: string;
  /** Honest risk picture — worst-case drawdown in beginner terms. */
  risk: string;
  /** Who this is best suited for. */
  whoItIsFor: string;
  /** Typical minimum monthly SIP or lump sum (generic, not country-specific). */
  minimum: string;
  /** Any lock-in or withdrawal penalty to know about. */
  lockIn: string;
}

export const fundTypeGuides: FundTypeGuide[] = [
  {
    category: "large_cap",
    label: "Large-Cap Funds (big companies)",
    whatItIs:
      "A fund that buys shares of the biggest, most established companies in your country — the household names.",
    howItWorks:
      "When those companies earn profits and grow, your share of the fund grows with them. You also receive a cut of their dividends, automatically reinvested.",
    expectedGrowth: "About 10–14% a year on average, over 7+ years.",
    risk:
      "Medium. In a bad year, the fund can fall 20–30%. But it usually recovers within 2–3 years. These are the safest stocks you can own.",
    whoItIsFor:
      "First-time equity investors. If you're new to stocks, start here — it's the least scary way to begin.",
    minimum: "Typically the equivalent of $10–$50 per month.",
    lockIn: "None for most. You can sell anytime, though selling within a year often means higher tax.",
  },
  {
    category: "mid_cap",
    label: "Mid-Cap Funds (growing companies)",
    whatItIs:
      "Companies that are past the startup stage but not yet giants — often the future big names.",
    howItWorks:
      "These companies are growing faster than the giants, so their share prices often rise quicker — but they also fall harder when things go wrong.",
    expectedGrowth: "About 13–17% a year on average, over 8+ years.",
    risk:
      "Higher. In a bad year, a mid-cap fund can fall 30–40%. You need patience and at least 7–10 years for this to work.",
    whoItIsFor:
      "Investors who can stomach a rough year and stay invested. Best layered on top of large-caps, not instead of them.",
    minimum: "Equivalent of $10–$50 per month.",
    lockIn: "None; but plan to hold for at least 7 years.",
  },
  {
    category: "small_cap",
    label: "Small-Cap Funds (early-stage companies)",
    whatItIs:
      "Smaller, earlier-stage listed companies. Some will become the next big thing. Many will stagnate.",
    howItWorks:
      "The fund manager spreads your money across dozens of small companies so winners compensate for losers.",
    expectedGrowth: "About 15–20% a year on average, over 10+ years — with wild swings.",
    risk:
      "High. In a bad year, small-caps can fall 40–50%. It takes 10+ years for the math to work in your favour.",
    whoItIsFor:
      "Investors who won't check their account every week and can commit 10+ years. Cap it at 10–20% of your equity.",
    minimum: "Equivalent of $10–$50 per month.",
    lockIn: "None; plan to hold for at least 10 years.",
  },
  {
    category: "flexi_cap",
    label: "Flexi-Cap / Multi-Cap Funds (mixed sizes)",
    whatItIs:
      "One fund that holds a mix of large, medium, and small companies — the manager decides the split.",
    howItWorks:
      "When large-caps are expensive, the manager shifts to smaller companies, and vice versa. You don't have to decide.",
    expectedGrowth: "About 12–15% a year on average, over 7+ years.",
    risk: "Medium. Risk floats between large-cap and mid-cap depending on current mix.",
    whoItIsFor:
      "Investors who want one fund and don't want to pick between large/mid/small themselves.",
    minimum: "Equivalent of $10–$50 per month.",
    lockIn: "None.",
  },
  {
    category: "index",
    label: "Index Funds (the whole market)",
    whatItIs:
      "A fund that simply copies the main stock index of your country — you own a tiny slice of every major listed company.",
    howItWorks:
      "No fund manager picking stocks. The fund mirrors the index, which is why the fee is tiny — usually 0.1–0.3% a year.",
    expectedGrowth: "About 10–13% a year on average, over 10+ years. Matches the market, doesn't beat it.",
    risk: "Medium — same as the overall market. Falls 20–30% in bad years, recovers.",
    whoItIsFor:
      "Anyone, especially beginners. Warren Buffett recommends this for most people. You'll beat 80% of active funds over 20 years by being boring.",
    minimum: "Equivalent of $10 per month.",
    lockIn: "None.",
  },
  {
    category: "international",
    label: "International Funds (global diversification)",
    whatItIs:
      "A fund that invests in companies outside your country — US tech, European consumer, Japanese industrial, and more.",
    howItWorks:
      "When your home market struggles but other markets do well, this sleeve balances you out. Also protects you from a weakening local currency.",
    expectedGrowth: "About 8–14% a year on average (in your local currency) over 7+ years.",
    risk: "Medium. Currency moves can amplify or dampen returns in the short term.",
    whoItIsFor:
      "Any investor who doesn't want all their money tied to one country's economy.",
    minimum: "Equivalent of $20 per month.",
    lockIn: "None.",
  },
  {
    category: "etf",
    label: "ETFs (Exchange-Traded Funds)",
    whatItIs:
      "Think of an ETF as an index fund that you buy and sell like a share on the stock exchange.",
    howItWorks:
      "You buy an ETF unit through a broker app at the live market price. Fees are very low — often 0.03–0.2% a year.",
    expectedGrowth: "Depends on what the ETF tracks. For a broad market ETF, about 10–13% a year.",
    risk: "Same as what it tracks (stocks, bonds, gold, etc.).",
    whoItIsFor:
      "Investors who already have a brokerage account and want the lowest-cost exposure to an index.",
    minimum: "One unit (typically $20–$400 depending on the ETF).",
    lockIn: "None.",
  },
  {
    category: "debt",
    label: "Debt / Bond Funds (lending money)",
    whatItIs:
      "Instead of owning companies, you lend money to governments or companies, and they pay you interest.",
    howItWorks:
      "The fund collects interest from hundreds of bonds and passes it back to you. More stable than stocks, but lower growth.",
    expectedGrowth: "About 5–8% a year on average.",
    risk:
      "Low to medium. Short-duration funds barely move; long-duration funds can drop 5–10% if interest rates rise.",
    whoItIsFor:
      "The 'safe money' part of your portfolio. Emergency fund, short-term goals (1–5 years), or the stability part of a long-term plan.",
    minimum: "Equivalent of $10 per month.",
    lockIn: "None for most; some may have small exit loads if sold within a year.",
  },
  {
    category: "hybrid",
    label: "Hybrid Funds (stocks + bonds in one)",
    whatItIs:
      "One fund that holds both stocks and bonds for you — a ready-made balanced portfolio.",
    howItWorks:
      "The manager keeps a fixed ratio (say 70% stocks, 30% bonds) and rebalances automatically when markets move.",
    expectedGrowth: "About 9–12% a year on average, over 5+ years.",
    risk:
      "Medium but smoother than pure stock funds — bonds cushion the drops.",
    whoItIsFor:
      "People who want a one-fund portfolio and don't want to rebalance themselves.",
    minimum: "Equivalent of $10–$50 per month.",
    lockIn: "None.",
  },
  {
    category: "elss",
    label: "ELSS / Tax-Saving Equity Funds",
    whatItIs:
      "A stock mutual fund that also gives you tax relief on what you invest, up to a legal limit.",
    howItWorks:
      "You put money in and claim a tax deduction on it; the money stays locked for 3 years and grows like any equity fund.",
    expectedGrowth: "About 10–14% a year on average.",
    risk:
      "Same as a large or multi-cap fund — 20–30% drops possible in a bad year.",
    whoItIsFor:
      "Salaried people in countries with a tax deduction for equity investments (e.g. India's section 80C).",
    minimum: "Country-dependent; usually tiny.",
    lockIn: "3 years typically — shortest among tax-saving instruments.",
  },
  {
    category: "sukuk",
    label: "Sukuk (Sharia-compliant bonds)",
    whatItIs:
      "An Islamic-finance equivalent of bonds. Instead of paying interest, the issuer shares asset-backed profits with you.",
    howItWorks:
      "Each sukuk is backed by real assets (property, infrastructure). Returns come from rents or project revenue, not interest.",
    expectedGrowth: "About 4–7% a year on average.",
    risk: "Low to medium; similar to investment-grade bonds.",
    whoItIsFor:
      "Muslim investors who want a Sharia-compliant replacement for conventional bonds.",
    minimum: "Varies by country — often $100+ per purchase.",
    lockIn: "Typically held to maturity for best results, but tradeable.",
  },
];

// ----------------------------------------------------------------------------
// Country-specific start-investing flows

export interface StartStep {
  title: string;
  detail: string;
}

export interface CountryStartGuide {
  /** One-line summary of the local investment landscape in plain language. */
  intro: string;
  /** The platform names typical beginners use in this country. */
  platforms: string[];
  /** 5-step numbered start flow. */
  steps: StartStep[];
  /** Extra one-liner the user should know. */
  note: string;
}

export const startGuides: Record<CountryCode, CountryStartGuide> = {
  IN: {
    intro:
      "In India, you invest through Mutual Funds or ETFs. Everything is online and KYC-verified. Most people start with a monthly SIP of ₹1,000–₹5,000.",
    platforms: ["Zerodha Coin", "Groww", "Kuvera", "ETMoney", "MF Central"],
    steps: [
      {
        title: "Get your PAN + Aadhaar ready",
        detail:
          "You need a PAN card, Aadhaar-linked mobile number, and a bank account. Everyone in India uses these.",
      },
      {
        title: "Complete KYC once (10 minutes, online)",
        detail:
          "On Groww or Zerodha, upload PAN, Aadhaar, a selfie, and sign with OTP. One KYC works across all fund houses.",
      },
      {
        title: "Pick ONE index fund to start",
        detail:
          "Before you buy 5 funds, start with one — e.g. UTI Nifty 50 Index or HDFC Sensex Index. Add ₹2,000/month as a SIP.",
      },
      {
        title: "Set up auto-SIP on salary day",
        detail:
          "The app will ask for e-NACH bank authorisation — allow it. Your money invests on its own every month.",
      },
      {
        title: "Review once a year, not every week",
        detail:
          "Check your portfolio in April. Increase SIP by 10% every year, and add a new fund only after the first is running smoothly.",
      },
    ],
    note: "For tax-saving, use an ELSS fund (3-year lock-in, 80C deduction up to ₹1.5 lakh).",
  },
  US: {
    intro:
      "In the US, most people invest through a brokerage or retirement account. ETFs and index funds dominate. Even $50/week into VTI builds serious wealth.",
    platforms: ["Fidelity", "Vanguard", "Charles Schwab", "Robinhood"],
    steps: [
      {
        title: "Max your employer 401(k) match first",
        detail:
          "If your employer matches 4% of salary, contribute at least that. This is free money — never skip it.",
      },
      {
        title: "Open a Roth IRA (if eligible)",
        detail:
          "Fidelity or Schwab — takes 5 minutes. Contribute up to $7,000/year (2025 limit). Tax-free growth forever.",
      },
      {
        title: "Pick ONE ETF to start",
        detail:
          "VTI (whole US market) or VOO (S&P 500). One purchase covers hundreds of companies. Expense ratio ~0.03%.",
      },
      {
        title: "Set up automatic weekly or monthly buys",
        detail:
          "Most brokers let you auto-invest a fixed dollar amount. Start with $200–$500/month.",
      },
      {
        title: "Review once a year",
        detail:
          "Don't obsess over weekly moves. Add international (VXUS) and bonds (BND) as you grow.",
      },
    ],
    note: "If you're self-employed, look into a SEP-IRA or Solo 401(k) for much higher contribution limits.",
  },
  GB: {
    intro:
      "In the UK, the magic word is ISA — Individual Savings Account. Everything inside is tax-free forever. £20,000/year limit.",
    platforms: ["Vanguard Investor", "Hargreaves Lansdown", "AJ Bell", "InvestEngine", "Trading 212"],
    steps: [
      {
        title: "Open a Stocks & Shares ISA",
        detail:
          "Vanguard Investor is the cheapest (0.15% platform fee, capped at £375/yr). Takes 10 minutes online.",
      },
      {
        title: "Pick ONE global fund to start",
        detail:
          "Vanguard FTSE Global All Cap or LifeStrategy 80% — one fund = entire world's stock market.",
      },
      {
        title: "Set up monthly Direct Debit",
        detail:
          "£100–£500/month is a solid start. Vanguard's minimum is £100 lump sum or £100/month.",
      },
      {
        title: "Open a SIPP for retirement",
        detail:
          "Separate pension account — the government tops up 20% on what you put in (40% if higher-rate taxpayer).",
      },
      {
        title: "Review in April before new tax year",
        detail:
          "Use up the year's ISA allowance, then repeat.",
      },
    ],
    note: "Your workplace pension is already an investment — check what fund it's in and increase your contribution above the minimum match.",
  },
  CA: {
    intro:
      "In Canada, you have two tax-sheltered accounts — TFSA (tax-free forever) and RRSP (tax-deferred). Use both.",
    platforms: ["Questrade", "Wealthsimple", "TD Direct Investing", "Scotia iTRADE"],
    steps: [
      {
        title: "Open a TFSA at Wealthsimple or Questrade",
        detail:
          "Free to open. 2025 contribution limit is $7,000. Unused room rolls over forever.",
      },
      {
        title: "Pick ONE all-in-one ETF",
        detail:
          "VGRO (80% stocks/20% bonds) or VEQT (100% stocks) — one ticker = whole portfolio, rebalanced automatically.",
      },
      {
        title: "Set up bi-weekly auto-deposits",
        detail:
          "Link your bank, set a fixed amount every payday. Even C$100/week adds up to C$5,200/year.",
      },
      {
        title: "Open an RRSP for employer-match and tax refund",
        detail:
          "Contribute up to 18% of income; you get an income-tax refund on what you put in.",
      },
      {
        title: "Review yearly around tax season",
        detail:
          "Top up both accounts before the RRSP deadline (usually March 1).",
      },
    ],
    note: "Wealthsimple Trade lets you buy ETFs with zero commission — great for small monthly contributions.",
  },
  AU: {
    intro:
      "Every working Australian already has super (retirement). On top of that, ETFs through a broker are the standard way to invest.",
    platforms: ["CommSec", "SelfWealth", "Pearler", "Stake", "Raiz"],
    steps: [
      {
        title: "Check and optimise your super",
        detail:
          "Log in to your super fund. If you're in the default balanced fund under 40, switch to a high-growth option. Consider salary-sacrificing extra.",
      },
      {
        title: "Open a CHESS-sponsored broker account",
        detail:
          "SelfWealth or Pearler — flat A$9.50/trade. Takes 10 minutes with your TFN.",
      },
      {
        title: "Pick ONE Aussie + ONE global ETF",
        detail:
          "VAS (Australia 300) + VGS (world ex-Australia). A classic 2-fund core.",
      },
      {
        title: "Auto-invest A$500+ per month",
        detail:
          "Pearler has a 'Finance' auto-invest feature that buys on schedule for a flat fee.",
      },
      {
        title: "Rebalance once a year",
        detail:
          "If stocks have run hard, add more to whichever is lagging.",
      },
    ],
    note: "Voluntary super contributions are tax-advantaged (concessional cap ~A$30,000/yr) — an easy win.",
  },
  SG: {
    intro:
      "Singapore investors start with a brokerage for SGX and US stocks, plus CPF-linked funds. Low tax means every dollar compounds harder.",
    platforms: ["Tiger Brokers", "Moomoo", "FSMOne", "Endowus", "SAXO"],
    steps: [
      {
        title: "Maximise CPF contributions via CPF Top-Up",
        detail:
          "Voluntary top-ups earn 4% risk-free and give you a tax deduction up to S$8,000/yr.",
      },
      {
        title: "Open a broker account",
        detail:
          "Moomoo or Tiger — zero commission for SGX stocks, low FX fees for US ETFs. Needs SingPass.",
      },
      {
        title: "Pick a core-and-satellite combo",
        detail:
          "CSPX (S&P 500 UCITS) + ES3 (STI ETF) or VWRA (global all-world). Accumulating UCITS avoids US estate tax.",
      },
      {
        title: "Set up monthly SIP via Endowus or FSMOne",
        detail:
          "Endowus gives cash and CPF investing in one place with a low platform fee.",
      },
      {
        title: "Review annually, not quarterly",
        detail:
          "Increase SIP by 5–10% every salary review.",
      },
    ],
    note: "Use CPF-OA to buy approved unit trusts via CPFIS — but only if the fund's return beats the 2.5% OA rate.",
  },
  DE: {
    intro:
      "In Germany, low-cost ETF Sparpläne (monthly savings plans) are the backbone of retail investing. Most brokers let you start with €1.",
    platforms: ["Scalable Capital", "Trade Republic", "Comdirect", "DKB", "ING"],
    steps: [
      {
        title: "Open a Depot (brokerage account)",
        detail:
          "Scalable Capital (Prime Broker) or Trade Republic — free account, €1 per trade.",
      },
      {
        title: "Set your Freistellungsauftrag",
        detail:
          "Exempt €1,000/yr of capital gains from tax automatically by telling the broker.",
      },
      {
        title: "Pick ONE world ETF",
        detail:
          "iShares Core MSCI World (IE00B4L5Y983) or Vanguard FTSE All-World (IE00BK5BQT80). Accumulating for tax efficiency.",
      },
      {
        title: "Start an ETF-Sparplan of €100–€500/month",
        detail:
          "Auto-buys on the 1st or 15th every month. You can pause, change, or stop anytime — no lock-in.",
      },
      {
        title: "Review once a year",
        detail:
          "Add a bond ETF (e.g. Xtrackers Eurozone Government Bond) when your stock portfolio exceeds €50k.",
      },
    ],
    note: "Your Riester- or Rürup-Rente may look simple but has high fees — compare against a pure ETF plan.",
  },
  JP: {
    intro:
      "Japan's NISA and iDeCo are tax-free wrappers that make equity investing very efficient. Low-cost index funds dominate.",
    platforms: ["SBI Shoken", "Rakuten Shoken", "Matsui Securities", "Monex"],
    steps: [
      {
        title: "Open a NISA account",
        detail:
          "The new (2024+) NISA allows ¥3.6M/year contributions, tax-free growth forever. SBI or Rakuten in 20 minutes online.",
      },
      {
        title: "Pick a low-cost global index fund",
        detail:
          "eMAXIS Slim All-Country (オールカントリー) or eMAXIS Slim S&P 500. Expense ratio ~0.05%.",
      },
      {
        title: "Set up Tsumitate (monthly investment)",
        detail:
          "Auto-buy ¥30,000–¥100,000 per month. Rakuten Card users can pay via credit card and earn points.",
      },
      {
        title: "Open iDeCo for retirement",
        detail:
          "Extra ¥23,000/month cap, fully tax-deductible contributions. Locked until age 60.",
      },
      {
        title: "Review every tax year",
        detail:
          "Max both NISA and iDeCo if you can; lift the Tsumitate when salary grows.",
      },
    ],
    note: "Avoid 'high-cost' managed balance funds (バランスファンド) at banks — fees eat most of your return.",
  },
  AE: {
    intro:
      "Residents of the UAE have zero personal income tax. That means 100% of your returns are yours — but there's no local tax-advantaged wrapper, so use global brokers.",
    platforms: ["Sarwa", "StashAway MENA", "Baraka", "Interactive Brokers"],
    steps: [
      {
        title: "Build a 6-month emergency fund first",
        detail:
          "Expats have less safety net. Keep 6 months of expenses in a high-yield savings account before investing.",
      },
      {
        title: "Sign up on a regulated robo-advisor",
        detail:
          "Sarwa (ADGM-regulated) or StashAway — link your Emirates ID and bank. 5-minute KYC.",
      },
      {
        title: "Pick a global portfolio based on risk",
        detail:
          "Both platforms build a diversified ETF portfolio for you. A Sharia-compliant version exists.",
      },
      {
        title: "Auto-transfer AED 1,000–5,000 per month",
        detail:
          "Standing instruction from your bank. Most people start right after salary day.",
      },
      {
        title: "Plan for 'one day I'll leave'",
        detail:
          "Use a broker that works globally (e.g. Interactive Brokers) so portability isn't a problem.",
      },
    ],
    note: "DIFC / ADGM residents can access savings plans (Zurich, Friends Provident) — check the fees very carefully; some are punitive.",
  },
  SA: {
    intro:
      "Saudi Arabia offers a strong Sharia-compliant ecosystem. Most investing happens through local banks' brokerage arms, plus Sharia equity funds.",
    platforms: ["Al Rajhi Capital", "SNB Capital", "Derayah Financial", "Riyad Capital"],
    steps: [
      {
        title: "Open a local brokerage account",
        detail:
          "Al Rajhi Capital or SNB Capital — use Absher for e-KYC. Takes a working day.",
      },
      {
        title: "Pick a Sharia-compliant equity fund",
        detail:
          "Al Rajhi Saudi Equity Fund or SNB Al Raed — invests in Shariah-screened Saudi and GCC companies.",
      },
      {
        title: "Add a Sukuk fund for stability",
        detail:
          "Al Rajhi Sukuk Fund — the Shariah-compliant alternative to bond funds.",
      },
      {
        title: "Set up monthly standing order",
        detail:
          "Even SAR 1,000/month becomes meaningful in 10 years.",
      },
      {
        title: "Review annually and rebalance",
        detail:
          "Tadawul has grown sharply; trim to target when any one sector dominates.",
      },
    ],
    note: "The GOSI pension is automatic for Saudis; expats should plan private retirement savings outside the kingdom too.",
  },
  MY: {
    intro:
      "Malaysia's EPF is the foundation. Above that, low-cost unit trusts and ETFs on Bursa build long-term wealth.",
    platforms: ["Rakuten Trade", "Moomoo MY", "Versa", "StashAway MY", "Public Mutual"],
    steps: [
      {
        title: "Keep contributing to EPF (or top-up voluntarily)",
        detail:
          "EPF gives a guaranteed ~5–6% and tax-advantaged. i-Saraan top-ups are eligible for tax relief.",
      },
      {
        title: "Open a Rakuten Trade or Moomoo account",
        detail:
          "Lowest commissions for Bursa Malaysia and US stocks. Fully online KYC via MyKad.",
      },
      {
        title: "Pick a global + Malaysia ETF combo",
        detail:
          "MYETF-DJUSA (US exposure) + MYETF-MSEMAS (Malaysia large-cap) — or Principal FTSE ASEAN 40.",
      },
      {
        title: "Start a monthly SIP via Versa or StashAway",
        detail:
          "RM 200–RM 1,000/month. Both provide Shariah-compliant portfolios too.",
      },
      {
        title: "Use PRS for tax relief",
        detail:
          "Private Retirement Scheme — RM 3,000/yr tax deduction; Affin Hwang and Principal have solid options.",
      },
    ],
    note: "Unit trusts sold at bank branches often charge 5% upfront — online platforms almost always waive it.",
  },
  PH: {
    intro:
      "In the Philippines, start with an online broker or mutual fund app. Pag-IBIG MP2 is a stealth gem — government-backed, 6%+ tax-free.",
    platforms: ["COL Financial", "First Metro Sec", "BPI Trade", "GInvest", "Seedbox"],
    steps: [
      {
        title: "Open a Pag-IBIG MP2 account",
        detail:
          "Voluntary, 5-year lock, 6–8% tax-free annual return. One of the best low-risk deals in the country.",
      },
      {
        title: "Open an online brokerage",
        detail:
          "COL Financial or First Metro Sec — online KYC with valid ID.",
      },
      {
        title: "Pick a core index fund",
        detail:
          "First Metro PSE Index Tracker Fund (FAMI-PIFI) or BPI Equity Index Fund.",
      },
      {
        title: "Auto-invest via GInvest",
        detail:
          "Start with as little as PHP 50. Diversifies across ATRAM's mutual funds.",
      },
      {
        title: "Review every 6 months",
        detail:
          "Raise contributions after each salary increase.",
      },
    ],
    note: "Always check fund management fees — some Philippine UITFs charge 1.5%+ yearly which eats returns.",
  },
  PK: {
    intro:
      "In Pakistan, invest via regulated asset-management companies or the PSX. Islamic (Sharia-compliant) options are widely available.",
    platforms: ["Meezan Asset Mgmt", "NBP Funds", "UBL Funds", "KTrade", "Foree"],
    steps: [
      {
        title: "Open an investor account with an AMC",
        detail:
          "Meezan or NBP — online KYC using your CNIC. No minimum balance for most plans.",
      },
      {
        title: "Pick an Islamic equity fund",
        detail:
          "Meezan Islamic Fund (MIF) or NBP Islamic Stock Fund — diversified across Sharia-screened KSE-100 names.",
      },
      {
        title: "Add an Islamic income fund",
        detail:
          "For the stable part of your portfolio — e.g. Meezan Islamic Income Fund.",
      },
      {
        title: "Set up a standing instruction",
        detail:
          "Even PKR 3,000/month is a real start. Use the app to auto-invest.",
      },
      {
        title: "Use VPS for tax relief",
        detail:
          "Voluntary Pension Scheme contributions reduce taxable income — long-term retirement wrapper.",
      },
    ],
    note: "Inflation in Pakistan runs 10%+ — keep emergency cash in a money-market fund, not a regular savings account.",
  },
  BD: {
    intro:
      "Bangladesh's capital market is developing. Most people start with mutual funds from asset-management companies, plus DPS at banks.",
    platforms: ["BRAC EPL", "IDLC Asset Management", "LankaBangla", "UCB Asset Mgmt"],
    steps: [
      {
        title: "Open a DPS (Deposit Pension Scheme)",
        detail:
          "At any bank — fixed monthly deposits, 7–9% annual interest. Simple, low-risk, government-backed banks.",
      },
      {
        title: "Open a BO (Beneficial Owner) account",
        detail:
          "Through BRAC EPL or LankaBangla. Needed to invest in mutual funds and DSE shares.",
      },
      {
        title: "Pick a diversified mutual fund",
        detail:
          "IDLC Balanced Fund or UCB AMCL First Mutual Fund.",
      },
      {
        title: "Set up a monthly SIP",
        detail:
          "Bangladesh's SIP culture is small but growing — start at BDT 1,000/month.",
      },
      {
        title: "Diversify slowly over time",
        detail:
          "Add DSE index-tracking funds as your corpus grows.",
      },
    ],
    note: "Political and currency risks are real here — don't put more than 50% of net worth into Bangladeshi assets long-term.",
  },
  EG: {
    intro:
      "Egypt has high inflation, so it's critical to invest rather than hold cash. Equity funds and certificates from state banks are the most common start points.",
    platforms: ["CIB Asset Mgmt", "Beltone", "HC Securities", "EFG Hermes One"],
    steps: [
      {
        title: "Park emergency cash in a high-yield certificate",
        detail:
          "Government banks (NBE, Banque Misr) offer 20%+ annual certificates. Use for the stability part.",
      },
      {
        title: "Open a brokerage account",
        detail:
          "EFG Hermes One or CIB Capital — online KYC with national ID.",
      },
      {
        title: "Pick an Egyptian equity fund",
        detail:
          "CIB Aman Fund (Sharia-compliant) or Beltone Egyptian Equity Fund.",
      },
      {
        title: "Add a US-dollar component",
        detail:
          "Through an international broker (e.g. Interactive Brokers) to hedge Egyptian pound weakness.",
      },
      {
        title: "Review every 6 months",
        detail:
          "FX moves are large — rebalance when one sleeve drifts heavily.",
      },
    ],
    note: "Prioritise FX diversification — keeping all your wealth in EGP is the single biggest risk for Egyptian investors right now.",
  },
};
