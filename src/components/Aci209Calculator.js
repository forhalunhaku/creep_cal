import React, { useState } from 'react';
import CalculatorWrapper from './ui/CalculatorWrapper';

const PARAMS_CONFIG = [
  { name: 't0', label: 'Age at Loading', min: 1, max: 365, unit: 'Days' },
  { name: 'H', label: 'Relative Humidity', min: 0, max: 100, unit: '%' },
  { name: 'VS', label: 'Volume-Surface Ratio', min: 0, max: 1000, unit: 'mm' },
  { name: 'sPhi', label: 'Slump', min: 0, max: 1, unit: '' },
  { name: 'Cc', label: 'Cement Content', min: 0, max: 1000, unit: 'kg/m³' },
  { name: 'alpha', label: 'Creep Parameter α', min: 0, max: 1, unit: '' }
];

export default function Aci209Calculator() {
  const [params, setParams] = useState({ t0: 28, H: 70, VS: 100, sPhi: 0.5, Cc: 350, alpha: 0.08 });
  const [results, setResults] = useState([]);
  const [feedLogs, setFeedLogs] = useState([{ time: new Date().toLocaleTimeString(), message: 'System initialized. JS Engine standing by...', type: 'info' }]);
  
  const addLog = (msg, type='info') => {
    setFeedLogs(prev => [...prev.slice(-9), { time: new Date().toLocaleTimeString(), message: msg, type }]);
  };

  const handleParamChange = (e) => {
    const { name, value } = e.target;
    setParams(prev => ({ ...prev, [name]: parseFloat(value) }));
  };

  const calculateCreep = () => {
    addLog(`Initiating calculation with t0=${params.t0}d, H=${params.H}%`, 'info');
    try {
      const startTime = performance.now();
      const { t0, H, VS, sPhi, Cc, alpha } = params;
      const data = [];
      const βt0 = 1.25 * Math.pow(t0, -0.118);
      const βRH = 1.27 - 0.0067 * H;
      const βVS = (2 * (1 + 1.13 * Math.exp(-0.0213 * VS))) / 3;
      const βsPhi = 0.88 + 0.244 * sPhi;
      const βCc = 0.75 + 0.00061 * Cc;
      const βα = 0.46 + 9 * alpha;
      const phiInfinity = 2.35 * βt0 * βRH * βVS * βsPhi * βCc * βα;
      
      for (let t = 0; t <= 10000; t += 1) {
        const βc = Math.pow(t, 0.6) / (10 + Math.pow(t, 0.6));
        const phi = βc * phiInfinity;
        data.push({ t, phi });
      }
      
      setResults(data);
      const elapsed = performance.now() - startTime;
      addLog(`Calculation completed in ${elapsed.toFixed(2)}ms`, 'success');
    } catch (e) {
      addLog('Calculation failed: ' + e.message, 'error');
    }
  };

  return (
    <CalculatorWrapper 
      modelName="ACI 209R (JS)"
      modelDescription="High-fidelity time-dependent deformation modeling based on ACI 209R-92 standard, powered by standard Javascript Engine."
      paramsConfig={PARAMS_CONFIG}
      params={params}
      onParamChange={handleParamChange}
      onCalculate={calculateCreep}
      calculateReady={true}
      buttonText="INITIATE CALCULATION"
      phiResult={results.length > 0 ? results[results.length - 1].phi : NaN}
      feedLogs={feedLogs}
      concreteClass="C35/45 Equivalency"
      crossSectionInfo={`V/S: ${params.VS} mm`}
      chartData={results}
      chartLines={[{ dataKey: "phi", stroke: "#8ff5ff", name: "Creep Coefficient φ" }]}
    />
  );
}