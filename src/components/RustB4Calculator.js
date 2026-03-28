import React, { useState, useEffect } from 'react';
import CalculatorWrapper from './ui/CalculatorWrapper';

let wasmModule = null;
let wasmInitialized = false;

const initWasm = async () => {
  if (!wasmInitialized) {
    try {
      const wasm = await import('../wasm-pkg/creep_calculator_engine.js');
      await wasm.default();
      wasmModule = wasm;
      wasmInitialized = true;
    } catch (error) {
      console.error('❌ Rust WebAssembly 模块加载失败:', error);
    }
  }
  return wasmModule;
};

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

export default function RustB4Calculator() {
  const [params, setParams] = useState({
    t0: 28, tPrime: 7, T: 20, h: 60, fc: 30, vS: 0.5, c: 350, wC: 0.5, aC: 4,
    cementType: 'R', aggregateType: '石英岩', specimenShape: '无限圆柱体'
  });
  const [results, setResults] = useState([]);
  const [wasmReady, setWasmReady] = useState(false);
  const [feedLogs, setFeedLogs] = useState([{ time: new Date().toLocaleTimeString(), message: 'System initialized. Awaiting input...', type: 'info' }]);
  
  useEffect(() => {
    addLog('Loading Rust B4 Model WASM Module...', 'info');
    initWasm().then((module) => {
      if (module) {
        setWasmReady(true);
        addLog('Kernel v2.4 (B4-Rust) initialized successfully.', 'success');
      } else {
        addLog('WASM initialization failed', 'error');
      }
    });
  }, []);

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

  const calculateCreep = async () => {
    if (!wasmReady || !wasmModule) {
      addLog('Rust Engine not ready.', 'error');
      return;
    }
    
    addLog(`Initiating B4 calculation with fc=${params.fc}MPa, t0=${params.t0}d`, 'info');
    try {
      const timer = new wasmModule.PerformanceTimer();
      const rustParams = { 
        t0: params.t0, t_prime: params.tPrime, t_temp: params.T, h: params.h,
        fc: params.fc, v_s: params.vS, c: params.c, w_c: params.wC, a_c: params.aC,
        cement_type: params.cementType, aggregate_type: params.aggregateType, specimen_shape: params.specimenShape
      };
      
      const rustResults = wasmModule.calculate_b4_series(rustParams, 10000);
      const elapsed = timer.elapsed();
      const formattedResults = rustResults.map((result) => ({
        t: result.t,
        j: result.j * 1e6,
        epsilon_sh: result.epsilon_sh * 1e6,
        epsilon_au: result.epsilon_au * 1e6
      }));
      setResults(formattedResults);
      addLog(`Calculation completed in ${elapsed.toFixed(2)}ms`, 'success');
    } catch (e) {
      addLog('Calculation failed: ' + e.message, 'error');
    }
  };

  const currentJ     = results.length > 0 ? results[results.length - 1].j / 1e6 : NaN;
  const currentEpsSH = results.length > 0 ? results[results.length - 1].epsilon_sh / 1e6 : NaN;
  const currentEpsAU = results.length > 0 ? results[results.length - 1].epsilon_au / 1e6 : NaN;

  return (
    <CalculatorWrapper 
      modelName="B4 Model (RUST)"
      modelDescription="Multi-decade comprehensive creep and shrinkage prediction model powered by Rust kernel."
      paramsConfig={PARAMS_CONFIG}
      params={params}
      onParamChange={handleParamChange}
      onCalculate={calculateCreep}
      calculateReady={wasmReady}
      buttonText={wasmReady ? "INITIATE CALCULATION" : "LOADING KERNEL..."}
      phiResult={currentJ} // Display J instead of phi for B4
      feedLogs={feedLogs}
      concreteClass={`${params.cementType} TYPE`}
      crossSectionInfo={`${params.aggregateType}`}
      chartData={results}
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
