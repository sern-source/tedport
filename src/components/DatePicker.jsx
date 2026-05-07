// Enes Doğanay | 6 Mayıs 2026: DatePicker koordinatör — portal tabanlı, yıl/ay seçimi
import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { toStr, toDisplay, buildCells } from './datePickerUtils';
import DatePickerMonthView from './DatePickerMonthView';
import DatePickerYearView from './DatePickerYearView';
import './DatePicker.css';
import './DatePicker.dark.css';

export default function DatePicker({ value, onChange, min, placeholder = 'gg.aa.yyyy', variant, className }) {
    const today    = new Date();
    const todayStr = toStr(today.getFullYear(), today.getMonth() + 1, today.getDate());

    const [open, setOpen]             = useState(false);
    const [yearView, setYearView]     = useState(false);
    const [yearRangeStart, setYearRangeStart] = useState(() => {
        const base = value ? parseInt(value.split('-')[0]) : today.getFullYear();
        return Math.floor((base - 1) / 12) * 12 + 1;
    });
    const [viewYear, setViewYear]   = useState(() => value ? parseInt(value.split('-')[0]) : today.getFullYear());
    const [viewMonth, setViewMonth] = useState(() => value ? parseInt(value.split('-')[1]) - 1 : today.getMonth());
    const [panelStyle, setPanelStyle] = useState({});
    const triggerRef = useRef(null);
    const panelRef   = useRef(null);

    const calcPosition = useCallback(() => {
        if (!triggerRef.current) return;
        const rect   = triggerRef.current.getBoundingClientRect();
        const panelW = Math.max(rect.width, 280);
        const panelH = 320;
        const vw     = window.innerWidth;
        const vh     = window.innerHeight;
        const left   = Math.min(rect.left, vw - panelW - 8);
        const top    = rect.bottom + 6 + panelH > vh ? rect.top - panelH - 6 : rect.bottom + 6;
        setPanelStyle({ position: 'fixed', top: Math.max(8, top), left: Math.max(8, left), width: panelW, zIndex: 99999 });
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
            if (triggerRef.current && !triggerRef.current.contains(e.target) && panelRef.current && !panelRef.current.contains(e.target))
                { setOpen(false); setYearView(false); }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    useEffect(() => {
        if (!open) return;
        const update = () => calcPosition();
        window.addEventListener('scroll', update, true);
        window.addEventListener('resize', update);
        return () => { window.removeEventListener('scroll', update, true); window.removeEventListener('resize', update); };
    }, [open, calcPosition]);

    const prevMonth = () => setViewMonth(m => { if (m === 0) { setViewYear(y => y - 1); return 11; } return m - 1; });
    const nextMonth = () => setViewMonth(m => { if (m === 11) { setViewYear(y => y + 1); return 0; } return m + 1; });
    const selectDay = (cell) => { if (cell.type !== 'cur') return; if (min && cell.dateStr < min) return; onChange(cell.dateStr); setOpen(false); };
    const goToday   = () => { setViewYear(today.getFullYear()); setViewMonth(today.getMonth()); setYearView(false); if (!min || todayStr >= min) { onChange(todayStr); setOpen(false); } };
    const selectYear = (y) => { setViewYear(y); setYearView(false); };

    const cells     = buildCells(viewYear, viewMonth);
    const variantCls = variant ? ` dp--${variant}` : '';
    const outerCls  = `dp${variantCls}${className ? ` ${className}` : ''}`;
    const years     = Array.from({ length: 12 }, (_, i) => yearRangeStart + i);

    return (
        <div className={outerCls} ref={triggerRef}>
            <button type="button" className={`dp-trigger${open ? ' dp-trigger--open' : ''}`} onClick={handleOpen}>
                <span className="material-symbols-outlined dp-icon">calendar_month</span>
                <span className={value ? 'dp-value' : 'dp-placeholder'}>{value ? toDisplay(value) : placeholder}</span>
                {value && <span className="material-symbols-outlined dp-clear" onClick={(e) => { e.stopPropagation(); onChange(''); }}>close</span>}
            </button>
            {open && createPortal(
                <div className={`dp-panel${variantCls}`} style={panelStyle} ref={panelRef}>
                    {!yearView && <DatePickerMonthView viewYear={viewYear} viewMonth={viewMonth} prevMonth={prevMonth} nextMonth={nextMonth} cells={cells} value={value} min={min} todayStr={todayStr} selectDay={selectDay} goToday={goToday} onChange={onChange} setOpen={setOpen} setYearView={setYearView} />}
                    {yearView && <DatePickerYearView yearRangeStart={yearRangeStart} setYearRangeStart={setYearRangeStart} viewYear={viewYear} todayYear={today.getFullYear()} years={years} selectYear={selectYear} goToday={goToday} setYearView={setYearView} />}
                </div>,
                document.body
            )}
        </div>
    );
}
