// src/logic/runEdmondsBlossom.ts
import type {
    BlossomStep,
    Edge,
    MatchingEdge,
    VertexId,
    Layer,
    Blossom,
    ContractedGraph,
} from './blossomTypes';

let n = 0;
let MAX_N = 0;
let NO_MATCH = -1;
const STATUS_UNLABELED = 0;
const STATUS_OUTER = 1;
const STATUS_INNER = 2;

let Mate: number[] = [];
let Par: number[] = [];
let Base: number[] = [];
let Status: number[] = [];
let Adj: number[][] = [];
let Queue: number[] = [];
let qHead = 0;

let indexToId: VertexId[] = [''];
let idToIndex: Map<VertexId, number> = new Map();
let initialEdges: Edge[] = [];
const steps: BlossomStep[] = [];
let stepId = 0;

const blossomMap = new Map<number, number[]>();

const pushQ = (x: number) => { Queue.push(x); };
const popQ = (): number | undefined => {
    if (qHead >= Queue.length) return undefined;
    const v = Queue[qHead];
    qHead += 1;
    return v;
};
const clearQ = () => { Queue.length = 0; qHead = 0; };

const mapVertexToDisplay = (
    u: number,
    expandBase?: number
): string => {
    const bu = Base[u];
    if (expandBase !== undefined && blossomMap.has(bu) && bu === expandBase)
        return indexToId[u];
    if (blossomMap.has(bu) && expandBase !== bu)
        return `B${indexToId[bu]}`;
    return indexToId[u];
};

const getMatchingEdges = (expandBase?: number): MatchingEdge[] => {
    const currentMatching: MatchingEdge[] = [];
    for (let i = 1; i <= n; i++) {
        const j = Mate[i];
        if (j === NO_MATCH || j < i) continue;

        const du = mapVertexToDisplay(i, expandBase);
        const dv = mapVertexToDisplay(j, expandBase);

        if (du === dv) continue;

        const idU = indexToId[i];
        const idV = indexToId[j];
        const edge = initialEdges.find(
            e => (e.u === idU && e.v === idV) || (e.u === idV && e.v === idU)
        );

        if (edge) {
            currentMatching.push({ ...edge, u: du, v: dv });
        }
    }
    return currentMatching;
};

const buildCurrentGraph = (expandBase?: number): ContractedGraph => {
    const contractedGraph: ContractedGraph = { vertices: [], edges: [] };
    const baseToDisplayId = new Map<number, string>();
    const baseSet = new Set<number>();
    for (let i = 1; i <= n; i++) {
        if (Base[i] > 0) baseSet.add(Base[i]);
    }
    for (const b of baseSet) {
        if (blossomMap.has(b) && expandBase !== b) {
            baseToDisplayId.set(b, `B${indexToId[b]}`);
            contractedGraph.vertices.push(`B${indexToId[b]}`);
        } else {
            if (expandBase === b && blossomMap.has(b)) {
                const members = blossomMap.get(b)!;
                for (const m of members) {
                    baseToDisplayId.set(m, indexToId[m]);
                    contractedGraph.vertices.push(indexToId[m]);
                }
            } else {
                if (b > 0 && b < indexToId.length) {
                    baseToDisplayId.set(b, indexToId[b]);
                    contractedGraph.vertices.push(indexToId[b]);
                }
            }
        }
    }

    const edgeSet = new Set<string>();
    for (const edge of initialEdges) {
        const u = idToIndex.get(edge.u)!;
        const v = idToIndex.get(edge.v)!;
        const du = mapVertexToDisplay(u, expandBase);
        const dv = mapVertexToDisplay(v, expandBase);
        if (du === dv) continue;

        const edgeId = [du, dv].sort().join('-');
        if (!edgeSet.has(edgeId)) {
            contractedGraph.edges.push({ id: edge.id, u: du, v: dv });
            edgeSet.add(edgeId);
        }
    }
    return contractedGraph;
};

