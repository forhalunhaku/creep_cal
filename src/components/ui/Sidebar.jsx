import React from 'react';

export default function Sidebar({ activeMode, onModeChange, onOpenDocs }) {
  const itemBase = "flex items-center gap-3 transition-all duration-300 active:scale-[0.98] font-label uppercase tracking-[0.16em] text-[10px] md:text-xs";

  return (
    <nav className="fixed inset-x-0 top-14 z-30 border-b border-outline-variant/40 bg-surface-container-low/95 p-1.5 backdrop-blur-2xl md:inset-y-0 md:left-0 md:right-auto md:top-0 md:w-72 md:border-b-0 md:border-r md:bg-surface-container-low/78 md:px-4 md:py-8">
      <div className="hidden px-4 md:mb-6 md:mt-20 md:block">
        <div className="font-headline text-xs font-black uppercase tracking-[0.24em] text-primary">Engineering core</div>
        <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-outline">v2.4 local kernel</div>
      </div>
      
      <div className="grid grid-cols-3 gap-1 md:mt-4 md:flex md:flex-1 md:flex-col md:gap-2">
        <button
          onClick={() => onModeChange('single')}
          aria-label="Single analysis"
          className={`${itemBase} justify-center rounded-lg px-2 py-2.5 md:w-full md:justify-start md:px-4 md:py-4 md:hover:translate-x-1 ${
            activeMode === 'single'
              ? "bg-primary/12 text-primary ring-1 ring-primary/25 md:border-l-4 md:border-primary" 
              : "text-outline hover:bg-surface-container-high hover:text-on-surface md:border-l-4 md:border-transparent"
          }`}
        >
          <span className="material-symbols-outlined text-[18px]" aria-hidden="true">science</span>
          <span className="hidden sm:inline">Single analysis</span>
        </button>
        <button
          onClick={() => onModeChange('batch')}
          aria-label="Batch matrix"
          className={`${itemBase} justify-center rounded-lg px-2 py-2.5 md:w-full md:justify-start md:px-4 md:py-4 md:hover:translate-x-1 ${
            activeMode === 'batch'
              ? "bg-primary/12 text-primary ring-1 ring-primary/25 md:border-l-4 md:border-primary" 
              : "text-outline hover:bg-surface-container-high hover:text-on-surface md:border-l-4 md:border-transparent"
          }`}
        >
          <span className="material-symbols-outlined text-[18px]" aria-hidden="true">layers</span>
          <span className="hidden sm:inline">Batch matrix</span>
        </button>
        <button
          onClick={onOpenDocs}
          aria-label="Model docs"
          className={`${itemBase} justify-center rounded-lg px-2 py-2.5 md:w-full md:justify-start md:px-4 md:py-4 md:hover:translate-x-1 ${
            activeMode === 'docs' ? 'bg-primary/12 text-primary ring-1 ring-primary/25 md:border-l-4 md:border-primary' : 'text-outline hover:bg-surface-container-high hover:text-on-surface md:border-l-4 md:border-transparent'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]" aria-hidden="true">menu_book</span>
          <span className="hidden sm:inline">Model docs</span>
        </button>
      </div>

      <div className="mt-6 hidden space-y-1 px-4 md:block">
        <button
          onClick={() => window.open('https://github.com/forhalunhaku/creep_cal', '_blank')}
          aria-label="GitHub Repository"
          className="flex w-full items-center gap-3 py-2 text-[10px] uppercase tracking-[0.16em] text-outline transition-colors hover:text-primary"
        >
          <span className="material-symbols-outlined text-sm" aria-hidden="true">contact_support</span>
          <span>GitHub Repository</span>
        </button>
      </div>
    </nav>
  );
}
