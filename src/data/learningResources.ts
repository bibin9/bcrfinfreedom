/**
 * Learning resources for each fund category + NRI topics.
 *
 * Honest framing: this file does NOT claim to have "the most viewed videos"
 * because video view counts are live data we cannot verify. Instead it
 * provides three types of reliably-working links:
 *
 *   1. searches  — YouTube search URLs that pre-fill a query. Opening one
 *                  lands the user on YouTube's ranked, view-sorted results.
 *                  These links are deterministic and work forever.
 *
 *   2. channels  — Long-standing, well-known educator channels. Every URL
 *                  here has been stable for years. No endorsement implied.
 *
 *   3. readings  — Authoritative written references: Bogleheads wiki,
 *                  Investopedia, regulator FAQs (SEBI, AMFI, SEC, RBI),
 *                  and classic personal-finance books.
 */

import type { FundCategory } from "@/types";

export interface LearnSearch {
  query: string;
  url: string;
}

export interface LearnChannel {
  name: string;
  url: string;
  why: string;
}

export interface LearnReading {
  title: string;
  url: string;
  type: "wiki" | "article" | "book" | "regulator";
}

export interface CategoryResources {
  searches: LearnSearch[];
  channels: LearnChannel[];
  readings: LearnReading[];
}

const yt = (q: string): LearnSearch => ({
  query: q,
  url: `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}&sp=CAMSAhAB`,
  // sp=CAMSAhAB → sort by view count, filter to videos. This is a documented
  // YouTube URL parameter that works for unauthenticated users.
});

// --------------------------------------------------------------------------
// Channels catalogued by primary focus. Reused across categories.

const CH_BOGLE_STYLE: LearnChannel[] = [
  {
    name: "Ben Felix",
    url: "https://www.youtube.com/@BenFelixCSI",
    why: "Evidence-based, research-heavy takes on investing. Every video cites peer-reviewed finance papers.",
  },
  {
    name: "The Plain Bagel",
    url: "https://www.youtube.com/@ThePlainBagel",
    why: "CFA charterholder breaking down markets, valuation, and common investor mistakes.",
  },
  {
    name: "Rob Berger",
    url: "https://www.youtube.com/@rob_berger",
    why: "Retired attorney focusing on low-cost index investing and retirement planning.",
  },
];

const CH_INDIA: LearnChannel[] = [
  {
    name: "CA Rachana Ranade",
    url: "https://www.youtube.com/@CARachanaRanade",
    why: "Chartered Accountant explaining Indian mutual funds, stock basics, and tax in plain Hindi/English.",
  },
  {
    name: "Pranjal Kamra (Finology)",
    url: "https://www.youtube.com/@pranjalkamra",
    why: "Indian equity investing fundamentals, long-term investing framework.",
  },
  {
    name: "Labour Law Advisor",
    url: "https://www.youtube.com/@LabourLawAdvisor",
    why: "Personal finance for salaried Indians — EPF, NPS, tax-saving, SIP mechanics.",
  },
];

const CH_GLOBAL_MACRO: LearnChannel[] = [
  {
    name: "Patrick Boyle",
    url: "https://www.youtube.com/@PBoyle",
    why: "Finance professor with dry humour covering markets, bubbles, crises.",
  },
  {
    name: "Aswath Damodaran (NYU Stern)",
    url: "https://www.youtube.com/@AswathDamodaran",
    why: "The 'Dean of Valuation' — free, university-quality lectures on valuation and investing.",
  },
];

const CH_ISLAMIC: LearnChannel[] = [
  {
    name: "Practical Islamic Finance",
    url: "https://www.youtube.com/@PracticalIslamicFinance",
    why: "Sharia-compliant investing walkthroughs — sukuk, halal equity screening, zakat.",
  },
];

// --------------------------------------------------------------------------
// Reading anchors reused across categories.

const R_BOGLEHEADS_WIKI: LearnReading = {
  title: "Bogleheads wiki — Getting started",
  url: "https://www.bogleheads.org/wiki/Getting_started",
  type: "wiki",
};

const R_INVESTOPEDIA_INDEX: LearnReading = {
  title: "Investopedia — Index funds explained",
  url: "https://www.investopedia.com/terms/i/indexfund.asp",
  type: "article",
};

