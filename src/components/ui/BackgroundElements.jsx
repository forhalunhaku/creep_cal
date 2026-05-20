import React from 'react';

export default function BackgroundElements() {
  return (
    <>
      <div className="fixed right-[-18rem] top-16 h-[34rem] w-[34rem] rotate-12 bg-[radial-gradient(ellipse_at_center,rgba(110,231,216,0.12),transparent_62%)] blur-3xl pointer-events-none"></div>
      <div className="fixed bottom-[-16rem] left-[10%] h-[34rem] w-[48rem] -rotate-6 bg-[radial-gradient(ellipse_at_center,rgba(214,166,66,0.10),transparent_64%)] blur-3xl pointer-events-none"></div>
      <div className="noise-overlay"></div>
    </>
  );
}
