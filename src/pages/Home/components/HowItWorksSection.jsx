// Enes Doğanay | 12 Mayıs 2026: "Nasıl Çalışır?" — 3 adımlı platform akışı
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HowItWorksSection.css';

const STEPS = [
    {
        step: '01',
        icon: 'person_add',
        title: 'Profilini Oluştur',
        desc: 'Firmanı dakikalar içinde kaydet. Ürün ve hizmetlerini listele, sektörünü seç. Üyelik tamamen ücretsiz.',
        color: '#2563eb',
    },
    {
        step: '02',
        icon: 'receipt_long',
        title: 'İhale Aç veya Teklif Ver',
        desc: 'Satınalma talebi oluştur, onlarca tedarikçiden teklif al. Ya da açık ihalelere teklif vererek yeni müşteriler kazan.',
        color: '#0891b2',
    },
    {
        step: '03',
        icon: 'handshake',
        title: 'Bağlantı Kur, Büyü',
        desc: 'Doğrulanmış firmalarla güvenli ticaret yap. Tekrarlayan siparişler, uzun vadeli ortaklıklar — hepsi tek platformda.',
        color: '#059669',
    },
];

const HowItWorksSection = () => {
    const navigate = useNavigate();

    return (
        <section className="sc-how">
            <div className="container">
                {/* Enes Doğanay | 12 Mayıs 2026: Bölüm başlığı */}
                <div className="sc-how-header">
                    <span className="sc-how-badge">
                        <span className="material-symbols-outlined">play_circle</span>
                        Nasıl Çalışır?
                    </span>
                    <h2 className="sc-how-title">Üç Adımda Dijital Ticarete Başla</h2>
                    <p className="sc-how-subtitle">
                        Satıcı mı, alıcı mı? Fark etmez — Tedport her iki taraf için de çalışır.
                    </p>
                </div>

                {/* Enes Doğanay | 12 Mayıs 2026: Adım kartları */}
                <div className="sc-how-steps">
                    {STEPS.map(({ step, icon, title, desc, color }, idx) => (
                        <div className="sc-how-step" key={step}>
                            <div className="sc-how-step-icon" style={{ '--step-color': color }}>
                                <span className="material-symbols-outlined">{icon}</span>
                            </div>
                            <h3 className="sc-how-step-title">{title}</h3>
                            <p className="sc-how-step-desc">{desc}</p>
                            {/* Bağlantı oku — son adım hariç, sadece desktop */}
                            {idx < STEPS.length - 1 && (
                                <span className="sc-how-arrow" aria-hidden="true">
                                    <span className="material-symbols-outlined">arrow_forward</span>
                                </span>
                            )}
                        </div>
                    ))}
                </div>

                {/* Enes Doğanay | 12 Mayıs 2026: CTA buton */}
                <div className="sc-how-cta">
                    <button className="sc-how-cta-btn" onClick={() => navigate('/register')}>
                        <span className="material-symbols-outlined">rocket_launch</span>
                        Hemen Başla — Ücretsiz
                    </button>
                </div>
            </div>
        </section>
    );
};

export default HowItWorksSection;
