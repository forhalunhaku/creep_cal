import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

function Mc2010Calculator() {
  const [params, setParams] = useState({
    fcm: 30,
    RH: 70,
    t0: 28,
    Ac: 10000,
    u: 400,
    T: 20,
    cementType: '42.5N'
  });
  const [results, setResults] = useState(null);
  const [isCalculated, setIsCalculated] = useState(false);
  const [batchResults, setBatchResults] = useState([]);
  const [batchHeaders, setBatchHeaders] = useState([]);

  const cementAlphaMap = {
    '32.5N': -1,
    '32.5R': 0,
    '42.5N': 0,
    '42.5R': 1,
    '52.5N': 1,
    '52.5R': 1
  };

  const handleParamChange = (e) => {
    const { name, value } = e.target;
    setParams(prev => ({ ...prev, [name]: value }));
  };

  const calculateCreep = () => {
    const { fcm, RH, t0, Ac, u, T, cementType } = params;
    const alpha = cementAlphaMap[cementType];
    const t0_T = t0 * Math.exp(13.65 - 4000 / (273 + Number(T)));
    const t0_adj = t0_T * Math.pow((9 / (2 + Math.pow(t0_T, 1.2))) + 1, alpha);
    const h = (2 * Ac) / u; // mm
    const alpha_fcm = Math.sqrt(35 / fcm);
    const beta_h = Math.min(1.5 * h + 250 * alpha_fcm, 1500 * alpha_fcm);
    const timePoints = generateTimePoints(10000);
    const creepData = timePoints.map(t => {
      const tDiff = t;
      const phi = calculatePhiMC2010(fcm, RH, t0, Ac, u, T, cementType, t0_adj, h, alpha_fcm, beta_h, tDiff);
      return {
        time: t,
        creep: parseFloat(phi.toFixed(4))
      };
    });
    setResults(creepData);
    setIsCalculated(true);
  };

  const calculateCreepSingle = ({ fcm, RH, t0, Ac, u, T, Cs, t }) => {
    fcm = parseFloat(fcm);
    RH = parseFloat(RH);
    t0 = parseFloat(t0);
    Ac = parseFloat(Ac);
    u = parseFloat(u);
    T = parseFloat(T);
    t = parseFloat(t);
    const cementType = Cs;
    const alpha = cementAlphaMap[cementType];
    const t0_T = t0 * Math.exp(13.65 - 4000 / (273 + Number(T)));
    const t0_adj = t0_T * Math.pow((9 / (2 + Math.pow(t0_T, 1.2))) + 1, alpha);
    const h = (2 * Ac) / u; // mm
    const alpha_fcm = Math.sqrt(35 / fcm);
    const beta_h = Math.min(1.5 * h + 250 * alpha_fcm, 1500 * alpha_fcm);
    const tDiff = t - t0;
    if (tDiff < 0) return NaN;
    const phi = calculatePhiMC2010(fcm, RH, t0, Ac, u, T, cementType, t0_adj, h, alpha_fcm, beta_h, tDiff);
    return phi;
  };

  function calculatePhiMC2010(fcm, RH, t0, Ac, u, T, Cs, t0_adj, h, alpha_fcm, beta_h, tDiff) {
    // 基本徐变
    const beta_bc_fcm = 1.8 / Math.pow(fcm, 0.7);
    const beta_bc_t_t0 = Math.log(Math.pow(((30 / t0_adj) + 0.035), 2) * tDiff + 1);
    const phi_bc = beta_bc_fcm * beta_bc_t_t0;
    // 干燥徐变
    const beta_dc_fcm = 412 / Math.pow(fcm, 1.4);
    const beta_dc_RH = (1 - RH / 100) / Math.pow((0.1 * (h / 100)), 1/3); // h/100, 单位cm
    const beta_dc_t0 = 1 / (0.1 + Math.pow(t0_adj, 0.2));
    const gamma_t0 = 1 / (2.3 + 3.5 / Math.sqrt(t0_adj));
    const beta_dc_t_t0 = Math.pow(tDiff / (beta_h + tDiff), gamma_t0);
    const phi_dc = beta_dc_fcm * beta_dc_RH * beta_dc_t0 * beta_dc_t_t0;
    return phi_bc + phi_dc;
  }

  const generateTimePoints = (maxDays) => {
    const points = [];
    for (let t = 0; t <= maxDays; t += 1) {
      points.push(t);
    }
    return points;
  };

  const exportToCSV = () => {
    if (!results) return;
    const csvData = [["时间(d)", "徐变系数φ"]];
    results.forEach(item => {
      csvData.push([item.time, item.creep]);
    });
    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'mc2010_creep_results.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

  const processBatchData = (data) => {
    if (!data || data.length === 0) {
      alert('文件无有效数据');
      return;
    }
    setBatchHeaders(Object.keys(data[0]));
    const results = data.map(row => {
      const phi = calculateCreepSingle(row);
      return { ...row, phi: isNaN(phi) ? '' : phi.toFixed(4) };
    });
    setBatchResults(results);
  };

  const exportBatchToCSV = () => {
    if (!batchResults.length) return;
    const headers = [...batchHeaders, 'phi'];
    const csvData = [headers];
    batchResults.forEach(row => {
      csvData.push(headers.map(h => row[h]));
    });
    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'mc2010_batch_results.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <h2 style={{textAlign: 'center', margin: '32px 0 18px 0'}}>MC2010 徐变模型</h2>
      <div className="main-card">
        <h3 className="section-title">参数输入</h3>
        <div className="param-grid">
          <div className="param-item">
            <label>混凝土强度 fcm (MPa):</label>
            <input type="number" name="fcm" value={params.fcm} onChange={handleParamChange} min="0" max="150" step="0.1" />
          </div>
          <div className="param-item">
            <label>相对湿度 RH (%):</label>
            <input type="number" name="RH" value={params.RH} onChange={handleParamChange} min="0" max="100" step="1" />
          </div>
          <div className="param-item">
            <label>加载龄期 t0 (天):</label>
            <input type="number" name="t0" value={params.t0} onChange={handleParamChange} min="1" max="1000" step="1" />
          </div>
          <div className="param-item">
            <label>截面面积 Ac (mm²):</label>
            <input type="number" name="Ac" value={params.Ac} onChange={handleParamChange} min="1" max="1000000" step="1" />
          </div>
          <div className="param-item">
            <label>截面周长 u (mm):</label>
            <input type="number" name="u" value={params.u} onChange={handleParamChange} min="1" max="10000" step="1" />
          </div>
          <div className="param-item">
            <label>温度 T (℃):</label>
            <input type="number" name="T" value={params.T} onChange={handleParamChange} min="-20" max="100" step="1" />
          </div>
          <div className="param-item">
            <label>水泥类型:</label>
            <select name="cementType" value={params.cementType} onChange={handleParamChange}>
              <option value="32.5N">32.5N</option>
              <option value="32.5R">32.5R</option>
              <option value="42.5N">42.5N</option>
              <option value="42.5R">42.5R</option>
              <option value="52.5N">52.5N</option>
              <option value="52.5R">52.5R</option>
            </select>
          </div>
        </div>
        <button onClick={calculateCreep} className="calculate-btn" style={{width: '100%'}}>计算徐变系数</button>
        {isCalculated && (
          <button onClick={exportToCSV} className="calculate-btn" style={{ marginLeft: 16, background: 'var(--color-btn-success)' }}>导出CSV结果</button>
        )}
        <hr className="divider" />
        <h3 className="section-title">单点计算结果</h3>
        {/* 结果区 */}
        {isCalculated && results ? (
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={results.slice(0, 1000)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="creep" stroke="#8884d8" strokeWidth={2} dot={false} name="徐变系数φ" />
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
        ) : (
          <div style={{ color: '#888', marginBottom: 12 }}>请先输入参数并点击“计算徐变系数”</div>
        )}
        <hr className="divider" />
        <h3 className="section-title" style={{ marginTop: 40 }}>批量导入/批量计算</h3>
        <input type="file" accept=".csv,.xlsx,.xls" onChange={handleBatchFile} style={{ marginBottom: 16 }} />
        {batchResults.length > 0 && (
          <button onClick={exportBatchToCSV} className="calculate-btn" style={{ marginLeft: 16, background: '#43a047' }}>导出批量结果</button>
        )}
        {batchResults.length > 0 && (
          <div style={{ marginTop: 24, overflowX: 'auto' }}>
            <table className="batch-table">
              <thead>
                <tr>
                  {batchHeaders.map(h => <th key={h}>{h}</th>)}
                  <th>phi</th>
                </tr>
              </thead>
              <tbody>
                {batchResults.map((row, idx) => (
                  <tr key={idx}>
                    {batchHeaders.map(h => <td key={h}>{row[h]}</td>)}
                    <td>{row.phi}</td>
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
              <h4 style={{ margin: '0 0 8px 0', color: '#1976d2' }}>📊 MC2010 批量计算结果</h4>
              <div className="highlight-box-blue" style={{
                padding: '8px 12px',
                marginBottom: '12px',
                borderRadius: '4px'
              }}>
                <strong>⚡ JavaScript 计算</strong>: 使用 JavaScript 引擎进行 MC2010 徐变模型批量计算<br/>
                <small>MC2010 是国际混凝土联合会(fib)模型规范，适用于现代混凝土结构。</small>
              </div>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                <li><strong>φ</strong>: 徐变系数，无量纲</li>
                <li style={{ color: '#1976d2' }}>💡 支持导出为 CSV 格式进行进一步分析</li>
                <li style={{ color: '#666' }}>📋 基于 fib Model Code 2010 标准</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Mc2010Calculator; 