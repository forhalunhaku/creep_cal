import React, { useState } from 'react';
import DynamicParameters from './DynamicParameters';
import ResultsSidebar from './ResultsSidebar';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { useCalculationMotion } from '../../hooks/useCalculationMotion';

function exportToCSV(modelName, params, chartData, chartLines) {
  if (!chartData || chartData.length === 0) return;

  const lineKeys = chartLines ? chartLines.map(l => l.dataKey) : ['phi'];
  const headers = ['t_days', ...lineKeys];
  const rows = chartData.map(row => [row.t, ...lineKeys.map(k => row[k] ?? '')]);
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
        fontFamily="Geist, system-ui, sans-serif"
      >
        {`t₀=${t0ref}d`}
      </text>
    );
  };

  return (
    <div className="card card-hoverable p-5 md:p-8">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h3 className="font-sans text-xl font-semibold tracking-tight text-primary">System analytics trace</h3>
        <button
          onClick={() => setLogX(v => !v)}
          className={`px-3 py-1.5 rounded-full text-[10px] font-label uppercase tracking-[0.12em] border transition-all ${
            logX ? 'active-pill' : 'text-muted border-line hover:bg-green-soft/50 hover:text-primary hover:border-green-border/50'
          }`}
        >
          Log X-Axis
        </button>
      </div>
      <div className="chart-stage h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 24, left: 18, bottom: 34 }}>
            <CartesianGrid strokeDasharray="4 6" stroke="var(--line)" />
            <XAxis
              dataKey="t" stroke="var(--text-faint)" tick={{ fill: 'var(--text)', fontSize: 12, fontWeight: 520 }}
              scale={logX ? 'log' : 'linear'}
              domain={logX ? ['auto', 'auto'] : undefined}
              allowDataOverflow={logX}
              tickCount={6}
              minTickGap={28}
              label={{ value: 'Time (days)', position: 'insideBottomRight', offset: -12, fill: 'var(--text-muted)', fontSize: 11, fontWeight: 650 }}
            />
            <YAxis stroke="var(--text-faint)" tick={{ fill: 'var(--text)', fontSize: 12, fontWeight: 520 }} width={56}
              label={{ value: yLabel, angle: -90, position: 'insideLeft', offset: 0, fill: 'var(--text-muted)', fontSize: 11, fontWeight: 650 }}
            />
            <Tooltip
              cursor={{ stroke: 'var(--green)', strokeOpacity: 0.26, strokeWidth: 1.5 }}
              contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--green-border)', borderRadius: '10px', color: 'var(--text)', boxShadow: 'var(--shadow-sm)' }}
              formatter={(v, name) => [typeof v === 'number' ? v.toFixed(5) : v, name]}
              labelFormatter={l => `t = ${l} days`}
            />
            <Legend iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
            {t0ref != null && !isNaN(t0ref) && (
              <ReferenceLine x={t0ref} stroke="#bf7a12" strokeDasharray="4 4"
                label={renderT0Label} />
            )}
            {chartLines ? chartLines.map((line, idx) => (
              <Line key={idx} type="monotone" dataKey={line.dataKey} stroke={line.stroke}
                strokeWidth={2.6}
                dot={false}
                activeDot={{ r: 6, stroke: line.stroke, strokeWidth: 2.5, fill: 'var(--surface)' }}
                name={line.name}
                isAnimationActive="auto"
                animationBegin={idx * 120}
                animationDuration={1300}
                animationEasing="ease-out" />
            )) : (
              <Line
                type="monotone"
                dataKey="phi"
                stroke="var(--green)"
                strokeWidth={2.6}
                dot={false}
                activeDot={{ r: 6, stroke: 'var(--green)', strokeWidth: 2.5, fill: 'var(--surface)' }}
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
  chartLines,
  extraResults,
  resultLabel
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
          <h1 className="font-serif text-3xl md:text-5xl font-normal tracking-tight text-primary mb-3 md:mb-4 text-balance">
            {modelName} <span className="text-green">analysis</span>
          </h1>
          <p className="text-muted text-sm md:text-lg leading-relaxed max-w-[65ch]">
            {modelDescription}
          </p>
        </div>
        <div className="flex w-full flex-wrap gap-2 md:w-auto md:justify-end">
          {hasNumericResult && (
            <button
              onClick={() => exportSingleResult(modelName, params, phiResult)}
              className="btn-secondary flex-1 md:flex-none text-[10px] py-2 px-3 md:py-2.5 md:px-4"
            >
              <span className="material-symbols-outlined text-sm" aria-hidden="true">download</span>
              Export Result
            </button>
          )}
          {hasResults && (
            <button
              onClick={() => exportToCSV(modelName, params, chartData, chartLines)}
              className="btn-primary flex-1 md:flex-none text-[10px] py-2 px-3 md:py-2.5 md:px-4"
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
