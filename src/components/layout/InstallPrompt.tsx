import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "bcr-fire-install-dismissed";

/**
 * Shows a small install banner when the browser fires `beforeinstallprompt`
 * (Chrome / Edge on Android / Desktop). Hidden once dismissed for 7 days, or
 * once the app is already installed (display-mode: standalone).
 */
export function InstallPrompt() {
  const [evt, setEvt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Already running as an installed PWA — nothing to prompt.
    if (typeof window !== "undefined" && window.matchMedia("(display-mode: standalone)").matches) {
      return;
    }
    // Recently dismissed?
    const dismissed = localStorage.getItem(DISMISS_KEY);
    if (dismissed && Date.now() - Number(dismissed) < 7 * 24 * 60 * 60 * 1000) {
      return;
    }

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setEvt(e as BeforeInstallPromptEvent);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  if (!visible || !evt) return null;

  const onInstall = async () => {
    await evt.prompt();
    const choice = await evt.userChoice;
    if (choice.outcome === "dismissed") {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    }
    setVisible(false);
    setEvt(null);
  };

  const onDismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setVisible(false);
  };

  return (
    <div className="fixed bottom-3 left-3 right-3 z-50 mx-auto max-w-md rounded-xl border border-orange-500/40 bg-card/95 p-3 shadow-2xl backdrop-blur sm:bottom-4 sm:left-auto sm:right-4">
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-orange-500/15 p-2">
          <Download className="h-5 w-5 text-orange-600 dark:text-orange-400" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">Install BCR FIRE</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Works offline · launches like a native app · no app store needed.
          </p>
          <div className="mt-2 flex gap-2">
            <Button size="sm" onClick={onInstall} className="bg-orange-600 hover:bg-orange-700">
              Install
            </Button>
            <Button size="sm" variant="outline" onClick={onDismiss}>
              Not now
            </Button>
          </div>
        </div>
        <button
          type="button"
          aria-label="Dismiss install prompt"
          onClick={onDismiss}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
