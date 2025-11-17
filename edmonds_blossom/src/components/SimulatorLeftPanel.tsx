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
  
  const renderDescription = () => {
    if (!currentStep) return "Enter a graph and run the algorithm to see steps here.";
    if (currentStep.type === 'DONE') {
      const parts = currentStep.description.split('Final size:');
      return (
        <>
          {parts[0]}
          {parts[1] && (
            <>
              <br />
              <strong>Final size:{parts[1]}</strong>
            </>
          )}
        </>
      );
    }
    return currentStep.description;
  };

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
          {/* Use the new render function */}
          <div className="step-info-content">
            {renderDescription()}
          </div>
        </div>
      ) : (
        <div className="step-info">
          <div className="step-info-header">
            Step Info
          </div>
          <div className="step-info-content step-placeholder">
            {renderDescription()}
          </div>
        </div>
      )}
    </div>
  );
};