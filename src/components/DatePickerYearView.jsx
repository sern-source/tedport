// Enes Doğanay | 6 Mayıs 2026: DatePicker yıl görünümü — yıl grid + aralık navigasyonu
const DatePickerYearView = ({ yearRangeStart, setYearRangeStart, viewYear, todayYear, years, selectYear, goToday, setYearView }) => (
    <>
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
                        y === viewYear  ? 'dp-year-btn--selected' : '',
                        y === todayYear ? 'dp-year-btn--today'    : '',
                    ].filter(Boolean).join(' ')}
                    onClick={() => selectYear(y)}
                >{y}</button>
            ))}
        </div>
        <div className="dp-footer">
            <button type="button" className="dp-footer-clear" onClick={() => setYearView(false)}>← Geri</button>
            <button type="button" className="dp-footer-today" onClick={goToday}>Bugün</button>
        </div>
    </>
);

export default DatePickerYearView;
