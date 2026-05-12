// Enes Doğanay | 6 Mayıs 2026: CTA — çağrı aksiyonu bölümü
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './CTASection.css';

const CTASection = () => {
    const navigate = useNavigate();

    return (
        <section className="sc-cta">
            <div className="container">
                {/* Enes Doğanay | 12 Mayıs 2026: Güçlü CTA başlığı */}
                <h2>Firmanızı Dijital Ticarete Taşıyın</h2>
                <p>Satınalmacılar ve tedarikçiler her gün Tedport'ta buluşuyor. Ücretsiz profilinizi oluşturun, ilk teklifinizi bugün alın.</p>
                <div className="sc-cta-buttons">
                    <button className="sc-btn-white" onClick={() => navigate('/register')}>
                        Tedarikçi Olarak Katıl
                    </button>
                    <button className="sc-btn-transparent" onClick={() => navigate('/firmalar')}>
                        Ürünleri Keşfet
                    </button>
                </div>
            </div>
        </section>
    );
};

export default CTASection;
