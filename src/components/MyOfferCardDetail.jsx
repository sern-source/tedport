// Enes Doğanay | 6 Mayıs 2026: MyOfferCard genişletilmiş detay bölümü
import React from 'react';
import { createSignedTeklifUrl } from '../services/myOffersService';

const ALL_CURRENCIES = [
    { code: 'TRY', symbol: '₺' }, { code: 'USD', symbol: '$' }, { code: 'EUR', symbol: '€' },
    { code: 'GBP', symbol: '£' }, { code: 'CHF', symbol: 'CHF' }, { code: 'JPY', symbol: '¥' },
    { code: 'CNY', symbol: '¥' }, { code: 'RUB', symbol: '₽' }, { code: 'SAR', symbol: 'SR' },
    { code: 'AED', symbol: 'د.إ' }, { code: 'AUD', symbol: 'A$' }, { code: 'CAD', symbol: 'C$' },
];

const formatMoney = (amount, currency) => {
    const v = Number(amount || 0);
    if (!v) return '—';
    try { return v.toLocaleString('tr-TR', { style: 'currency', currency: currency || 'TRY', maximumFractionDigits: 0 }); }
    catch { return `${currency || ''} ${v.toLocaleString('tr-TR')}`; }
};
const formatDate = (iso) => iso ? new Date(iso).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

// Enes Doğanay | 6 Mayıs 2026: Gruplu toplam satırı
const GroupedTotals = ({ kalemler, defaultCurrency }) => {
    const groups = {};
    kalemler.forEach(k => {
        const c = k.para_birimi || defaultCurrency || 'TRY';
        const t = (Number(k.birim_fiyat) || 0) * (Number(k.miktar) || 0);
        groups[c] = (groups[c] || 0) + t;
    });
    const entries = Object.entries(groups).filter(([, v]) => v > 0);
    if (entries.length <= 1) return null;
    return (
        <div className="mop-kalemler__grouped-total">
            <strong>Toplamlar:</strong>
            {entries.map(([c, v]) => <span key={c}>{formatMoney(v, c)}</span>)}
        </div>
    );
};

