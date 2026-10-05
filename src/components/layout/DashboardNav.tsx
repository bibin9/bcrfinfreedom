import { useEffect, useRef } from "react";
import {
  BookOpen,
  Bitcoin,
  CalendarCheck,
  Compass,
  Coins,
  Goal as GoalIcon,
  GitBranch,
  HeartPulse,
  LineChart,
  PieChart,
  Rocket,
  Sprout,
  Target,
  TrendingUp,
  Wallet,
  Zap,
} from "lucide-react";
import type { DashboardSection, DashboardTab } from "@/store/userStore";
import { SECTION_DEFAULT_TAB, TAB_TO_SECTION } from "@/store/userStore";
import { useI18n } from "@/i18n";

interface Props {
  active: DashboardTab;
  onChange: (tab: DashboardTab) => void;
  showNRI: boolean;
}

interface TabDef {
  id: DashboardTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface SectionDef {
  id: DashboardSection;
  label: string;
  tagline: string;
  icon: React.ComponentType<{ className?: string }>;
}

const SECTIONS: SectionDef[] = [
  { id: "plan", label: "Plan", tagline: "What's your FIRE number?", icon: Compass },
  { id: "grow", label: "Grow", tagline: "How to compound it", icon: Sprout },
  { id: "live", label: "Live", tagline: "Track and act", icon: Rocket },
];

const TABS: TabDef[] = [
  // PLAN
  { id: "overview", label: "Overview", icon: Compass },
  { id: "lifeplan", label: "Life plan", icon: HeartPulse },
  { id: "goals", label: "Goals", icon: GoalIcon },
  { id: "freedom", label: "Freedom", icon: Target },
  // GROW
  { id: "assets", label: "My assets", icon: Coins },
  { id: "allocation", label: "Allocation", icon: PieChart },
  { id: "funds", label: "Funds", icon: Wallet },
  { id: "compounding", label: "Compounding", icon: TrendingUp },
  // LIVE
  { id: "reality", label: "Reality check", icon: Zap },
  { id: "tracker", label: "Tracker", icon: CalendarCheck },
  { id: "paths", label: "Two paths", icon: GitBranch },
  { id: "crypto", label: "Crypto", icon: Bitcoin },
  { id: "start", label: "Start guide", icon: BookOpen },
  { id: "nri", label: "NRI options", icon: LineChart },
];

/**
 * Two-level dashboard navigation:
 *   1. 3 big section buttons (PLAN / GROW / LIVE) — the primary mental model
 *   2. Sub-nav of pill tabs inside the active section
 *
 * This replaces the old flat 14-tab strip. Users no longer scroll through
 * a horizontal pill soup to find what they want — they pick a section
 * first (3 options), then a tab within it (3-6 options).
 */
export function DashboardNav({ active, onChange, showNRI }: Props) {
  const { t } = useI18n();
  const activeSection: DashboardSection = TAB_TO_SECTION[active];
  const scrollerRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  const tabsInSection = TABS.filter((t) => {
    if (TAB_TO_SECTION[t.id] !== activeSection) return false;
    if (t.id === "nri" && !showNRI) return false;
    return true;
  });

  // Keep the active sub-tab in view (mobile horizontal scroll).
  useEffect(() => {
    activeRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [active]);

  const onPickSection = (sec: DashboardSection) => {
    // When the user switches sections, land them on that section's default
    // tab — unless they're already on a tab inside the target section.
    if (TAB_TO_SECTION[active] === sec) return;
    onChange(SECTION_DEFAULT_TAB[sec]);
  };

  return (
    <nav
      aria-label={t("dash.shell.sectionsAria")}
      className="sticky top-14 z-30 -mx-3 border-b border-border bg-background/90 px-3 backdrop-blur supports-[backdrop-filter]:bg-background/70 sm:mx-0 sm:rounded-lg sm:border sm:bg-card sm:px-2"
    >
      {/* LEVEL 1 — 3 super-section buttons */}
      <div className="grid grid-cols-3 gap-1 py-2" role="tablist">
        {SECTIONS.map((s) => {
          const Icon = s.icon;
          const isActive = s.id === activeSection;
          return (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onPickSection(s.id)}
              className={[
                "flex flex-col items-center justify-center gap-0.5 rounded-md px-2 py-2 text-xs font-semibold transition sm:flex-row sm:gap-1.5 sm:text-sm",
                isActive
                  ? "bg-orange-600 text-white shadow-sm"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              ].join(" ")}
            >
              <Icon className="h-4 w-4" />
              <span>{t(`nav.${s.id}`)}</span>
              <span className="hidden text-[10px] font-normal opacity-70 sm:inline">
                · {t(`nav.${s.id}Tagline`)}
              </span>
            </button>
          );
        })}
      </div>

      {/* LEVEL 2 — sub-nav for the active section */}
      <div
        ref={scrollerRef}
        className="flex gap-1 overflow-x-auto border-t border-border py-2 scrollbar-none"
        style={{ scrollbarWidth: "none" }}
      >
        {tabsInSection.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.id === active;
          return (
            <button
              key={tab.id}
              ref={isActive ? activeRef : undefined}
              type="button"
              onClick={() => onChange(tab.id)}
              aria-current={isActive ? "page" : undefined}
              className={[
                "flex flex-none items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition sm:text-sm",
                isActive
                  ? "bg-orange-500/15 text-orange-700 ring-1 ring-orange-500/40 dark:text-orange-300"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              ].join(" ")}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{t(`nav.${tab.id}`)}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
