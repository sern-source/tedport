// Enes Doganay | 4 Mayis 2026: Amber temali custom saat secici - iki kolon (saat + 5dk dakika)
import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import './TimePicker.css';

const HOURS   = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const MINUTES = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0'));

function nowParts() {
    const n = new Date();
    return {
        h: String(n.getHours()).padStart(2, '0'),
        m: String(Math.round(n.getMinutes() / 5) * 5 % 60).padStart(2, '0'),
    };
}

export default function TimePicker({ value, onChange, placeholder = '--:--' }) {
    const [open, setOpen]             = useState(false);
    const [panelStyle, setPanelStyle] = useState({});
    const triggerRef = useRef(null);
    const panelRef   = useRef(null);
    const hourRef    = useRef(null);
    const minRef     = useRef(null);

    const selHour = value ? value.split(':')[0] : null;
    const selMin  = value ? value.split(':')[1] : null;

    const calcPosition = useCallback(() => {
        if (!triggerRef.current) return;
        const rect   = triggerRef.current.getBoundingClientRect();
        const panelW = 176;
        const panelH = 220;
        const left   = Math.min(rect.left, window.innerWidth - panelW - 8);
        const top    = rect.bottom + 5 + panelH > window.innerHeight ? rect.top - panelH - 5 : rect.bottom + 5;
        setPanelStyle({ position: 'fixed', top: Math.max(8, top), left: Math.max(8, left), width: panelW, zIndex: 99999 });
    }, []);

    const handleOpen = () => { if (!open) calcPosition(); setOpen(o => !o); };

    useEffect(() => {
        if (!open) return;
        const { h: nowH, m: nowM } = nowParts();
        if (hourRef.current) {
            const el = hourRef.current.querySelector('[data-h="' + (selHour || nowH) + '"]');
            if (el) el.scrollIntoView({ block: 'center' });
        }
        if (minRef.current) {
            const el = minRef.current.querySelector('[data-m="' + (selMin || nowM) + '"]');
            if (el) el.scrollIntoView({ block: 'center' });
        }
    }, [open]);

    useEffect(() => {
        if (!open) return;
        const handler = (e) => {
            if (triggerRef.current?.contains(e.target) || panelRef.current?.contains(e.target)) return;
            setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    useEffect(() => {
        if (!open) return;
        window.addEventListener('scroll', calcPosition, true);
        window.addEventListener('resize', calcPosition);
        return () => { window.removeEventListener('scroll', calcPosition, true); window.removeEventListener('resize', calcPosition); };
    }, [open, calcPosition]);

    const pickHour = (h) => { onChange(h + ':' + (selMin || '00')); };
    const pickMin  = (m) => { onChange((selHour || nowParts().h) + ':' + m); setOpen(false); };

    return (
        <div className="tp" ref={triggerRef}>
            <button type="button" className={'tp-trigger' + (open ? ' tp-trigger--open' : '')} onClick={handleOpen}>
                <span className="material-symbols-outlined tp-icon">schedule</span>
                <span className={value ? 'tp-value' : 'tp-placeholder'}>{value || placeholder}</span>
                {value && (
                    <span className="material-symbols-outlined tp-clear"
                        onClick={(e) => { e.stopPropagation(); onChange(''); }}>close</span>
                )}
            </button>

            {open && createPortal(
                <div className="tp-panel" style={panelStyle} ref={panelRef}>
                    <div className="tp-cols">
                        <div className="tp-col">
                            <div className="tp-col-head">SAAT</div>
                            <div className="tp-scroll" ref={hourRef}>
                                {HOURS.map(h => (
                                    <button key={h} type="button" data-h={h}
                                        className={'tp-item' + (selHour === h ? ' tp-item--selected' : '')}
                                        onClick={() => pickHour(h)}
                                    >{h}</button>
                                ))}
                            </div>
                        </div>
                        <div className="tp-divider" />
                        <div className="tp-col">
                            <div className="tp-col-head">DAK</div>
                            <div className="tp-scroll" ref={minRef}>
                                {MINUTES.map(m => (
                                    <button key={m} type="button" data-m={m}
                                        className={'tp-item' + (selMin === m ? ' tp-item--selected' : '')}
                                        onClick={() => pickMin(m)}
                                    >{m}</button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}
