// Enes Doğanay | 23 Mayıs 2026: Tarih aralığı filtresi — preset + özel aralık (custom DatePicker)
import React, { useState } from 'react';
import './DateRangeFilter.css';
import DatePicker from '../../../../components/DatePicker';
import { PRESETS, fmtCustomLabel } from './dashboardConstants';

const DateRangeFilter = ({ dateRange, onDateRangeChange }) => {
    const isCustomActive = dateRange.type === 'custom';
    const [showCustom, setShowCustom] = useState(false);
    const [customStart, setCustomStart] = useState('');
    const [customEnd, setCustomEnd] = useState('');
    const todayStr = new Date().toISOString().split('T')[0];

    const handlePreset = (days) => {
        setShowCustom(false);
        onDateRangeChange({ type: 'preset', days });
    };

    const handleOpenCustom = () => {
        if (!showCustom && isCustomActive) {
            setCustomStart(dateRange.start);
            setCustomEnd(dateRange.end);
        } else if (!showCustom) {
            setCustomStart('');
            setCustomEnd('');
        }
        setShowCustom(v => !v);
    };

    const handleApply = () => {
        if (!customStart || !customEnd || customStart > customEnd) return;
        onDateRangeChange({ type: 'custom', start: customStart, end: customEnd });
        setShowCustom(false);
    };

    const canApply = customStart && customEnd && customStart <= customEnd;

    return (
        <div className="fdb-filter-bar">
            <div className="fdb-filter-presets">
                {PRESETS.map(p => (
                    <button
                        key={p.days}
                        className={`fdb-filter-btn${dateRange.type === 'preset' && dateRange.days === p.days ? ' fdb-filter-btn--active' : ''}`}
                        onClick={() => handlePreset(p.days)}
                    >
                        {p.label}
                    </button>
                ))}
                <button
                    className={`fdb-filter-btn fdb-filter-btn--calendar${showCustom || isCustomActive ? ' fdb-filter-btn--active' : ''}`}
                    onClick={handleOpenCustom}
                >
                    <span className="material-symbols-outlined">calendar_month</span>
                    {fmtCustomLabel(dateRange)}
                </button>
            </div>
            {showCustom && (
                <div className="fdb-filter-custom">
                    <div className="fdb-filter-custom-row">
                        <div className="fdb-filter-date-wrap">
                            <label className="fdb-filter-date-label">Başlangıç</label>
                            <DatePicker
                                value={customStart}
                                onChange={setCustomStart}
                                max={customEnd || todayStr}
                                placeholder="gg.aa.yyyy"
                                compact
                            />
                        </div>
                        <span className="fdb-filter-date-sep">—</span>
                        <div className="fdb-filter-date-wrap">
                            <label className="fdb-filter-date-label">Bitiş</label>
                            <DatePicker
                                value={customEnd}
                                onChange={setCustomEnd}
                                min={customStart}
                                max={todayStr}
                                placeholder="gg.aa.yyyy"
                                compact
                            />
                        </div>
                        <button
                            className="fdb-filter-apply-btn"
                            onClick={handleApply}
                            disabled={!canApply}
                        >
                            <span className="material-symbols-outlined">check</span>
                            Uygula
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DateRangeFilter;
