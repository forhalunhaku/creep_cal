import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Papa from 'papaparse';

// ---- Shared Math Kernels ----
function aci209(t0, H, VS, sphi, Cc, alpha, t) {
  if (t <= t0) return null;
  const bT0 = 1.25 * Math.pow(t0, -0.118);
  const bRH = 1.27 - 0.0067 * H;
  const bVS = (2 * (1 + 1.13 * Math.exp(-0.0213 * VS))) / 3;
  const bSP = 0.88 + 0.244 * sphi;
  const bCc = 0.75 + 0.00061 * Cc;
  const bA  = 0.46 + 9 * alpha;
  const phiInf = 2.35 * bT0 * bRH * bVS * bSP * bCc * bA;
  const bc = Math.pow(t - t0, 0.6) / (10 + Math.pow(t - t0, 0.6));
  return bc * phiInf;
}

const cementAlpha = { '32.5N':-1,'32.5R':0,'42.5N':0,'42.5R':1,'52.5N':1,'52.5R':1 };
function mc2010(fcm, RH, t0, Ac, u, T, Cs, t) {
  const a = cementAlpha[Cs] ?? 0;
  const t0T = t0 * Math.exp(13.65 - 4000/(273+T));
  const t0a = t0T * Math.pow((9/(2+Math.pow(t0T,1.2)))+1, a);
  const h = (2*Ac)/u;
  const af = Math.sqrt(35/fcm);
  const bh = Math.min(1.5*h + 250*af, 1500*af);
  const dt = t - t0;
  if (dt <= 0) return null;
  const phi_bc = (1.8/Math.pow(fcm,0.7)) * Math.log(Math.pow(((30/t0a)+0.035),2)*dt+1);
  const g_t0 = 1/(2.3+3.5/Math.sqrt(t0a));
  const phi_dc = (412/Math.pow(fcm,1.4)) * ((1-RH/100)/Math.pow(0.1*(h/100),1/3))
                 * (1/(0.1+Math.pow(t0a,0.2))) * Math.pow(dt/(bh+dt),g_t0);
  return phi_bc + phi_dc;
}

// Build time series for a model, returns array {t, value}
function buildSeries(modelId, params, tMax, nPts) {
  const ts = Array.from({length: nPts}, (_, i) => Math.round(1 + (i/(nPts-1))*(tMax-1)));
  return ts.map(t => {
    let v = null;
    if (modelId === 'aci209') {
      v = aci209(params.t0, params.H, params.VS, params.sphi, params.Cc, params.alpha, t);
    } else if (modelId === 'mc2010') {
      v = mc2010(params.fcm, params.RH, params.t0_mc, params.Ac, params.u, params.T, params.Cs, t);
    }
    return { t, [modelId]: v != null ? parseFloat(v.toFixed(4)) : null };
  });
}

function mergeSeriesArray(seriesArray) {
  const map = {};
  seriesArray.forEach(series => {
    series.forEach(pt => {
      if (!map[pt.t]) map[pt.t] = { t: pt.t };
      Object.assign(map[pt.t], pt);
    });
  });
  return Object.values(map).sort((a, b) => a.t - b.t);
}

const MODEL_COLORS = {
  aci209: '#8ff5ff',
  mc2010: '#c47fff',
};
const MODEL_LABELS = { aci209: 'ACI 209R-92 (φ)', mc2010: 'fib MC 2010 (φ)' };

const DEFAULT_PARAMS = {
  // ACI 209
  t0: 28, H: 70, VS: 100, sphi: 0.5, Cc: 350, alpha: 0.08,
  // MC2010 (shares t0 → t0_mc)
  t0_mc: 28, fcm: 40, RH: 70, Ac: 1000, u: 400, T: 20, Cs: '42.5R',
};

