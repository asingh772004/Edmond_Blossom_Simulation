// src/components/Controls.tsx
import React from 'react';
import '../components_css/Controls.css';

interface ControlsProps {
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

export const Controls: React.FC<ControlsProps> = ({
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
  const disableNav = !hasSteps || totalSteps <= 0;

  return (
    <div className="controls-root">
      <div className="controls-buttons">
        <button
          type="button"
          onClick={onPrev}
          disabled={disableNav || currentStepIndex === 0}
        >
          Prev
        </button>
        <button
          type="button"
          onClick={onPlayToggle}
          disabled={!hasSteps}
        >
          {playing ? 'Pause' : 'Play'}
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={
            disableNav || currentStepIndex >= totalSteps - 1
          }
        >
          Next
        </button>
      </div>

      <div className="controls-info">
        Step {hasSteps ? currentStepIndex + 1 : 0} /{' '}
        {hasSteps ? totalSteps : 0}
      </div>

      <label className="controls-speed">
        Auto step interval (ms)
        <input
          type="number"
          min={100}
          value={intervalMs}
          onChange={e =>
            onChangeInterval(Number(e.target.value) || 1000)
          }
        />
      </label>
    </div>
  );
};
