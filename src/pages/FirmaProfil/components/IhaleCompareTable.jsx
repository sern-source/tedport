// Enes Doğanay | 6 Mayıs 2026: Teklif karşılaştırma tablosu
import React from 'react';
import { renderOfferAmount, formatDate } from '../constants/ihaleConstants';

const IhaleCompareTable = ({ compareList, onClear }) => {
    if (compareList.length < 2) return null;
    const best = { price: Math.max(...compareList.map(o => o._score?.price || 0)), delivery: Math.max(...compareList.map(o => o._score?.delivery || 0)), overall: Math.max(...compareList.map(o => o._score?.overall || 0)) };

    return (
        <div className="tom-compare">
            <div className="tom-compare__head">
                <h3><span className="material-symbols-outlined">compare_arrows</span>Karşılaştırma Tablosu</h3>
                <button type="button" className="tom-compare__clear" onClick={onClear}><span className="material-symbols-outlined">close</span>Karşılaştırmayı Kapat</button>
            </div>
            <div className="tom-compare__table-scroll">
                <table className="tom-compare__tbl">
                    <thead>
                        <tr>
                            <th>Kriter</th>
                            {compareList.map(o => (
                                <th key={o.id}>
                                    <div className="tom-compare__company">{o.gonderen_firma_adi || o.gonderen_ad_soyad || o.gonderen_email}</div>
                                    {o._score?.overall === best.overall && <div className="tom-compare__best-chip"><span className="material-symbols-outlined">emoji_events</span>En İyi</div>}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Genel Puan</td>
                            {compareList.map(o => (<td key={o.id} className={o._score?.overall === best.overall ? 'tom-compare__best' : ''}><strong>{o._score?.overall ?? '—'}</strong></td>))}
                        </tr>
                        <tr>
                            <td>Fiyat Skoru</td>
                            {compareList.map(o => (<td key={o.id} className={o._score?.price === best.price ? 'tom-compare__best' : ''}>{o._score?.price ?? '—'}</td>))}
                        </tr>
                        <tr>
                            <td>Teslim Skoru</td>
                            {compareList.map(o => (<td key={o.id} className={o._score?.delivery === best.delivery ? 'tom-compare__best' : ''}>{o._score?.delivery ?? '—'}</td>))}
                        </tr>
                        <tr>
                            <td>Fiyat</td>
                            {compareList.map(o => (<td key={o.id}>{renderOfferAmount(o)}{o.kdv_dahil !== undefined && <small style={{ display: 'block', fontSize: '0.7rem' }}>{o.kdv_dahil ? 'KDV Dahil' : 'KDV Hariç'}</small>}</td>))}
                        </tr>
                        <tr>
                            <td>Teslim Süresi</td>
                            {compareList.map(o => (<td key={o.id}>{o.teslim_suresi_gun ? `${o.teslim_suresi_gun} gün` : '—'}</td>))}
                        </tr>
                        <tr>
                            <td>Teklif Tarihi</td>
                            {compareList.map(o => (<td key={o.id}>{formatDate(o.created_at)}</td>))}
                        </tr>
                        {compareList.some(o => Array.isArray(o.kalemler) && o.kalemler.length > 0) && (
                            <tr>
                                <td>Teklif Kalemleri</td>
                                {compareList.map(o => (<td key={o.id}>{Array.isArray(o.kalemler) ? `${o.kalemler.length} kalem` : '—'}</td>))}
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default IhaleCompareTable;
