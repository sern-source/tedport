// Enes Doğanay | 6 Mayıs 2026: İletişim sayfası — koordinatör
import React from 'react';
import './IletisimPage.css';
import './IletisimPage.footer.css';
import './IletisimPage.dark.css';
import SharedHeader from '../../components/SharedHeader';
import '../../components/SharedHeader.css';
import SharedFooter from '../../components/SharedFooter';
import SEO from '../../components/SEO';
import { useIletisim } from './hooks/useIletisim';
import IletisimForm from './IletisimForm';

const NAV_ITEMS = [
  { label: 'Anasayfa', href: '/' },
  { label: 'Firmalar', href: '/firmalar' },
  { label: 'İhaleler', href: '/ihaleler' },
  { label: 'Hakkımızda', href: '/hakkimizda' },
];

// Enes Doğanay | 12 Mayıs 2026: İletişim amaç kartları
const PURPOSES = [
  { key: 'Platforma Katılım', icon: 'rocket_launch',  label: 'Platforma Katılın', desc: 'Üyelik ve kayıt süreci' },
  { key: 'Teknik Destek',     icon: 'support_agent', label: 'Teknik Destek',     desc: 'Hata ve teknik sorunlar' },
  { key: 'İş Birliği',        icon: 'handshake',     label: 'İş Birliği',         desc: 'Partnerlik ve iş geliştirme' },
  { key: 'Genel Soru',        icon: 'chat',          label: 'Genel Soru',        desc: 'Diğer konular' },
];

const IletisimPage = () => {
  const { formData, status, selectedPurpose, handleChange, handlePurposeSelect, handleSubmit } = useIletisim();
  return (
    <>
      <SEO title="İletişim" description="Tedport ile iletişime geçin. Sorularınız ve önerileriniz için bize ulaşın." path="/iletisim" />
      <SharedHeader navItems={NAV_ITEMS} />
      <div className="contact-page-wrapper">
        <main className="contact-main">
          <div className="contact-hero">
            <div className="contact-hero-bg">
              <div className="contact-hero-overlay"></div>
              <img alt="Modern building" src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1920" loading="lazy" />
            </div>
            <div className="contact-container contact-hero-content">
              <h1>Türkiye&apos;nin Dijital Ticaret Ağıyla Bağlantıya Geçin</h1>
              <p>İş birliği, teknik destek veya platforma katılım için buradayız. Ekibimiz en kısa sürede size dönüş yapar.</p>
            </div>
          </div>
          <section className="contact-section">
            <div className="contact-container">
              {/* Enes Doğanay | 12 Mayıs 2026: Amaç kartları */}
              <div className="contact-purpose-grid">
                {PURPOSES.map(p => (
                  <button
                    key={p.key}
                    className={`contact-purpose-card${selectedPurpose === p.key ? ' active' : ''}`}
                    onClick={() => handlePurposeSelect(p.key)}
                  >
                    <span className="material-symbols-outlined">{p.icon}</span>
                    <span className="contact-purpose-label">{p.label}</span>
                    <span className="contact-purpose-desc">{p.desc}</span>
                  </button>
                ))}
              </div>
              <div className="contact-grid">
                <IletisimForm formData={formData} status={status} handleChange={handleChange} handleSubmit={handleSubmit} />
                <div className="contact-info-wrapper">
                  <div className="contact-info-header">
                    <h2>Nasıl Yardımcı Olabiliriz?</h2>
                    <p>Yukarıdan konunuzu seçin ya da doğrudan mesaj gönderin. En kısa sürede geri döneceğiz.</p>
                  </div>
                  <div className="contact-info-cards">
                    <div className="contact-info-card">
                      <div className="contact-icon-box"><span className="material-symbols-outlined">mail</span></div>
                      <div className="contact-info-text">
                        <h3>E-posta</h3>
                        <p>Tüm sorularınız için</p>
                        <a href="mailto:info@tedport.com">info@tedport.com</a>
                      </div>
                    </div>
                    {/* Enes Doğanay | 12 Mayıs 2026: Güven sinyalleri */}
                    <div className="contact-trust-signals">
                      <div className="contact-trust-item">
                        <span className="material-symbols-outlined">schedule</span>
                        <div>
                          <strong>Ortalama yanıt süresi</strong>
                          <p>24 saat içinde</p>
                        </div>
                      </div>
                      <div className="contact-trust-item">
                        <span className="material-symbols-outlined">calendar_today</span>
                        <div>
                          <strong>Destek saatleri</strong>
                          <p>Hafta içi 09:00 – 18:00</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
      <SharedFooter />
    </>
  );
};

export default IletisimPage;
