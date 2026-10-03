import { useState } from "react";
import { GraduationCap, Lightbulb, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const DISMISS_KEY = "bcr-fire-beginner-banner-dismissed";

/**
 * A friendly first-time banner shown on the dashboard until the user
 * dismisses it. The aim: tell someone with zero finance background what
 * to look at FIRST so they don't bounce off the 10-tab layout.
 *
 * Dismissal is persistent — once they click X, it never comes back.
 */
export function BeginnerBanner({ onOpenHelp }: { onOpenHelp?: () => void }) {
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
        className="absolute right-2 top-2 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
      >
        <X className="h-4 w-4" />
      </button>
      <div className="flex items-start gap-3 pr-6">
        <div className="rounded-lg bg-orange-500/20 p-2">
          <GraduationCap className="h-5 w-5 text-orange-600 dark:text-orange-400" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold">First time here? Read this 30-sec primer.</p>
          <p className="mt-1 text-xs text-muted-foreground">
            This app shows you <strong>how much money you need to stop working</strong> and{" "}
            <strong>how long it takes</strong> at your savings rate. That's it. Everything
            else is detail.
          </p>
          <ol className="mt-2 space-y-1 text-xs text-foreground">
            <li>
              <span className="font-semibold text-orange-600 dark:text-orange-400">①</span>{" "}
              Look at the <strong>big orange number</strong> on{" "}
              <strong>Overview</strong> / <strong>Freedom</strong> — that's your FIRE
              number.
            </li>
            <li>
              <span className="font-semibold text-orange-600 dark:text-orange-400">②</span>{" "}
              Open <strong>Life plan</strong> to see what to focus on in your current decade
              — money, health, relationships.
            </li>
            <li>
              <span className="font-semibold text-orange-600 dark:text-orange-400">③</span>{" "}
              Tweak the sliders in <strong>Fine-tune</strong> (right side) and watch
              everything recompute live.
            </li>
            <li>
              <span className="font-semibold text-orange-600 dark:text-orange-400">④</span>{" "}
              Stuck on jargon? Hover any{" "}
              <span className="border-b border-dotted border-current/60">
                underlined word
              </span>{" "}
              to see a plain-English explanation.
            </li>
          </ol>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              className="border-orange-500/50 text-xs"
              onClick={onOpenHelp}
            >
              <Lightbulb className="h-3.5 w-3.5" /> Open the full manual
            </Button>
            <Button size="sm" variant="ghost" className="text-xs" onClick={dismiss}>
              Got it
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
