// Enes Doğanay | 6 Mayıs 2026: Örnek tedarikçiler grid — data hook'tan gelir
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './SuppliersSection.css';

const SuppliersSection = ({ topSuppliers, isLoading }) => {
    const navigate = useNavigate();

    return (
        <section className="sc-suppliers">
            <div className="container">
                <h2 className="sc-section-title" style={{ marginBottom: '32px' }}>Örnek Tedarikçiler</h2>
                <div className="sc-sup-grid">
                    {isLoading
                        ? Array.from({ length: 4 }).map((_, i) => (
                            <div className="sc-sup-card sc-sup-card--skeleton" key={i} />
                        ))
                        : topSuppliers.map((firma, index) => {
                            const validLogo = firma.logo_url?.includes('firma-logolari') ? firma.logo_url : null;
                            const tags = (() => {
                                let raw = firma.urun_kategorileri;
                                if (!raw) return [];
                                if (typeof raw === 'string') { try { raw = JSON.parse(raw); } catch { return []; } }
                                if (!Array.isArray(raw)) return [];
                                return raw.map(k => k.ana_kategori).filter(Boolean).slice(0, 3);
                            })();

                            return (
                                <div className="sc-sup-card" key={`supplier-${index}`}>
                                    <div className="sc-sup-header">
                                        {validLogo ? (
                                            <img
                                                className="sc-sup-avatar"
                                                src={validLogo}
                                                alt={firma.firma_adi}
                                                onClick={() => navigate(`/firmadetay/${firma.firmaID}`)}
                                                style={{ objectFit: 'contain', background: '#fff', border: '1px solid #e0e7ff', cursor: 'pointer' }}
                                            />
                                        ) : (
                                            <div
                                                className="sc-sup-avatar"
                                                onClick={() => navigate(`/firmadetay/${firma.firmaID}`)}
                                                style={{ background: '#e0e7ff', color: '#4f46e5', border: '1px solid #c7d2fe', cursor: 'pointer' }}
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
                                            ? tags.map((tag, i) => <span className="sc-tag" key={i}>{tag}</span>)
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
