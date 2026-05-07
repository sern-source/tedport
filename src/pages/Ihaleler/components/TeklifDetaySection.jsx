// Enes Doğanay | 6 Mayıs 2026: Teklif detay alanı — kalem tablosu veya tek tutar modu
import React from 'react';
import { MAIN_CURRENCIES, getCurrencySymbol } from '../constants/currencies';
import SimpleSelect from '../../../components/SimpleSelect';
import TeklifKalemTable from './TeklifKalemTable';

const TeklifDetaySection = ({ teklifForm, setTeklifForm, hasKalemler, onUpdateKalem, setCurrencyModalIdx, setCurrencySearch, getGroupedTotals }) => (
    <div className="teklif-popup__section">
        <h3><span className="material-symbols-outlined">payments</span> Teklif Detay</h3>
        {hasKalemler ? (
            <TeklifKalemTable kalemler={teklifForm.kalemler} onUpdateKalem={onUpdateKalem} setCurrencyModalIdx={setCurrencyModalIdx} setCurrencySearch={setCurrencySearch} getGroupedTotals={getGroupedTotals} />
        ) : (
            <div className="teklif-popup__single-amount">
                <label>Teklif Tutarı</label>
                <div className="teklif-popup__amount-row">
                    <input type="number" min="0" step="0.01" placeholder="0.00" value={teklifForm.genel_toplam} onChange={e => setTeklifForm(p => ({ ...p, genel_toplam: e.target.value }))} className="teklif-popup__amount-input" />
                    <div className="teklif-popup__currency-simple">
                        <SimpleSelect value={teklifForm.para_birimi || 'TRY'}
                            onChange={val => { if (val === '_other') { setCurrencyModalIdx('single'); setCurrencySearch(''); } else setTeklifForm(p => ({ ...p, para_birimi: val })); }}
                            options={[
                                ...MAIN_CURRENCIES.map(c => ({ value: c.code, label: `${c.symbol} ${c.code}` })),
                                ...(MAIN_CURRENCIES.some(c => c.code === teklifForm.para_birimi) ? [] : [{ value: teklifForm.para_birimi, label: `${getCurrencySymbol(teklifForm.para_birimi)} ${teklifForm.para_birimi}` }]),
                                { value: '_other', label: 'Diğer...' },
                            ]} />
                    </div>
                </div>
            </div>
        )}
        <label className="teklif-popup__toggle" style={hasKalemler ? undefined : { marginTop: 10 }}>
            <input type="checkbox" checked={teklifForm.kdv_dahil} onChange={e => setTeklifForm(p => ({ ...p, kdv_dahil: e.target.checked }))} />
            <span className="teklif-popup__toggle-slider" /><span>KDV Dahil</span>
        </label>
    </div>
);

export default TeklifDetaySection;
