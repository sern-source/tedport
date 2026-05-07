// Enes Doğanay | 6 Mayıs 2026: Teklif kalem bazlı fiyat tablosu — TeklifMainPopup alt bileşeni
import React from 'react';
import { MAIN_CURRENCIES, getCurrencySymbol } from '../constants/currencies';
import { formatCurrency, getKalemToplam } from '../IhalelerUtils';
import SimpleSelect from '../../../components/SimpleSelect';

const TeklifKalemTable = ({ kalemler, onUpdateKalem, setCurrencyModalIdx, setCurrencySearch, getGroupedTotals }) => (
    <div className="teklif-kalem-table">
        <div className="teklif-kalem-table__head">
            <span className="teklif-kalem-col teklif-kalem-col--no">#</span>
            <span className="teklif-kalem-col teklif-kalem-col--madde">Kalem</span>
            <span className="teklif-kalem-col teklif-kalem-col--miktar">Miktar</span>
            <span className="teklif-kalem-col teklif-kalem-col--fiyat">Birim Fiyat</span>
            <span className="teklif-kalem-col teklif-kalem-col--currency">Para Birimi</span>
            <span className="teklif-kalem-col teklif-kalem-col--toplam">Toplam</span>
        </div>
        {kalemler.map((kalem, idx) => {
            const kalemCurrency = kalem.para_birimi || 'TRY';
            return (
                <div key={kalem.gereksinim_id || idx} className="teklif-kalem-table__row">
                    <span className="teklif-kalem-col teklif-kalem-col--no">{idx + 1}</span>
                    <div className="teklif-kalem-col teklif-kalem-col--madde">
                        <strong>{kalem.madde}</strong>
                        <input type="text" placeholder="Açıklama / not…" value={kalem.aciklama}
                            onChange={e => onUpdateKalem(idx, 'aciklama', e.target.value)}
                            className="teklif-kalem-input teklif-kalem-input--note" />
                    </div>
                    <div className="teklif-kalem-col teklif-kalem-col--miktar">
                        <input type="number" min="1" value={kalem.miktar}
                            onChange={e => onUpdateKalem(idx, 'miktar', e.target.value)} className="teklif-kalem-input" />
                    </div>
                    <div className="teklif-kalem-col teklif-kalem-col--fiyat">
                        <input type="number" min="0" step="0.01" placeholder="0.00" value={kalem.birim_fiyat}
                            onChange={e => onUpdateKalem(idx, 'birim_fiyat', e.target.value)} className="teklif-kalem-input" />
                    </div>
                    {/* Enes Doğanay | 2 Mayıs 2026: Kalem para birimi — modern SimpleSelect */}
                    <div className="teklif-kalem-col teklif-kalem-col--currency">
                        <SimpleSelect
                            value={kalemCurrency}
                            onChange={val => {
                                if (val === '_other') { setCurrencyModalIdx(idx); setCurrencySearch(''); }
                                else onUpdateKalem(idx, 'para_birimi', val);
                            }}
                            options={[
                                ...MAIN_CURRENCIES.map(c => ({ value: c.code, label: `${c.symbol} ${c.code}` })),
                                ...(MAIN_CURRENCIES.some(c => c.code === kalemCurrency) ? [] : [{ value: kalemCurrency, label: `${getCurrencySymbol(kalemCurrency)} ${kalemCurrency}` }]),
                                { value: '_other', label: 'Diğer...' },
                            ]}
                        />
                    </div>
                    <span className="teklif-kalem-col teklif-kalem-col--toplam teklif-kalem-col--amount">
                        {formatCurrency(getKalemToplam(kalem), kalemCurrency)}
                    </span>
                </div>
            );
        })}
        {/* Enes Doğanay | 14 Nisan 2026: Parçalı para birimi — gruplu toplam */}
        <div className="teklif-kalem-table__footer">
            <span>Genel Toplam</span>
            <div className="teklif-kalem-table__footer-totals">
                {Object.entries(getGroupedTotals()).filter(([, amt]) => amt > 0).map(([cur, amt]) => (
                    <strong key={cur}>{formatCurrency(amt, cur)}</strong>
                ))}
                {Object.values(getGroupedTotals()).every(v => v === 0) && <strong>{formatCurrency(0, 'TRY')}</strong>}
            </div>
        </div>
    </div>
);

export default TeklifKalemTable;
