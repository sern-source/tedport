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

const IletisimPage = () => {
  const { formData, status, handleChange, handleSubmit } = useIletisim();
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
              <h1>Bize Ulaşın</h1>
              <p>Sorularınız mı var? İş birliği fırsatları veya genel sorularınız için ekibimizle iletişime geçin. Size yardımcı olmaktan mutluluk duyarız.</p>
            </div>
          </div>
          <section className="contact-section">
            <div className="contact-container">
              <div className="contact-grid">
                <IletisimForm formData={formData} status={status} handleChange={handleChange} handleSubmit={handleSubmit} />
                <div className="contact-info-wrapper">
                  <div className="contact-info-header">
                    <h2>İletişim Bilgileri</h2>
                    <p>Sorularınız veya önerileriniz için bize e-posta aracılığıyla ulaşabilirsiniz. En kısa sürede geri dönüş yapacağız.</p>
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
