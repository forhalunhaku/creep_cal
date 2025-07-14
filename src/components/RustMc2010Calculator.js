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

function RustMc2010Calculator() {
  const [params, setParams] = useState({
    fcm: 40,
    RH: 70,
    t0: 28,
    Ac: 1000,
    u: 400,
    T: 20,
    Cs: '42.5R'
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

  // JavaScript 版本的 MC2010 计算（用于对比）
  const calculateCreepJS = (params, t, debug = false) => {
    const { fcm, RH, t0, Ac, u, T, Cs } = params;
    
    // 水泥类型映射
    const getCementAlpha = (cementType) => {
      const mapping = {
        '32.5N': -1, '32.5R': 0, '42.5N': 0,
        '42.5R': 1, '52.5N': 1, '52.5R': 1
      };
      return mapping[cementType] || 0;
    };
    
    const alpha = getCementAlpha(Cs);
    const t0T = t0 * Math.exp(13.65 - 4000 / (273 + T));
    const t0Adj = t0T * Math.pow((9 / (2 + Math.pow(t0T, 1.2))) + 1, alpha);
    
    const h = (2 * Ac) / u; // mm
    const alphaFcm = Math.sqrt(35 / fcm);
    const betaH = Math.min(1.5 * h + 250 * alphaFcm, 1500 * alphaFcm);
    
    const tDiff = t - t0;
    if (tDiff < 0) return NaN;
    
    // 基本徐变
    const betaBcFcm = 1.8 / Math.pow(fcm, 0.7);
    const betaBcTT0 = Math.log(Math.pow((30 / t0Adj) + 0.035, 2) * tDiff + 1);
    const phiBc = betaBcFcm * betaBcTT0;
    
    // 干燥徐变
    const betaDcFcm = 412 / Math.pow(fcm, 1.4);
    const betaDcRh = (1 - RH / 100) / Math.pow(0.1 * (h / 100), 1/3);
    const betaDcT0 = 1 / (0.1 + Math.pow(t0Adj, 0.2));
    const gammaT0 = 1 / (2.3 + 3.5 / Math.sqrt(t0Adj));
    const betaDcTT0 = Math.pow(tDiff / (betaH + tDiff), gammaT0);
    const phiDc = betaDcFcm * betaDcRh * betaDcT0 * betaDcTT0;
    
    const result = phiBc + phiDc;
    
    if (debug) {
      console.log('MC2010 JavaScript 计算详情:', {
        输入参数: params,
        时间: t,
        't-t0': tDiff,
        alpha, t0T, t0Adj, h, alphaFcm, betaH,
        基本徐变: { betaBcFcm, betaBcTT0, phiBc },
        干燥徐变: { betaDcFcm, betaDcRh, betaDcT0, gammaT0, betaDcTT0, phiDc },
        最终结果: result
      });
    }
    
    return result;
  };

  const handleParamChange = (e) => {
    const { name, value } = e.target;
    setParams(prev => ({ 
      ...prev, 
      [name]: name === 'Cs' ? value : parseFloat(value) 
    }));
  };

  const calculateCreep = async () => {
    if (!wasmReady || !wasmModule) {
      alert('Rust 计算引擎未就绪，请刷新页面重试');
      return;
    }

    try {
      const timer = new wasmModule.PerformanceTimer();
      
      const rustParams = {
        fcm: params.fcm,
        rh: params.RH,
        t0: params.t0,
        ac: params.Ac,
        u: params.u,
        t: params.T,
        cement_type: params.Cs
      };

      const rustResults = wasmModule.calculate_mc2010_series(rustParams, 10000);
      const elapsed = timer.elapsed();
      
      setResults(rustResults);
      setIsCalculated(true);
      setPerformanceData({
        rustTime: elapsed,
        dataPoints: rustResults.length
      });

      console.log(`🚀 MC2010 Rust 计算完成，耗时: ${elapsed.toFixed(2)}ms`);
    } catch (error) {
      console.error('MC2010 Rust 计算错误:', error);
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

    console.log('MC2010 原始数据:', data);
    setBatchHeaders(Object.keys(data[0]));
    
    try {
      const timer = new wasmModule.PerformanceTimer();
      
      // 数据映射
      const mappedData = data.map((row, index) => {
        if (!row || typeof row !== 'object') {
          console.warn(`第 ${index + 1} 行数据无效:`, row);
          return null;
        }
        
        const fcmValue = row.fcm || row["抗压强度"] || row["fcm"];
        const tValue = row.t || row["时间"] || row["龄期"];
        
        if (fcmValue === undefined || fcmValue === '' || tValue === undefined || tValue === '') {
          console.warn(`第 ${index + 1} 行缺少必要字段:`, row);
          return null;
        }
        
        const mappedRow = {
          fcm: parseFloat(fcmValue) || 40,
          RH: parseFloat(row.RH || row["相对湿度"] || 70),
          t0: parseFloat(row.t0 || row["加载龄期"] || 28),
          Ac: parseFloat(row.Ac || row["截面面积"] || 1000),
          u: parseFloat(row.u || row["周长"] || 400),
          T: parseFloat(row.T || row["温度"] || 20),
          Cs: row.Cs || row["水泥类型"] || '42.5R',
          t: parseFloat(tValue) || 365
        };
        
        return mappedRow;
      }).filter(row => row !== null);
      
      console.log('MC2010 映射后的数据:', mappedData);
      
      if (mappedData.length === 0) {
        alert('没有有效的数据行，请检查数据格式');
        return;
      }
      
      // 对比计算
      const results = mappedData.map((item, index) => {
        try {
          const params = {
            fcm: item.fcm,
            RH: item.RH,
            t0: item.t0,
            Ac: item.Ac,
            u: item.u,
            T: item.T,
            Cs: item.Cs
          };
          
          // JavaScript 计算（仅用于内部验证）
          const jsResult = calculateCreepJS(params, item.t, false);
          
          // Rust 计算
          const rustParams = {
            fcm: params.fcm,
            rh: params.RH,
            t0: params.t0,
            ac: params.Ac,
            u: params.u,
            t: params.T,
            cement_type: params.Cs
          };
          const rustResult = wasmModule.calculate_mc2010_single(rustParams, item.t);
          
          // 内部验证（不显示给用户）
          const difference = Math.abs(jsResult - rustResult);
          const relativeError = difference / jsResult * 100;

          if (relativeError > 1.0) {
            console.warn(`MC2010 第 ${index + 1} 行计算结果差异较大: ${relativeError.toFixed(2)}%`);
          }

          return {
            phi: rustResult,
            original: data[index]
          };
        } catch (error) {
          console.error(`MC2010 第 ${index + 1} 行计算失败:`, error);
          return {
            phi: NaN,
            original: data[index]
          };
        }
      });
      
      const elapsed = timer.elapsed();
      setBatchResults(results);
      
      console.log(`🚀 MC2010 Rust 批量计算完成，处理 ${mappedData.length} 条数据，耗时: ${elapsed.toFixed(2)}ms`);
      
      setPerformanceData(prev => ({
        ...prev,
        batchTime: elapsed,
        batchSize: mappedData.length
      }));
    } catch (error) {
      console.error('MC2010 批量计算错误:', error);
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
    link.download = 'mc2010_rust_results.csv';
    link.click();
  };

  const exportBatchToCSV = () => {
    if (batchResults.length === 0) return;
    
    const headers = [...batchHeaders, 'phi_js', 'phi_rust', 'difference', 'relative_error'];
    const csvContent = [
      headers,
      ...batchResults.map(row => [
        ...batchHeaders.map(h => row.original[h] || ''),
        row.phi_js.toFixed(4),
        row.phi.toFixed(4),
        row.difference.toFixed(6),
        row.relativeError.toFixed(4)
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'mc2010_rust_batch_results.csv';
    link.click();
  };

  return (
    <div>
      <h2 style={{textAlign: 'center', margin: '32px 0 18px 0'}}>MC2010 徐变模型 (🦀 Rust 高性能版)</h2>
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
            <label>抗压强度 fcm (MPa):</label>
            <input
              type="number"
              name="fcm"
              value={params.fcm}
              onChange={handleParamChange}
              min="10"
              max="100"
              required
            />
          </div>
          <div className="param-item">
            <label>相对湿度 RH (%):</label>
            <input
              type="number"
              name="RH"
              value={params.RH}
              onChange={handleParamChange}
              min="0"
              max="100"
              required
            />
          </div>
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
            <label>截面面积 Ac (mm²):</label>
            <input
              type="number"
              name="Ac"
              value={params.Ac}
              onChange={handleParamChange}
              min="100"
              max="100000"
              required
            />
          </div>
          <div className="param-item">
            <label>周长 u (mm):</label>
            <input
              type="number"
              name="u"
              value={params.u}
              onChange={handleParamChange}
              min="50"
              max="10000"
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
            <label>水泥类型 Cs:</label>
            <select
              name="Cs"
              value={params.Cs}
              onChange={handleParamChange}
              required
            >
              <option value="32.5N">32.5N</option>
              <option value="32.5R">32.5R</option>
              <option value="42.5N">42.5N</option>
              <option value="42.5R">42.5R</option>
              <option value="52.5N">52.5N</option>
              <option value="52.5R">52.5R</option>
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
                <Line type="monotone" dataKey="phi" stroke="#8884d8" strokeWidth={2} dot={false} name="徐变系数φ" />
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
              <h4 className="info-text" style={{ margin: '0 0 8px 0' }}>📊 MC2010 批量计算结果</h4>
              <div style={{
                padding: '8px 12px',
                backgroundColor: '#e8f5e8',
                borderLeft: '4px solid #4caf50',
                marginBottom: '12px',
                borderRadius: '4px'
              }}>
                <strong>🚀 高性能计算</strong>: 使用 Rust 引擎进行 MC2010 徐变模型批量计算<br/>
                <small>MC2010 是欧洲混凝土规范，考虑基本徐变和干燥徐变。</small>
              </div>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                <li><strong>φ</strong>: 徐变系数，无量纲</li>
                <li className="info-text">💡 支持导出为 CSV 格式进行进一步分析</li>
                <li className="text-secondary">📋 公式：φ = φbc + φdc（基本徐变 + 干燥徐变）</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default RustMc2010Calculator;
