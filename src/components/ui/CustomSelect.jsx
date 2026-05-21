import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

/**
 * CustomSelect: compact trigger with a portal-rendered menu.
 * Props:
 *   name, value, onChange, options: [{ value, label }] | [string]
 *   label (optional) – not rendered here, callers handle the label
 */
export default function CustomSelect({ name, value, onChange, options }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Normalise options
  const opts = options.map(o =>
    typeof o === 'string' ? { value: o, label: o } : o
  );

  const selected = opts.find(o => o.value === value) || opts[0];

  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });

  const updateCoords = useCallback(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + window.scrollY + 8, // 8px margin
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      // Check if click is outside both the trigger and the portal content
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

  // Update coords on open/scroll/resize
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

  // Assign a deterministic accent colour per option (cycles through palette)
  const palette = [
    'text-primary bg-primary/12',
    'text-secondary bg-secondary/14',
    'text-green-700 bg-green-500/12',
    'text-on-surface bg-surface-container-high',
  ];

  return (
    <div className={`relative w-full ${open ? 'z-40' : 'z-0'}`} ref={ref}>
      {/* ── Trigger ─────────────────────────────────────────────── */}
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className={`
          w-full flex items-center justify-between
          px-5 py-3 rounded-md text-sm font-body
          bg-surface-container-high text-on-surface
          border transition-all duration-200
          ${open
            ? 'border-primary ring-1 ring-primary/30'
            : 'border-outline-variant/30 hover:border-primary/50'
          }
        `}
      >
        <span className="truncate">{selected?.label}</span>
        <span
          aria-hidden="true"
          className={`material-symbols-outlined text-[18px] text-primary ml-2 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        >
          expand_more
        </span>
      </button>

      {/* ── Dropdown list (PORTAL) ─────────────────────────────── */}
      {open && typeof document !== 'undefined' && createPortal(
        <div 
          className="custom-select-portal absolute z-50 bg-surface-container border border-primary/25 rounded-lg shadow-[0_18px_50px_rgba(29,29,31,0.14)] overflow-hidden"
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
                    ? 'bg-primary/20 text-primary'
                    : 'text-on-surface hover:bg-surface-container-high'
                  }
                `}
              >
                {/* Letter badge */}
                <span className={`
                  w-7 h-7 rounded-md flex-shrink-0 flex items-center justify-center
                  text-[11px] font-headline font-bold ${accent}
                `}>
                  {letter}
                </span>

                {/* Label */}
                <span className="flex-1 truncate">{opt.label}</span>

                {/* Checkmark / selected indicator */}
                {isSelected && (
                  <span className="material-symbols-outlined text-[16px] text-primary" aria-hidden="true">check_circle</span>
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
