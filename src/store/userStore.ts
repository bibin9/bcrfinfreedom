import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  Asset,
  CountryCode,
  FinancialGoal,
  Goal,
  HouseholdSize,
  RiskProfile,
  UserInput,
  Windfall,
} from "@/types";

export type AppPhase = "landing" | "onboarding" | "reveal" | "dashboard";

export type DashboardTab =
  | "overview"
  | "lifeplan"
  | "goals"
  | "assets"
  | "allocation"
  | "funds"
  | "compounding"
  | "freedom"
  | "reality"
  | "tracker"
  | "paths"
  | "crypto"
  | "start"
  | "nri";

/**
 * Three super-sections that group the 14 tabs by user intent.
 *   PLAN = "what's the shape of my plan?" (overview, life, goals, FIRE #)
 *   GROW = "how do I grow money?" (assets, allocation, funds, compounding)
 *   LIVE = "put it into action / track it" (tracker, reality check, paths, crypto, start, NRI)
 */
export type DashboardSection = "plan" | "grow" | "live";

/** Map each tab to its parent super-section. */
export const TAB_TO_SECTION: Record<DashboardTab, DashboardSection> = {
  overview: "plan",
  lifeplan: "plan",
  goals: "plan",
  freedom: "plan",
  assets: "grow",
  allocation: "grow",
  funds: "grow",
  compounding: "grow",
  tracker: "live",
  reality: "live",
  paths: "live",
  crypto: "live",
  start: "live",
  nri: "live",
};

/** Default tab when the user picks a section fresh (no prior tab in that section). */
export const SECTION_DEFAULT_TAB: Record<DashboardSection, DashboardTab> = {
  plan: "overview",
  grow: "assets",
  live: "reality",
};

/** A single input snapshot the user has named and saved for comparison. */
export interface Scenario {
  id: string;
  name: string;
  createdAt: number;
  inputs: UserState["inputs"];
}

/** A quarterly self-check log entry: corpus & income at a point in time. */
export interface Checkin {
  id: string;
  /** ISO date (YYYY-MM-DD) */
  date: string;
  /** Corpus value the user reported on this date. */
  corpus: number;
  /** Monthly income the user reported. */
  monthlyIncome: number;
  /** Optional one-line note from the user. */
  note?: string;
}

interface UserState {
  phase: AppPhase;
  dashboardTab: DashboardTab;
  inputs: Partial<UserInput> & {
    savingsRate?: number;
    currentCorpus?: number;
    isNRI?: boolean;
    freedomAge?: number;
    householdSize?: HouseholdSize;
    /** User-entered annual expenses in local currency. Overrides benchmark/income. */
    annualExpensesOverride?: number;
    /** Country the user plans to retire in. If absent, equals `country`. */
    retirementCountry?: CountryCode;
  };
  scenarios: Scenario[];
  checkins: Checkin[];
  goals: Goal[];
  assets: Asset[];
  windfalls: Windfall[];
  /** Persisted AI assistant chat history. */
  aiMessages: Array<{ role: "user" | "assistant"; content: string; timestamp: number }>;
  theme: "light" | "dark";

