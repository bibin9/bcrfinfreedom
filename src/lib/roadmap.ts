/**
 * Personalized roadmap generator.
 *
 * Turns the allocation result + country profile + user inputs into a
 * prioritized, country-appropriate action list. Instructions reference the
 * specific account types and vehicles available in the user's jurisdiction
 * (e.g. NPS in India, 401(k) in the US, ISA in the UK).
 */

import type {
  AllocationResult,
  CountryProfile,
  FreedomProjection,
  RoadmapStep,
  UserInput,
} from "@/types";
import { formatCurrency } from "@/lib/formatters";

export function generateRoadmap(
  input: UserInput,
  country: CountryProfile,
  allocation: AllocationResult,
  freedom: FreedomProjection,
): RoadmapStep[] {
  const steps: RoadmapStep[] = [];
  const monthlyExpense = (freedom.annualExpenses / 12) || 0;
  const emergencyTarget = monthlyExpense * country.emergencyFundMonths;

  // 1. Emergency fund first — always.
  steps.push({
    priority: 1,
    title: `Build an emergency fund of ${formatCurrency(emergencyTarget, country)}`,
    detail: `Park ${country.emergencyFundMonths} months of essential expenses in a liquid, low-risk vehicle (high-yield savings / liquid fund / money-market) before adding more risk to your portfolio.`,
    reference: "Emergency fund",
  });

  // 2. Claim the primary tax-advantaged account for this jurisdiction.
  const primaryAccount = country.taxAdvantagedAccounts[0];
  if (primaryAccount) {
    steps.push({
      priority: 2,
      title: `Open / maximise your ${primaryAccount.name}`,
      detail: `${primaryAccount.description}${
        primaryAccount.annualLimit
          ? ` Annual contribution limit: ${formatCurrency(primaryAccount.annualLimit, country)}.`
          : ""
      }`,
      reference: primaryAccount.name,
    });
  }

  // 3. Core equity allocation via a country-appropriate index vehicle.
  const indexVehicle =
    country.investmentVehicles.find((v) => v.category === "etf") ??
    country.investmentVehicles.find((v) => v.category === "mutual_fund");
  const equityPercent =
    (allocation.breakdown.find((b) => b.asset === "equities_local")?.percent ?? 0) +
    (allocation.breakdown.find((b) => b.asset === "equities_destination")?.percent ?? 0) +
    (allocation.breakdown.find((b) => b.asset === "equities_international")?.percent ?? 0);
  if (indexVehicle) {
    steps.push({
      priority: 3,
      title: `Allocate ~${Math.round(equityPercent)}% to diversified equities`,
      detail: `Use a low-cost index fund or ETF such as ${indexVehicle.name} for local exposure, and a global equity ETF (e.g. MSCI World) for international diversification.`,
      reference: indexVehicle.name,
    });
  }

  // 4. Fixed income / sukuk sleeve.
  const bondPercent = allocation.breakdown.find((b) => b.asset === "bonds_fixed_income")?.percent ?? 0;
  const bondVehicle =
    country.investmentVehicles.find((v) => v.category === "sukuk" && country.shariaMarket) ??
    country.investmentVehicles.find((v) => v.category === "bond");
  if (bondPercent > 0 && bondVehicle) {
    steps.push({
      priority: 4,
      title: `Build a ${Math.round(bondPercent)}% ${country.shariaMarket ? "sukuk" : "bond"} sleeve`,
      detail: `Add income stability and reduce drawdown risk. Consider ${bondVehicle.name}.`,
      reference: bondVehicle.name,
    });
  }

  // 5. Additional tax-advantaged accounts (secondary).
  if (country.taxAdvantagedAccounts.length > 1) {
    const secondary = country.taxAdvantagedAccounts[1];
    steps.push({
      priority: steps.length + 1,
      title: `Layer in a ${secondary.name}`,
      detail: secondary.description,
      reference: secondary.name,
    });
  }

  // 6. Goal-specific reminder.
  const goalReminder: Record<UserInput["goal"], string> = {
    early_retirement:
      "Automate monthly contributions and review your savings rate every 6 months — rate > timing drives early retirement.",
    wealth_building:
      "Stay invested through volatility. Boost contributions by the pay-rise amount each year to prevent lifestyle creep.",
    passive_income:
      "Tilt the defensive sleeve toward REITs and high-quality dividend/sukuk vehicles for steady cashflow.",
    child_education:
      "Match the investment horizon to the child's expected entry year; de-risk equities as the horizon shortens.",
    home_purchase:
      "For a horizon under 5 years, keep the down-payment corpus in cash / short bonds regardless of market conditions.",
  };
  steps.push({
    priority: steps.length + 1,
    title: "Align contributions with your primary goal",
    detail: goalReminder[input.goal],
  });

  // 7. Compliance / advisor reminder.
  steps.push({
    priority: steps.length + 1,
    title: "Review with a licensed advisor",
    detail: `Consult an advisor registered with ${country.regulatoryBody} before executing any of the above. Tax treatment and product availability change over time.`,
  });

  return steps;
}
