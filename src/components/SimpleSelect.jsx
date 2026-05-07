/* Enes Doğanay | 1 Mayıs 2026: Basit seçici dropdown — az seçenek için CitySelect benzeri stil */
import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import './SimpleSelect.css';

/**
 * @param {string} value          — seçili değer (option.value)
 * @param {function} onChange      — (value) => void
 * @param {Array}  options        — [{ value, label, disabled?, icon? }]
 * @param {string} placeholder    — boş durum metni
 * @param {string} icon           — trigger'daki material-symbol (opsiyonel)
 */
export default function SimpleSelect({ value, onChange, options = [], placeholder = 'Seçiniz', icon }) {
  const [open, setOpen] = useState(false);
  const [style, setStyle] = useState({});
  const triggerRef = useRef(null);
  const dropdownRef = useRef(null);

  const selected = options.find(o => o.value === value);

  const calcPosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const dropHeight = Math.min(options.length * 46 + 8, 260);
    const openUp = spaceBelow < dropHeight + 8 && rect.top > dropHeight;
    setStyle({
      position: 'fixed',
      [openUp ? 'bottom' : 'top']: openUp ? window.innerHeight - rect.top + 4 : rect.bottom + 4,
      left: rect.left,
      width: rect.width,
      zIndex: 99999,
    });
  }, [options.length]);

  const handleOpen = () => {
    if (!open) calcPosition();
    setOpen(prev => !prev);
  };

  const handleSelect = (opt) => {
    if (opt.disabled) return;
    onChange(opt.value);
    setOpen(false);
  };

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (
        triggerRef.current && !triggerRef.current.contains(e.target) &&
        dropdownRef.current && !dropdownRef.current.contains(e.target)
      ) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const update = () => calcPosition();
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [open, calcPosition]);

  return (
    <div className="simple-select">
      <button
        type="button"
        className={`simple-select-trigger${open ? ' simple-select-trigger--open' : ''}`}
        ref={triggerRef}
        onClick={handleOpen}
      >
        {icon && (
          <span className="material-symbols-outlined simple-select-icon">{icon}</span>
        )}
        <span className={selected ? 'simple-select-value' : 'simple-select-placeholder'}>
          {selected ? selected.label : placeholder}
        </span>
        <span
          className="material-symbols-outlined simple-select-arrow"
          style={{ transform: open ? 'rotate(180deg)' : 'none' }}
        >
          expand_more
        </span>
      </button>

      {open && createPortal(
        <div className="simple-select-dropdown" ref={dropdownRef} style={style}>
          <ul className="simple-select-list">
            {options.map(opt => (
              <li
                key={opt.value}
                className={[
                  'simple-select-option',
                  opt.value === value ? 'simple-select-option--active' : '',
                  opt.disabled ? 'simple-select-option--disabled' : '',
                ].join(' ').trim()}
                onClick={() => handleSelect(opt)}
              >
                {opt.icon && (
                  <span className="material-symbols-outlined simple-select-opt-icon">{opt.icon}</span>
                )}
                <span className="simple-select-opt-label">{opt.label}</span>
                {opt.value === value && (
                  <span className="material-symbols-outlined simple-select-opt-check">check</span>
                )}
              </li>
            ))}
          </ul>
        </div>,
        document.body
      )}
    </div>
  );
}
