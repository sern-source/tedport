// Enes Doğanay | 6 Mayıs 2026: DatePicker yardımcı fonksiyonlar ve sabitler
export const MONTHS_TR = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
export const DAYS_TR = ['Pt','Sa','Ça','Pe','Cu','Ct','Pa'];

export function toStr(year, month1based, day) {
    return `${year}-${String(month1based).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function toDisplay(val) {
    if (!val) return '';
    const [y, m, d] = val.split('-');
    return `${d}.${m}.${y}`;
}

export function buildCells(viewYear, viewMonth) {
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
