import React, { useState } from 'react';
import CalculatorWrapper from './ui/CalculatorWrapper';

const PARAMS_CONFIG = [
  { name: 't0', label: 'Age at Loading', min: 1, max: 365, unit: 'Days' },
  { name: 'tPrime', label: 'Curing Time', min: 1, max: 365, unit: 'Days' },
  { name: 'T', label: 'Temperature', min: -20, max: 60, unit: '°C' },
  { name: 'h', label: 'Relative Humidity', min: 0, max: 100, unit: '%' },
  { name: 'fc', label: 'Concrete Strength', min: 10, max: 100, unit: 'MPa' },
  { name: 'vS', label: 'Volume-Surface Ratio', min: 0.1, max: 10, unit: 'mm' },
  { name: 'c', label: 'Cement Content', min: 200, max: 600, unit: 'kg/m³' },
  { name: 'wC', label: 'Water-Cement Ratio', min: 0.2, max: 0.8, unit: '' },
  { name: 'aC', label: 'Aggregate-Cement Ratio', min: 1, max: 10, unit: '' },
  { 
    name: 'cementType', 
    label: 'Cement Type', 
    options: [
      { value: 'R', label: 'R (Ordinary)' },
      { value: 'RS', label: 'RS (Rapid)' },
      { value: 'SL', label: 'SL (Slow)' }
    ] 
  },
  { 
    name: 'aggregateType', 
    label: 'Aggregate Type', 
    options: [
      { value: '辉绿岩', label: 'Diabase' },
      { value: '石英岩', label: 'Quartzite' },
      { value: '石灰岩', label: 'Limestone' },
      { value: '砂岩', label: 'Sandstone' },
      { value: '花岗岩', label: 'Granite' },
      { value: '石英闪长岩', label: 'Quartz Diorite' },
      { value: '无信息', label: 'Unknown' }
    ] 
  },
  { 
    name: 'specimenShape', 
    label: 'Specimen Shape', 
    options: [
      { value: '无限平板', label: 'Infinite Slab' },
      { value: '无限圆柱体', label: 'Infinite Cylinder' },
      { value: '无限方柱体', label: 'Infinite Square Prism' },
      { value: '球体', label: 'Sphere' },
      { value: '立方体', label: 'Cube' }
    ] 
  }
];

const cementParams = {
  R: { τcem: 0.016, εcem: 360e-6, τaucem: 1, εaucem: 210e-6, p1: 0.70, p2: 58.6e-3, p3: 39.3e-3, p4: 3.4e-3, p5: 777e-6, p5H: 8.00, p2w: 3.00, p3a: -1.10, p3w: 0.40, p4a: -0.90, p4w: 2.45, p5a: -1, p5w: 0.78, p5_epsilon: -0.85, r_epsilon_a: -0.75, r_epsilon_w: -3.5, r_tau_w: 3, r_alpha: 1, r_t: -4.5 },
  RS: { τcem: 0.08, εcem: 860e-6, τaucem: 41, εaucem: -84.0e-6, p1: 0.60, p2: 17.4e-3, p3: 39.3e-3, p4: 3.4e-3, p5: 94.6e-6, p5H: 1.00, p2w: 3.00, p3a: -1.10, p3w: 0.40, p4a: -0.90, p4w: 2.45, p5a: -1, p5w: 0.78, p5_epsilon: -0.85, r_epsilon_a: -0.75, r_epsilon_w: -3.5, r_tau_w: 3, r_alpha: 1.4, r_t: -4.5 },
  SL: { τcem: 0.01, εcem: 410e-6, τaucem: 1, εaucem: 0.00e-6, p1: 0.8, p2: 40.5e-3, p3: 39.3e-3, p4: 3.4e-3, p5: 496e-6, p5H: 8.00, p2w: 3.00, p3a: -1.10, p3w: 0.40, p4a: -0.90, p4w: 2.45, p5a: -1, p5w: 0.78, p5_epsilon: -0.85, r_epsilon_a: -0.75, r_epsilon_w: -3.5, r_tau_w: 3, r_alpha: 1, r_t: -4.5 }
};
const aggregateParams = {
  '辉绿岩': { ksτa: 0.06, ksεa: 0.76 },
  '石英岩': { ksτa: 0.59, ksεa: 0.71 },
  '石灰岩': { ksτa: 1.80, ksεa: 0.95 },
  '砂岩': { ksτa: 2.30, ksεa: 1.60 },
  '花岗岩': { ksτa: 4.00, ksεa: 1.05 },
  '石英闪长岩': { ksτa: 15.0, ksεa: 2.20 },
  '无信息': { ksτa: 1.00, ksεa: 1.00 }
};
const shapeParams = {
  '无限平板': { ks: 1.00 },
  '无限圆柱体': { ks: 1.15 },
  '无限方柱体': { ks: 1.25 },
  '球体': { ks: 1.30 },
  '立方体': { ks: 1.55 }
};

