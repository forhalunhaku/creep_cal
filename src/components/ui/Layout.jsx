import React from 'react';
import Header from './Header';
import BackgroundElements from './BackgroundElements';

export default function Layout({ 
  activeMode, 
  onModeChange, 
  onOpenDocs,
  children 
}) {
  return (
    <div className="min-h-[100dvh] bg-background text-primary font-body selection:bg-green selection:text-white overflow-x-hidden">
      <BackgroundElements />
      <Header 
        activeMode={activeMode} 
        onModeChange={onModeChange}
        onOpenDocs={onOpenDocs}
      />

      <main id="main-content" className="relative z-[2] px-4 pb-16 pt-28 md:px-8 lg:px-12 max-w-content mx-auto min-h-[100dvh]">
        {children}
      </main>

      <footer className="relative z-[2] w-full border-t border-line/30 bg-surface/80 px-4 py-4 md:px-12">
        <div className="max-w-content mx-auto flex flex-col gap-3 text-[10px] uppercase tracking-[0.18em] text-muted md:flex-row md:items-center md:justify-between">
          <div>
            © 2026 halunhaku. Concrete creep calculation workspace.
          </div>
          <div className="flex flex-wrap gap-4 text-faint md:gap-8">
            <span>Vite build</span>
            <span>Rust WASM</span>
            <span>CSV / XLSX</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
