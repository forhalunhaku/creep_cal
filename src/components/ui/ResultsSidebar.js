import React from 'react';

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
      <div className="glass-card rounded-lg p-8 border border-primary/20 relative overflow-hidden group">
        <div className="absolute -right-12 -top-12 w-40 h-40 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors"></div>
        <div className="text-center">
          <div className="text-xs font-label text-on-surface-variant uppercase tracking-widest mb-8">{resultLabel || 'Creep Coefficient φ(t,t₀)'}</div>
          
          <div className="relative w-48 h-48 mx-auto flex items-center justify-center mb-8">
            <svg className="w-full h-full -rotate-90">
              <circle cx="96" cy="96" r="88" fill="none" stroke="#25252d" strokeWidth="8"></circle>
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
                  <stop offset="0%" style={{stopColor: "#8ff5ff"}}></stop>
                  <stop offset="100%" style={{stopColor: "#c47fff"}}></stop>
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-5xl font-headline font-bold text-primary">
                {isNaN(phiValue) ? '--' : isComplianceJ ? phiValue.toExponential(3) : phiValue.toFixed(3)}
              </span>
              <span className="text-[10px] font-label text-neutral-500">NOMINAL</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-surface-container-low rounded-xl">
              <div className="text-[10px] text-neutral-500 mb-1">Status</div>
              <div className="text-sm font-headline">{isNaN(phiValue) ? 'PENDING' : 'COMPUTED'}</div>
            </div>
            <div className="p-3 bg-surface-container-low rounded-xl">
              <div className="text-[10px] text-neutral-500 mb-1">T max</div>
              <div className="text-sm font-headline text-tertiary">10000d</div>
            </div>
          </div>
        </div>
      </div>

      {/* Extra Results (e.g., shrinkage strains for B4/B4S) */}
      {extraResults && extraResults.length > 0 && (
        <div className="glass-card rounded-lg p-6 border border-emerald-500/20 space-y-3">
          <div className="text-xs font-label text-emerald-400 uppercase tracking-widest mb-4">Shrinkage Results</div>
          {extraResults.map((item, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-surface-container-low rounded-lg">
              <div>
                <div className="text-[10px] text-neutral-500 font-label uppercase tracking-wider">{item.label}</div>
              </div>
              <span className="text-emerald-300 font-headline text-lg font-bold">
                {isNaN(parseFloat(item.value)) ? '--' : parseFloat(item.value).toExponential(3)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* System Feed */}
      <div className="glass-card rounded-lg border border-outline-variant/10 flex flex-col h-[400px]">
        <div className="p-6 border-b border-outline-variant/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-sm text-primary">terminal</span>
            <span className="text-xs font-label uppercase tracking-widest">System Feed</span>
          </div>
          <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_#8ff5ff] animate-pulse"></div>
        </div>
        <div className="p-6 space-y-4 overflow-y-auto text-[11px] font-body flex-1 flex flex-col justify-end">
          {feedLogs.map((log, index) => (
            <div key={index} className="flex gap-3">
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

