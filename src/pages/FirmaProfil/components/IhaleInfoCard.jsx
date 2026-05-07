// Enes Doğanay | 6 Mayıs 2026: Seçili ihale bilgi kartı — detaylar, dosyalar, link, aksiyonlar
import React from 'react';
import { useState } from 'react';
import { getTenderStatus, formatDate } from '../constants/ihaleConstants';
import { getIhaleFileSignedUrl } from '../services/ihaleService';
import DatePicker from '../../../components/DatePicker';
import CitySelect from '../../../components/CitySelect';

const IhaleInfoCard = ({ tender, onEdit, onDelete, onRepeat, deleteConfirmId, setDeleteConfirmId, closeState, setCloseState }) => {
    const [showBody, setShowBody] = useState(true);
    const [copiedLink, setCopiedLink] = useState(false);
    const tenderTone = getTenderStatus(tender.durum).tone;
    const isClosed = tenderTone === 'closed' || tenderTone === 'cancelled';
    const isActive = tenderTone === 'active';
    const isClosingConfirm = closeState.confirmId === tender.id;

    const ekDosyalar = (() => { let r = tender.ek_dosyalar; if (typeof r === 'string') try { r = JSON.parse(r); } catch { r = []; } return Array.isArray(r) ? r : []; })();

    return (
        <div className="tom-info-card">
            <button className="tom-info-card__toggle" onClick={() => setShowBody(p => !p)}>
                <div className="tom-info-card__title-row">
                    <h2>{tender.baslik}</h2>
                    <div className="tom-info-card__tags">
                        {tender.referans_no && <span className="tom-tag"><span className="material-symbols-outlined">tag</span>Ref: {tender.referans_no}</span>}
                        {tender.ihale_tipi && <span className="tom-tag">{tender.ihale_tipi}</span>}
                    </div>
                </div>
                <span className="material-symbols-outlined tom-info-card__chevron">{showBody ? 'expand_less' : 'expand_more'}</span>
            </button>

            {showBody && (
                <div className="tom-info-card__body">
                    {isClosed && (
                        <div className="tom-closed-cta">
                            <span className="material-symbols-outlined">lock</span>
                            <div><strong>Bu ihale kapandı</strong><span>Benzer içerikle yeniden yayınlamak ister misiniz?</span></div>
                            <button className="tom-btn tom-btn--repeat tom-btn--repeat-sm" onClick={() => onRepeat(tender)}><span className="material-symbols-outlined">replay</span>İhaleyi Tekrarla</button>
                        </div>
                    )}
                    <p className="tom-info-card__desc">{tender.aciklama || 'Bu ihale için açıklama girilmemiş.'}</p>
                    <div className="tom-info-card__grid">
                        {[{ icon: 'calendar_today', label: 'Yayın Tarihi', val: formatDate(tender.yayin_tarihi) }, { icon: 'event_busy', label: 'Son Başvuru', val: formatDate(tender.son_basvuru_tarihi) }, { icon: 'location_on', label: 'Teslim Lokasyonu', val: [tender.teslim_il, tender.teslim_ilce].filter(Boolean).join(' / ') || tender.il_ilce || '—' }, { icon: 'local_shipping', label: 'Teslim Süresi', val: tender.teslim_suresi || '—' }].map(c => (
                            <div key={c.label} className="tom-info-cell"><span className="material-symbols-outlined">{c.icon}</span><div><small>{c.label}</small><strong>{c.val}</strong></div></div>
                        ))}
                        {tender.kdv_durumu && <div className="tom-info-cell"><span className="material-symbols-outlined">receipt_long</span><div><small>KDV Durumu</small><strong>{tender.kdv_durumu}</strong></div></div>}
                    </div>
                    {ekDosyalar.length > 0 && (
                        <div className="tom-info-card__files">
                            <h4><span className="material-symbols-outlined">attach_file</span> Ek Dokümanlar ({ekDosyalar.length})</h4>
                            <div className="tom-info-card__files-list">
                                {ekDosyalar.map((f, i) => (
                                    <button key={i} type="button" className="tom-info-card__file-btn" onClick={async () => {
                                        if (f.url?.startsWith('http')) { window.open(f.url, '_blank', 'noopener,noreferrer'); return; }
                                        if (f.path) { const url = await getIhaleFileSignedUrl(f.path).catch(() => null); if (url) window.open(url, '_blank', 'noopener,noreferrer'); }
                                    }}>
                                        <span className="material-symbols-outlined">download</span>{f.name || `Dosya ${i + 1}`}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                    {tender.durum !== 'draft' && (
                        <div className="tom-share-link-row">
                            <span className="material-symbols-outlined tom-share-link-row__icon">link</span>
                            <input className="tom-share-link-row__input" readOnly value={`https://tedport.com/ihaleler?ihale=${tender.id}`} onFocus={e => e.target.select()} />
                            <button className={`tom-share-link-row__copy${copiedLink ? ' tom-share-link-row__copy--done' : ''}`} onClick={() => { navigator.clipboard.writeText(`https://tedport.com/ihaleler?ihale=${tender.id}`); setCopiedLink(true); setTimeout(() => setCopiedLink(false), 2000); }}>
                                <span className="material-symbols-outlined">{copiedLink ? 'check' : 'content_copy'}</span>{copiedLink ? 'Kopyalandı!' : 'Kopyala'}
                            </button>
                        </div>
                    )}
                    <div className="tom-tender-actions">
                        <button className="tom-btn tom-btn--edit" onClick={() => onEdit(tender)} disabled={isClosed}><span className="material-symbols-outlined">edit</span>Düzenle</button>
                        {isActive && (isClosingConfirm ? (
                            <div className="tom-confirm-inline">
                                <span>İhaleyi kapatmak istediğinize emin misiniz?</span>
                                <button className="tom-btn tom-btn--confirm" onClick={() => { setCloseState(p => ({ ...p, confirmId: null, visibilityPopupId: tender.id })); }}>Evet, Kapat</button>
                                <button className="tom-btn tom-btn--cancel-sm" onClick={() => setCloseState(p => ({ ...p, confirmId: null }))}>İptal</button>
                            </div>
                        ) : (
                            <button className="tom-btn tom-btn--close-tender" onClick={() => setCloseState(p => ({ ...p, confirmId: tender.id }))}><span className="material-symbols-outlined">lock</span>İhaleyi Kapat</button>
                        ))}
                        {deleteConfirmId === tender.id ? (
                            <div className="tom-confirm-inline tom-confirm-inline--danger">
                                <div><span style={{ fontWeight: 700, color: '#991b1b' }}>⚠ Dikkat!</span><span style={{ display: 'block', fontSize: '0.78rem', marginTop: 2 }}>Bu işlem kalıcıdır. İhale ve tüm teklifler geri getirilemez şekilde silinecektir.</span></div>
                                <button className="tom-btn tom-btn--confirm tom-btn--confirm-red" onClick={() => onDelete(tender.id)}>Kalıcı Olarak Sil</button>
                                <button className="tom-btn tom-btn--cancel-sm" onClick={() => setDeleteConfirmId(null)}>İptal</button>
                            </div>
                        ) : (
                            <button className="tom-btn tom-btn--delete-tender" onClick={() => setDeleteConfirmId(tender.id)}><span className="material-symbols-outlined">delete</span>Sil</button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default IhaleInfoCard;
