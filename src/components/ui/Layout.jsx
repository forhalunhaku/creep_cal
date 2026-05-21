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
    <div className="min-h-[100dvh] bg-background text-on-background font-body selection:bg-primary selection:text-on-primary-fixed overflow-x-hidden bg-grid">
      <BackgroundElements />
      <Header />
      <Sidebar 
        activeMode={activeMode} 
        onModeChange={onModeChange}
        onOpenDocs={onOpenDocs}
      />

      <main id="main-content" className="relative z-[2] px-4 pb-12 pt-40 md:ml-72 md:px-10 md:pt-28 lg:px-12 min-h-[100dvh]">
        {children}
      </main>

      <footer className="relative z-[2] w-full border-t border-outline-variant/30 bg-surface-container-low/80 px-4 py-4 md:ml-72 md:w-[calc(100%-18rem)] md:px-12">
        <div className="flex flex-col gap-3 text-[10px] uppercase tracking-[0.18em] text-outline md:flex-row md:items-center md:justify-between">
          <div>
            © 2026 halunhaku. Concrete creep calculation workspace.
          </div>
          <div className="flex flex-wrap gap-4 text-on-surface-variant md:gap-8">
            <span>Vite build</span>
            <span>Rust WASM</span>
            <span>CSV / XLSX</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
