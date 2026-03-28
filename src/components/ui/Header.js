import React from 'react';

export default function Header() {
  return (
    <header className="fixed top-0 w-full z-50 bg-neutral-950/60 backdrop-blur-xl shadow-[0_0_20px_rgba(143,245,255,0.08)] flex justify-between items-center px-8 h-20">
      <div className="flex items-center gap-4">
        <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent font-['Space_Grotesk'] tracking-tight">CREEP_LAB</span>
        <div className="h-4 w-[1px] bg-outline-variant mx-2"></div>
        <div className="flex items-center gap-2 text-xs font-label uppercase tracking-widest text-primary">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
          System Operational
        </div>
      </div>
    </header>
  );
}
