/**
 * Curated growth-sector data for the Growing Markets Dashboard.
 *
 * For the MVP we use a small, hand-curated set of global themes plus a
 * country-specific local theme set. Numbers are illustrative long-run growth
 * expectations, not live market data. The dashboard shows a "last updated"
 * timestamp (see `GROWTH_SECTORS_UPDATED_AT`) to make this clear.
 */

import type { CountryCode, GrowthSector } from "@/types";

export const GROWTH_SECTORS_UPDATED_AT = "2025-Q4";

export const globalGrowthSectors: GrowthSector[] = [
  {
    name: "Artificial Intelligence & Semiconductors",
    scope: "global",
    growthPercent: 28,
    rationale:
      "Structural tailwind from generative AI adoption across enterprise software, chips, and cloud infrastructure.",
  },
  {
    name: "Clean & Renewable Energy",
    scope: "global",
    growthPercent: 14,
    rationale:
      "Policy-driven capex cycle (IRA, EU Green Deal, GCC net-zero targets) funds solar, grid storage, and transmission.",
  },
  {
    name: "Healthcare & GLP-1 / Biotech",
    scope: "global",
    growthPercent: 11,
    rationale:
      "Aging populations plus breakthrough weight-loss / oncology drugs expand the addressable pharma market.",
  },
];

