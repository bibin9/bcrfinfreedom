import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { en } from "./translations/en";
import { hi } from "./translations/hi";
import { ml } from "./translations/ml";
import { ar } from "./translations/ar";
import type { I18nMsg } from "./msg";

export type { I18nMsg } from "./msg";
export { msg } from "./msg";

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
  /** Like t(), but returns `fallback` when no language has the key. */
  tOr: (key: string, fallback: string, vars?: Record<string, string | number>) => string;
  /** A translated list of strings (falls back to English, then to []). */
  tList: (key: string) => string[];
  /** Translate a message built by non-React code (see i18n/msg.ts). */
  tm: (m: I18nMsg) => string;
  /** Country name in the current language. */
  countryName: (code: string, fallback?: string) => string;
  /** City name in the current language (falls back to the English data name). */
  cityName: (countryCode: string, cityId: string, fallback: string) => string;
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

  const api = useMemo(() => {
    const dict = TRANSLATIONS[lang] ?? en;
    const fill = (s: string, vars?: Record<string, string | number>) =>
      vars ? s.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m)) : s;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const walk = (obj: any, key: string): any => {
      let cur = obj;
      for (const p of key.split(".")) {
        if (cur == null) return undefined;
        cur = cur[p];
      }
      return cur;
    };
    const lookup = (key: string): string | undefined => {
      const hit = walk(dict, key);
      if (typeof hit === "string") return hit;
      const fb = walk(en, key);
      return typeof fb === "string" ? fb : undefined;
    };
    const isList = (v: unknown): v is string[] =>
      Array.isArray(v) && v.every((x) => typeof x === "string");
    const tList = (key: string): string[] => {
      const hit = walk(dict, key);
      if (isList(hit)) return hit;
      const fb = walk(en, key);
      return isList(fb) ? fb : [];
    };
    const t = (key: string, vars?: Record<string, string | number>) => {
      const s = lookup(key);
      return s == null ? key : fill(s, vars);
    };
    const tOr = (key: string, fallback: string, vars?: Record<string, string | number>) => {
      const s = lookup(key);
      return fill(s ?? fallback, vars);
    };
    const tm = (m: I18nMsg) => {
      if (!m.vars) return t(m.key);
      const vars: Record<string, string | number> = {};
      for (const [k, v] of Object.entries(m.vars)) {
        if (k.endsWith("Key") && typeof v === "string") vars[k.slice(0, -3)] = t(v);
        else vars[k] = v;
      }
      return t(m.key, vars);
    };
    const countryName = (code: string, fallback?: string) =>
      tOr(`countries.${code}`, fallback ?? code);
    const cityName = (countryCode: string, cityId: string, fallback: string) =>
      tOr(`cities.${countryCode}.${cityId}`, fallback);
    return { t, tOr, tList, tm, countryName, cityName };
  }, [lang]);

  const value = useMemo<I18nContextValue>(
    () => ({ lang, setLang, dir, ...api }),
    [lang, api, dir],
  );
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

/** Hook — returns `{ t, lang, setLang, dir }`. */
export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
