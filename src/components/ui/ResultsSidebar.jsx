import React from 'react';
import AnimatedMetric from './AnimatedMetric';

export default function ResultsSidebar({ phi, feedLogs, extraResults, resultLabel }) {
  const circumference = 553;
  const phiValue = parseFloat(phi);
  const isComplianceJ = !isNaN(phiValue) && phiValue < 0.01 && phiValue > 0;
  const gaugeMax = isComplianceJ ? 0.002 : 4;
  const cappedPhi = isNaN(phiValue) ? 0 : Math.min(Math.max(phiValue, 0), gaugeMax);
  const percentage = cappedPhi / gaugeMax;
  const offset = circumference - (percentage * circumference);

  return (
    <aside className="col-span-12 lg:col-span-4 space-y-8">
      {/* Circular Gauge */}
      <div className="result-panel card card-hoverable p-5 md:p-8 border-green-border/40 relative overflow-hidden">
        <div className="absolute -right-16 -top-20 h-44 w-52 rotate-12 bg-green/5 blur-3xl group-hover:bg-green/8 transition-colors"></div>
        <div className="text-center">
          <div className="text-xs font-label text-muted uppercase tracking-widest mb-8">{resultLabel || 'Creep Coefficient φ(t,t₀)'}</div>
          
          <div className="gauge-pulse relative w-48 h-48 mx-auto flex items-center justify-center mb-8">
            <svg className="w-full h-full -rotate-90">
              <circle cx="96" cy="96" r="88" fill="none" stroke="var(--line)" strokeWidth="8"></circle>
              <circle 
                cx="96" 
                cy="96" 
                r="88" 
                fill="none" 
                stroke="url(#greenGradient)" 
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={isNaN(offset) ? circumference : offset}
                style={{ transition: 'stroke-dashoffset 1s ease-out' }}
              ></circle>
              <defs>
                <linearGradient id="greenGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" style={{stopColor: "#2f6f4e"}}></stop>
                  <stop offset="100%" style={{stopColor: "#4a9e6e"}}></stop>
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute flex flex-col items-center">
              <AnimatedMetric
                value={phiValue}
                format={isComplianceJ ? 'exponential' : 'fixed'}
                className="result-readout text-5xl font-serif font-bold text-green"
              />
              <span className="text-[10px] font-label text-faint">CURRENT VALUE</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-surface-soft rounded-card">
              <div className="text-[10px] text-faint mb-1">Status</div>
              <div className="text-sm font-sans text-primary">{isNaN(phiValue) ? 'Awaiting input' : 'Computed'}</div>
            </div>
            <div className="p-3 bg-surface-soft rounded-card">
              <div className="text-[10px] text-faint mb-1">Series range</div>
              <div className="text-sm font-sans text-green-dark">10000d</div>
            </div>
          </div>
        </div>
      </div>

      {/* Extra Results (e.g., shrinkage strains for B4/B4S) */}
      {extraResults && extraResults.length > 0 && (
        <div className="card card-hoverable p-6 border-green-border/40 space-y-3">
          <div className="text-xs font-label text-green uppercase tracking-widest mb-4">Shrinkage results</div>
          {extraResults.map((item, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-surface-soft rounded-card">
              <div>
                <div className="text-[10px] text-faint font-label uppercase tracking-wider">{item.label}</div>
              </div>
              <span className="text-green font-serif text-lg font-bold">
                {isNaN(parseFloat(item.value)) ? '--' : parseFloat(item.value).toExponential(3)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* System Feed */}
      <div className="card card-hoverable border border-line/50 flex flex-col h-[400px]">
        <div className="p-6 border-b border-line/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-sm text-green" aria-hidden="true">terminal</span>
            <span className="text-xs font-label uppercase tracking-widest text-muted">System feed</span>
          </div>
          <div className="status-beacon h-2 w-2 rounded-sm bg-green"></div>
        </div>
        <div className="p-6 space-y-4 overflow-y-auto text-[11px] font-body flex-1 flex flex-col justify-end">
          {feedLogs.map((log, index) => (
            <div key={index} className="system-feed-line flex gap-3">
              <span className="text-faint shrink-0">{log.time}</span>
              <span className={`${log.type === 'error' ? 'text-error' : log.type === 'success' ? 'text-green' : log.type === 'warning' ? 'text-muted' : 'text-muted'}`}>
                {log.message}
              </span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
