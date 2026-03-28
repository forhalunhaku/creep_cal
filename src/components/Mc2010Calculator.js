import React, { useState } from 'react';
import CalculatorWrapper from './ui/CalculatorWrapper';

const PARAMS_CONFIG = [
  { name: 'fcm', label: 'Concrete Strength', min: 10, max: 150, unit: 'MPa' },
  { name: 'RH', label: 'Relative Humidity', min: 0, max: 100, unit: '%' },
  { name: 't0', label: 'Age at Loading', min: 1, max: 1000, unit: 'Days' },
  { name: 'Ac', label: 'Cross Section Area', min: 1, max: 1000000, unit: 'mm²' },
  { name: 'u', label: 'Perimeter', min: 1, max: 10000, unit: 'mm' },
  { name: 'T', label: 'Temperature', min: -20, max: 100, unit: '°C' },
  { 
    name: 'cementType', 
    label: 'Cement Class', 
    options: [
      { value: '32.5N', label: '32.5N' },
      { value: '32.5R', label: '32.5R' },
      { value: '42.5N', label: '42.5N' },
      { value: '42.5R', label: '42.5R' },
      { value: '52.5N', label: '52.5N' },
      { value: '52.5R', label: '52.5R' }
    ] 
  }
];

const cementAlphaMap = {
  '32.5N': -1,
  '32.5R': 0,
  '42.5N': 0,
  '42.5R': 1,
  '52.5N': 1,
  '52.5R': 1
};

function calculatePhiMC2010(fcm, RH, t0, Ac, u, T, Cs, t0_adj, h, alpha_fcm, beta_h, tDiff) {
  const beta_bc_fcm = 1.8 / Math.pow(fcm, 0.7);
  const beta_bc_t_t0 = Math.log(Math.pow(((30 / t0_adj) + 0.035), 2) * tDiff + 1);
  const phi_bc = beta_bc_fcm * beta_bc_t_t0;
  
  const beta_dc_fcm = 412 / Math.pow(fcm, 1.4);
  const beta_dc_RH = (1 - RH / 100) / Math.pow((0.1 * (h / 100)), 1/3);
  const beta_dc_t0 = 1 / (0.1 + Math.pow(t0_adj, 0.2));
  const gamma_t0 = 1 / (2.3 + 3.5 / Math.sqrt(t0_adj));
  const beta_dc_t_t0 = Math.pow(tDiff / (beta_h + tDiff), gamma_t0);
  const phi_dc = beta_dc_fcm * beta_dc_RH * beta_dc_t0 * beta_dc_t_t0;
  
  return phi_bc + phi_dc;
}

export default function Mc2010Calculator() {
  const [params, setParams] = useState({
    fcm: 40, RH: 70, t0: 28, Ac: 1000, u: 400, T: 20, cementType: '42.5R'
  });
  const [results, setResults] = useState([]);
  const [feedLogs, setFeedLogs] = useState([{ time: new Date().toLocaleTimeString(), message: 'System initialized. JS Engine standing by...', type: 'info' }]);
  
  const addLog = (msg, type='info') => {
    setFeedLogs(prev => [...prev.slice(-9), { time: new Date().toLocaleTimeString(), message: msg, type }]);
  };

  const handleParamChange = (e) => {
    const { name, value } = e.target;
    setParams(prev => ({ ...prev, [name]: name === 'cementType' ? value : parseFloat(value) }));
  };

  const calculateCreep = () => {
    addLog(`Initiating calculation with fcm=${params.fcm}MPa, t0=${params.t0}d`, 'info');
    try {
      const startTime = performance.now();
      const { fcm, RH, t0, Ac, u, T, cementType } = params;
      
      const alpha = cementAlphaMap[cementType];
      const t0_T = t0 * Math.exp(13.65 - 4000 / (273 + Number(T)));
      const t0_adj = t0_T * Math.pow((9 / (2 + Math.pow(t0_T, 1.2))) + 1, alpha);
      const h = (2 * Ac) / u; // mm
      const alpha_fcm = Math.sqrt(35 / fcm);
      const beta_h = Math.min(1.5 * h + 250 * alpha_fcm, 1500 * alpha_fcm);
      
      const creepData = [];
      for (let t = 0; t <= 10000; t += 1) {
        const phi = calculatePhiMC2010(fcm, RH, t0, Ac, u, T, cementType, t0_adj, h, alpha_fcm, beta_h, t);
        creepData.push({ t, phi: parseFloat(phi.toFixed(4)) });
      }
      
      setResults(creepData);
      const elapsed = performance.now() - startTime;
      addLog(`Calculation completed in ${elapsed.toFixed(2)}ms`, 'success');
    } catch (e) {
      addLog('Calculation failed: ' + e.message, 'error');
    }
  };

  const currentHEff = (2 * params.Ac / params.u).toFixed(0);

  return (
    <CalculatorWrapper 
      modelName="fib MC 2010 (JS)"
      modelDescription="High-fidelity time-dependent deformation modeling based on European Concrete standard, powered by standard Javascript Engine."
      paramsConfig={PARAMS_CONFIG}
      params={params}
      onParamChange={handleParamChange}
      onCalculate={calculateCreep}
      calculateReady={true}
      buttonText="INITIATE CALCULATION"
      phiResult={results.length > 0 ? results[results.length - 1].phi : NaN}
      feedLogs={feedLogs}
      concreteClass={`fcm: ${params.fcm} MPa`}
      crossSectionInfo={`h_e: ${currentHEff} mm`}
      chartData={results}
      chartLines={[{ dataKey: "phi", stroke: "#e7c5ff", name: "Creep Coefficient φ" }]}
    />
  );
}