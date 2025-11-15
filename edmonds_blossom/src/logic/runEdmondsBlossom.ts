// src/logic/runEdmondsBlossom.ts
import type {
  BlossomStep,
  Edge,
  MatchingEdge,
  VertexId,
} from './blossomTypes';

const MAX_V = 255;

export function runEdmondsBlossom(
  vertices: VertexId[],
  edges: Edge[]
): BlossomStep[] {
  // Map external VertexId to 1..n indices used by the algorithm.
  const n = vertices.length;
  if (n > MAX_V - 1) {
    throw new Error(
      `Too many vertices: ${n}, maximum supported is ${MAX_V - 1}`
    );
  }

  const idToIndex = new Map<VertexId, number>();
  const indexToId: VertexId[] = ['']; // 1-based
  vertices.forEach((v, i) => {
    idToIndex.set(v, i + 1);
    indexToId[i + 1] = v;
  });

  // Adjacency (1-based)
  const Adj: number[][] = Array.from({ length: MAX_V }, () => []);
  edges.forEach(e => {
    const u = idToIndex.get(e.u);
    const v = idToIndex.get(e.v);
    if (u == null || v == null) return;
    if (u === v) return;
    Adj[u].push(v);
    Adj[v].push(u);
  });

  // Global arrays like in C++
  const Mate = new Array<number>(MAX_V).fill(-1);
  const Par = new Array<number>(MAX_V).fill(-1);
  const Base = new Array<number>(MAX_V).fill(0);
  const IsBlossom = new Array<boolean>(MAX_V).fill(false);
  const Status = new Array<number>(MAX_V).fill(0); // 0 unlabeled, 1 outer, 2 inner
  const Queue: number[] = [];
  let qHead = 0;

  const pushQ = (x: number) => {
    Queue.push(x);
  };
  const popQ = (): number | undefined => {
    if (qHead >= Queue.length) return undefined;
    const v = Queue[qHead];
    qHead += 1;
    return v;
  };
  const clearQ = () => {
    Queue.length = 0;
    qHead = 0;
  };

  const LCA = (aStart: number, bStart: number, startNode: number): number => {
    const Visited = new Array<boolean>(MAX_V).fill(false);
    let a = aStart;
    while (true) {
      a = Base[a];
      Visited[a] = true;
      if (a === startNode) break;
      a = Par[Mate[a]];
    }
    let b = bStart;
    while (true) {
      b = Base[b];
      if (Visited[b]) return b;
      b = Par[Mate[b]];
    }
  };

  const Contract = (aStart: number, bStart: number, root: number): void => {
    let a = aStart;
    let w = bStart;
    while (Base[a] !== root) {
      Par[a] = w;
      w = Mate[a];
      if (Status[w] === 2) {
        Status[w] = 1;
        pushQ(w);
      }
      IsBlossom[Base[a]] = true;
      IsBlossom[Base[w]] = true;
      Base[a] = root;
      Base[w] = root;
      a = Par[w];
    }
  };

  const FindPath = (startNode: number): boolean => {
    Status.fill(0, 0, n + 1);
    Par.fill(-1, 0, n + 1);
    for (let i = 1; i <= n; i++) {
      Base[i] = i;
    }

    clearQ();
    pushQ(startNode);
    Status[startNode] = 1; // outer

    let u: number | undefined;
    while ((u = popQ()) !== undefined) {
      for (const v of Adj[u]) {
        if (Base[u] === Base[v] || Mate[u] === v) continue;

        if (Status[v] === 2) continue; // inner; ignore

        if (Status[v] === 0) {
          Status[v] = 2; // inner
          Par[v] = u;

          if (Mate[v] === -1) {
            // augment
            let x = v;
            while (x !== -1) {
              const prev = Par[x];
              const prevMate = prev === -1 ? -1 : Mate[prev];
              Mate[x] = prev;
              if (prev !== -1) {
                Mate[prev] = x;
              }
              x = prevMate;
            }
            return true;
          } else {
            const mv = Mate[v];
            Status[mv] = 1; // outer
            pushQ(mv);
          }
        } else if (Status[v] === 1) {
          const root = LCA(u, v, startNode);
          IsBlossom.fill(false, 0, n + 1);
          Contract(u, v, root);
          Contract(v, u, root);
        }
      }
    }
    return false;
  };

  const Edmonds = (): number => {
    Mate.fill(-1, 0, n + 1);
    let count = 0;
    for (let i = 1; i <= n; i++) {
      if (Mate[i] === -1) {
        if (FindPath(i)) {
          count++;
        }
      }
    }
    return count;
  };

  // Run algorithm
  Edmonds();

  // Build final matching edges for visualization
  const matching: MatchingEdge[] = [];
  const used = new Set<number>();
  for (let i = 1; i <= n; i++) {
    const j = Mate[i];
    if (j <= 0) continue;
    if (used.has(i) || used.has(j)) continue;
    used.add(i);
    used.add(j);

    const idU = indexToId[i];
    const idV = indexToId[j];
    const edge = edges.find(
      e =>
        (e.u === idU && e.v === idV) ||
        (e.u === idV && e.v === idU)
    );
    if (edge) {
      matching.push({
        id: edge.id,
        u: edge.u,
        v: edge.v,
      });
    }
  }

  // Build steps for your UI (INIT + DONE for now)
  const steps: BlossomStep[] = [];
  let stepId = 0;

  const layersInit: Record<VertexId, 'EVEN' | 'ODD' | 'UNLABELED'> = {};
  vertices.forEach(v => {
    layersInit[v] = 'UNLABELED';
  });

  const makeStep = (
    type: BlossomStep['type'],
    description: string,
    matchingEdges: MatchingEdge[]
  ) => {
    const layersCopy: Record<
      VertexId,
      'EVEN' | 'ODD' | 'UNLABELED'
    > = {};
    vertices.forEach(v => {
      layersCopy[v] = layersInit[v];
    });

    const matchedSet = new Set<VertexId>();
    matchingEdges.forEach(me => {
      matchedSet.add(me.u);
      matchedSet.add(me.v);
    });

    const exposed = vertices.filter(v => !matchedSet.has(v));

    steps.push({
      id: stepId++,
      type,
      description,
      graph: { vertices: [...vertices], edges: [...edges] },
      matching: matchingEdges.map(e => ({ ...e })),
      blossoms: [],
      layers: layersCopy,
      exposedVertices: exposed,
      highlightPath: [],
    });
  };

  makeStep('INIT', 'Initial graph with empty matching.', []);
  makeStep(
    'DONE',
    'Maximum matching found by Edmonds blossom algorithm.',
    matching
  );

  return steps;
}
