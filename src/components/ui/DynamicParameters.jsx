import React, { useState } from 'react';
import CustomSelect from './CustomSelect';

// Editable number display component
function EditableValue({ value, min, max, colorClass, onChange, name, step }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');

  const startEdit = () => {
    setDraft(String(value));
    setEditing(true);
  };

  const commitEdit = () => {
    const parsed = parseFloat(draft);
    if (!isNaN(parsed)) {
      const clamped = Math.min(max, Math.max(min, parsed));
      onChange({ target: { name, value: clamped } });
    }
    setEditing(false);
  };

  if (editing) {
    return (
      <input
        autoFocus
        type="number"
        value={draft}
        min={min}
        max={max}
        step={step}
        onChange={e => setDraft(e.target.value)}
        onBlur={commitEdit}
        onKeyDown={e => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') setEditing(false); }}
        className={`${colorClass} font-mono text-lg bg-transparent border-b border-current outline-none w-24 text-right [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`}
      />
    );
  }

  return (
    <span
      className={`${colorClass} font-headline text-lg cursor-text hover:opacity-80 transition-opacity border-b border-transparent hover:border-current`}
      title="Click to edit"
      onClick={startEdit}
    >
      {value}
    </span>
  );
}

// Reusable Slider Component
export function ParameterSlider({ label, value, min, max, unit, name, colorClass, options, onChange, motionIndex = 0 }) {
  const step = max > 10 ? 1 : (max <= 1 ? 0.01 : 0.1);

  if (options) {
    return (
      <div className="stagger-pop space-y-3" style={{ '--stagger-index': motionIndex }}>
        <div className="flex justify-between items-center">
          <label className="font-label text-xs uppercase tracking-widest text-on-surface-variant">
            {label}
          </label>
        </div>
        <CustomSelect
          name={name}
          value={value}
          onChange={onChange}
          options={options}
        />
      </div>
    );
  }

  return (
    <div className="stagger-pop space-y-4" style={{ '--stagger-index': motionIndex }}>
      <div className="flex justify-between items-center">
        <label className="font-label text-xs uppercase tracking-widest text-on-surface-variant">
          {label} {unit && `(${unit})`}
        </label>
        <EditableValue
          value={value}
          min={min}
          max={max}
          step={step}
          colorClass={colorClass}
          name={name}
          onChange={onChange}
        />
      </div>
      <input 
        className="w-full" 
        name={name}
        type="range" 
        min={min} 
        max={max} 
        value={value} 
        onChange={onChange}
        step={step}
      />
      <div className="flex justify-between text-[10px] text-neutral-600 font-label">
        <span>{min}{unit ? (unit === '%' ? '%' : (unit === '°C' ? '°' : unit === 'Days' ? 'd' : '')) : ''}</span>
        <span>{max}{unit ? (unit === '%' ? '%' : (unit === '°C' ? '°' : unit === 'Days' ? 'd' : '')) : ''}</span>
      </div>
    </div>
  );
}


// B4 / ACI209 / MC2010 parameters differ. We will pass a configs array.
export default function DynamicParameters({ paramsConfig, params, onParamChange, onCalculate, calculateReady, buttonText }) {
  return (
    <section className="col-span-12 lg:col-span-8 space-y-8">
      <div className="glass-card rounded-lg p-5 md:p-8 border border-outline-variant/30">
        <div className="flex items-center gap-3 mb-8">
          <span className="material-symbols-outlined text-primary" aria-hidden="true">tune</span>
          <div>
            <h2 className="font-headline text-xl font-semibold tracking-tight">Dynamic parameters</h2>
            <p className="mt-1 text-xs text-on-surface-variant">{paramsConfig.length} inputs configured for the active model.</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
          {paramsConfig.map((config, idx) => {
            const colors = [
              "text-primary", 
              "text-secondary", 
              "text-on-surface", 
              "text-primary-fixed-dim",
              "text-tertiary",
              "text-outline"
            ];
            const colorClass = colors[idx % colors.length];
            return (
              <ParameterSlider
                key={config.name}
                motionIndex={idx}
                label={config.label}
                name={config.name}
                value={params[config.name] ?? config.min}
                min={config.min}
                max={config.max}
                unit={config.unit}
                options={config.options}
                colorClass={colorClass}
                onChange={onParamChange}
              />
            );
          })}
        </div>

        <div className="mt-12 flex flex-col sm:flex-row gap-4">
          <button 
            onClick={onCalculate}
            disabled={!calculateReady}
            aria-busy={!calculateReady}
            className={`w-full ${calculateReady ? 'kinetic-gradient hover:brightness-110 hover:-translate-y-0.5' : 'bg-surface-container-high opacity-70'} text-on-primary-fixed py-5 rounded-md font-headline font-bold text-base md:text-lg tracking-[0.16em] shadow-[0_18px_40px_rgba(2,14,16,0.28)] transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-4 disabled:cursor-not-allowed`}
          >
            <span className="material-symbols-outlined" aria-hidden="true" style={{fontVariationSettings: "'FILL' 1"}}>bolt</span>
            {buttonText || 'INITIATE CALCULATION'}
          </button>
        </div>
      </div>
    </section>
  );
}
