// src/logic/runEdmondsBlossom.ts

import type {
  BlossomStep,
  Edge,
  MatchingEdge,
  VertexId,
  Layer,
  Blossom,
} from "./blossomTypes";

const MAX_V = 255;
const NO_MATCH = -1;
const STATUS_UNLABELED = 0;
const STATUS_OUTER = 1;
const STATUS_INNER = 2;

let n: number = 0;
const Mate = new Array<number>(MAX_V).fill(NO_MATCH);
const Par = new Array<number>(MAX_V).fill(NO_MATCH);
const Base = new Array<number>(MAX_V).fill(0);
const Status = new Array<number>(MAX_V).fill(STATUS_UNLABELED);
const IsBlossom = new Array<boolean>(MAX_V).fill(false);
const Queue: number[] = [];
let qHead = 0;

let indexToId: VertexId[] = [""];
let idToIndex: Map<VertexId, number> = new Map();
let Adj: number[][] = [];
const steps: BlossomStep[] = [];
let stepId = 0;
let initialEdges: Edge[] = [];

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

const getMatchingEdges = (): MatchingEdge[] => {
  const currentMatching: MatchingEdge[] = [];
  const used = new Set<number>();
  for (let i = 1; i <= n; i++) {
    const j = Mate[i];
    if (j === NO_MATCH || j < i) continue;
    if (used.has(i) || used.has(j)) continue;

    const idU = indexToId[i];
    const idV = indexToId[j];
    const edge = initialEdges.find(
      (e) => (e.u === idU && e.v === idV) || (e.u === idV && e.v === idU)
    );
    if (edge) {
      currentMatching.push({ ...edge });
    }
    used.add(i);
    used.add(j);
  }
  return currentMatching;
};

const makeStep = (
  type: BlossomStep["type"],
  description: string,
  highlightPath: VertexId[] = [],
  highlightEdge?: Edge
) => {
  const layers: Record<VertexId, Layer> = {};
  const parentMap: Record<VertexId, VertexId | null> = {};
  const blossoms: Blossom[] = [];
  const exposed: VertexId[] = [];

  for (let i = 1; i <= n; i++) {
    const id = indexToId[i];

    if (Status[i] === STATUS_OUTER) layers[id] = "EVEN";
    else if (Status[i] === STATUS_INNER) layers[id] = "ODD";
    else layers[id] = "UNLABELED";

    parentMap[id] = Par[i] === NO_MATCH ? null : indexToId[Par[i]];

    if (Mate[i] === NO_MATCH) {
      exposed.push(id);
    }
  }

  const currentMatching = getMatchingEdges();

  const step: BlossomStep = {
    id: stepId++,
    type,
    description,
    graph: {
      vertices: indexToId.slice(1),
      edges: initialEdges.map((e) => ({ ...e })),
    },
    matching: currentMatching,
    layers: layers,
    exposedVertices: exposed,
    parent: parentMap,
    blossoms: blossoms,
    highlightPath: highlightPath,
    highlightEdge: highlightEdge ? { ...highlightEdge } : undefined,
  };
  steps.push(step);
};

const findPathEdge = (u: number, v: number): Edge | undefined => {
  const idU = indexToId[u];
  const idV = indexToId[v];
  return initialEdges.find(
    (e) => (e.u === idU && e.v === idV) || (e.u === idV && e.v === idU)
  );
};

const buildHighlightPath = (endNode: number): VertexId[] => {
  const path: number[] = [];
  let cur: number = endNode;
  while (cur !== NO_MATCH) {
    path.push(cur);
    cur = Par[cur];
    if (cur !== NO_MATCH) {
      path.push(cur);
      cur = Mate[cur];
    }
  }
  return path.reverse().map((i) => indexToId[i]);
};

const LCA = (aStart: number, bStart: number, startNode: number): number => {
  const Visited = new Array<boolean>(MAX_V).fill(false);
  let a = aStart;
  while (true) {
    a = Base[a];
    Visited[a] = true;
    if (a === startNode || Mate[a] === NO_MATCH) break;
    a = Base[Par[Mate[a]]];
  }
  let b = bStart;
  while (true) {
    b = Base[b];
    if (Visited[b]) return b;
    if (Mate[b] === NO_MATCH) break;
    b = Base[Par[Mate[b]]];
  }
  return 0;
};

const Contract = (aStart: number, bStart: number, root: number): void => {
  let a = aStart;
  let w = bStart;
  while (Base[a] !== root) {
    Par[a] = w;
    w = Mate[a];
    if (Status[w] === STATUS_INNER) {
      Status[w] = STATUS_OUTER;
      pushQ(w);
    }
    IsBlossom[Base[a]] = true;
    IsBlossom[Base[w]] = true;
    Base[a] = root;
    Base[w] = root;
    a = Par[w];
  }
};