export const localGrowthSectors: Record<CountryCode, GrowthSector[]> = {
  AE: [
    { name: "MENA Fintech & Digital Banking", scope: "local", growthPercent: 22, rationale: "Open-banking frameworks, neobanks, and cross-border remittance platforms scaling across the GCC." },
    { name: "UAE Real Estate & REITs", scope: "local", growthPercent: 12, rationale: "Population inflow and investor-visa programs continue to push Dubai/Abu Dhabi rental yields." },
    { name: "Logistics & Trade Hubs", scope: "local", growthPercent: 9, rationale: "UAE positioning as a re-export hub and a key node on the India-Middle East-Europe Economic Corridor." },
  ],
  SA: [
    { name: "Giga-Projects & Construction", scope: "local", growthPercent: 18, rationale: "Vision 2030 funded NEOM / Red Sea / Qiddiya drive a multi-decade construction cycle." },
    { name: "Saudi Tourism & Entertainment", scope: "local", growthPercent: 15, rationale: "Liberalisation of tourism visas and entertainment licensing expands a previously closed sector." },
    { name: "Green Hydrogen & Solar", scope: "local", growthPercent: 14, rationale: "PIF-backed renewable capacity targeted at 50% of grid mix by 2030." },
  ],
  IN: [
    { name: "Indian Equities (Nifty 50 / Next 50)", scope: "local", growthPercent: 13, rationale: "Consumption + capex combination with a young demographic tailwind." },
    { name: "Manufacturing (PLI-linked)", scope: "local", growthPercent: 12, rationale: "Production-Linked Incentive schemes drive electronics, semis, and auto-components capacity." },
    { name: "Digital Public Infrastructure & Fintech", scope: "local", growthPercent: 20, rationale: "UPI + account-aggregator stack enables rapid fintech scale-up." },
  ],
  US: [
    { name: "US Large-Cap Tech", scope: "local", growthPercent: 15, rationale: "Dominant AI platforms and cash-flow-rich megacaps remain the global productivity benchmark." },
    { name: "US Reshoring & Industrial Capex", scope: "local", growthPercent: 10, rationale: "CHIPS Act + IRA subsidise domestic semiconductor, battery, and grid build-out." },
    { name: "Healthcare Innovation", scope: "local", growthPercent: 9, rationale: "Biotech and medical devices benefit from AI-assisted drug discovery." },
  ],
  GB: [
    { name: "UK Financial Services", scope: "local", growthPercent: 8, rationale: "London remains a top-three global FX and insurance market; fintech cluster still expanding." },
    { name: "Renewable Infrastructure", scope: "local", growthPercent: 11, rationale: "Offshore wind pipeline and grid upgrades funded by contracts-for-difference." },
    { name: "UK Life Sciences", scope: "local", growthPercent: 10, rationale: "Golden Triangle (Oxford-Cambridge-London) continues to attract biotech capital." },
  ],
  CA: [
    { name: "Canadian Financials", scope: "local", growthPercent: 8, rationale: "Big Six banks compound through cycles; insurers benefit from higher rates." },
    { name: "Critical Minerals & Energy", scope: "local", growthPercent: 11, rationale: "Lithium, nickel, uranium resources benefit from the energy transition." },
    { name: "Canadian Tech (Shopify-led)", scope: "local", growthPercent: 14, rationale: "Ecosystem maturing around Toronto-Waterloo and Montreal AI research." },
  ],
  AU: [
    { name: "Resources & Battery Minerals", scope: "local", growthPercent: 12, rationale: "Iron ore and lithium exports remain key cashflow engines." },
    { name: "Australian Healthcare", scope: "local", growthPercent: 10, rationale: "CSL and global-leading medtech names benefit from aging demographics." },
    { name: "A-REITs", scope: "local", growthPercent: 7, rationale: "Industrial/logistics property demand outpacing supply." },
  ],
  SG: [
    { name: "ASEAN Tech & Digital Economy", scope: "local", growthPercent: 16, rationale: "Grab, Sea, and regional neobanks scale across SE Asia." },
    { name: "Wealth Management & Private Banking", scope: "local", growthPercent: 11, rationale: "Family offices continue relocating to Singapore, expanding AUM base." },
    { name: "Data Centre REITs", scope: "local", growthPercent: 10, rationale: "AI compute demand drives Southeast Asian data-centre build-out." },
  ],
  DE: [
    { name: "European Industrial Automation", scope: "local", growthPercent: 9, rationale: "Reshoring and robotics investment in the Mittelstand." },
    { name: "Renewable Energy Infrastructure", scope: "local", growthPercent: 11, rationale: "Energiewende accelerates post-2022 gas-supply shock." },
    { name: "European Defence", scope: "local", growthPercent: 13, rationale: "Structural rise in NATO-member defence budgets." },
  ],
  JP: [
    { name: "Japanese Corporate Governance Reform", scope: "local", growthPercent: 9, rationale: "TSE's push for P/B > 1 and capital efficiency unlocking shareholder returns." },
    { name: "Semiconductor Equipment", scope: "local", growthPercent: 14, rationale: "Japan leads in lithography, materials, and specialty chips for global AI build-out." },
    { name: "Robotics & Automation", scope: "local", growthPercent: 11, rationale: "Aging workforce drives factory automation and service robotics." },
  ],
  MY: [
    { name: "Malaysian Semiconductor Packaging", scope: "local", growthPercent: 14, rationale: "Penang corridor benefits from global supply-chain diversification." },
    { name: "Islamic Finance & Sukuk", scope: "local", growthPercent: 9, rationale: "Malaysia remains a global hub for Shariah-compliant capital markets." },
    { name: "Data Centre Infrastructure", scope: "local", growthPercent: 12, rationale: "Johor emerges as a regional data-centre cluster adjacent to Singapore." },
  ],
  PH: [
    { name: "Business Process Outsourcing (BPO)", scope: "local", growthPercent: 10, rationale: "English-language talent pool sustains revenue growth, with AI augmentation extending the cycle." },
    { name: "Philippine Consumer & Retail", scope: "local", growthPercent: 9, rationale: "Young demographics + remittance inflows support consumption." },
    { name: "Renewable Energy", scope: "local", growthPercent: 13, rationale: "Government target of 35% renewables in the mix by 2030 fuels project pipeline." },
  ],
  PK: [
    { name: "Pakistani Islamic Banking", scope: "local", growthPercent: 15, rationale: "Regulatory push to fully Islamise the banking system by the end of the decade." },
    { name: "IT Exports & Freelance Services", scope: "local", growthPercent: 20, rationale: "Low-cost talent base exporting software and BPO services globally." },
    { name: "Agri-Tech & Food Security", scope: "local", growthPercent: 11, rationale: "Value-add agriculture and storage infrastructure reduce post-harvest losses." },
  ],
  BD: [
    { name: "Ready-Made Garments (RMG) 2.0", scope: "local", growthPercent: 10, rationale: "Move up the value chain into man-made fibres and branded apparel." },
    { name: "Digital Payments & MFS", scope: "local", growthPercent: 18, rationale: "bKash-led mobile financial services still expanding the banked population." },
    { name: "Renewable Power", scope: "local", growthPercent: 12, rationale: "Solar auctions and rooftop programs accelerate the energy mix transition." },
  ],
  EG: [
    { name: "Egyptian Fintech", scope: "local", growthPercent: 22, rationale: "Central bank regulatory sandbox and young population drive digital-payment adoption." },
    { name: "Renewable Energy (Benban & wind)", scope: "local", growthPercent: 15, rationale: "IFC/EBRD-backed solar and wind capacity additions continue." },
    { name: "Suez Canal Economic Zone", scope: "local", growthPercent: 10, rationale: "Industrial FDI inflows for logistics and manufacturing along the canal." },
  ],
};
