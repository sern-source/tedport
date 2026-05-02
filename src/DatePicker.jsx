// Enes Doğanay | 2 Mayıs 2026: Özel takvim bileşeni — native input type="date" yerine
// Enes Doğanay | 2 Mayıs 2026: Yıl seçim grid'i eklendi — başlığa tıklayınca açılır
// createPortal tabanlı, CitySelect ile aynı yaklaşım
import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import './DatePicker.css';

const MONTHS_TR = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
const DAYS_TR = ['Pt','Sa','Ça','Pe','Cu','Ct','Pa'];

function toStr(year, month1based, day) {
    return `${year}-${String(month1based).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function toDisplay(val) {
    if (!val) return '';
    const [y, m, d] = val.split('-');
    return `${d}.${m}.${y}`;
}

function buildCells(viewYear, viewMonth) {
    const firstDow = new Date(viewYear, viewMonth, 1).getDay();
    const startOffset = firstDow === 0 ? 6 : firstDow - 1;
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrev  = new Date(viewYear, viewMonth, 0).getDate();
    const cells = [];
    for (let i = startOffset - 1; i >= 0; i--) cells.push({ day: daysInPrev - i, type: 'other' });
    for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, type: 'cur', dateStr: toStr(viewYear, viewMonth + 1, d) });
    let next = 1;
    while (cells.length < 42) cells.push({ day: next++, type: 'other' });
    return cells;
}

// Enes Doğanay | 2 Mayıs 2026: DatePicker bileşeni
// Props: value (YYYY-MM-DD), onChange(val), min (YYYY-MM-DD), placeholder, variant ("amber")
export default function DatePicker({ value, onChange, min, placeholder = 'gg.aa.yyyy', variant, className }) {
    const today    = new Date();
    const todayStr = toStr(today.getFullYear(), today.getMonth() + 1, today.getDate());

    const [open, setOpen]             = useState(false);
    const [yearView, setYearView]     = useState(false);
    const [yearRangeStart, setYearRangeStart] = useState(() => {
        const base = value ? parseInt(value.split('-')[0]) : today.getFullYear();
        return Math.floor((base - 1) / 12) * 12 + 1;
    });
    const [viewYear, setViewYear]     = useState(() => value ? parseInt(value.split('-')[0]) : today.getFullYear());
    const [viewMonth, setViewMonth]   = useState(() => value ? parseInt(value.split('-')[1]) - 1 : today.getMonth());
    const [panelStyle, setPanelStyle] = useState({});

    const triggerRef = useRef(null);
    const panelRef   = useRef(null);

    const calcPosition = useCallback(() => {
        if (!triggerRef.current) return;
        const rect = triggerRef.current.getBoundingClientRect();
        setPanelStyle({
            position: 'fixed',
            top:  rect.bottom + 6,
            left: rect.left,
            width: Math.max(rect.width, 280),
            zIndex: 99999,
        });
    }, []);

    const handleOpen = () => {
        if (!open) {
            calcPosition();
            const base = value ? parseInt(value.split('-')[0]) : today.getFullYear();
            setViewYear(base);
            setViewMonth(value ? parseInt(value.split('-')[1]) - 1 : today.getMonth());
            setYearRangeStart(Math.floor((base - 1) / 12) * 12 + 1);
            setYearView(false);
        }
        setOpen(o => !o);
    };

    useEffect(() => {
        if (!open) return;
        const handler = (e) => {
            if (
                triggerRef.current && !triggerRef.current.contains(e.target) &&
                panelRef.current   && !panelRef.current.contains(e.target)
            ) { setOpen(false); setYearView(false); }
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

    const prevMonth = () => setViewMonth(m => { if (m === 0) { setViewYear(y => y - 1); return 11; } return m - 1; });
    const nextMonth = () => setViewMonth(m => { if (m === 11) { setViewYear(y => y + 1); return 0; } return m + 1; });

    const selectDay = (cell) => {
        if (cell.type !== 'cur') return;
        if (min && cell.dateStr < min) return;
        onChange(cell.dateStr);
        setOpen(false);
    };

    const goToday = () => {
        setViewYear(today.getFullYear());
        setViewMonth(today.getMonth());
        setYearView(false);
        if (!min || todayStr >= min) { onChange(todayStr); setOpen(false); }
    };

    const selectYear = (y) => {
        setViewYear(y);
        setYearView(false);
    };

    const cells = buildCells(viewYear, viewMonth);
    const variantCls = variant ? ` dp--${variant}` : '';
    const outerCls   = `dp${variantCls}${className ? ` ${className}` : ''}`;
    const years      = Array.from({ length: 12 }, (_, i) => yearRangeStart + i);

    return (
        <div className={outerCls} ref={triggerRef}>
            <button
                type="button"
                className={`dp-trigger${open ? ' dp-trigger--open' : ''}`}
                onClick={handleOpen}
            >
                <span className="material-symbols-outlined dp-icon">calendar_month</span>
                <span className={value ? 'dp-value' : 'dp-placeholder'}>
                    {value ? toDisplay(value) : placeholder}
                </span>
                {value && (
                    <span
                        className="material-symbols-outlined dp-clear"
                        onClick={(e) => { e.stopPropagation(); onChange(''); }}
                    >close</span>
                )}
            </button>

            {open && createPortal(
                <div className={`dp-panel${variantCls}`} style={panelStyle} ref={panelRef}>

                    {/* AY GÖRÜNÜMÜ */}
                    {!yearView && (<>
                        <div className="dp-header">
                            <button type="button" className="dp-nav" onClick={prevMonth}>
                                <span className="material-symbols-outlined">chevron_left</span>
                            </button>
                            <button type="button" className="dp-month dp-month--btn" onClick={() => setYearView(true)}>
                                {MONTHS_TR[viewMonth]} {viewYear}
                                <span className="material-symbols-outlined dp-month-chevron">expand_more</span>
                            </button>
                            <button type="button" className="dp-nav" onClick={nextMonth}>
                                <span className="material-symbols-outlined">chevron_right</span>
                            </button>
                        </div>
                        <div className="dp-grid">
                            {DAYS_TR.map(d => <div key={d} className="dp-weekday">{d}</div>)}
                            {cells.map((cell, i) => {
                                const isToday    = cell.dateStr === todayStr;
                                const isSelected = cell.dateStr === value;
                                const isDisabled = !!min && cell.dateStr < min;
                                return (
                                    <button key={i} type="button"
                                        className={['dp-day',
                                            cell.type === 'other' ? 'dp-day--other'    : '',
                                            isToday                ? 'dp-day--today'    : '',
                                            isSelected             ? 'dp-day--selected' : '',
                                            isDisabled             ? 'dp-day--disabled' : '',
                                        ].filter(Boolean).join(' ')}
                                        onClick={() => selectDay(cell)}
                                        disabled={cell.type !== 'cur' || isDisabled}
                                    >{cell.day}</button>
                                );
                            })}
                        </div>
                        <div className="dp-footer">
                            <button type="button" className="dp-footer-clear" onClick={() => { onChange(''); setOpen(false); }}>Temizle</button>
                            <button type="button" className="dp-footer-today" onClick={goToday}>Bugün</button>
                        </div>
                    </>)}

                    {/* YIL GÖRÜNÜMÜ */}
                    {yearView && (<>
                        <div className="dp-header">
                            <button type="button" className="dp-nav" onClick={() => setYearRangeStart(s => s - 12)}>
                                <span className="material-symbols-outlined">chevron_left</span>
                            </button>
                            <button type="button" className="dp-month dp-month--btn" onClick={() => setYearView(false)}>
                                {yearRangeStart} – {yearRangeStart + 11}
                                <span className="material-symbols-outlined dp-month-chevron">expand_less</span>
                            </button>
                            <button type="button" className="dp-nav" onClick={() => setYearRangeStart(s => s + 12)}>
                                <span className="material-symbols-outlined">chevron_right</span>
                            </button>
                        </div>
                        <div className="dp-year-grid">
                            {years.map(y => (
                                <button key={y} type="button"
                                    className={['dp-year-btn',
                                        y === viewYear            ? 'dp-year-btn--selected' : '',
                                        y === today.getFullYear() ? 'dp-year-btn--today'    : '',
                                    ].filter(Boolean).join(' ')}
                                    onClick={() => selectYear(y)}
                                >{y}</button>
                            ))}
                        </div>
                        <div className="dp-footer">
                            <button type="button" className="dp-footer-clear" onClick={() => setYearView(false)}>← Geri</button>
                            <button type="button" className="dp-footer-today" onClick={goToday}>Bugün</button>
                        </div>
                    </>)}

                </div>,
                document.body
            )}
        </div>
    );
}