const PARAM_FIELDS = [
  // Common-ish
  { key: 't0', label: 'Age at Loading (days) — ACI', min:1, max:365, step:1, type:'number', models:['aci209'] },
  { key: 'H', label: 'Relative Humidity % — ACI', min:0, max:100, step:1, type:'number', models:['aci209'] },
  { key: 'VS', label: 'V/S Ratio mm — ACI', min:10, max:500, step:5, type:'number', models:['aci209'] },
  { key: 'sphi', label: 'Slump — ACI', min:0, max:1, step:0.01, type:'number', models:['aci209'] },
  { key: 'Cc', label: 'Cement Content kg/m³ — ACI', min:100, max:600, step:10, type:'number', models:['aci209'] },
  { key: 'alpha', label: 'Creep Parameter α — ACI', min:0, max:1, step:0.01, type:'number', models:['aci209'] },
  { key: 't0_mc', label: 'Age at Loading (days) — MC2010', min:1, max:365, step:1, type:'number', models:['mc2010'] },
  { key: 'fcm', label: 'Mean Strength MPa — MC2010', min:10, max:100, step:1, type:'number', models:['mc2010'] },
  { key: 'RH', label: 'Relative Humidity % — MC2010', min:0, max:100, step:1, type:'number', models:['mc2010'] },
  { key: 'Ac', label: 'Cross Section mm² — MC2010', min:100, max:100000, step:100, type:'number', models:['mc2010'] },
  { key: 'u', label: 'Perimeter mm — MC2010', min:50, max:10000, step:10, type:'number', models:['mc2010'] },
  { key: 'T', label: 'Temperature °C — MC2010', min:-10, max:40, step:1, type:'number', models:['mc2010'] },
  { key: 'Cs', label: 'Cement Class — MC2010', type:'select', options:['32.5N','32.5R','42.5N','42.5R','52.5N','52.5R'], models:['mc2010'] },
];

