export type VertexId = string;

export interface Edge {
    id: string;
    u: VertexId;
    v: VertexId;
}

export interface MatchingEdge extends Edge {}

export interface Blossom {
    id: string;
    vertices: VertexId[];
    base: VertexId;
}

export type Layer = 'EVEN' | 'ODD' | 'UNLABELED';

export type StepType =
    | 'INIT'
    | 'START_BFS'
    | 'BFS_SEARCH'
    | 'BLOSSOM_DETECTED'
    | 'CONTRACT'
    | 'EXPAND'
    | 'FOUND_AUGMENTING_PATH'
    | 'AUGMENT'
    | 'DONE';

export interface ContractedGraph {
    vertices: VertexId[];
    edges: Edge[];
}

export interface BlossomStep {
    id: number;
    type: StepType;
    description: string;
    graph: {
        vertices: VertexId[];
        edges: Edge[];
    };
    currentGraph: ContractedGraph;
    matching: MatchingEdge[];
    layers: Record<VertexId, Layer>;
    exposedVertices: VertexId[];
    parent: Record<VertexId, VertexId | null>;
    blossoms: Blossom[];
    highlightPath: VertexId[];
    highlightEdge?: Edge;
    activeBlossomId?: string;
    expansionPath?: VertexId[];
}