// src/App.tsx
import React from 'react';
import './App.css';
import { SimulatorPage } from './pages/SimulatorPage';

const App: React.FC = () => {
  return (
    <div className="app-root">
      <SimulatorPage />
    </div>
  );
};

export default App;
