/* Enes Doğanay | 1 Mayıs 2026: Basit seçici dropdown — az seçenek için CitySelect benzeri stil */
// Enes Doğanay | 12 Mayıs 2026: searchable prop eklendi — çok seçenekli listeler için arama filtresi
import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import './SimpleSelect.css';

/**
 * @param {string} value          — seçili değer (option.value)
 * @param {function} onChange      — (value) => void
 * @param {Array}  options        — [{ value, label, disabled?, icon? }]
 * @param {string} placeholder    — boş durum metni
 * @param {string} icon           — trigger'daki material-symbol (opsiyonel)
 * @param {boolean} searchable    — arama filtresi göster
 */
export default function SimpleSelect({ value, onChange, options = [], placeholder = 'Seçiniz', icon, searchable = false }) {
  const [open, setOpen] = useState(false);
  const [style, setStyle] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const triggerRef = useRef(null);
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);

  const selected = options.find(o => o.value === value);

  const filteredOptions = searchable && searchTerm.trim()
    ? options.filter(o => o.label.toLowerCase().includes(searchTerm.toLowerCase()))
    : options;

  const calcPosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const dropHeight = searchable ? 320 : Math.min(options.length * 40 + 8, 260);
    const openUp = spaceBelow < dropHeight + 8 && rect.top > dropHeight;
    setStyle({
      position: 'fixed',
      [openUp ? 'bottom' : 'top']: openUp ? window.innerHeight - rect.top + 4 : rect.bottom + 4,
      left: rect.left,
      width: rect.width,
      zIndex: 99999,
    });
  }, [options.length, searchable]);

  const handleOpen = () => {
    if (!open) { calcPosition(); setSearchTerm(''); }
    setOpen(prev => !prev);
  };

  const handleSelect = (opt) => {
    if (opt.disabled) return;
    onChange(opt.value);
    setOpen(false);
    setSearchTerm('');
  };

  useEffect(() => {
    if (open && searchable && searchRef.current) {
      setTimeout(() => searchRef.current?.focus(), 50);
    }
  }, [open, searchable]);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (
        triggerRef.current && !triggerRef.current.contains(e.target) &&
        dropdownRef.current && !dropdownRef.current.contains(e.target)
      ) { setOpen(false); setSearchTerm(''); }
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
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={selected ? selected.label : placeholder}
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
          {/* Enes Doğanay | 12 Mayıs 2026: Arama kutusu — searchable prop ile aktif */}
          {searchable && (
            <div className="simple-select-search-wrap">
              <span className="material-symbols-outlined simple-select-search-icon">search</span>
              <input
                ref={searchRef}
                className="simple-select-search"
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Sektör ara..."
                autoComplete="off"
              />
              {searchTerm && (
                <button type="button" className="simple-select-search-clear" onClick={() => setSearchTerm('')}>
                  <span className="material-symbols-outlined">close</span>
                </button>
              )}
            </div>
          )}
          <ul className="simple-select-list" role="listbox" aria-label={placeholder}>
            {filteredOptions.length === 0 && (
              <li className="simple-select-empty">Sonuç bulunamadı</li>
            )}
            {filteredOptions.map(opt => (
              <li
                key={opt.value}
                className={[
                  'simple-select-option',
                  opt.value === value ? 'simple-select-option--active' : '',
                  opt.disabled ? 'simple-select-option--disabled' : '',
                ].join(' ').trim()}
                onClick={() => handleSelect(opt)}
                role="option"
                aria-selected={opt.value === value}
                aria-disabled={opt.disabled ?? false}
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
