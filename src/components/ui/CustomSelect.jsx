import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

export default function CustomSelect({ name, value, onChange, options }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const opts = options.map(o =>
    typeof o === 'string' ? { value: o, label: o } : o
  );

  const selected = opts.find(o => o.value === value) || opts[0];

  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });

  const updateCoords = useCallback(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
  }, []);

  useEffect(() => {
    const handler = (e) => {
      const isOutsideTrigger = ref.current && !ref.current.contains(e.target);
      const portalElements = document.querySelectorAll('.custom-select-portal');
      const isOutsidePortal = Array.from(portalElements).every(el => !el.contains(e.target));
      
      if (isOutsideTrigger && isOutsidePortal) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (open) {
      updateCoords();
      window.addEventListener('scroll', updateCoords, true);
      window.addEventListener('resize', updateCoords);
    }
    return () => {
      window.removeEventListener('scroll', updateCoords, true);
      window.removeEventListener('resize', updateCoords);
    };
  }, [open, updateCoords]);

  const handleSelect = (opt) => {
    onChange({ target: { name, value: opt.value } });
    setOpen(false);
  };

  const palette = [
    'text-green-dark bg-green-soft',
    'text-muted bg-surface-soft',
    'text-muted bg-surface-soft',
    'text-muted bg-surface-soft',
  ];

  return (
    <div className={`relative w-full ${open ? 'z-40' : 'z-0'}`} ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className={`
          w-full flex items-center justify-between
          px-5 py-3 rounded-full text-sm font-body
          bg-surface-soft text-primary
          border transition-all duration-200
          ${open
            ? 'border-green-border ring-1 ring-green/30'
            : 'border-line/30 hover:border-green-border/60'
          }
        `}
      >
        <span className="truncate">{selected?.label}</span>
        <span
          aria-hidden="true"
          className={`material-symbols-outlined text-[18px] text-green ml-2 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        >
          expand_more
        </span>
      </button>

      {open && typeof document !== 'undefined' && createPortal(
        <div 
          className="custom-select-portal absolute z-50 bg-surface border border-green-border/30 rounded-card shadow-card overflow-hidden"
          style={{ top: coords.top, left: coords.left, width: coords.width }}
          role="listbox"
        >
          {opts.map((opt, idx) => {
            const isSelected = opt.value === value;
            const accent = palette[idx % palette.length];
            const letter = (opt.label || opt.value)[0].toUpperCase();

            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleSelect(opt)}
                role="option"
                aria-selected={isSelected}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 text-sm text-left
                  transition-colors duration-150
                  ${isSelected
                    ? 'bg-green-soft text-green-dark'
                    : 'text-primary hover:bg-surface-soft'
                  }
                `}
              >
                <span className={`w-7 h-7 rounded-md flex-shrink-0 flex items-center justify-center text-[11px] font-sans font-bold ${accent}`}>
                  {letter}
                </span>
                <span className="flex-1 truncate">{opt.label}</span>
                {isSelected && (
                  <span className="material-symbols-outlined text-[16px] text-green" aria-hidden="true">check_circle</span>
                )}
              </button>
            );
          })}
        </div>,
        document.body
      )}
    </div>
  );
}
