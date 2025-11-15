// src/pages/SimulatorPage.tsx
import React, { useEffect, useState } from 'react';
import '../pages_css/SimulatorPage.css';
import { GraphInputForm } from '../components/GraphInputForm';
import { Controls } from '../components/Controls';
import { GraphView } from '../components/GraphView';
import { runEdmondsBlossom } from '../logic/runEdmondsBlossom';
import type{
  BlossomStep,
  Edge,
  VertexId,
} from '../logic/blossomTypes';

export const SimulatorPage: React.FC = () => {
  const [vertices, setVertices] = useState<VertexId[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [steps, setSteps] = useState<BlossomStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [intervalMs, setIntervalMs] = useState(1000);

  const handleRun = () => {
    const resultSteps = runEdmondsBlossom(vertices, edges);
    setSteps(resultSteps);
    setCurrentStepIndex(0);
    setPlaying(false);
  };

  useEffect(() => {
    if (!playing || steps.length === 0) return;

    const id = window.setInterval(() => {
      setCurrentStepIndex(prev => {
        if (prev >= steps.length - 1) {
          return prev;
        }
        return prev + 1;
      });
    }, intervalMs);

    return () => window.clearInterval(id);
  }, [playing, steps, intervalMs]);

  const currentStep = steps[currentStepIndex];

  return (
    <div className="simulator-page">
      <h1 className="simulator-title">Edmonds Blossom Simulator</h1>

      <div className="simulator-layout">
        <div className="simulator-left">
          <GraphInputForm
            vertices={vertices}
            edges={edges}
            onChangeVertices={setVertices}
            onChangeEdges={setEdges}
            onRun={handleRun}
          />
        </div>

        <div className="simulator-right">
          <Controls
            hasSteps={steps.length > 0}
            currentStepIndex={currentStepIndex}
            totalSteps={steps.length}
            playing={playing}
            intervalMs={intervalMs}
            onNext={() =>
              setCurrentStepIndex(i =>
                Math.min(i + 1, steps.length - 1)
              )
            }
            onPrev={() =>
              setCurrentStepIndex(i => Math.max(i - 1, 0))
            }
            onPlayToggle={() => setPlaying(p => !p)}
            onChangeInterval={setIntervalMs}
          />

          {currentStep ? (
            <>
              <GraphView step={currentStep} />
              <div className="step-description">
                <strong>Step {currentStep.id}:</strong>{' '}
                {currentStep.description}
              </div>
            </>
          ) : (
            <div className="step-placeholder">
              Enter a graph and run the algorithm to see steps here.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
