// Enes Doğanay | 6 Mayıs 2026: İhale detay gövdesi — açıklama, grid bilgiler, gereksinimler, ek dosyalar
import React from 'react';
import { formatTenderDate } from '../../../constants/tenderUtils';
import { createSignedIhaleFileUrl } from '../../../services/ihaleManagementApi';

const TenderDetailBody = ({ dt }) => {
    const gereksinimler = Array.isArray(dt.gereksinimler) ? dt.gereksinimler : [];
    const ekDosyalar = (() => {
        let raw = dt.ek_dosyalar;
        if (typeof raw === 'string') try { raw = JSON.parse(raw); } catch { raw = []; }
        return Array.isArray(raw) ? raw : [];
    })();
    const teslimYeri = [dt.teslim_il, dt.teslim_ilce].filter(Boolean).join(' / ');

    const handleFileOpen = async (f) => {
        const url = await createSignedIhaleFileUrl(f);
        if (url) window.open(url, '_blank', 'noopener,noreferrer');
    };

    return (
        <div className="tender-detail__body">
            {dt.aciklama && (
                <div className="tender-detail__section">
                    <h3><span className="material-symbols-outlined">description</span> İhale Açıklaması</h3>
                    <p>{dt.aciklama}</p>
                </div>
            )}
            <div className="tender-detail__grid">
                <div className="tender-detail__grid-item"><span className="material-symbols-outlined">category</span><div><strong>İhale Tipi</strong><span>{dt.ihale_tipi || '—'}</span></div></div>
                <div className="tender-detail__grid-item"><span className="material-symbols-outlined">receipt_long</span><div><strong>KDV Durumu</strong><span>{dt.kdv_durumu === 'dahil' ? 'Dahil' : 'Hariç'}</span></div></div>
                <div className="tender-detail__grid-item"><span className="material-symbols-outlined">event</span><div><strong>Açılış Tarihi</strong><span>{formatTenderDate(dt.yayin_tarihi)}</span></div></div>
                <div className="tender-detail__grid-item"><span className="material-symbols-outlined">event_busy</span><div><strong>Kapanış Tarihi</strong><span>{formatTenderDate(dt.son_basvuru_tarihi)}</span></div></div>
                {dt.teslim_suresi && <div className="tender-detail__grid-item"><span className="material-symbols-outlined">local_shipping</span><div><strong>Teslim Süresi</strong><span>{dt.teslim_suresi}</span></div></div>}
                {teslimYeri && <div className="tender-detail__grid-item"><span className="material-symbols-outlined">location_on</span><div><strong>Teslim Yeri</strong><span>{teslimYeri}</span></div></div>}
                {dt.referans_no && !dt.anonim && <div className="tender-detail__grid-item"><span className="material-symbols-outlined">tag</span><div><strong>Referans No</strong><span>{dt.referans_no}</span></div></div>}
            </div>
            {gereksinimler.length > 0 && (
                <div className="tender-detail__section">
                    {/* Enes Doğanay | 11 Mayıs 2026: Talep Kalemleri — form ile aynı isimlendirme + tablo görünümü */}
                    <h3><span className="material-symbols-outlined">checklist</span> Talep Kalemleri ({gereksinimler.length})</h3>
                    <div className="tender-detail__req-table">
                        <div className="tender-detail__req-table-head">
                            <span>#</span><span>Adet</span><span>Kalem</span><span>Açıklama</span>
                        </div>
                        {gereksinimler.map((g, i) => (
                            <div key={g.id || i} className="tender-detail__req-table-row">
                                <span className="tender-detail__req-num">{i + 1}</span>
                                <span className="tender-detail__req-adet">{g.adet || 1}</span>
                                <span className="tender-detail__req-madde">{g.madde}</span>
                                <span className="tender-detail__req-aciklama">{g.aciklama || '—'}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {ekDosyalar.length > 0 && (
                <div className="tender-detail__section">
                    <h3><span className="material-symbols-outlined">attach_file</span> Ek Dokümanlar ({ekDosyalar.length})</h3>
                    <div className="tender-detail__files">
                        {ekDosyalar.map((f, i) => (
                            <button key={i} type="button" className="tender-detail__file-link" onClick={() => handleFileOpen(f)}>
                                <span className="material-symbols-outlined">download</span>
                                {f.name || `Dosya ${i + 1}`}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TenderDetailBody;
