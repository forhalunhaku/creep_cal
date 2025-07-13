import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

function B4Calculator() {
  const [params, setParams] = useState({
    t0: '',
    tPrime: 7,
    T: 20,
    h: 60,
    fc: '',
    vS: 0.5,
    c: 350,
    wC: 0.5,
    aC: 4,
    cementType: 'R',
    aggregateType: '石英岩',
    specimenShape: '无限圆柱体'
  });
  // const [results, setResults] = useState(null); // 未使用，已移除
  const [chartData, setChartData] = useState(null);
  const [exportData, setExportData] = useState([]);
  const [isCalculated, setIsCalculated] = useState(false);
  const [batchResults, setBatchResults] = useState([]);
  const [batchHeaders, setBatchHeaders] = useState([]);

  const cementParams = {
    R: { τcem: 0.016, εcem: 360e-6, τaucem: 1, εaucem: 210e-6, p1: 0.70, p2: 58.6e-3, p3: 39.3e-3, p4: 3.4e-3, p5: 777e-6, p5H: 8.00, p2w: 3.00, p3a: -1.10, p3w: 0.40, p4a: -0.90, p4w: 2.45, p5a: -1, p5w: 0.78, p5_epsilon: -0.85, r_epsilon_a: -0.75, r_epsilon_w: -3.5, r_tau_w: 3, r_alpha: 1, r_t: -4.5, p_tau_a: -0.33, p_tau_w: -0.06, p_tau_c: -0.1, p_epsilon_a: -0.8, p_epsilon_w: 1.1, p_epsilon_c: 0.11 },
    RS: { τcem: 0.08, εcem: 860e-6, τaucem: 41, εaucem: -84.0e-6, p1: 0.60, p2: 17.4e-3, p3: 39.3e-3, p4: 3.4e-3, p5: 94.6e-6, p5H: 1.00, p2w: 3.00, p3a: -1.10, p3w: 0.40, p4a: -0.90, p4w: 2.45, p5a: -1, p5w: 0.78, p5_epsilon: -0.85, r_epsilon_a: -0.75, r_epsilon_w: -3.5, r_tau_w: 3, r_alpha: 1.4, r_t: -4.5, p_tau_a: -0.33, p_tau_w: -2.4, p_tau_c: -2.7, p_epsilon_a: -0.8, p_epsilon_w: -0.27, p_epsilon_c: 0.11 },
    SL: { τcem: 0.01, εcem: 410e-6, τaucem: 1, εaucem: 0.00e-6, p1: 0.8, p2: 40.5e-3, p3: 39.3e-3, p4: 3.4e-3, p5: 496e-6, p5H: 8.00, p2w: 3.00, p3a: -1.10, p3w: 0.40, p4a: -0.90, p4w: 2.45, p5a: -1, p5w: 0.78, p5_epsilon: -0.85, r_epsilon_a: -0.75, r_epsilon_w: -3.5, r_tau_w: 3, r_alpha: 1, r_t: -4.5, p_tau_a: -0.33, p_tau_w: 3.55, p_tau_c: 3.8, p_epsilon_a: -0.8, p_epsilon_w: 1, p_epsilon_c: 0.11 }
  };
  const aggregateParams = {
    '辉绿岩': { ksτa: 0.06, ksεa: 0.76 },
    '石英岩': { ksτa: 0.59, ksεa: 0.71 },
    '石灰岩': { ksτa: 1.80, ksεa: 0.95 },
    '砂岩': { ksτa: 2.30, ksεa: 1.60 },
    '花岗岩': { ksτa: 4.00, ksεa: 1.05 },
    '石英闪长岩': { ksτa: 15.0, ksεa: 2.20 },
    '无信息': { ksτa: 1.00, ksεa: 1.00 }
  };
  const shapeParams = {
    '无限平板': { ks: 1.00 },
    '无限圆柱体': { ks: 1.15 },
    '无限方柱体': { ks: 1.25 },
    '球体': { ks: 1.30 },
    '立方体': { ks: 1.55 }
  };

  const handleParamChange = (e) => {
    const { name, value } = e.target;
    setParams(prev => ({ ...prev, [name]: value }));
  };

  const calculateB4 = () => {
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
    const { tPrime, T, h, vS, c, wC, aC, cementType, aggregateType, specimenShape } = params;
    const cement = cementParams[cementType];
    const aggregate = aggregateParams[aggregateType];
    const shape = shapeParams[specimenShape];
    const D = 2 * vS;
    const E28 = (4734 * Math.sqrt(fc)) / 1000;
    const betaTh = Math.exp(4000 * (1/293 - 1/(T + 273)));
    const betaTs = betaTh;
    const betaTc = betaTh;
    const t0Tilde = t0 * betaTh;
    const tPrimeHat = t0 * betaTh + (tPrime - t0) * betaTs;
    const tau0 = cement.τcem * Math.pow(aC/6, cement.p_tau_a) * Math.pow(wC/0.38, cement.p_tau_w) * Math.pow((6.5 * c)/2350, cement.p_tau_c);
    const tauSH = tau0 * aggregate.ksτa * Math.pow(shape.ks * D, 2);
    const epsilon0 = cement.εcem * Math.pow(aC/6, cement.p_epsilon_a) * Math.pow(wC/0.38, cement.p_epsilon_w) * Math.pow((6.5 * c)/2350, cement.p_epsilon_c);
    const E1 = E28 * Math.sqrt((7 * betaTh + 600 * betaTs) / (4 + (6/7)*(7 * betaTh + 600 * betaTs)));
    const E2 = E28 * Math.sqrt((t0Tilde + tauSH * betaTs) / (4 + (6/7)*(t0Tilde + tauSH * betaTs)));
    const epsilonSHInf = -epsilon0 * aggregate.ksεa * (E1 / E2);
    const hDecimal = h / 100;
    const kh = hDecimal <= 0.98 ? 1 - Math.pow(hDecimal, 3) : 12.94 * (1 - hDecimal) - 0.2;
    const days = 10000;
    const dataPoints = [];
    const exportDataPoints = [];
    let epsilonSH;
    const startDay = parseInt(tPrime) + 1;
    for (let t = startDay; t <= startDay + days - 1; t++) {
      const tTilde = (t - t0) * betaTs;
      const tHat = tPrimeHat + (t - tPrime) * betaTc;
      const S = Math.tanh(Math.sqrt(tTilde / tauSH));
      epsilonSH = epsilonSHInf * kh * S;
      const q1 = cement.p1 / (E28 * 1000);
      const q2 = (cement.p2 * Math.pow(wC/0.38, cement.p2w)) / 1000;
      const q3 = cement.p3 * q2 * Math.pow(aC/6, cement.p3a) * Math.pow(wC/0.38, cement.p3w);
      const q4 = (cement.p4 * Math.pow(aC/6, cement.p4a) * Math.pow(wC/0.38, cement.p4w)) / 1000;
      const rHat = 1.7 * Math.pow(tPrimeHat, 0.12) + 8;
      const Z = Math.pow(tPrimeHat, -0.5) * Math.log(1 + Math.pow(tHat - tPrimeHat, 0.1));
      const Qf = 1 / (0.086 * Math.pow(tPrimeHat, 2/9) + 1.21 * Math.pow(tPrimeHat, 4/9));
      const Q = Qf * Math.pow(1 + Math.pow(Qf / Z, rHat), -1/rHat);
      const C0 = q2 * Q + q3 * Math.log(1 + Math.pow(tHat - tPrimeHat, 0.1)) + q4 * Math.log(tHat / tPrimeHat);
      const RT = Math.exp(4000 * (1/293 - 1/(T + 273)));
      const q5 = (cement.p5 * Math.pow(aC/6, cement.p5a) * Math.pow(wC/0.38, cement.p5w) * Math.pow(Math.abs(kh * epsilonSHInf), cement.p5_epsilon)) / 1000;
      const H = 1 - (1 - hDecimal) * Math.tanh(Math.sqrt((tHat - t0Tilde) / tauSH));
      const t0Prime = Math.max(tPrimeHat, t0Tilde);
      const Hc = 1 - (1 - hDecimal) * Math.tanh(Math.sqrt((t0Prime - t0Tilde) / tauSH));
      const Cd = tHat >= t0Prime ? q5 * Math.sqrt(Math.exp(-cement.p5H * H) - Math.exp(-cement.p5H * Hc)) : 0;
      const J = q1 + RT * C0 + Cd;
      const epsilonAUInfinity = -cement.εaucem * Math.pow(aC/6, cement.r_epsilon_a) * Math.pow(wC/0.38, cement.r_epsilon_w);
      const tauAU = cement.τaucem * Math.pow(wC/0.38, cement.r_tau_w);
      const alpha = cement.r_alpha * (wC/0.38);
      const epsilonAU = epsilonAUInfinity * Math.pow(1 + Math.pow(tauAU / (tTilde + t0Tilde), alpha), cement.r_t);
      dataPoints.push({ t: t - parseInt(tPrime), J, epsilonSH, epsilonAU });
      exportDataPoints.push({
        '时间(t-tPrime)': t - parseInt(tPrime),
        '徐变函数J': J,
        '收缩应变': epsilonSH,
        '自生收缩应变': epsilonAU
      });
    }
    // setResults({ epsilonSH, J: dataPoints[dataPoints.length - 1].J }); // 已移除
    setChartData(dataPoints);
    setExportData(exportDataPoints);
    setIsCalculated(true);
  };

  const calculateB4Single = (row) => {
    const {
      cementType, t, tPrime, t0, T, h, fc, vS, c, wC, aC, specimenShape, aggregateType
    } = row;
    const hDecimal = parseFloat(h) / 100;
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
    const cement = cementParams[paramsRow.cementType];
    let aggType = paramsRow.aggregateType;
    if (aggType === 'Quartz') aggType = '石英岩';
    if (aggType === 'No Information') aggType = '无信息';
    if (aggType === 'Limestone') aggType = '石灰岩';
    if (aggType === 'Granite') aggType = '花岗岩';
    if (aggType === 'Sandstone') aggType = '砂岩';
    if (aggType === 'Dolerite') aggType = '辉绿岩';
    if (aggType === 'Quartz Diorite') aggType = '石英闪长岩';
    const aggregate = aggregateParams[aggType] || { ksτa: 1.00, ksεa: 1.00 };
    let shapeKey = paramsRow.specimenShape;
    if (shapeKey === 'infinite slab') shapeKey = '无限平板';
    if (shapeKey === 'infinite cylinder') shapeKey = '无限圆柱体';
    if (shapeKey === 'infinite square prism') shapeKey = '无限方柱体';
    if (shapeKey === 'sphere') shapeKey = '球体';
    if (shapeKey === 'cube') shapeKey = '立方体';
    const shape = shapeParams[shapeKey] || { ks: 1.00 };
    const tau0 = cement.τcem * Math.pow(paramsRow.aC/6, cement.p_tau_a) * Math.pow(paramsRow.wC/0.38, cement.p_tau_w) * Math.pow((6.5 * paramsRow.c)/2350, cement.p_tau_c);
    const tauSH = tau0 * aggregate.ksτa * Math.pow(shape.ks * D, 2);
    const epsilon0 = cement.εcem * Math.pow(paramsRow.aC/6, cement.p_epsilon_a) * Math.pow(paramsRow.wC/0.38, cement.p_epsilon_w) * Math.pow((6.5 * paramsRow.c)/2350, cement.p_epsilon_c);
    const E1 = E28 * Math.sqrt((7 * betaTh + 600 * betaTs) / (4 + (6/7)*(7 * betaTh + 600 * betaTs)));
    const E2 = E28 * Math.sqrt((t0Tilde + tauSH * betaTs) / (4 + (6/7)*(t0Tilde + tauSH * betaTs)));
    const epsilonSHInf = -epsilon0 * aggregate.ksεa * (E1 / E2);
    const kh = hDecimal <= 0.98 ? 1 - Math.pow(hDecimal, 3) : 12.94 * (1 - hDecimal) - 0.2;
    const tVal = parseFloat(t);
    const tPrimeVal = parseFloat(tPrime);
    const tCreep = tVal - tPrimeVal;
    if (isNaN(tCreep) || tCreep <= 0) return { ...row, J: '', epsilonSH: '', epsilonAU: '' };
    const tCalc = tPrimeVal + tCreep;
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
    return {
      ...row,
      J: J,
      epsilonSH: epsilonSH,
      epsilonAU: epsilonAU
    };
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
      const res = calculateB4Single(row);
      return {
        ...row,
        J: res.J,
        epsilonSH: res.epsilonSH,
        epsilonAU: res.epsilonAU
      };
    });
    setBatchResults(results);
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
    link.setAttribute('download', 'b4_batch_results.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToCSV = () => {
    if (!exportData.length) return;
    const csvData = [['时间(t-tPrime)', '徐变函数J', '收缩应变', '自生收缩应变']];
    exportData.forEach(item => {
      csvData.push([
        item['时间(t-tPrime)'],
        item['徐变函数J'].toFixed(6),
        item['收缩应变'].toExponential(4),
        item['自生收缩应变'].toExponential(4)
      ]);
    });
    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'b4_creep_results.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <h2 style={{textAlign: 'center', margin: '32px 0 18px 0'}}>B4 徐变模型</h2>
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
            <label>水泥用量 c (kg/m³):</label>
            <input type="number" name="c" value={params.c} onChange={handleParamChange} min="0" max="1000" />
          </div>
          <div className="param-item">
            <label>水灰比 wC:</label>
            <input type="number" name="wC" value={params.wC} onChange={handleParamChange} min="0.2" max="1" step="0.01" />
          </div>
          <div className="param-item">
            <label>骨料水泥比 aC:</label>
            <input type="number" name="aC" value={params.aC} onChange={handleParamChange} min="0" max="10" />
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
            <label>骨料类型:</label>
            <select name="aggregateType" value={params.aggregateType} onChange={handleParamChange}>
              {Object.keys(aggregateParams).map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div className="param-item">
            <label>试件形状:</label>
            <select name="specimenShape" value={params.specimenShape} onChange={handleParamChange}>
              {Object.keys(shapeParams).map(shape => (
                <option key={shape} value={shape}>{shape}</option>
              ))}
            </select>
          </div>
        </div>
        <button onClick={calculateB4} className="calculate-btn" style={{width: '100%'}}>计算徐变函数</button>
        <hr className="divider" />
        <h3 className="section-title">单点计算结果</h3>
        {isCalculated ? (
          <>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={chartData.slice(0, 1000)}>
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
              {chartData.length > 1000 && (
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
            <button onClick={exportToCSV} className="calculate-btn" style={{ background: 'var(--color-btn-success)' }}>导出CSV结果</button>
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
                <h4 style={{ margin: '0 0 8px 0', color: '#1976d2' }}>📊 B4 批量计算结果</h4>
                <div style={{
                  padding: '8px 12px',
                  backgroundColor: '#e3f2fd',
                  borderLeft: '4px solid #1976d2',
                  marginBottom: '12px',
                  borderRadius: '4px'
                }}>
                  <strong>⚡ JavaScript 计算</strong>: 使用 JavaScript 引擎进行 B4 徐变模型批量计算<br/>
                  <small>B4 模型由 Bažant 和 Baweja 提出，适用于普通混凝土和高性能混凝土。</small>
                </div>
                <ul style={{ margin: 0, paddingLeft: 20 }}>
                  <li><strong>J</strong>: 徐变函数，单位 1/GPa</li>
                  <li><strong>εSH</strong>: 收缩应变，无量纲</li>
                  <li><strong>εAU</strong>: 自生收缩应变，无量纲</li>
                  <li style={{ color: '#1976d2' }}>💡 支持导出为 CSV 格式进行进一步分析</li>
                  <li style={{ color: '#666' }}>📋 基于 Bažant-Baweja B4 模型</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default B4Calculator; 