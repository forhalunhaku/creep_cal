import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

function Aci209Calculator() {
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

  const handleParamChange = (e) => {
    const { name, value } = e.target;
    setParams(prev => ({ ...prev, [name]: parseFloat(value) }));
  };

  const calculateCreep = () => {
    const { t0, H, VS, sPhi, Cc, alpha } = params;
    const data = [];
    const βt0 = 1.25 * Math.pow(t0, -0.118);
    const βRH = 1.27 - 0.0067 * H;
    const βVS = (2 * (1 + 1.13 * Math.exp(-0.0213 * VS))) / 3;
    const βsPhi = 0.88 + 0.244 * sPhi;
    const βCc = 0.75 + 0.00061 * Cc;
    const βα = 0.46 + 9 * alpha;
    const phiInfinity = 2.35 * βt0 * βRH * βVS * βsPhi * βCc * βα;
    for (let t = 0; t <= 10000; t += 1) {
      const βc = Math.pow(t, 0.6) / (10 + Math.pow(t, 0.6));
      const phi = βc * phiInfinity;
      data.push({ t, phi });
    }
    setResults(data);
    setIsCalculated(true);
  };

  const calculateCreepSingle = ({ t0, H, VS, sphi, Cc, alpha, t }) => {
    t0 = parseFloat(t0);
    H = parseFloat(H);
    VS = parseFloat(VS);
    sphi = parseFloat(sphi);
    Cc = parseFloat(Cc);
    alpha = parseFloat(alpha);
    t = parseFloat(t);
    const βt0 = 1.25 * Math.pow(t0, -0.118);
    const βRH = 1.27 - 0.0067 * H;
    const βVS = (2 * (1 + 1.13 * Math.exp(-0.0213 * VS))) / 3;
    const βsPhi = 0.88 + 0.244 * sphi;
    const βCc = 0.75 + 0.00061 * Cc;
    const βα = 0.46 + 9 * alpha;
    const phiInfinity = 2.35 * βt0 * βRH * βVS * βsPhi * βCc * βα;
    const βc = Math.pow(t-t0, 0.6) / (10 + Math.pow(t-t0, 0.6));
    const phi = βc * phiInfinity;
    return phi;
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
      return { ...row, phi: phi.toFixed(4) };
    });
    setBatchResults(results);
  };

  const exportToCSV = () => {
    const csvData = [['时间(天)', '徐变系数φ']];
    results.forEach(item => {
      csvData.push([item.t, item.phi.toFixed(4)]);
    });
    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'aci209_creep_results.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
    link.setAttribute('download', 'aci209_batch_results.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <h2 style={{textAlign: 'center', margin: '32px 0 18px 0'}}>ACI209 徐变模型</h2>
      <div className="main-card">
        <h3 className="section-title">参数输入</h3>
        <div className="param-grid">
          <div className="param-item">
            <label>加载龄期 t₀ (天):</label>
            <input type="number" name="t0" value={params.t0} onChange={handleParamChange} min="1" max="1000" required />
          </div>
          <div className="param-item">
            <label>相对湿度 H (%):</label>
            <input type="number" name="H" value={params.H} onChange={handleParamChange} min="0" max="100" required />
          </div>
          <div className="param-item">
            <label>体积表面积比 VS:</label>
            <input type="number" name="VS" value={params.VS} onChange={handleParamChange} min="0" max="1000" required />
          </div>
          <div className="param-item">
            <label>体积表面积比修正系数 sPhi:</label>
            <input type="number" name="sPhi" value={params.sPhi} onChange={handleParamChange} min="0" max="1" step="0.01" required />
          </div>
          <div className="param-item">
            <label>水泥用量 Cc (kg/m³):</label>
            <input type="number" name="Cc" value={params.Cc} onChange={handleParamChange} min="0" max="1000" required />
          </div>
          <div className="param-item">
            <label>徐变参数 alpha:</label>
            <input type="number" name="alpha" value={params.alpha} onChange={handleParamChange} min="0" max="1" step="0.01" required />
          </div>
        </div>
        <button onClick={calculateCreep} className="calculate-btn" style={{width: '100%'}}>计算徐变系数</button>
        {isCalculated && (
          <button onClick={exportToCSV} className="calculate-btn" style={{ marginLeft: 16, background: 'var(--color-btn-success)' }}>导出CSV结果</button>
        )}
        <hr className="divider" />
        <h3 className="section-title">单点计算结果</h3>
        {/* 结果区 */}
        {isCalculated ? (
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
        ) : (
          <div style={{ color: '#888', marginBottom: 12 }}>请先输入参数并点击“计算徐变系数”</div>
        )}
        <hr className="divider" />
        <h3 className="section-title" style={{ marginTop: 40 }}>批量导入/批量计算</h3>
        <input type="file" accept=".csv,.xlsx,.xls" onChange={handleBatchFile} style={{ marginBottom: 16 }} />
        {batchResults.length > 0 && (
          <button onClick={exportBatchToCSV} className="calculate-btn" style={{ marginLeft: 16, background: 'var(--color-btn-success)' }}>导出批量结果</button>
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
              <h4 style={{ margin: '0 0 8px 0', color: '#1976d2' }}>📊 ACI209 批量计算结果</h4>
              <div style={{
                padding: '8px 12px',
                backgroundColor: '#e3f2fd',
                borderLeft: '4px solid #1976d2',
                marginBottom: '12px',
                borderRadius: '4px'
              }}>
                <strong>⚡ JavaScript 计算</strong>: 使用 JavaScript 引擎进行 ACI209 徐变模型批量计算<br/>
                <small>ACI209 是美国混凝土学会标准，广泛应用于工程实践。</small>
              </div>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                <li><strong>φ</strong>: 徐变系数，无量纲</li>
                <li style={{ color: '#1976d2' }}>💡 支持导出为 CSV 格式进行进一步分析</li>
                <li style={{ color: '#666' }}>📋 公式：φ = βt₀ × βRH × βVS × βs × βCc × βα × βc</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Aci209Calculator; 