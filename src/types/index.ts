/**
 * Shared domain types for BCR Fin Freedom.
 *
 * These types model the inputs, country-specific investment ecosystem, and
 * the output of the allocation engine and financial freedom calculator.
 */

export type CountryCode =
  | "AE"
  | "SA"
  | "IN"
  | "US"
  | "GB"
  | "CA"
  | "AU"
  | "SG"
  | "DE"
  | "JP"
  | "MY"
  | "PH"
  | "PK"
  | "BD"
  | "EG";

export type RiskProfile = "conservative" | "moderate" | "aggressive";

export type FinancialGoal =
  | "early_retirement"
  | "wealth_building"
  | "passive_income"
  | "child_education"
  | "home_purchase";

export type AssetClass =
  | "equities_local"
  | "equities_destination"
  | "equities_international"
  | "bonds_fixed_income"
  | "real_estate"
  | "gold_commodities"
  | "cash_emergency"
  | "crypto";

export interface TaxAdvantagedAccount {
  /** Local/regulatory name of the account (e.g., "401(k)", "ELSS", "ISA"). */
  name: string;
  /** One-line explanation of what the account is used for. */
  description: string;
  /** Optional annual contribution cap (in local currency). */
  annualLimit?: number;
}

export interface InvestmentVehicle {
  name: string;
  category:
    | "mutual_fund"
    | "etf"
    | "reit"
    | "sukuk"
    | "bond"
    | "gold"
    | "pension";
  shariaCompliant?: boolean;
  note?: string;
}

export interface StockIndex {
  name: string;
  ticker: string;
  description?: string;
}

export interface CountryProfile {
  code: CountryCode;
  name: string;
  currency: string;
  currencySymbol: string;
  /** Approximate typical monthly income (local currency) — used as a pre-fill. */
  defaultMonthlyIncome: number;
  indices: StockIndex[];
  taxAdvantagedAccounts: TaxAdvantagedAccount[];
  investmentVehicles: InvestmentVehicle[];
  /** Whether the country has a well-developed Sharia-compliant product market. */
  shariaMarket: boolean;
  /** Expected long-run inflation rate (decimal; 0.04 = 4%). */
  inflationRate: number;
  /** Recommended emergency fund size in months of expenses. */
  emergencyFundMonths: number;
  retirementAge: number;
  pensionNote: string;
  regulatoryBody: string;
  /** 0..1 economic stability score; higher = more stable. Used by allocation engine. */
  stabilityScore: number;
  /** Nominal expected long-run return for local equities (decimal). */
  expectedEquityReturn: number;
  /** Expected nominal return on local fixed income (decimal). */
  expectedBondReturn: number;
  /** Short regulatory disclaimer specific to this jurisdiction. */
  disclaimer: string;
  /** Benchmark annual living expenses for a single person, mid lifestyle (local currency). */
  averageAnnualExpensesSingle: number;
  /** Benchmark annual living expenses for a family of 4, mid lifestyle (local currency). */
  averageAnnualExpensesFamily: number;
  /** Illustrative spot FX: how many units of local currency equal 1 USD. */
  fxRateToUSD: number;
  /** Country emoji flag (for compact display in headers / banners). */
  flag: string;
}

export type HouseholdSize = "single" | "family";

/** Common life-goal categories. Drives icon + preset defaults in the Goals UI. */
export type GoalCategory =
  | "education"
  | "wedding"
  | "home"
  | "medical"
  | "vehicle"
  | "travel"
  | "parents"
  | "other";

/**
 * A single "lumpy" life goal — child's education, parents' hospital reserve,
 * home down payment. Modelled as its own sinking fund: monthly SIP that grows
 * into the (inflation-adjusted) target amount by the target year.
 */
export interface Goal {
  id: string;
  name: string;
  category: GoalCategory;
  /** Amount at TODAY's prices, in retirement-country currency. */
  targetAmountToday: number;
  /** Calendar year the money is needed (e.g. 2035). */
  targetYear: number;
  createdAt: number;
}

/** Common asset-class buckets for the real-asset tracker. */
export type AssetCategory =
  | "stocks_mf"
  | "retirement"
  | "fd_bonds"
  | "gold"
  | "insurance"
  | "real_estate"
  | "crypto"
  | "cash"
  | "gratuity"
  | "other";

/**
 * A single holding the user has reported. Values are in RESIDENT-country
 * currency (what they earned it in). Illiquid assets (real estate,
 * endowment-style insurance) can be tracked but don't count toward the FIRE
 * withdrawal corpus — the `liquid` flag controls that.
 */
export interface Asset {
  id: string;
  name: string;
  category: AssetCategory;
  /** Current market value in resident-country currency. */
  currentValue: number;
  /** Whether this asset counts toward the FIRE withdrawal corpus. */
  liquid: boolean;
  note?: string;
  updatedAt: number;
}

/** A future lump-sum you'll RECEIVE — EOSB, inheritance, property sale, bonus. */
export type WindfallCategory =
  | "eosb"
  | "inheritance"
  | "property_sale"
  | "bonus"
  | "severance"
  | "insurance_payout"
  | "pension_commute"
  | "other";

export interface Windfall {
  id: string;
  name: string;
  category: WindfallCategory;
  /** Amount in RETIREMENT-country currency (what you'll spend it in). */
  amount: number;
  /** Calendar year the money arrives. */
  targetYear: number;
  /** Optional note. */
  note?: string;
  createdAt: number;
}

/** Result of running a single Goal through the sinking-fund math. */
export interface GoalProjection {
  goal: Goal;
  yearsToTarget: number;
  /** Target inflated to the target year. */
  futureAmount: number;
  /** Monthly SIP needed today to hit futureAmount by targetYear. Null = unreachable. */
  monthlySIP: number | null;
}

