import { useMemo, useState } from "react";
import { CheckCircle2, Coins, Plus, Sparkles, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Asset, AssetCategory, CountryProfile } from "@/types";
import { formatCurrency } from "@/lib/formatters";
import {
  ASSET_CATEGORIES,
  assetsByCategory,
  categoryMeta,
  liquidAssetsValue,
  presetsForCountry,
  totalAssetsValue,
} from "@/lib/assets";
import { useUserStore } from "@/store/userStore";

interface Props {
  /** Resident country — assets are denominated in its currency. */
  residentCountry: CountryProfile;
}

export function AssetsCard({ residentCountry }: Props) {
  const assets = useUserStore((s) => s.assets);
  const addAsset = useUserStore((s) => s.addAsset);
  const updateAsset = useUserStore((s) => s.updateAsset);
  const deleteAsset = useUserStore((s) => s.deleteAsset);

  const [name, setName] = useState("");
  const [category, setCategory] = useState<AssetCategory>("stocks_mf");
  const [value, setValue] = useState("");
  const [liquid, setLiquid] = useState(true);
  const [justAdded, setJustAdded] = useState<string | null>(null);

  const totals = useMemo(
    () => ({
      total: totalAssetsValue(assets),
      liquid: liquidAssetsValue(assets),
      byCat: assetsByCategory(assets),
    }),
    [assets],
  );

  const illiquidTotal = totals.total - totals.liquid;
  const presets = presetsForCountry(residentCountry.code);

  const onAdd = () => {
    const v = Number(value);
    if (!Number.isFinite(v) || v <= 0) return;
    const n = name.trim() || categoryMeta(category).label;
    addAsset({ name: n, category, currentValue: v, liquid });
    setName("");
    setValue("");
    setJustAdded(n);
    setTimeout(() => setJustAdded(null), 2500);
  };

  const applyPreset = (p: (typeof presets)[number]) => {
    setName(p.name);
    setCategory(p.category);
    setLiquid(p.liquid);
    // Scroll to form (if needed via ref later)
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coins className="h-5 w-5 text-amber-500" />
          My assets — what you actually own
          <span className="ml-auto rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            Replaces manual corpus
          </span>
        </CardTitle>
        <CardDescription>
          Add each real holding separately — EPF balance, FDs, gold, mutual-fund portfolio,
          property. We'll sum your <strong>liquid</strong> ones to auto-fill the FIRE calc.
          Property and endowment-style LIC are tracked but marked illiquid (they don't fund
          4%-rule withdrawals).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* HERO totals */}
        <div className="grid gap-2 sm:grid-cols-3">
          <TotalTile
            label="Total net worth"
            value={formatCurrency(totals.total, residentCountry, { compact: true })}
            hint={`Across ${assets.length} asset${assets.length === 1 ? "" : "s"}`}
            accent="emerald"
          />
          <TotalTile
            label="Liquid corpus"
            value={formatCurrency(totals.liquid, residentCountry, { compact: true })}
            hint="Counts toward FIRE withdrawals"
            accent="orange"
            emphasise
          />
          <TotalTile
            label="Illiquid holdings"
            value={formatCurrency(illiquidTotal, residentCountry, { compact: true })}
            hint="Property, endowment LIC — not withdrawable"
            accent="gray"
          />
        </div>

        {assets.length > 0 && (
          <div className="rounded-md border border-amber-500/30 bg-amber-500/5 p-2.5 text-xs">
            <strong>Your FIRE calc now uses the liquid total above.</strong> The "Current
            invested corpus" field in Fine-tune is ignored when assets are present — update
            values here instead.
          </div>
        )}

        {/* Add form */}
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
          <p className="text-xs font-semibold">Add an asset</p>
          <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-[2fr_1fr_1fr_auto_auto]">
            <div>
              <Label htmlFor="a-name" className="text-[11px]">
                Name
              </Label>
              <Input
                id="a-name"
                placeholder="e.g. HDFC EPF"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-background"
              />
            </div>
            <div>
              <Label htmlFor="a-cat" className="text-[11px]">
                Category
              </Label>
              <Select value={category} onValueChange={(v) => setCategory(v as AssetCategory)}>
                <SelectTrigger id="a-cat" className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ASSET_CATEGORIES.map((c) => {
                    const m = categoryMeta(c);
                    return (
                      <SelectItem key={c} value={c}>
                        {m.emoji} {m.label}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="a-val" className="text-[11px]">
                Current value ({residentCountry.currency})
              </Label>
              <Input
                id="a-val"
                type="number"
                min={0}
                value={value}
                placeholder="e.g. 850000"
                onChange={(e) => setValue(e.target.value)}
                className="bg-background"
              />
            </div>
            <div className="flex flex-col justify-end">
              <label className="flex items-center gap-1.5 text-[11px]">
                <input
                  type="checkbox"
                  checked={liquid}
                  onChange={(e) => setLiquid(e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-border"
                />
                Liquid
              </label>
            </div>
            <div className="flex items-end">
              <Button
                onClick={onAdd}
                disabled={!value || Number(value) <= 0}
                className="w-full bg-amber-600 hover:bg-amber-700"
              >
                <Plus className="h-4 w-4" /> Add
              </Button>
            </div>
          </div>
          {justAdded && (
            <p className="mt-2 flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" /> Added "{justAdded}"
            </p>
          )}
        </div>

        {/* Country-aware presets */}
        <div>
          <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            Common holdings in {residentCountry.name} — tap to pre-fill the form
          </p>
          <div className="flex flex-wrap gap-1.5">
            {presets.map((p) => {
              const m = categoryMeta(p.category);
              return (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => applyPreset(p)}
                  className="rounded-full border border-border bg-background px-2.5 py-1 text-xs hover:border-amber-500/40 hover:bg-amber-500/5"
                >
                  {m.emoji} {p.name}
                  {!p.liquid && (
                    <span className="ml-1 text-[10px] text-muted-foreground">illiquid</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Assets table */}
        {assets.length === 0 ? (
          <EmptyHint>
            No assets yet. Try tapping <strong>"EPF"</strong> or{" "}
            <strong>"Mutual Fund portfolio"</strong> above to see how it looks. Add 3-5
            holdings and we'll auto-sum them into your FIRE corpus.
          </EmptyHint>
        ) : (
          <AssetsTable
            assets={assets}
            residentCountry={residentCountry}
            onUpdate={updateAsset}
            onDelete={deleteAsset}
          />
        )}

        {/* Category breakdown */}
        {totals.byCat.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Where your money sits
            </p>
            <div className="space-y-1.5">
              {totals.byCat.map((b) => (
                <div key={b.category} className="rounded-md border border-border p-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium">
                      {b.emoji} {b.label}
                    </span>
                    <span className="tabular-nums text-muted-foreground">
                      {formatCurrency(b.value, residentCountry, { compact: true })} ·{" "}
                      <strong className="text-foreground">{b.pct}%</strong>
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full bg-amber-500"
                      style={{ width: `${Math.min(100, b.pct)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Advice */}
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 text-xs">
          <p className="font-semibold">Why track assets individually?</p>
          <ul className="mt-1 list-disc space-y-0.5 pl-4 text-muted-foreground">
            <li>
              A single "Current corpus" number hides diversification problems — 90% in gold
              is as risky as 90% in one stock.
            </li>
            <li>
              Marking property / LIC as <strong>illiquid</strong> stops them inflating your
              FIRE number — you can't live on a flat.
            </li>
            <li>
              Update values quarterly on the Tracker tab — same cadence as check-ins.
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

// --------------------------------------------------------------------------

function AssetsTable({
  assets,
  residentCountry,
  onUpdate,
  onDelete,
}: {
  assets: Asset[];
  residentCountry: CountryProfile;
  onUpdate: (id: string, patch: Partial<Asset>) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div>
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Your holdings ({assets.length})
      </p>
      <div className="overflow-x-auto rounded-md border border-border">
        <table className="w-full text-xs">
          <thead className="bg-muted/40 uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-2 py-1.5 text-left font-medium">Asset</th>
              <th className="px-2 py-1.5 text-left font-medium">Category</th>
              <th className="px-2 py-1.5 text-right font-medium">Value</th>
              <th className="px-2 py-1.5 text-center font-medium">Liquid?</th>
              <th className="px-2 py-1.5"></th>
            </tr>
          </thead>
          <tbody>
            {assets.map((a) => {
              const m = categoryMeta(a.category);
              return (
                <tr key={a.id} className="border-t border-border">
                  <td className="px-2 py-1.5 font-medium">{a.name}</td>
                  <td className="px-2 py-1.5 text-muted-foreground">
                    {m.emoji} {m.label}
                  </td>
                  <td className="px-2 py-1.5 text-right tabular-nums">
                    <input
                      type="number"
                      min={0}
                      value={a.currentValue}
                      onChange={(e) =>
                        onUpdate(a.id, { currentValue: Number(e.target.value) || 0 })
                      }
                      className="w-28 rounded border border-border bg-background px-1.5 py-0.5 text-right"
                      aria-label={`Current value for ${a.name}`}
                    />
                    <div className="text-[10px] text-muted-foreground">
                      {formatCurrency(a.currentValue, residentCountry, { compact: true })}
                    </div>
                  </td>
                  <td className="px-2 py-1.5 text-center">
                    <input
                      type="checkbox"
                      checked={a.liquid}
                      onChange={(e) => onUpdate(a.id, { liquid: e.target.checked })}
                      className="h-4 w-4 rounded border-border"
                      aria-label={`Liquid toggle for ${a.name}`}
                    />
                  </td>
                  <td className="px-2 py-1.5 text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      aria-label="Delete asset"
                      onClick={() => onDelete(a.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5 text-red-500" />
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TotalTile({
  label,
  value,
  hint,
  accent,
  emphasise,
}: {
  label: string;
  value: string;
  hint: string;
  accent: "emerald" | "orange" | "gray";
  emphasise?: boolean;
}) {
  const color =
    accent === "emerald"
      ? "text-emerald-600 dark:text-emerald-400"
      : accent === "orange"
        ? "text-orange-600 dark:text-orange-400"
        : "text-foreground";
  const border = emphasise
    ? "border-2 border-orange-500/50 bg-orange-500/5"
    : "border border-border bg-card";
  return (
    <div className={`rounded-lg p-3 ${border}`}>
      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={`mt-1 text-base font-bold tabular-nums sm:text-lg ${color}`}>{value}</p>
      <p className="mt-0.5 text-[11px] text-muted-foreground">{hint}</p>
    </div>
  );
}

function EmptyHint({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-dashed border-border bg-muted/30 p-3 text-xs text-muted-foreground">
      {children}
    </div>
  );
}
