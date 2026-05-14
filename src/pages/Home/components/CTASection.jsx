// Enes Doğanay | 13 Mayıs 2026: CTASection — alıcı + tedarikçi iki taraflı panel tasarımı
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './CTASection.css';

const CTASection = () => {
    const navigate = useNavigate();

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
                            <button className="sc-btn-white" onClick={() => navigate('/register')}>
                                Ücretsiz Kayıt Ol
                            </button>
                            <button className="sc-btn-transparent" onClick={() => navigate('/firmalar')}>
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
                            <button className="sc-btn-white" onClick={() => navigate('/ihaleler')}>
                                İhale Aç
                            </button>
                            <button className="sc-btn-transparent" onClick={() => navigate('/register?type=corporate')}>
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
