import React from 'react';
import AnimatedMetric from './AnimatedMetric';

export default function ResultsSidebar({ phi, feedLogs, extraResults, resultLabel }) {
  const circumference = 553;
  const phiValue = parseFloat(phi);
  // Gauge ring: for creep coefficients (0-4 range) use 4 as max;
  // for compliance J (very small ~0.0001-0.001) use relative max = 0.002
  const isComplianceJ = !isNaN(phiValue) && phiValue < 0.01 && phiValue > 0;
  const gaugeMax = isComplianceJ ? 0.002 : 4;
  const cappedPhi = isNaN(phiValue) ? 0 : Math.min(Math.max(phiValue, 0), gaugeMax);
  const percentage = cappedPhi / gaugeMax;
  const offset = circumference - (percentage * circumference);

  return (
    <aside className="col-span-12 lg:col-span-4 space-y-8">
      {/* Circular Gauge */}
      <div className="result-panel motion-card glass-card rounded-lg p-5 md:p-8 border border-primary/20 relative overflow-hidden group">
        <div className="absolute -right-16 -top-20 h-44 w-52 rotate-12 bg-primary/8 blur-3xl group-hover:bg-primary/12 transition-colors"></div>
        <div className="text-center">
          <div className="text-xs font-label text-on-surface-variant uppercase tracking-widest mb-8">{resultLabel || 'Creep Coefficient φ(t,t₀)'}</div>
          
          <div className="gauge-pulse relative w-48 h-48 mx-auto flex items-center justify-center mb-8">
            <svg className="w-full h-full -rotate-90">
              <circle cx="96" cy="96" r="88" fill="none" stroke="#d2d2d7" strokeWidth="8"></circle>
              {/* Actual value curve */}
              <circle 
                cx="96" 
                cy="96" 
                r="88" 
                fill="none" 
                stroke="url(#gradient)" 
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={isNaN(offset) ? circumference : offset}
                style={{ transition: 'stroke-dashoffset 1s ease-out' }}
              ></circle>
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" style={{stopColor: "#0071e3"}}></stop>
                  <stop offset="100%" style={{stopColor: "#34c759"}}></stop>
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute flex flex-col items-center">
              <AnimatedMetric
                value={phiValue}
                format={isComplianceJ ? 'exponential' : 'fixed'}
                className="result-readout text-5xl font-headline font-bold text-primary"
              />
              <span className="text-[10px] font-label text-neutral-500">CURRENT VALUE</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-surface-container-low rounded-md">
              <div className="text-[10px] text-neutral-500 mb-1">Status</div>
              <div className="text-sm font-headline">{isNaN(phiValue) ? 'Awaiting input' : 'Computed'}</div>
            </div>
            <div className="p-3 bg-surface-container-low rounded-md">
              <div className="text-[10px] text-neutral-500 mb-1">Series range</div>
              <div className="text-sm font-headline text-tertiary">10000d</div>
            </div>
          </div>
        </div>
      </div>

      {/* Extra Results (e.g., shrinkage strains for B4/B4S) */}
      {extraResults && extraResults.length > 0 && (
        <div className="motion-card glass-card rounded-lg p-6 border border-primary/20 space-y-3">
          <div className="text-xs font-label text-primary uppercase tracking-widest mb-4">Shrinkage results</div>
          {extraResults.map((item, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-surface-container-low rounded-md">
              <div>
                <div className="text-[10px] text-neutral-500 font-label uppercase tracking-wider">{item.label}</div>
              </div>
              <span className="text-primary font-headline text-lg font-bold">
                {isNaN(parseFloat(item.value)) ? '--' : parseFloat(item.value).toExponential(3)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* System Feed */}
      <div className="motion-card glass-card rounded-lg border border-outline-variant/10 flex flex-col h-[400px]">
        <div className="p-6 border-b border-outline-variant/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-sm text-primary" aria-hidden="true">terminal</span>
            <span className="text-xs font-label uppercase tracking-widest">System feed</span>
          </div>
          <div className="status-beacon h-2 w-2 rounded-sm bg-primary"></div>
        </div>
        <div className="p-6 space-y-4 overflow-y-auto text-[11px] font-body flex-1 flex flex-col justify-end">
          {feedLogs.map((log, index) => (
            <div key={index} className="system-feed-line flex gap-3">
              <span className="text-neutral-600 shrink-0">{log.time}</span>
              <span className={`${log.type === 'error' ? 'text-error' : log.type === 'success' ? 'text-primary' : log.type === 'warning' ? 'text-secondary' : 'text-on-surface-variant'}`}>
                {log.message}
              </span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