export default function AnalysisPage() {
  const [selectedModels, setSelectedModels] = useState(['aci209','mc2010']);
  const [params, setParams] = useState(DEFAULT_PARAMS);
  const [tMax, setTMax] = useState(10000);
  const [chartData, setChartData] = useState([]);
  const [hasRun, setHasRun] = useState(false);

  const toggleModel = (id) => {
    setSelectedModels(prev =>
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  const handleRun = () => {
    const series = selectedModels.map(id => buildSeries(id, params, tMax, 300));
    setChartData(mergeSeriesArray(series));
    setHasRun(true);
  };

  const handleExport = () => {
    if (!chartData.length) return;
    const keys = ['t', ...selectedModels];
    const csv = Papa.unparse(chartData.map(r => Object.fromEntries(keys.map(k => [k, r[k] ?? '']))));
    const blob = new Blob([csv], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'model_comparison.csv';
    link.click();
  };

  // Only show params relevant to selected models
  const visibleFields = PARAM_FIELDS.filter(f => f.models.some(m => selectedModels.includes(m)));

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in relative z-10">
      <header className="mb-10">
        <h1 className="font-headline text-5xl font-bold tracking-tight text-on-background mb-4">
          Model <span className="text-primary italic">Comparator</span>
        </h1>
        <p className="text-on-surface-variant text-lg">
          Overlay multiple prediction model outputs on a single chart for direct visual comparison.
        </p>
      </header>

      <div className="grid grid-cols-12 gap-8">
        {/* Left: Config Panel */}
        <div className="col-span-12 xl:col-span-4 space-y-6">
          {/* Model Selector */}
          <div className="glass-card rounded-xl p-6 border border-outline-variant/20">
            <h3 className="font-headline text-sm uppercase tracking-widest text-outline mb-4">Active Models</h3>
            <div className="space-y-2">
              {[
                { id: 'aci209', label: 'ACI 209R-92', color: 'text-cyan-300 border-cyan-500/30 bg-cyan-500/10' },
                { id: 'mc2010', label: 'fib MC 2010', color: 'text-purple-300 border-purple-500/30 bg-purple-500/10' },
              ].map(m => {
                const active = selectedModels.includes(m.id);
                return (
                  <button
                    key={m.id}
                    onClick={() => toggleModel(m.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border transition-all text-sm font-label uppercase tracking-widest ${
                      active ? m.color : 'text-neutral-500 border-outline-variant/20 hover:bg-white/5'
                    }`}
                  >
                    <div className={`w-3 h-3 rounded-full border-2 flex items-center justify-center ${active ? 'border-current' : 'border-neutral-600'}`}>
                      {active && <div className="w-1.5 h-1.5 rounded-full bg-current"></div>}
                    </div>
                    {m.label}
                    <span className="ml-auto" style={{ color: MODEL_COLORS[m.id], fontSize: 18 }}>—</span>
                  </button>
                );
              })}
            </div>
            <div className="mt-4 pt-4 border-t border-outline-variant/10">
              <label className="text-xs font-label uppercase text-outline tracking-wider block mb-2">Time Range (days)</label>
              <div className="flex items-center gap-3">
                <input
                  type="range" min="100" max="36500" step="100" value={tMax}
                  onChange={e => setTMax(+e.target.value)}
                  className="flex-1 custom-range"
                />
                <span className="text-primary font-headline text-sm w-16 text-right">{tMax}d</span>
              </div>
            </div>
          </div>

          {/* Parameters */}
          <div className="glass-card rounded-xl p-6 border border-outline-variant/20">
            <h3 className="font-headline text-sm uppercase tracking-widest text-outline mb-4">Parameters</h3>
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
              {visibleFields.map(f => (
                <div key={f.key}>
                  <label className="text-[10px] font-label uppercase text-outline tracking-wider block mb-1">{f.label}</label>
                  {f.type === 'select' ? (
                    <select
                      value={params[f.key]}
                      onChange={e => setParams(p => ({...p, [f.key]: e.target.value}))}
                      className="w-full bg-surface-container-high text-on-surface rounded-lg px-3 py-2 text-sm border border-outline-variant/20 focus:ring-1 focus:ring-primary focus:outline-none"
                    >
                      {f.options.map(o => <option key={o}>{o}</option>)}
                    </select>
                  ) : (
                    <div className="flex items-center gap-2">
                      <input
                        type="range" min={f.min} max={f.max} step={f.step}
                        value={params[f.key]}
                        onChange={e => setParams(p => ({...p, [f.key]: parseFloat(e.target.value)}))}
                        className="flex-1 custom-range"
                      />
                      <span className="text-primary font-headline text-xs w-14 text-right">{params[f.key]}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleRun}
            disabled={selectedModels.length === 0}
            className="w-full py-4 kinetic-gradient text-on-primary-fixed font-bold text-sm tracking-widest rounded-xl hover:shadow-[0_0_20px_rgba(143,245,255,0.3)] transition-all active:scale-95 disabled:opacity-40"
          >
            ⚡ RUN COMPARISON
          </button>
        </div>

        {/* Right: Chart */}
        <div className="col-span-12 xl:col-span-8 space-y-6">
          <div className="glass-card rounded-xl p-8 border border-outline-variant/20 min-h-[500px] flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-headline text-xl uppercase tracking-wider text-on-background">
                Creep Coefficient φ(t, t₀)
              </h3>
              {hasRun && (
                <button
                  onClick={handleExport}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500/10 to-purple-500/10 text-cyan-300 hover:text-white border border-cyan-500/20 transition-all active:scale-95 font-label text-xs uppercase"
                >
                  <span className="material-symbols-outlined text-sm">download</span>
                  Export CSV
                </button>
              )}
            </div>

            {!hasRun ? (
              <div className="flex-1 flex flex-col items-center justify-center text-neutral-600 gap-4">
                <span className="material-symbols-outlined text-6xl">analytics</span>
                <p className="font-label text-sm uppercase tracking-widest">Configure parameters and run comparison</p>
              </div>
            ) : (
              <div style={{ width: '100%', height: 420 }}>
                <ResponsiveContainer width="100%" height={420}>
                  <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#25252d" />
                    <XAxis dataKey="t" stroke="#76747b" tick={{fill:'#76747b'}} label={{value:'Time (days)', position:'insideBottomRight', offset:-10, fill:'#76747b', fontSize:11}} />
                    <YAxis stroke="#76747b" tick={{fill:'#76747b'}} label={{value:'φ(t,t₀)', angle:-90, position:'insideLeft', fill:'#76747b', fontSize:11}} />
                    <Tooltip
                      contentStyle={{backgroundColor:'#131319', border:'1px solid #25252d', borderRadius:'8px', color:'#f9f5fd'}}
                      formatter={(v, name) => [v?.toFixed(4), MODEL_LABELS[name] || name]}
                      labelFormatter={l => `t = ${l} days`}
                    />
                    <Legend formatter={k => MODEL_LABELS[k] || k} />
                    {selectedModels.map(id => (
                      <Line
                        key={id}
                        type="monotone"
                        dataKey={id}
                        stroke={MODEL_COLORS[id]}
                        strokeWidth={2.5}
                        dot={false}
                        name={id}
                        connectNulls
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Stats summary */}
          {hasRun && chartData.length > 0 && (
            <div className="grid grid-cols-2 gap-4">
              {selectedModels.map(id => {
                const vals = chartData.map(d => d[id]).filter(v => v != null);
                const final = vals[vals.length - 1];
                const peak = Math.max(...vals);
                return (
                  <div key={id} className="glass-card rounded-xl p-5 border border-outline-variant/20">
                    <div className="text-[10px] font-label uppercase tracking-widest mb-2" style={{color: MODEL_COLORS[id]}}>{MODEL_LABELS[id]}</div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-surface-container-low rounded-lg p-3">
                        <div className="text-[10px] text-neutral-500 mb-1">φ at t={tMax}d</div>
                        <div className="text-xl font-headline text-primary">{final?.toFixed(3)}</div>
                      </div>
                      <div className="bg-surface-container-low rounded-lg p-3">
                        <div className="text-[10px] text-neutral-500 mb-1">Peak φ</div>
                        <div className="text-xl font-headline text-secondary">{peak?.toFixed(3)}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
