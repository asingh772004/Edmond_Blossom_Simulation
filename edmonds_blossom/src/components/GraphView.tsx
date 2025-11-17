// src/components/GraphView.tsx
import React, { useMemo } from 'react';
import '../components_css/GraphView.css';
import type { BlossomStep, Edge } from '../logic/blossomTypes';

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
    const n = step.currentGraph.vertices.length;
    const cx = svgSize / 2;
    const cy = svgSize / 2;
    const r = Math.min(svgSize / 2 - 40, 180);

    return step.currentGraph.vertices.map((v, i) => {
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

  const isMatchingEdge = (edge: Edge) =>
    step.matching.some(me =>
      (me.u === edge.u && me.v === edge.v) ||
      (me.u === edge.v && me.v === edge.u)
    );

  const getVertexFill = (id: string) => {
    if (id.startsWith('B')) {
      return '#9c27b0';
    }
    const layer = step.layers[id] ?? 'UNLABELED';
    if (layer === 'EVEN') return '#4caf50';
    if (layer === 'ODD') return '#ff9800';
    return '#90a4ae';
  };

  const isExposed = (id: string) =>
    step.exposedVertices.includes(id);

  const [isBlossomEvent, blossomVertexSet] = useMemo(() => {
    let vertexSet = new Set<string>();
    let isEvent = false;

    if (step.type === 'EXPAND') {
      vertexSet = new Set(step.highlightPath);
      isEvent = true;
    } else if (step.type === 'CONTRACT' && step.activeBlossomId) {
      const activeBlossom = step.blossoms.find(b => b.id === step.activeBlossomId);
      if (activeBlossom) {
        vertexSet = new Set(activeBlossom.vertices);
        isEvent = true;
      }
    }

    return [isEvent, vertexSet] as const;


  }, [step.type, step.highlightPath, step.blossoms, step.activeBlossomId]);

  const highlightSet = new Set(step.highlightPath);


  return (
    <div className="graph-view-root">
      <svg
        width={svgSize}
        height={svgSize}
        viewBox={`0 0 ${svgSize} ${svgSize}`}
      >
        {step.currentGraph.edges.map(e => {
          const u = posMap.get(e.u);
          const v = posMap.get(e.v);
          if (!u || !v) return null;

          const isMatch = isMatchingEdge(e);

          const isHighlightEdge = 
            step.highlightEdge?.id === e.id ||
            (step.highlightEdge?.u === e.u && step.highlightEdge?.v === e.v) ||
            (step.highlightEdge?.u === e.v && step.highlightEdge?.v === e.u);

          const isAugmentingPathEdge =
            (step.type === 'FOUND_AUGMENTING_PATH' || step.type === 'AUGMENT') &&
            highlightSet.has(e.u) &&
            highlightSet.has(e.v);

          const isBlossomEdge = isBlossomEvent && blossomVertexSet.has(e.u) && blossomVertexSet.has(e.v);
          
          const isBlossomDetectedEdge =
            step.type === 'BLOSSOM_DETECTED' &&
            highlightSet.has(e.u) &&
            highlightSet.has(e.v);

          let strokeColor = '#b0bec5';
          let strokeWidth = 1.5;

          if (isMatch) {
            strokeColor = '#d32f2f';
            strokeWidth = 3;
          }

          if (isAugmentingPathEdge) {
            strokeColor = '#ff5722';
            strokeWidth = 4;
          }

          if (isBlossomEdge) {
            strokeColor = 'purple';
            strokeWidth = 4;
          }

          if (isBlossomDetectedEdge) {
            strokeColor = 'purple';
            strokeWidth = isMatch ? 5 : 4; 
          }
          
          if (isHighlightEdge) {
            strokeColor = 'blue';
            strokeWidth = 4;
          }

          return (
            <line
              key={e.id}
              x1={u.x}
              y1={u.y}
              x2={v.x}
              y2={v.y}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
            />
          );
        })}

        {positionedVertices.map(v => {
          const fill = getVertexFill(v.id);
          const exposed = isExposed(v.id);

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