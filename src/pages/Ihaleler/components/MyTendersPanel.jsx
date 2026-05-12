// Enes Doğanay | 5 Mayıs 2026: Kurumsal kullanıcı ihale yönetim paneli
import React from 'react';
import './MyTendersPanel.css';
import { formatTenderDate, getTenderStatusMeta } from '../../../constants/tenderUtils';

// Enes Doğanay | 5 Mayıs 2026: Yalnızca UI — tüm state ve handler'lar props ile gelir
const MyTendersPanel = ({
    myTenders,
    myTendersLoading,
    myTendersExpanded,
    setMyTendersExpanded,
    deleteConfirmId,
    setDeleteConfirmId,
    closeConfirmId,
    setCloseConfirmId,
    onCreateNew,
    onEdit,
    onClone,
    onDelete,
    onClose,
}) => {
    return (
        <section className="my-tenders-panel">
            <div className="my-tenders-panel__head">
                <div>
                    {/* Enes Doğanay | 10 Nisan 2026: "Benim" kaldırıldı */}
                    <h2><span className="material-symbols-outlined">gavel</span> İhalelerim</h2>
                    <p>Firmanız adına yayınladığınız ihaleleri buradan yönetin.</p>
                </div>
                <button type="button" className="my-tenders-add-btn" onClick={onCreateNew}>
                    <span className="material-symbols-outlined">add_circle</span>
                    Yeni İhale Oluştur
                </button>
            </div>

            {myTendersLoading ? (
                <div className="my-tenders-panel__body">
                    <p className="my-tenders-loading">Yükleniyor…</p>
                </div>
            ) : myTenders.length === 0 ? (
                /* Enes Doğanay | 1 Mayıs 2026: Hiç ihalesi olmayan firmaya onboarding bannerı */
                <div className="my-tenders-first-banner">
                    <div className="my-tenders-first-banner__icon">
                        <span className="material-symbols-outlined">rocket_launch</span>
                    </div>
                    <div className="my-tenders-first-banner__body">
                        <strong>İlk ihalenizi oluşturun</strong>
                        <p>Tedarikçi firmalar tekliflerini görebilsin diye ihalenizi yayınlayın. 3 dakika sürer.</p>
                    </div>
                    <button type="button" className="my-tenders-first-banner__btn" onClick={onCreateNew}>
                        İhale Oluştur
                        <span className="material-symbols-outlined">arrow_forward</span>
                    </button>
                </div>
            ) : (
                <div className="my-tenders-panel__body">
                <div className="my-tenders-list">
                    {/* Enes Doğanay | 13 Nisan 2026: Varsayılan 2 ihale göster, genişletildiğinde tamamını göster */}
                    {(myTendersExpanded ? myTenders : myTenders.slice(0, 2)).map(t => {
                        const sm = getTenderStatusMeta(t);
                        return (
                            <div key={t.id} className="my-tender-row">
                                <div className="my-tender-row__info">
                                    <span className={`tender-card-status tender-card-status-${sm.className}`}>{sm.label}</span>
                                    <strong>{t.baslik}</strong>
                                    {t.son_basvuru_tarihi && <span className="my-tender-row__date">Son: {formatTenderDate(t.son_basvuru_tarihi)}</span>}
                                </div>
                                {/* Enes Doğanay | 12 Mayıs 2026: Butonlar — draft farklı aksiyon setine sahip */}
                                <div className="my-tender-row__actions">
                                {/* Enes Doğanay | 12 Mayıs 2026: Kapalı/iptal için Düzenle gizlenir */}
                                {sm.key !== 'kapali' && sm.key !== 'iptal' && (
                                    <button type="button" className="my-tender-btn my-tender-btn--edit" onClick={() => onEdit(t)}>
                                        <span className="material-symbols-outlined">{sm.key === 'draft' ? 'edit_note' : 'edit'}</span>
                                        {sm.key === 'draft' ? 'Taslağı Düzenle' : 'Düzenle'}
                                    </button>
                                )}
                                    {/* Enes Doğanay | 12 Mayıs 2026: draft/yaklaşan için İhaleyi Kapat gizle */}
                                    {sm.key !== 'draft' && sm.key !== 'yaklasan' && (
                                        (sm.key === 'kapali' || sm.key === 'iptal') ? (
                                            <button type="button" className="my-tender-btn my-tender-btn--repeat" onClick={() => onClone(t)}>
                                                <span className="material-symbols-outlined">replay</span>
                                                İhaleyi Tekrarla
                                            </button>
                                        ) : (
                                            closeConfirmId === t.id ? (
                                                <div className="my-tender-confirm-inline">
                                                    <span>Kapatmak istediğinize emin misiniz?</span>
                                                    <button type="button" className="my-tender-btn my-tender-btn--confirm" onClick={() => { setCloseConfirmId(null); onClose(t.id); }}>Evet</button>
                                                    <button type="button" className="my-tender-btn my-tender-btn--cancel" onClick={() => setCloseConfirmId(null)}>İptal</button>
                                                </div>
                                            ) : (
                                                <button type="button" className="my-tender-btn my-tender-btn--close" onClick={() => setCloseConfirmId(t.id)}>
                                                    <span className="material-symbols-outlined">lock</span>
                                                    İhaleyi Kapat
                                                </button>
                                            )
                                        )
                                    )}
                                    {deleteConfirmId === t.id ? (
                                        <div className="my-tender-confirm-inline">
                                            <span className="material-symbols-outlined" style={{fontSize:15,color:'#dc2626'}}>warning</span>
                                            <span>Kalıcı olarak silinecek, emin misiniz?</span>
                                            <button type="button" className="my-tender-btn my-tender-btn--confirm" onClick={() => onDelete(t.id)}>
                                                <span className="material-symbols-outlined">delete</span>
                                                Sil
                                            </button>
                                            <button type="button" className="my-tender-btn my-tender-btn--cancel" onClick={() => setDeleteConfirmId(null)}>İptal</button>
                                        </div>
                                    ) : (
                                        <button type="button" className="my-tender-btn my-tender-btn--delete" onClick={() => setDeleteConfirmId(t.id)}>
                                            <span className="material-symbols-outlined">delete</span>
                                            Sil
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                    {/* Enes Doğanay | 13 Nisan 2026: 2'den fazla ihale varsa genişlet/küçült butonu */}
                    {myTenders.length > 2 && (
                        <button
                            type="button"
                            className="my-tenders-toggle-btn"
                            onClick={() => setMyTendersExpanded(prev => !prev)}
                        >
                            <span className="material-symbols-outlined">
                                {myTendersExpanded ? 'expand_less' : 'expand_more'}
                            </span>
                            {myTendersExpanded ? 'Küçült' : `Tümünü Göster (${myTenders.length})`}
                        </button>
                    )}
                </div>
                </div>
            )}
        </section>
    );
};

export default MyTendersPanel;
