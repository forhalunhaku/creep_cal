import React from 'react';

export default function BackgroundElements() {
  return (
    <>
      <div className="fixed top-[20%] right-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
      <div className="fixed bottom-[-10%] left-[20%] w-[600px] h-[600px] bg-secondary/5 rounded-full blur-[150px] -z-10 pointer-events-none"></div>
    </>
  );
}
