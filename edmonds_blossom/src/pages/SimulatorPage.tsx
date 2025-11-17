// src/pages/SimulatorPage.tsx
import React, { useEffect, useState } from 'react';
import '../pages_css/SimulatorPage.css';
import { SimulatorBanner } from '../components/SimulatorBanner';
import { SimulatorLeftPanel } from '../components/SimulatorLeftPanel';
import { SimulatorRightPanel } from '../components/SimulatorRightPanel';
import { runEdmondsBlossom } from '../logic/runEdmondsBlossom';
import type {
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

  const handleRun = (vs: VertexId[], es: Edge[]) => {
    setVertices(vs);
    setEdges(es);
    const resultSteps = runEdmondsBlossom(vs, es);
    setSteps(resultSteps);
    setCurrentStepIndex(0);
    setPlaying(false);
  };


  useEffect(() => {
    if (!playing || steps.length === 0) return;

    const id = window.setInterval(() => {
      setCurrentStepIndex(prev => {
        if (prev >= steps.length - 1) {
          setPlaying(false); // Stop playing at the end
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
      <SimulatorBanner />

      <div className="simulator-layout">
        <SimulatorLeftPanel
          vertices={vertices}
          edges={edges}
          currentStep={currentStep}
          onChangeVertices={setVertices}
          onChangeEdges={setEdges}
          onRun={handleRun}
        />

        <SimulatorRightPanel
          currentStep={currentStep}
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
      </div>
    </div>
  );
};