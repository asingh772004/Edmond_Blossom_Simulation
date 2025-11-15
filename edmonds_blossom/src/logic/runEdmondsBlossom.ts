// src/logic/runEdmondsBlossom.ts
import {
  BlossomStep,
  Edge,
  MatchingEdge,
  VertexId,
} from './blossomTypes';

interface AdjEdge {
  to: VertexId;
  edgeId: string;
}

interface BFSNode {
  v: VertexId;
  parent: VertexId | null;
  viaEdgeId: string | null;
}

export function runEdmondsBlossom(
  vertices: VertexId[],
  edges: Edge[]
): BlossomStep[] {
  const steps: BlossomStep[] = [];
  let stepId = 0;

  const layersInit: Record<VertexId, 'EVEN' | 'ODD' | 'UNLABELED'> = {};
  vertices.forEach(v => {
    layersInit[v] = 'UNLABELED';
  });

  const matching: MatchingEdge[] = [];
  const matchPartner = new Map<VertexId, VertexId | null>();
  vertices.forEach(v => matchPartner.set(v, null));

  const adj = buildAdjacency(vertices, edges);

  const makeStep = (
    type: BlossomStep['type'],
    description: string,
    extra?: Partial<Pick<BlossomStep, 'layers' | 'exposedVertices' | 'highlightPath'>>
  ) => {
    const layersCopy: Record<VertexId, 'EVEN' | 'ODD' | 'UNLABELED'> = {};
    vertices.forEach(v => {
      layersCopy[v] = extra?.layers?.[v] ?? layersInit[v];
    });

    const exposed: VertexId[] =
      extra?.exposedVertices ??
      vertices.filter(v => matchPartner.get(v) === null);

    const step: BlossomStep = {
      id: stepId++,
      type,
      description,
      graph: { vertices: [...vertices], edges: [...edges] },
      matching: matching.map(e => ({ ...e })),
      blossoms: [],
      layers: layersCopy,
      exposedVertices: exposed,
      highlightPath: extra?.highlightPath ?? [],
    };
    steps.push(step);
  };

  makeStep('INIT', 'Initial graph with empty matching.');

  let improved = true;
  while (improved) {
    improved = false;

    const bfsLayers: Record<VertexId, 'EVEN' | 'ODD' | 'UNLABELED'> = {};
    vertices.forEach(v => {
      bfsLayers[v] = 'UNLABELED';
    });

    const parent = new Map<VertexId, VertexId | null>();
    const parentEdge = new Map<VertexId, string | null>();

    const queue: BFSNode[] = [];

    for (const v of vertices) {
      if (matchPartner.get(v) === null) {
        bfsLayers[v] = 'EVEN';
        parent.set(v, null);
        parentEdge.set(v, null);
        queue.push({ v, parent: null, viaEdgeId: null });
      } else {
        bfsLayers[v] = 'UNLABELED';
      }
    }

    makeStep('START_BFS', 'Start BFS from all exposed vertices.', {
      layers: bfsLayers,
    });

    let augmentingPath: VertexId[] | null = null;

    let qHead = 0;
    while (qHead < queue.length && augmentingPath === null) {
      const node = queue[qHead++];
      const v = node.v;

      for (const e of adj.get(v) ?? []) {
        const w = e.to;
        if (v === w) continue;

        if (bfsLayers[w] === 'UNLABELED') {
          if (matchPartner.get(w) === null) {
            parent.set(w, v);
            parentEdge.set(w, e.edgeId);
            bfsLayers[w] = 'ODD';

            augmentingPath = buildAugmentingPath(
              w,
              parent,
              parentEdge
            );
            makeStep(
              'FOUND_AUGMENTING_PATH',
              `Found augmenting path ending at exposed vertex ${w}.`,
              {
                layers: bfsLayers,
                highlightPath: augmentingPath,
              }
            );
            break;
          } else {
            const mv = matchPartner.get(w);
            if (mv == null) continue;

            parent.set(w, v);
            parentEdge.set(w, e.edgeId);
            bfsLayers[w] = 'ODD';

            if (bfsLayers[mv] === 'UNLABELED') {
              bfsLayers[mv] = 'EVEN';
              const edgeId = findEdgeId(edges, w, mv);
              parent.set(mv, w);
              parentEdge.set(mv, edgeId);
              queue.push({
                v: mv,
                parent: w,
                viaEdgeId: edgeId,
              });

              makeStep(
                'GROW_TREE',
                `Grow alternating tree via matched edge ${w}-${mv}.`,
                {
                  layers: bfsLayers,
                }
              );
            }
          }
        }
      }
    }

    if (augmentingPath) {
      applyAugmentingPath(
        augmentingPath,
        matching,
        matchPartner,
        edges
      );
      improved = true;

      const layersAfter: Record<
        VertexId,
        'EVEN' | 'ODD' | 'UNLABELED'
      > = {};
      vertices.forEach(v => {
        layersAfter[v] = 'UNLABELED';
      });

      makeStep(
        'AUGMENT',
        'Augmented matching along the found path.',
        {
          layers: layersAfter,
          highlightPath: augmentingPath,
        }
      );
    }
  }

  const finalLayers: Record<
    VertexId,
    'EVEN' | 'ODD' | 'UNLABELED'
  > = {};
  vertices.forEach(v => {
    finalLayers[v] = 'UNLABELED';
  });

  makeStep('DONE', 'No more augmenting paths. Matching is maximal.', {
    layers: finalLayers,
  });

  return steps;
}

