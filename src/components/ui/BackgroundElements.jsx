import React from 'react';

export default function BackgroundElements() {
  return (
    <>
      {/* Subtle green ambient glow — top right */}
      <div className="fixed right-[-18rem] top-16 h-[34rem] w-[34rem] rotate-12 bg-[radial-gradient(ellipse_at_center,rgba(47,111,78,0.06),transparent_62%)] blur-3xl pointer-events-none" />
      {/* Subtle green ambient glow — bottom left */}
      <div className="fixed bottom-[-16rem] left-[10%] h-[34rem] w-[48rem] -rotate-6 bg-[radial-gradient(ellipse_at_center,rgba(47,111,78,0.04),transparent_64%)] blur-3xl pointer-events-none" />
    </>
  );
}
