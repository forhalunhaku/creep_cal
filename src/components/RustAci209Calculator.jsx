import React, { useState, useEffect } from 'react';
import CalculatorWrapper from './ui/CalculatorWrapper';
import { appendFeedLog, loadCreepEngine } from '../wasm/creepEngine';

const PARAMS_CONFIG = [
  { name: 't0', label: 'Age at Loading', min: 1, max: 365, unit: 'Days' },
  { name: 'H', label: 'Relative Humidity', min: 0, max: 100, unit: '%' },
  { name: 'VS', label: 'Volume-Surface Ratio', min: 0, max: 1000, unit: 'mm' },
  { name: 'sPhi', label: 'Sand Ratio', min: 0, max: 1, unit: '' },
  { name: 'Cc', label: 'Cement Content', min: 0, max: 1000, unit: 'kg/m³' },
  { name: 'alpha', label: 'Air Content', min: 0, max: 1, unit: '' }
];

export default function RustAci209Calculator() {
  const [params, setParams] = useState({ t0: 28, H: 70, VS: 100, sPhi: 0.5, Cc: 350, alpha: 0.08 });
  const [results, setResults] = useState([]);
  const [wasmReady, setWasmReady] = useState(false);
  const [wasmModule, setWasmModule] = useState(null);
  const [feedLogs, setFeedLogs] = useState([{ time: new Date().toLocaleTimeString(), message: 'System initialized. Awaiting input...', type: 'info' }]);
  
  useEffect(() => {
    let cancelled = false;
    addLog('Loading Rust ACI209 WASM Module...', 'info');
    loadCreepEngine().then((module) => {
      if (cancelled) return;
      if (module) {
        setWasmModule(module);
        setWasmReady(true);
        addLog('Kernel v2.4 (ACI209-Rust) initialized successfully.', 'success');
      } else {
        addLog('WASM initialization failed', 'error');
      }
    }).catch((error) => {
      if (!cancelled) addLog(`WASM initialization failed: ${error.message}`, 'error');
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const addLog = (msg, type='info') => {
    appendFeedLog(setFeedLogs, msg, type);
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
      modelDescription="ACI 209R-92 creep coefficient calculation using the Rust WASM kernel for the 10000-day time series."
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
      chartLines={[{ dataKey: "phi", stroke: "#0071e3", name: "Creep Coefficient φ" }]}
    />
  );
}
