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
                        <strong>{kalem.madde}</strong>                        {/* Enes Doğanay | 23 Mayıs 2026: İhale talep kalemi açıklaması — read-only */}
                        {kalem.ihale_aciklama && (
                            <span className="teklif-kalem-ihale-aciklama">{kalem.ihale_aciklama}</span>
                        )}
                        {/* Enes Doğanay | 23 Mayıs 2026: textarea — maks 3 satır dikey, 150 karakter */}
                        <textarea
                            rows={1}
                            maxLength={150}
                            placeholder="Açıklama / not…"
                            value={kalem.aciklama}
                            onKeyDown={e => {
                                // Enes Doğanay | 23 Mayıs 2026: 3. satırda Enter'a izin verme
                                if (e.key === 'Enter' && e.target.value.split('\n').length >= 3) e.preventDefault();
                            }}
                            onChange={e => {
                                // Enes Doğanay | 23 Mayıs 2026: Uzun metin 3 satırı (66px) aşarsa DOM değerini geri al
                                const el = e.target;
                                el.style.height = 'auto';
                                if (el.scrollHeight > 66) {
                                    el.value = kalem.aciklama;
                                    el.style.height = 'auto';
                                    el.style.height = el.scrollHeight + 'px';
                                    return;
                                }
                                onUpdateKalem(idx, 'aciklama', el.value);
                                el.style.height = el.scrollHeight + 'px';
                            }}
                            className="teklif-kalem-input teklif-kalem-input--note" />
                    </div>
                    <div className="teklif-kalem-col teklif-kalem-col--miktar">
                        {/* Enes Doğanay | 16 Mayıs 2026: Miktar stepper butonları */}
                        <div className="teklif-miktar-group">
                            <button type="button" className="teklif-step-btn" tabIndex={-1} onClick={() => onUpdateKalem(idx, 'miktar', String(Math.max(1, (parseInt(kalem.miktar) || 1) - 1)))}><span className="material-symbols-outlined">remove</span></button>
                            <input type="number" min="1" value={kalem.miktar}
                                onChange={e => onUpdateKalem(idx, 'miktar', e.target.value)} className="teklif-kalem-input teklif-kalem-input--miktar" />
                            <button type="button" className="teklif-step-btn" tabIndex={-1} onClick={() => onUpdateKalem(idx, 'miktar', String(Math.min(99999, (parseInt(kalem.miktar) || 1) + 1)))}><span className="material-symbols-outlined">add</span></button>
                        </div>
                        {/* Enes Doğanay | 14 Mayıs 2026: İhaledeki birim görüntüle — display only */}
                        {kalem.birim && <span className="teklif-kalem-birim-badge">{kalem.birim}</span>}
                    </div>
                    <div className="teklif-kalem-col teklif-kalem-col--fiyat">
                        {/* Enes Doğanay | 23 Mayıs 2026: Birim fiyat — dikey genişleyen textarea, sadece sayı girişi */}
                        <textarea
                            rows={1}
                            inputMode="decimal"
                            placeholder="0.00"
                            value={kalem.birim_fiyat}
                            onKeyDown={e => {
                                // Enes Doğanay | 23 Mayıs 2026: Yalnızca sayı, ondalık, kontrol tuşları
                                if (e.key === 'Enter') { e.preventDefault(); return; }
                                const allowed = ['0','1','2','3','4','5','6','7','8','9','.',',','Backspace','Delete','ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Tab','Home','End'];
                                if (!allowed.includes(e.key) && !e.ctrlKey && !e.metaKey) e.preventDefault();
                            }}
                            onChange={e => {
                                onUpdateKalem(idx, 'birim_fiyat', e.target.value);
                                e.target.style.height = 'auto';
                                e.target.style.height = e.target.scrollHeight + 'px';
                            }}
                            className="teklif-kalem-input teklif-kalem-input--fiyat" />
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
                                ...MAIN_CURRENCIES.map(c => ({ value: c.code, label: c.symbol === c.code ? c.code : `${c.symbol} ${c.code}` })),
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
