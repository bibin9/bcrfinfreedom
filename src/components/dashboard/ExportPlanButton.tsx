import { useMemo, useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCountryProfile } from "@/data/countryProfiles";
import { calculateAllocation } from "@/lib/allocation";
import { liquidAssetsValue } from "@/lib/assets";
import { calculateFreedom } from "@/lib/freedom";
import { projectGoal } from "@/lib/goals";
import { projectWindfalls, totalWindfallsAtRetirement } from "@/lib/windfalls";
import { toUserInput, useUserStore } from "@/store/userStore";

const CURRENT_YEAR = new Date().getFullYear();

interface Props {
  /** "lg" is the hero button; "sm" fits inline next to card titles. */
  size?: "sm" | "lg" | "default";
  /** Hide the icon-only "Download" word on narrow screens. */
  compact?: boolean;
}

/**
 * Self-contained "Export my plan" button. Reads the user's current inputs
 * from the Zustand store, recomputes allocation / freedom / goals, then
 * lazy-imports jsPDF and triggers a download. Lives standalone so it can be
 * dropped into FreedomCard, Dashboard header, or anywhere else without
 * prop-drilling the full context.
 */
export function ExportPlanButton({ size = "sm", compact = false }: Props) {
  const inputs = useUserStore((s) => s.inputs);
  const goals = useUserStore((s) => s.goals);
  const assets = useUserStore((s) => s.assets);
  const windfallsList = useUserStore((s) => s.windfalls);

  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const context = useMemo(() => {
    const complete = toUserInput(inputs);
    if (!complete) return null;
    const residentCountry = getCountryProfile(complete.country);
    const destinationCountry =
      inputs.retirementCountry && inputs.retirementCountry !== complete.country
        ? getCountryProfile(inputs.retirementCountry)
        : residentCountry;
    const allocation = calculateAllocation({
      age: complete.age,
      risk: complete.risk,
      country: residentCountry,
      goal: complete.goal,
      retirementCountry: destinationCountry,
      freedomAge: inputs.freedomAge,
    });
    // Same corpus + windfall rules as the Dashboard, so the PDF matches the screen.
    const currentCorpus =
      assets.length > 0 ? liquidAssetsValue(assets) : inputs.currentCorpus ?? 0;
    const retirementYear =
      CURRENT_YEAR + ((inputs.freedomAge ?? destinationCountry.retirementAge) - complete.age);
    const windfalls = projectWindfalls(
      windfallsList,
      CURRENT_YEAR,
      retirementYear,
      allocation.expectedReturn,
    );
    const freedom = calculateFreedom({
      ...complete,
      expectedReturn: allocation.expectedReturn,
      savingsRate: inputs.savingsRate ?? 0.3,
      currentCorpus,
      freedomAge: inputs.freedomAge,
      householdSize: inputs.householdSize ?? "single",
      annualExpensesOverride: inputs.annualExpensesOverride,
      retirementCountry: inputs.retirementCountry,
      retirementCity: inputs.retirementCity,
      windfallsAtRetirement: totalWindfallsAtRetirement(windfalls),
    });
    const goalProjections = goals.map((g) =>
      projectGoal(g, CURRENT_YEAR, destinationCountry.inflationRate, allocation.expectedReturn),
    );
    return {
      user: complete,
      residentCountry,
      destinationCountry,
      allocation,
      freedom,
      goals,
      goalProjections,
      windfalls,
      savingsRate: inputs.savingsRate ?? 0.3,
      currentCorpus,
    };
  }, [inputs, goals, assets, windfallsList]);

  const onExport = async () => {
    if (!context || busy) return;
    setBusy(true);
    setErr(null);
    try {
      const { generatePlanPDF } = await import("@/lib/planPdf");
      await generatePlanPDF(context);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not generate PDF");
    } finally {
      setBusy(false);
    }
  };

  if (!context) return null;

  return (
    <div className="inline-flex flex-col items-end gap-1">
      <Button
        onClick={onExport}
        disabled={busy}
        size={size}
        className="bg-orange-600 hover:bg-orange-700"
      >
        {busy ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {!compact && <span>Building PDF…</span>}
          </>
        ) : (
          <>
            <Download className="h-4 w-4" />
            {!compact && <span>Export my plan</span>}
          </>
        )}
      </Button>
      {err && <span className="text-[10px] text-red-500">{err}</span>}
    </div>
  );
}
