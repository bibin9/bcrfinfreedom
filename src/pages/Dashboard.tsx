import { useMemo } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Disclaimer } from "@/components/layout/Disclaimer";
import { DashboardNav } from "@/components/layout/DashboardNav";
import { AllocationCard } from "@/components/dashboard/AllocationCard";
import { AssetsCard } from "@/components/dashboard/AssetsCard";
import { BeginnerBanner } from "@/components/dashboard/BeginnerBanner";
import { CashFlowCard } from "@/components/dashboard/CashFlowCard";
import { EOSBCard } from "@/components/dashboard/EOSBCard";
import { IndiaTaxCard } from "@/components/dashboard/IndiaTaxCard";
import { CompoundingCard } from "@/components/dashboard/CompoundingCard";
import { Collapsible } from "@/components/ui/collapsible";
import { CryptoInsightsCard } from "@/components/dashboard/CryptoInsightsCard";
import { ExportPlanButton } from "@/components/dashboard/ExportPlanButton";
import { FreedomCard } from "@/components/dashboard/FreedomCard";
import { GoalsCard } from "@/components/dashboard/GoalsCard";
import { GrowthSectorsCard } from "@/components/dashboard/GrowthSectorsCard";
import { LifePlanCard } from "@/components/dashboard/LifePlanCard";
import { MFAllocationCard } from "@/components/dashboard/MFAllocationCard";
import { NRIOptionsCard } from "@/components/dashboard/NRIOptionsCard";
import { NRITaxDrawer } from "@/components/dashboard/NRITaxDrawer";
import { RealityCheckCard } from "@/components/dashboard/RealityCheckCard";
import { ReturnsCard } from "@/components/dashboard/ReturnsCard";
import { RoadmapCard } from "@/components/dashboard/RoadmapCard";
import { StartInvestingCard } from "@/components/dashboard/StartInvestingCard";
import { TopFundsCard } from "@/components/dashboard/TopFundsCard";
import { TrackerCard } from "@/components/dashboard/TrackerCard";
import { TunePanel } from "@/components/dashboard/TunePanel";
import { TwoPathsCard } from "@/components/dashboard/TwoPathsCard";
import { COUNTRY_DATA_LAST_REVIEWED, getCountryProfile } from "@/data/countryProfiles";
import { calculateAllocation } from "@/lib/allocation";
import { liquidAssetsValue } from "@/lib/assets";
import { calculateFreedom } from "@/lib/freedom";
import { convertCurrency } from "@/lib/fx";
import { calculateMFAllocation } from "@/lib/mfAllocation";
import { generateRoadmap } from "@/lib/roadmap";
import { projectWindfalls, totalWindfallsAtRetirement } from "@/lib/windfalls";
import { toUserInput, useUserStore } from "@/store/userStore";

