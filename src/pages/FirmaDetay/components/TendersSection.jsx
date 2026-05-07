// Enes Doğanay | 6 Mayıs 2026: İhale listesi bölümü
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatTenderDate, getTenderStatusMeta } from '../../../constants/tenderUtils';
import './TendersSection.css';

const TENDERS_PREVIEW = 3;

const TendersSection = ({
    tenders, tendersLoading, isTendersTableMissing,
    showAllTenders, onToggleAll, userProfile, firmaId
}) => {
    const navigate = useNavigate();

    return (
        <section id="tenders" className="tenders-section">
            <div className="tenders-section-header">
                <h2 className="section-title">İhalerimiz</h2>
                <button type="button" className="tenders-section-link" onClick={() => navigate(`/ihaleler?firma=${firmaId}`)}>
                    Tümünü Gör
                    <span className="material-symbols-outlined">arrow_forward</span>
                </button>
            </div>

            <div className="firma-tenders-gate">
                {!userProfile && (
                    <div className="tenders-blur-overlay">
                        <div className="tenders-blur-cta">
                            <span className="material-symbols-outlined">lock</span>
                            <h3>İhaleleri görüntülemek için giriş yapın</h3>
                            <p>İhale detaylarını görmek için hesabınıza giriş yapın.</p>
                            <button type="button" className="tenders-blur-login-btn" onClick={() => navigate(`/login?redirect=/firmadetay/${firmaId}`)}>Giriş Yap</button>
                            <span className="tenders-blur-register">
                                Hesabınız yok mu?{' '}
                                <button type="button" onClick={() => navigate('/register')}>Kayıt Ol</button>
                            </span>
                        </div>
                    </div>
                )}
                <div className={!userProfile ? 'tenders-blurred-content' : undefined}>
                    {isTendersTableMissing ? (
                        <div className="tenders-empty-state-inline">
                            İhale tablosu Supabase üzerinde kurulduğunda bu alan otomatik olarak dinamik verilerle dolacak.
                        </div>
                    ) : tendersLoading ? (
                        <div className="tenders-list tenders-list-loading">
                            {[1, 2].map((item) => (
                                <div key={item} className="tender-item tender-item-skeleton" />
                            ))}
                        </div>
                    ) : tenders.length > 0 ? (
                        <div className="tenders-list">
                            {(showAllTenders ? tenders : tenders.slice(0, TENDERS_PREVIEW)).map((tender) => {
                                const tenderStatus = getTenderStatusMeta(tender);
                                return (
                                    <div
                                        key={tender.id}
                                        className="tender-item tender-item--clickable"
                                        onClick={() => navigate(`/ihaleler?ihale=${tender.id}`)}
                                    >
                                        <div className="tender-item-row">
                                            <div className="tender-item-left">
                                                <span className={`tender-status tender-status-${tenderStatus.className}`}>{tenderStatus.label}</span>
                                                <span className="tender-item-title">{tender.baslik}</span>
                                            </div>
                                            <div className="tender-item-right">
                                                {tender.kategori && <span className="tender-meta-chip">{tender.kategori}</span>}
                                                <span className="tender-item-date">
                                                    <span className="material-symbols-outlined">calendar_today</span>
                                                    {formatTenderDate(tender.son_basvuru_tarihi)}
                                                </span>
                                            </div>
                                        </div>
                                        {tender.aciklama && <p className="tender-item-desc">{tender.aciklama}</p>}
                                    </div>
                                );
                            })}
                            {tenders.length > TENDERS_PREVIEW && (
                                <button type="button" className="tenders-show-more-btn" onClick={onToggleAll}>
                                    {showAllTenders ? (
                                        <><span className="material-symbols-outlined">expand_less</span> Daha Az Göster</>
                                    ) : (
                                        <><span className="material-symbols-outlined">expand_more</span> {tenders.length - TENDERS_PREVIEW} İhale Daha</>
                                    )}
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="tenders-empty-state-inline">
                            Bu firmaya ait yayınlanmış ihale kaydı bulunmuyor.
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default TendersSection;