const makeStep = (
    type: BlossomStep['type'],
    description: string,
    highlightPath: VertexId[] = [],
    highlightEdge?: Edge,
    activeBlossomId?: string,
    expandBlossomBase?: number
) => {
    const layers: Record<VertexId, Layer> = {};
    const parentMap: Record<VertexId, VertexId | null> = {};
    const exposed: VertexId[] = [];
    const currentBlossoms: Blossom[] = [];
    for (let i = 1; i <= n; i++) {
        const id = indexToId[i];
        if (Status[i] === STATUS_OUTER) layers[id] = 'EVEN';
        else if (Status[i] === STATUS_INNER) layers[id] = 'ODD';
        else layers[id] = 'UNLABELED';
        parentMap[id] = Par[i] === NO_MATCH ? null : indexToId[Par[i]];
        if (Mate[i] === NO_MATCH) exposed.push(id);
    }
    blossomMap.forEach((members, baseIndex) => {
        currentBlossoms.push({
            id: `B${indexToId[baseIndex]}`,
            base: indexToId[baseIndex],
            vertices: members.map(i => indexToId[i]),
        });
    });

    let currentHighlightEdge: Edge | undefined = undefined;
    if (highlightEdge) {
        const u = idToIndex.get(highlightEdge.u)!;
        const v = idToIndex.get(highlightEdge.v)!;
        const du = mapVertexToDisplay(u, expandBlossomBase);
        const dv = mapVertexToDisplay(v, expandBlossomBase);

        if (du !== dv) {
            currentHighlightEdge = {
                ...highlightEdge,
                id: highlightEdge.id,
                u: du,
                v: dv
            };
        }
    }

    const step: BlossomStep = {
        id: stepId++,
        type,
        description,
        graph: { vertices: indexToId.slice(1), edges: initialEdges.map(e => ({ ...e })) },
        currentGraph: buildCurrentGraph(expandBlossomBase),
        matching: getMatchingEdges(expandBlossomBase),
        layers,
        exposedVertices: exposed,
        parent: parentMap,
        blossoms: currentBlossoms,
        highlightPath,
        highlightEdge: currentHighlightEdge ? { ...currentHighlightEdge } : undefined,
        activeBlossomId,
    };
    steps.push(step);
};

const findEdge = (u: number, v: number): Edge | undefined => {
    const iu = indexToId[u];
    const iv = indexToId[v];
    return initialEdges.find(e => (e.u === iu && e.v === iv) || (e.u === iv && e.v === iu));
};

const tracePath = (startNode: number, endNode: number): number[] => {
    const path: number[] = [];
    let cur = endNode;
    while (cur !== NO_MATCH) {
        path.push(cur);
        if (cur === startNode) break;
        cur = Par[cur];
    }
    return path;
};

const lca = (aStart: number, bStart: number): number => {
    const visited = new Array<boolean>(MAX_N).fill(false);

    let a = aStart;
    while (a !== NO_MATCH) {
        a = Base[a];
        if (a === 0) break;
        visited[a] = true;
        if (Mate[a] === NO_MATCH) {
            a = NO_MATCH;
        } else {
            const p = Par[Mate[a]];
            if (p === NO_MATCH) {
                a = NO_MATCH;
            } else {
                a = Base[p];
            }
        }
    }

    let b = bStart;
    while (b !== NO_MATCH) {
        b = Base[b];
        if (b === 0) break;
        if (visited[b]) return b;
        if (Mate[b] === NO_MATCH) {
            b = NO_MATCH;
        } else {
            const p = Par[Mate[b]];
            if (p === NO_MATCH) {
                b = NO_MATCH;
            } else {
                b = Base[p];
            }
        }
    }

    return 0;
};

const markPath = (v: number, b: number, x: number) => {
    let u = v;
    while (u !== NO_MATCH && Base[u] !== b) {
        Par[u] = x;
        x = Mate[u];

        if (x === NO_MATCH) {
            Base[u] = b;
            u = NO_MATCH;
        } else {
            if (Status[x] === STATUS_INNER) {
                Status[x] = STATUS_OUTER;
                pushQ(x);
            }
            Base[u] = b;
            Base[x] = b;
            u = Par[x];
        }
    }
};

const contract = (a: number, b: number, root: number) => {
    markPath(a, root, b);
    markPath(b, root, a);
    const members: number[] = [];
    for (let i = 1; i <= n; i++) if (Base[i] === root) members.push(i);
    const uniqueMembers = Array.from(new Set(members));
    blossomMap.set(root, uniqueMembers);
    makeStep('CONTRACT', `Blossom contracted into temporary node B${indexToId[root]} (members: ${uniqueMembers.map(i => indexToId[i]).join(', ')}).`, [], undefined, `B${indexToId[root]}`);
};

const expandBlossom = (root: number, reasonDescription?: string) => {
    const members = blossomMap.get(root);
    if (!members) return;
    makeStep(
        'EXPAND',
        reasonDescription ?? `Expanding blossom B${indexToId[root]} to restore original vertices.`,
        members.map(i => indexToId[i]),
        undefined,
        `B${indexToId[root]}`,
        root
    );
    blossomMap.delete(root);
    for (const m of members) {
        Base[m] = m;
    }
};

const augment = (v: number) => {
    let cur = v;
    while (cur !== NO_MATCH) {
        if (Base[cur] !== cur && blossomMap.has(Base[cur])) {
            expandBlossom(Base[cur], `Expanding blossom B${indexToId[Base[cur]]} to continue augmentation path.`);
        }
        const p = Par[cur];
        const next = p === NO_MATCH ? NO_MATCH : Mate[p];
        Mate[cur] = p;
        if (p !== NO_MATCH) Mate[p] = cur;
        cur = next;
    }
};

