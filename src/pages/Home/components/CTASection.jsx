// Enes Doğanay | 6 Mayıs 2026: CTA — çağrı aksiyonu bölümü
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './CTASection.css';

const CTASection = () => {
    const navigate = useNavigate();

    return (
        <section className="sc-cta">
            <div className="container">
                <h2>İşinizi Büyütmeye Hazır mısınız?</h2>
                <p>Her gün uluslararası alıcılarla bağlantı kuran binlerce tedarikçiye katılın. Ücretsiz profilinizi şimdi oluşturun.</p>
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
