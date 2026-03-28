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
  { name: 'fcm', label: 'Concrete Strength', min: 10, max: 100, unit: 'MPa' },
  { name: 'RH', label: 'Relative Humidity', min: 0, max: 100, unit: '%' },
  { name: 't0', label: 'Age at Loading', min: 1, max: 365, unit: 'Days' },
  { name: 'Ac', label: 'Cross Section Area', min: 100, max: 100000, unit: 'mm²' },
  { name: 'u', label: 'Perimeter', min: 50, max: 10000, unit: 'mm' },
  { name: 'T', label: 'Temperature', min: -20, max: 60, unit: '°C' },
  { 
    name: 'Cs', 
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

export default function RustMc2010Calculator() {
  const [params, setParams] = useState({ fcm: 40, RH: 70, t0: 28, Ac: 1000, u: 400, T: 20, Cs: '42.5R' });
  const [results, setResults] = useState([]);
  const [wasmReady, setWasmReady] = useState(false);
  const [feedLogs, setFeedLogs] = useState([{ time: new Date().toLocaleTimeString(), message: 'System initialized. Awaiting input...', type: 'info' }]);
  
  useEffect(() => {
    addLog('Loading Rust fib MC 2010 WASM Module...', 'info');
    initWasm().then((module) => {
      if (module) {
        setWasmReady(true);
        addLog('Kernel v2.4 (MC2010-Rust) initialized successfully.', 'success');
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
    setParams(prev => ({ ...prev, [name]: name === 'Cs' ? value : parseFloat(value) }));
  };

  const calculateCreep = async () => {
    if (!wasmReady || !wasmModule) {
      addLog('Rust Engine not ready.', 'error');
      return;
    }
    
    addLog(`Initiating calculation with fcm=${params.fcm}MPa, t0=${params.t0}d`, 'info');
    try {
      const timer = new wasmModule.PerformanceTimer();
      const rustParams = { 
        fcm: params.fcm, rh: params.RH, t0: params.t0, 
        ac: params.Ac, u: params.u, t: params.T, cement_type: params.Cs 
      };
      
      const rustResults = wasmModule.calculate_mc2010_series(rustParams, 10000);
      const elapsed = timer.elapsed();
      setResults(rustResults);
      addLog(`Calculation completed in ${elapsed.toFixed(2)}ms`, 'success');
    } catch (e) {
      addLog('Calculation failed: ' + e.message, 'error');
    }
  };

  const currentHEff = (2 * params.Ac / params.u).toFixed(0);

  return (
    <CalculatorWrapper 
      modelName="fib MC 2010 (RUST)"
      modelDescription="High-fidelity time-dependent deformation modeling based on European Concrete standard, powered by standard Rust WASM Kernel."
      paramsConfig={PARAMS_CONFIG}
      params={params}
      onParamChange={handleParamChange}
      onCalculate={calculateCreep}
      calculateReady={wasmReady}
      buttonText={wasmReady ? "INITIATE CALCULATION" : "LOADING KERNEL..."}
      phiResult={results.length > 0 ? results[results.length - 1].phi : NaN}
      feedLogs={feedLogs}
      concreteClass={`fcm: ${params.fcm} MPa`}
      crossSectionInfo={`h_e: ${currentHEff} mm`}
      chartData={results}
      chartLines={[{ dataKey: "phi", stroke: "#e7c5ff", name: "Creep Coefficient φ" }]}
    />
  );
}
