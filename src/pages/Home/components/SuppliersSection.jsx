// Enes Doğanay | 6 Mayıs 2026: Örnek tedarikçiler grid — data hook'tan gelir
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './SuppliersSection.css';

// Enes Doğanay | 8 Mayıs 2026: IIFE anti-pattern kaldırıldı — module-level helper
const parseFirmaTags = (raw) => {
    if (!raw) return [];
    let arr = raw;
    if (typeof arr === 'string') {
        try { arr = JSON.parse(arr); } catch { return []; }
    }
    if (!Array.isArray(arr)) return [];
    return arr.map(k => k.ana_kategori).filter(Boolean).slice(0, 3);
};

const SuppliersSection = ({ topSuppliers, isLoading }) => {
    const navigate = useNavigate();

    return (
        <section className="sc-suppliers">
            <div className="container">
                <h2 className="sc-section-title" style={{ marginBottom: '32px' }}>Öne Çıkan Firmalar</h2>
                <div className="sc-sup-grid">
                    {isLoading
                        ? Array.from({ length: 4 }).map((_, i) => (
                            <div className="sc-sup-card sc-sup-card--skeleton" key={i} />
                        ))
                        : topSuppliers.map((firma, index) => {
                            const validLogo = firma.logo_url?.includes('firma-logolari') ? firma.logo_url : null;
                            // Enes Doğanay | 8 Mayıs 2026: IIFE → module-level parseFirmaTags
                            const tags = parseFirmaTags(firma.urun_kategorileri);

                            return (
                                // Enes Doğanay | 8 Mayıs 2026: firmaID tabanlı stabil key
                                <div className="sc-sup-card" key={firma.firmaID || `supplier-${index}`}>
                                    <div className="sc-sup-header">
                                        {validLogo ? (
                                            <img
                                                className="sc-sup-avatar"
                                                src={validLogo}
                                                alt={firma.firma_adi}
                                                onClick={() => navigate(`/firmadetay/${firma.firmaID}`)}
                                                style={{ objectFit: 'contain', background: '#fff', border: '1px solid #e0e7ff', cursor: 'pointer' }}
                                                role="button"
                                                tabIndex={0}
                                                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate(`/firmadetay/${firma.firmaID}`); }}
                                            />
                                        ) : (
                                            <div
                                                className="sc-sup-avatar"
                                                onClick={() => navigate(`/firmadetay/${firma.firmaID}`)}
                                                style={{ background: '#e0e7ff', color: '#4f46e5', border: '1px solid #c7d2fe', cursor: 'pointer' }}
                                                role="button"
                                                tabIndex={0}
                                                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate(`/firmadetay/${firma.firmaID}`); }}
                                            >
                                                {firma.firma_adi?.charAt(0)}
                                            </div>
                                        )}
                                        {firma._isVerified && (
                                            <div className="sc-sup-verified">
                                                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>verified</span> Onaylı Firma
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <h3
                                            className="sc-sup-name"
                                            onClick={() => navigate(`/firmadetay/${firma.firmaID}`)}
                                            style={{ cursor: 'pointer' }}
                                            role="button"
                                            tabIndex={0}
                                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate(`/firmadetay/${firma.firmaID}`); }}
                                        >
                                            {firma.firma_adi}
                                        </h3>
                                        <div className="sc-sup-location">
                                            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>location_on</span>
                                            {firma.il_ilce}
                                        </div>
                                    </div>
                                    <div className="sc-sup-tags">
                                        {tags.length > 0
                                            ? tags.map((tag) => <span className="sc-tag" key={tag}>{tag}</span>)
                                            : <span className="sc-tag">{firma.ana_sektor}</span>
                                        }
                                    </div>
                                </div>
                            );
                        })
                    }
                </div>
            </div>
        </section>
    );
};

export default SuppliersSection;