const Augment = (v: number) => {
  let x = v;
  while (x !== NO_MATCH) {
    const prev = Par[x];
    const prevMate = prev === NO_MATCH ? NO_MATCH : Mate[prev];
    Mate[x] = prev;
    if (prev !== NO_MATCH) {
      Mate[prev] = x;
    }
    x = prevMate;
  }
};

const FindPath = (startNode: number): boolean => {
  Status.fill(STATUS_UNLABELED, 0, n + 1);
  Par.fill(NO_MATCH, 0, n + 1);
  for (let i = 1; i <= n; i++) {
    Base[i] = i;
  }

  clearQ();
  pushQ(startNode);
  Status[startNode] = STATUS_OUTER;

  let u: number | undefined;
  while ((u = popQ()) !== undefined) {
    for (const v of Adj[u]) {
      if (Base[u] === Base[v]) continue;

      if (Status[v] === STATUS_INNER) continue;

      const edge = findPathEdge(u, v);
      makeStep(
        "BFS_SEARCH",
        `Exploring edge ${indexToId[u]}-${indexToId[v]}.`,
        [],
        edge
      );

      if (Status[v] === STATUS_UNLABELED) {
        Status[v] = STATUS_INNER;

        Par[v] = u;

        if (Mate[v] === NO_MATCH) {
          const path = buildHighlightPath(v);
          makeStep(
            "FOUND_AUGMENTING_PATH",
            `Augmenting path P: ${path.join(
              " - "
            )} found (ends at exposed vertex ${indexToId[v]}).`,
            path
          );

          Augment(v);

          makeStep(
            "AUGMENT",
            `Matching successfully augmented along P. Total matching size increased.`,
            path
          );
          return true;
        } else {
          const mv = Mate[v];
          Status[mv] = STATUS_OUTER;
          pushQ(mv);

          makeStep(
            "BFS_SEARCH",
            `Matched edge ${indexToId[v]}-${indexToId[mv]} added to the alternating tree.`,
            [],
            findPathEdge(v, mv)
          );
        }
      } else if (Status[v] === STATUS_OUTER) {
        const root = LCA(u, v, startNode);
        const edge = findPathEdge(u, v);

        makeStep(
          "BLOSSOM_DETECTED",
          `Blossom detected! Edge ${indexToId[u]}-${indexToId[v]} connects two outer (EVEN) nodes. Base vertex: ${indexToId[root]}.`,
          [],
          edge
        );

        IsBlossom.fill(false, 0, n + 1);
        Contract(u, v, root);
        Contract(v, u, root);

        makeStep(
          "CONTRACT",
          `Blossom contracted into a super-node (base: ${indexToId[root]}). BFS continues from base.`,
          []
        );
      }
    }
  }
  return false;
};

const Edmonds = (): number => {
  Mate.fill(NO_MATCH, 0, n + 1);
  let count = 0;
  let improved = true;
  let totalAugmentations = 0;

  while (improved) {
    improved = false;

    for (let i = 1; i <= n; i++) {
      if (Mate[i] === NO_MATCH) {
        const startId = indexToId[i];
        makeStep(
          "START_BFS",
          `Starting BFS to find augmenting path from exposed vertex ${startId}.`,
          []
        );

        if (FindPath(i)) {
          improved = true;
          count++;
          totalAugmentations++;

          break;
        } else {
          makeStep(
            "BFS_SEARCH",
            `BFS finished from ${startId}. No augmenting path found.`,
            []
          );
        }
      }
    }
  }
  return totalAugmentations;
};

export function runEdmondsBlossom(
  vertices: VertexId[],
  edges: Edge[]
): BlossomStep[] {
  steps.length = 0;
  stepId = 0;
  Queue.length = 0;
  qHead = 0;
  Mate.fill(NO_MATCH, 0, MAX_V);

  n = vertices.length;
  initialEdges = edges;
  indexToId = [""];
  idToIndex.clear();

  vertices.forEach((v, i) => {
    idToIndex.set(v, i + 1);
    indexToId[i + 1] = v;
  });

  Adj = Array.from({ length: MAX_V }, () => []);
  edges.forEach((e) => {
    const u = idToIndex.get(e.u);
    const v = idToIndex.get(e.v);
    if (u == null || v == null || u === v) return;
    Adj[u].push(v);
    Adj[v].push(u);
  });

  makeStep(
    "INIT",
    "Initial graph with empty matching. Total vertices: " + n,
    []
  );

  const totalAugmentations = Edmonds();

  makeStep(
    "DONE",
    `Algorithm finished. Maximum matching found with ${totalAugmentations} augmentations. Final size: ${
      getMatchingEdges().length
    }.`,
    []
  );

  return steps;
}
