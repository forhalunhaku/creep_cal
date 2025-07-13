import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

function RustB4sCalculator() {
  const [wasmModule, setWasmModule] = useState(null);
  const [wasmReady, setWasmReady] = useState(false);
  const [params, setParams] = useState({
    t0: '',
    tPrime: 7,
    t_temp: 20,
    h: 60,
    fc: '',
    v_s: 0.5,
    cement_type: 'R',
    aggregate_type: 'Quartzite',
    specimen_shape: '2'
  });
  const [results, setResults] = useState([]);
  const [isCalculated, setIsCalculated] = useState(false);
  const [batchResults, setBatchResults] = useState([]);
  const [batchHeaders, setBatchHeaders] = useState([]);
  const [performanceData, setPerformanceData] = useState(null);

  // 加载 WebAssembly 模块
  useEffect(() => {
    const loadWasm = async () => {
      try {
        const wasmModule = await import('../wasm-pkg/creep_calculator_engine.js');
        await wasmModule.default();
        setWasmModule(wasmModule);
        setWasmReady(true);
        console.log('B4S Rust WebAssembly 模块加载成功');
      } catch (error) {
        console.error('B4S WebAssembly 模块加载失败:', error);
      }
    };
    loadWasm();
  }, []);

  // JavaScript 版本的 B4S 计算（用于对比）
  const calculateB4sJS = (params, t, debug = false) => {
    // B4S 水泥参数
    const cementParams = {
      'R': { tau_au_cem: 2.26, r_tau_f: 0.27, epsilon_au_cem: 78.2e-6, r_epsilon_f: 1.03, tau_s_cem: 0.027, s_tau_f: 0.21, epsilon_s_cem: 590e-6, s_epsilon_f: -0.51, p1: 0.70, p5_epsilon: -0.85, p5H: 8, s2: 14.2e-3, s3: 0.976, s4: 4.00e-3, s5: 1.54e-3, s2f: -1.58, s3f: -1.61, s4f: -1.16, s5f: -0.45 },
      'RS': { tau_au_cem: 2.26, r_tau_f: 0.27, epsilon_au_cem: 78.2e-6, r_epsilon_f: 1.03, tau_s_cem: 0.027, s_tau_f: 1.55, epsilon_s_cem: 830e-6, s_epsilon_f: -0.84, p1: 0.60, p5_epsilon: -0.85, p5H: 1, s2: 29.9e-3, s3: 0.976, s4: 4.00e-3, s5: 41.8e-3, s2f: -1.58, s3f: -1.61, s4f: -1.16, s5f: -0.45 },
      'SL': { tau_au_cem: 2.26, r_tau_f: 0.27, epsilon_au_cem: 78.2e-6, r_epsilon_f: 1.03, tau_s_cem: 0.032, s_tau_f: -1.84, epsilon_s_cem: 640e-6, s_epsilon_f: -0.69, p1: 0.80, p5_epsilon: -0.85, p5H: 8, s2: 11.2e-3, s3: 0.976, s4: 4.00e-3, s5: 150e-3, s2f: -1.58, s3f: -1.61, s4f: -1.16, s5f: -0.45 }
    };

    // B4S 骨料参数
    const aggregateParams = {
      'Diabase': { ks_tau_a: 0.06, ks_epsilon_a: 0.76 },
      'Quartzite': { ks_tau_a: 0.59, ks_epsilon_a: 0.71 },
      'Limestone': { ks_tau_a: 1.80, ks_epsilon_a: 0.95 },
      'Sandstone': { ks_tau_a: 2.30, ks_epsilon_a: 1.60 },
      'Granite': { ks_tau_a: 4.00, ks_epsilon_a: 1.05 },
      'Quartz Diorite': { ks_tau_a: 15.0, ks_epsilon_a: 2.20 },
      'No Information': { ks_tau_a: 1.00, ks_epsilon_a: 1.00 }
    };

    // B4S 形状参数
    const shapeParams = {
      '1': { ks: 1.00 },
      '2': { ks: 1.15 },
      '3': { ks: 1.25 },
      '4': { ks: 1.30 },
      '5': { ks: 1.55 },
      // 兼容英文名称
      'infinite slab': { ks: 1.00 },
      'infinite cylinder': { ks: 1.15 },
      'infinite square prism': { ks: 1.25 },
      'sphere': { ks: 1.30 },
      'cube': { ks: 1.55 }
    };

    const { t0, tPrime, t_temp, h, fc, v_s, cement_type, aggregate_type, specimen_shape } = params;
    
    // 按照原始批量计算逻辑处理时间
    // const hDecimal = parseFloat(h) / 100; // 未使用，已注释
    const tVal = parseFloat(t);
    const tPrimeVal = parseFloat(tPrime);
    
    if (isNaN(tVal) || tVal <= tPrimeVal) {
      return { J: NaN, epsilonSH: NaN, epsilonAU: NaN };
    }
    
    const cement = cementParams[cement_type] || cementParams['R'];
    const aggregate = aggregateParams[aggregate_type] || aggregateParams['Quartzite'];
    const shape = shapeParams[specimen_shape] || shapeParams['2'];
    
    if (debug) {
      console.log('B4S 参数映射:', {
        cement_type, cement: !!cement,
        aggregate_type, aggregate: !!aggregate,
        specimen_shape, shape: !!shape
      });
    }

    // 基本参数计算
    const E28 = (4734 * Math.sqrt(fc)) / 1000;
    const betaTh = Math.exp(4000 * (1/293 - 1/(t_temp + 273)));
    const betaTs = betaTh;
    const betaTc = betaTh;
    const t0Tilde = t0 * betaTh;
    const D = 2 * v_s;
    
    // 收缩参数
    const tau0 = cement.tau_s_cem * Math.pow(fc / 40, cement.s_tau_f);
    const tauSH = tau0 * aggregate.ks_tau_a * Math.pow(shape.ks * D, 2);
    const epsilon0 = cement.epsilon_s_cem * Math.pow(fc / 40, cement.s_epsilon_f);
    const E1 = E28 * Math.sqrt((7 * betaTh + 600 * betaTs) / (4 + (6/7)*(7 * betaTh + 600 * betaTs)));
    const E2 = E28 * Math.sqrt((t0Tilde + tauSH * betaTs) / (4 + (6/7)*(t0Tilde + tauSH * betaTs)));
    const epsilonSHInf = -epsilon0 * aggregate.ks_epsilon_a * (E1 / E2);
    const kh = h <= 98 ? 1 - Math.pow(h/100, 3) : 12.94 * (1 - h/100) - 0.2;
    
    // 自生收缩参数
    const epsilonAUInf = -cement.epsilon_au_cem * Math.pow(fc / 40, cement.r_epsilon_f);
    const tauAU = cement.tau_au_cem * Math.pow(fc / 40, cement.r_tau_f);
    const alpha_s = 1.73;
    const r_t = -1.73;
    
    // 时间计算
    const tTilde = (tVal - t0) * betaTs;
    const tPrimeHat = t0Tilde + (tPrimeVal - t0) * betaTs;
    const tHat = tPrimeHat + (tVal - tPrimeVal) * betaTc;
    
    // 收缩应变
    const S = Math.tanh(Math.sqrt(tTilde / tauSH));
    const epsilonSH = epsilonSHInf * kh * S;
    
    // 自生收缩
    const epsilonAU = epsilonAUInf * Math.pow(1 + Math.pow(tauAU / (tTilde + t0Tilde), alpha_s), r_t);
    
    // 徐变函数计算
    const q1 = cement.p1 / (E28 * 1000);
    const q2 = cement.s2 * Math.pow(fc / 40, cement.s2f) / 1000;
    const q3 = cement.s3 * q2 * Math.pow(fc / 40, cement.s3f);
    const q4 = cement.s4 * Math.pow(fc / 40, cement.s4f) / 1000;
    const rHat = 1.7 * Math.pow(tPrimeHat, 0.12) + 8;
    const Z = Math.pow(tPrimeHat, -0.5) * Math.log(1 + Math.pow(tHat - tPrimeHat, 0.1));
    const Qf = 1 / (0.086 * Math.pow(tPrimeHat, 2/9) + 1.21 * Math.pow(tPrimeHat, 4/9));
    const Q = Qf * Math.pow(1 + Math.pow(Qf / Z, rHat), -1/rHat);
    const C0 = q2 * Q + q3 * Math.log(1 + Math.pow(tHat - tPrimeHat, 0.1)) + q4 * Math.log(tHat / tPrimeHat);
    const RT = Math.exp(4000 * (1/293 - 1/(t_temp + 273)));
    const q5 = cement.s5 * Math.pow(fc / 40, cement.s5f) * Math.pow(Math.abs(kh * epsilonSHInf), cement.p5_epsilon) / 1000;
    const H = 1 - (1 - h/100) * Math.tanh(Math.sqrt((tHat - t0Tilde) / tauSH));
    const tPrime0 = Math.max(tPrimeHat, t0Tilde);
    const Hc = 1 - (1 - h/100) * Math.tanh(Math.sqrt((tPrime0 - t0Tilde) / tauSH));
    const Cd = tHat >= tPrime0 ? q5 * Math.sqrt(Math.exp(-cement.p5H * H) - Math.exp(-cement.p5H * Hc)) : 0;
    const J = q1 + RT * C0 + Cd;
    
    if (debug) {
      console.log('B4S JavaScript 计算详情:', {
        输入参数: params,
        时间: t,
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
    setParams(prev => ({ ...prev, [name]: value }));
  };

  const calculateCreep = async () => {
    if (!wasmReady || !wasmModule) {
      alert('WebAssembly 模块尚未加载完成，请稍候再试');
      return;
    }

    if (!params.t0 || !params.fc) {
      alert('加载龄期t0和混凝土强度fc为必填项，请输入有效值');
      return;
    }

    const t0 = parseFloat(params.t0);
    const fc = parseFloat(params.fc);
    if (isNaN(t0) || isNaN(fc) || t0 <= 0 || fc <= 0) {
      alert('加载龄期t0和混凝土强度fc必须为正数');
      return;
    }

    try {
      const startTime = performance.now();
      
      // 使用 Rust 计算时间序列
      const rustParams = {
        t0: parseFloat(params.t0),
        t_prime: parseFloat(params.tPrime),
        t_temp: parseFloat(params.t_temp),
        h: parseFloat(params.h),
        fc: parseFloat(params.fc),
        v_s: parseFloat(params.v_s),
        cement_type: params.cement_type,
        aggregate_type: params.aggregate_type,
        specimen_shape: params.specimen_shape
      };

      const rustResults = wasmModule.calculate_b4s_series(rustParams, 10000);
      const endTime = performance.now();
      
      // 转换结果格式
      const formattedResults = rustResults.map((result, index) => ({
        t: index + 1,
        j: result.j,
        epsilon_sh: result.epsilon_sh,
        epsilon_au: result.epsilon_au
      }));

      setResults(formattedResults);
      setIsCalculated(true);
      setPerformanceData({
        rustTime: endTime - startTime,
        dataPoints: formattedResults.length
      });

      console.log(`B4S Rust 计算完成: ${formattedResults.length} 个数据点，耗时 ${(endTime - startTime).toFixed(2)}ms`);
    } catch (error) {
      console.error('B4S 计算失败:', error);
      alert('计算失败，请检查输入参数');
    }
  };

  const exportToCSV = () => {
    if (!results.length) return;

    const csvData = [['时间(t-tPrime)', '徐变函数J', '收缩应变', '自生收缩应变']];
    results.forEach(item => {
      csvData.push([
        item.t,
        item.j.toFixed(6),
        item.epsilon_sh.toExponential(4),
        item.epsilon_au.toExponential(4)
      ]);
    });

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'b4s_rust_results.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 批量计算处理
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

  // 形状映射函数
  const mapSpecimenShape = (shape) => {
    const map = {
      '无限板': '1', 'infinite slab': '1',
      '无限圆柱': '2', 'infinite cylinder': '2',
      '无限正方形棱柱': '3', 'infinite square prism': '3',
      '球体': '4', 'sphere': '4',
      '立方体': '5', 'cube': '5'
    };
    return map[shape] || shape || '2';
  };

  // 骨料映射函数
  const mapAggregateType = (type) => {
    const map = {
      '玄武岩': 'Diabase', 'Diabase': 'Diabase',
      '石英岩': 'Quartzite', 'Quartzite': 'Quartzite',
      '石灰岩': 'Limestone', 'Limestone': 'Limestone',
      '砂岩': 'Sandstone', 'Sandstone': 'Sandstone',
      '花岗岩': 'Granite', 'Granite': 'Granite',
      '石英闪长岩': 'Quartz Diorite', 'Quartz Diorite': 'Quartz Diorite',
      '无信息': 'No Information', 'No Information': 'No Information'
    };
    return map[type] || type || 'No Information';
  };

  const processBatchData = async (data) => {
    if (!wasmReady || !wasmModule) {
      alert('WebAssembly 模块尚未加载完成，请稍候再试');
      return;
    }

    if (!data || data.length === 0) {
      alert('文件无有效数据');
      return;
    }

    setBatchHeaders(Object.keys(data[0]));

    // 数据映射和验证
    const mappedData = data.map((row, index) => {
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
        t_temp: parseFloat(row.T || row["温度"] || 20),
        h: parseFloat(row.h || row["湿度"] || 60),
        fc: parseFloat(fcValue) || 30,
        v_s: parseFloat(row.vS || row["体积表面积比"] || 0.5),
        cement_type: row.cementType || row["水泥类型"] || 'R',
        aggregate_type: mapAggregateType(row.aggregateType || row["骨料类型"]),
        specimen_shape: mapSpecimenShape(row.specimenShape || row["试件形状"]),
        t: parseFloat(tValue) || 365
      };

      // 确保 t > tPrime
      if (mappedItem.t <= mappedItem.tPrime) {
        console.warn(`第 ${index + 1} 行: t (${mappedItem.t}) <= tPrime (${mappedItem.tPrime})，调整 t 为 tPrime + 1`);
        mappedItem.t = mappedItem.tPrime + 1;
      }

      console.log(`第 ${index + 1} 行映射结果:`, mappedItem);
      return mappedItem;
    }).filter(item => item !== null);

    if (mappedData.length === 0) {
      alert('没有有效的数据行');
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

        // JavaScript 计算（仅用于验证，不显示给用户）
        const jsResult = calculateB4sJS(item, item.t, false);

        // Rust 计算
        const rustParams = {
          t0: item.t0,
          t_prime: item.tPrime,
          t_temp: item.t_temp,
          h: item.h,
          fc: item.fc,
          v_s: item.v_s,
          cement_type: item.cement_type,
          aggregate_type: item.aggregate_type,
          specimen_shape: item.specimen_shape
        };

        const rustResult = wasmModule.calculate_b4s_single(rustParams, item.t);

        // 内部验证（不显示给用户）
        const j_difference = Math.abs(rustResult.j - jsResult.J);
        const j_relative_error = jsResult.J !== 0 ? Math.abs(j_difference / jsResult.J) * 100 : 0;

        // 如果误差过大，在控制台记录警告
        if (j_relative_error > 1.0) {
          console.warn(`第 ${index + 1} 行计算结果差异较大: ${j_relative_error.toFixed(2)}%`);
        }

        return {
          j: rustResult.j,
          epsilon_sh: rustResult.epsilon_sh,
          epsilon_au: rustResult.epsilon_au,
          original: data[index]
        };
      } catch (error) {
        console.error(`B4S 第 ${index + 1} 行计算失败:`, error);
        return {
          j: NaN, epsilon_sh: NaN, epsilon_au: NaN,
          original: data[index]
        };
      }
    });

    setBatchResults(results);
    console.log('B4S 批量计算完成，结果数量:', results.length);
  };

  const exportBatchToCSV = () => {
    if (!batchResults.length) return;

    const headers = [...batchHeaders, '徐变函数J', '收缩应变εSH', '自生收缩εAU'];
    const csvData = [headers];
    batchResults.forEach(row => {
      const csvRow = [];
      batchHeaders.forEach(h => csvRow.push(row.original[h]));
      csvRow.push(
        isNaN(row.j) ? 'N/A' : row.j.toFixed(6),
        isNaN(row.epsilon_sh) ? 'N/A' : row.epsilon_sh.toExponential(4),
        isNaN(row.epsilon_au) ? 'N/A' : row.epsilon_au.toExponential(4)
      );
      csvData.push(csvRow);
    });

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'b4s_batch_results.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <h2 style={{textAlign: 'center', margin: '32px 0 18px 0'}}>B4S 徐变模型 (🦀 Rust 高性能版)</h2>
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
              name="t_temp"
              value={params.t_temp}
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
              name="v_s"
              value={params.v_s}
              onChange={handleParamChange}
              min="0.1"
              max="10"
              step="0.1"
              required
            />
          </div>
          <div className="param-item">
            <label>水泥类型:</label>
            <select
              name="cement_type"
              value={params.cement_type}
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
              name="aggregate_type"
              value={params.aggregate_type}
              onChange={handleParamChange}
              required
            >
              <option value="Diabase">玄武岩</option>
              <option value="Quartzite">石英岩</option>
              <option value="Limestone">石灰岩</option>
              <option value="Sandstone">砂岩</option>
              <option value="Granite">花岗岩</option>
              <option value="Quartz Diorite">石英闪长岩</option>
              <option value="No Information">无信息</option>
            </select>
          </div>
          <div className="param-item">
            <label>试件形状:</label>
            <select
              name="specimen_shape"
              value={params.specimen_shape}
              onChange={handleParamChange}
              required
            >
              <option value="1">无限板</option>
              <option value="2">无限圆柱</option>
              <option value="3">无限正方形棱柱</option>
              <option value="4">球体</option>
              <option value="5">立方体</option>
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
              <h4 style={{ margin: '0 0 8px 0', color: '#1976d2' }}>📊 B4S 批量计算结果</h4>
              <div style={{
                padding: '8px 12px',
                backgroundColor: '#e8f5e8',
                borderLeft: '4px solid #4caf50',
                marginBottom: '12px',
                borderRadius: '4px'
              }}>
                <strong>🚀 高性能计算</strong>: 使用 Rust 引擎进行 B4S 徐变模型批量计算<br/>
                <small>B4S 是 B4 模型的简化版本，适用于快速工程评估。</small>
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

export default RustB4sCalculator;
