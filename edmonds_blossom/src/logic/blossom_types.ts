// src/algorithms/blossomTypes.ts

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

export type StepType =
  | 'INIT'
  | 'START_BFS'
  | 'GROW_TREE'
  | 'FOUND_AUGMENTING_PATH'
  | 'AUGMENT'
  | 'FOUND_BLOSSOM'
  | 'CONTRACT_BLOSSOM'
  | 'EXPAND_BLOSSOM'
  | 'DONE';

export interface BlossomStep {
  id: number;
  type: StepType;
  description: string;
  graph: {
    vertices: VertexId[];
    edges: Edge[];
  };
  matching: MatchingEdge[];
  blossoms: Blossom[];
  layers?: Record<VertexId, 'EVEN' | 'ODD' | 'UNLABELED'>;
  exposedVertices?: VertexId[];
  highlightPath?: VertexId[];
}
