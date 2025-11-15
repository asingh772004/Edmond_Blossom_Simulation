// src/components/GraphView.tsx
import React, { useMemo } from 'react';
import '../components_css/GraphView.css';
import type{ BlossomStep } from '../logic/blossomTypes';

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

  const highlightSet = new Set(step.highlightPath);

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
          const isMatch = isMatchingEdge(e.id);

          const inPath =
            highlightSet.has(e.u) && highlightSet.has(e.v);

          return (
            <line
              key={e.id}
              x1={u.x}
              y1={u.y}
              x2={v.x}
              y2={v.y}
              stroke={
                inPath ? '#ff5722' : isMatch ? '#e91e63' : '#b0bec5'
              }
              strokeWidth={inPath ? 4 : isMatch ? 3 : 1.5}
            />
          );
        })}

        {positionedVertices.map(v => {
          const fill = getVertexFill(v.id);
          const exposed = isExposed(v.id);
          const inPath = highlightSet.has(v.id);

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