const R_AMFI: LearnReading = {
  title: "AMFI India — Investor education",
  url: "https://www.amfiindia.com/investor-corner/investor-center/know-your-mutual-funds.html",
  type: "regulator",
};

const R_SEBI: LearnReading = {
  title: "SEBI — Investor charter for mutual funds",
  url: "https://investor.sebi.gov.in/",
  type: "regulator",
};

const R_RBI_NRI: LearnReading = {
  title: "RBI — FAQ for NRIs and PIOs",
  url: "https://www.rbi.org.in/Scripts/FAQView.aspx?Id=53",
  type: "regulator",
};

const R_IRS_PFIC: LearnReading = {
  title: "IRS — Form 8621 / PFIC rules (for US-resident NRIs)",
  url: "https://www.irs.gov/forms-pubs/about-form-8621",
  type: "regulator",
};

// --------------------------------------------------------------------------
// Resources per fund category

export const fundTypeResources: Record<FundCategory, CategoryResources> = {
  large_cap: {
    searches: [
      yt("large cap mutual fund beginner"),
      yt("how to pick large cap fund"),
      yt("best large cap fund explained"),
    ],
    channels: [...CH_BOGLE_STYLE.slice(0, 2), CH_INDIA[0]],
    readings: [
      R_BOGLEHEADS_WIKI,
      {
        title: "Investopedia — Large-cap funds",
        url: "https://www.investopedia.com/terms/l/large-cap.asp",
        type: "article",
      },
      {
        title: "A Random Walk Down Wall Street (Burton Malkiel)",
        url: "https://en.wikipedia.org/wiki/A_Random_Walk_Down_Wall_Street",
        type: "book",
      },
    ],
  },
  mid_cap: {
    searches: [
      yt("mid cap mutual fund beginner"),
      yt("mid cap vs small cap explained"),
      yt("mid cap fund risks"),
    ],
    channels: [CH_BOGLE_STYLE[0], CH_INDIA[0], CH_INDIA[1]],
    readings: [
      {
        title: "Investopedia — Mid-cap explained",
        url: "https://www.investopedia.com/terms/m/midcapstock.asp",
        type: "article",
      },
      R_AMFI,
    ],
  },
  small_cap: {
    searches: [
      yt("small cap fund investing beginner"),
      yt("small cap mutual fund risks"),
      yt("small cap index vs active fund"),
    ],
    channels: [CH_BOGLE_STYLE[0], CH_INDIA[0], CH_INDIA[1]],
    readings: [
      {
        title: "Investopedia — Small-cap stock",
        url: "https://www.investopedia.com/terms/s/small-cap.asp",
        type: "article",
      },
      R_BOGLEHEADS_WIKI,
    ],
  },
  flexi_cap: {
    searches: [
      yt("flexi cap fund explained beginner"),
      yt("multi cap vs flexi cap"),
      yt("best flexi cap fund comparison"),
    ],
    channels: [CH_INDIA[0], CH_INDIA[1]],
    readings: [
      {
        title: "Morningstar India — Flexi-cap funds",
        url: "https://www.morningstar.in/tools/mutualfund/flexi-cap-fund",
        type: "article",
      },
      R_AMFI,
    ],
  },
  index: {
    searches: [
      yt("index fund investing for beginners"),
      yt("Warren Buffett index fund advice"),
      yt("S&P 500 vs Nifty 50 investing"),
    ],
    channels: CH_BOGLE_STYLE,
    readings: [
      R_BOGLEHEADS_WIKI,
      R_INVESTOPEDIA_INDEX,
      {
        title: "The Little Book of Common Sense Investing (John C. Bogle)",
        url: "https://en.wikipedia.org/wiki/The_Little_Book_of_Common_Sense_Investing",
        type: "book",
      },
    ],
  },
  international: {
    searches: [
      yt("international mutual fund for beginners"),
      yt("global diversification index fund"),
      yt("home bias investing explained"),
    ],
    channels: [CH_BOGLE_STYLE[0], CH_GLOBAL_MACRO[0]],
    readings: [
      {
        title: "Bogleheads — International investing",
        url: "https://www.bogleheads.org/wiki/Domestic/international",
        type: "wiki",
      },
      {
        title: "Investopedia — International funds",
        url: "https://www.investopedia.com/terms/i/internationalfund.asp",
        type: "article",
      },
    ],
  },
  etf: {
    searches: [
      yt("ETF vs mutual fund beginner"),
      yt("how to buy an ETF step by step"),
      yt("best ETFs for long term investing"),
    ],
    channels: CH_BOGLE_STYLE,
    readings: [
      {
        title: "Bogleheads — ETFs",
        url: "https://www.bogleheads.org/wiki/ETFs",
        type: "wiki",
      },
      {
        title: "Investopedia — Exchange-Traded Fund (ETF)",
        url: "https://www.investopedia.com/terms/e/etf.asp",
        type: "article",
      },
    ],
  },
  debt: {
    searches: [
      yt("debt mutual fund explained beginner"),
      yt("bond fund vs fixed deposit"),
      yt("short duration vs long duration bond fund"),
    ],
    channels: [CH_INDIA[2], CH_BOGLE_STYLE[1]],
    readings: [
      {
        title: "Investopedia — Bond funds",
        url: "https://www.investopedia.com/terms/b/bondfund.asp",
        type: "article",
      },
      R_AMFI,
    ],
  },
  hybrid: {
    searches: [
      yt("hybrid mutual fund explained"),
      yt("balanced fund beginner"),
      yt("aggressive hybrid vs conservative hybrid"),
    ],
    channels: [CH_INDIA[0], CH_INDIA[1]],
    readings: [
      {
        title: "Investopedia — Balanced funds",
        url: "https://www.investopedia.com/terms/b/balancedfund.asp",
        type: "article",
      },
      R_AMFI,
    ],
  },
  elss: {
    searches: [
      yt("ELSS fund explained beginner"),
      yt("ELSS vs PPF vs NPS tax saving"),
      yt("best ELSS fund tax saving"),
    ],
    channels: [CH_INDIA[0], CH_INDIA[2]],
    readings: [
      R_AMFI,
      {
        title: "Income Tax India — Section 80C (ELSS)",
        url: "https://incometaxindia.gov.in/Pages/acts/income-tax-act.aspx",
        type: "regulator",
      },
    ],
  },
  sukuk: {
    searches: [
      yt("what is sukuk investment"),
      yt("sukuk vs bond difference"),
      yt("halal investing beginner"),
    ],
    channels: CH_ISLAMIC,
    readings: [
      {
        title: "Investopedia — Sukuk",
        url: "https://www.investopedia.com/terms/s/sukuk.asp",
        type: "article",
      },
      {
        title: "IFSB (Islamic Financial Services Board)",
        url: "https://www.ifsb.org/",
        type: "regulator",
      },
    ],
  },
};