export default function B4Calculator() {
  const [params, setParams] = useState({
    t0: 28, tPrime: 7, T: 20, h: 60, fc: 30, vS: 0.5, c: 350, wC: 0.5, aC: 4,
    cementType: 'R', aggregateType: '石英岩', specimenShape: '无限圆柱体'
  });
  const [chartData, setChartData] = useState([]);
  const [feedLogs, setFeedLogs] = useState([{ time: new Date().toLocaleTimeString(), message: 'System initialized. JS Engine standing by...', type: 'info' }]);
  
  const addLog = (msg, type='info') => {
    setFeedLogs(prev => [...prev.slice(-9), { time: new Date().toLocaleTimeString(), message: msg, type }]);
  };

  const handleParamChange = (e) => {
    const { name, value } = e.target;
    setParams(prev => ({ 
      ...prev, 
      [name]: ['cementType', 'aggregateType', 'specimenShape'].includes(name) ? value : parseFloat(value) 
    }));
  };

  const calculateB4 = () => {
    addLog(`Initiating B4 calculation with fc=${params.fc}MPa, t0=${params.t0}d`, 'info');
    try {
      const startTime = performance.now();
      const { t0, tPrime, T, h, fc, vS, c, wC, aC, cementType, aggregateType, specimenShape } = params;
      const cement = cementParams[cementType];
      const aggregate = aggregateParams[aggregateType];
      const shape = shapeParams[specimenShape];
      
      const D = 2 * vS;
      const E28 = (4734 * Math.sqrt(fc)) / 1000;
      const betaTh = Math.exp(4000 * (1/293 - 1/(T + 273)));
      const betaTs = betaTh;
      const betaTc = betaTh;
      const t0Tilde = t0 * betaTh;
      const tPrimeHat = t0 * betaTh + (tPrime - t0) * betaTs;
      
      const tau0 = cement.τcem * Math.pow(aC/6, cement.p_tau_a || -0.33) * Math.pow(wC/0.38, cement.p_tau_w || -0.06) * Math.pow((6.5 * c)/2350, cement.p_tau_c || -0.1);
      const tauSH = tau0 * aggregate.ksτa * Math.pow(shape.ks * D, 2);
      const epsilon0 = cement.εcem * Math.pow(aC/6, cement.p_epsilon_a || -0.8) * Math.pow(wC/0.38, cement.p_epsilon_w || 1.1) * Math.pow((6.5 * c)/2350, cement.p_epsilon_c || 0.11);
      const E1 = E28 * Math.sqrt((7 * betaTh + 600 * betaTs) / (4 + (6/7)*(7 * betaTh + 600 * betaTs)));
      const E2 = E28 * Math.sqrt((t0Tilde + tauSH * betaTs) / (4 + (6/7)*(t0Tilde + tauSH * betaTs)));
      const epsilonSHInf = -epsilon0 * aggregate.ksεa * (E1 / E2);
      
      const hDecimal = h / 100;
      const kh = hDecimal <= 0.98 ? 1 - Math.pow(hDecimal, 3) : 12.94 * (1 - hDecimal) - 0.2;
      
      const dataPoints = [];
      const days = 10000;
      const startDay = parseInt(tPrime) + 1;
      
      for (let t = startDay; t <= startDay + days - 1; t++) {
        const tTilde = (t - t0) * betaTs;
        const tHat = tPrimeHat + (t - tPrime) * betaTc;
        const S = Math.tanh(Math.sqrt(tTilde / tauSH));
        const epsilonSH = epsilonSHInf * kh * S;
        
        const q1 = cement.p1 / (E28 * 1000);
        const q2 = (cement.p2 * Math.pow(wC/0.38, cement.p2w)) / 1000;
        const q3 = cement.p3 * q2 * Math.pow(aC/6, cement.p3a) * Math.pow(wC/0.38, cement.p3w);
        const q4 = (cement.p4 * Math.pow(aC/6, cement.p4a) * Math.pow(wC/0.38, cement.p4w)) / 1000;
        const rHat = 1.7 * Math.pow(tPrimeHat, 0.12) + 8;
        const Z = Math.pow(tPrimeHat, -0.5) * Math.log(1 + Math.pow(tHat - tPrimeHat, 0.1));
        const Qf = 1 / (0.086 * Math.pow(tPrimeHat, 2/9) + 1.21 * Math.pow(tPrimeHat, 4/9));
        const Q = Qf * Math.pow(1 + Math.pow(Qf / Z, rHat), -1/rHat);
        const C0 = q2 * Q + q3 * Math.log(1 + Math.pow(tHat - tPrimeHat, 0.1)) + q4 * Math.log(tHat / tPrimeHat);
        const RT = Math.exp(4000 * (1/293 - 1/(T + 273)));
        const q5 = (cement.p5 * Math.pow(aC/6, cement.p5a) * Math.pow(wC/0.38, cement.p5w) * Math.pow(Math.abs(kh * epsilonSHInf), cement.p5_epsilon)) / 1000;
        const H = 1 - (1 - hDecimal) * Math.tanh(Math.sqrt((tHat - t0Tilde) / tauSH));
        const t0Prime = Math.max(tPrimeHat, t0Tilde);
        const Hc = 1 - (1 - hDecimal) * Math.tanh(Math.sqrt((t0Prime - t0Tilde) / tauSH));
        const Cd = tHat >= t0Prime ? q5 * Math.sqrt(Math.exp(-cement.p5H * H) - Math.exp(-cement.p5H * Hc)) : 0;
        const J = q1 + RT * C0 + Cd;
        
        const epsilonAUInfinity = -cement.εaucem * Math.pow(aC/6, cement.r_epsilon_a || -0.75) * Math.pow(wC/0.38, cement.r_epsilon_w || -3.5);
        const tauAU = cement.τaucem * Math.pow(wC/0.38, cement.r_tau_w || 3);
        const alpha = (cement.r_alpha || 1) * (wC/0.38);
        const epsilonAU = epsilonAUInfinity * Math.pow(1 + Math.pow(tauAU / (tTilde + t0Tilde), alpha), cement.r_t || -4.5);
        
        dataPoints.push({
          t: t - parseInt(tPrime),
          j: J * 1e6,
          epsilon_sh: epsilonSH * 1e6,
          epsilon_au: epsilonAU * 1e6
        });
      }
      
      setChartData(dataPoints);
      const elapsed = performance.now() - startTime;
      addLog(`Calculation completed in ${elapsed.toFixed(2)}ms`, 'success');
    } catch (e) {
      addLog('Calculation failed: ' + e.message, 'error');
    }
  };

  const currentJ     = chartData.length > 0 ? chartData[chartData.length - 1].j / 1e6 : NaN;
  const currentEpsSH = chartData.length > 0 ? chartData[chartData.length - 1].epsilon_sh / 1e6 : NaN;
  const currentEpsAU = chartData.length > 0 ? chartData[chartData.length - 1].epsilon_au / 1e6 : NaN;

  return (
    <CalculatorWrapper 
      modelName="B4 Model (JS)"
      modelDescription="Multi-decade comprehensive creep and shrinkage prediction model powered by Javascript Engine."
      paramsConfig={PARAMS_CONFIG}
      params={params}
      onParamChange={handleParamChange}
      onCalculate={calculateB4}
      calculateReady={true}
      buttonText="INITIATE CALCULATION"
      phiResult={currentJ}
      feedLogs={feedLogs}
      concreteClass={`${params.cementType} TYPE`}
      crossSectionInfo={`${params.aggregateType}`}
      chartData={chartData}
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