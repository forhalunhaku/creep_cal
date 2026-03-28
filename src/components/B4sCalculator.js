import React, { useState } from 'react';
import CalculatorWrapper from './ui/CalculatorWrapper';

const PARAMS_CONFIG = [
  { name: 't0', label: 'Age at Loading', min: 1, max: 365, unit: 'Days' },
  { name: 'tPrime', label: 'Curing Time', min: 1, max: 365, unit: 'Days' },
  { name: 't_temp', label: 'Temperature', min: -20, max: 60, unit: '°C' },
  { name: 'h', label: 'Relative Humidity', min: 0, max: 100, unit: '%' },
  { name: 'fc', label: 'Concrete Strength', min: 10, max: 100, unit: 'MPa' },
  { name: 'v_s', label: 'Volume-Surface Ratio', min: 0.1, max: 10, unit: 'mm' },
  { 
    name: 'cement_type', 
    label: 'Cement Type', 
    options: [
      { value: 'R', label: 'R (Ordinary)' },
      { value: 'RS', label: 'RS (Rapid)' },
      { value: 'SL', label: 'SL (Slow)' }
    ] 
  },
  { 
    name: 'aggregate_type', 
    label: 'Aggregate Type', 
    options: [
      { value: 'Diabase', label: 'Diabase' },
      { value: 'Quartzite', label: 'Quartzite' },
      { value: 'Limestone', label: 'Limestone' },
      { value: 'Sandstone', label: 'Sandstone' },
      { value: 'Granite', label: 'Granite' },
      { value: 'Quartz Diorite', label: 'Quartz Diorite' },
      { value: 'No Information', label: 'Unknown' }
    ] 
  },
  { 
    name: 'specimen_shape', 
    label: 'Specimen Shape', 
    options: [
      { value: '1', label: 'Infinite Slab' },
      { value: '2', label: 'Infinite Cylinder' },
      { value: '3', label: 'Infinite Square Prism' },
      { value: '4', label: 'Sphere' },
      { value: '5', label: 'Cube' }
    ] 
  }
];

const cementParams = {
  'R': { tau_au_cem: 2.26, r_tau_f: 0.27, epsilon_au_cem: 78.2e-6, r_epsilon_f: 1.03, tau_s_cem: 0.027, s_tau_f: 0.21, epsilon_s_cem: 590e-6, s_epsilon_f: -0.51, p1: 0.70, p5_epsilon: -0.85, p5H: 8, s2: 14.2e-3, s3: 0.976, s4: 4.00e-3, s5: 1.54e-3, s2f: -1.58, s3f: -1.61, s4f: -1.16, s5f: -0.45 },
  'RS': { tau_au_cem: 2.26, r_tau_f: 0.27, epsilon_au_cem: 78.2e-6, r_epsilon_f: 1.03, tau_s_cem: 0.027, s_tau_f: 1.55, epsilon_s_cem: 830e-6, s_epsilon_f: -0.84, p1: 0.60, p5_epsilon: -0.85, p5H: 1, s2: 29.9e-3, s3: 0.976, s4: 4.00e-3, s5: 41.8e-3, s2f: -1.58, s3f: -1.61, s4f: -1.16, s5f: -0.45 },
  'SL': { tau_au_cem: 2.26, r_tau_f: 0.27, epsilon_au_cem: 78.2e-6, r_epsilon_f: 1.03, tau_s_cem: 0.032, s_tau_f: -1.84, epsilon_s_cem: 640e-6, s_epsilon_f: -0.69, p1: 0.80, p5_epsilon: -0.85, p5H: 8, s2: 11.2e-3, s3: 0.976, s4: 4.00e-3, s5: 150e-3, s2f: -1.58, s3f: -1.61, s4f: -1.16, s5f: -0.45 }
};
const specimenShapeParams = {
  '1': { ks: 1.00 }, '2': { ks: 1.15 }, '3': { ks: 1.25 }, '4': { ks: 1.30 }, '5': { ks: 1.55 }
};
const aggregateParams = {
  'Diabase': { ks_tau_a: 0.06, ks_epsilon_a: 0.76 },
  'Quartzite': { ks_tau_a: 0.59, ks_epsilon_a: 0.71 },
  'Limestone': { ks_tau_a: 1.80, ks_epsilon_a: 0.95 },
  'Sandstone': { ks_tau_a: 2.30, ks_epsilon_a: 1.60 },
  'Granite': { ks_tau_a: 4.00, ks_epsilon_a: 1.05 },
  'Quartz Diorite': { ks_tau_a: 15.0, ks_epsilon_a: 2.20 },
  'No Information': { ks_tau_a: 1.00, ks_epsilon_a: 1.00 }
};

