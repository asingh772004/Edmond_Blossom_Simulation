# Edmond_Blossom_Simulation

A web-based interactive tool to visualize the steps of the **Edmonds Blossom Algorithm** for finding a maximum cardinality matching in general graphs.

The application allows users to define a custom graph, run the algorithm, and step through the process to observe key algorithmic concepts like alternating trees, exposed vertices, and the formation and contraction of blossoms.

---

## The Edmonds Blossom Algorithm Explained

The Edmonds Blossom Algorithm, developed by Jack Edmonds in 1965, finds a **maximum cardinality matching** in any undirected graph — a largest possible set of edges with no shared endpoints.

General graph matching is more complex than bipartite matching due to the presence of **odd cycles**, referred to as **blossoms**. The algorithm improves an existing matching by repeatedly discovering **augmenting paths**.

### Key Concepts

- **Matching and Exposed Vertices:**  
  A vertex is **exposed** (unmatched) if it is not incident to any edge in the current matching.

- **Alternating Paths and Trees:**  
  BFS is used to grow an **alternating forest** from exposed vertices. Paths alternate between unmatched and matched edges.  
  Vertices are labeled **EVEN** or **ODD** depending on their depth in the alternating tree.

- **Augmenting Path:**  
  An alternating path connecting two exposed vertices. Flipping all edges in the path increases the matching size by one.

- **Blossoms (Odd Cycles):**  
  An odd-length cycle that blocks further BFS progress. Detected when an unmatched edge joins two **EVEN** vertices in the same tree.

- **Contraction and Expansion:**  
  When a blossom is found, it is temporarily **contracted** into a single pseudo-vertex (e.g., `B1`).  
  If an augmenting path is found in the contracted graph, the blossom is then **expanded**, revealing the true augmenting path in the original graph.

This simulation illustrates alternating trees growing, blossoms contracting, blossoms expanding, and matchings augmenting until no further augmenting paths exist.

---

## Key Simulator Features

- **Interactive Graph Input:** Provide vertices (e.g., `1 2 3`) and edges (e.g., `1 2`).
- **Step-by-Step Visualization:** Each algorithm action is displayed (`BFS_SEARCH`, `BLOSSOM_DETECTED`, `AUGMENT`, etc.).
- **Visual Highlighting:**
  - **Vertex Layers:** EVEN / ODD / UNLABELED color coding.
  - **Matching Edges:** Highlighted clearly.
  - **Blossoms:** Contracted blossoms shown as pseudo-vertices (`B1`, `B2`, ...).
  - **Paths and Edges:** Active search edges and augmenting paths are highlighted.
- **Simulation Controls:** Play, pause, next, previous, and adjustable auto-step speed.

---

## Tech Stack

- **Frontend:** React  
- **Language:** TypeScript  
- **Bundler:** Vite  
- **Visualization:** SVG-based rendering (`GraphView.tsx`)

---

## Getting Started

### Prerequisites

- Node.js installed on your machine.

### Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/asingh772004/Edmond_Blossom_Simulation.git
    cd Edmond_Blossom_Simulation
    ```

2. Install dependencies:

    ```bash
    npm install
    ```

---

## Usage

```bash
npm run dev
