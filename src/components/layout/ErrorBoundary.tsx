import React from "react";
import { AlertOctagon, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: React.ReactNode;
  onReset?: () => void;
}

interface State {
  error: Error | null;
}

/**
 * App-level error boundary.
 *
 * Catches render-time exceptions (e.g. bad localStorage shape after a schema
 * change, a chart data edge case, a missing asset in the allocation result)
 * and renders a recovery UI instead of a white screen.
 */
export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error): void {
    // Surfaced in dev tools — we avoid console noise in production.
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.error("BCR ErrorBoundary:", error);
    }
  }

  reset = () => {
    this.setState({ error: null });
    this.props.onReset?.();
  };

  resetAll = () => {
    try {
      window.localStorage.removeItem("bcr-fin-freedom");
    } catch {
      // Storage may be unavailable (private browsing, quota); fall through.
    }
    window.location.reload();
  };

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="container max-w-lg py-16">
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6">
          <div className="mb-3 flex items-center gap-2 text-destructive">
            <AlertOctagon className="h-5 w-5" />
            <h1 className="text-lg font-semibold">Something broke</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            BCR Fin Freedom hit an unexpected error while rendering. Your saved data is still
            on this device — you can try to recover, or reset everything and start over.
          </p>
          <pre className="mt-3 max-h-32 overflow-auto rounded-md bg-muted p-2 text-[11px] text-muted-foreground">
            {this.state.error.message}
          </pre>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button onClick={this.reset}>
              <RotateCcw className="h-4 w-4" />
              Try again
            </Button>
            <Button variant="outline" onClick={this.resetAll}>
              Clear data and reload
            </Button>
          </div>
        </div>
      </div>
    );
  }
}
