import { HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/**
 * Plain-English glossary for finance terms.
 *
 * Keep entries short (under 80 chars) so the tooltip stays scannable.
 * The wrapping `<Term>` component pulls from this map, with a fallback so
 * unknown terms degrade gracefully to a plain underline.
 */
export const GLOSSARY: Record<string, string> = {
  // FIRE concepts
  FIRE: "Financial Independence, Retire Early — save enough that you can live off your investments.",
  "FI Ratio": "How close you are to FIRE today, in %. Current money / today's FIRE number × 100.",
  "FIRE number": "Total money you need to retire. Always 25× your yearly spending.",
  "4% rule": "If your corpus is 25× your spending, you can safely withdraw 4% per year for life.",
  SWR: "Safe Withdrawal Rate — how much you take out per year. 4% is the FIRE standard.",
  CoastFIRE: "Once you have enough invested that it compounds into the full FIRE number without further saving.",
  LeanFIRE: "Retire on a tight budget — 15× your spending.",
  FatFIRE: "Comfortable retirement — 33× spending, withdraw only 3% per year.",

  // Generic
  SIP: "Systematic Investment Plan — a fixed amount you invest every month, automatically.",
  Corpus: "Your total invested money. The bigger it is, the faster compounding works for you.",
  Inflation: "How fast prices rise per year. Money today buys less in 20 years — the app builds that in.",
  Compounding: "When your gains start earning gains of their own. The longer you wait, the bigger the snowball.",
  "Expected return": "What your portfolio earns per year on average — varies by country and risk.",
  "Real return": "Expected return minus inflation. What you actually gain in buying power.",

  // Vehicles
  ETF: "Exchange-Traded Fund — a basket of stocks you can buy and sell like a single share.",
  REIT: "Real Estate Investment Trust — owns rent-earning properties; pays you a slice of the rent.",
  "Mutual fund": "A pool of money managed by a professional, invested in many stocks/bonds.",
  "Index fund": "A mutual fund or ETF that tracks a market index (e.g. Nifty 50, S&P 500). Cheapest way to own the market.",
  Bonds: "Loans you give to a government or company. You earn interest; safer than stocks.",
  Sukuk: "Sharia-compliant bond. Earns rent from a real asset instead of interest.",

  // India
  ELSS: "Equity-Linked Savings Scheme — Indian tax-saving mutual fund with a 3-year lock-in.",
  NPS: "National Pension System — Indian retirement account with extra ₹50K/yr tax deduction.",
  PPF: "Public Provident Fund — 15-year Indian government scheme; tax-free interest.",
  EPF: "Employees' Provident Fund — auto-deducted from Indian salaries for retirement.",
  NRE: "Non-Resident External account — for Indians abroad. Fully repatriable, tax-free interest.",
  NRO: "Non-Resident Ordinary account — for an NRI's Indian-rupee income (rent, dividends).",
  NRI: "Non-Resident Indian — Indian citizen living abroad for tax purposes.",
  RNOR: "Resident but Not Ordinarily Resident — a transitional Indian tax status for returning NRIs. Lasts up to 2 FYs. Foreign income is NOT taxed in India.",
  ROR: "Resident and Ordinarily Resident — full Indian tax resident. Worldwide income is taxable in India.",
  DTAA: "Double Taxation Avoidance Agreement — treaty that prevents the same income being taxed in two countries.",
  LTCG: "Long-Term Capital Gains — profits on assets held > 1-3 years (depending on asset). Taxed at a lower rate.",
  STCG: "Short-Term Capital Gains — profits on assets held for a short period. Taxed at full slab rate.",
  TDS: "Tax Deducted at Source — tax withheld before the money reaches you.",

  // Gulf
  EOSB: "End-of-Service Benefit — UAE statutory lump-sum paid by employers when you leave.",
  DEWS: "DIFC Employee Workplace Savings — optional UAE pension plan replacing EOSB in DIFC.",
  GOSI: "Saudi mandatory pension scheme for nationals.",

  // US/UK
  "401(k)": "US employer-sponsored retirement account. Often includes a 'match' — free money.",
  IRA: "Individual Retirement Account (US) — tax-advantaged personal retirement savings.",
  ISA: "Individual Savings Account (UK) — tax-free wrapper for £20K/yr of investments.",
  SIPP: "Self-Invested Personal Pension (UK) — pension you control yourself; tax relief on contributions.",
  HSA: "Health Savings Account (US) — triple-tax-advantaged for medical expenses.",

  // Other
  CAGR: "Compound Annual Growth Rate — average yearly return, accounting for compounding.",
  Drawdown: "Spending phase of FIRE — selling investments to fund living expenses.",
  Rebalancing: "Periodically resetting your stock/bond mix back to your target ratios.",
  Allocation: "How you split your money across stocks, bonds, gold, real estate, etc.",
};

interface TermProps {
  children: React.ReactNode;
  /** Lookup key into GLOSSARY. Defaults to children if it's a plain string. */
  k?: string;
  /** Show the small `?` icon next to the term (helpful for first appearance). */
  hint?: boolean;
}

/**
 * Inline glossary term. Underlines the term and shows a plain-English
 * explanation on hover (desktop) or tap (mobile).
 *
 * Usage:
 *   <Term>SIP</Term>
 *   <Term k="FIRE number">your FIRE number</Term>
 *   <Term hint>FI Ratio</Term>
 */
export function Term({ children, k, hint }: TermProps) {
  const key = k ?? (typeof children === "string" ? children : "");
  const explanation = GLOSSARY[key];
  if (!explanation) {
    // Unknown term — render as plain text so we don't break content.
    return <>{children}</>;
  }
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="inline cursor-help border-b border-dotted border-current/60 text-inherit decoration-from-font"
            aria-label={`What does ${key} mean?`}
          >
            {children}
            {hint && (
              <HelpCircle
                className="ml-0.5 inline h-3 w-3 align-text-top text-muted-foreground"
                aria-hidden="true"
              />
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs text-xs leading-snug">
          <strong className="block text-foreground">{key}</strong>
          <span className="text-muted-foreground">{explanation}</span>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
