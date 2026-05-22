// Enes Doğanay | 12 Mayıs 2026: "Nasıl Çalışır?" — 3 adımlı platform akışı
'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import './HowItWorksSection.css';

const STEPS = [
    {
        step: '01',
        icon: 'person_add',
        title: 'Kurumsal Profilinizi Oluşturun',
        desc: 'Firmanızı dakikalar içinde oluşturun, ürün ve hizmetlerinizi sergileyin, sektörünüzde görünür olun.',
        color: '#2563eb',
    },
    {
        step: '02',
        icon: 'receipt_long',
        title: 'Teklif Süreçlerinizi Yönetin',
        desc: 'Satınalma taleplerinizi yayınlayın, ilgili firmalardan teklifler alın veya yeni iş fırsatlarına doğrudan ulaşın.',
        color: '#0891b2',
    },
    {
        step: '03',
        icon: 'handshake',
        title: 'Güçlü İş Bağlantıları Kurun',
        desc: 'Doğrulanmış firmalarla sürdürülebilir iş ilişkileri geliştirin, uzun vadeli çözüm ortaklıkları oluşturun.',
        color: '#059669',
    },
];

const HowItWorksSection = () => {
    const router = useRouter();

    return (
        <section className="sc-how">
            <div className="container">
                {/* Enes Doğanay | 12 Mayıs 2026: Bölüm başlığı */}
                <div className="sc-how-header">
                    <span className="sc-how-badge">
                        <span className="material-symbols-outlined">play_circle</span>
                        Nasıl Çalışır?
                    </span>
                    <h2 className="sc-how-title">Üç Adımda İş Ağınızı Genişletin</h2>
                    <p className="sc-how-subtitle">
                        Tedarikçi mi, satınalmacı mı? Fark etmez — Tedport her iki taraf için de çalışır.
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
                    <button className="sc-how-cta-btn" onClick={() => router.push('/register')}>
                        <span className="material-symbols-outlined">rocket_launch</span>
                        {/* Enes Doğanay | 16 Mayıs 2026: "— Ücretsiz" kaldırıldı */}
                        Hemen Başla
                    </button>
                </div>
            </div>
        </section>
    );
};

export default HowItWorksSection;
