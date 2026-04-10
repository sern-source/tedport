{/* Enes Doğanay | 9 Nisan 2026: Aranabilir şehir seçici dropdown — aşağı açılır, fixed pozisyonlu */}
{/* Enes Doğanay | 10 Nisan 2026: createPortal eklendi — ancestor transform içinde fixed pozisyon düzeltmesi */}
{/* Enes Doğanay | 10 Nisan 2026: options/placeholder prop desteği — ilçe ve diğer listeler için genelleştirildi */}
import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { TURKEY_DISTRICTS } from './turkeyDistricts';
import './CitySelect.css';

const cities = Object.keys(TURKEY_DISTRICTS);

export default function CitySelect({ value, onChange, options, placeholder, icon }) {
  const items = options || cities;
  const placeholderText = placeholder || 'Şehir seçiniz';
  const optionIcon = icon || 'location_on';
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [style, setStyle] = useState({});
  const triggerRef = useRef(null);
  const dropdownRef = useRef(null);

  const calcPosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setStyle({
      position: 'fixed',
      top: rect.bottom + 4,
      left: rect.left,
      width: rect.width,
      zIndex: 99999,
    });
  }, []);

  const handleOpen = () => {
    if (!open) {
      calcPosition();
      setSearch('');
    }
    setOpen(prev => !prev);
  };

  const handleSelect = (city) => {
    onChange(city);
    setOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange('');
    setOpen(false);
  };

  // Enes Doğanay | 9 Nisan 2026: Dışarı tıklama → kapat
  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e) => {
      if (
        triggerRef.current && !triggerRef.current.contains(e.target) &&
        dropdownRef.current && !dropdownRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  // Enes Doğanay | 9 Nisan 2026: Scroll/resize sırasında pozisyon güncelle
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

  // Enes Doğanay | 10 Nisan 2026: Türkçe locale ile büyük/küçük harf duyarsız arama
  const filtered = items.filter(c => c.toLocaleLowerCase('tr-TR').includes(search.toLocaleLowerCase('tr-TR')));

  return (
    <div className="city-select">
      <button
        type="button"
        className={`city-select-trigger ${open ? 'city-select-trigger--open' : ''}`}
        ref={triggerRef}
        onClick={handleOpen}
      >
        <span className={value ? 'city-select-value' : 'city-select-placeholder'}>
          {value || placeholderText}
        </span>
        <span className="city-select-actions">
          {value && (
            <span className="city-select-clear" onClick={handleClear} title="Temizle">
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>close</span>
            </span>
          )}
          <span className="material-symbols-outlined city-select-arrow" style={{ transform: open ? 'rotate(180deg)' : 'none' }}>
            expand_more
          </span>
        </span>
      </button>

      {/* Enes Doğanay | 10 Nisan 2026: Portal ile body'ye render — transform ancestor sorununu çözer */}
      {open && createPortal(
        <div className="city-select-dropdown" ref={dropdownRef} style={style}>
          <div className="city-select-search-wrap">
            <span className="material-symbols-outlined">search</span>
            <input
              type="text"
              className="city-select-search"
              placeholder="Ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
          </div>
          <div className="city-select-list">
            {filtered.length > 0 ? filtered.map(item => (
              <div
                key={item}
                className={`city-select-option ${item === value ? 'city-select-option--active' : ''}`}
                onClick={() => handleSelect(item)}
              >
                <span className="material-symbols-outlined city-select-option-icon">{optionIcon}</span>
                {item}
              </div>
            )) : (
              <div className="city-select-empty">Sonuç bulunamadı</div>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
