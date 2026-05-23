// Enes Doğanay | 6 Mayıs 2026: İletişim sidebar kartı
'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import './ContactCard.css';

const ContactCard = ({
    firma, userProfile, sessionChecked, isVerified,
    onQuoteRequest, googleMapsLink, encodedAddress, adresText, firmaId, firmaSlug
}) => {
    const router = useRouter();

    return (
        <div className="card sidebar-card sidebar-card-contact">
            <h3 className="sidebar-heading">İletişime Geç</h3>

            <button
                className="btn btn-primary btn-full btn-request-quote"
                disabled={sessionChecked && (!userProfile || !isVerified)}
                onClick={onQuoteRequest}
                title={!isVerified ? 'Bu firma henüz kurumsal profilini yönetmiyor' : ''}
            >
                {sessionChecked && !userProfile && <span className="material-symbols-outlined btn-request-quote-icon">lock</span>}
                {!isVerified && userProfile && <span className="material-symbols-outlined btn-request-quote-icon">block</span>}
                Teklif İste
            </button>
            {!isVerified && userProfile && (
                <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '6px', textAlign: 'center' }}>Bu firma henüz profilini yönetmiyor.</p>
            )}

            {userProfile && firma.telefon && (
                <a href={`tel:${firma.telefon}`} className="contact-link-wrap">
                    <button className="btn btn-outline btn-full btn-contact">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M15 11.5v2a1.4 1.4 0 0 1-1.5 1.4 13.8 13.8 0 0 1-6-2.14 13.5 13.5 0 0 1-4.17-4.17 13.8 13.8 0 0 1-2.14-6.02A1.4 1.4 0 0 1 2.6 1h2a1.4 1.4 0 0 1 1.4 1.2c.09.65.25 1.28.49 1.9a1.4 1.4 0 0 1-.32 1.47L5.58 6.67A11.2 11.2 0 0 0 9.75 10.8l1.1-.89a1.4 1.4 0 0 1 1.47-.31c.62.24 1.25.4 1.9.49A1.4 1.4 0 0 1 15 11.5z" />
                        </svg>
                        {firma.telefon}
                    </button>
                </a>
            )}

            {sessionChecked && !userProfile && (
                <div className="contact-gated-panel">
                    <p className="contact-gated-text">Teklif istemek ve telefon bilgisini görmek için giriş yapın.</p>
                    {/* Enes Doğanay | 25 Mayıs 2026: slug URL öncelikli login redirect */}
                    <button onClick={() => router.push(`/login?redirect=${firmaSlug ? `/firmalar/${firmaSlug}` : `/firmadetay/${firmaId}`}`)} className="notes-login-btn contact-login-btn">Giriş Yap</button>
                </div>
            )}

            <div className="contact-details-panel">
                <div className="contact-details-header">
                    <h4 className="sidebar-subtitle">Konum</h4>
                    <a href={googleMapsLink} target="_blank" rel="noopener noreferrer" className="contact-map-action">Haritada Aç</a>
                </div>

                <div className="map-iframe-wrapper" style={{ width: '100%', borderRadius: 8, overflow: 'hidden', margin: '6px 0' }}>
                    <iframe
                        data-tooltip="Firma Konumu"
                        width="100%"
                        height="150"
                        style={{ border: 0, minHeight: 150, display: 'block' }}
                        loading="lazy"
                        allowFullScreen
                        referrerPolicy="no-referrer-when-downgrade"
                        src={`https://maps.google.com/maps?q=${encodedAddress}&output=embed`}
                    />
                </div>
                <div style={{ marginTop: 3, fontWeight: 600, color: '#1a73e8', fontSize: 12.5, lineHeight: 1.4 }}>
                    {adresText}
                </div>

                {(firma.web_sitesi || firma.eposta) && (
                    <div className="contact-info-stack">
                        {firma.web_sitesi && (
                            <a
                                href={firma.web_sitesi.startsWith('http') ? firma.web_sitesi : `https://${firma.web_sitesi}`}
                                target="_blank" rel="noopener noreferrer"
                                className="contact-info-row contact-info-link"
                            >
                                <svg className="contact-info-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="#137fec" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="8" cy="8" r="7" /><line x1="1" y1="8" x2="15" y2="8" /><path d="M8 1a10.3 10.3 0 0 1 0 14M8 1a10.3 10.3 0 0 0 0 14" />
                                </svg>
                                {firma.web_sitesi}
                            </a>
                        )}
                        {firma.eposta && (
                            <a href={`mailto:${firma.eposta}`} className="contact-info-row contact-info-link">
                                <svg className="contact-info-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="#137fec" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="1" y="3" width="14" height="10" rx="1" /><polyline points="1,4 8,9 15,4" />
                                </svg>
                                {firma.eposta}
                            </a>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ContactCard;