export function Dashboard() {
  const inputs = useUserStore((s) => s.inputs);
  const setPhase = useUserStore((s) => s.setPhase);
  const setSavingsRate = useUserStore((s) => s.setSavingsRate);
  const setCurrentCorpus = useUserStore((s) => s.setCurrentCorpus);
  const setIsNRI = useUserStore((s) => s.setIsNRI);
  const setFreedomAge = useUserStore((s) => s.setFreedomAge);
  const setHouseholdSize = useUserStore((s) => s.setHouseholdSize);
  const setAnnualExpensesOverride = useUserStore((s) => s.setAnnualExpensesOverride);
  const setRetirementCountry = useUserStore((s) => s.setRetirementCountry);
  const dashboardTab = useUserStore((s) => s.dashboardTab);
  const setDashboardTab = useUserStore((s) => s.setDashboardTab);
  const complete = toUserInput(inputs);

  const savingsRate = inputs.savingsRate ?? 0.3;
  // If the user has added real assets, the sum of liquid ones overrides the
  // manual "Current invested corpus" field in TunePanel. First-time users
  // (no assets) see no behaviour change.
  const assetsList = useUserStore((s) => s.assets);
  const assetsCorpus = liquidAssetsValue(assetsList);
  const currentCorpus = assetsList.length > 0 ? assetsCorpus : inputs.currentCorpus ?? 0;
  const windfallsList = useUserStore((s) => s.windfalls);
  const goalsList = useUserStore((s) => s.goals);
  const isNRI = inputs.isNRI ?? false;
  const freedomAge = inputs.freedomAge;
  const householdSize = inputs.householdSize ?? "single";
  const annualExpensesOverride = inputs.annualExpensesOverride;
  const retirementCountryCode = inputs.retirementCountry;
  const monthlyInvestment = complete
    ? Math.max(0, Math.round(complete.monthlyIncome * savingsRate))
    : 0;

  const country = complete ? getCountryProfile(complete.country) : null;
  // The country whose currency / inflation / benchmark drive the FIRE number.
  // Falls back to the resident country in single-country mode.
  const destinationCountry =
    retirementCountryCode && retirementCountryCode !== complete?.country
      ? getCountryProfile(retirementCountryCode)
      : country;
  const isExpatMode =
    !!destinationCountry && !!country && destinationCountry.code !== country.code;
  const isGulfResident = country?.code === "AE" || country?.code === "SA";
  const hasEosbWindfall = windfallsList.some((w) => w.category === "eosb");
  // FreedomCard compares the corpus against a FIRE number in retirement currency.
  const corpusInRetirementCcy =
    country && destinationCountry
      ? convertCurrency(currentCorpus, country, destinationCountry)
      : currentCorpus;

  const allocation = useMemo(() => {
    if (!complete || !country) return null;
    return calculateAllocation({
      age: complete.age,
      risk: complete.risk,
      country,
      goal: complete.goal,
      retirementCountry: destinationCountry ?? undefined,
      freedomAge,
    });
  }, [complete, country, destinationCountry, freedomAge]);

  // Translate the user's windfalls into a FV credit at retirement age so the
  // required SIP can be reduced accordingly.
  const windfallsCredit = useMemo(() => {
    if (!complete || !allocation) return 0;
    const retirementYear =
      new Date().getFullYear() + ((freedomAge ?? destinationCountry?.retirementAge ?? 60) - complete.age);
    const projs = projectWindfalls(
      windfallsList,
      new Date().getFullYear(),
      retirementYear,
      allocation.expectedReturn,
    );
    return totalWindfallsAtRetirement(projs);
  }, [complete, allocation, windfallsList, freedomAge, destinationCountry]);

  const freedom = useMemo(() => {
    if (!complete || !allocation) return null;
    return calculateFreedom({
      ...complete,
      expectedReturn: allocation.expectedReturn,
      savingsRate,
      currentCorpus,
      freedomAge,
      householdSize,
      annualExpensesOverride,
      retirementCountry: retirementCountryCode,
      windfallsAtRetirement: windfallsCredit,
    });
  }, [
    complete,
    allocation,
    savingsRate,
    currentCorpus,
    freedomAge,
    householdSize,
    annualExpensesOverride,
    retirementCountryCode,
    windfallsCredit,
  ]);

  const mfAllocation = useMemo(() => {
    if (!complete || !allocation) return null;
    return calculateMFAllocation(allocation, complete.risk);
  }, [complete, allocation]);

  const roadmap = useMemo(() => {
    if (!complete || !country || !allocation || !freedom) return null;
    return generateRoadmap(complete, country, allocation, freedom);
  }, [complete, country, allocation, freedom]);

  if (!complete || !country || !allocation || !freedom || !roadmap || !mfAllocation) {
    return (
      <div className="container max-w-xl py-16 text-center">
        <Card>
          <CardHeader>
            <CardTitle>Finish onboarding first</CardTitle>
            <CardDescription>
              We need a few inputs to generate your personalised plan.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setPhase("onboarding")}>Start onboarding</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const goalLabel = complete.goal.replace(/_/g, " ");

  // If user switched to NRI tab but then turned off NRI, fall back to overview.
  const effectiveTab = dashboardTab === "nri" && !isNRI ? "overview" : dashboardTab;

  return (
    <div className="container px-3 py-3 sm:px-8 sm:py-6 animate-fade-in">
      <header className="mb-3 flex flex-col gap-2 sm:mb-5 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
        <div className="min-w-0">
          <h1 className="truncate text-lg font-semibold tracking-tight sm:text-2xl">
            Your BCR FIRE plan
          </h1>
          <p className="mt-0.5 text-[11px] text-muted-foreground sm:mt-1 sm:text-sm">
            {complete.age}y · {complete.risk} ·{" "}
            {isExpatMode && destinationCountry ? (
              <span>
                <span className="font-medium text-foreground">
                  {country.flag} Living {country.name}
                </span>{" "}
                →{" "}
                <span className="font-medium text-orange-600 dark:text-orange-400">
                  {destinationCountry.flag} Retiring {destinationCountry.name}
                </span>
              </span>
            ) : (
              <span>
                {country.flag} {country.name}
              </span>
            )}{" "}
            · <span className="capitalize">{goalLabel}</span>
            {isNRI && <span className="ml-1 text-emerald-500">· NRI</span>}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <ExportPlanButton compact />
          <Button variant="outline" size="sm" onClick={() => setPhase("onboarding")}>
            <Pencil className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Edit inputs</span>
            <span className="sm:hidden">Edit</span>
          </Button>
          {/* NRI toggle demoted to a quiet checkbox — rare, once-set action */}
          <label className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <input
              type="checkbox"
              checked={isNRI}
              onChange={(e) => setIsNRI(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-border"
            />
            <span>NRI</span>
          </label>
        </div>
      </header>

      <BeginnerBanner
        onOpenHelp={() => window.dispatchEvent(new Event("bcr-fire:open-help"))}
      />
      <DashboardNav active={effectiveTab} onChange={setDashboardTab} showNRI={isNRI} />

      <div className="mt-4 grid gap-4 sm:mt-6 sm:gap-6 lg:grid-cols-3">
        <div className="space-y-4 sm:space-y-6 lg:col-span-2">
          {effectiveTab === "overview" && (
            <>
              {isGulfResident && !hasEosbWindfall && (
                <div className="flex flex-col gap-2 rounded-lg border border-orange-500/40 bg-orange-500/5 p-3 text-sm sm:flex-row sm:items-center sm:justify-between">
                  <p>
                    <strong>Your end-of-service benefit isn't in this plan yet.</strong>{" "}
                    <span className="text-muted-foreground">
                      For most {country.code === "AE" ? "UAE" : "Saudi"} expats it's a large
                      lump sum that lowers the SIP you need.
                    </span>
                  </p>
                  <Button
                    size="sm"
                    className="shrink-0 bg-orange-600 hover:bg-orange-700"
                    onClick={() => setDashboardTab("assets")}
                  >
                    Estimate it
                  </Button>
                </div>
              )}
              <CashFlowCard
                country={country}
                destinationCountry={destinationCountry ?? country}
                monthlyIncome={complete.monthlyIncome}
                savingsRate={savingsRate}
                freedom={freedom}
                expectedReturn={allocation.expectedReturn}
                goals={goalsList}
              />
              <AllocationCard
                allocation={allocation}
                country={country}
                monthlyInvestment={monthlyInvestment}
                currentCorpus={currentCorpus}
              />
              <FreedomCard
                country={destinationCountry ?? country}
                projection={freedom}
                age={complete.age}
                savingsRate={savingsRate}
                currentCorpus={corpusInRetirementCcy}
              />
              <Collapsible
                title={`More context for ${country.name}`}
                subtitle="market returns + growth sectors"
              >
                <div className="space-y-4">
                  <ReturnsCard country={country} />
                  <GrowthSectorsCard country={country} />
                </div>
              </Collapsible>
            </>
          )}

          {effectiveTab === "allocation" && (
            <>
              <AllocationCard
                allocation={allocation}
                country={country}
                monthlyInvestment={monthlyInvestment}
                currentCorpus={currentCorpus}
              />
              {country.code === "IN" && (
                <IndiaTaxCard
                  country={country}
                  monthlyIncome={complete.monthlyIncome}
                  monthlySIP={monthlyInvestment}
                  risk={complete.risk}
                />
              )}
              <MFAllocationCard
                allocation={mfAllocation}
                country={country}
                monthlyInvestment={monthlyInvestment}
                currentCorpus={currentCorpus}
              />
            </>
          )}

          {effectiveTab === "funds" && (
            <TopFundsCard country={complete.country} shariaMarket={country.shariaMarket} />
          )}

          {effectiveTab === "compounding" && (
            <CompoundingCard
              country={country}
              age={complete.age}
              expectedReturn={allocation.expectedReturn}
              suggestedMonthly={Math.max(500, monthlyInvestment)}
            />
          )}

          {effectiveTab === "lifeplan" && (
            <LifePlanCard
              age={complete.age}
              freedomAge={freedom.freedomAge}
              country={country}
              projection={freedom}
            />
          )}

          {effectiveTab === "assets" && (
            <>
              {isGulfResident && (
                <EOSBCard
                  residentCountry={country}
                  destinationCountry={destinationCountry ?? country}
                  monthlyIncome={complete.monthlyIncome}
                  age={complete.age}
                  freedomAge={freedom.freedomAge}
                  expectedReturn={allocation.expectedReturn}
                />
              )}
              <AssetsCard residentCountry={country} />
            </>
          )}

          {effectiveTab === "goals" && (
            <GoalsCard
              destinationCountry={destinationCountry ?? country}
              expectedReturn={allocation.expectedReturn}
              fireSIP={freedom.requiredMonthlySIP}
              retirementYear={
                new Date().getFullYear() + (freedom.freedomAge - complete.age)
              }
            />
          )}

          {effectiveTab === "freedom" && (
            <>
              <FreedomCard
                country={destinationCountry ?? country}
                projection={freedom}
                age={complete.age}
                savingsRate={savingsRate}
                currentCorpus={corpusInRetirementCcy}
              />
              <RoadmapCard steps={roadmap} />
            </>
          )}

          {effectiveTab === "reality" && (
            <RealityCheckCard
              destinationCountry={destinationCountry ?? country}
              projection={freedom}
              risk={complete.risk}
              expectedReturn={allocation.expectedReturn}
            />
          )}

          {effectiveTab === "tracker" && (
            <TrackerCard country={destinationCountry ?? country} projection={freedom} />
          )}

          {effectiveTab === "paths" && (
            <TwoPathsCard
              complete={complete}
              country={country}
              expectedReturn={allocation.expectedReturn}
              savingsRate={savingsRate}
              currentCorpus={currentCorpus}
            />
          )}

          {effectiveTab === "crypto" && (
            <CryptoInsightsCard
              country={complete.country}
              countryName={country.name}
              suggestedCryptoPercent={
                allocation.breakdown.find((b) => b.asset === "crypto")?.percent ?? 0
              }
              suggestedMonthly={monthlyInvestment}
              currencySymbol={country.currencySymbol}
            />
          )}

          {effectiveTab === "start" && (
            <>
              <StartInvestingCard country={complete.country} />
              <RoadmapCard steps={roadmap} />
            </>
          )}

          {effectiveTab === "nri" && isNRI && (
            <NRIOptionsCard
              residenceCountryCode={complete.country}
              taxCalculator={<NRITaxDrawer />}
            />
          )}
        </div>

        <aside className="space-y-4 sm:space-y-6">
          <TunePanel
            country={country}
            destinationCountry={destinationCountry ?? country}
            savingsRate={savingsRate}
            currentCorpus={currentCorpus}
            freedomAge={freedom.freedomAge}
            currentAge={complete.age}
            householdSize={householdSize}
            annualExpensesOverride={annualExpensesOverride}
            onSavingsRate={setSavingsRate}
            onCurrentCorpus={setCurrentCorpus}
            onFreedomAge={setFreedomAge}
            onHouseholdSize={setHouseholdSize}
            onAnnualExpensesOverride={setAnnualExpensesOverride}
            onRetirementCountry={setRetirementCountry}
          />
          <Card>
            <CardHeader>
              <CardTitle>Local context</CardTitle>
              <CardDescription>Quick reference for {country.name}.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <Row label="Regulator" value={country.regulatoryBody} />
              <Row label="Retirement age" value={`${country.retirementAge}`} />
              <Row label="Inflation" value={`${(country.inflationRate * 100).toFixed(1)}%`} />
              <Row
                label="Emergency fund"
                value={`${country.emergencyFundMonths} months`}
              />
              <Row label="Sharia market" value={country.shariaMarket ? "Yes" : "No"} />
              <Row label="Data last reviewed" value={COUNTRY_DATA_LAST_REVIEWED} />
            </CardContent>
          </Card>
          <Disclaimer country={country} />
        </aside>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border py-1.5 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
