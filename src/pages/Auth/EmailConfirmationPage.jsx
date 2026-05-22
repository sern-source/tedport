// Enes Doğanay | 6 Mayıs 2026: E-posta onay sayfası — useEmailConfirmation hook ile ayrıştırıldı
'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import SharedHeader from '../../components/SharedHeader';
import '../../components/SharedHeader.css';
import './EmailConfirmation.css';
import { useEmailConfirmation } from './hooks/useEmailConfirmation';

export default function EmailConfirmationPage() {
  const router = useRouter();
  const { displayEmail, resendStatus, resendStatusType, handleResend } = useEmailConfirmation();

  return (
    <div className="ec-wrapper">
      <SharedHeader />

      <main className="ec-main">
        <div className="ec-card">
          <div className="ec-illustration">
            <div className="ec-glow"></div>
            <div className="ec-circle">
              <span className="material-symbols-outlined">mark_email_read</span>
            </div>
          </div>

          <h1 className="ec-title">E-posta Onayınız Gönderildi!</h1>
          <p className="ec-description">
            Lütfen <b>{displayEmail}</b> adresine gönderdiğimiz bağlantıya tıklayın.
            Bu adım, güvenli bir B2B ticaret ortamı sağlamak için gereklidir.
            Onayladıktan sonra sayfa sizi otomatik olarak yönlendirecektir.
          </p>

          <button className="ec-btn-primary" onClick={() => router.push('/login')}>
            <span>Giriş Sayfasına Git</span>
          </button>

          <div className="ec-secondary-section">
            <h2 className="ec-subtitle">E-postayı bulamadınız mı?</h2>
            <p className="ec-spam-note">Spam klasörünü kontrol etmeyi unutmayın.</p>
            <button className="ec-btn-text" onClick={handleResend}>
              Tekrar Gönder
            </button>
            {resendStatus && (
              <p className={`ec-status ec-status-${resendStatusType}`}>{resendStatus}</p>
            )}
          </div>
        </div>
      </main>

      <div className="ec-background-blobs">
        <div className="ec-blob-1"></div>
        <div className="ec-blob-2"></div>
      </div>
    </div>
  );
}
