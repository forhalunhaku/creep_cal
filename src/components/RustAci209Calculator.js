import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { RustEngineLoader } from './LoadingSpinner';

// Rust WebAssembly 模块动态导入
let wasmModule = null;
let wasmInitialized = false;

const initWasm = async () => {
  if (!wasmInitialized) {
    try {
      const wasm = await import('../wasm-pkg/creep_calculator_engine.js');
      await wasm.default(); // 初始化 WASM
      wasmModule = wasm;
      wasmInitialized = true;
      console.log('🦀 Rust WebAssembly 模块加载成功');
    } catch (error) {
      console.error('❌ Rust WebAssembly 模块加载失败:', error);
      console.log('💡 请先运行构建脚本: cd rust-engine && ./build.sh');
    }
  }
  return wasmModule;
};

function RustAci209Calculator() {
  const [params, setParams] = useState({
    t0: 28,
    H: 70,
    VS: 100,
    sPhi: 0.5,
    Cc: 350,
    alpha: 0.08
  });
  const [results, setResults] = useState([]);
  const [isCalculated, setIsCalculated] = useState(false);
  const [batchResults, setBatchResults] = useState([]);
  const [batchHeaders, setBatchHeaders] = useState([]);
  const [wasmReady, setWasmReady] = useState(false);
  const [wasmLoading, setWasmLoading] = useState(true);
  const [wasmError, setWasmError] = useState(null);
  const [performanceData, setPerformanceData] = useState(null);

  // 初始化 WebAssembly
  useEffect(() => {
    setWasmLoading(true);
    setWasmError(null);

    initWasm().then((module) => {
      if (module) {
        setWasmReady(true);
        setWasmLoading(false);
        console.log('ACI209 Rust WASM 模块加载成功');
      } else {
        setWasmError('模块初始化失败');
        setWasmLoading(false);
      }
    }).catch((error) => {
      console.error('ACI209 Rust WASM 模块加载失败:', error);
      setWasmError(error.message || '加载失败');
      setWasmLoading(false);
      setWasmReady(false);
    });
  }, []);

  const handleParamChange = (e) => {
    const { name, value } = e.target;
    setParams(prev => ({ ...prev, [name]: parseFloat(value) }));
  };

  const calculateCreep = async () => {
    if (!wasmReady || !wasmModule) {
      alert('Rust 计算引擎未就绪，请刷新页面重试');
      return;
    }

    try {
      const timer = new wasmModule.PerformanceTimer();
      
      // 转换参数格式
      const rustParams = {
        t0: params.t0,
        h: params.H,
        vs: params.VS,
        s_phi: params.sPhi,
        cc: params.Cc,
        alpha: params.alpha
      };

      // 调用 Rust 计算函数
      const rustResults = wasmModule.calculate_aci209_series(rustParams, 10000);
      const elapsed = timer.elapsed();
      
      setResults(rustResults);
      setIsCalculated(true);
      setPerformanceData({
        rustTime: elapsed,
        dataPoints: rustResults.length
      });

      console.log(`🚀 Rust 计算完成，耗时: ${elapsed.toFixed(2)}ms`);
    } catch (error) {
      console.error('Rust 计算错误:', error);
      alert('计算失败: ' + error.message);
    }
  };

  // JavaScript 版本的 ACI209 计算（用于对比）- 修正为与原版一致
  const calculateCreepJS = (params, t, debug = false) => {
    const { t0, H, VS, sPhi, Cc, alpha } = params;
    const βt0 = 1.25 * Math.pow(t0, -0.118);
    const βRH = 1.27 - 0.0067 * H;
    const βVS = (2 * (1 + 1.13 * Math.exp(-0.0213 * VS))) / 3;
    const βsPhi = 0.88 + 0.244 * sPhi;
    const βCc = 0.75 + 0.00061 * Cc;
    const βα = 0.46 + 9 * alpha;
    const phiInfinity = 2.35 * βt0 * βRH * βVS * βsPhi * βCc * βα;

    // 修正：使用 (t-t0) 而不是 t，与原始 ACI209 实现保持一致
    const tDiff = t - t0;
    const βc = tDiff <= 0 ? 0 : Math.pow(tDiff, 0.6) / (10 + Math.pow(tDiff, 0.6));
    const result = βc * phiInfinity;

    if (debug) {
      console.log('JavaScript 计算详情 (修正版):', {
        输入参数: params,
        时间: t,
        't-t0': tDiff,
        βt0, βRH, βVS, βsPhi, βCc, βα,
        phiInfinity,
        βc,
        最终结果: result
      });
    }

    return result;
  };

  // eslint-disable-next-line no-unused-vars
  const calculateCreepSingle = (row) => {
    if (!wasmReady || !wasmModule) return NaN;

    try {
      const rustParams = {
        t0: parseFloat(row.t0 || row["加载龄期"] || 28),
        h: parseFloat(row.H || row["相对湿度"] || 70),
        vs: parseFloat(row.VS || row["体积表面积比"] || 100),
        s_phi: parseFloat(row.sPhi || row["徐变系数"] || 0.5),
        cc: parseFloat(row.Cc || row["水泥用量"] || 350),
        alpha: parseFloat(row.alpha || row["徐变参数"] || 0.08)
      };

      const t = parseFloat(row.t || row["时间"] || 365);
      return wasmModule.calculate_aci209_single(rustParams, t);
    } catch (error) {
      console.error('单点计算错误:', error);
      return NaN;
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

    console.log('原始数据:', data);
    console.log('第一行数据:', data[0]);
    console.log('数据列名:', Object.keys(data[0]));

    setBatchHeaders(Object.keys(data[0]));

    try {
      const timer = new wasmModule.PerformanceTimer();

      // 数据映射：将中文列名映射为 Rust 期望的格式
      const mappedData = data.map((row, index) => {
        if (!row || typeof row !== 'object') {
          console.warn(`第 ${index + 1} 行数据无效:`, row);
          return null;
        }

        // 获取 t0 值
        const t0Value = row.t0 || row["加载龄期"] || row["t0"];
        const tValue = row.t || row["时间"] || row["龄期"];

        if (t0Value === undefined || t0Value === '' || tValue === undefined || tValue === '') {
          console.warn(`第 ${index + 1} 行缺少必要字段 t0 或 t:`, row);
          return null;
        }

        const mappedRow = {
          t0: parseFloat(t0Value) || 28,
          t: parseFloat(tValue) || 365
        };

        // 可选字段
        const h = row.H || row["相对湿度"] || row["RH"];
        if (h !== undefined && h !== '') mappedRow.H = parseFloat(h) || 70;

        const vs = row.VS || row["体积表面积比"] || row["V/S"];
        if (vs !== undefined && vs !== '') mappedRow.VS = parseFloat(vs) || 100;

        const sPhi = row.sPhi || row.sphi || row["坍落度"] || row["s/φ"];
        if (sPhi !== undefined && sPhi !== '') mappedRow.sPhi = parseFloat(sPhi) || 0.5;

        const cc = row.Cc || row["水泥用量"] || row["cement"];
        if (cc !== undefined && cc !== '') mappedRow.Cc = parseFloat(cc) || 350;

        const alpha = row.alpha || row["徐变参数"] || row["α"];
        if (alpha !== undefined && alpha !== '') mappedRow.alpha = parseFloat(alpha) || 0.08;

        console.log(`第 ${index + 1} 行映射结果:`, mappedRow);
        return mappedRow;
      }).filter(row => row !== null); // 过滤掉无效行

      console.log('映射后的数据:', mappedData);

      // 验证数据
      const validData = mappedData.filter(item =>
        item && !isNaN(item.t0) && !isNaN(item.t) && item.t > 0 && item.t0 > 0
      );

      console.log('有效数据:', validData);

      if (validData.length === 0) {
        alert('没有有效的数据行，请检查数据格式。确保包含 t0 和 t 字段且为有效数值。');
        return;
      }

      if (validData.length < data.length) {
        console.warn(`过滤了 ${data.length - validData.length} 行无效数据`);
        alert(`成功处理 ${validData.length} 行数据，过滤了 ${data.length - validData.length} 行无效数据`);
      }

      // 使用 Rust 批量计算
      console.log('发送给 Rust 的数据:', validData);

      // 先尝试单个计算来测试
      if (validData.length > 0) {
        const testItem = validData[0];
        console.log('测试单个计算:', testItem);
        try {
          // 转换为Rust期望的字段格式
          const testRustParams = {
            t0: testItem.t0,
            h: testItem.H,
            vs: testItem.VS,
            s_phi: testItem.sPhi,
            cc: testItem.Cc,
            alpha: testItem.alpha
          };
          const testResult = wasmModule.calculate_aci209_single(testRustParams, testItem.t);
          console.log('单个计算结果:', testResult);
        } catch (testError) {
          console.error('单个计算失败:', testError);
        }
      }

      // 对比 JavaScript 和 Rust 的计算结果
      const rustResults = validData.map((item, index) => {
        try {
          const params = {
            t0: item.t0,
            H: item.H || 70,
            VS: item.VS || 100,
            sPhi: item.sPhi || 0.5,
            Cc: item.Cc || 350,
            alpha: item.alpha || 0.08
          };

          // JavaScript 计算（仅用于内部验证）
          const jsResult = calculateCreepJS(params, item.t, false);

          // Rust 计算 - 使用每行的数据
          const rustParams = {
            t0: item.t0,
            h: item.H,
            vs: item.VS,
            s_phi: item.sPhi,
            cc: item.Cc,
            alpha: item.alpha
          };
          const rustResult = wasmModule.calculate_aci209_single(rustParams, item.t);

          if (index === 0) {
            console.log('第一行 Rust 参数:', rustParams);
            console.log('第一行 Rust 结果:', rustResult);
          }

          // 内部验证（不显示给用户）
          const difference = Math.abs(jsResult - rustResult);
          const relativeError = difference / jsResult * 100;

          if (relativeError > 1.0) { // 如果相对误差超过 1.0%
            console.warn(`第 ${index + 1} 行计算结果差异较大: ${relativeError.toFixed(2)}%`);
          }

          return {
            phi: rustResult,
            original: data[index] // 使用原始数据
          };
        } catch (error) {
          console.error(`第 ${index + 1} 行计算失败:`, error);
          return {
            phi: NaN,
            original: data[index]
          };
        }
      });

      const elapsed = timer.elapsed();

      console.log('Rust 批量计算结果:', rustResults);
      setBatchResults(rustResults);

      console.log(`🚀 Rust 批量计算完成，处理 ${validData.length} 条数据，耗时: ${elapsed.toFixed(2)}ms`);

      setPerformanceData(prev => ({
        ...prev,
        batchTime: elapsed,
        batchSize: validData.length
      }));
    } catch (error) {
      console.error('批量计算错误:', error);
      alert('批量计算失败: ' + error.message);
    }
  };

  const exportToCSV = () => {
    if (results.length === 0) return;
    
    const csvContent = [
      ['时间(天)', '徐变系数'],
      ...results.map(r => [r.t, r.phi.toFixed(4)])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'aci209_rust_results.csv';
    link.click();
  };

  const exportBatchToCSV = () => {
    if (batchResults.length === 0) return;
    
    const headers = [...batchHeaders, 'phi'];
    const csvContent = [
      headers,
      ...batchResults.map(row => [
        ...batchHeaders.map(h => row.original[h] || ''),
        row.phi.toFixed(4)
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'aci209_rust_batch_results.csv';
    link.click();
  };

  // 如果正在加载或有错误，显示加载状态
  if (wasmLoading || wasmError) {
    return (
      <div>
        <h2 style={{textAlign: 'center', margin: '32px 0 18px 0'}}>ACI209 徐变模型 (🦀 Rust 高性能版)</h2>
        <div className="main-card">
          <RustEngineLoader isLoading={wasmLoading} error={wasmError} />
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{textAlign: 'center', margin: '32px 0 18px 0'}}>ACI209 徐变模型 (🦀 Rust 高性能版)</h2>
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
            <label>加载龄期 t₀ (天):</label>
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
            <label>相对湿度 H (%):</label>
            <input 
              type="number" 
              name="H" 
              value={params.H} 
              onChange={handleParamChange} 
              min="0" 
              max="100" 
              required 
            />
          </div>
          <div className="param-item">
            <label>体积表面积比 V/S:</label>
            <input 
              type="number" 
              name="VS" 
              value={params.VS} 
              onChange={handleParamChange} 
              min="0" 
              max="1000" 
              required 
            />
          </div>
          <div className="param-item">
            <label>坍落度 s/φ:</label>
            <input 
              type="number" 
              name="sPhi" 
              value={params.sPhi} 
              onChange={handleParamChange} 
              min="0" 
              max="1" 
              step="0.01" 
              required 
            />
          </div>
          <div className="param-item">
            <label>水泥用量 Cc (kg/m³):</label>
            <input 
              type="number" 
              name="Cc" 
              value={params.Cc} 
              onChange={handleParamChange} 
              min="0" 
              max="1000" 
              required 
            />
          </div>
          <div className="param-item">
            <label>徐变参数 alpha:</label>
            <input 
              type="number" 
              name="alpha" 
              value={params.alpha} 
              onChange={handleParamChange} 
              min="0" 
              max="1" 
              step="0.01" 
              required 
            />
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
                <Line type="monotone" dataKey="phi" stroke="#8884d8" strokeWidth={2} dot={false} name="徐变系数φ" />
              </LineChart>
            </ResponsiveContainer>
            {results.length > 1000 && (
              <div className="text-secondary" style={{
                textAlign: 'center',
                fontSize: '0.9rem',
                marginTop: '8px',
                fontStyle: 'italic'
              }}>
                📊 图表显示前1000个数据点，完整数据可通过CSV导出查看
              </div>
            )}
          </div>
        )}

        {!isCalculated && (
          <div className="text-muted" style={{ marginBottom: 12 }}>请先输入参数并点击"🚀 Rust 高速计算"</div>
        )}

        <hr className="divider" />
        <h3 className="section-title">批量导入/批量计算 (🦀 Rust 加速)</h3>
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
            style={{ marginLeft: 16, background: 'var(--color-btn-success)' }}
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
                  <th>徐变系数φ</th>
                </tr>
              </thead>
              <tbody>
                {batchResults.slice(0, 100).map((row, idx) => (
                  <tr key={idx}>
                    {batchHeaders.map(h => <td key={h}>{row.original[h]}</td>)}
                    <td>{isNaN(row.phi) ? 'N/A' : row.phi.toFixed(4)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {batchResults.length > 100 && (
              <p className="text-secondary" style={{ textAlign: 'center', marginTop: 16 }}>
                显示前100条结果，共{batchResults.length}条
              </p>
            )}

            <div className="info-box" style={{
              marginTop: 16,
              padding: 16,
              borderRadius: 8,
              fontSize: '14px'
            }}>
              <h4 className="info-text" style={{ margin: '0 0 8px 0' }}>📊 ACI209 批量计算结果</h4>
              <div style={{
                padding: '8px 12px',
                backgroundColor: '#e8f5e8',
                borderLeft: '4px solid #4caf50',
                marginBottom: '12px',
                borderRadius: '4px'
              }}>
                <strong>🚀 高性能计算</strong>: 使用 Rust 引擎进行 ACI209 徐变模型批量计算<br/>
                <small>ACI209 是美国混凝土学会标准，广泛应用于工程实践。</small>
              </div>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                <li><strong>φ</strong>: 徐变系数，无量纲</li>
                <li className="info-text">💡 支持导出为 CSV 格式进行进一步分析</li>
                <li className="text-secondary">📋 公式：φ = βt₀ × βRH × βVS × βs × βCc × βα × βc</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default RustAci209Calculator;