const findPath = (startNode: number): boolean => {
    Status.fill(STATUS_UNLABELED, 0, n + 1);
    Par.fill(NO_MATCH, 0, n + 1);

    clearQ();
    pushQ(startNode);
    Status[startNode] = STATUS_OUTER;
    let u: number | undefined;
    while ((u = popQ()) !== undefined) {
        for (const v of Adj[u]) {
            if (Base[u] === Base[v]) continue;
            if (Status[v] === STATUS_INNER) continue;
            const edge = findEdge(u, v);
            makeStep('BFS_SEARCH', `Exploring edge ${indexToId[u]}-${indexToId[v]}.`, [], edge);
            if (Status[v] === STATUS_UNLABELED) {
                Status[v] = STATUS_INNER;
                Par[v] = u;
                if (Mate[v] === NO_MATCH) {
                    const pathBeforeAug = tracePath(startNode, v).map(i => indexToId[i]);
                    makeStep('FOUND_AUGMENTING_PATH', `Augmenting path P found ending at exposed vertex ${indexToId[v]}.`, pathBeforeAug);
                    augment(v);
                    const pathAfterAug = tracePath(v, startNode).map(i => indexToId[i]).reverse();
                    makeStep('AUGMENT', `Matching successfully augmented along P. Matching size increased.`, pathAfterAug);
                    return true;
                } else {
                    const mv = Mate[v];
                    Status[mv] = STATUS_OUTER;
                    pushQ(mv);
                    makeStep('BFS_SEARCH', `Matched edge ${indexToId[v]}-${indexToId[mv]} added to the alternating tree.`, [], findEdge(v, mv));
                }
            } else if (Status[v] === STATUS_OUTER) {
                const root = lca(u, v);
                if (root === 0) continue;
                const e = findEdge(u, v);

                const blossomPath: number[] = [];
                blossomPath.push(u);
                blossomPath.push(v);
        
                let curU = u;
                while(curU !== NO_MATCH && Base[curU] !== root) {
                    const mateU = Mate[curU];
                    if (mateU === NO_MATCH) break;
                    const parentU = Par[mateU];
                    if (parentU === NO_MATCH) break;

                    blossomPath.push(mateU);
                    blossomPath.push(parentU);
                    curU = parentU;
                }
        
                let curV = v;
                while(curV !== NO_MATCH && Base[curV] !== root) {
                    const mateV = Mate[curV];
                    if (mateV === NO_MATCH) break;
                    const parentV = Par[mateV];
                    if (parentV === NO_MATCH) break;

                    blossomPath.push(mateV);
                    blossomPath.push(parentV);
                    curV = parentV;
                }
                
                const highlightPath = Array.from(new Set(blossomPath)).map(i => indexToId[i]);

                makeStep('BLOSSOM_DETECTED', `Blossom detected: edge ${indexToId[u]}-${indexToId[v]} connects two outer nodes. Base: ${indexToId[root]}.`, highlightPath, e, undefined);
                contract(u, v, root);
            }
        }
    }
    return false;
};

export function runEdmondsBlossom(vertices: VertexId[], edges: Edge[]): BlossomStep[] {
    steps.length = 0;
    stepId = 0;
    Queue.length = 0;
    qHead = 0;
    n = vertices.length;
    MAX_N = Math.max(2, n + 5);
    NO_MATCH = -1;
    Mate = new Array<number>(MAX_N).fill(NO_MATCH);
    Par = new Array<number>(MAX_N).fill(NO_MATCH);
    Base = new Array<number>(MAX_N).fill(0);
    Status = new Array<number>(MAX_N).fill(STATUS_UNLABELED);
    Adj = Array.from({ length: MAX_N }, () => []);
    indexToId = [''];
    idToIndex.clear();
    initialEdges = edges.slice();
    blossomMap.clear();
    vertices.forEach((v, i) => { idToIndex.set(v, i + 1); indexToId[i + 1] = v; });
    for (let i = 1; i <= n; i++) Base[i] = i;
    edges.forEach(e => {
        const u = idToIndex.get(e.u);
        const v = idToIndex.get(e.v);
        if (u == null || v == null || u === v) return;
        Adj[u].push(v);
        Adj[v].push(u);
    });
    makeStep('INIT', `Initial graph with ${n} vertices.`, []);
    let improved = true;
    let totalAug = 0;
    while (improved) {
        improved = false;
        for (let i = 1; i <= n; i++) {
            if (Mate[i] === NO_MATCH) {
                makeStep('START_BFS', `Starting BFS from exposed vertex ${indexToId[i]}.`, []);
                if (findPath(i)) { improved = true; totalAug++; break; }
                else makeStep('BFS_SEARCH', `No augmenting path found from ${indexToId[i]}.`, []);
            }
        }
    }
    for (const root of Array.from(blossomMap.keys())) {
        expandBlossom(root, `Final expansion of blossom B${indexToId[root]} for visualization.`);
    }
    makeStep('DONE', `Algorithm finished. Maximum matching found. Final size: ${getMatchingEdges().length}.`, []);
    return steps;
}