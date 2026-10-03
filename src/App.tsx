import { lazy, Suspense, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { I18nProvider } from "@/i18n";
import { Header } from "@/components/layout/Header";
import { ErrorBoundary } from "@/components/layout/ErrorBoundary";
import { InstallPrompt } from "@/components/layout/InstallPrompt";
import { FeedbackDialog } from "@/components/layout/FeedbackDialog";
import { AIChatButton } from "@/components/dashboard/AIChatButton";
import { Landing } from "@/pages/Landing";
import { Onboarding } from "@/pages/Onboarding";
import { Reveal } from "@/pages/Reveal";
import { useUserStore } from "@/store/userStore";

// The Dashboard imports every chart card (Recharts ≈ 420 KB). Lazy-load it so
// Landing/Onboarding/Reveal don't pay that cost on the first paint.
const Dashboard = lazy(() =>
  import("@/pages/Dashboard").then((m) => ({ default: m.Dashboard })),
);

export default function App() {
  const phase = useUserStore((s) => s.phase);
  const theme = useUserStore((s) => s.theme);
  const reset = useUserStore((s) => s.reset);

  // Ensure <html> has the right theme class on first render (before ThemeToggle mounts).
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
  }, [theme]);

  return (
    <I18nProvider>
      <TooltipProvider>
      <div className="min-h-screen bg-background text-foreground">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
        >
          Skip to main content
        </a>
        <Header />
        <main id="main">
          <ErrorBoundary onReset={reset}>
            {phase === "landing" && <Landing />}
            {phase === "onboarding" && <Onboarding />}
            {phase === "reveal" && <Reveal />}
            {phase === "dashboard" && (
              <Suspense
                fallback={
                  <div className="container flex items-center justify-center py-24 text-muted-foreground">
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Loading your plan…
                  </div>
                }
              >
                <Dashboard />
              </Suspense>
            )}
          </ErrorBoundary>
        </main>
        <footer className="container mt-16 border-t border-border py-6 text-center text-xs text-muted-foreground">
          <p>
            🔥 <strong className="text-foreground">BCR FIRE</strong> — built by a UAE-based
            banking-payments IT developer who built the FIRE tool he needed himself.
          </p>
          <p className="mt-1">
            Educational use only · Not financial advice · © BibinCutRiver
          </p>
          <p className="mt-2">
            <FeedbackDialog />
          </p>
        </footer>
        <InstallPrompt />
        <AIChatButton />
      </div>
      </TooltipProvider>
    </I18nProvider>
  );
}
