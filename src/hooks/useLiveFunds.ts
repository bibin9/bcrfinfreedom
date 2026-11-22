import { useEffect, useMemo, useState } from "react";
import type { MutualFund } from "@/types";
import { fetchLiveReturns, mergeLive, type LiveReturns } from "@/lib/liveFunds";

export interface LiveFundsState {
  funds: MutualFund[];
  loading: boolean;
  liveCount: number;
  /** Latest NAV date across live funds (ISO), or null when nothing is live. */
  asOf: string | null;
}

export function useLiveFunds(curated: MutualFund[]): LiveFundsState {
  const [live, setLive] = useState<Record<number, LiveReturns>>({});
  const codes = useMemo(
    () => curated.flatMap((f) => (f.schemeCode ? [f.schemeCode] : [])),
    [curated],
  );
  const [loading, setLoading] = useState(codes.length > 0);

  useEffect(() => {
    if (codes.length === 0) {
      setLoading(false);
      return;
    }
    const ctrl = new AbortController();
    setLoading(true);
    fetchLiveReturns(codes, ctrl.signal)
      .then((r) => !ctrl.signal.aborted && setLive(r))
      .finally(() => !ctrl.signal.aborted && setLoading(false));
    return () => ctrl.abort();
  }, [codes]);

  return useMemo(() => {
    const funds = curated.map((f) => mergeLive(f, f.schemeCode ? live[f.schemeCode] : undefined));
    const dates = funds.flatMap((f) => (f.schemeCode && live[f.schemeCode] ? [live[f.schemeCode].navDate] : []));
    return {
      funds,
      loading,
      liveCount: dates.length,
      asOf: dates.length ? dates.sort().at(-1)! : null,
    };
  }, [curated, live, loading]);
}