function buildAdjacency(
  vertices: VertexId[],
  edges: Edge[]
): Map<VertexId, AdjEdge[]> {
  const adj = new Map<VertexId, AdjEdge[]>();
  vertices.forEach(v => adj.set(v, []));
  for (const e of edges) {
    if (!adj.has(e.u)) adj.set(e.u, []);
    if (!adj.has(e.v)) adj.set(e.v, []);
    adj.get(e.u)!.push({ to: e.v, edgeId: e.id });
    adj.get(e.v)!.push({ to: e.u, edgeId: e.id });
  }
  return adj;
}

function buildAugmentingPath(
  end: VertexId,
  parent: Map<VertexId, VertexId | null>,
  parentEdge: Map<VertexId, string | null>
): VertexId[] {
  const path: VertexId[] = [];
  let cur: VertexId | null = end;
  while (cur !== null) {
    path.push(cur);
    cur = parent.get(cur) ?? null;
  }
  path.reverse();
  return path;
}

function applyAugmentingPath(
  path: VertexId[],
  matching: MatchingEdge[],
  matchPartner: Map<VertexId, VertexId | null>,
  edges: Edge[]
): void {
  for (let i = 0; i + 1 < path.length; i++) {
    const a = path[i];
    const b = path[i + 1];
    if (matchPartner.get(a) === b) {
      removeMatchingEdge(matching, a, b);
      matchPartner.set(a, null);
      matchPartner.set(b, null);
    } else {
      const edge = findEdge(edges, a, b);
      matching.push({
        id: edge.id,
        u: edge.u,
        v: edge.v,
      });
      matchPartner.set(a, b);
      matchPartner.set(b, a);
    }
  }
}

function findEdge(edges: Edge[], a: VertexId, b: VertexId): Edge {
  const e = edges.find(
    edge =>
      (edge.u === a && edge.v === b) ||
      (edge.u === b && edge.v === a)
  );
  if (!e) {
    throw new Error(`Edge ${a}-${b} not found.`);
  }
  return e;
}

function findEdgeId(
  edges: Edge[],
  a: VertexId,
  b: VertexId
): string {
  return findEdge(edges, a, b).id;
}

function removeMatchingEdge(
  matching: MatchingEdge[],
  a: VertexId,
  b: VertexId
): void {
  const idx = matching.findIndex(
    e =>
      (e.u === a && e.v === b) ||
      (e.u === b && e.v === a)
  );
  if (idx >= 0) {
    matching.splice(idx, 1);
  }
}
