// Enes Doğanay | 6 Mayıs 2026: Öne çıkan kategoriler — statik grid
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './CategoriesSection.css';

const CATEGORIES = [
    { icon: 'checkroom', name: 'Tekstil', sub: 'Kumaş & Hazır Giyim', search: 'tekstil' },
    { icon: 'restaurant', name: 'Gıda', sub: 'İçerik & İşlenmiş', search: 'gıda' },
    { icon: 'build', name: 'Makine', sub: 'Ekipman & Aletler', search: 'makine' },
    { icon: 'devices', name: 'Teknoloji', sub: 'Tüketici & Parçalar', search: 'teknoloji' },
    { icon: 'local_shipping', name: 'Lojistik', sub: 'Nakliye & Kargo', search: 'lojistik' },
    { icon: 'science', name: 'Kimya', sub: 'Lab & Endüstriyel', search: 'kimya' },
];

const CategoriesSection = () => {
    const navigate = useNavigate();

    return (
        <section className="sc-categories">
            <div className="container">
                <div className="sc-section-header">
                    <div>
                        <h2 className="sc-section-title">Öne Çıkan Kategoriler</h2>
                        <p className="sc-section-desc">Kapsamlı endüstriyel kategorilerimizi keşfedin.</p>
                    </div>
                    {/* Enes Doğanay | 8 Mayıs 2026: role=button + klavye desteği */}
                    <span className="sc-view-all" onClick={() => navigate('/firmalar')} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate('/firmalar'); }} style={{ cursor: 'pointer' }}>
                        Tüm kategorileri gör <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_forward</span>
                    </span>
                </div>

                <div className="sc-cat-grid">
                    {CATEGORIES.map(({ icon, name, sub, search }) => (
                        <div className="sc-cat-card" key={name}
                            onClick={() => navigate(`/firmalar?search=${search}`)}
                            role="button"
                            tabIndex={0}
                            aria-label={`${name} kategorisini ara`}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate(`/firmalar?search=${search}`); }}
                            style={{ cursor: 'pointer' }}>
                            <div className="sc-cat-icon">
                                <span className="material-symbols-outlined">{icon}</span>
                            </div>
                            <div>
                                <h3 className="sc-cat-name">{name}</h3>
                                <p className="sc-cat-sub">{sub}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default CategoriesSection;
