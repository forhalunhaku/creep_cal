import React from 'react';

export default function BackgroundElements() {
  const dots = Array.from({ length: 64 }, (_, i) => i);

  return (
    <>
      <div className="fixed right-[-18rem] top-16 h-[34rem] w-[34rem] rotate-12 bg-[radial-gradient(ellipse_at_center,rgba(0,113,227,0.10),transparent_62%)] blur-3xl pointer-events-none"></div>
      <div className="fixed bottom-[-16rem] left-[10%] h-[34rem] w-[48rem] -rotate-6 bg-[radial-gradient(ellipse_at_center,rgba(142,142,147,0.10),transparent_64%)] blur-3xl pointer-events-none"></div>
      <div className="motion-field fixed right-6 top-28 hidden h-44 w-44 grid-cols-8 gap-3 pointer-events-none md:grid" aria-hidden="true">
        {dots.map((dot) => (
          <span key={dot} className="motion-dot" style={{ '--dot-index': dot }} />
        ))}
      </div>
      <div className="noise-overlay"></div>
    </>
  );
}
