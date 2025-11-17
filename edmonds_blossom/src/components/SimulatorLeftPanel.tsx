// src/components/SimulatorLeftPanel.tsx
import React from 'react';
import '../components_css/SimulatorLeftPanel.css';
import { GraphInputForm } from './GraphInputForm';
import type { BlossomStep, Edge, VertexId } from '../logic/blossomTypes';

interface SimulatorLeftPanelProps {
  vertices: VertexId[];
  edges: Edge[];
  currentStep: BlossomStep | undefined;
  onChangeVertices: (vs: VertexId[]) => void;
  onChangeEdges: (es: Edge[]) => void;
  onRun: (vs: VertexId[], es: Edge[]) => void;
}

export const SimulatorLeftPanel: React.FC<SimulatorLeftPanelProps> = ({
  vertices,
  edges,
  currentStep,
  onChangeVertices,
  onChangeEdges,
  onRun,
}) => {
  return (
    <div className="simulator-left-panel-root">
      <GraphInputForm
        vertices={vertices}
        edges={edges}
        onChangeVertices={onChangeVertices}
        onChangeEdges={onChangeEdges}
        onRun={onRun}
      />
      {currentStep ? (
        <div className="step-info">
          <div className="step-info-header">
            Step {currentStep.id}
          </div>
          <div className="step-info-content">
            {currentStep.description}
          </div>
        </div>
      ) : (
        <div className="step-info">
          <div className="step-info-header">
            Step Info
          </div>
          <div className="step-info-content step-placeholder">
            Enter a graph and run the algorithm to see steps here.
          </div>
        </div>
      )}
    </div>
  );
};