  setPhase: (phase: AppPhase) => void;
  setDashboardTab: (tab: DashboardTab) => void;
  setCountry: (code: CountryCode) => void;
  setAge: (age: number) => void;
  setMonthlyIncome: (income: number) => void;
  setRisk: (risk: RiskProfile) => void;
  setGoal: (goal: FinancialGoal) => void;
  setSavingsRate: (rate: number) => void;
  setCurrentCorpus: (corpus: number) => void;
  setIsNRI: (isNRI: boolean) => void;
  setFreedomAge: (age: number | undefined) => void;
  setHouseholdSize: (size: HouseholdSize) => void;
  setAnnualExpensesOverride: (expenses: number | undefined) => void;
  /** Override the country the user plans to retire in (expat dual-country mode). */
  setRetirementCountry: (code: CountryCode | undefined) => void;
  /** Snapshot current inputs as a named scenario. */
  saveScenario: (name: string) => void;
  /** Apply a previously saved scenario back into inputs. */
  applyScenario: (id: string) => void;
  /** Delete a saved scenario. */
  deleteScenario: (id: string) => void;
  /** Append a quarterly check-in. */
  addCheckin: (entry: Omit<Checkin, "id">) => void;
  /** Delete a check-in. */
  deleteCheckin: (id: string) => void;
  /** Add a lumpy life goal (education, wedding, home, etc.). */
  addGoal: (entry: Omit<Goal, "id" | "createdAt">) => void;
  /** Update an existing goal in-place. */
  updateGoal: (id: string, patch: Partial<Omit<Goal, "id" | "createdAt">>) => void;
  /** Delete a goal. */
  deleteGoal: (id: string) => void;
  /** Add a real-asset entry (EPF balance, FD, gold grams × spot, etc.). */
  addAsset: (entry: Omit<Asset, "id" | "updatedAt">) => void;
  /** Update an existing asset in place (e.g. refresh its current value). */
  updateAsset: (id: string, patch: Partial<Omit<Asset, "id" | "updatedAt">>) => void;
  /** Delete an asset. */
  deleteAsset: (id: string) => void;
  /** Add a future windfall (EOSB, inheritance, property sale, bonus). */
  addWindfall: (entry: Omit<Windfall, "id" | "createdAt">) => void;
  /** Delete a windfall. */
  deleteWindfall: (id: string) => void;
  /** Append a chat message to the AI assistant history. */
  addAiMessage: (msg: { role: "user" | "assistant"; content: string }) => void;
  /** Clear the chat history. */
  clearAiMessages: () => void;
  toggleTheme: () => void;
  reset: () => void;
}

/** Returns a complete UserInput if all required fields are present. */
export function toUserInput(
  partial: UserState["inputs"],
): UserInput | null {
  if (
    partial.country &&
    typeof partial.age === "number" &&
    typeof partial.monthlyIncome === "number" &&
    partial.risk &&
    partial.goal
  ) {
    return {
      country: partial.country,
      age: partial.age,
      monthlyIncome: partial.monthlyIncome,
      risk: partial.risk,
      goal: partial.goal,
    };
  }
  return null;
}

