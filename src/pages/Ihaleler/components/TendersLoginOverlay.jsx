// Enes Doğanay | 6 Mayıs 2026: Giriş yapmayan kullanıcıya bulanık içerik + CTA
import React from 'react';

const TendersLoginOverlay = ({ onLoginRedirect, onRegisterRedirect }) => (
    <div className="tenders-blur-overlay">
        <div className="tenders-blur-cta">
            <span className="material-symbols-outlined">lock</span>
            <h3>İhaleleri görüntülemek için giriş yapın</h3>
            <p>İhale detaylarını görmek ve teklif vermek için hesabınıza giriş yapın.</p>
            <button type="button" className="tenders-blur-login-btn" onClick={onLoginRedirect}>Giriş Yap</button>
            <span className="tenders-blur-register">Hesabınız yok mu? <button type="button" onClick={onRegisterRedirect}>Kayıt Ol</button></span>
        </div>
    </div>
);

export default TendersLoginOverlay;
