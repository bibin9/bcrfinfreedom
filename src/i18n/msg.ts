/**
 * A translatable message produced by plain (non-React) code, e.g. the
 * allocation engine. The UI turns it into text with `tm()` from useI18n().
 *
 * Convention: a var whose name ends in "Key" holds another translation key
 * (a country, a goal…) and is translated too, then exposed without the
 * suffix — `{ countryKey: "countries.IN" }` fills `{country}`.
 */
export interface I18nMsg {
  key: string;
  vars?: Record<string, string | number>;
}

export function msg(key: string, vars?: Record<string, string | number>): I18nMsg {
  return { key, vars };
}
