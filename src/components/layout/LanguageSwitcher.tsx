import { useState, useRef, useEffect } from "react";
import { Globe, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LANGUAGES, useI18n, type Language } from "@/i18n";

/**
 * Small globe button with a popover list of supported languages.
 * Uses native language names (हिन्दी, മലയാളം, العربية) so each option is
 * recognisable even to users who can't read the current UI language.
 */
export function LanguageSwitcher() {
  const { lang, setLang, t } = useI18n();
  const [open, setOpen] = useState(false);
  const popRef = useRef<HTMLDivElement>(null);

  // Close on outside click.
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (popRef.current && !popRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const current = LANGUAGES.find((l) => l.code === lang) ?? LANGUAGES[0];

  return (
    <div className="relative" ref={popRef}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen((o) => !o)}
        aria-label={t("languageSwitcher.label")}
        aria-expanded={open}
      >
        <Globe className="h-4 w-4" />
        <span className="hidden sm:inline">{current.nativeName}</span>
        <span className="sm:hidden">{current.flag}</span>
      </Button>
      {open && (
        <div
          role="listbox"
          className="absolute right-0 top-full z-50 mt-1 min-w-[180px] overflow-hidden rounded-md border border-border bg-popover shadow-lg"
        >
          {LANGUAGES.map((l) => {
            const isActive = l.code === lang;
            return (
              <button
                key={l.code}
                type="button"
                role="option"
                aria-selected={isActive}
                onClick={() => {
                  setLang(l.code as Language);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between gap-2 px-3 py-2 text-sm hover:bg-accent ${
                  isActive ? "bg-accent/40" : ""
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="text-base">{l.flag}</span>
                  <span>
                    <span className="font-medium">{l.nativeName}</span>
                    {l.nativeName !== l.name && (
                      <span className="ml-1 text-xs text-muted-foreground">
                        · {l.name}
                      </span>
                    )}
                  </span>
                </span>
                {isActive && <Check className="h-3.5 w-3.5 text-primary" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
