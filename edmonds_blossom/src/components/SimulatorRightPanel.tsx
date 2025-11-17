// src/components/SimulatorRightPanel.tsx
import React from 'react';
import '../components_css/SimulatorRightPanel.css';
import { Controls } from './Controls';
import { GraphView } from './GraphView';
import type { BlossomStep } from '../logic/blossomTypes';

interface SimulatorRightPanelProps {
  currentStep: BlossomStep | undefined;
  hasSteps: boolean;
  currentStepIndex: number;
  totalSteps: number;
  playing: boolean;
  intervalMs: number;
  onNext: () => void;
  onPrev: () => void;
  onPlayToggle: () => void;
  onChangeInterval: (ms: number) => void;
}

/**
 * The right panel of the simulator, containing the controls
 * and the graph visualization.
 */
export const SimulatorRightPanel: React.FC<SimulatorRightPanelProps> = ({
  currentStep,
  hasSteps,
  currentStepIndex,
  totalSteps,
  playing,
  intervalMs,
  onNext,
  onPrev,
  onPlayToggle,
  onChangeInterval,
}) => {
  return (
    <div className="simulator-right-panel-root">
      <Controls
        hasSteps={hasSteps}
        currentStepIndex={currentStepIndex}
        totalSteps={totalSteps}
        playing={playing}
        intervalMs={intervalMs}
        onNext={onNext}
        onPrev={onPrev}
        onPlayToggle={onPlayToggle}
        onChangeInterval={onChangeInterval}
      />
      
      {}

      {currentStep ? (
        <GraphView step={currentStep} />
      ) : (
        <div className="graph-view-placeholder">
          Run the algorithm to see the graph visualization.
        </div>
      )}
    </div>
  );
};