/** How the freedom calculator decided which annual-expense number to use. */
export type ExpenseBasis = "override" | "benchmark" | "income";

export interface UserInput {
  country: CountryCode;
  age: number;
  monthlyIncome: number;
  risk: RiskProfile;
  goal: FinancialGoal;
}

export interface AllocationBreakdown {
  asset: AssetClass;
  label: string;
  percent: number;
  rationale: string;
}

export interface AllocationResult {
  breakdown: AllocationBreakdown[];
  /** Weighted expected nominal return for the blended portfolio (decimal). */
  expectedReturn: number;
  /** The "100 - age" baseline equity weight actually used (after adjustments). */
  equityWeight: number;
  /** Explanation of how the allocation was derived — shown to the user. */
  explanation: string[];
}

export interface FreedomProjection {
  /** Inflation-adjusted target corpus at the chosen freedom age (25× future expenses). */
  targetCorpus: number;
  /** Annual expenses at the freedom age (today's lifestyle inflated forward). */
  annualExpenses: number;
  /** Annual expenses at today's prices — shown so users can see the inflation impact. */
  currentAnnualExpenses: number;
  /** Which input produced currentAnnualExpenses: override | country benchmark | income × (1-savings). */
  expenseBasis: ExpenseBasis;
  /** Household size the benchmark was resolved against ("single" or "family"). */
  householdSize: HouseholdSize;
  /** Age the user has chosen (or defaulted) for financial freedom. */
  freedomAge: number;
  /** Country inflation rate used (decimal). */
  inflationRateUsed: number;
  monthlyInvestmentRequired: {
    byAge50: number | null;
    byAge55: number | null;
    byAge60: number | null;
  };
  yearsToFreedomAtCurrentRate: number | null;
  /** Year-by-year projected wealth assuming current savings rate + blended return. */
  projection: Array<{ age: number; wealth: number }>;
  /** Monthly SIP required to hit target corpus by the chosen freedom age. */
  requiredMonthlySIP: number | null;
  /** What the user actually saves each month today (income × savingsRate). */
  currentMonthlySavings: number;
  /** max(0, requiredMonthlySIP - currentMonthlySavings). */
  monthlyShortfall: number;
  /** Annual income growth rate (decimal) needed to eventually fund the required SIP. */
  requiredAnnualIncomeGrowth: number;
  /** Monthly income implied at freedom age if the raise above is achieved. */
  requiredMonthlyIncomeAtFreedom: number | null;
  /** Year-by-year income + SIP plan so the user can benchmark every appraisal cycle. */
  incomePlan: Array<{
    age: number;
    yearsFromNow: number;
    suggestedMonthlyIncome: number;
    suggestedMonthlySIP: number;
  }>;
  /** FIRE tier breakdown — Lean / Standard / Fat / Coast targets at the chosen freedom age. */
  fireTiers: {
    /** 15× expenses — minimal lifestyle. */
    lean: { multiple: number; targetCorpus: number; yearsAtCurrentSavings: number | null };
    /** 25× expenses — the classic 4% SWR target. */
    standard: { multiple: number; targetCorpus: number; yearsAtCurrentSavings: number | null };
    /** 33× expenses — comfortable, 3% SWR. */
    fat: { multiple: number; targetCorpus: number; yearsAtCurrentSavings: number | null };
    /** Amount needed TODAY that compounds (no further savings) into the standard FIRE number by freedomAge. */
    coastTodayCorpus: number;
  };
  /** Years-to-FI curve across savings rates 10..70%, using user's real expected return. */
  savingsRateCurve: Array<{ savingsRate: number; yearsToFI: number | null }>;
}

export interface GrowthSector {
  name: string;
  scope: "global" | "local";
  growthPercent: number;
  rationale: string;
}

export interface RoadmapStep {
  priority: number;
  title: string;
  detail: string;
  /** Optional reference to a country-specific account or vehicle. */
  reference?: string;
}

export type EquitySubCategory =
  | "large_cap"
  | "mid_cap"
  | "small_cap"
  | "flexi_cap"
  | "international";

export type DebtSubCategory = "liquid" | "short_duration" | "corporate_bond" | "long_gilt";

export interface EquitySubAllocation {
  category: EquitySubCategory;
  label: string;
  /** Percentage of the equity sleeve (sums to 100 across all entries). */
  percentOfEquity: number;
  /** Percentage of the overall portfolio. */
  percentOfPortfolio: number;
  rationale: string;
}

export interface DebtSubAllocation {
  category: DebtSubCategory;
  label: string;
  percentOfDebt: number;
  percentOfPortfolio: number;
  rationale: string;
}

export interface MFAllocation {
  equity: EquitySubAllocation[];
  debt: DebtSubAllocation[];
}

export type FundCategory =
  | "large_cap"
  | "mid_cap"
  | "small_cap"
  | "flexi_cap"
  | "index"
  | "international"
  | "debt"
  | "hybrid"
  | "elss"
  | "etf"
  | "sukuk";

export interface MutualFund {
  name: string;
  category: FundCategory;
  /** Illustrative 3-year CAGR (decimal). Curated approximation, see disclaimer. */
  threeYearCagr: number;
  /** Illustrative 5-year CAGR (decimal). Curated approximation. */
  fiveYearCagr: number;
  /** Total expense ratio (decimal, e.g. 0.005 = 0.5%). */
  expenseRatio: number;
  /** Relative risk level. */
  risk: "low" | "medium" | "high";
  /** One-line note — what the fund does well, or who it suits. */
  note: string;
  /** Optional Sharia-compliance flag. */
  shariaCompliant?: boolean;
}

export interface CompoundingPoint {
  year: number;
  age: number;
  principalInvested: number;
  gains: number;
  total: number;
}
