import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

function mapSpecimenShape(shape) {
  const map = {
    '无限板': '1', 'infinite slab': '1',
    '无限圆柱': '2', 'infinite cylinder': '2',
    '无限正方形棱柱': '3', 'infinite square prism': '3',
    '球体': '4', 'sphere': '4',
    '立方体': '5', 'cube': '5'
  };
  return map[shape] || shape || '2';
}
function mapAggregateType(type) {
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
}
function calculateB4sSingle(row, cementParams, specimenShapeParams, aggregateParams) {
  const {
    t0, tPrime, T, h, fc, vS, cementType, aggregateType, specimenShape
  } = row;
  let hVal = parseFloat(h);
  if (hVal > 1) hVal = hVal / 100;
  const t0Num = parseFloat(t0);
  const tPrimeNum = parseFloat(tPrime);
  const TNum = parseFloat(T);
  const fcNum = parseFloat(fc);
  const vSNum = parseFloat(vS);
  const cem = cementParams[cementType] || cementParams['R'];
  const shape = specimenShapeParams[specimenShape] || { ks: 1.15 };
  const agg = aggregateParams[aggregateType] || { ks_tau_a: 0.59, ks_epsilon_a: 0.71 };
  if (isNaN(t0Num) || isNaN(fcNum)) return { ...row, J: '', epsilonSH: '', epsilonAU: '' };
  const E28 = (4734 * Math.sqrt(fcNum)) / 1000;
  const betaTh = Math.exp(4000 * (1/293 - 1/(TNum + 273)));
  const betaTs = betaTh;
  const betaTc = betaTh;
  const t0Tilde = t0Num * betaTh;
  const D = 2 * vSNum;
  const tau0 = cem.tau_s_cem * Math.pow(fcNum / 40, cem.s_tau_f);
  const tauSH = tau0 * agg.ks_tau_a * Math.pow(shape.ks * D, 2);
  const epsilon0 = cem.epsilon_s_cem * Math.pow(fcNum / 40, cem.s_epsilon_f);
  const E1 = E28 * Math.sqrt((7 * betaTh + 600 * betaTs) / (4 + (6/7)*(7 * betaTh + 600 * betaTs)));
  const E2 = E28 * Math.sqrt((t0Tilde + tauSH * betaTs) / (4 + (6/7)*(t0Tilde + tauSH * betaTs)));
  const epsilonSHInf = -epsilon0 * agg.ks_epsilon_a * (E1 / E2);
  const kh = hVal <= 0.98 ? 1 - Math.pow(hVal, 3) : 12.94 * (1 - hVal) - 0.2;
  const epsilonAUInf = -cem.epsilon_au_cem * Math.pow(fcNum / 40, cem.r_epsilon_f);
  const tauAU = cem.tau_au_cem * Math.pow(fcNum / 40, cem.r_tau_f);
  const alpha_s = 1.73;
  const r_t = -1.73;
  const tVal = parseFloat(row.t);
  if (isNaN(tVal) || tVal <= tPrimeNum) return { ...row, J: '', epsilonSH: '', epsilonAU: '' };
  const tTilde = (tVal - t0Num) * betaTs;
  const tPrimeHat = t0Tilde + (tPrimeNum - t0Num) * betaTs;
  const tHat = tPrimeHat + (tVal - tPrimeNum) * betaTc;
  const S = Math.tanh(Math.sqrt(tTilde / tauSH));
  const epsilonSH = epsilonSHInf * kh * S;
  const epsilonAU = epsilonAUInf * Math.pow(1 + Math.pow(tauAU / (tTilde + t0Tilde), alpha_s), r_t);
  const q1 = cem.p1 / (E28 * 1000);
  const q2 = cem.s2 * Math.pow(fcNum / 40, cem.s2f) / 1000;
  const q3 = cem.s3 * q2 * Math.pow(fcNum / 40, cem.s3f);
  const q4 = cem.s4 * Math.pow(fcNum / 40, cem.s4f) / 1000;
  const rHat = 1.7 * Math.pow(tPrimeHat, 0.12) + 8;
  const Z = Math.pow(tPrimeHat, -0.5) * Math.log(1 + Math.pow(tHat - tPrimeHat, 0.1));
  const Qf = 1 / (0.086 * Math.pow(tPrimeHat, 2/9) + 1.21 * Math.pow(tPrimeHat, 4/9));
  const Q = Qf * Math.pow(1 + Math.pow(Qf / Z, rHat), -1/rHat);
  const C0 = q2 * Q + q3 * Math.log(1 + Math.pow(tHat - tPrimeHat, 0.1)) + q4 * Math.log(tHat / tPrimeHat);
  const RT = Math.exp(4000 * (1/293 - 1/(TNum + 273)));
  const q5 = cem.s5 * Math.pow(fcNum / 40, cem.s5f) * Math.pow(Math.abs(kh * epsilonSHInf), cem.p5_epsilon) / 1000;
  const H = 1 - (1 - hVal) * Math.tanh(Math.sqrt((tHat - t0Tilde) / tauSH));
  const tPrime0 = Math.max(tPrimeHat, t0Tilde);
  const Hc = 1 - (1 - hVal) * Math.tanh(Math.sqrt((tPrime0 - t0Tilde) / tauSH));
  const Cd = tHat >= tPrime0 ? q5 * Math.sqrt(Math.exp(-cem.p5H * H) - Math.exp(-cem.p5H * Hc)) : 0;
  const J = q1 + RT * C0 + Cd;
  return { ...row, J, epsilonSH, epsilonAU };
}

