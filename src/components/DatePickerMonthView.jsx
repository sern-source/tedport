// Enes Doğanay | 6 Mayıs 2026: DatePicker ay görünümü — gün grid + navigasyon
import { MONTHS_TR, DAYS_TR } from './datePickerUtils';

const DatePickerMonthView = ({ viewYear, viewMonth, prevMonth, nextMonth, cells, value, min, todayStr, selectDay, goToday, onChange, setOpen, setYearView }) => (
    <>
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
                    <button key={cell.dateStr || `empty-${i}`} type="button"
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
    </>
);

export default DatePickerMonthView;
