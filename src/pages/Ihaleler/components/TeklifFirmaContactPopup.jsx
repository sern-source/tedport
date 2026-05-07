// Enes Doğanay | 6 Mayıs 2026: Firma iletişim bilgileri popup
import React from 'react';

const TeklifFirmaContactPopup = ({ firmaContactPopup, setFirmaContactPopup }) => {
    if (!firmaContactPopup) return null;
    const p = firmaContactPopup;
    const hasContact = p.firmaEmail || p.email || p.firmaPhone || p.phone;
    return (
        <div className="firma-contact-overlay" onClick={() => setFirmaContactPopup(null)}>
            <div className="firma-contact-card" onClick={e => e.stopPropagation()}>
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
                {!hasContact && <p className="firma-contact-card__empty">Bu firma için iletişim bilgisi bulunamadı.</p>}
            </div>
        </div>
    );
};

export default TeklifFirmaContactPopup;
