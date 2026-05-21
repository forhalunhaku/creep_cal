import React, { useState } from 'react';
import DynamicParameters from './DynamicParameters';
import ResultsSidebar from './ResultsSidebar';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { useCalculationMotion } from '../../hooks/useCalculationMotion';

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
  const renderT0Label = ({ viewBox }) => {
    if (!viewBox) return null;
    return (
      <text
        x={viewBox.x + 7}
        y={viewBox.y + 18}
        fill="#bf7a12"
        fontSize={10}
        fontFamily="Manrope, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
      >
        {`t₀=${t0ref}d`}
      </text>
    );
  };

  return (
    <div className="motion-card glass-card rounded-lg p-5 md:p-8 border border-outline-variant/30">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h3 className="font-headline text-xl font-semibold tracking-tight text-on-background">System analytics trace</h3>
        <button
          onClick={() => setLogX(v => !v)}
          className={`px-3 py-1.5 rounded text-[10px] font-label uppercase tracking-widest border transition-all ${
            logX ? 'text-primary border-primary/40 bg-primary/10' : 'text-outline border-outline-variant/30 hover:bg-surface-container-high hover:text-on-surface'
          }`}
        >
          Log X-Axis
        </button>
      </div>
      <div className="chart-stage h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 18, left: 12, bottom: 30 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#d2d2d7" />
            <XAxis
              dataKey="t" stroke="#6e6e73" tick={{ fill: '#6e6e73', fontSize: 11 }}
              scale={logX ? 'log' : 'linear'}
              domain={logX ? ['auto', 'auto'] : undefined}
              allowDataOverflow={logX}
              tickCount={6}
              minTickGap={28}
              label={{ value: 'Time (days)', position: 'insideBottomRight', offset: -12, fill: '#6e6e73', fontSize: 10 }}
            />
            <YAxis stroke="#6e6e73" tick={{ fill: '#6e6e73', fontSize: 11 }} width={48}
              label={{ value: yLabel, angle: -90, position: 'insideLeft', offset: 0, fill: '#6e6e73', fontSize: 10 }}
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #d2d2d7', borderRadius: '8px', color: '#1d1d1f' }}
              formatter={(v, name) => [typeof v === 'number' ? v.toFixed(5) : v, name]}
              labelFormatter={l => `t = ${l} days`}
            />
            <Legend iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
            {t0ref != null && !isNaN(t0ref) && (
              <ReferenceLine x={t0ref} stroke="#f59e0b" strokeDasharray="4 4"
                label={renderT0Label} />
            )}
            {chartLines ? chartLines.map((line, idx) => (
              <Line key={idx} type="monotone" dataKey={line.dataKey} stroke={line.stroke}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5, stroke: line.stroke, strokeWidth: 2, fill: '#ffffff' }}
                name={line.name}
                isAnimationActive="auto"
                animationBegin={idx * 120}
                animationDuration={1300}
                animationEasing="ease-out" />
            )) : (
              <Line
                type="monotone"
                dataKey="phi"
                stroke="#0071e3"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5, stroke: '#0071e3', strokeWidth: 2, fill: '#ffffff' }}
                name="Creep Coefficient φ"
                isAnimationActive="auto"
                animationDuration={1300}
                animationEasing="ease-out"
              />
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
  chartData,
  chartLines, // Array of { dataKey, stroke, name }
  extraResults, // Array of { label, value } for secondary metrics (e.g. εsh)
  resultLabel   // Override the gauge title (default: 'Creep Coefficient φ')
}) {
  const hasResults = chartData && chartData.length > 0;
  const numericResult = parseFloat(phiResult);
  const hasNumericResult = Number.isFinite(numericResult);
  const { rootRef, playCalculationMotion } = useCalculationMotion();

  const handleCalculate = async () => {
    const result = onCalculate?.();
    await Promise.resolve(result);
    requestAnimationFrame(() => {
      requestAnimationFrame(playCalculationMotion);
    });
  };

  return (
    <div ref={rootRef}>
      <header className="mb-8 flex flex-col gap-4 md:mb-12 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <h1 className="font-headline text-3xl md:text-5xl font-bold tracking-tight text-on-background mb-3 md:mb-4 text-balance">
            {modelName} <span className="text-primary">analysis</span>
          </h1>
          <p className="text-on-surface-variant text-sm md:text-lg leading-relaxed max-w-[65ch]">
            {modelDescription}
          </p>
        </div>
        {/* Export buttons — single result always shown when phi computed, CSV only when chart exists */}
        <div className="flex w-full flex-wrap gap-2 md:w-auto md:justify-end">
          {hasNumericResult && (
            <button
              onClick={() => exportSingleResult(modelName, params, phiResult)}
              className="flex flex-1 items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-secondary/10 text-on-surface hover:bg-secondary/15 border border-outline-variant/40 hover:border-outline transition-all active:scale-[0.98] font-label tracking-[0.14em] text-xs uppercase md:flex-none"
            >
              <span className="material-symbols-outlined text-sm" aria-hidden="true">download</span>
              Export Result
            </button>
          )}
          {hasResults && (
            <button
              onClick={() => exportToCSV(modelName, params, chartData, chartLines)}
              className="flex flex-1 items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-primary/10 text-primary hover:bg-primary/15 border border-primary/20 hover:border-primary/50 transition-all active:scale-[0.98] font-label tracking-[0.14em] text-xs uppercase md:flex-none"
            >
              <span className="material-symbols-outlined text-sm" aria-hidden="true">table_chart</span>
              Export Time Series
            </button>
          )}
        </div>
      </header>

      <div className="grid grid-cols-12 gap-6 lg:gap-8">
        <div className="col-span-12 lg:col-span-8 space-y-8">
          <DynamicParameters 
            paramsConfig={paramsConfig} 
            params={params} 
            onParamChange={onParamChange}
            onCalculate={handleCalculate}
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
        </div>
        
        <ResultsSidebar phi={phiResult} feedLogs={feedLogs} extraResults={extraResults} resultLabel={resultLabel} />
      </div>
    </div>
  );
}
