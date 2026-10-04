import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { en } from "./translations/en";
import { hi } from "./translations/hi";
import { ml } from "./translations/ml";
import { ar } from "./translations/ar";

export type Language = "en" | "hi" | "ml" | "ar";

export const LANGUAGES: Array<{
  code: Language;
  name: string;
  nativeName: string;
  flag: string;
  rtl?: boolean;
}> = [
  { code: "en", name: "English", nativeName: "English", flag: "🇬🇧" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", flag: "🇮🇳" },
  { code: "ml", name: "Malayalam", nativeName: "മലയാളം", flag: "🇮🇳" },
  { code: "ar", name: "Arabic", nativeName: "العربية", flag: "🇦🇪", rtl: true },
];

const TRANSLATIONS: Record<Language, typeof en> = { en, hi, ml, ar };

const STORAGE_KEY = "bcr-fire-lang";

// ---------------------------------------------------------------------------

interface I18nContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
  /**
   * Translator — looks up a dotted key path, falls back to English if missing.
   * `{name}` placeholders are filled from `vars`.
   */
  t: (key: string, vars?: Record<string, string | number>) => string;
  dir: "ltr" | "rtl";
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => {
    if (typeof window === "undefined") return "en";
    const stored = localStorage.getItem(STORAGE_KEY) as Language | null;
    if (stored && TRANSLATIONS[stored]) return stored;
    // Auto-detect from navigator.language.
    const nav = navigator.language?.toLowerCase() ?? "";
    if (nav.startsWith("hi")) return "hi";
    if (nav.startsWith("ml")) return "ml";
    if (nav.startsWith("ar")) return "ar";
    return "en";
  });

  const setLang = (next: Language) => {
    setLangState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore (private browsing) */
    }
  };

  const dir: "ltr" | "rtl" =
    LANGUAGES.find((l) => l.code === lang)?.rtl ? "rtl" : "ltr";

  // Set direction on <html> for proper layout of Arabic.
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("dir", dir);
      document.documentElement.setAttribute("lang", lang);
    }
  }, [dir, lang]);

  const t = useMemo(() => {
    const dict = TRANSLATIONS[lang] ?? en;
    const fallback = en;
    const fill = (s: string, vars?: Record<string, string | number>) =>
      vars ? s.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m)) : s;
    return (key: string, vars?: Record<string, string | number>): string => {
      const parts = key.split(".");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const walk = (obj: any): any => {
        let cur = obj;
        for (const p of parts) {
          if (cur == null) return undefined;
          cur = cur[p];
        }
        return cur;
      };
      const hit = walk(dict);
      if (typeof hit === "string") return fill(hit, vars);
      const fb = walk(fallback);
      if (typeof fb === "string") return fill(fb, vars);
      return key;
    };
  }, [lang]);

  const value = useMemo<I18nContextValue>(
    () => ({ lang, setLang, t, dir }),
    [lang, t, dir],
  );
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

/** Hook — returns `{ t, lang, setLang, dir }`. */
export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
