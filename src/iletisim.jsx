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
import SharedFooter from './SharedFooter';
import SEO from './SEO'; // Enes Doğanay | 16 Nisan 2026: SEO meta tag desteği
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
            <SEO title="İletişim" description="Tedport ile iletişime geçin. Sorularınız ve önerileriniz için bize ulaşın." path="/iletisim" />
            <SharedHeader
                navItems={[
                    { label: 'Anasayfa', href: '/' },
                    { label: 'Firmalar', href: '/firmalar' },
                    { label: 'İhaleler', href: '/ihaleler' },
                    { label: 'Hakkımızda', href: '/hakkimizda' }
                ]}
            />

            <div className="contact-page-wrapper">

                <main className="contact-main">
                    {/* Hero Section */}
                    <div className="contact-hero">
                        <div className="contact-hero-bg">
                            <div className="contact-hero-overlay"></div>
                            <img alt="Modern building" src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1920" loading="lazy" />
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
                                            Sorularınız veya önerileriniz için bize e-posta aracılığıyla ulaşabilirsiniz. En kısa sürede geri dönüş yapacağız.
                                        </p>
                                    </div>

                                    <div className="contact-info-cards">
                                        {/* Email Card */}
                                        <div className="contact-info-card">
                                            <div className="contact-icon-box">
                                                <span className="material-symbols-outlined">mail</span>
                                            </div>
                                            <div className="contact-info-text">
                                                <h3>E-posta</h3>
                                                <p>Tüm sorularınız için</p>
                                                {/* Enes Doğanay | 10 Nisan 2026: destek@ → info@ olarak güncellendi */}
                                                <a href="mailto:info@tedport.com">info@tedport.com</a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>


                        </div>
                    </section>
                </main>

                {/* Enes Doğanay | 14 Nisan 2026: Ortak footer bileşeni */}
                <SharedFooter />
            </div>
        </>
    );
};

export default Contact;