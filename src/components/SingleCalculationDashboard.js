import React, { useState } from 'react';
import Aci209Calculator from './Aci209Calculator';
import Mc2010Calculator from './Mc2010Calculator';
import B4Calculator from './B4Calculator';
import B4sCalculator from './B4sCalculator';
import RustAci209Calculator from './RustAci209Calculator';
import RustMc2010Calculator from './RustMc2010Calculator';
import RustB4Calculator from './RustB4Calculator';
import RustB4sCalculator from './RustB4sCalculator';

export default function SingleCalculationDashboard() {
  const [engine, setEngine] = useState('rust'); // 'rust' | 'js'
  const [algorithm, setAlgorithm] = useState('aci209'); // 'aci209' | 'mc2010' | 'b4' | 'b4s'

  const ComponentTree = {
    rust: {
      aci209: RustAci209Calculator,
      mc2010: RustMc2010Calculator,
      b4: RustB4Calculator,
      b4s: RustB4sCalculator
    },
    js: {
      aci209: Aci209Calculator,
      mc2010: Mc2010Calculator,
      b4: B4Calculator,
      b4s: B4sCalculator
    }
  };

  const ActiveComponent = ComponentTree[engine][algorithm];

  return (
    <div className="animate-fade-in relative z-10 w-full" style={{ minWidth: '100%' }}>
      {/* Top Controller Bar */}
      <div className="mb-8 glass-card rounded-xl p-4 flex flex-col xl:flex-row gap-6 justify-between items-center border border-outline-variant/20 shadow-xl relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-r from-primary/5 via-transparent to-primary/5 blur-3xl rounded-full pointer-events-none"></div>

        {/* Algorithm Selection Segmented Control */}
        <div className="flex z-10 w-full xl:w-auto overflow-x-auto p-1 bg-surface-container-highest rounded-lg border border-outline-variant/30">
          {[
            { id: 'aci209', label: 'ACI 209R-92' },
            { id: 'mc2010', label: 'fib MC 2010' },
            { id: 'b4', label: 'B4 MODEL' },
            { id: 'b4s', label: 'B4S MODEL' }
          ].map(algo => (
            <button
              key={algo.id}
              onClick={() => setAlgorithm(algo.id)}
              className={`px-6 py-3 rounded-md font-label uppercase tracking-widest text-xs transition-all flex-1 xl:flex-none whitespace-nowrap active:scale-95 ${
                algorithm === algo.id 
                  ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-300 shadow-[0_0_15px_rgba(143,245,255,0.15)] border border-cyan-500/20' 
                  : 'text-neutral-500 hover:text-neutral-300 hover:bg-white/5 border border-transparent'
              }`}
            >
              {algo.label}
            </button>
          ))}
        </div>

        {/* Engine Selection Toggle */}
        <div className="flex z-10 w-full xl:w-auto p-1 bg-surface-container-highest rounded-lg border border-outline-variant/30">
          <button
            onClick={() => setEngine('rust')}
            className={`flex-1 xl:flex-none justify-center items-center flex gap-2 px-5 py-3 rounded-md font-label uppercase tracking-widest text-xs transition-all active:scale-95 ${
              engine === 'rust'
                ? 'bg-primary/10 text-primary shadow-[0_0_15px_rgba(143,245,255,0.15)] border border-primary/20'
                : 'text-neutral-500 hover:text-neutral-300 hover:bg-white/5 border border-transparent'
            }`}
          >
            <span className="material-symbols-outlined text-sm">memory</span>
            RUST KERNEL
          </button>
          <button
            onClick={() => setEngine('js')}
            className={`flex-1 xl:flex-none justify-center items-center flex gap-2 px-5 py-3 rounded-md font-label uppercase tracking-widest text-xs transition-all active:scale-95 ${
              engine === 'js'
                ? 'bg-yellow-500/10 text-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.15)] border border-yellow-500/20'
                : 'text-neutral-500 hover:text-neutral-300 hover:bg-white/5 border border-transparent'
            }`}
          >
            <span className="material-symbols-outlined text-sm text-[16px] leading-none">javascript</span>
            STANDARD JS
          </button>
        </div>
      </div>

      {/* Render the selected calculator directly beneath */}
      <ActiveComponent />
    </div>
  );
}
