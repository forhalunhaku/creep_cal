import React from 'react';

export default function BentoCards({ concreteClass, crossSectionInfo }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mt-8">
      <div className="motion-card glass-card rounded-lg p-6 border border-outline-variant/20 md:col-span-3">
        <div className="text-[10px] font-label text-secondary uppercase tracking-[0.18em] mb-2">Model context</div>
        <div className="text-2xl font-headline text-on-background">{concreteClass || 'C35/45'}</div>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="px-2 py-1 bg-secondary/10 text-secondary text-[10px] rounded-sm border border-secondary/20 font-label uppercase tracking-[0.12em]">Current input</span>
          <span className="px-2 py-1 bg-surface-container-high text-outline text-[10px] rounded-sm border border-outline-variant/20 font-label uppercase tracking-[0.12em]">Editable</span>
        </div>
      </div>
      <div className="motion-card glass-card rounded-lg p-6 border border-outline-variant/20 md:col-span-2">
        <div className="text-[10px] font-label text-primary uppercase tracking-[0.18em] mb-2">Geometry / material cue</div>
        <div className="text-2xl font-headline text-on-background">{crossSectionInfo || 'h_e: 180mm'}</div>
        <div className="mt-4 text-[10px] text-neutral-500 font-body leading-relaxed">
          This field follows the selected model and mirrors the active calculator inputs.
        </div>
      </div>
    </div>
  );
}
