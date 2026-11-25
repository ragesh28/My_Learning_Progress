import React, { useMemo } from 'react';
import { TreeNodeData } from '../types';

interface LayoutNode {
  data: TreeNodeData;
  x: number;
  y: number;
  depth: number;
  hasChildren: boolean;
  isExpanded: boolean;
  isMatch: boolean;
  parent?: LayoutNode;
}

interface OsintTreeCanvasProps {
  root: TreeNodeData;
  expandedIds: Set<string>;
  selectedId: string | null;
  matchedIds: Set<string>;
  notedIds: Set<string>;
  accent: 'sky' | 'indigo';
  onToggleExpand: (id: string) => void;
  onSelectNode: (node: TreeNodeData) => void;
}

const ROW_HEIGHT = 34;
const COL_WIDTH = 245;
const PADDING_X = 160;
const PADDING_Y = 28;

function computeLayout(
  node: TreeNodeData,
  expandedIds: Set<string>,
  matchedIds: Set<string>
): { nodes: LayoutNode[]; width: number; height: number } {
  const nodes: LayoutNode[] = [];
  let leafRow = 0;
  let maxDepth = 0;

  function traverse(current: TreeNodeData, depth: number, parent?: LayoutNode): LayoutNode {
    maxDepth = Math.max(maxDepth, depth);
    const hasChildren = Boolean(current.children && current.children.length > 0);
    const isExpanded = hasChildren && expandedIds.has(current.id);

    const layoutNode: LayoutNode = {
      data: current,
      x: PADDING_X + depth * COL_WIDTH,
      y: 0,
      depth,
      hasChildren,
      isExpanded,
      isMatch: matchedIds.has(current.id),
      parent,
    };

    nodes.push(layoutNode);

    if (isExpanded && current.children && current.children.length > 0) {
      const childLayouts = current.children.map((child) => traverse(child, depth + 1, layoutNode));
      const firstY = childLayouts[0].y;
      const lastY = childLayouts[childLayouts.length - 1].y;
      layoutNode.y = (firstY + lastY) / 2;
    } else {
      layoutNode.y = PADDING_Y + leafRow * ROW_HEIGHT;
      leafRow += 1;
    }

    return layoutNode;
  }

  traverse(node, 0);

  const width = Math.max(760, PADDING_X + (maxDepth + 1) * COL_WIDTH + 140);
  const height = Math.max(220, PADDING_Y * 2 + Math.max(leafRow, 1) * ROW_HEIGHT);
  return { nodes, width, height };
}

export const OsintTreeCanvas: React.FC<OsintTreeCanvasProps> = ({
  root,
  expandedIds,
  selectedId,
  matchedIds,
  notedIds,
  accent,
  onToggleExpand,
  onSelectNode,
}) => {
  const { nodes, width, height } = useMemo(
    () => computeLayout(root, expandedIds, matchedIds),
    [root, expandedIds, matchedIds]
  );

  const primaryStroke = accent === 'sky' ? '#38bdf8' : '#818cf8';
  const linkStroke = accent === 'sky' ? 'rgba(56, 189, 248, 0.28)' : 'rgba(129, 140, 248, 0.28)';

  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-slate-800/90 bg-[#0A0D14] bg-grid-subtle">
      <svg
        width={width}
        height={height}
        className="block select-none"
        role="tree"
        aria-label={root.name}
      >
        {/* Smooth OSINT-style cubic Bezier connectors */}
        <g fill="none">
          {nodes.map((n) => {
            if (!n.parent) return null;
            const px = n.parent.x;
            const py = n.parent.y;
            const cx = n.x;
            const cy = n.y;
            const midX = (px + cx) / 2;
            const d = `M ${px} ${py} C ${midX} ${py}, ${midX} ${cy}, ${cx} ${cy}`;
            const isHighlightedLink = n.isMatch || selectedId === n.data.id;
            return (
              <path
                key={`${n.parent.data.id}-${n.data.id}`}
                d={d}
                stroke={isHighlightedLink ? primaryStroke : linkStroke}
                strokeWidth={isHighlightedLink ? 1.8 : 1.15}
                className="transition-all duration-200"
              />
            );
          })}
        </g>

        {/* Nodes & Labels */}
        <g>
          {nodes.map((n) => {
            const isSelected = selectedId === n.data.id;
            const hasNote = notedIds.has(n.data.id);
            const isLeaf = !n.hasChildren;
            const labelOnRight = isLeaf && n.depth > 0;
            const textX = labelOnRight ? n.x + 14 : n.x - 14;
            const textAnchor = labelOnRight ? 'start' : 'end';

            const circleFill = isSelected
              ? '#fbbf24'
              : n.hasChildren && !n.isExpanded
                ? primaryStroke
                : '#0A0D14';
            const circleStroke = isSelected
              ? '#fde68a'
              : n.isMatch
                ? '#34d399'
                : primaryStroke;

            return (
              <g
                key={n.data.id}
                transform={`translate(${n.x}, ${n.y})`}
                className="cursor-pointer group"
                onClick={() => {
                  onSelectNode(n.data);
                  if (n.hasChildren) {
                    onToggleExpand(n.data.id);
                  }
                }}
              >
                {/* Invisible hit area */}
                <circle r={14} fill="transparent" />

                {/* Selection glow */}
                {(isSelected || n.isMatch) && (
                  <circle
                    r={11}
                    fill={isSelected ? 'rgba(251, 191, 36, 0.18)' : 'rgba(52, 211, 153, 0.18)'}
                  />
                )}

                {/* OSINT circular node */}
                <circle
                  r={6.5}
                  fill={circleFill}
                  stroke={circleStroke}
                  strokeWidth={2}
                  className="transition-all duration-150 group-hover:scale-125"
                />

                {/* Note indicator dot */}
                {hasNote && (
                  <circle
                    cx={0}
                    cy={-11}
                    r={3}
                    fill="#34d399"
                  />
                )}

                {/* Node text */}
                <text
                  x={textX - n.x}
                  y={4}
                  textAnchor={textAnchor}
                  className={`text-[12px] font-medium transition-colors ${
                    isSelected
                      ? 'fill-amber-200 font-semibold'
                      : n.isMatch
                        ? 'fill-emerald-300 font-semibold'
                        : 'fill-slate-200 group-hover:fill-white'
                  }`}
                >
                  {n.data.name}
                  {n.hasChildren && !n.isExpanded ? ` (+${n.data.children?.length})` : ''}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
};
