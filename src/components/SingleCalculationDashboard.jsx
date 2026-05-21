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
    <div className="animate-fade-in relative z-10 w-full">
      {/* Top Controller Bar */}
      <div className="mb-8 glass-card rounded-lg p-3 md:p-4 flex flex-col xl:flex-row gap-4 justify-between items-stretch xl:items-center border border-outline-variant/30 relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(0,113,227,0.08),transparent_42%,rgba(52,199,89,0.05))] pointer-events-none"></div>

        {/* Algorithm Selection Segmented Control */}
        <div className="relative z-10 flex w-full overflow-x-auto p-1 bg-surface-container-highest rounded-md border border-outline-variant/30 xl:w-auto">
          {[
            { id: 'aci209', label: 'ACI 209R-92' },
            { id: 'mc2010', label: 'fib MC 2010' },
            { id: 'b4', label: 'B4 MODEL' },
            { id: 'b4s', label: 'B4S MODEL' }
          ].map((algo, index) => (
            <button
              key={algo.id}
              onClick={() => setAlgorithm(algo.id)}
              style={{ '--stagger-index': index }}
              className={`stagger-pop control-tab px-5 py-3 rounded-sm font-label uppercase tracking-[0.14em] text-xs transition-all flex-1 xl:flex-none whitespace-nowrap active:scale-[0.98] ${
                algorithm === algo.id 
                  ? 'is-active bg-primary/14 text-primary border border-primary/25'
                  : 'text-outline hover:text-on-surface hover:bg-surface-container-high border border-transparent'
              }`}
            >
              {algo.label}
            </button>
          ))}
        </div>

        {/* Engine Selection Toggle */}
        <div className="relative z-10 flex w-full p-1 bg-surface-container-highest rounded-md border border-outline-variant/30 xl:w-auto">
          <button
            onClick={() => setEngine('rust')}
            style={{ '--stagger-index': 4 }}
            className={`stagger-pop control-tab flex-1 xl:flex-none justify-center items-center flex gap-2 px-5 py-3 rounded-sm font-label uppercase tracking-[0.14em] text-xs transition-all active:scale-[0.98] ${
              engine === 'rust'
                ? 'is-active bg-primary/14 text-primary border border-primary/25'
                : 'text-outline hover:text-on-surface hover:bg-surface-container-high border border-transparent'
            }`}
          >
            <span className="material-symbols-outlined text-sm" aria-hidden="true">memory</span>
            RUST KERNEL
          </button>
          <button
            onClick={() => setEngine('js')}
            style={{ '--stagger-index': 5 }}
            className={`stagger-pop control-tab flex-1 xl:flex-none justify-center items-center flex gap-2 px-5 py-3 rounded-sm font-label uppercase tracking-[0.14em] text-xs transition-all active:scale-[0.98] ${
              engine === 'js'
                ? 'is-active bg-secondary/14 text-secondary border border-secondary/25'
                : 'text-outline hover:text-on-surface hover:bg-surface-container-high border border-transparent'
            }`}
          >
            <span className="material-symbols-outlined text-sm text-[16px] leading-none" aria-hidden="true">javascript</span>
            STANDARD JS
          </button>
        </div>
      </div>

      {/* Render the selected calculator directly beneath */}
      <ActiveComponent />
    </div>
  );
}
