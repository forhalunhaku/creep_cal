import React from 'react';

export default function Header() {
  return (
    <header className="fixed top-0 z-30 flex h-14 w-full items-center justify-between border-b border-outline-variant/30 bg-background/80 px-4 backdrop-blur-xl md:h-20 md:px-8 md:pl-80">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-40 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-on-primary">
        Skip to content
      </a>
      <div className="flex min-w-0 items-center gap-3 md:gap-4">
        <span className="font-headline text-lg font-extrabold tracking-tight text-on-background md:text-2xl">CREEP LAB</span>
        <div className="hidden h-5 w-px bg-outline-variant md:block"></div>
        <div className="flex items-center gap-2 text-[10px] font-label uppercase tracking-[0.22em] text-primary md:text-xs">
          <span className="h-2 w-2 rounded-sm bg-primary shadow-[0_0_0_4px_rgba(0,113,227,0.08)]" aria-hidden="true"></span>
          <span className="hidden sm:inline">Local compute ready</span>
        </div>
      </div>
      <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-outline">ACI / MC / B4</div>
    </header>
  );
}
