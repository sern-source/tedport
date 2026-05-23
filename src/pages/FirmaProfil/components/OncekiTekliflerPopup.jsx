// Enes Doğanay | 9 Mayıs 2026: Önceki teklifler popup — revize geçmişi listesi ve detay görünümü
import React, { useState, useEffect, useCallback } from 'react';
import './OncekiTekliflerPopup.css';
import { fetchTeklifGecmisi } from '../services/ihaleService';
import { formatMoney } from '../constants/ihaleConstants';

// Enes Doğanay | 9 Mayıs 2026: Tarih formatlayıcı
const formatDate = (ts) => {
    if (!ts) return '—';
    return new Date(ts).toLocaleString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const OncekiTekliflerPopup = ({ offer, onClose }) => {
    const [gecmis, setGecmis] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selected, setSelected] = useState(null);

    // Enes Doğanay | 9 Mayıs 2026: Revize geçmişini yükle
    const loadGecmis = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchTeklifGecmisi(offer.id);
            setGecmis(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [offer.id]);

    useEffect(() => { loadGecmis(); }, [loadGecmis]);

    // Enes Doğanay | 9 Mayıs 2026: ESC ile kapat
    useEffect(() => {
        const handler = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [onClose]);

    return (
        <div className="otp-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="otp-panel">
                <div className="otp-header">
                    <div className="otp-header__info">
                        <span className="material-symbols-outlined otp-header__icon">history</span>
                        <div>
                            <h3 className="otp-header__title">Önceki Teklifler</h3>
                            <p className="otp-header__sub">{offer.gonderen_firma_adi || offer.gonderen_ad_soyad} · {gecmis.length} revize</p>
                        </div>
                    </div>
                    <button className="otp-close" onClick={onClose} aria-label="Kapat">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="otp-body">
                    {loading && (
                        <div className="otp-loading">
                            <span className="material-symbols-outlined otp-spin">progress_activity</span>
                            <p>Yükleniyor…</p>
                        </div>
                    )}
                    {error && (
                        <div className="otp-error">
                            <span className="material-symbols-outlined">error</span>
                            <p>{error}</p>
                        </div>
                    )}
                    {!loading && !error && gecmis.length === 0 && (
                        <div className="otp-empty">
                            <span className="material-symbols-outlined">inbox</span>
                            <p>Henüz revize kaydı yok.</p>
                        </div>
                    )}
                    {!loading && !error && gecmis.length > 0 && !selected && (
                        <div className="otp-list">
                            {gecmis.map((item) => {
                                const cur = item.para_birimi || 'TRY';
                                return (
                                    <button
                                        key={item.id}
                                        type="button"
                                        className="otp-list-item"
                                        onClick={() => setSelected(item)}
                                    >
                                        <div className="otp-list-item__badge">R{item.revize_no}</div>
                                        <div className="otp-list-item__info">
                                            <span className="otp-list-item__amount">
                                                {item.toplam_tutar ? formatMoney(Number(item.toplam_tutar), cur) : '—'}
                                                <small>{item.kdv_dahil ? 'KDV Dahil' : 'KDV Hariç'}</small>
                                            </span>
                                            <span className="otp-list-item__meta">
                                                <span className="material-symbols-outlined">schedule</span>
                                                {formatDate(item.olusturulma_tarihi)}
                                                {item.teslim_suresi_gun && (
                                                    <><span className="otp-dot">·</span>
                                                    <span className="material-symbols-outlined">local_shipping</span>
                                                    {item.teslim_suresi_gun} gün</>
                                                )}
                                            </span>
                                        </div>
                                        <span className="material-symbols-outlined otp-list-item__chevron">chevron_right</span>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                    {selected && (
                        <div className="otp-detail">
                            <button className="otp-back" onClick={() => setSelected(null)}>
                                <span className="material-symbols-outlined">arrow_back</span>
                                Tüm revizyonlar
                            </button>
                            <div className="otp-detail__badge-row">
                                <span className="otp-detail__badge">Revize #{selected.revize_no}</span>
                                <span className="otp-detail__date">{formatDate(selected.olusturulma_tarihi)}</span>
                            </div>

                            {/* Enes Doğanay | 11 Mayıs 2026: Revize özet — sol: tutar/teslim, sağ: açıklama/not */}
                            <div className={`otp-detail__summary${selected.teslim_aciklamasi?.trim() || selected.not_field?.trim() ? ' otp-detail__summary--split' : ''}`}>
                                <div className="otp-detail__summary-col">
                                    <div className="otp-detail__row">
                                        <span className="material-symbols-outlined">payments</span>
                                        <div>
                                            <small>Toplam Tutar</small>
                                            <strong>{selected.toplam_tutar ? formatMoney(Number(selected.toplam_tutar), selected.para_birimi || 'TRY') : '—'}</strong>
                                            <em>{selected.kdv_dahil ? 'KDV Dahil' : 'KDV Hariç'}</em>
                                        </div>
                                    </div>
                                    {selected.teslim_suresi_gun && (
                                        <div className="otp-detail__row">
                                            <span className="material-symbols-outlined">local_shipping</span>
                                            <div>
                                                <small>Teslim Süresi</small>
                                                <strong>{selected.teslim_suresi_gun} gün</strong>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                {(selected.teslim_aciklamasi?.trim() || selected.not_field?.trim()) && (
                                    <div className="otp-detail__summary-col otp-detail__summary-col--right">
                                        {selected.teslim_aciklamasi?.trim() && (
                                            <div className="otp-detail__row">
                                                <span className="material-symbols-outlined">local_shipping</span>
                                                <div>
                                                    <small>Teslim Açıklaması</small>
                                                    <p>{selected.teslim_aciklamasi}</p>
                                                </div>
                                            </div>
                                        )}
                                        {selected.not_field?.trim() && (
                                            <div className="otp-detail__row">
                                                <span className="material-symbols-outlined">sticky_note_2</span>
                                                <div>
                                                    <small>Tedarikçi Notu</small>
                                                    <p>{selected.not_field}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Enes Doğanay | 9 Mayıs 2026: Revize kalemleri tablosu */}
                            {Array.isArray(selected.kalemler) && selected.kalemler.length > 0 && (
                                <div className="otp-kalemler">
                                    <h4><span className="material-symbols-outlined">list_alt</span>Teklif Kalemleri ({selected.kalemler.length})</h4>
                                    <div className="otp-kalemler__wrap">
                                        <table>
                                            <thead>
                                                <tr><th>Madde</th><th>Miktar</th><th>Birim Fiyat</th><th>Toplam</th><th>Açıklama</th></tr>
                                            </thead>
                                            <tbody>
                                                {selected.kalemler.map((k, i) => {
                                                    const kCur = k.para_birimi || selected.para_birimi || 'TRY';
                                                    const kTotal = (Number(k.birim_fiyat) || 0) * (Number(k.miktar) || 0);
                                                    return (
                                                        <tr key={`${k.madde || 'kalem'}-${i}`}>
                                                            <td><strong>{k.madde || '—'}</strong></td>
                                                            <td>{k.miktar || '—'}</td>
                                                            <td>{k.birim_fiyat ? formatMoney(Number(k.birim_fiyat), kCur) : '—'}</td>
                                                            <td>{kTotal ? formatMoney(kTotal, kCur) : '—'}</td>
                                                            <td>{k.aciklama || k.not || '—'}</td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OncekiTekliflerPopup;