function B4sCalculator() {
  const [params, setParams] = useState({
    t0: '',
    tPrime: 7,
    T: 20,
    h: 60,
    fc: '',
    vS: 0.5,
    cementType: 'R',
    specimenShape: '无限圆柱',
    aggregateType: '石英岩'
  });
  const [results, setResults] = useState([]);
  const [isCalculated, setIsCalculated] = useState(false);
  const [batchResults, setBatchResults] = useState([]);
  const [batchHeaders, setBatchHeaders] = useState([]);

  const cementParams = {
    'R': { tau_au_cem: 2.26, r_tau_f: 0.27, epsilon_au_cem: 78.2e-6, r_epsilon_f: 1.03, tau_s_cem: 0.027, s_tau_f: 0.21, epsilon_s_cem: 590e-6, s_epsilon_f: -0.51, p1: 0.70, p5_epsilon: -0.85, p5H: 8, s2: 14.2e-3, s3: 0.976, s4: 4.00e-3, s5: 1.54e-3, s2f: -1.58, s3f: -1.61, s4f: -1.16, s5f: -0.45 },
    'RS': { tau_au_cem: 2.26, r_tau_f: 0.27, epsilon_au_cem: 78.2e-6, r_epsilon_f: 1.03, tau_s_cem: 0.027, s_tau_f: 1.55, epsilon_s_cem: 830e-6, s_epsilon_f: -0.84, p1: 0.60, p5_epsilon: -0.85, p5H: 1, s2: 29.9e-3, s3: 0.976, s4: 4.00e-3, s5: 41.8e-3, s2f: -1.58, s3f: -1.61, s4f: -1.16, s5f: -0.45 },
    'SL': { tau_au_cem: 2.26, r_tau_f: 0.27, epsilon_au_cem: 78.2e-6, r_epsilon_f: 1.03, tau_s_cem: 0.032, s_tau_f: -1.84, epsilon_s_cem: 640e-6, s_epsilon_f: -0.69, p1: 0.80, p5_epsilon: -0.85, p5H: 8, s2: 11.2e-3, s3: 0.976, s4: 4.00e-3, s5: 150e-3, s2f: -1.58, s3f: -1.61, s4f: -1.16, s5f: -0.45 }
  };
  const specimenShapeParams = {
    '1': { ks: 1.00 },
    '2': { ks: 1.15 },
    '3': { ks: 1.25 },
    '4': { ks: 1.30 },
    '5': { ks: 1.55 }
  };
  const aggregateParams = {
    'Diabase': { ks_tau_a: 0.06, ks_epsilon_a: 0.76 },
    'Quartzite': { ks_tau_a: 0.59, ks_epsilon_a: 0.71 },
    'Limestone': { ks_tau_a: 1.80, ks_epsilon_a: 0.95 },
    'Sandstone': { ks_tau_a: 2.30, ks_epsilon_a: 1.60 },
    'Granite': { ks_tau_a: 4.00, ks_epsilon_a: 1.05 },
    'Quartz Diorite': { ks_tau_a: 15.0, ks_epsilon_a: 2.20 },
    'No Information': { ks_tau_a: 1.00, ks_epsilon_a: 1.00 }
  };

  const handleParamChange = (e) => {
    const { name, value } = e.target;
    setParams(prev => ({ ...prev, [name]: value }));
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
      const mappedRow = {
        ...row,
        cementType: row.cementType || row["水泥类型"] || 'R',
        aggregateType: mapAggregateType(row.aggregateType || row["骨料类型"]),
        specimenShape: mapSpecimenShape(row.specimenShape || row["试件形状"]),
        t0: row.t0 || row["加载龄期"],
        tPrime: row.tPrime || row["养护时间"],
        T: row.T || row["温度"],
        h: row.h || row["相对湿度"],
        fc: row.fc || row["混凝土强度"],
        vS: row.vS || row["体积表面积比"],
        t: row.t || row["实际龄期"] || row["t"]
      };
      return calculateB4sSingle(mappedRow, cementParams, specimenShapeParams, aggregateParams);
    });
    setBatchResults(results);
  };

  const calculate = () => {
    const { t0, tPrime, T, h, fc, vS, cementType, specimenShape, aggregateType } = params;
    const t0Num = parseFloat(t0);
    const tPrimeNum = parseFloat(tPrime);
    const TNum = parseFloat(T);
    const hNum = parseFloat(h);
    const fcNum = parseFloat(fc);
    const vSNum = parseFloat(vS);
    if (isNaN(t0Num) || isNaN(fcNum)) {
      alert("请填写加载龄期(t0)和混凝土强度(fc)的数值");
      return;
    }
    const cem = cementParams[cementType];
    const shape = specimenShapeParams[mapSpecimenShape(specimenShape)];
    const agg = aggregateParams[mapAggregateType(aggregateType)];
    const resultsData = [];
    const E28 = (4734 * Math.sqrt(fcNum)) / 1000;
    const betaTh = Math.exp(4000 * (1/293 - 1/(TNum + 273)));
    const betaTs = betaTh;
    const betaTc = betaTh;
    const t0Tilde = t0Num * betaTh;
    const D = 2 * vSNum;
    const tau0 = cem.tau_s_cem * Math.pow(fcNum / 40, cem.s_tau_f);
    const tauSH = tau0 * agg.ks_tau_a * Math.pow(shape.ks * D, 2);
    const epsilon0 = cem.epsilon_s_cem * Math.pow(fcNum / 40, cem.s_epsilon_f);
    const E1 = E28 * Math.sqrt((7 * betaTh + 600 * betaTs) / (4 + (6/7)*(7 * betaTh + 600 * betaTs)));
    const E2 = E28 * Math.sqrt((t0Tilde + tauSH * betaTs) / (4 + (6/7)*(t0Tilde + tauSH * betaTs)));
    const epsilonSHInf = -epsilon0 * agg.ks_epsilon_a * (E1 / E2);
    const kh = hNum <= 98 ? 1 - Math.pow(hNum/100, 3) : 12.94 * (1 - hNum/100) - 0.2;
    const epsilonAUInf = -cem.epsilon_au_cem * Math.pow(fcNum / 40, cem.r_epsilon_f);
    const tauAU = cem.tau_au_cem * Math.pow(fcNum / 40, cem.r_tau_f);
    const alpha_s = 1.73;
    const r_t = -1.73;
    for (let day = 0; day < 10000; day++) {
      const t = tPrimeNum + day + 1;
      const tTilde = (t - t0Num) * betaTs;
      const tPrimeHat = t0Tilde + (tPrimeNum - t0Num) * betaTs;
      const tHat = tPrimeHat + (t - tPrimeNum) * betaTc;
      const S = Math.tanh(Math.sqrt(tTilde / tauSH));
      const epsilonSH = epsilonSHInf * kh * S;
      const epsilonAU = epsilonAUInf * Math.pow(1 + Math.pow(tauAU / (tTilde + t0Tilde), alpha_s), r_t);
      const q1 = cem.p1 / (E28 * 1000);
      const q2 = cem.s2 * Math.pow(fcNum / 40, cem.s2f) / 1000;
      const q3 = cem.s3 * q2 * Math.pow(fcNum / 40, cem.s3f);
      const q4 = cem.s4 * Math.pow(fcNum / 40, cem.s4f) / 1000;
      const rHat = 1.7 * Math.pow(tPrimeHat, 0.12) + 8;
      const Z = Math.pow(tPrimeHat, -0.5) * Math.log(1 + Math.pow(tHat - tPrimeHat, 0.1));
      const Qf = 1 / (0.086 * Math.pow(tPrimeHat, 2/9) + 1.21 * Math.pow(tPrimeHat, 4/9));
      const Q = Qf * Math.pow(1 + Math.pow(Qf / Z, rHat), -1/rHat);
      const C0 = q2 * Q + q3 * Math.log(1 + Math.pow(tHat - tPrimeHat, 0.1)) + q4 * Math.log(tHat / tPrimeHat);
      const RT = Math.exp(4000 * (1/293 - 1/(TNum + 273)));
      const q5 = cem.s5 * Math.pow(fcNum / 40, cem.s5f) * Math.pow(Math.abs(kh * epsilonSHInf), cem.p5_epsilon) / 1000;
      const H = 1 - (1 - hNum/100) * Math.tanh(Math.sqrt((tHat - t0Tilde) / tauSH));
      const tPrime0 = Math.max(tPrimeHat, t0Tilde);
      const Hc = 1 - (1 - hNum/100) * Math.tanh(Math.sqrt((tPrime0 - t0Tilde) / tauSH));
      const Cd = tHat >= tPrime0 ? q5 * Math.sqrt(Math.exp(-cem.p5H * H) - Math.exp(-cem.p5H * Hc)) : 0;
      const J = q1 + RT * C0 + Cd;
      resultsData.push({
        t: t - tPrimeNum,
        J: J,
        epsilonSH: epsilonSH,
        epsilonAU: epsilonAU
      });
    }
    setResults(resultsData);
    setIsCalculated(true);
  };

  const exportCSV = () => {
    const csv = Papa.unparse(results.map(item => ({
      '时间(t-t₀)': item.t - 1,
      '徐变柔量J': item.J,
      '干燥收缩应变': item.epsilonSH,
      '自生收缩应变': item.epsilonAU
    })));
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'b4s_results.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportBatchToCSV = () => {
    if (!batchResults.length) return;
    const headers = [...batchHeaders, 'J', 'epsilonSH', 'epsilonAU'];
    const csvData = [headers];
    batchResults.forEach(row => {
      csvData.push(headers.map(h => row[h]));
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
      <h2 style={{textAlign: 'center', margin: '32px 0 18px 0'}}>B4S 徐变模型</h2>
      <div className="main-card">
        <h3 className="section-title">参数输入</h3>
        <div className="param-grid">
          <div className="param-item">
            <label>加载龄期 t0 (天):</label>
            <input type="number" name="t0" value={params.t0} onChange={handleParamChange} min="1" max="1000" />
          </div>
          <div className="param-item">
            <label>养护时间 t' (天):</label>
            <input type="number" name="tPrime" value={params.tPrime} onChange={handleParamChange} min="0" max="100" />
          </div>
          <div className="param-item">
            <label>温度 T (℃):</label>
            <input type="number" name="T" value={params.T} onChange={handleParamChange} min="-20" max="100" />
          </div>
          <div className="param-item">
            <label>相对湿度 h (%):</label>
            <input type="number" name="h" value={params.h} onChange={handleParamChange} min="0" max="100" />
          </div>
          <div className="param-item">
            <label>混凝土强度 fc (MPa):</label>
            <input type="number" name="fc" value={params.fc} onChange={handleParamChange} min="0" max="100" />
          </div>
          <div className="param-item">
            <label>体积表面比 vS:</label>
            <input type="number" name="vS" value={params.vS} onChange={handleParamChange} min="0" max="100" step="0.01" />
          </div>
          <div className="param-item">
            <label>水泥类型:</label>
            <select name="cementType" value={params.cementType} onChange={handleParamChange}>
              <option value="R">R</option>
              <option value="RS">RS</option>
              <option value="SL">SL</option>
            </select>
          </div>
          <div className="param-item">
            <label>试件形状:</label>
            <select name="specimenShape" value={params.specimenShape} onChange={handleParamChange}>
              <option value="无限板">无限板</option>
              <option value="无限圆柱">无限圆柱</option>
              <option value="无限正方形棱柱">无限正方形棱柱</option>
              <option value="球体">球体</option>
              <option value="立方体">立方体</option>
            </select>
          </div>
          <div className="param-item">
            <label>骨料类型:</label>
            <select name="aggregateType" value={params.aggregateType} onChange={handleParamChange}>
              <option value="玄武岩">玄武岩</option>
              <option value="石英岩">石英岩</option>
              <option value="石灰岩">石灰岩</option>
              <option value="砂岩">砂岩</option>
              <option value="花岗岩">花岗岩</option>
              <option value="石英闪长岩">石英闪长岩</option>
              <option value="无信息">无信息</option>
            </select>
          </div>
        </div>
        <button onClick={calculate} className="calculate-btn" style={{width: '100%'}}>计算徐变函数</button>
        <hr className="divider" />
        <h3 className="section-title">单点计算结果</h3>
        {isCalculated ? (
          <>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={results.slice(0, 1000)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="t" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="J" stroke="#8884d8" strokeWidth={2} dot={false} name="徐变函数J" />
                  <Line type="monotone" dataKey="epsilonSH" stroke="#82ca9d" strokeWidth={2} dot={false} name="收缩应变" />
                  <Line type="monotone" dataKey="epsilonAU" stroke="#ffc658" strokeWidth={2} dot={false} name="自生收缩应变" />
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
            <button onClick={exportCSV} className="calculate-btn" style={{ background: 'var(--color-btn-success)' }}>导出CSV结果</button>
          </>
        ) : (
          <div style={{ color: '#888', marginBottom: 12 }}>请先输入参数并点击“计算徐变函数”</div>
        )}
        <hr className="divider" />
        <h3 className="section-title">批量导入与计算</h3>
        <div style={{ marginBottom: '12px' }}>
          <input
            type="file"
            accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
            onChange={handleBatchFile}
            style={{ display: 'inline-block', marginRight: '10px' }}
          />
          <span style={{ fontSize: '14px', color: '#888' }}>导入Excel/CSV批量计算（h为百分比，自动转小数）</span>
          {batchResults.length > 0 && (
            <button onClick={exportBatchToCSV} className="calculate-btn" style={{ marginLeft: '20px', background: '#43a047' }}>
              导出批量结果CSV
            </button>
          )}
        </div>
        {batchResults.length > 0 && (
          <div className="result-section" style={{ boxShadow: 'none', background: 'none', padding: 0, margin: 0 }}>
            <div style={{ overflowX: 'auto' }}>
              <table className="batch-table">
                <thead>
                  <tr>
                    {batchHeaders.map(h => (
                      <th key={h}>{h}</th>
                    ))}
                    <th>J</th>
                    <th>epsilonSH</th>
                    <th>epsilonAU</th>
                  </tr>
                </thead>
                <tbody>
                  {batchResults.map((row, idx) => (
                    <tr key={idx}>
                      {batchHeaders.map(h => (
                        <td key={h}>{row[h]}</td>
                      ))}
                      <td>{row.J}</td>
                      <td>{row.epsilonSH}</td>
                      <td>{row.epsilonAU}</td>
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
                  backgroundColor: '#e3f2fd',
                  borderLeft: '4px solid #1976d2',
                  marginBottom: '12px',
                  borderRadius: '4px'
                }}>
                  <strong>⚡ JavaScript 计算</strong>: 使用 JavaScript 引擎进行 B4S 徐变模型批量计算<br/>
                  <small>B4S 是 B4 模型的简化版本，计算更快，适用于工程快速估算。</small>
                </div>
                <ul style={{ margin: 0, paddingLeft: 20 }}>
                  <li><strong>J</strong>: 徐变函数，单位 1/GPa</li>
                  <li><strong>εSH</strong>: 收缩应变，无量纲</li>
                  <li><strong>εAU</strong>: 自生收缩应变，无量纲</li>
                  <li style={{ color: '#1976d2' }}>💡 支持导出为 CSV 格式进行进一步分析</li>
                  <li style={{ color: '#666' }}>📋 基于 Bažant-Baweja B4S 简化模型</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default B4sCalculator; 