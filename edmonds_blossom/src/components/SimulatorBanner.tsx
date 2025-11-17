// src/components/SimulatorBanner.tsx
import React from 'react';
import '../components_css/SimulatorBanner.css';

/**
 * Displays the main title banner for the simulator page.
 */
export const SimulatorBanner: React.FC = () => {
  return (
    <h1 className="simulator-title">Edmonds Blossom Simulator</h1>
  );
};