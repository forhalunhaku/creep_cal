import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

// Rust WebAssembly 模块动态导入
let wasmModule = null;
let wasmInitialized = false;

const initWasm = async () => {
  if (!wasmInitialized) {
    try {
      const wasm = await import('../wasm-pkg/creep_calculator_engine.js');
      await wasm.default();
      wasmModule = wasm;
      wasmInitialized = true;
      console.log('🦀 Rust WebAssembly 模块加载成功');
    } catch (error) {
      console.error('❌ Rust WebAssembly 模块加载失败:', error);
    }
  }
  return wasmModule;
};

function RustB4Calculator() {
  const [params, setParams] = useState({
    t0: 28,
    tPrime: 7,
    T: 20,
    h: 60,
    fc: 30,
    vS: 0.5,
    c: 350,
    wC: 0.5,
    aC: 4,
    cementType: 'R',
    aggregateType: '石英岩',
    specimenShape: '无限圆柱体'
  });
  const [results, setResults] = useState([]);
  const [isCalculated, setIsCalculated] = useState(false);
  const [batchResults, setBatchResults] = useState([]);
  const [batchHeaders, setBatchHeaders] = useState([]);
  const [wasmReady, setWasmReady] = useState(false);
  const [performanceData, setPerformanceData] = useState(null);

  useEffect(() => {
    initWasm().then((module) => {
      if (module) {
        setWasmReady(true);
      }
    });
  }, []);

  // JavaScript 版本的 B4 计算（用于对比）- 完全按照原始批量计算逻辑
  const calculateB4JS = (params, t, debug = false) => {
    // 水泥参数
    const cementParams = {
      R: { τcem: 0.016, εcem: 360e-6, τaucem: 1, εaucem: 210e-6, p1: 0.70, p2: 58.6e-3, p3: 39.3e-3, p4: 3.4e-3, p5: 777e-6, p5H: 8.00, p2w: 3.00, p3a: -1.10, p3w: 0.40, p4a: -0.90, p4w: 2.45, p5a: -1, p5w: 0.78, p5_epsilon: -0.85, r_epsilon_a: -0.75, r_epsilon_w: -3.5, r_tau_w: 3, r_alpha: 1, r_t: -4.5, p_tau_a: -0.33, p_tau_w: -0.06, p_tau_c: -0.1, p_epsilon_a: -0.8, p_epsilon_w: 1.1, p_epsilon_c: 0.11 },
      RS: { τcem: 0.08, εcem: 860e-6, τaucem: 41, εaucem: -84.0e-6, p1: 0.60, p2: 17.4e-3, p3: 39.3e-3, p4: 3.4e-3, p5: 94.6e-6, p5H: 1.00, p2w: 3.00, p3a: -1.10, p3w: 0.40, p4a: -0.90, p4w: 2.45, p5a: -1, p5w: 0.78, p5_epsilon: -0.85, r_epsilon_a: -0.75, r_epsilon_w: -3.5, r_tau_w: 3, r_alpha: 1.4, r_t: -4.5, p_tau_a: -0.33, p_tau_w: -2.4, p_tau_c: -2.7, p_epsilon_a: -0.8, p_epsilon_w: -0.27, p_epsilon_c: 0.11 },
      SL: { τcem: 0.01, εcem: 410e-6, τaucem: 1, εaucem: 0.00e-6, p1: 0.8, p2: 40.5e-3, p3: 39.3e-3, p4: 3.4e-3, p5: 496e-6, p5H: 8.00, p2w: 3.00, p3a: -1.10, p3w: 0.40, p4a: -0.90, p4w: 2.45, p5a: -1, p5w: 0.78, p5_epsilon: -0.85, r_epsilon_a: -0.75, r_epsilon_w: -3.5, r_tau_w: 3, r_alpha: 1, r_t: -4.5, p_tau_a: -0.33, p_tau_w: 3.55, p_tau_c: 3.8, p_epsilon_a: -0.8, p_epsilon_w: 1, p_epsilon_c: 0.11 }
    };
    
    // 骨料参数
    const aggregateParams = {
      '辉绿岩': { ksτa: 0.06, ksεa: 0.76 },
      'Dolerite': { ksτa: 0.06, ksεa: 0.76 },
      '石英岩': { ksτa: 0.59, ksεa: 0.71 },
      'Quartz': { ksτa: 0.59, ksεa: 0.71 },
      '石灰岩': { ksτa: 1.80, ksεa: 0.95 },
      'Limestone': { ksτa: 1.80, ksεa: 0.95 },
      '砂岩': { ksτa: 2.30, ksεa: 1.60 },
      'Sandstone': { ksτa: 2.30, ksεa: 1.60 },
      '花岗岩': { ksτa: 4.00, ksεa: 1.05 },
      'Granite': { ksτa: 4.00, ksεa: 1.05 },
      '石英闪长岩': { ksτa: 15.0, ksεa: 2.20 },
      'Quartz Diorite': { ksτa: 15.0, ksεa: 2.20 },
      '无信息': { ksτa: 1.00, ksεa: 1.00 },
      'No Information': { ksτa: 1.00, ksεa: 1.00 }
    };
    
    // 形状参数
    const shapeParams = {
      '无限平板': { ks: 1.00 },
      'infinite slab': { ks: 1.00 },
      '无限圆柱体': { ks: 1.15 },
      'infinite cylinder': { ks: 1.15 },
      '无限方柱体': { ks: 1.25 },
      'infinite square prism': { ks: 1.25 },
      '球体': { ks: 1.30 },
      'sphere': { ks: 1.30 },
      '立方体': { ks: 1.55 },
      'cube': { ks: 1.55 }
    };

    const { t0, tPrime, T, h, fc, vS, c, wC, aC, cementType, aggregateType, specimenShape } = params;

    // 按照原始批量计算逻辑处理时间
    const hDecimal = parseFloat(h) / 100;
    const tVal = parseFloat(t);
    const tPrimeVal = parseFloat(tPrime);
    const tCreep = tVal - tPrimeVal;

    if (isNaN(tCreep) || tCreep <= 0) {
      return { J: NaN, epsilonSH: NaN, epsilonAU: NaN };
    }

    const tCalc = tPrimeVal + tCreep;
    
    const cement = cementParams[cementType] || cementParams['R'];
    const aggregate = aggregateParams[aggregateType] || aggregateParams['石英岩'];
    const shape = shapeParams[specimenShape] || shapeParams['无限圆柱体'];

    if (debug) {
      console.log('B4 参数映射:', {
        cementType, cement: !!cement,
        aggregateType, aggregate: !!aggregate,
        specimenShape, shape: !!shape
      });
    }
    
    // 使用原始批量计算的参数处理方式
    const paramsRow = {
      t0: parseFloat(t0),
      tPrime: parseFloat(tPrime),
      T: parseFloat(T),
      h: parseFloat(h),
      fc: parseFloat(fc),
      vS: parseFloat(vS),
      c: parseFloat(c),
      wC: parseFloat(wC),
      aC: parseFloat(aC),
      cementType: cementType,
      aggregateType: aggregateType,
      specimenShape: specimenShape
    };

    const D = 2 * paramsRow.vS;
    const E28 = (4734 * Math.sqrt(paramsRow.fc)) / 1000;
    const betaTh = Math.exp(4000 * (1/293 - 1/(paramsRow.T + 273)));
    const betaTs = betaTh;
    const betaTc = betaTh;
    const t0Tilde = paramsRow.t0 * betaTh;
    const tPrimeHat = paramsRow.t0 * betaTh + (paramsRow.tPrime - paramsRow.t0) * betaTs;
    
    const tau0 = cement.τcem * Math.pow(paramsRow.aC/6, cement.p_tau_a) * Math.pow(paramsRow.wC/0.38, cement.p_tau_w) * Math.pow((6.5 * paramsRow.c)/2350, cement.p_tau_c);
    const tauSH = tau0 * aggregate.ksτa * Math.pow(shape.ks * D, 2);
    const epsilon0 = cement.εcem * Math.pow(paramsRow.aC/6, cement.p_epsilon_a) * Math.pow(paramsRow.wC/0.38, cement.p_epsilon_w) * Math.pow((6.5 * paramsRow.c)/2350, cement.p_epsilon_c);
    const E1 = E28 * Math.sqrt((7 * betaTh + 600 * betaTs) / (4 + (6/7)*(7 * betaTh + 600 * betaTs)));
    const E2 = E28 * Math.sqrt((t0Tilde + tauSH * betaTs) / (4 + (6/7)*(t0Tilde + tauSH * betaTs)));
    const epsilonSHInf = -epsilon0 * aggregate.ksεa * (E1 / E2);
    const kh = hDecimal <= 0.98 ? 1 - Math.pow(hDecimal, 3) : 12.94 * (1 - hDecimal) - 0.2;
    
    const tTilde = (tCalc - paramsRow.t0) * betaTs;
    const tHat = tPrimeHat + (tCalc - paramsRow.tPrime) * betaTc;
    const S = Math.tanh(Math.sqrt(tTilde / tauSH));
    const epsilonSH = epsilonSHInf * kh * S;
    
    const q1 = cement.p1 / (E28 * 1000);
    const q2 = (cement.p2 * Math.pow(paramsRow.wC/0.38, cement.p2w)) / 1000;
    const q3 = cement.p3 * q2 * Math.pow(paramsRow.aC/6, cement.p3a) * Math.pow(paramsRow.wC/0.38, cement.p3w);
    const q4 = (cement.p4 * Math.pow(paramsRow.aC/6, cement.p4a) * Math.pow(paramsRow.wC/0.38, cement.p4w)) / 1000;
    const rHat = 1.7 * Math.pow(tPrimeHat, 0.12) + 8;
    const Z = Math.pow(tPrimeHat, -0.5) * Math.log(1 + Math.pow(tHat - tPrimeHat, 0.1));
    const Qf = 1 / (0.086 * Math.pow(tPrimeHat, 2/9) + 1.21 * Math.pow(tPrimeHat, 4/9));
    const Q = Qf * Math.pow(1 + Math.pow(Qf / Z, rHat), -1/rHat);
    const C0 = q2 * Q + q3 * Math.log(1 + Math.pow(tHat - tPrimeHat, 0.1)) + q4 * Math.log(tHat / tPrimeHat);
    const RT = Math.exp(4000 * (1/293 - 1/(paramsRow.T + 273)));
    const q5 = (cement.p5 * Math.pow(paramsRow.aC/6, cement.p5a) * Math.pow(paramsRow.wC/0.38, cement.p5w) * Math.pow(Math.abs(kh * epsilonSHInf), cement.p5_epsilon)) / 1000;
    const H = 1 - (1 - hDecimal) * Math.tanh(Math.sqrt((tHat - t0Tilde) / tauSH));
    const t0Prime = Math.max(tPrimeHat, t0Tilde);
    const Hc = 1 - (1 - hDecimal) * Math.tanh(Math.sqrt((t0Prime - t0Tilde) / tauSH));
    const Cd = tHat >= t0Prime ? q5 * Math.sqrt(Math.exp(-cement.p5H * H) - Math.exp(-cement.p5H * Hc)) : 0;
    const J = q1 + RT * C0 + Cd;
    
    const epsilonAUInfinity = -cement.εaucem * Math.pow(paramsRow.aC/6, cement.r_epsilon_a) * Math.pow(paramsRow.wC/0.38, cement.r_epsilon_w);
    const tauAU = cement.τaucem * Math.pow(paramsRow.wC/0.38, cement.r_tau_w);
    const alpha = cement.r_alpha * (paramsRow.wC/0.38);
    const epsilonAU = epsilonAUInfinity * Math.pow(1 + Math.pow(tauAU / (tTilde + t0Tilde), alpha), cement.r_t);
    
    if (debug) {
      console.log('B4 JavaScript 计算详情:', {
        输入参数: params,
        原始时间: t,
        计算时间: tCalc,
        相对时间: tCreep,
        基本参数: { D, E28, betaTh, t0Tilde, tPrimeHat },
        材料参数: { tau0, tauSH, epsilon0, epsilonSHInf, kh },
        徐变参数: { q1, q2, q3, q4, q5, C0, RT, Cd },
        最终结果: { J, epsilonSH, epsilonAU }
      });
    }
    
    return { J, epsilonSH, epsilonAU };
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
      alert('Rust 计算引擎未就绪，请刷新页面重试');
      return;
    }

    if (!params.t0 || !params.fc) {
      alert('加载龄期t0和混凝土强度fc为必填项');
      return;
    }

    try {
      const timer = new wasmModule.PerformanceTimer();
      
      const rustParams = {
        t0: params.t0,
        t_prime: params.tPrime,
        t_temp: params.T,
        h: params.h,
        fc: params.fc,
        v_s: params.vS,
        c: params.c,
        w_c: params.wC,
        a_c: params.aC,
        cement_type: params.cementType,
        aggregate_type: params.aggregateType,
        specimen_shape: params.specimenShape
      };

      const rustResults = wasmModule.calculate_b4_series(rustParams, 10000);
      const elapsed = timer.elapsed();
      
      setResults(rustResults);
      setIsCalculated(true);
      setPerformanceData({
        rustTime: elapsed,
        dataPoints: rustResults.length
      });

      console.log(`🚀 B4 Rust 计算完成，耗时: ${elapsed.toFixed(2)}ms`);
    } catch (error) {
      console.error('B4 Rust 计算错误:', error);
      alert('计算失败: ' + error.message);
    }
  };

  const handleBatchFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileName = file.name.toLowerCase();
    if (fileName.endsWith('.csv')) {
      Papa.parse(file, {
        header: true,
        complete: (results) => {
          processBatchData(results.data);
        },
        skipEmptyLines: true
      });
    } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const data = new Uint8Array(evt.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
        processBatchData(jsonData);
      };
      reader.readAsArrayBuffer(file);
    } else {
      alert('仅支持Excel(.xlsx/.xls)或CSV文件');
    }
  };

  const processBatchData = async (data) => {
    if (!data || data.length === 0) {
      alert('文件无有效数据');
      return;
    }

    if (!wasmReady || !wasmModule) {
      alert('Rust 计算引擎未就绪');
      return;
    }

    console.log('B4 原始数据:', data);
    setBatchHeaders(Object.keys(data[0]));

    try {
      const timer = new wasmModule.PerformanceTimer();

      // 数据映射
      const mappedData = data.map((row, index) => {
        if (!row || typeof row !== 'object') {
          console.warn(`第 ${index + 1} 行数据无效:`, row);
          return null;
        }

        const t0Value = row.t0 || row["加载龄期"];
        const fcValue = row.fc || row["混凝土强度"];
        const tValue = row.t || row["时间"];
        const tPrimeValue = row.tPrime || row["加载时间"];

        if (!t0Value || !fcValue || !tValue || !tPrimeValue) {
          console.warn(`第 ${index + 1} 行缺少必要字段:`, {
            t0: t0Value, fc: fcValue, t: tValue, tPrime: tPrimeValue
          });
          return null;
        }

        const mappedItem = {
          t0: parseFloat(t0Value) || 28,
          tPrime: parseFloat(tPrimeValue) || 7,
          T: parseFloat(row.T || row["温度"] || 20),
          h: parseFloat(row.h || row["湿度"] || 60),
          fc: parseFloat(fcValue) || 30,
          vS: parseFloat(row.vS || row["体积表面积比"] || 0.5),
          c: parseFloat(row.c || row["水泥用量"] || 350),
          wC: parseFloat(row.wC || row["水胶比"] || 0.5),
          aC: parseFloat(row.aC || row["骨料水泥比"] || 4),
          cementType: row.cementType || row["水泥类型"] || 'R',
          aggregateType: row.aggregateType || row["骨料类型"] || '石英岩',
          specimenShape: row.specimenShape || row["试件形状"] || '无限圆柱体',
          t: parseFloat(tValue) || 365
        };

        // 确保 t > tPrime，这是 B4 模型的基本要求
        if (mappedItem.t <= mappedItem.tPrime) {
          console.warn(`第 ${index + 1} 行: t (${mappedItem.t}) <= tPrime (${mappedItem.tPrime})，调整 t 为 tPrime + 1`);
          mappedItem.t = mappedItem.tPrime + 1;
        }

        console.log(`第 ${index + 1} 行映射结果:`, mappedItem);
        return mappedItem;
      }).filter(row => row !== null);

      console.log('B4 映射后的数据:', mappedData);

      if (mappedData.length === 0) {
        alert('没有有效的数据行，请检查数据格式');
        return;
      }

      // 对比计算
      const results = mappedData.map((item, index) => {
        try {
          console.log(`处理第 ${index + 1} 行数据:`, item);

          // 验证必要参数
          if (!item.t0 || !item.fc || !item.t || item.t <= item.tPrime) {
            console.warn(`第 ${index + 1} 行参数无效:`, {
              t0: item.t0,
              fc: item.fc,
              t: item.t,
              tPrime: item.tPrime,
              condition: item.t <= item.tPrime
            });
            return {
              j: NaN, j_js: NaN, epsilon_sh: NaN, epsilon_sh_js: NaN,
              epsilon_au: NaN, epsilon_au_js: NaN,
              j_difference: NaN, j_relative_error: NaN,
              original: data[index]
            };
          }

          // JavaScript 计算（仅用于内部验证）
          const jsResult = calculateB4JS(item, item.t, false);

          // Rust 计算
          const rustParams = {
            t0: item.t0,
            t_prime: item.tPrime,
            t_temp: item.T,
            h: item.h,
            fc: item.fc,
            v_s: item.vS,
            c: item.c,
            w_c: item.wC,
            a_c: item.aC,
            cement_type: item.cementType,
            aggregate_type: item.aggregateType,
            specimen_shape: item.specimenShape
          };

          const rustResult = wasmModule.calculate_b4_single(rustParams, item.t);

          // 内部验证（不显示给用户）
          const jsDiff = Math.abs(jsResult.J - rustResult.j);
          const jsRelError = jsDiff / jsResult.J * 100;

          if (jsRelError > 1.0) {
            console.warn(`B4 第 ${index + 1} 行计算结果差异较大: ${jsRelError.toFixed(2)}%`);
          }

          return {
            j: rustResult.j,
            epsilon_sh: rustResult.epsilon_sh,
            epsilon_au: rustResult.epsilon_au,
            original: data[index]
          };
        } catch (error) {
          console.error(`B4 第 ${index + 1} 行计算失败:`, error);
          return {
            j: NaN, epsilon_sh: NaN, epsilon_au: NaN,
            original: data[index]
          };
        }
      });

      const elapsed = timer.elapsed();
      setBatchResults(results);

      console.log(`🚀 B4 Rust 批量计算完成，处理 ${mappedData.length} 条数据，耗时: ${elapsed.toFixed(2)}ms`);

      setPerformanceData(prev => ({
        ...prev,
        batchTime: elapsed,
        batchSize: mappedData.length
      }));
    } catch (error) {
      console.error('B4 批量计算错误:', error);
      alert('批量计算失败: ' + error.message);
    }
  };

  const exportToCSV = () => {
    if (results.length === 0) return;

    const csvContent = [
      ['时间(t-tPrime)', '徐变函数J', '收缩应变', '自生收缩应变'],
      ...results.map(r => [r.t, r.j.toFixed(6), r.epsilon_sh.toFixed(6), r.epsilon_au.toFixed(6)])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'b4_rust_results.csv';
    link.click();
  };

  const exportBatchToCSV = () => {
    if (batchResults.length === 0) return;

    const headers = [...batchHeaders, '徐变函数J', '收缩应变εSH', '自生收缩εAU'];
    const csvContent = [
      headers,
      ...batchResults.map(row => [
        ...batchHeaders.map(h => row.original[h] || ''),
        isNaN(row.j) ? 'N/A' : row.j.toFixed(6),
        isNaN(row.epsilon_sh) ? 'N/A' : row.epsilon_sh.toExponential(4),
        isNaN(row.epsilon_au) ? 'N/A' : row.epsilon_au.toExponential(4)
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'b4_batch_results.csv';
    link.click();
  };

  return (
    <div>
      <h2 style={{textAlign: 'center', margin: '32px 0 18px 0'}}>B4 徐变模型 (🦀 Rust 高性能版)</h2>
      <div className="main-card">
        <div className="status-bar">
          <span className={`status-indicator ${wasmReady ? 'ready' : 'loading'}`}>
            🦀 Rust引擎: {wasmReady ? '已就绪' : '加载中...'}
          </span>
          {performanceData && (
            <span className="performance-info">
              ⚡ 性能: {performanceData.rustTime?.toFixed(2)}ms
            </span>
          )}
        </div>

        <h3 className="section-title">参数输入</h3>
        <div className="param-grid">
          <div className="param-item">
            <label>加载龄期 t₀ (天) *:</label>
            <input
              type="number"
              name="t0"
              value={params.t0}
              onChange={handleParamChange}
              min="1"
              max="365"
              required
            />
          </div>
          <div className="param-item">
            <label>加载时间 t' (天):</label>
            <input
              type="number"
              name="tPrime"
              value={params.tPrime}
              onChange={handleParamChange}
              min="1"
              max="365"
              required
            />
          </div>
          <div className="param-item">
            <label>温度 T (°C):</label>
            <input
              type="number"
              name="T"
              value={params.T}
              onChange={handleParamChange}
              min="-20"
              max="60"
              required
            />
          </div>
          <div className="param-item">
            <label>相对湿度 h (%):</label>
            <input
              type="number"
              name="h"
              value={params.h}
              onChange={handleParamChange}
              min="0"
              max="100"
              required
            />
          </div>
          <div className="param-item">
            <label>混凝土强度 fc (MPa) *:</label>
            <input
              type="number"
              name="fc"
              value={params.fc}
              onChange={handleParamChange}
              min="10"
              max="100"
              required
            />
          </div>
          <div className="param-item">
            <label>体积表面积比 V/S:</label>
            <input
              type="number"
              name="vS"
              value={params.vS}
              onChange={handleParamChange}
              min="0.1"
              max="10"
              step="0.1"
              required
            />
          </div>
          <div className="param-item">
            <label>水泥用量 c (kg/m³):</label>
            <input
              type="number"
              name="c"
              value={params.c}
              onChange={handleParamChange}
              min="200"
              max="600"
              required
            />
          </div>
          <div className="param-item">
            <label>水胶比 w/c:</label>
            <input
              type="number"
              name="wC"
              value={params.wC}
              onChange={handleParamChange}
              min="0.2"
              max="0.8"
              step="0.01"
              required
            />
          </div>
          <div className="param-item">
            <label>骨料水泥比 a/c:</label>
            <input
              type="number"
              name="aC"
              value={params.aC}
              onChange={handleParamChange}
              min="1"
              max="10"
              step="0.1"
              required
            />
          </div>
          <div className="param-item">
            <label>水泥类型:</label>
            <select
              name="cementType"
              value={params.cementType}
              onChange={handleParamChange}
              required
            >
              <option value="R">R (普通硅酸盐水泥)</option>
              <option value="RS">RS (快硬硅酸盐水泥)</option>
              <option value="SL">SL (矿渣硅酸盐水泥)</option>
            </select>
          </div>
          <div className="param-item">
            <label>骨料类型:</label>
            <select
              name="aggregateType"
              value={params.aggregateType}
              onChange={handleParamChange}
              required
            >
              <option value="辉绿岩">辉绿岩</option>
              <option value="石英岩">石英岩</option>
              <option value="石灰岩">石灰岩</option>
              <option value="砂岩">砂岩</option>
              <option value="花岗岩">花岗岩</option>
              <option value="石英闪长岩">石英闪长岩</option>
              <option value="无信息">无信息</option>
            </select>
          </div>
          <div className="param-item">
            <label>试件形状:</label>
            <select
              name="specimenShape"
              value={params.specimenShape}
              onChange={handleParamChange}
              required
            >
              <option value="无限平板">无限平板</option>
              <option value="无限圆柱体">无限圆柱体</option>
              <option value="无限方柱体">无限方柱体</option>
              <option value="球体">球体</option>
              <option value="立方体">立方体</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <button
            onClick={calculateCreep}
            className="calculate-btn"
            style={{ flex: 1, minWidth: '200px' }}
            disabled={!wasmReady}
          >
            {wasmReady ? '🚀 Rust 高速计算' : '⏳ 等待引擎加载...'}
          </button>
          {isCalculated && (
            <button
              onClick={exportToCSV}
              className="calculate-btn"
              style={{ flex: 1, minWidth: '200px', background: 'var(--color-btn-success)' }}
            >
              导出CSV结果
            </button>
          )}
        </div>

        <hr className="divider" />
        <h3 className="section-title">单点计算结果</h3>

        {/* 图表显示 */}
        {isCalculated && results.length > 0 && (
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={400}>
                <LineChart data={results.slice(0, 1000)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="t" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="j" stroke="#8884d8" strokeWidth={2} dot={false} name="徐变函数J" />
                  <Line type="monotone" dataKey="epsilon_sh" stroke="#82ca9d" strokeWidth={2} dot={false} name="收缩应变" />
                  <Line type="monotone" dataKey="epsilon_au" stroke="#ffc658" strokeWidth={2} dot={false} name="自生收缩" />
                </LineChart>
              </ResponsiveContainer>
              {results.length > 1000 && (
                <div style={{
                  textAlign: 'center',
                  fontSize: '0.9rem',
                  color: '#666',
                  marginTop: '8px',
                  fontStyle: 'italic'
                }}>
                  📊 图表显示前1000个数据点，完整数据可通过CSV导出查看
                </div>
              )}
          </div>
        )}

        {!isCalculated && (
          <div style={{ color: '#888', marginBottom: 12 }}>请先输入参数并点击"🚀 Rust 高速计算"</div>
        )}

        {/* 批量计算部分 */}
        <hr className="divider" />
        <h3 className="section-title" style={{ marginTop: 40 }}>批量导入/批量计算 (Rust 加速)</h3>
        <input
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={handleBatchFile}
          style={{ marginBottom: 16 }}
          disabled={!wasmReady}
        />

        {batchResults.length > 0 && (
          <button
            onClick={exportBatchToCSV}
            className="calculate-btn"
            style={{ marginLeft: 16, background: '#43a047' }}
          >
            导出批量结果
          </button>
        )}

        {batchResults.length > 0 && (
          <div style={{ marginTop: 24, overflowX: 'auto' }}>
            <table className="batch-table">
              <thead>
                <tr>
                  {batchHeaders.map(h => <th key={h}>{h}</th>)}
                  <th>徐变函数J</th>
                  <th>收缩应变εSH</th>
                  <th>自生收缩εAU</th>
                </tr>
              </thead>
              <tbody>
                {batchResults.slice(0, 100).map((row, idx) => (
                  <tr key={idx}>
                    {batchHeaders.map(h => <td key={h}>{row.original[h]}</td>)}
                    <td>{isNaN(row.j) ? 'N/A' : row.j.toFixed(6)}</td>
                    <td>{isNaN(row.epsilon_sh) ? 'N/A' : row.epsilon_sh.toExponential(4)}</td>
                    <td>{isNaN(row.epsilon_au) ? 'N/A' : row.epsilon_au.toExponential(4)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {batchResults.length > 100 && (
              <p style={{ textAlign: 'center', color: '#666', marginTop: 16 }}>
                显示前100条结果，共{batchResults.length}条
              </p>
            )}

            <div style={{
              marginTop: 16,
              padding: 16,
              backgroundColor: '#f5f5f5',
              borderRadius: 8,
              fontSize: '14px'
            }}>
              <h4 style={{ margin: '0 0 8px 0', color: '#1976d2' }}>📊 B4 批量计算结果</h4>
              <div style={{
                padding: '8px 12px',
                backgroundColor: '#e8f5e8',
                borderLeft: '4px solid #4caf50',
                marginBottom: '12px',
                borderRadius: '4px'
              }}>
                <strong>🚀 高性能计算</strong>: 使用 Rust 引擎进行 B4 徐变模型批量计算<br/>
                <small>B4 是最复杂最精确的徐变模型，适用于高精度工程计算。</small>
              </div>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                <li><strong>J</strong>: 徐变函数（柔度），单位：1/MPa</li>
                <li><strong>εSH</strong>: 收缩应变，无量纲</li>
                <li><strong>εAU</strong>: 自生收缩应变，无量纲</li>
                <li style={{ color: '#1976d2' }}>💡 支持导出为 CSV 格式进行进一步分析</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default RustB4Calculator;