export default function B4sCalculator() {
  const [params, setParams] = useState({
    t0: 28, tPrime: 7, t_temp: 20, h: 60, fc: 30, v_s: 0.5,
    cement_type: 'R', aggregate_type: 'Quartzite', specimen_shape: '2'
  });
  const [resultsData, setResultsData] = useState([]);
  const [feedLogs, setFeedLogs] = useState([{ time: new Date().toLocaleTimeString(), message: 'System initialized. JS Engine standing by...', type: 'info' }]);
  
  const addLog = (msg, type='info') => {
    setFeedLogs(prev => [...prev.slice(-9), { time: new Date().toLocaleTimeString(), message: msg, type }]);
  };

  const handleParamChange = (e) => {
    const { name, value } = e.target;
    setParams(prev => ({ 
      ...prev, 
      [name]: ['cement_type', 'aggregate_type', 'specimen_shape'].includes(name) ? value : parseFloat(value) 
    }));
  };

  const calculate = () => {
    addLog(`Initiating B4S calculation with fc=${params.fc}MPa, t0=${params.t0}d`, 'info');
    try {
      const startTime = performance.now();
      const { t0, tPrime, t_temp, h, fc, v_s, cement_type, specimen_shape, aggregate_type } = params;
      const t0Num = parseFloat(t0);
      const tPrimeNum = parseFloat(tPrime);
      const TNum = parseFloat(t_temp);
      const hNum = parseFloat(h);
      const fcNum = parseFloat(fc);
      const vSNum = parseFloat(v_s);
      
      const cem = cementParams[cement_type];
      const shape = specimenShapeParams[specimen_shape] || { ks: 1.15 };
      const agg = aggregateParams[aggregate_type] || { ks_tau_a: 0.59, ks_epsilon_a: 0.71 };
      
      const res = [];
      const E28 = (4734 * Math.sqrt(fcNum)) / 1000;
      const betaTh = Math.exp(4000 * (1/293 - 1/(TNum + 273)));
      const betaTs = betaTh;
      const betaTc = betaTh;
      const t0Tilde = t0Num * betaTh;
      const D = 2 * vSNum;
      
      const tau0 = cem.tau_s_cem * Math.pow(fcNum / 40, cem.s_tau_f);
      const tauSH = tau0 * agg.ks_tau_a * Math.pow(shape.ks * D, 2);
      const epsilon0 = cem.epsilon_s_cem * Math.pow(fcNum / 40, cem.s_epsilon_f);
      const E1 = E28 * Math.sqrt((7 * betaTh + 600 * betaTs) / (4 + (6/7)*(7 * betaTh + 600 * betaTs)));
      const E2 = E28 * Math.sqrt((t0Tilde + tauSH * betaTs) / (4 + (6/7)*(t0Tilde + tauSH * betaTs)));
      const epsilonSHInf = -epsilon0 * agg.ks_epsilon_a * (E1 / E2);
      
      const kh = hNum <= 98 ? 1 - Math.pow(hNum/100, 3) : 12.94 * (1 - hNum/100) - 0.2;
      const epsilonAUInf = -cem.epsilon_au_cem * Math.pow(fcNum / 40, cem.r_epsilon_f);
      const tauAU = cem.tau_au_cem * Math.pow(fcNum / 40, cem.r_tau_f);
      const alpha_s = 1.73;
      const r_t = -1.73;
      
      for (let day = 0; day < 10000; day++) {
        const t = tPrimeNum + day + 1;
        const tTilde = (t - t0Num) * betaTs;
        const tPrimeHat = t0Tilde + (tPrimeNum - t0Num) * betaTs;
        const tHat = tPrimeHat + (t - tPrimeNum) * betaTc;
        
        const S = Math.tanh(Math.sqrt(Math.max(0, tTilde / tauSH)));
        const epsilonSH = epsilonSHInf * kh * S;
        const epsilonAU = epsilonAUInf * Math.pow(1 + Math.pow(tauAU / (Math.max(0.1, tTilde + t0Tilde)), alpha_s), r_t);
        
        const q1 = cem.p1 / (E28 * 1000);
        const q2 = cem.s2 * Math.pow(fcNum / 40, cem.s2f) / 1000;
        const q3 = cem.s3 * q2 * Math.pow(fcNum / 40, cem.s3f);
        const q4 = cem.s4 * Math.pow(fcNum / 40, cem.s4f) / 1000;
        const rHat = 1.7 * Math.pow(tPrimeHat, 0.12) + 8;
        
        const Z = tHat > tPrimeHat ? Math.pow(tPrimeHat, -0.5) * Math.log(1 + Math.pow(tHat - tPrimeHat, 0.1)) : 0.001;
        const Qf = 1 / (0.086 * Math.pow(tPrimeHat, 2/9) + 1.21 * Math.pow(tPrimeHat, 4/9));
        const Q = Qf * Math.pow(1 + Math.pow(Qf / Math.max(0.0001, Z), rHat), -1/rHat);
        
        const C0 = q2 * Q + q3 * Math.log(1 + Math.pow(Math.max(0, tHat - tPrimeHat), 0.1)) + q4 * Math.log(Math.max(1, tHat / tPrimeHat));
        const RT = Math.exp(4000 * (1/293 - 1/(TNum + 273)));
        const q5 = cem.s5 * Math.pow(fcNum / 40, cem.s5f) * Math.pow(Math.abs(kh * epsilonSHInf), cem.p5_epsilon || -0.85) / 1000;
        
        const H = 1 - (1 - hNum/100) * Math.tanh(Math.sqrt(Math.max(0, tHat - t0Tilde) / tauSH));
        const tPrime0 = Math.max(tPrimeHat, t0Tilde);
        const Hc = 1 - (1 - hNum/100) * Math.tanh(Math.sqrt(Math.max(0, tPrime0 - t0Tilde) / tauSH));
        const Cd = tHat >= tPrime0 ? q5 * Math.sqrt(Math.max(0, Math.exp(-cem.p5H * H) - Math.exp(-cem.p5H * Hc))) : 0;
        
        const J = q1 + RT * C0 + Cd;
        res.push({
          t: t - tPrimeNum,
          j: J * 1e6,
          epsilon_sh: epsilonSH * 1e6,
          epsilon_au: epsilonAU * 1e6
        });
      }
      setResultsData(res);
      const elapsed = performance.now() - startTime;
      addLog(`Calculation completed in ${elapsed.toFixed(2)}ms`, 'success');
    } catch (e) {
      addLog('Calculation failed: ' + e.message, 'error');
    }
  };

  const currentJ     = resultsData.length > 0 ? resultsData[resultsData.length - 1].j / 1e6 : NaN;
  const currentEpsSH = resultsData.length > 0 ? resultsData[resultsData.length - 1].epsilon_sh / 1e6 : NaN;
  const currentEpsAU = resultsData.length > 0 ? resultsData[resultsData.length - 1].epsilon_au / 1e6 : NaN;

  return (
    <CalculatorWrapper 
      modelName="B4S Model (JS)"
      modelDescription="Simplified B4 Model for rapid analysis powered by Javascript Engine."
      paramsConfig={PARAMS_CONFIG}
      params={params}
      onParamChange={handleParamChange}
      onCalculate={calculate}
      calculateReady={true}
      buttonText="INITIATE CALCULATION"
      phiResult={currentJ}
      feedLogs={feedLogs}
      concreteClass={`${params.cement_type} TYPE`}
      crossSectionInfo={`${params.aggregate_type}`}
      chartData={resultsData}
      chartLines={[
        { dataKey: "j", stroke: "#ff85e4", name: "Compliance J (×10⁻⁶ GPa⁻¹)" },
        { dataKey: "epsilon_sh", stroke: "#8ff5ff", name: "Drying Shrinkage εsh (με)" },
        { dataKey: "epsilon_au", stroke: "#c47fff", name: "Autogenous Shrinkage εau (με)" }
      ]}
      resultLabel="Compliance J(t,t′) · 1/GPa"
      extraResults={[
        { label: 'Drying Shrinkage εsh (at t_max)', value: currentEpsSH },
        { label: 'Autogenous Shrinkage εau (at t_max)', value: currentEpsAU },
      ]}
    />
  );
}