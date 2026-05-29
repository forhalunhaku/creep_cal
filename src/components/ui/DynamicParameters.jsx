import React, { useEffect, useRef, useState } from 'react';
import CustomSelect from './CustomSelect';

function formatLimit(value, unit) {
  const suffix = unit === 'Days' ? 'd' : unit === '°C' ? '°' : unit || '';
  return `${value}${suffix}`;
}

function NumericParameterInput({ value, min, max, unit, name, onChange, step, inputId }) {
  const [draft, setDraft] = useState(String(value));
  const cancelCommitRef = useRef(false);

  useEffect(() => {
    setDraft(String(value));
  }, [value]);

  const commitEdit = () => {
    if (cancelCommitRef.current) {
      cancelCommitRef.current = false;
      setDraft(String(value));
      return;
    }

    const parsed = parseFloat(draft);
    if (!isNaN(parsed)) {
      const clamped = Math.min(max, Math.max(min, parsed));
      onChange({ target: { name, value: clamped } });
      setDraft(String(clamped));
    } else {
      setDraft(String(value));
    }
  };

  return (
    <div className="flex items-stretch rounded-input border border-line bg-surface focus-within:border-green-border focus-within:ring-2 focus-within:ring-green/10">
      <input
        id={inputId}
        type="number"
        inputMode="decimal"
        value={draft}
        min={min}
        max={max}
        step={step}
        onChange={e => setDraft(e.target.value)}
        onBlur={commitEdit}
        onKeyDown={e => {
          if (e.key === 'Enter') e.currentTarget.blur();
          if (e.key === 'Escape') {
            cancelCommitRef.current = true;
            setDraft(String(value));
            e.currentTarget.blur();
          }
        }}
        className="h-11 w-full min-w-0 rounded-l-input bg-transparent px-3 text-right font-mono text-base text-primary outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      {unit && (
        <span className="flex min-w-12 items-center justify-center border-l border-line/50 px-3 text-[11px] font-label uppercase tracking-[0.08em] text-muted">
          {unit === 'Days' ? 'd' : unit}
        </span>
      )}
    </div>
  );
}

export function ParameterSlider({ label, value, min, max, unit, name, options, onChange, motionIndex = 0 }) {
  const step = max > 10 ? 1 : (max <= 1 ? 0.01 : 0.1);
  const inputId = `param-input-${name}`;

  if (options) {
    return (
      <div className="parameter-motion stagger-pop card p-4 space-y-3" style={{ '--stagger-index': motionIndex }}>
        <div className="flex items-center justify-between gap-3">
          <label className="font-label text-xs uppercase tracking-widest text-muted">
            {label}
          </label>
          <span className="material-symbols-outlined text-base text-green" aria-hidden="true">list_alt</span>
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
    <div className="parameter-motion stagger-pop card p-4 transition-colors focus-within:border-green-border hover:border-green-border/50" style={{ '--stagger-index': motionIndex }}>
      <div className="grid grid-cols-[minmax(0,1fr)_minmax(8rem,11rem)] items-center gap-4">
        <div className="min-w-0">
          <label htmlFor={inputId} className="block font-label text-xs uppercase tracking-widest text-muted">
            {label}
          </label>
          <div className="mt-1 flex items-center gap-2 text-[10px] font-label uppercase tracking-[0.12em] text-faint">
            <span>{formatLimit(min, unit)}</span>
            <span className="h-px w-5 bg-line/60"></span>
            <span>{formatLimit(max, unit)}</span>
          </div>
        </div>
        <NumericParameterInput
          value={value}
          min={min}
          max={max}
          unit={unit}
          step={step}
          name={name}
          onChange={onChange}
          inputId={inputId}
        />
      </div>
      <input 
        id={`param-${name}`}
        aria-label={`${label} slider`}
        className="mt-4 w-full accent-green" 
        name={name}
        type="range" 
        min={min} 
        max={max} 
        value={value} 
        onChange={onChange}
        step={step}
      />
    </div>
  );
}

export default function DynamicParameters({ paramsConfig, params, onParamChange, onCalculate, calculateReady, buttonText }) {
  return (
    <section className="space-y-8">
      <div className="card p-5 md:p-8">
        <div className="flex items-center gap-3 mb-8">
          <span className="material-symbols-outlined text-green" aria-hidden="true">tune</span>
          <div>
            <h2 className="font-sans text-xl font-semibold tracking-tight text-primary">Dynamic parameters</h2>
            <p className="mt-1 text-xs text-muted">{paramsConfig.length} inputs configured for the active model.</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {paramsConfig.map((config, idx) => {
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
            className={`calculate-trigger btn-primary w-full py-4 md:py-5 text-sm md:text-base tracking-[0.10em] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
              calculateReady ? 'shadow-card hover:shadow-card-hover' : ''
            }`}
          >
            <span className="material-symbols-outlined" aria-hidden="true" style={{fontVariationSettings: "'FILL' 1"}}>bolt</span>
            {buttonText || 'INITIATE CALCULATION'}
          </button>
        </div>
      </div>
    </section>
  );
}
