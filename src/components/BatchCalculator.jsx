import React, { useState } from 'react';
import Papa from 'papaparse';
import readXlsxFile from 'read-excel-file/browser';
import {
  ScatterChart, Scatter, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { aci209Single, mc2010Single, b4Single, b4sSingle } from '../math/creepModels';
import CustomSelect from './ui/CustomSelect';

// ─── Model Registry ──────────────────────────────────────────────────────────
const MODELS = [
  { id: 'aci209', name: 'ACI 209R-92',  resultKeys: ['result_phi'],          labels: ['φ (Creep Coeff.)'],  req: 't0, H, VS, sphi, Cc, alpha, t' },
  { id: 'mc2010', name: 'fib MC 2010',  resultKeys: ['result_phi'],          labels: ['φ (Creep Coeff.)'],  req: 'fcm, RH, t0, Ac, u, T, Cs, t' },
  { id: 'b4',     name: 'B4 Model',     resultKeys: ['result_J', 'result_epsilonSH'], labels: ['J (1/GPa)', 'εsh (Shrinkage)'], req: 't0, tPrime, T, h, fc, vS, c, wC, aC, cementType, aggregateType, specimenShape, t' },
  { id: 'b4s',    name: 'B4S Model',    resultKeys: ['result_J', 'result_epsilonSH'], labels: ['J (1/GPa)', 'εsh (Shrinkage)'], req: 't0, tPrime, T, h, fc, vS, cementType, specimenShape, aggregateType, t' },
];

const SAMPLE_DATA = {
  aci209: [35, 90, 180, 365, 730, 1460, 3650, 7300, 10000].map(t => ({
    t0: 28, H: 70, VS: 100, sphi: 0.5, Cc: 350, alpha: 0.08, t
  })),
  mc2010: [35, 90, 180, 365, 730, 1460, 3650, 7300, 10000].map(t => ({
    fcm: 38, RH: 70, t0: 28, Ac: 90000, u: 1200, T: 20, Cs: '42.5R', t
  })),
  b4: [35, 90, 180, 365, 730, 1460, 3650, 7300, 10000].map(t => ({
    t0: 7, tPrime: 28, T: 20, h: 0.7, fc: 40, vS: 100, c: 350, wC: 0.42,
    aC: 5.8, cementType: 'R', aggregateType: 'Quartzite', specimenShape: '2', t
  })),
  b4s: [35, 90, 180, 365, 730, 1460, 3650, 7300, 10000].map(t => ({
    t0: 7, tPrime: 28, T: 20, h: 0.7, fc: 40, vS: 100,
    cementType: 'R', specimenShape: '2', aggregateType: 'Quartzite', t
  })),
};

// ─── Computation per row ─────────────────────────────────────────────────────
function computeRow(modelId, row) {
  if (modelId === 'aci209') {
    const v = aci209Single(row);
    return { result_phi: isNaN(v) ? 'NaN' : v.toFixed(4) };
  }
  if (modelId === 'mc2010') {
    const v = mc2010Single(row);
    return { result_phi: isNaN(v) ? 'NaN' : v.toFixed(4) };
  }
  if (modelId === 'b4') {
    const { J, epsilonSH } = b4Single(row);
    return {
      result_J:          isNaN(J) ? 'NaN' : J.toFixed(6),
      result_epsilonSH:  isNaN(epsilonSH) ? 'NaN' : epsilonSH.toFixed(6),
    };
  }
  if (modelId === 'b4s') {
    const { J, epsilonSH } = b4sSingle(row);
    return {
      result_J:         isNaN(J) ? 'NaN' : J.toFixed(6),
      result_epsilonSH: isNaN(epsilonSH) ? 'NaN' : epsilonSH.toFixed(6),
    };
  }
  return {};
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function BatchCalculator() {
  const [activeModel, setActiveModel] = useState('aci209');
  const [batchResults, setBatchResults] = useState([]);
  const [batchHeaders, setBatchHeaders] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [batchError, setBatchError] = useState('');

  // Visualization state
  const [xKey, setXKey]           = useState('');
  const [yKey, setYKey]           = useState('result_phi');
  const [chartType, setChartType] = useState('scatter'); // 'scatter' | 'line'

  const model = MODELS.find(m => m.id === activeModel);

  const handleBatchFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsProcessing(true);
    setBatchError('');
    const name = file.name.toLowerCase();
    if (name.endsWith('.csv')) {
      Papa.parse(file, {
        header: true, skipEmptyLines: true,
        complete: (r) => processData(r.data),
        error: (error) => {
          setBatchError(`Could not parse CSV: ${error.message}`);
          setIsProcessing(false);
        },
      });
    } else if (name.endsWith('.xlsx')) {
      try {
        const rows = await readXlsxFile(file);
        const [headerRow, ...dataRows] = rows;
        const headers = (headerRow || []).map((value) => String(value ?? '').trim());
        if (!headers.some(Boolean)) {
          setBatchError('Excel file needs a header row.');
          setIsProcessing(false);
          return;
        }
        const records = dataRows
          .filter((row) => row.some((value) => value !== null && value !== undefined && value !== ''))
          .map((row) => Object.fromEntries(headers.map((header, index) => [header || `column_${index + 1}`, row[index] ?? ''])));
        processData(records);
      } catch (error) {
        setBatchError(`Could not parse XLSX: ${error.message}`);
        setIsProcessing(false);
      }
    } else if (name.endsWith('.xls')) {
      setBatchError('Legacy .xls files are not supported. Please save the file as .xlsx or CSV.');
      setIsProcessing(false);
    } else {
      setBatchError('Unsupported format. Use CSV or XLSX.');
      setIsProcessing(false);
    }
  };

  const processData = (data, preferredXKey = 't') => {
    if (!data?.length) {
      setBatchError('File is empty. Please upload a CSV or Excel file with column headers.');
      setIsProcessing(false);
      return;
    }
    const inputHeaders = Object.keys(data[0]);
    setBatchHeaders(inputHeaders);

    setTimeout(() => {
      const results = data.map(row => ({ ...row, ...computeRow(activeModel, row) }));
      setBatchResults(results);
      setBatchError('');
      // Default axis selection
      const firstResult = model.resultKeys[0];
      setYKey(firstResult);
      setXKey(inputHeaders.includes(preferredXKey) ? preferredXKey : (inputHeaders[0] || ''));
      setIsProcessing(false);
    }, 100);
  };

  const loadSampleDataset = () => {
    setIsProcessing(true);
    setBatchError('');
    processData(SAMPLE_DATA[activeModel], 't');
  };

  const exportCSV = () => {
    if (!batchResults.length) return;
    const allKeys = [...batchHeaders, ...model.resultKeys];
    const csv = Papa.unparse(batchResults.map(r => Object.fromEntries(allKeys.map(k => [k, r[k] ?? '']))));
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${activeModel}_batch_results.csv`;
    link.click();
  };

  const downloadTemplate = () => {
    const cols = model.req.split(', ');
    const csv = Papa.unparse([cols, cols.map(() => '0')]);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${activeModel}_template.csv`;
    link.click();
  };

  // Chart data: only rows where both keys are numeric
  const chartData = batchResults
    .map(r => ({ x: parseFloat(r[xKey]), y: parseFloat(r[yKey]) }))
    .filter(d => !isNaN(d.x) && !isNaN(d.y));

  const allResultKeys = model.resultKeys;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in relative z-10">
      <header className="mb-12">
        <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tight text-on-background mb-4">
          Data pipeline <span className="text-primary">matrix</span>
        </h1>
        <p className="text-on-surface-variant text-base md:text-lg max-w-[65ch] leading-relaxed">
          Import CSV or Excel datasets, compute model outputs in batch, then inspect and export the resulting table.
        </p>
      </header>

      {/* Config panel */}
      <div className="glass-card p-5 md:p-8 rounded-lg border border-outline-variant/30 relative overflow-hidden">
        <div className="absolute right-[-8rem] top-[-8rem] h-64 w-72 rotate-12 bg-primary/8 blur-3xl pointer-events-none"></div>
        <h3 className="font-headline text-xl font-semibold tracking-tight text-primary mb-6">Pipeline configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="min-w-0">
            <label className="block text-xs font-label uppercase text-outline tracking-[0.16em] mb-2">Target algorithm</label>
            <CustomSelect
              name="activeModel"
              value={activeModel}
              onChange={(e) => {
                setActiveModel(e.target.value);
                setBatchResults([]);
                setBatchHeaders([]);
                setBatchError('');
                setXKey('');
                setYKey(MODELS.find(m => m.id === e.target.value)?.resultKeys[0] || '');
              }}
              options={MODELS.map(m => ({ value: m.id, label: m.name }))}
            />
          </div>
          <div>
            <label className="block text-xs font-label uppercase text-outline tracking-[0.16em] mb-2">Required columns</label>
            <div className="w-full bg-surface-container border border-outline-variant/20 text-on-surface-variant rounded-md px-4 py-3 font-mono text-xs break-words leading-relaxed">
              {model.req}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-4 items-center border-t border-outline-variant/20 pt-8 mt-4">
          <label className="px-6 py-3 rounded-md bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant/50 cursor-pointer transition-all active:scale-[0.98] flex items-center gap-2">
            <span className="material-symbols-outlined text-primary" aria-hidden="true">upload_file</span>
            <span className="font-label tracking-[0.14em] text-sm text-on-surface">{isProcessing ? 'Processing file' : 'Upload CSV / XLSX'}</span>
            <input type="file" className="hidden" accept=".csv,.xlsx" onChange={handleBatchFile} disabled={isProcessing} />
          </label>
          <button onClick={downloadTemplate} className="px-6 py-3 rounded-md text-primary hover:bg-primary/10 border border-primary/20 transition-all active:scale-[0.98] flex items-center gap-2">
            <span className="material-symbols-outlined text-sm" aria-hidden="true">download</span>
            <span className="font-label tracking-[0.14em] text-sm uppercase">Download template</span>
          </button>
          <button onClick={loadSampleDataset} disabled={isProcessing} className="px-6 py-3 rounded-md bg-primary/10 text-primary hover:bg-primary/15 border border-primary/25 transition-all active:scale-[0.98] flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-60">
            <span className="material-symbols-outlined text-sm" aria-hidden="true">auto_graph</span>
            <span className="font-label tracking-[0.14em] text-sm uppercase">Load sample dataset</span>
          </button>
        </div>
        {batchError && (
          <div className="mt-5 rounded-md border border-error/30 bg-error/10 px-4 py-3 text-sm text-on-error-container">
            {batchError}
          </div>
        )}
      </div>

      {/* Results */}
      {batchResults.length === 0 && !batchError && (
        <div className="glass-card rounded-lg border border-outline-variant/30 p-6 md:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-[10px] font-label uppercase tracking-[0.18em] text-primary mb-2">Ready for dataset</div>
              <h3 className="font-headline text-2xl font-semibold tracking-tight text-on-background">Upload a table to generate the output matrix</h3>
              <p className="mt-3 max-w-[62ch] text-sm leading-relaxed text-on-surface-variant">
                Use the template for exact column names, or load the sample dataset to preview the computed table and chart immediately.
              </p>
            </div>
            <div className="grid min-w-52 grid-cols-2 gap-3 text-center">
              <div className="metric-tile rounded-md border border-outline-variant/20 bg-surface-container-low p-3">
                <div className="font-mono text-lg text-primary">{model.resultKeys.length}</div>
                <div className="mt-1 text-[10px] uppercase tracking-[0.14em] text-outline">outputs</div>
              </div>
              <div className="metric-tile rounded-md border border-outline-variant/20 bg-surface-container-low p-3">
                <div className="font-mono text-lg text-secondary">{model.req.split(', ').length}</div>
                <div className="mt-1 text-[10px] uppercase tracking-[0.14em] text-outline">columns</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {batchResults.length > 0 && (
        <>
          {/* Table */}
          <div className="glass-card rounded-lg border border-outline-variant/30 overflow-hidden animate-fade-in-up">
            <div className="bg-surface-container p-4 border-b border-outline-variant/20 flex justify-between items-center flex-wrap gap-3">
              <h3 className="font-headline text-lg tracking-tight text-on-background">
                Output matrix <span className="text-outline text-sm ml-2">({batchResults.length} records)</span>
              </h3>
              <button onClick={exportCSV} className="px-5 py-2 rounded-md bg-primary/10 text-primary hover:bg-primary/15 border border-primary/30 transition-all font-label tracking-[0.14em] text-xs uppercase active:scale-[0.98]">
                Export CSV
              </button>
            </div>
            <div className="overflow-x-auto max-h-[400px]">
              <table className="w-full text-left border-collapse min-w-max">
                <thead className="sticky top-0 bg-surface-container-high shadow-md z-10">
                  <tr>
                    {batchHeaders.map(h => (
                      <th key={h} className="p-4 text-xs font-label uppercase tracking-wider text-outline border-b border-outline-variant/20 whitespace-nowrap">{h}</th>
                    ))}
                    {allResultKeys.map((k, i) => (
                      <th key={k} className="p-4 text-xs font-label uppercase tracking-wider text-primary border-b border-outline-variant/20 whitespace-nowrap bg-primary/5">
                        {model.labels[i] || k}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {batchResults.slice(0, 100).map((row, idx) => (
                    <tr key={idx} className="hover:bg-surface-container/50 transition-colors group">
                      {batchHeaders.map(h => (
                        <td key={h} className="p-4 border-b border-outline-variant/10 text-on-surface-variant font-mono text-sm group-hover:text-on-surface">{row[h]}</td>
                      ))}
                      {allResultKeys.map(k => (
                        <td key={k} className="p-4 border-b border-outline-variant/10 text-primary font-mono text-sm bg-primary/5 font-bold">{row[k]}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {batchResults.length > 100 && (
              <div className="p-4 text-center text-outline text-xs tracking-wider uppercase bg-surface-container/30">
                Showing 100 of {batchResults.length} records. Export to view full dataset.
              </div>
            )}
          </div>

          {/* Visualization */}
          <div className="motion-card glass-card rounded-lg border border-outline-variant/30 p-5 md:p-8">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
              <h3 className="font-headline text-xl tracking-tight text-on-background">
                Result <span className="text-primary italic">visualizer</span>
              </h3>
              <div className="flex gap-2 flex-wrap items-center">
                {/* Chart type toggle */}
                {['scatter', 'line'].map(t => (
                  <button key={t} onClick={() => setChartType(t)}
                    className={`px-3 py-1.5 rounded text-[10px] font-label uppercase tracking-widest border transition-all ${
                      chartType === t ? 'text-primary border-primary/40 bg-primary/10' : 'text-neutral-500 border-outline-variant/20 hover:bg-surface-container-high hover:text-on-surface'
                    }`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Axis selectors */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="text-[10px] font-label uppercase text-outline tracking-wider block mb-2">X Axis (Input Parameter)</label>
                <CustomSelect
                  name="xKey"
                  value={xKey}
                  onChange={e => setXKey(e.target.value)}
                  options={batchHeaders.map(h => ({ value: h, label: h }))}
                />
              </div>
              <div>
                <label className="text-[10px] font-label uppercase text-outline tracking-wider block mb-2">Y Axis (Result)</label>
                <CustomSelect
                  name="yKey"
                  value={yKey}
                  onChange={e => setYKey(e.target.value)}
                  options={allResultKeys.map((k, i) => ({ value: k, label: model.labels[i] || k }))}
                />
              </div>
            </div>

            {chartData.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-neutral-600 gap-3">
                <span className="material-symbols-outlined text-5xl" aria-hidden="true">scatter_plot</span>
                <p className="font-label text-xs uppercase tracking-[0.16em]">Select numeric X column to visualize</p>
              </div>
            ) : (
              <div className="chart-stage" style={{ width: '100%', height: 380 }}>
                <ResponsiveContainer width="100%" height={380}>
                  {chartType === 'scatter' ? (
                    <ScatterChart margin={{ top: 10, right: 18, left: 12, bottom: 30 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#d2d2d7" />
                      <XAxis dataKey="x" name={xKey} stroke="#6e6e73" tick={{ fill: '#6e6e73', fontSize: 11 }}
                        tickCount={6} minTickGap={28}
                        label={{ value: xKey, position: 'insideBottomRight', offset: -8, fill: '#6e6e73', fontSize: 10 }} type="number" />
                      <YAxis dataKey="y" name={yKey} stroke="#6e6e73" tick={{ fill: '#6e6e73', fontSize: 11 }} width={48}
                        label={{ value: yKey, angle: -90, position: 'insideLeft', fill: '#6e6e73', fontSize: 10 }} />
                      <Tooltip
                        cursor={{ strokeDasharray: '3 3' }}
                        contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #d2d2d7', borderRadius: '8px', color: '#1d1d1f' }}
                        formatter={(v, n) => [v?.toFixed(5), n]}
                      />
                      <Scatter
                        data={chartData}
                        fill="#0071e3"
                        fillOpacity={0.7}
                        isAnimationActive="auto"
                        animationDuration={900}
                        animationEasing="spring"
                      />
                    </ScatterChart>
                  ) : (
                    <LineChart data={chartData} margin={{ top: 10, right: 18, left: 12, bottom: 30 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#d2d2d7" />
                      <XAxis dataKey="x" stroke="#6e6e73" tick={{ fill: '#6e6e73', fontSize: 11 }}
                        tickCount={6} minTickGap={28}
                        label={{ value: xKey, position: 'insideBottomRight', offset: -8, fill: '#6e6e73', fontSize: 10 }} />
                      <YAxis stroke="#6e6e73" tick={{ fill: '#6e6e73', fontSize: 11 }} width={48}
                        label={{ value: yKey, angle: -90, position: 'insideLeft', fill: '#6e6e73', fontSize: 10 }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #d2d2d7', borderRadius: '8px', color: '#1d1d1f' }}
                        formatter={(v) => [v?.toFixed(5), yKey]}
                      />
                      <Line
                        type="monotone"
                        dataKey="y"
                        stroke="#0071e3"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 5, stroke: '#0071e3', strokeWidth: 2, fill: '#ffffff' }}
                        isAnimationActive="auto"
                        animationDuration={1200}
                        animationEasing="ease-out"
                      />
                    </LineChart>
                  )}
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
