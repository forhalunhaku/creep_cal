import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import BackgroundElements from './BackgroundElements';

export default function Layout({ 
  activeMode, 
  onModeChange, 
  onOpenDocs,
  children 
}) {
  return (
    <div className="min-h-screen bg-background text-on-background font-body selection:bg-primary selection:text-on-primary-fixed overflow-x-hidden bg-grid">
      <BackgroundElements />
      <Header />
      <Sidebar 
        activeMode={activeMode} 
        onModeChange={onModeChange}
        onOpenDocs={onOpenDocs}
      />

      <main className="ml-72 pt-28 px-12 pb-12 min-h-screen">
        {children}
      </main>

      <footer className="w-full py-4 mt-auto bg-neutral-950 border-t border-neutral-800/50 flex justify-between items-center px-12 ml-72">
        <div className="text-neutral-500 font-['Manrope'] text-[10px] uppercase tracking-tighter">
          © 2025 halunhaku ALL RIGHTS RESERVED.
        </div>
        <div className="flex gap-8">
          <span className="text-neutral-600 hover:text-purple-400 transition-colors text-[10px] uppercase font-['Manrope'] tracking-tighter cursor-pointer">Technical Specifications</span>
          <span className="text-neutral-600 hover:text-purple-400 transition-colors text-[10px] uppercase font-['Manrope'] tracking-tighter cursor-pointer">Validation Reports</span>
          <span className="text-neutral-600 hover:text-purple-400 transition-colors text-[10px] uppercase font-['Manrope'] tracking-tighter cursor-pointer">API Reference</span>
        </div>
      </footer>
    </div>
  );
}
