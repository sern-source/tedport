// Enes Doðanay | 7 Mayýs 2026: Ýletiþim bilgisi popup — CSS yapýsýna uygun (banner+avatar+identity+rows)
import React, { useEffect } from 'react';

const IhaleContactPopup = ({ contactState, setContactState }) => {
    const { popup, loading } = contactState;

    // Enes Doðanay | 7 Mayýs 2026: ESC önce bu popup'ý kapat, chat'e geçmesin (capture phase)
    useEffect(() => {
        if (!popup && !loading) return;
        const handler = (e) => {
            if (e.key === 'Escape') {
                e.stopPropagation();
                setContactState(p => ({ ...p, popup: null }));
            }
        };
        document.addEventListener('keydown', handler, true);
        return () => document.removeEventListener('keydown', handler, true);
    }, [popup, loading, setContactState]);

    if (!popup && !loading) return null;

    const handleCopy = (field, value) => {
        navigator.clipboard.writeText(value).then(() => {
            setContactState(p => ({ ...p, copiedField: field }));
            setTimeout(() => setContactState(p => ({ ...p, copiedField: null })), 2000);
        });
    };

    const initials = popup
        ? (popup.initials || (popup.name || '').trim().split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?')
        : '?';

    return (
        <div className="tom-contact-overlay" onClick={e => { if (e.target === e.currentTarget) setContactState(p => ({ ...p, popup: null })); }}>
            <div className="tom-contact-card" role="dialog" aria-modal="true" aria-labelledby="ihale-contact-title">
                {loading && !popup ? (
                    <div style={{ padding: 40, textAlign: 'center' }}>
                        <span className="material-symbols-outlined tom-spin" style={{ fontSize: 32 }}>progress_activity</span>
                        <p style={{ marginTop: 12 }}>Ýletiþim bilgileri yükleniyor…</p>
                    </div>
                ) : popup ? (
                    <>
                        <div className="tom-contact-card__banner">
                            <button className="tom-contact-card__close" onClick={() => setContactState(p => ({ ...p, popup: null }))} aria-label="Kapat">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="tom-contact-card__avatar">
                            {popup.avatar
                                ? <img className="tom-contact-card__avatar-img" src={popup.avatar} alt={popup.name || ''} />
                                : <span className="tom-contact-card__initials">{initials}</span>
                            }
                        </div>

                        <div className="tom-contact-card__identity">
                            <h3 id="ihale-contact-title">{popup.name || 'İsimsiz'}</h3>
                            {(popup.firma || popup.companyName) && (
                                <p className="tom-contact-card__firma">
                                    <span className="material-symbols-outlined">business</span>
                                    {popup.firma || popup.companyName}
                                </p>
                            )}
                            {popup.avatar && (
                                <span className="tom-contact-card__badge">
                                    <span className="material-symbols-outlined">verified</span>
                                    Kayıtlı Üye
                                </span>
                            )}
                        </div>

                        <div className="tom-contact-card__rows">
                            {popup.email && (
                                <div className="tom-contact-row tom-contact-row--email">
                                    <span className="material-symbols-outlined">email</span>
                                    <div className="tom-contact-row__body">
                                        <small>E-posta</small>
                                        <span>{popup.email}</span>
                                    </div>
                                    <div className="tom-contact-row__actions">
                                        <button className="tom-contact-icon-btn" onClick={() => handleCopy('email', popup.email)} data-tooltip="Kopyala">
                                            <span className="material-symbols-outlined">{contactState.copiedField === 'email' ? 'check' : 'content_copy'}</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                            {(popup.phone || popup.firmaPhone) && (
                                <div className="tom-contact-row">
                                    <span className="material-symbols-outlined">phone</span>
                                    <div className="tom-contact-row__body">
                                        <small>Telefon</small>
                                        <span>{popup.phone || popup.firmaPhone}</span>
                                    </div>
                                    <div className="tom-contact-row__actions">
                                        <a className="tom-contact-icon-btn" href={`tel:${popup.phone || popup.firmaPhone}`} data-tooltip="Ara">
                                            <span className="material-symbols-outlined">call</span>
                                        </a>
                                        <button className="tom-contact-icon-btn" onClick={() => handleCopy('phone', popup.phone || popup.firmaPhone)} data-tooltip="Kopyala">
                                            <span className="material-symbols-outlined">{contactState.copiedField === 'phone' ? 'check' : 'content_copy'}</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                            {popup.location && (
                                <div className="tom-contact-row">
                                    <span className="material-symbols-outlined">location_on</span>
                                    <div className="tom-contact-row__body">
                                        <small>Konum</small>
                                        <span>{popup.location}</span>
                                    </div>
                                </div>
                            )}
                            {popup.firmaEmail && popup.firmaEmail !== popup.email && (
                                <div className="tom-contact-row tom-contact-row--email">
                                    <span className="material-symbols-outlined">corporate_fare</span>
                                    <div className="tom-contact-row__body">
                                        <small>Firma E-posta</small>
                                        <span>{popup.firmaEmail}</span>
                                    </div>
                                    <div className="tom-contact-row__actions">
                                        <button className="tom-contact-icon-btn" onClick={() => handleCopy('firmaEmail', popup.firmaEmail)} data-tooltip="Kopyala">
                                            <span className="material-symbols-outlined">{contactState.copiedField === 'firmaEmail' ? 'check' : 'content_copy'}</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                            {!popup.email && !popup.phone && !popup.firmaPhone && (
                                <p className="tom-contact-card__empty">İletişim bilgisi mevcut değil.</p>
                            )}
                        </div>
                    </>
                ) : null}
            </div>
        </div>
    );
};

export default IhaleContactPopup;
