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

export default function RustB4sCalculator() {
  const [params, setParams] = useState({
    t0: 28, tPrime: 7, t_temp: 20, h: 60, fc: 30, v_s: 0.5,
    cement_type: 'R', aggregate_type: 'Quartzite', specimen_shape: '2'
  });
  const [results, setResults] = useState([]);
  const [wasmReady, setWasmReady] = useState(false);
  const [feedLogs, setFeedLogs] = useState([{ time: new Date().toLocaleTimeString(), message: 'System initialized. Awaiting input...', type: 'info' }]);
  
  useEffect(() => {
    addLog('Loading Rust B4S Model WASM Module...', 'info');
    initWasm().then((module) => {
      if (module) {
        setWasmReady(true);
        addLog('Kernel v2.4 (B4S-Rust) initialized successfully.', 'success');
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
      [name]: ['cement_type', 'aggregate_type', 'specimen_shape'].includes(name) ? value : parseFloat(value) 
    }));
  };

  const calculateCreep = async () => {
    if (!wasmReady || !wasmModule) {
      addLog('Rust Engine not ready.', 'error');
      return;
    }
    
    addLog(`Initiating B4S calculation with fc=${params.fc}MPa, t0=${params.t0}d`, 'info');
    try {
      const timer = new wasmModule.PerformanceTimer();
      const rustParams = { 
        t0: params.t0, t_prime: params.tPrime, t_temp: params.t_temp, h: params.h,
        fc: params.fc, v_s: params.v_s, cement_type: params.cement_type, 
        aggregate_type: params.aggregate_type, specimen_shape: params.specimen_shape
      };
      
      const rustResults = wasmModule.calculate_b4s_series(rustParams, 10000);
      const elapsed = timer.elapsed();
      
      // format results
      const formattedResults = rustResults.map((result, index) => ({
        t: index + 1,
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
      modelName="B4S Model (RUST)"
      modelDescription="Simplified B4 Model for rapid analysis powered by Rust kernel."
      paramsConfig={PARAMS_CONFIG}
      params={params}
      onParamChange={handleParamChange}
      onCalculate={calculateCreep}
      calculateReady={wasmReady}
      buttonText={wasmReady ? "INITIATE CALCULATION" : "LOADING KERNEL..."}
      phiResult={currentJ} // Display J instead of phi for B4S
      feedLogs={feedLogs}
      concreteClass={`${params.cement_type} TYPE`}
      crossSectionInfo={`${params.aggregate_type}`}
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
