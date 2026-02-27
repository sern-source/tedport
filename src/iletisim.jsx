import React, { useState } from 'react';
import './iletisim.css';
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
            console.error('İletişim formu gönderilirken hata oluştu:', error);
            setStatus('error');
            setTimeout(() => setStatus('idle'), 5000);
        }
    };

    return (
        <div className="contact-page-wrapper">
            {/* Top Navigation Bar */}
            <header className="contact-header">
                <div className="contact-container contact-header-inner">
                    <div className="contact-header-left">
                        <a className="contact-logo" href="/">
                            <div className="contact-logo-icon">
                                <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M13.8261 30.5736C16.7203 29.8826 20.2244 29.4783 24 29.4783C27.7756 29.4783 31.2797 29.8826 34.1739 30.5736C36.9144 31.2278 39.9967 32.7669 41.3563 33.8352L24.8486 7.36089C24.4571 6.73303 23.5429 6.73303 23.1514 7.36089L6.64374 33.8352C8.00331 32.7669 11.0856 31.2278 13.8261 30.5736Z" fill="currentColor"></path>
                                    <path clipRule="evenodd" d="M39.998 35.764C39.9944 35.7463 39.9875 35.7155 39.9748 35.6706C39.9436 35.5601 39.8949 35.4259 39.8346 35.2825C39.8168 35.2403 39.7989 35.1993 39.7813 35.1602C38.5103 34.2887 35.9788 33.0607 33.7095 32.5189C30.9875 31.8691 27.6413 31.4783 24 31.4783C20.3587 31.4783 17.0125 31.8691 14.2905 32.5189C12.0012 33.0654 9.44505 34.3104 8.18538 35.1832C8.17384 35.2075 8.16216 35.233 8.15052 35.2592C8.09919 35.3751 8.05721 35.4886 8.02977 35.589C8.00356 35.6848 8.00039 35.7333 8.00004 35.7388C8.00004 35.739 8 35.7393 8.00004 35.7388C8.00004 35.7641 8.0104 36.0767 8.68485 36.6314C9.34546 37.1746 10.4222 37.7531 11.9291 38.2772C14.9242 39.319 19.1919 40 24 40C28.8081 40 33.0758 39.319 36.0709 38.2772C37.5778 37.7531 38.6545 37.1746 39.3151 36.6314C39.9006 36.1499 39.9857 35.8511 39.998 35.764ZM4.95178 32.7688L21.4543 6.30267C22.6288 4.4191 25.3712 4.41909 26.5457 6.30267L43.0534 32.777C43.0709 32.8052 43.0878 32.8338 43.104 32.8629L41.3563 33.8352C43.104 32.8629 43.1038 32.8626 43.104 32.8629L43.1051 32.865L43.1065 32.8675L43.1101 32.8739L43.1199 32.8918C43.1276 32.906 43.1377 32.9246 43.1497 32.9473C43.1738 32.9925 43.2062 33.0545 43.244 33.1299C43.319 33.2792 43.4196 33.489 43.5217 33.7317C43.6901 34.1321 44 34.9311 44 35.7391C44 37.4427 43.003 38.7775 41.8558 39.7209C40.6947 40.6757 39.1354 41.4464 37.385 42.0552C33.8654 43.2794 29.133 44 24 44C18.867 44 14.1346 43.2794 10.615 42.0552C8.86463 41.4464 7.30529 40.6757 6.14419 39.7209C4.99695 38.7775 3.99999 37.4427 3.99999 35.7391C3.99999 34.8725 4.29264 34.0922 4.49321 33.6393C4.60375 33.3898 4.71348 33.1804 4.79687 33.0311C4.83898 32.9556 4.87547 32.8935 4.9035 32.8471C4.91754 32.8238 4.92954 32.8043 4.93916 32.7889L4.94662 32.777L4.95178 32.7688ZM35.9868 29.004L24 9.77997L12.0131 29.004C12.4661 28.8609 12.9179 28.7342 13.3617 28.6282C16.4281 27.8961 20.0901 27.4783 24 27.4783C27.9099 27.4783 31.5719 27.8961 34.6383 28.6282C35.082 28.7342 35.5339 28.8609 35.9868 29.004Z" fillRule="evenodd"></path>
                                </svg>
                            </div>
                            <h2>Tedport</h2>
                        </a>
                    </div>
                    <div className="contact-header-right">
                        <nav className="contact-nav-links hidden-mobile">
                            <a href="/">Ana Sayfa</a>
                            <a href="/firmalar">Firmalar</a>
                            <a href="/hakkimizda">Hakkımızda</a>
                            <a href="/iletisim" className="active">İletişim</a>
                        </nav>
                        <button className="contact-btn-primary">Giriş Yap</button>
                    </div>
                </div>
            </header>

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

                                    {/* Durum Mesajları */}
                                    {status === 'success' && (
                                        <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: '#dcfce7', color: '#166534', borderRadius: '0.5rem', fontSize: '0.875rem' }}>
                                            Mesajınız başarıyla gönderildi. En kısa sürede size dönüş yapacağız.
                                        </div>
                                    )}
                                    {status === 'error' && (
                                        <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '0.5rem', fontSize: '0.875rem' }}>
                                            Mesaj gönderilirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.
                                        </div>
                                    )}

                                    <div className="contact-form-actions">
                                        <button
                                            type="submit"
                                            className="contact-submit-btn"
                                            disabled={status === 'loading'}
                                            style={{ opacity: status === 'loading' ? 0.7 : 1 }}
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
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3008.3564562207037!2d29.008453215415714!3d41.06118327929428!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14cab61386d48a85%3A0x6a0c5c3e4c49d32d!2sKanyon%20Al%C4%B1%C5%9Fveri%C5%9F%20Merkezi!5e0!3m2!1str!2str!4v1680000000000!5m2!1str!2str"
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
                            <div className="contact-logo">
                                <div className="contact-logo-icon">
                                    <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M13.8261 30.5736C16.7203 29.8826 20.2244 29.4783 24 29.4783C27.7756 29.4783 31.2797 29.8826 34.1739 30.5736C36.9144 31.2278 39.9967 32.7669 41.3563 33.8352L24.8486 7.36089C24.4571 6.73303 23.5429 6.73303 23.1514 7.36089L6.64374 33.8352C8.00331 32.7669 11.0856 31.2278 13.8261 30.5736Z" fill="currentColor"></path>
                                        <path clipRule="evenodd" d="M39.998 35.764C39.9944 35.7463 39.9875 35.7155 39.9748 35.6706C39.9436 35.5601 39.8949 35.4259 39.8346 35.2825C39.8168 35.2403 39.7989 35.1993 39.7813 35.1602C38.5103 34.2887 35.9788 33.0607 33.7095 32.5189C30.9875 31.8691 27.6413 31.4783 24 31.4783C20.3587 31.4783 17.0125 31.8691 14.2905 32.5189C12.0012 33.0654 9.44505 34.3104 8.18538 35.1832C8.17384 35.2075 8.16216 35.233 8.15052 35.2592C8.09919 35.3751 8.05721 35.4886 8.02977 35.589C8.00356 35.6848 8.00039 35.7333 8.00004 35.7388C8.00004 35.739 8 35.7393 8.00004 35.7388C8.00004 35.7641 8.0104 36.0767 8.68485 36.6314C9.34546 37.1746 10.4222 37.7531 11.9291 38.2772C14.9242 39.319 19.1919 40 24 40C28.8081 40 33.0758 39.319 36.0709 38.2772C37.5778 37.7531 38.6545 37.1746 39.3151 36.6314C39.9006 36.1499 39.9857 35.8511 39.998 35.764ZM4.95178 32.7688L21.4543 6.30267C22.6288 4.4191 25.3712 4.41909 26.5457 6.30267L43.0534 32.777C43.0709 32.8052 43.0878 32.8338 43.104 32.8629L41.3563 33.8352C43.104 32.8629 43.1038 32.8626 43.104 32.8629L43.1051 32.865L43.1065 32.8675L43.1101 32.8739L43.1199 32.8918C43.1276 32.906 43.1377 32.9246 43.1497 32.9473C43.1738 32.9925 43.2062 33.0545 43.244 33.1299C43.319 33.2792 43.4196 33.489 43.5217 33.7317C43.6901 34.1321 44 34.9311 44 35.7391C44 37.4427 43.003 38.7775 41.8558 39.7209C40.6947 40.6757 39.1354 41.4464 37.385 42.0552C33.8654 43.2794 29.133 44 24 44C18.867 44 14.1346 43.2794 10.615 42.0552C8.86463 41.4464 7.30529 40.6757 6.14419 39.7209C4.99695 38.7775 3.99999 37.4427 3.99999 35.7391C3.99999 34.8725 4.29264 34.0922 4.49321 33.6393C4.60375 33.3898 4.71348 33.1804 4.79687 33.0311C4.83898 32.9556 4.87547 32.8935 4.9035 32.8471C4.91754 32.8238 4.92954 32.8043 4.93916 32.7889L4.94662 32.777L4.95178 32.7688ZM35.9868 29.004L24 9.77997L12.0131 29.004C12.4661 28.8609 12.9179 28.7342 13.3617 28.6282C16.4281 27.8961 20.0901 27.4783 24 27.4783C27.9099 27.4783 31.5719 27.8961 34.6383 28.6282C35.082 28.7342 35.5339 28.8609 35.9868 29.004Z" fillRule="evenodd"></path>
                                    </svg>
                                </div>
                                <span>Tedport</span>
                            </div>
                            <p>Güvenilir tedarikçilerle işinizi büyütün. Türkiye'nin en kapsamlı B2B pazar yeri.</p>
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
    );
};

export default Contact;