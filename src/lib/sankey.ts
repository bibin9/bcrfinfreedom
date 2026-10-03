/**
 * Lightweight Sankey layout engine. Pure math — no DOM, no deps.
 *
 * The one unusual constraint for this app: we want the user to be able to add
 * a dozen goals and still get a readable chart. So the layout:
 *   - lays nodes out column-by-column
 *   - computes vertical positions proportional to value
 *   - resolves overlap by stacking within each column
 *   - produces smooth S-curve paths between source and target
 *
 * The output is plain data — the React component just renders it to SVG.
 */

export interface SankeyNode {
  id: string;
  label: string;
  /** 0-indexed column (left → right). */
  column: number;
  /** HSL colour string, e.g. "24 95% 53%". */
  color: string;
  /** Optional small sublabel shown under the main label. */
  sub?: string;
}

export interface SankeyLink {
  source: string; // node id
  target: string; // node id
  value: number; // flow amount in whatever currency unit
}

export interface SankeyNodeLayout extends SankeyNode {
  x: number;
  y: number;
  width: number;
  height: number;
  value: number; // sum of in or out, whichever is larger
}

export interface SankeyLinkLayout extends SankeyLink {
  path: string; // SVG `d` attribute for a bezier S-curve
  sourceY: number;
  targetY: number;
  thickness: number;
}

export interface SankeyLayoutOptions {
  width: number;
  height: number;
  /** Width of each node rectangle (px). */
  nodeWidth?: number;
  /** Vertical gap between stacked nodes in a column (px). */
  nodePadding?: number;
  /** Horizontal padding reserved for labels on both sides. */
  labelPaddingLeft?: number;
  labelPaddingRight?: number;
}

export interface SankeyLayout {
  nodes: SankeyNodeLayout[];
  links: SankeyLinkLayout[];
  width: number;
  height: number;
}

export function layoutSankey(
  nodes: SankeyNode[],
  links: SankeyLink[],
  opts: SankeyLayoutOptions,
): SankeyLayout {
  const {
    width,
    height,
    nodeWidth = 14,
    nodePadding = 8,
    labelPaddingLeft = 100,
    labelPaddingRight = 110,
  } = opts;

  // Compute flow through each node = max(in, out)
  const inSum = new Map<string, number>();
  const outSum = new Map<string, number>();
  for (const l of links) {
    outSum.set(l.source, (outSum.get(l.source) ?? 0) + l.value);
    inSum.set(l.target, (inSum.get(l.target) ?? 0) + l.value);
  }

  // Group by column
  const columns = new Map<number, SankeyNode[]>();
  for (const n of nodes) {
    const arr = columns.get(n.column) ?? [];
    arr.push(n);
    columns.set(n.column, arr);
  }
  const columnIndices = [...columns.keys()].sort((a, b) => a - b);
  const nCols = columnIndices.length;

  // Compute X per column
  const innerWidth = Math.max(0, width - labelPaddingLeft - labelPaddingRight);
  const colSpacing = nCols > 1 ? innerWidth / (nCols - 1) : 0;
  const colX = (col: number): number => {
    const idx = columnIndices.indexOf(col);
    return labelPaddingLeft + idx * colSpacing;
  };

  // Compute each column's total value and value→px scale (same for all columns)
  const columnTotals = columnIndices.map((c) =>
    (columns.get(c) ?? []).reduce(
      (s, n) => s + Math.max(inSum.get(n.id) ?? 0, outSum.get(n.id) ?? 0),
      0,
    ),
  );
  const maxTotal = Math.max(...columnTotals, 1);
  const maxNodesInCol = Math.max(...columnIndices.map((c) => (columns.get(c) ?? []).length));
  const availableHeight = height - maxNodesInCol * nodePadding;
  const scale = availableHeight / maxTotal;

  // Lay out nodes within each column, stacked top-to-bottom, centred.
  const laidOut: Record<string, SankeyNodeLayout> = {};
  const nodeInOffset: Record<string, number> = {}; // y-offset for the next incoming link
  const nodeOutOffset: Record<string, number> = {}; // y-offset for the next outgoing link

  for (const c of columnIndices) {
    const nodesInCol = columns.get(c) ?? [];
    // Sort by max(in,out) desc so biggest flows are at the top
    const sorted = [...nodesInCol].sort((a, b) => {
      const va = Math.max(inSum.get(a.id) ?? 0, outSum.get(a.id) ?? 0);
      const vb = Math.max(inSum.get(b.id) ?? 0, outSum.get(b.id) ?? 0);
      return vb - va;
    });
    const colValue = columnTotals[columnIndices.indexOf(c)];
    const colHeight = colValue * scale + (sorted.length - 1) * nodePadding;
    let y = (height - colHeight) / 2;
    const x = colX(c);
    for (const n of sorted) {
      const nodeValue = Math.max(inSum.get(n.id) ?? 0, outSum.get(n.id) ?? 0);
      const h = Math.max(2, nodeValue * scale);
      laidOut[n.id] = {
        ...n,
        x,
        y,
        width: nodeWidth,
        height: h,
        value: nodeValue,
      };
      nodeInOffset[n.id] = 0;
      nodeOutOffset[n.id] = 0;
      y += h + nodePadding;
    }
  }

  // Build links with bezier paths
  // Keep link order stable by iterating in the original order.
  const linkLayouts: SankeyLinkLayout[] = links.map((l) => {
    const src = laidOut[l.source];
    const tgt = laidOut[l.target];
    if (!src || !tgt) {
      return { ...l, path: "", sourceY: 0, targetY: 0, thickness: 0 };
    }
    const thickness = Math.max(1, l.value * scale);
    const sy = src.y + (nodeOutOffset[l.source] ?? 0) + thickness / 2;
    const ty = tgt.y + (nodeInOffset[l.target] ?? 0) + thickness / 2;
    nodeOutOffset[l.source] = (nodeOutOffset[l.source] ?? 0) + thickness;
    nodeInOffset[l.target] = (nodeInOffset[l.target] ?? 0) + thickness;

    const x0 = src.x + src.width;
    const x1 = tgt.x;
    const midX = (x0 + x1) / 2;
    const path = `M ${x0} ${sy} C ${midX} ${sy} ${midX} ${ty} ${x1} ${ty}`;
    return { ...l, path, sourceY: sy, targetY: ty, thickness };
  });

  return {
    nodes: Object.values(laidOut),
    links: linkLayouts,
    width,
    height,
  };
}
