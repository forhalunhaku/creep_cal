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

  const processData = (data) => {
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
      setXKey(inputHeaders[0] || '');
      setIsProcessing(false);
    }, 100);
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
          <div>
            <label className="block text-xs font-label uppercase text-outline tracking-[0.16em] mb-2">Target algorithm</label>
            <CustomSelect
              name="activeModel"
              value={activeModel}
              onChange={(e) => { setActiveModel(e.target.value); setBatchResults([]); }}
              options={MODELS.map(m => ({ value: m.id, label: m.name }))}
            />
          </div>
          <div>
            <label className="block text-xs font-label uppercase text-outline tracking-[0.16em] mb-2">Required columns</label>
            <div className="w-full bg-surface-container border border-outline-variant/20 text-on-surface-variant rounded-md px-4 py-3 font-mono text-xs break-all leading-relaxed">
              {model.req}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-4 items-center border-t border-outline-variant/20 pt-8 mt-4">
          <label className="px-6 py-3 rounded-md bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant/50 cursor-pointer transition-all active:scale-[0.98] flex items-center gap-2">
            <span className="material-symbols-outlined text-primary" aria-hidden="true">upload_file</span>
            <span className="font-label tracking-[0.14em] text-sm text-on-surface">{isProcessing ? 'PROCESSING...' : 'UPLOAD SET (.CSV / .XLSX)'}</span>
            <input type="file" className="hidden" accept=".csv,.xlsx" onChange={handleBatchFile} disabled={isProcessing} />
          </label>
          <button onClick={downloadTemplate} className="px-6 py-3 rounded-md text-primary hover:bg-primary/10 border border-primary/20 transition-all active:scale-[0.98] flex items-center gap-2">
            <span className="material-symbols-outlined text-sm" aria-hidden="true">download</span>
            <span className="font-label tracking-[0.14em] text-sm uppercase">Extract template</span>
          </button>
        </div>
        {batchError && (
          <div className="mt-5 rounded-md border border-error/30 bg-error/10 px-4 py-3 text-sm text-on-error-container">
            {batchError}
          </div>
        )}
      </div>

      {/* Results */}
      {batchResults.length > 0 && (
        <>
          {/* Table */}
          <div className="glass-card rounded-lg border border-outline-variant/30 overflow-hidden animate-fade-in-up">
            <div className="bg-surface-container p-4 border-b border-outline-variant/20 flex justify-between items-center flex-wrap gap-3">
              <h3 className="font-headline text-lg uppercase tracking-widest text-on-background">
                Output Matrix <span className="text-outline text-sm ml-2">({batchResults.length} records)</span>
              </h3>
              <button onClick={exportCSV} className="px-5 py-2 rounded-md bg-primary/10 text-primary hover:text-white border border-primary/30 transition-all font-label tracking-[0.14em] text-xs uppercase active:scale-[0.98]">
                EXPORT CSV
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
          <div className="glass-card rounded-lg border border-outline-variant/30 p-5 md:p-8">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
              <h3 className="font-headline text-xl uppercase tracking-widest text-on-background">
                Result <span className="text-primary italic">Visualizer</span>
              </h3>
              <div className="flex gap-2 flex-wrap items-center">
                {/* Chart type toggle */}
                {['scatter', 'line'].map(t => (
                  <button key={t} onClick={() => setChartType(t)}
                    className={`px-3 py-1.5 rounded text-[10px] font-label uppercase tracking-widest border transition-all ${
                      chartType === t ? 'text-primary border-primary/40 bg-primary/10' : 'text-neutral-500 border-outline-variant/20 hover:bg-white/5'
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
              <div style={{ width: '100%', height: 380 }}>
                <ResponsiveContainer width="100%" height={380}>
                  {chartType === 'scatter' ? (
                    <ScatterChart margin={{ top: 10, right: 20, left: 10, bottom: 30 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#25252d" />
                      <XAxis dataKey="x" name={xKey} stroke="#76747b" tick={{ fill: '#76747b' }}
                        label={{ value: xKey, position: 'insideBottomRight', offset: -5, fill: '#76747b', fontSize: 11 }} type="number" />
                      <YAxis dataKey="y" name={yKey} stroke="#76747b" tick={{ fill: '#76747b' }}
                        label={{ value: yKey, angle: -90, position: 'insideLeft', fill: '#76747b', fontSize: 11 }} />
                      <Tooltip
                        cursor={{ strokeDasharray: '3 3' }}
                        contentStyle={{ backgroundColor: '#131319', border: '1px solid #25252d', borderRadius: '8px', color: '#f9f5fd' }}
                        formatter={(v, n) => [v?.toFixed(5), n]}
                      />
                      <Scatter data={chartData} fill="#6ee7d8" fillOpacity={0.7} />
                    </ScatterChart>
                  ) : (
                    <LineChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 30 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#25252d" />
                      <XAxis dataKey="x" stroke="#76747b" tick={{ fill: '#76747b' }}
                        label={{ value: xKey, position: 'insideBottomRight', offset: -5, fill: '#76747b', fontSize: 11 }} />
                      <YAxis stroke="#76747b" tick={{ fill: '#76747b' }}
                        label={{ value: yKey, angle: -90, position: 'insideLeft', fill: '#76747b', fontSize: 11 }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#131319', border: '1px solid #25252d', borderRadius: '8px', color: '#f9f5fd' }}
                        formatter={(v) => [v?.toFixed(5), yKey]}
                      />
                      <Line type="monotone" dataKey="y" stroke="#6ee7d8" strokeWidth={2} dot={false} />
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
