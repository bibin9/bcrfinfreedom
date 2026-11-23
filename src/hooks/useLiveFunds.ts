import { useEffect, useMemo, useState } from "react";
import type { MutualFund } from "@/types";
import { fetchEtfReturns, fetchLiveReturns, mergeLive, type LiveReturns } from "@/lib/liveFunds";

export interface LiveFundsState {
  funds: MutualFund[];
  loading: boolean;
  liveCount: number;
  /** Latest price date across live funds (ISO), or null when nothing is live. */
  asOf: string | null;
}

/** Key used to look a fund up in the live results. */
const keyOf = (f: MutualFund): string | null =>
  f.schemeCode ? `mf:${f.schemeCode}` : f.ticker ? `us:${f.ticker}` : null;

export function useLiveFunds(curated: MutualFund[]): LiveFundsState {
  const [live, setLive] = useState<Record<string, LiveReturns>>({});
  const codes = useMemo(() => curated.flatMap((f) => (f.schemeCode ? [f.schemeCode] : [])), [curated]);
  const hasTickers = useMemo(() => curated.some((f) => f.ticker), [curated]);
  const wantsLive = codes.length > 0 || hasTickers;
  const [loading, setLoading] = useState(wantsLive);

  useEffect(() => {
    if (!wantsLive) {
      setLoading(false);
      return;
    }
    const ctrl = new AbortController();
    setLoading(true);
    Promise.all([
      codes.length ? fetchLiveReturns(codes, ctrl.signal) : Promise.resolve({} as Record<number, LiveReturns>),
      hasTickers ? fetchEtfReturns(ctrl.signal) : Promise.resolve({} as Record<string, LiveReturns>),
    ])
      .then(([mf, us]) => {
        if (ctrl.signal.aborted) return;
        const next: Record<string, LiveReturns> = {};
        for (const [code, v] of Object.entries(mf)) next[`mf:${code}`] = v;
        for (const [ticker, v] of Object.entries(us)) next[`us:${ticker}`] = v;
        setLive(next);
      })
      .finally(() => !ctrl.signal.aborted && setLoading(false));
    return () => ctrl.abort();
  }, [codes, hasTickers, wantsLive]);

  return useMemo(() => {
    const funds = curated.map((f) => {
      const k = keyOf(f);
      return mergeLive(f, k ? live[k] : undefined);
    });
    const dates = funds.flatMap((f) => {
      const k = keyOf(f);
      return f.live && k && live[k] ? [live[k].navDate] : [];
    });
    return {
      funds,
      loading,
      liveCount: dates.length,
      asOf: dates.length ? dates.sort().at(-1)! : null,
    };
  }, [curated, live, loading]);
}
