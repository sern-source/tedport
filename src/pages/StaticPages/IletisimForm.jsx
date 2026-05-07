// Enes Doğanay | 6 Mayıs 2026: İletişim formu — ad, e-posta, konu, mesaj alanları
import React from 'react';

const IletisimForm = ({ formData, status, handleChange, handleSubmit }) => (
    <div className="contact-form-card">
        <h2>Mesaj Gönderin</h2>
        <form onSubmit={handleSubmit}>
            <div className="contact-form-grid">
                <div className="contact-form-group">
                    <label htmlFor="name">Ad Soyad</label>
                    <input id="name" name="name" placeholder="Adınız ve Soyadınız" type="text" required className="contact-form-control" value={formData.name} onChange={handleChange} />
                </div>
                <div className="contact-form-group">
                    <label htmlFor="email">E-posta</label>
                    <input id="email" name="email" placeholder="ornek@sirket.com" type="email" required className="contact-form-control" value={formData.email} onChange={handleChange} />
                </div>
                <div className="contact-form-group full-width">
                    <label htmlFor="subject">Konu</label>
                    <input id="subject" name="subject" placeholder="Mesajınızın konusu" type="text" className="contact-form-control" value={formData.subject} onChange={handleChange} />
                </div>
                <div className="contact-form-group full-width">
                    <label htmlFor="message">Mesaj</label>
                    <textarea id="message" name="message" placeholder="Bize iletmek istediğiniz mesaj..." rows="4" required className="contact-form-control textarea" value={formData.message} onChange={handleChange} />
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
                <button type="submit" className="contact-submit-btn" disabled={status === 'loading'}>
                    <span>{status === 'loading' ? 'Gönderiliyor...' : 'Gönder'}</span>
                    <span className="material-symbols-outlined">send</span>
                </button>
            </div>
        </form>
    </div>
);

export default IletisimForm;
