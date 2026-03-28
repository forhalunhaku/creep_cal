import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import BackgroundElements from './BackgroundElements';
import DynamicParameters from './DynamicParameters';
import ResultsSidebar from './ResultsSidebar';
import BentoCards from './BentoCards';

export default function Dashboard({ 
  activeModel, 
  onModelChange, 
  onNewCalculation,
  onOpenDocs,
  paramsConfig, 
  params, 
  onParamChange, 
  onCalculate, 
  calculateReady, 
  phiResult, 
  feedLogs,
  modelName,
  modelDescription
}) {
  return (
    <div className="min-h-screen bg-background text-on-background font-body selection:bg-primary selection:text-on-primary-fixed overflow-x-hidden bg-grid">
      <BackgroundElements />
      <Header />
      <Sidebar 
        activeModel={activeModel} 
        onModelChange={onModelChange} 
        onNewCalculation={onNewCalculation}
        onOpenDocs={onOpenDocs}
      />

      <main className="ml-72 pt-28 px-12 pb-12 min-h-screen">
        <header className="mb-12 flex justify-between items-end">
          <div className="max-w-2xl">
            <h1 className="font-headline text-5xl font-bold tracking-tight text-on-background mb-4">
              {modelName} <span className="text-primary italic">Analysis</span>
            </h1>
            <p className="text-on-surface-variant text-lg leading-relaxed">
              {modelDescription}
            </p>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-label text-outline uppercase tracking-widest mb-1">Local Processing Node</div>
            <div className="text-xl font-headline text-primary-dim">EU_STATION_04</div>
          </div>
        </header>

        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 lg:col-span-8">
            <DynamicParameters 
              paramsConfig={paramsConfig} 
              params={params} 
              onParamChange={onParamChange}
              onCalculate={onCalculate}
              calculateReady={calculateReady}
            />
            <BentoCards />
          </div>
          
          <ResultsSidebar phi={phiResult} feedLogs={feedLogs} />
        </div>
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
