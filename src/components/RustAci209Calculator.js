import React, { useState, useEffect } from 'react';
import CalculatorWrapper from './ui/CalculatorWrapper';

let wasmModule = null;
let wasmInitialized = false;

const WASM_TIMEOUT_MS = 5000;

const initWasm = async () => {
  if (!wasmInitialized) {
    try {
      const wasmPromise = import('../wasm-pkg/creep_calculator_engine.js');
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`WASM load timed out after ${WASM_TIMEOUT_MS}ms`)), WASM_TIMEOUT_MS)
      );
      const wasm = await Promise.race([wasmPromise, timeoutPromise]);
      await wasm.default();
      wasmModule = wasm;
      wasmInitialized = true;
    } catch (error) {
      console.error('❌ Rust WebAssembly 模块加载失败:', error.message);
    }
  }
  return wasmModule;
};

const PARAMS_CONFIG = [
  { name: 't0', label: 'Age at Loading', min: 1, max: 365, unit: 'Days' },
  { name: 'H', label: 'Relative Humidity', min: 0, max: 100, unit: '%' },
  { name: 'VS', label: 'Volume-Surface Ratio', min: 0, max: 1000, unit: 'mm' },
  { name: 'sPhi', label: 'Slump', min: 0, max: 1, unit: '' },
  { name: 'Cc', label: 'Cement Content', min: 0, max: 1000, unit: 'kg/m³' },
  { name: 'alpha', label: 'Creep Parameter α', min: 0, max: 1, unit: '' }
];

export default function RustAci209Calculator() {
  const [params, setParams] = useState({ t0: 28, H: 70, VS: 100, sPhi: 0.5, Cc: 350, alpha: 0.08 });
  const [results, setResults] = useState([]);
  const [wasmReady, setWasmReady] = useState(false);
  const [feedLogs, setFeedLogs] = useState([{ time: new Date().toLocaleTimeString(), message: 'System initialized. Awaiting input...', type: 'info' }]);
  
  useEffect(() => {
    addLog('Loading Rust ACI209 WASM Module...', 'info');
    initWasm().then((module) => {
      if (module) {
        setWasmReady(true);
        addLog('Kernel v2.4 (ACI209-Rust) initialized successfully.', 'success');
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
    setParams(prev => ({ ...prev, [name]: parseFloat(value) }));
  };

  const calculateCreep = async () => {
    if (!wasmReady || !wasmModule) {
      addLog('Rust Engine not ready.', 'error');
      return;
    }
    
    addLog(`Initiating calculation with t0=${params.t0}d, H=${params.H}%`, 'info');
    try {
      const timer = new wasmModule.PerformanceTimer();
      const rustParams = { t0: params.t0, h: params.H, vs: params.VS, s_phi: params.sPhi, cc: params.Cc, alpha: params.alpha };
      
      const rustResults = wasmModule.calculate_aci209_series(rustParams, 10000);
      const elapsed = timer.elapsed();
      setResults(rustResults);
      addLog(`Calculation completed in ${elapsed.toFixed(2)}ms`, 'success');
    } catch (e) {
      addLog('Calculation failed: ' + e.message, 'error');
    }
  };

  return (
    <CalculatorWrapper 
      modelName="ACI 209R (RUST)"
      modelDescription="High-fidelity time-dependent deformation modeling based on ACI 209R-92 standard, powered by standard Rust WASM Kernel."
      paramsConfig={PARAMS_CONFIG}
      params={params}
      onParamChange={handleParamChange}
      onCalculate={calculateCreep}
      calculateReady={wasmReady}
      buttonText={wasmReady ? "INITIATE CALCULATION" : "LOADING KERNEL..."}
      phiResult={results.length > 0 ? results[results.length - 1].phi : NaN}
      feedLogs={feedLogs}
      concreteClass="C35/45 Equivalency"
      crossSectionInfo={`V/S: ${params.VS} mm`}
      chartData={results}
      chartLines={[{ dataKey: "phi", stroke: "#8ff5ff", name: "Creep Coefficient φ" }]}
    />
  );
}
