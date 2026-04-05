/**
 * iletisim.jsx - Contact Page
 * 
 * Mobile Responsive Design & Hamburger Menu Implementation
 * Date: April 4, 2026
 * Author: Enes Doğanay
 * 
 * Features:
 * - Responsive header with hamburger menu for mobile (< 1024px)
 * - Full navigation bar for desktop (>= 1024px)
 * - Contact form with email validation and Supabase integration
 * - Contact information cards (address, phone, email)
 * - Google Maps embedded location
 * - Responsive grid layouts
 * - Mobile-first design approach with progressive enhancement
 * - Hero section with adaptive typography
 */

// Enes Doğanay | 6 Nisan 2026: useState/useEffect/useNavigate temizlendi
import React, { useState } from 'react';
import './iletisim.css';
import SharedHeader from './SharedHeader';
import './SharedHeader.css';
import { supabase } from './supabaseClient';

const Contact = () => {

    // Form verilerini tutacağımız state
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    // Formun durumunu (bekliyor, yükleniyor, başarılı, hata) tutacağımız state
    const [status, setStatus] = useState('idle');

    // Inputlar değiştikçe state'i güncelleyen fonksiyon
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Form gönderildiğinde çalışacak fonksiyon
    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('loading');

        try {
            // Supabase'e veriyi ekle
            const { error } = await supabase
                .from('iletisim')
                .insert([
                    {
                        name: formData.name,
                        email: formData.email,
                        subject: formData.subject,
                        message: formData.message
                    }
                ]);

            if (error) throw error;

            // Başarılı olursa formu temizle ve mesaj göster
            setStatus('success');
            setFormData({ name: '', email: '', subject: '', message: '' });

            // 5 saniye sonra başarı mesajını kaldır
            setTimeout(() => setStatus('idle'), 5000);

        } catch (error) {
            setStatus('error');
            setTimeout(() => setStatus('idle'), 5000);
        }
    };

    return (
        <>
            <SharedHeader
                navItems={[
                    { label: 'Anasayfa', href: '/' },
                    { label: 'Firmalar', href: '/firmalar' },
                    { label: 'Hakkımızda', href: '/hakkimizda' }
                ]}
            />

            <div className="contact-page-wrapper">

                <main className="contact-main">
                    {/* Hero Section */}
                    <div className="contact-hero">
                        <div className="contact-hero-bg">
                            <div className="contact-hero-overlay"></div>
                            <img alt="Modern building" src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1920" />
                        </div>
                        <div className="contact-container contact-hero-content">
                            <h1>Bize Ulaşın</h1>
                            <p>
                                Sorularınız mı var? İş birliği fırsatları veya genel sorularınız için ekibimizle iletişime geçin. Size yardımcı olmaktan mutluluk duyarız.
                            </p>
                        </div>
                    </div>

                    {/* Content Split Layout */}
                    <section className="contact-section">
                        <div className="contact-container">
                            <div className="contact-grid">

                                {/* Left Side: Contact Form */}
                                <div className="contact-form-card">
                                    <h2>Mesaj Gönderin</h2>

                                    <form onSubmit={handleSubmit}>
                                        <div className="contact-form-grid">
                                            <div className="contact-form-group">
                                                <label htmlFor="name">Ad Soyad</label>
                                                <input
                                                    id="name"
                                                    name="name"
                                                    placeholder="Adınız ve Soyadınız"
                                                    type="text"
                                                    required
                                                    className="contact-form-control"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                />
                                            </div>
                                            <div className="contact-form-group">
                                                <label htmlFor="email">E-posta</label>
                                                <input
                                                    id="email"
                                                    name="email"
                                                    placeholder="ornek@sirket.com"
                                                    type="email"
                                                    required
                                                    className="contact-form-control"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                />
                                            </div>
                                            <div className="contact-form-group full-width">
                                                <label htmlFor="subject">Konu</label>
                                                <input
                                                    id="subject"
                                                    name="subject"
                                                    placeholder="Mesajınızın konusu"
                                                    type="text"
                                                    className="contact-form-control"
                                                    value={formData.subject}
                                                    onChange={handleChange}
                                                />
                                            </div>
                                            <div className="contact-form-group full-width">
                                                <label htmlFor="message">Mesaj</label>
                                                <textarea
                                                    id="message"
                                                    name="message"
                                                    placeholder="Bize iletmek istediğiniz mesaj..."
                                                    rows="4"
                                                    required
                                                    className="contact-form-control textarea"
                                                    value={formData.message}
                                                    onChange={handleChange}
                                                ></textarea>
                                            </div>
                                        </div>

                                        {status === 'success' && (
                                            <div className="contact-alert contact-alert-success">
                                                <span className="material-symbols-outlined">check_circle</span>
                                                Mesajınız başarıyla gönderildi. En kısa sürede size dönüş yapacağız.
                                            </div>
                                        )}
                                        {status === 'error' && (
                                            <div className="contact-alert contact-alert-error">
                                                <span className="material-symbols-outlined">error</span>
                                                Mesaj gönderilirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.
                                            </div>
                                        )}

                                        <div className="contact-form-actions">
                                            <button
                                                type="submit"
                                                className="contact-submit-btn"
                                                disabled={status === 'loading'}
                                            >
                                                <span>{status === 'loading' ? 'Gönderiliyor...' : 'Gönder'}</span>
                                                <span className="material-symbols-outlined">send</span>
                                            </button>
                                        </div>
                                    </form>
                                </div>

                                {/* Right Side: Contact Info */}
                                <div className="contact-info-wrapper">
                                    <div className="contact-info-header">
                                        <h2>İletişim Bilgileri</h2>
                                        <p>
                                            Genel merkezimiz İstanbul'un kalbinde yer almaktadır. Çalışma saatlerimiz içerisinde bizi ziyaret edebilir veya aşağıdaki iletişim kanallarından bize ulaşabilirsiniz.
                                        </p>
                                    </div>

                                    <div className="contact-info-cards">
                                        {/* Address Card */}
                                        <div className="contact-info-card">
                                            <div className="contact-icon-box">
                                                <span className="material-symbols-outlined">location_on</span>
                                            </div>
                                            <div className="contact-info-text">
                                                <h3>Adres</h3>
                                                <p>
                                                    Levent Mah. Büyükdere Cad. No:123<br />
                                                    Kanyon Ofis Bloğu Kat: 15<br />
                                                    34394 Şişli / İstanbul
                                                </p>
                                            </div>
                                        </div>

                                        {/* Phone Card */}
                                        <div className="contact-info-card">
                                            <div className="contact-icon-box">
                                                <span className="material-symbols-outlined">call</span>
                                            </div>
                                            <div className="contact-info-text">
                                                <h3>Telefon</h3>
                                                <p>Hafta içi 09:00 - 18:00</p>
                                                <a href="tel:+902121234567">+90 (212) 123 45 67</a>
                                            </div>
                                        </div>

                                        {/* Email Card */}
                                        <div className="contact-info-card">
                                            <div className="contact-icon-box">
                                                <span className="material-symbols-outlined">mail</span>
                                            </div>
                                            <div className="contact-info-text">
                                                <h3>E-posta</h3>
                                                <p>Tüm sorularınız için</p>
                                                <a href="mailto:destek@tedport.com">destek@tedport.com</a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Map Section */}
                            <div className="contact-map-container">
                                <iframe
                                    title="Office Location Map"
                                    src="https://maps.google.com/maps?q=Kanyon%20Al%C4%B1%C5%9Fveri%C5%9F%20Merkezi,%20B%C3%BCy%C3%BCkdere%20Cd.%20No:185,%2034394%20%C5%9Ei%C5%9Fli/%C4%B0stanbul&t=&z=15&ie=UTF8&iwloc=&output=embed"
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    allowFullScreen
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                ></iframe>
                            </div>
                        </div>
                    </section>
                </main>

                {/* Footer */}
                <footer className="contact-footer">
                    <div className="contact-container">
                        <div className="contact-footer-grid">
                            <div className="contact-footer-brand">
                                {/* FOOTER LOGO BURAYA EKLENDİ */}
                                <div className="contact-footer-logo">
                                    <img src="/tedport-logo.jpg" alt="Tedport Logo" />
                                </div>
                                <p>Güvenilir tedarikçilerle işinizi büyütün. Türkiye'nin en kapsamlı B2B pazar yeri.</p>
                                <div className="contact-socials">
                                    <a href="#"></a><a href="#"></a><a href="#"></a>
                                </div>
                            </div>

                            <div className="contact-footer-links">
                                <h4>Hızlı Linkler</h4>
                                <ul>
                                    <li><a href="/">Ana Sayfa</a></li>
                                    <li><a href="/kategoriler">Kategoriler</a></li>
                                    <li><a href="/yeni-eklenenler">Yeni Eklenenler</a></li>
                                    <li><a href="/blog">Blog</a></li>
                                </ul>
                            </div>

                            <div className="contact-footer-links">
                                <h4>Destek</h4>
                                <ul>
                                    <li><a href="/yardim">Yardım Merkezi</a></li>
                                    <li><a href="/gizlilik">Gizlilik Politikası</a></li>
                                    <li><a href="/kullanim">Kullanım Koşulları</a></li>
                                    <li><a href="/sss">SSS</a></li>
                                </ul>
                            </div>

                            <div className="contact-footer-links">
                                <h4>Sosyal Medya</h4>
                                <div className="contact-socials">
                                    <a href="#">
                                        <svg fill="currentColor" viewBox="0 0 24 24">
                                            <path clipRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" fillRule="evenodd"></path>
                                        </svg>
                                    </a>
                                    <a href="#">
                                        <svg fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                                        </svg>
                                    </a>
                                    <a href="#">
                                        <svg fill="currentColor" viewBox="0 0 24 24">
                                            <path clipRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" fillRule="evenodd"></path>
                                        </svg>
                                    </a>
                                </div>
                            </div>
                        </div>

                        <div className="contact-footer-bottom">
                            <p>© 2026 Tedport. Tüm hakları saklıdır.</p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
};

export default Contact;