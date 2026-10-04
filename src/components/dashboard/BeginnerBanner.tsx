import { useState } from "react";
import { GraduationCap, Lightbulb, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n";

const DISMISS_KEY = "bcr-fire-beginner-banner-dismissed";

/**
 * A friendly first-time banner shown on the dashboard until the user
 * dismisses it. The aim: tell someone with zero finance background what
 * to look at FIRST so they don't bounce off the 10-tab layout.
 *
 * Dismissal is persistent — once they click X, it never comes back.
 */
export function BeginnerBanner({ onOpenHelp }: { onOpenHelp?: () => void }) {
  const { t } = useI18n();
  const [visible, setVisible] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(DISMISS_KEY) !== "1";
  });

  if (!visible) return null;

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, "1");
    setVisible(false);
  };

  return (
    <div className="relative mb-3 overflow-hidden rounded-lg border-2 border-orange-500/40 bg-gradient-to-br from-orange-500/15 via-orange-500/5 to-red-500/5 p-3 sm:p-4">
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss beginner guide"
        className="absolute end-2 top-2 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
      >
        <X className="h-4 w-4" />
      </button>
      <div className="flex items-start gap-3 pe-6">
        <div className="rounded-lg bg-orange-500/20 p-2">
          <GraduationCap className="h-5 w-5 text-orange-600 dark:text-orange-400" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold">{t("beginner.title")}</p>
          <p className="mt-1 text-xs text-muted-foreground">{t("beginner.body")}</p>
          <ol className="mt-2 space-y-1 text-xs text-foreground">
            {(["step1", "step2", "step3", "step4"] as const).map((k, i) => (
              <li key={k}>
                <span className="font-semibold text-orange-600 dark:text-orange-400">
                  {"①②③④"[i]}
                </span>{" "}
                {t(`beginner.${k}`)}
              </li>
            ))}
          </ol>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              className="border-orange-500/50 text-xs"
              onClick={onOpenHelp}
            >
              <Lightbulb className="h-3.5 w-3.5" /> {t("beginner.openManual")}
            </Button>
            <Button size="sm" variant="ghost" className="text-xs" onClick={dismiss}>
              {t("common.gotIt")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
