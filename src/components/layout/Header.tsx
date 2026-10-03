import { Flame } from "lucide-react";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { HelpDialog } from "@/components/layout/HelpDialog";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n";
import { useUserStore } from "@/store/userStore";

export function Header() {
  const phase = useUserStore((s) => s.phase);
  const reset = useUserStore((s) => s.reset);
  const setPhase = useUserStore((s) => s.setPhase);
  const { t } = useI18n();

  return (
    <header className="sticky top-0 z-30 w-full border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <button
          className="flex items-center gap-1.5 font-semibold tracking-tight"
          onClick={() => setPhase("landing")}
          aria-label="BibinCutRiver — BCR FIRE home"
        >
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-orange-500 to-red-600 text-white">
            <Flame className="h-4 w-4" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-[11px] font-normal text-muted-foreground">BibinCutRiver</span>
            <span className="text-sm sm:text-base">BCR FIRE</span>
          </span>
        </button>
        <div className="flex items-center gap-1">
          <LanguageSwitcher />
          <HelpDialog />
          {phase === "dashboard" && (
            <Button variant="ghost" size="sm" onClick={reset}>
              {t("common.startOver")}
            </Button>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
