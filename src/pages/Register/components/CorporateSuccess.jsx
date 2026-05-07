// Enes Doğanay | 6 Mayıs 2026: Kurumsal başvuru başarı durumu
import React from 'react';
import { Link } from 'react-router-dom';
import './CorporateSuccess.css';

const CorporateSuccess = ({ application, onNewApplication }) => (
    <section className="corporate-success-state">
        <div className="corporate-success-badge">
            <span className="material-symbols-outlined">verified</span>
        </div>
        <h2>Başvurunuz İncelemeye Alındı</h2>
        <p>
            {application?.company_name} için bıraktığınız kurumsal kayıt talebi admin paneline düştü.
            En geç 24 saat içinde başvurunuzun sonucunu e-posta ile paylaşacağız.
        </p>
        <div className="corporate-success-steps">
            <div className="corporate-success-step">
                <strong>1.</strong>
                <span>Firma bilgileri ve sahiplik doğrulaması incelenir.</span>
            </div>
            <div className="corporate-success-step">
                <strong>2.</strong>
                <span>Uygun bulunursa kurumsal hesabınız oluşturulur.</span>
            </div>
            <div className="corporate-success-step">
                <strong>3.</strong>
                <span>Mail içindeki bağlantıdan şifrenizi belirleyip giriş yaparsınız.</span>
            </div>
        </div>
        <div className="corporate-success-actions">
            <button type="button" className="register-btn-primary register-btn-secondary-soft" onClick={onNewApplication}>
                Yeni Başvuru Oluştur
            </button>
            <Link to="/login?type=corporate" className="register-btn-primary register-btn-submit-link">
                Kurumsal Girişe Git
            </Link>
        </div>
    </section>
);

export default CorporateSuccess;