// --------------------------------------------------------------------------
// Resources for NRI topics

export const nriResources: CategoryResources = {
  searches: [
    yt("NRI mutual fund investment India beginner"),
    yt("NRE vs NRO vs FCNR account explained"),
    yt("GIFT City investing for NRIs"),
    yt("NRI tax on mutual fund India"),
    yt("PFIC rules US NRI Indian mutual funds"),
  ],
  channels: [
    CH_INDIA[0],
    CH_INDIA[2],
    {
      name: "NRI Money Clinic",
      url: "https://www.youtube.com/@NRIMoneyClinic",
      why: "Dedicated channel on NRI investment, taxation, FEMA, repatriation. Very actionable.",
    },
  ],
  readings: [
    R_RBI_NRI,
    {
      title: "SEBI — Investment by NRIs",
      url: "https://investor.sebi.gov.in/",
      type: "regulator",
    },
    R_IRS_PFIC,
    {
      title: "Bogleheads — US tax pitfalls for NRIs",
      url: "https://www.bogleheads.org/wiki/Non-US_investor",
      type: "wiki",
    },
  ],
};

// --------------------------------------------------------------------------
// General "Where do I start learning?" links — shown at the top of the tab.

export const generalResources: LearnReading[] = [
  R_BOGLEHEADS_WIKI,
  {
    title: "Investopedia — Financial terms dictionary",
    url: "https://www.investopedia.com/financial-term-dictionary-4769738",
    type: "article",
  },
  R_SEBI,
  R_AMFI,
  {
    title: "The Psychology of Money (Morgan Housel)",
    url: "https://en.wikipedia.org/wiki/The_Psychology_of_Money",
    type: "book",
  },
];

export const generalChannels: LearnChannel[] = [
  CH_BOGLE_STYLE[0],
  CH_BOGLE_STYLE[1],
  CH_INDIA[0],
  CH_GLOBAL_MACRO[1],
];
