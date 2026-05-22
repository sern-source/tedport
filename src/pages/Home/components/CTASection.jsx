// Enes Doğanay | 13 Mayıs 2026: CTASection — alıcı + tedarikçi iki taraflı panel tasarımı
'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import './CTASection.css';

const CTASection = () => {
    const router = useRouter();

    return (
        <section className="sc-cta">
            <div className="container">
                <p className="sc-cta-eyebrow">Platforma Katılın</p>
                <h2>İş Süreçlerinizi Tedport ile Güçlendirin</h2>
                <div className="sc-cta-split">
                    {/* Enes Doğanay | 13 Mayıs 2026: Tedarikçi paneli */}
                    <div className="sc-cta-panel">
                        <div className="sc-cta-panel__icon">
                            <span className="material-symbols-outlined">factory</span>
                        </div>
                        <h3>Tedarikçiyim</h3>
                        <p>Kurumsal profilinizi oluşturun, yeni firmalarla bağlantı kurun ve iş fırsatlarına ulaşın.</p>
                        <div className="sc-cta-panel__btns">
                            <button className="sc-btn-white" onClick={() => router.push('/register')}>
                                {/* Enes Doğanay | 16 Mayıs 2026: "Ücretsiz Kayıt Ol" → "Platforma Katıl" */}
                                Platforma Katıl
                            </button>
                            <button className="sc-btn-transparent" onClick={() => router.push('/firmalar')}>
                                Firmalar
                            </button>
                        </div>
                    </div>

                    <div className="sc-cta-divider" aria-hidden="true">
                        <span>veya</span>
                    </div>

                    {/* Enes Doğanay | 13 Mayıs 2026: Satınalmacı paneli */}
                    <div className="sc-cta-panel">
                        <div className="sc-cta-panel__icon">
                            <span className="material-symbols-outlined">request_quote</span>
                        </div>
                        <h3>Satınalmacıyım</h3>
                        <p>Satınalma taleplerinizi yönetin, farklı firmalardan teklifler alın ve doğru çözüm ortağını bulun.</p>
                        <div className="sc-cta-panel__btns">
                            <button className="sc-btn-white" onClick={() => router.push('/ihaleler')}>
                                İhale Aç
                            </button>
                            <button className="sc-btn-transparent" onClick={() => router.push('/register?type=corporate')}>
                                Kurumsal Başvur
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CTASection;
