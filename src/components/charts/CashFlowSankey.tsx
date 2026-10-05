import { useMemo, useState } from "react";
import type { CashFlowDataset } from "@/lib/cashflow";
import { layoutSankey, type SankeyLinkLayout, type SankeyNodeLayout } from "@/lib/sankey";
import type { CountryProfile } from "@/types";
import { formatCurrency } from "@/lib/formatters";
import { useI18n } from "@/i18n";

interface Props {
  data: CashFlowDataset;
  country: CountryProfile;
}

const CHART_HEIGHT = 320;

export function CashFlowSankey({ data, country }: Props) {
  const { t } = useI18n();
  const nodeLabel = (id: string) => data.nodes.find((n) => n.id === id)?.label ?? id;
  const [hoverLink, setHoverLink] = useState<string | null>(null);
  const [hoverNode, setHoverNode] = useState<string | null>(null);
  const [width, setWidth] = useState(700); // initial; will be overwritten by ResizeObserver

  const layout = useMemo(
    () =>
      layoutSankey(data.nodes, data.links, {
        width,
        height: CHART_HEIGHT,
        nodeWidth: 12,
        nodePadding: 10,
        labelPaddingLeft: 90,
        labelPaddingRight: 110,
      }),
    [data, width],
  );

  // Observe container width so the chart is responsive.
  const containerRef = (el: HTMLDivElement | null) => {
    if (!el) return;
    const w = el.getBoundingClientRect().width;
    if (w > 0 && Math.abs(w - width) > 2) setWidth(w);
  };

  return (
    <div ref={containerRef} className="w-full">
      <svg
        viewBox={`0 0 ${layout.width} ${layout.height}`}
        className="h-auto w-full"
        role="img"
        aria-label={t("dash.cashflow.aria")}
      >
        {/* Links first so they sit behind nodes */}
        {layout.links.map((link) => {
          const key = `${link.source}-${link.target}`;
          const isHover = hoverLink === key;
          const srcNode = layout.nodes.find((n) => n.id === link.source);
          const stroke = srcNode?.color ?? "220 9% 60%";
          return (
            <path
              key={key}
              d={link.path}
              fill="none"
              stroke={`hsl(${stroke})`}
              strokeWidth={link.thickness}
              strokeOpacity={isHover ? 0.75 : 0.35}
              onMouseEnter={() => setHoverLink(key)}
              onMouseLeave={() => setHoverLink(null)}
              style={{ cursor: "pointer", transition: "stroke-opacity 150ms" }}
            />
          );
        })}

        {/* Nodes */}
        {layout.nodes.map((node) => (
          <NodeRect
            key={node.id}
            node={node}
            country={country}
            hoverNode={hoverNode}
            onHoverStart={() => setHoverNode(node.id)}
            onHoverEnd={() => setHoverNode(null)}
            chartWidth={layout.width}
          />
        ))}

        {/* Hover tooltip for links */}
        {hoverLink && <LinkTooltip link={layout.links.find((l) => `${l.source}-${l.target}` === hoverLink)!} nodes={layout.nodes} country={country} />}
      </svg>

      {/* Legend */}
      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
        {data.totals.remittance > 0 && (
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-3 rounded-sm bg-pink-500" />
            {nodeLabel("remittance")}
          </span>
        )}
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-3 rounded-sm bg-red-500" />
          {t("dash.cashflow.node.essentials")}
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-3 rounded-sm bg-amber-500" />
          {t("dash.cashflow.node.discretionary")}
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-3 rounded-sm bg-purple-500" />
          {t("dash.cashflow.node.buffer")}
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-3 rounded-sm bg-emerald-500" />
          {t("dash.cashflow.node.savings")}
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-3 rounded-sm bg-blue-500" />
          {t("dash.cashflow.legendGoals")}
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-3 rounded-sm bg-orange-500" />
          {t("dash.cashflow.legendFire")}
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------

function NodeRect({
  node,
  country,
  onHoverStart,
  onHoverEnd,
  chartWidth,
}: {
  node: SankeyNodeLayout;
  country: CountryProfile;
  hoverNode: string | null;
  onHoverStart: () => void;
  onHoverEnd: () => void;
  chartWidth: number;
}) {
  // Label sits on the OUTSIDE of each node (left column → label on left,
  // middle column → label right, right column → label right).
  const isLeftCol = node.column === 0;
  const labelX = isLeftCol ? node.x - 6 : node.x + node.width + 6;
  const labelAnchor = isLeftCol ? "end" : "start";
  const sublabelY = node.y + node.height + 12;

  const centerY = node.y + node.height / 2;

  return (
    <g onMouseEnter={onHoverStart} onMouseLeave={onHoverEnd}>
      <rect
        x={node.x}
        y={node.y}
        width={node.width}
        height={node.height}
        fill={`hsl(${node.color})`}
        rx={2}
      />
      <text
        x={labelX}
        y={centerY}
        textAnchor={labelAnchor}
        dominantBaseline="middle"
        fontSize={11}
        fontWeight={600}
        fill="hsl(var(--foreground))"
      >
        {truncate(node.label, isLeftCol ? 14 : 20)}
      </text>
      <text
        x={labelX}
        y={centerY + 14}
        textAnchor={labelAnchor}
        dominantBaseline="middle"
        fontSize={10}
        fill="hsl(var(--muted-foreground))"
      >
        {formatCurrency(node.value, country, { compact: true })}
      </text>
      {node.sub && node.column === 0 && (
        <text
          x={labelX}
          y={sublabelY}
          textAnchor={labelAnchor}
          dominantBaseline="middle"
          fontSize={9}
          fill="hsl(var(--muted-foreground))"
          fontStyle="italic"
        >
          {node.sub}
        </text>
      )}
      {/* Hide centre column sublabels to avoid clutter — only show on hover */}
      {node.sub && node.column > 0 && node.height > 24 && (
        <text
          x={labelX}
          y={centerY + 26}
          textAnchor={labelAnchor}
          dominantBaseline="middle"
          fontSize={9}
          fill="hsl(var(--muted-foreground))"
        >
          {truncate(node.sub, 22)}
        </text>
      )}
      {/* Suppress unused warning */}
      <title>{`${node.label} · ${formatCurrency(node.value, country, { compact: true })}`}</title>
      <desc>column {node.column}, chart width {chartWidth}</desc>
    </g>
  );
}

function LinkTooltip({
  link,
  nodes,
  country,
}: {
  link: SankeyLinkLayout;
  nodes: SankeyNodeLayout[];
  country: CountryProfile;
}) {
  const src = nodes.find((n) => n.id === link.source);
  const tgt = nodes.find((n) => n.id === link.target);
  if (!src || !tgt) return null;
  const midX = (src.x + src.width + tgt.x) / 2;
  const midY = (link.sourceY + link.targetY) / 2;
  const label = `${src.label} → ${tgt.label}: ${formatCurrency(link.value, country, { compact: true })}`;
  const w = label.length * 6 + 12;
  return (
    <g pointerEvents="none">
      <rect
        x={midX - w / 2}
        y={midY - 14}
        width={w}
        height={20}
        fill="hsl(var(--card))"
        stroke="hsl(var(--border))"
        rx={4}
      />
      <text
        x={midX}
        y={midY - 1}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={11}
        fontWeight={600}
        fill="hsl(var(--foreground))"
      >
        {label}
      </text>
    </g>
  );
}

function truncate(s: string, n: number) {
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}
