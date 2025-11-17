// src/components/GraphView.tsx
import React, { useMemo } from 'react'; // <-- Added useMemo
import '../components_css/GraphView.css';
import type { BlossomStep } from '../logic/blossomTypes';

interface GraphViewProps {
  step: BlossomStep;
}

interface PositionedVertex {
  id: string;
  x: number;
  y: number;
}

export const GraphView: React.FC<GraphViewProps> = ({ step }) => {
  const radius = 18;
  const svgSize = 460;

  const positionedVertices: PositionedVertex[] = useMemo(() => {
    const n = step.graph.vertices.length;
    const cx = svgSize / 2;
    const cy = svgSize / 2;
    const r = Math.min(svgSize / 2 - 40, 180);

    return step.graph.vertices.map((v, i) => {
      const angle = (2 * Math.PI * i) / Math.max(1, n);
      return {
        id: v,
        x: cx + r * Math.cos(angle),
        y: cy + r * Math.sin(angle),
      };
    });
  }, [step]);

  const posMap = useMemo(() => {
    const m = new Map<string, PositionedVertex>();
    positionedVertices.forEach(p => m.set(p.id, p));
    return m;
  }, [positionedVertices]);

  const isMatchingEdge = (edgeId: string) =>
    step.matching.some(e => e.id === edgeId);

  const getVertexFill = (id: string) => {
    const layer = step.layers[id] ?? 'UNLABELED';
    if (layer === 'EVEN') return '#4caf50';
    if (layer === 'ODD') return '#ff9800';
    return '#90a4ae';
  };

  const isExposed = (id: string) =>
    step.exposedVertices.includes(id);

  // --- New Logic ---
  // 1. Determine blossom event vertices
  const [isBlossomEvent, blossomVertexSet] = useMemo(() => {
    let vertexSet = new Set<string>();
    let isEvent = false;

    if (step.type === 'EXPAND') {
      // On EXPAND, highlightPath contains the blossom members
      vertexSet = new Set(step.highlightPath);
      isEvent = true;
    } else if (step.type === 'CONTRACT' && step.activeBlossomId) {
      // On CONTRACT, find the blossom in the list
      const activeBlossom = step.blossoms.find(b => b.id === step.activeBlossomId);
      if (activeBlossom) {
        vertexSet = new Set(activeBlossom.vertices);
        isEvent = true;
      }
    }
    return [isEvent, vertexSet];
  }, [step.type, step.highlightPath, step.blossoms, step.activeBlossomId]);

  // 2. We still need the augmenting path logic
  const highlightSet = new Set(step.highlightPath);
  // --- End New Logic ---


  return (
    <div className="graph-view-root">
      <svg
        width={svgSize}
        height={svgSize}
        viewBox={`0 0 ${svgSize} ${svgSize}`}
      >
        {step.graph.edges.map(e => {
          const u = posMap.get(e.u);
          const v = posMap.get(e.v);
          if (!u || !v) return null;

          // --- Updated Color Logic ---
          const isMatch = isMatchingEdge(e.id);
          const isHighlightEdge = step.highlightEdge?.id === e.id;

          const isAugmentingPathEdge =
            (step.type === 'FOUND_AUGMENTING_PATH' || step.type === 'AUGMENT') &&
            highlightSet.has(e.u) &&
            highlightSet.has(e.v);

          const isBlossomEdge = isBlossomEvent && blossomVertexSet.has(e.u) && blossomVertexSet.has(e.v);
          
          const strokeColor = isBlossomEdge
            ? 'purple' // 3. Blossom event (purple)
            : isHighlightEdge
            ? 'blue' // 1. Traversed/considered (blue)
            : isAugmentingPathEdge
            ? '#ff5722' // Augmenting path (original orange-red)
            : isMatch
            ? '#d32f2f' // 2. Matching (red)
            : '#b0bec5'; // Default (grey)

          const strokeWidth =
            isBlossomEdge || isHighlightEdge || isAugmentingPathEdge
              ? 4
              : isMatch
              ? 3
              : 1.5;
          // --- End Updated Color Logic ---

          return (
            <line
              key={e.id}
              x1={u.x}
              y1={u.y}
              x2={v.x}
              y2={v.y}
              stroke={strokeColor}      // <-- Use new variable
              strokeWidth={strokeWidth} // <-- Use new variable
            />
          );
        })}

        {positionedVertices.map(v => {
          const fill = getVertexFill(v.id);
          const exposed = isExposed(v.id);
          // Use augmenting path logic for vertex highlight
          const inPath =
            (step.type === 'FOUND_AUGMENTING_PATH' ||
              step.type === 'AUGMENT') &&
            highlightSet.has(v.id);

          return (
            <g key={v.id}>
              <circle
                cx={v.x}
                cy={v.y}
                r={radius}
                fill={fill}
                stroke={
                  inPath
                    ? '#ff5722'
                    : exposed
                    ? '#d32f2f'
                    : '#263238'
                }
                strokeWidth={inPath || exposed ? 3 : 1.5}
              />
              <text
                x={v.x}
                y={v.y + 4}
                textAnchor="middle"
                fontSize="12"
                fill="#ffffff"
              >
                {v.id}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};