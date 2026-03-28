import React from 'react';

export default function Sidebar({ activeMode, onModeChange, onOpenDocs }) {
  return (
    <nav className="fixed left-0 top-0 h-full w-72 bg-neutral-950/80 backdrop-blur-2xl border-r border-cyan-400/10 flex flex-col py-8 px-4 z-40 overflow-y-auto">
      <div className="mt-20 mb-6 px-4">
        <div className="text-cyan-400 font-black font-['Space_Grotesk'] uppercase text-xs tracking-widest">ENGINEERING_CORE</div>
        <div className="text-[10px] text-neutral-500 font-label tracking-tighter">V2.4_KINETIC</div>
      </div>
      
      <div className="flex-1 space-y-2 mt-4">
        <button
          onClick={() => onModeChange('single')}
          className={`w-full flex items-center gap-4 py-4 px-4 transition-all hover:translate-x-1 duration-300 font-['Space_Grotesk'] uppercase text-xs tracking-widest ${
            activeMode === 'single'
              ? "bg-gradient-to-r from-cyan-500/10 to-transparent border-l-4 border-cyan-400 text-cyan-400" 
              : "text-neutral-500 hover:text-neutral-200 hover:bg-neutral-800/50 border-l-4 border-transparent"
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">science</span>
          <span>Single Node Analysis</span>
        </button>
        <button
          onClick={() => onModeChange('batch')}
          className={`w-full flex items-center gap-4 py-4 px-4 transition-all hover:translate-x-1 duration-300 font-['Space_Grotesk'] uppercase text-xs tracking-widest ${
            activeMode === 'batch'
              ? "bg-gradient-to-r from-purple-500/10 to-transparent border-l-4 border-purple-400 text-purple-400" 
              : "text-neutral-500 hover:text-neutral-200 hover:bg-neutral-800/50 border-l-4 border-transparent"
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">layers</span>
          <span>Batch Pipeline Matrix</span>
        </button>

        <div className="my-8 h-[1px] bg-outline-variant/20 mx-4"></div>
      </div>

      <div className="mt-6 space-y-1 px-4">
        <button
          onClick={onOpenDocs}
          className={`flex w-full items-center gap-3 py-2 transition-colors text-[10px] uppercase font-label ${
            activeMode === 'docs' ? 'text-purple-400' : 'text-neutral-600 hover:text-purple-400'
          }`}
        >
          <span className="material-symbols-outlined text-sm">menu_book</span>
          <span>Docs & Models</span>
        </button>
        <button
          onClick={() => window.open('https://github.com/forhalunhaku/creep_cal', '_blank')}
          className="flex w-full items-center gap-3 py-2 text-neutral-600 hover:text-purple-400 transition-colors text-[10px] uppercase font-label"
        >
          <span className="material-symbols-outlined text-sm">contact_support</span>
          <span>GitHub Repository</span>
        </button>
      </div>
    </nav>
  );
}
