#!/usr/bin/env node
/**
 * Refresh public/data/us-etf-returns.json with real 3- and 5-year growth for the
 * US ETFs in the fund list. Run by a scheduled GitHub Action, or by hand:
 *
 *   node scripts/update-etf-returns.mjs
 *
 * No API key needed. If a ticker fails, its previous entry is kept (the app
 * ignores entries older than 7 days, so a stale number is never shown as live).
 */
import { readFile, writeFile } from "node:fs/promises";
import { computeEtfReturns, pointsFromYahoo } from "../src/lib/etfReturns.ts";

const TICKERS = ["VTI", "VOO", "VXUS", "BND", "VO", "VB", "SCHD", "QQQ", "VNQ", "VWO"];
const OUT = new URL("../public/data/us-etf-returns.json", import.meta.url);

async function previous() {
  try {
    return JSON.parse(await readFile(OUT, "utf8")).funds ?? {};
  } catch {
    return {};
  }
}

async function fetchTicker(t) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${t}?range=6y&interval=1d&events=div%7Csplit`;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 (compatible; bcr-fire-data)" } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const result = computeEtfReturns(pointsFromYahoo(await res.json()));
      if (!result) throw new Error("no usable history");
      return result;
    } catch (e) {
      if (attempt === 2) throw e;
      await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
    }
  }
}

const funds = await previous();
let ok = 0;
for (const t of TICKERS) {
  try {
    funds[t] = await fetchTicker(t);
    ok++;
    console.log(`${t}: 3y ${(funds[t].threeYearCagr * 100).toFixed(1)}%  5y ${(funds[t].fiveYearCagr * 100).toFixed(1)}%  (${funds[t].navDate})`);
  } catch (e) {
    console.warn(`${t}: kept previous (${e.message})`);
  }
}
if (ok === 0) {
  console.error("No ticker updated; leaving the file unchanged.");
  process.exit(1);
}
await writeFile(OUT, JSON.stringify({ source: "Yahoo Finance adjusted close (dividends reinvested)", updated: new Date().toISOString(), funds }, null, 2) + "\n");
console.log(`Wrote ${ok}/${TICKERS.length} tickers.`);
