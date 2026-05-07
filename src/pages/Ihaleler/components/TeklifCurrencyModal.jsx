// Enes Doğanay | 6 Mayıs 2026: Para birimi seçim modal — tüm dünyanın para birimleri aranabilir
import React from 'react';
import { ALL_CURRENCIES } from '../constants/currencies';

const TeklifCurrencyModal = ({ currencyModalIdx, setCurrencyModalIdx, currencySearch, setCurrencySearch, setTeklifForm, onUpdateKalem }) => {
    if (currencyModalIdx === null) return null;

    const filtered = ALL_CURRENCIES.filter(c => {
        if (!currencySearch.trim()) return true;
        const q = currencySearch.trim().toLocaleLowerCase('tr-TR');
        return c.code.toLocaleLowerCase('tr-TR').includes(q)
            || c.name.toLocaleLowerCase('tr-TR').includes(q)
            || c.symbol.toLocaleLowerCase('tr-TR').includes(q);
    });

    const handleSelect = (code) => {
        if (currencyModalIdx === 'single') setTeklifForm(p => ({ ...p, para_birimi: code }));
        else onUpdateKalem(currencyModalIdx, 'para_birimi', code);
        setCurrencyModalIdx(null);
    };

    return (
        <div className="teklif-popup-overlay" style={{ zIndex: 10001 }} onClick={() => setCurrencyModalIdx(null)}>
            <div className="teklif-currency-modal" onClick={e => e.stopPropagation()}>
                <div className="teklif-currency-modal__head">
                    <h3><span className="material-symbols-outlined">currency_exchange</span> Para Birimi Seçin</h3>
                    <button type="button" onClick={() => setCurrencyModalIdx(null)}>
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
                <div className="teklif-currency-modal__search">
                    <span className="material-symbols-outlined">search</span>
                    <input type="text" placeholder="Para birimi ara… (ör: JPY, Yen)" value={currencySearch}
                        onChange={e => setCurrencySearch(e.target.value)} autoFocus />
                    {currencySearch && (
                        <button type="button" onClick={() => setCurrencySearch('')}>
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    )}
                </div>
                <div className="teklif-currency-modal__list">
                    {filtered.map(c => (
                        <button key={c.code} className="teklif-currency-modal__item" onClick={() => handleSelect(c.code)}>
                            <span className="teklif-currency-modal__symbol">{c.symbol}</span>
                            <span className="teklif-currency-modal__code">{c.code}</span>
                            <span className="teklif-currency-modal__name">{c.name}</span>
                        </button>
                    ))}
                    {filtered.length === 0 && (
                        <div className="teklif-currency-modal__empty">
                            <span className="material-symbols-outlined">search_off</span>
                            <p>Para birimi bulunamadı</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TeklifCurrencyModal;
