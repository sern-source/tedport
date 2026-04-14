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
                                                {/* Enes Doğanay | 10 Nisan 2026: destek@ → info@ olarak güncellendi */}
                                                <a href="mailto:info@tedport.com">info@tedport.com</a>
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

                {/* Enes Doğanay | 14 Nisan 2026: Ortak footer bileşeni */}
                <SharedFooter />
            </div>
        </>
    );
};

export default Contact;