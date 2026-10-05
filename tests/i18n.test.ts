import { describe, it, expect } from "vitest";
import { en } from "@/i18n/translations/en";
import { hi } from "@/i18n/translations/hi";
import { ml } from "@/i18n/translations/ml";
import { ar } from "@/i18n/translations/ar";

type Dict = { [k: string]: string | string[] | Dict };

function flatten(d: Dict, prefix = ""): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(d)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (typeof v === "string") out[key] = v;
    else if (Array.isArray(v)) v.forEach((item, i) => (out[`${key}.${i}`] = item));
    else Object.assign(out, flatten(v, key));
  }
  return out;
}

const placeholders = (s: string) => (s.match(/\{\w+\}/g) ?? []).sort().join(",");
const EN = flatten(en as unknown as Dict);

describe.each([
  ["hi", hi],
  ["ml", ml],
  ["ar", ar],
])("%s translations", (_lang, dict) => {
  const flat = flatten(dict as unknown as Dict);

  it("has every English key, non-empty", () => {
    const missing = Object.keys(EN).filter((k) => !flat[k]?.trim());
    expect(missing).toEqual([]);
  });

  it("keeps the same {placeholders} as English", () => {
    const wrong = Object.keys(EN).filter((k) => placeholders(EN[k]) !== placeholders(flat[k] ?? ""));
    expect(wrong).toEqual([]);
  });
});
