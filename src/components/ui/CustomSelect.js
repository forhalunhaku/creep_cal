import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

/**
 * CustomSelect – matches the pill-trigger + dark-card design reference.
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
    'text-cyan-300 bg-cyan-500/15',
    'text-purple-300 bg-purple-500/15',
    'text-emerald-300 bg-emerald-500/15',
    'text-amber-300 bg-amber-500/15',
    'text-rose-300 bg-rose-500/15',
    'text-sky-300 bg-sky-500/15',
    'text-pink-300 bg-pink-500/15',
  ];

  return (
    <div className={`relative w-full ${open ? 'z-[100]' : 'z-0'}`} ref={ref}>
      {/* ── Trigger ─────────────────────────────────────────────── */}
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className={`
          w-full flex items-center justify-between
          px-5 py-3 rounded-full text-sm font-body
          bg-surface-container-high text-on-surface
          border transition-all duration-200
          ${open
            ? 'border-primary shadow-[0_0_0_1px_#8ff5ff40] ring-1 ring-primary/30'
            : 'border-outline-variant/30 hover:border-primary/50 hover:shadow-[0_0_0_1px_#8ff5ff20]'
          }
        `}
      >
        <span className="truncate">{selected?.label}</span>
        <span
          className={`material-symbols-outlined text-[18px] text-primary ml-2 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        >
          expand_more
        </span>
      </button>

      {/* ── Dropdown list (PORTAL) ─────────────────────────────── */}
      {open && typeof document !== 'undefined' && createPortal(
        <div 
          className="custom-select-portal absolute z-[9999] bg-[#111118] border border-primary/30 rounded-2xl shadow-[0_4px_32px_rgba(0,0,0,0.6),0_0_0_1px_#8ff5ff18] overflow-hidden"
          style={{ top: coords.top, left: coords.left, width: coords.width }}
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
                className={`
                  w-full flex items-center gap-3 px-4 py-3 text-sm text-left
                  transition-colors duration-150
                  ${isSelected
                    ? 'bg-primary/20 text-primary'
                    : 'text-on-surface hover:bg-white/5'
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
                  <span className="material-symbols-outlined text-[16px] text-primary">check_circle</span>
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