const initialInputs: UserState["inputs"] = {
  risk: "moderate",
  goal: "wealth_building",
  savingsRate: 0.3,
  currentCorpus: 0,
  householdSize: "single",
};

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      phase: "landing",
      dashboardTab: "overview",
      inputs: initialInputs,
      scenarios: [],
      checkins: [],
      goals: [],
      assets: [],
      windfalls: [],
      aiMessages: [],
      theme: "light",

      setPhase: (phase) => set({ phase }),
      setDashboardTab: (dashboardTab) => set({ dashboardTab }),
      setCountry: (code) => set((s) => ({ inputs: { ...s.inputs, country: code } })),
      setAge: (age) => set((s) => ({ inputs: { ...s.inputs, age } })),
      setMonthlyIncome: (monthlyIncome) => set((s) => ({ inputs: { ...s.inputs, monthlyIncome } })),
      setRisk: (risk) => set((s) => ({ inputs: { ...s.inputs, risk } })),
      setGoal: (goal) => set((s) => ({ inputs: { ...s.inputs, goal } })),
      setSavingsRate: (savingsRate) => set((s) => ({ inputs: { ...s.inputs, savingsRate } })),
      setCurrentCorpus: (currentCorpus) => set((s) => ({ inputs: { ...s.inputs, currentCorpus } })),
      setIsNRI: (isNRI) => set((s) => ({ inputs: { ...s.inputs, isNRI } })),
      setFreedomAge: (freedomAge) =>
        set((s) => ({ inputs: { ...s.inputs, freedomAge } })),
      setHouseholdSize: (householdSize) =>
        set((s) => ({ inputs: { ...s.inputs, householdSize } })),
      setAnnualExpensesOverride: (annualExpensesOverride) =>
        set((s) => ({ inputs: { ...s.inputs, annualExpensesOverride } })),
      setRetirementCountry: (retirementCountry) =>
        set((s) => ({ inputs: { ...s.inputs, retirementCountry } })),
      saveScenario: (name) =>
        set((s) => ({
          scenarios: [
            ...s.scenarios,
            {
              id: `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
              name: name.trim() || `Scenario ${s.scenarios.length + 1}`,
              createdAt: Date.now(),
              // Deep clone so later edits to live inputs don't mutate the snapshot.
              inputs: JSON.parse(JSON.stringify(s.inputs)) as UserState["inputs"],
            },
          ],
        })),
      applyScenario: (id) =>
        set((s) => {
          const scn = s.scenarios.find((x) => x.id === id);
          if (!scn) return s;
          return { inputs: { ...s.inputs, ...scn.inputs } };
        }),
      deleteScenario: (id) =>
        set((s) => ({ scenarios: s.scenarios.filter((x) => x.id !== id) })),
      addCheckin: (entry) =>
        set((s) => ({
          checkins: [
            ...s.checkins,
            { id: `c_${Date.now().toString(36)}`, ...entry },
          ].sort((a, b) => a.date.localeCompare(b.date)),
        })),
      deleteCheckin: (id) =>
        set((s) => ({ checkins: s.checkins.filter((x) => x.id !== id) })),
      addGoal: (entry) =>
        set((s) => ({
          goals: [
            ...s.goals,
            {
              id: `g_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
              createdAt: Date.now(),
              ...entry,
            },
          ].sort((a, b) => a.targetYear - b.targetYear),
        })),
      updateGoal: (id, patch) =>
        set((s) => ({
          goals: s.goals
            .map((g) => (g.id === id ? { ...g, ...patch } : g))
            .sort((a, b) => a.targetYear - b.targetYear),
        })),
      deleteGoal: (id) =>
        set((s) => ({ goals: s.goals.filter((x) => x.id !== id) })),
      addAsset: (entry) =>
        set((s) => ({
          assets: [
            ...s.assets,
            {
              id: `a_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
              updatedAt: Date.now(),
              ...entry,
            },
          ],
        })),
      updateAsset: (id, patch) =>
        set((s) => ({
          assets: s.assets.map((a) =>
            a.id === id ? { ...a, ...patch, updatedAt: Date.now() } : a,
          ),
        })),
      deleteAsset: (id) =>
        set((s) => ({ assets: s.assets.filter((a) => a.id !== id) })),
      addWindfall: (entry) =>
        set((s) => ({
          windfalls: [
            ...s.windfalls,
            {
              id: `w_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
              createdAt: Date.now(),
              ...entry,
            },
          ].sort((a, b) => a.targetYear - b.targetYear),
        })),
      deleteWindfall: (id) =>
        set((s) => ({ windfalls: s.windfalls.filter((x) => x.id !== id) })),
      addAiMessage: (msg) =>
        set((s) => ({
          aiMessages: [...s.aiMessages, { ...msg, timestamp: Date.now() }],
        })),
      clearAiMessages: () => set({ aiMessages: [] }),
      toggleTheme: () => set((s) => ({ theme: s.theme === "light" ? "dark" : "light" })),
      reset: () =>
        set({
          phase: "landing",
          dashboardTab: "overview",
          inputs: initialInputs,
          scenarios: [],
          checkins: [],
          goals: [],
          assets: [],
          windfalls: [],
          aiMessages: [],
        }),
    }),
    {
      name: "bcr-fin-freedom",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        phase: s.phase,
        dashboardTab: s.dashboardTab,
        inputs: s.inputs,
        scenarios: s.scenarios,
        checkins: s.checkins,
        goals: s.goals,
        assets: s.assets,
        windfalls: s.windfalls,
        aiMessages: s.aiMessages,
        theme: s.theme,
      }),
    },
  ),
);
