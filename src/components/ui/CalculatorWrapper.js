import React, { useState } from 'react';
import DynamicParameters from './DynamicParameters';
import ResultsSidebar from './ResultsSidebar';
import BentoCards from './BentoCards';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

function exportToCSV(modelName, params, chartData, chartLines) {
  if (!chartData || chartData.length === 0) return;

  // Build header from chart line dataKeys + time column
  const lineKeys = chartLines ? chartLines.map(l => l.dataKey) : ['phi'];
  const headers = ['t_days', ...lineKeys];

  // Rows from chart data
  const rows = chartData.map(row => [row.t, ...lineKeys.map(k => row[k] ?? '')]);

  // Param summary at top
  const paramRows = Object.entries(params).map(([k, v]) => [`# ${k}`, v]);

  const allRows = [
    [`# Model: ${modelName}`],
    [`# Exported: ${new Date().toISOString()}`],
    ...paramRows,
    ['#'],
    headers,
    ...rows
  ];

  const csv = allRows.map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${modelName.replace(/\s+/g, '_')}_results.csv`;
  link.click();
}

function exportSingleResult(modelName, params, phi) {
  const ts = new Date().toISOString();
  const lines = [
    `# CREEP_LAB — Single Point Calculation`,
    `# Model: ${modelName}`,
    `# Exported: ${ts}`,
    `#`,
    `parameter,value`,
    ...Object.entries(params).map(([k, v]) => `${k},${v}`),
    `#`,
    `result,value`,
    `phi_result,${phi}`,
  ];
  const csv = lines.join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${modelName.replace(/\s+/g, '_')}_single_result.csv`;
  link.click();
}

// ─── Analytics Chart Sub-component ─────────────────────────────────────────
function AnalyticsChart({ chartData, chartLines, t0 }) {
  const [logX, setLogX] = useState(false);
  const yLabel = chartLines?.[0]?.name || 'Value';
  const t0ref  = t0 != null ? parseFloat(t0) : null;
  const data   = chartData.filter((_, i) => i % 10 === 0);

  return (
    <div className="glass-card rounded-lg p-8 border border-outline-variant/20">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h3 className="font-headline text-xl uppercase tracking-wider text-on-background">System Analytics Trace</h3>
        <button
          onClick={() => setLogX(v => !v)}
          className={`px-3 py-1.5 rounded text-[10px] font-label uppercase tracking-widest border transition-all ${
            logX ? 'text-primary border-primary/40 bg-primary/10' : 'text-neutral-500 border-outline-variant/20 hover:bg-white/5'
          }`}
        >
          Log X-Axis
        </button>
      </div>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, left: 15, bottom: 25 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#25252d" />
            <XAxis
              dataKey="t" stroke="#76747b" tick={{ fill: '#76747b' }}
              scale={logX ? 'log' : 'linear'}
              domain={logX ? ['auto', 'auto'] : undefined}
              allowDataOverflow={logX}
              label={{ value: 'Time (days)', position: 'insideBottomRight', offset: -10, fill: '#76747b', fontSize: 11 }}
            />
            <YAxis stroke="#76747b" tick={{ fill: '#76747b' }}
              label={{ value: yLabel, angle: -90, position: 'insideLeft', offset: 5, fill: '#76747b', fontSize: 10 }}
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#131319', border: '1px solid #25252d', borderRadius: '8px', color: '#f9f5fd' }}
              formatter={(v, name) => [typeof v === 'number' ? v.toFixed(5) : v, name]}
              labelFormatter={l => `t = ${l} days`}
            />
            <Legend />
            {t0ref != null && !isNaN(t0ref) && (
              <ReferenceLine x={t0ref} stroke="#f59e0b" strokeDasharray="4 4"
                label={{ value: `t₀=${t0ref}d`, fill: '#f59e0b', fontSize: 10, position: 'top' }} />
            )}
            {chartLines ? chartLines.map((line, idx) => (
              <Line key={idx} type="monotone" dataKey={line.dataKey} stroke={line.stroke}
                strokeWidth={2} dot={false} name={line.name} />
            )) : (
              <Line type="monotone" dataKey="phi" stroke="#8ff5ff" strokeWidth={2} dot={false} name="Creep Coefficient φ" />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default function CalculatorWrapper({
  modelName,
  modelDescription,
  paramsConfig,
  params,
  onParamChange,
  onCalculate,
  calculateReady,
  buttonText,
  phiResult,
  feedLogs,
  concreteClass,
  crossSectionInfo,
  chartData,
  chartLines, // Array of { dataKey, stroke, name }
  extraResults, // Array of { label, value } for secondary metrics (e.g. εsh)
  resultLabel   // Override the gauge title (default: 'Creep Coefficient φ')
}) {
  const hasResults = chartData && chartData.length > 0;

  return (
    <>
      <header className="mb-12 flex justify-between items-end">
        <div className="max-w-2xl">
          <h1 className="font-headline text-5xl font-bold tracking-tight text-on-background mb-4">
            {modelName} <span className="text-primary italic">Analysis</span>
          </h1>
          <p className="text-on-surface-variant text-lg leading-relaxed">
            {modelDescription}
          </p>
        </div>
        {/* Export buttons — single result always shown when phi computed, CSV only when chart exists */}
        <div className="flex gap-2 flex-wrap">
          {phiResult && !isNaN(parseFloat(phiResult)) && (
            <button
              onClick={() => exportSingleResult(modelName, params, phiResult)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-emerald-500/10 to-teal-500/10 text-emerald-300 hover:text-white border border-emerald-500/20 hover:border-emerald-400/50 transition-all active:scale-95 font-label tracking-widest text-xs uppercase"
            >
              <span className="material-symbols-outlined text-sm">download</span>
              Export Result
            </button>
          )}
          {hasResults && (
            <button
              onClick={() => exportToCSV(modelName, params, chartData, chartLines)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500/10 to-purple-500/10 text-cyan-300 hover:text-white border border-cyan-500/20 hover:border-cyan-400/50 transition-all active:scale-95 font-label tracking-widest text-xs uppercase"
            >
              <span className="material-symbols-outlined text-sm">table_chart</span>
              Export Time Series
            </button>
          )}
        </div>
      </header>

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-8 space-y-8">
          <DynamicParameters 
            paramsConfig={paramsConfig} 
            params={params} 
            onParamChange={onParamChange}
            onCalculate={onCalculate}
            calculateReady={calculateReady}
            buttonText={buttonText}
          />

          {hasResults && (
            <AnalyticsChart
              chartData={chartData}
              chartLines={chartLines}
              t0={params?.t0}
            />
          )}

          <BentoCards 
            concreteClass={concreteClass} 
            crossSectionInfo={crossSectionInfo} 
          />
        </div>
        
        <ResultsSidebar phi={phiResult} feedLogs={feedLogs} extraResults={extraResults} resultLabel={resultLabel} />
      </div>
    </>
  );
}
