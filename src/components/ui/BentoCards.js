import React from 'react';

export default function BentoCards({ concreteClass, crossSectionInfo }) {
  return (
    <div className="grid grid-cols-2 gap-8 mt-8">
      <div className="glass-card rounded-lg p-6 border border-outline-variant/10">
        <div className="text-[10px] font-label text-secondary uppercase tracking-widest mb-2">Concrete Class</div>
        <div className="text-2xl font-headline text-on-background">{concreteClass || 'C35/45'}</div>
        <div className="mt-4 flex gap-2">
          <span className="px-2 py-1 bg-secondary/10 text-secondary text-[10px] rounded border border-secondary/20 font-label">QUARTZITE</span>
          <span className="px-2 py-1 bg-secondary/10 text-secondary text-[10px] rounded border border-secondary/20 font-label">TYPE_N</span>
        </div>
      </div>
      <div className="glass-card rounded-lg p-6 border border-outline-variant/10">
        <div className="text-[10px] font-label text-primary uppercase tracking-widest mb-2">Effective Cross-Section</div>
        <div className="text-2xl font-headline text-on-background">{crossSectionInfo || 'h_e: 180mm'}</div>
        <div className="mt-4 text-[10px] text-neutral-500 font-body">Calculated based on 2 * Ac / u relationship for slab geometry.</div>
      </div>
    </div>
  );
}
