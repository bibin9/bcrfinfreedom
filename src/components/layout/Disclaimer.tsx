import { AlertTriangle } from "lucide-react";
import type { CountryProfile } from "@/types";

interface Props {
  country?: CountryProfile;
  compact?: boolean;
}

export function Disclaimer({ country, compact = false }: Props) {
  return (
    <div
      role="note"
      aria-label="Legal disclaimer"
      className={`flex gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100 ${
        compact ? "" : "leading-relaxed"
      }`}
    >
      <AlertTriangle className="mt-0.5 h-4 w-4 flex-none" aria-hidden />
      <div className="space-y-1">
        <p>
          <strong>Educational purposes only — not financial advice.</strong> BCR Fin Freedom
          does not recommend individual securities. Always consult a licensed financial advisor
          before investing. Past performance does not guarantee future returns.
        </p>
        {country && <p className="opacity-90">{country.disclaimer}</p>}
      </div>
    </div>
  );
}
