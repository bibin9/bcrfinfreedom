import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

interface Props {
  title: string;
  /** Shown next to the title in muted colour. */
  subtitle?: string;
  /** Open by default? Defaults to false (collapsed). */
  defaultOpen?: boolean;
  /** Accent colour family — "neutral" (default) blends in; "orange" draws the eye. */
  accent?: "neutral" | "orange";
  children: ReactNode;
}

/**
 * A quiet "Show details ▸" fold. Used across the app to reduce visual density
 * on screens that have more content than a first-time user needs to see.
 *
 * Deliberately understated — the point of a density pass is that these DON'T
 * compete with the primary content for attention.
 */
export function Collapsible({
  title,
  subtitle,
  defaultOpen = false,
  accent = "neutral",
  children,
}: Props) {
  const [open, setOpen] = useState(defaultOpen);
  const borderClass =
    accent === "orange" ? "border-orange-500/20" : "border-border";
  return (
    <div className={`overflow-hidden rounded-lg border ${borderClass} bg-card`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between px-3 py-2.5 text-left text-sm font-medium hover:bg-muted/40"
      >
        <span className="flex items-center gap-2">
          <ChevronDown
            className={`h-4 w-4 text-muted-foreground transition-transform ${
              open ? "rotate-0" : "-rotate-90"
            }`}
          />
          <span>{title}</span>
          {subtitle && (
            <span className="hidden text-xs font-normal text-muted-foreground sm:inline">
              — {subtitle}
            </span>
          )}
        </span>
      </button>
      {open && <div className="border-t border-border px-3 py-3">{children}</div>}
    </div>
  );
}
