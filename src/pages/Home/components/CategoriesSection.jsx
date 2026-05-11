// Enes Doğanay | 6 Mayıs 2026: Öne çıkan kategoriler — statik grid
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './CategoriesSection.css';

// Enes Doğanay | 11 Mayıs 2026: 20 geniş sektörden 6 seçilmiş — sidebar Sektör filtresiyle tam eşleşme
const CATEGORIES = [
    { icon: 'precision_manufacturing', name: 'Makine ve Endüstriyel Ekipmanlar', search: 'Makine ve Endüstriyel Ekipmanlar' },
    { icon: 'hardware', name: 'Metal ve Metal İşleme Sanayi', search: 'Metal ve Metal İşleme Sanayi' },
    { icon: 'bolt', name: 'Elektrik ve Elektrik Ekipmanları', search: 'Elektrik ve Elektrik Ekipmanları' },
    { icon: 'checkroom', name: 'Tekstil ve Tekstil Üretimi', search: 'Tekstil ve Tekstil Üretimi' },
    { icon: 'local_shipping', name: 'Lojistik ve Tedarik Zinciri', search: 'Lojistik ve Tedarik Zinciri' },
    { icon: 'science', name: 'Kimya ve Endüstriyel Kimyasallar', search: 'Kimya ve Endüstriyel Kimyasallar' },
];

const CategoriesSection = () => {
    const navigate = useNavigate();

    return (
        <section className="sc-categories">
            <div className="container">
                <div className="sc-section-header">
                    <div>
                        <h2 className="sc-section-title">Öne Çıkan Sektörler</h2>
                        <p className="sc-section-desc">Faaliyet gösterdiğiniz sektörü seçin, ilgili firmaları listeleyin.</p>
                    </div>
                    {/* Enes Doğanay | 8 Mayıs 2026: role=button + klavye desteği */}
                    <span className="sc-view-all" onClick={() => navigate('/firmalar')} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate('/firmalar'); }} style={{ cursor: 'pointer' }}>
                        Tüm sektörleri gör <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_forward</span>
                    </span>
                </div>

                <div className="sc-cat-grid">
                    {CATEGORIES.map(({ icon, name, search }) => (
                        <div className="sc-cat-card" key={name}
                            onClick={() => navigate(`/firmalar?sector=${encodeURIComponent(search)}`)}
                            role="button"
                            tabIndex={0}
                            aria-label={`${name} sektörünü filtrele`}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate(`/firmalar?sector=${encodeURIComponent(search)}`); }}
                            style={{ cursor: 'pointer' }}>
                            <div className="sc-cat-icon">
                                <span className="material-symbols-outlined">{icon}</span>
                            </div>
                            <div>
                                <h3 className="sc-cat-name">{name}</h3>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default CategoriesSection;
