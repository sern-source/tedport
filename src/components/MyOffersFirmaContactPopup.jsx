// Enes Doğanay | 6 Mayıs 2026: Firma iletişim bilgileri popup — yükleniyor durumu dahil
import React from 'react';

const MyOffersFirmaContactPopup = ({ firmaContactPopup, setFirmaContactPopup, firmaContactLoading }) => {
    if (!firmaContactLoading && !firmaContactPopup) return null;
    const p = firmaContactPopup;
    return (
        <div className="firma-contact-overlay" onClick={() => !firmaContactLoading && setFirmaContactPopup(null)}>
            <div className="firma-contact-card" onClick={e => e.stopPropagation()}>
                {firmaContactLoading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '20px 0', color: '#64748b' }}>
                        <div className="mop-chat-spinner" style={{ borderTopColor: '#2563eb' }} />
                        <p style={{ margin: 0, fontSize: '0.88rem' }}>Yükleniyor…</p>
                    </div>
                ) : (
                    <>
                        <button className="firma-contact-card__close" onClick={() => setFirmaContactPopup(null)}>
                            <span className="material-symbols-outlined">close</span>
                        </button>
                        <div className="firma-contact-card__avatar">
                            <span className="material-symbols-outlined">apartment</span>
                        </div>
                        {p.firma && <h3>{p.firma}</h3>}
                        {p.name && <p className="firma-contact-card__name">{p.name}</p>}
                        <div className="firma-contact-card__rows">
                            {p.firmaEmail && (
                                <a href={`mailto:${p.firmaEmail}`} className="firma-contact-row">
                                    <span className="material-symbols-outlined">mail</span>
                                    <div><small>E-POSTA</small><span>{p.firmaEmail}</span></div>
                                </a>
                            )}
                            {p.email && p.email !== p.firmaEmail && (
                                <a href={`mailto:${p.email}`} className="firma-contact-row">
                                    <span className="material-symbols-outlined">person</span>
                                    <div><small>YÖNETİCİ E-POSTA</small><span>{p.email}</span></div>
                                </a>
                            )}
                            {p.firmaPhone && (
                                <a href={`tel:${p.firmaPhone}`} className="firma-contact-row">
                                    <span className="material-symbols-outlined">call</span>
                                    <div><small>TELEFON</small><span>{p.firmaPhone}</span></div>
                                </a>
                            )}
                            {p.phone && p.phone !== p.firmaPhone && (
                                <a href={`tel:${p.phone}`} className="firma-contact-row">
                                    <span className="material-symbols-outlined">person</span>
                                    <div><small>YÖNETİCİ TELEFON</small><span>{p.phone}</span></div>
                                </a>
                            )}
                        </div>
                        {!p.email && !p.phone && !p.firmaPhone && !p.firmaEmail && (
                            <p className="firma-contact-card__empty">Bu firma için iletişim bilgisi bulunamadı.</p>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default MyOffersFirmaContactPopup;
