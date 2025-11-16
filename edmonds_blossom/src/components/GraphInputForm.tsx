// src/components/GraphInputForm.tsx
import React, { useState } from 'react';
import '../components_css/GraphInputForm.css';
import type{ Edge, VertexId } from '../logic/blossomTypes';

interface GraphInputFormProps {
  vertices: VertexId[];
  edges: Edge[];
  onChangeVertices: (vs: VertexId[]) => void;
  onChangeEdges: (es: Edge[]) => void;
  onRun: () => void;
}

export const GraphInputForm: React.FC<GraphInputFormProps> = ({
  vertices,
  edges,
  onChangeVertices,
  onChangeEdges,
  onRun,
}) => {
  const [vertexText, setVertexText] = useState(vertices.join(','));
  const [edgesText, setEdgesText] = useState(
    edges.map(e => `${e.u} ${e.v}`).join('\n')
  );
  const [error, setError] = useState<string | null>(null);

  const parseVertices = (text: string): VertexId[] => {
    return text
      .split(' ')
      .map(v => v.trim())
      .filter(v => v.length > 0);
  };

  const parseEdges = (text: string, vs: VertexId[]): Edge[] => {
    const set = new Set(vs);
    const lines = text
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0);

    const result: Edge[] = [];
    let idCounter = 0;

    for (const line of lines) {
      const [a, b] = line.split(/\s+/);
      if (!a || !b) {
        throw new Error(`Invalid edge line: "${line}"`);
      }
      if (!set.has(a) || !set.has(b)) {
        throw new Error(
          `Edge ${a} ${b} uses unknown vertex (vertices are ${vs.join(' ')})`
        );
      }
      const id = `e${idCounter++}`;
      result.push({ id, u: a, v: b });
    }

    return result;
  };

  const handleRunClick = () => {
    try {
      const vs = parseVertices(vertexText);
      const es = parseEdges(edgesText, vs);
      onChangeVertices(vs);
      onChangeEdges(es);
      setError(null);
      onRun();
    } catch (e) {
      const err = e as Error;
      setError(err.message);
    }
  };

  return (
    <div className="graph-input-form">
      <h2>Graph Input</h2>

      <label className="gif-label">
        Vertices
        <input
          className="gif-input"
          type="text"
          value={vertexText}
          onChange={e => setVertexText(e.target.value)}
          placeholder="Example: 1 2 3 4 5"
        />
      </label>

      <label className="gif-label">
        Edges (one undirected edge per line, "u v")
        <textarea
          className="gif-textarea"
          rows={8}
          value={edgesText}
          onChange={e => setEdgesText(e.target.value)}
          placeholder={'Example:\n1 2\n2 3\n3 1'}
        />
      </label>

      {error && <div className="gif-error">{error}</div>}

      <div className="gif-buttons">
        <button type="button" onClick={handleRunClick}>
          Run Algorithm
        </button>
      </div>
    </div>
  );
};