const MyOfferCardDetail = ({
    offer, tender, firmaAdi, unreadMopChatIds, unreadMopChatCounts,
    onOpenChat, onOpenFirmaContact, onDelete, navigate, tenderSt, stTone,
}) => {
    const kalemler = Array.isArray(offer.kalemler) ? offer.kalemler : [];
    return (
        <div className="mop-card__detail">
            <div className="mop-detail-grid">
                <div className="mop-detail-cell">
                    <span className="material-symbols-outlined">payments</span>
                    <div>
                        <small>Teklif Tutarı</small>
                        {kalemler.length === 0 ? (
                            <strong>{formatMoney(offer.toplam_tutar, offer.para_birimi)}</strong>
                        ) : (
                            (() => {
                                const groups = {};
                                kalemler.forEach(k => {
                                    const c = k.para_birimi || offer.para_birimi || 'TRY';
                                    const t = (Number(k.birim_fiyat) || 0) * (Number(k.miktar) || 0);
                                    if (t > 0) groups[c] = (groups[c] || 0) + t;
                                });
                                const entries = Object.entries(groups);
                                return entries.length > 0
                                    ? entries.map(([c, v], i) => <strong key={c}>{i > 0 && ' + '}{formatMoney(v, c)}</strong>)
                                    : <strong>—</strong>;
                            })()
                        )}
                        {offer.kdv_dahil !== undefined && <span className="mop-tag">{offer.kdv_dahil ? 'KDV Dahil' : 'KDV Hariç'}</span>}
                    </div>
                </div>
                <div className="mop-detail-cell">
                    <span className="material-symbols-outlined">local_shipping</span>
                    <div><small>Teslim Süresi</small><strong>{offer.teslim_suresi_gun ? `${offer.teslim_suresi_gun} gün` : '—'}</strong></div>
                </div>
                <div className="mop-detail-cell">
                    <span className="material-symbols-outlined">event_busy</span>
                    <div><small>Son Başvuru</small><strong>{formatDate(tender?.son_basvuru_tarihi)}</strong></div>
                </div>
                <div className="mop-detail-cell">
                    <span className="material-symbols-outlined">calendar_today</span>
                    <div><small>Teklif Tarihi</small><strong>{formatDate(offer.created_at)}</strong></div>
                </div>
            </div>
            {offer.teslim_aciklamasi && (
                <div className="mop-detail-row">
                    <span className="material-symbols-outlined">info</span>
                    <div><small>Teslim Açıklaması</small><p>{offer.teslim_aciklamasi}</p></div>
                </div>
            )}
            {offer.not_field && (
                <div className="mop-detail-row">
                    <span className="material-symbols-outlined">sticky_note_2</span>
                    <div><small>Notunuz</small><p>{offer.not_field}</p></div>
                </div>
            )}
            {kalemler.length > 0 && (
                <div className="mop-kalemler">
                    <h4><span className="material-symbols-outlined">list_alt</span>Teklif Kalemleri ({kalemler.length})</h4>
                    <div className="mop-kalemler__wrap">
                        <table>
                            <thead><tr><th>Madde</th><th>Miktar</th><th>Birim Fiyat</th><th>Toplam</th></tr></thead>
                            <tbody>
                                {kalemler.map((k, i) => {
                                    const kCur = k.para_birimi || offer.para_birimi || 'TRY';
                                    const kTotal = (Number(k.birim_fiyat) || 0) * (Number(k.miktar) || 0);
                                    return (
                                        <tr key={i}>
                                            <td><strong>{k.madde || '—'}</strong></td>
                                            <td>{k.miktar || '—'}</td>
                                            <td>{k.birim_fiyat ? formatMoney(Number(k.birim_fiyat), kCur) : '—'}</td>
                                            <td>{kTotal ? formatMoney(kTotal, kCur) : '—'}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        <GroupedTotals kalemler={kalemler} defaultCurrency={offer.para_birimi} />
                    </div>
                </div>
            )}
            {(offer.ek_dosya_url || offer.ek_dosya_adi) && (
                <div className="mop-detail-row mop-detail-row--file">
                    <span className="material-symbols-outlined">attach_file</span>
                    <button type="button" className="mop-file-link" onClick={async () => {
                        const url = await createSignedTeklifUrl(offer.ek_dosya_url);
                        if (url) window.open(url, '_blank', 'noopener,noreferrer');
                    }}>
                        {offer.ek_dosya_adi || 'Ek Dosya'}
                    </button>
                </div>
            )}
            <div className="mop-card__footer">
                <button className="mop-btn mop-btn--outline" onClick={() => navigate(`/ihaleler?ihale=${offer.ihale_id}`)}>
                    <span className="material-symbols-outlined">gavel</span>İhaleye Git
                </button>
                {offer.durum !== 'taslak' && (
                    <button className={`mop-btn mop-btn--chat${unreadMopChatIds.has(offer.id) ? ' mop-btn--chat-unread' : ''}`}
                        onClick={() => onOpenChat(offer, tender?.baslik, firmaAdi, tender?.anonim)}>
                        <span className="material-symbols-outlined">forum</span>Mesaj Gönder
                        {unreadMopChatIds.has(offer.id) && <span className="mop-chat-unread-badge">{unreadMopChatCounts[offer.id] || ''}</span>}
                    </button>
                )}
                {tender?.firma_id && !tender.anonim && (
                    <button className="mop-btn mop-btn--contact" onClick={() => onOpenFirmaContact(tender.firma_id, firmaAdi)}>
                        <span className="material-symbols-outlined">contact_phone</span>Firma ile İletişime Geç
                    </button>
                )}
                {tenderSt === 'active' && stTone !== 'accepted' && (
                    <button className={`mop-btn ${stTone === 'draft' ? 'mop-btn--draft' : 'mop-btn--primary'}`}
                        onClick={() => navigate(`/ihaleler?ihale=${tender?.id}&teklif=1`)}>
                        <span className="material-symbols-outlined">edit</span>
                        {stTone === 'draft' ? 'Taslağı Güncelle' : 'Teklifi Güncelle'}
                    </button>
                )}
                {(stTone === 'draft' || stTone === 'review') && (
                    <button className="mop-btn mop-btn--danger" onClick={() => onDelete(offer)}>
                        <span className="material-symbols-outlined">delete</span>
                        {stTone === 'draft' ? 'Taslağı Sil' : 'Teklifi Sil'}
                    </button>
                )}
            </div>
        </div>
    );
};

export default MyOfferCardDetail;
