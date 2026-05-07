// Enes Doğanay | 6 Mayıs 2026: ProfileInfoTab — profil bilgileri form kartı
import React from 'react';
import ProfileField from './ProfileField';
import './ProfileInfoTab.css';
import './ProfileInfoTab.dark.css';

const ProfileInfoTab = ({
  profile, user, cities, uploading, fileInputRef, fieldFeedback, pendingEmail,
  handleAvatarUpload, handleUpdateField, handleCancelEmailChange, handleResendEmailChange, setFieldFeedback,
}) => (
  <div className="card profile-card-v2">
    <div className="profile-hero-banner">
      <div className="profile-hero-shape profile-hero-shape--1" />
      <div className="profile-hero-shape profile-hero-shape--2" />
      <div className="profile-hero-shape profile-hero-shape--3" />
    </div>

    <div className="profile-avatar-center">
      {profile?.avatar ? (
        <div className="avatar-v2" style={{ backgroundImage: `url(${profile.avatar})` }} />
      ) : (
        <div className="avatar-v2 avatar-v2--no-photo">
          <span className="material-symbols-outlined">person</span>
        </div>
      )}
      <button className="avatar-camera-btn" onClick={() => fileInputRef.current.click()} disabled={uploading} data-tooltip="Fotoğrafı Değiştir">
        <span className="material-symbols-outlined">{uploading ? 'hourglass_empty' : 'photo_camera'}</span>
      </button>
      <input type="file" accept="image/*" ref={fileInputRef} onChange={handleAvatarUpload} className="sr-only" />
    </div>

    <div className="profile-identity">
      <h2 className="profile-display-name">
        {`${profile?.first_name || ''}${profile?.last_name ? ' ' + profile.last_name : ''}`.trim() || 'İsimsiz Kullanıcı'}
      </h2>
      <p className="profile-display-company">
        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>business</span>
        {profile?.company_name || 'Şirket yok'}
      </p>
      <div className="profile-badge-verified">
        <span className="material-symbols-outlined">verified</span>
        Hesabınız Onaylı
      </div>
    </div>

    <div className="profile-divider" />

    {fieldFeedback && (
      <div className={`field-feedback field-feedback--${fieldFeedback.type}`}>
        <span className="material-symbols-outlined">
          {fieldFeedback.type === 'error' ? 'error' : fieldFeedback.type === 'success' ? 'check_circle' : 'mail'}
        </span>
        <span>{fieldFeedback.message}</span>
        <button type="button" className="field-feedback-close" onClick={() => setFieldFeedback(null)}>
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>
    )}

    <div className="profile-fields-grid">
      <ProfileField label="Ad" value={profile?.first_name || ''} dbField="first_name" onSave={handleUpdateField} icon="person" />
      <ProfileField label="Soyad" value={profile?.last_name || ''} dbField="last_name" onSave={handleUpdateField} icon="badge" />
      <ProfileField label="Şirket Adı" value={profile?.company_name || ''} dbField="company_name" onSave={handleUpdateField} icon="apartment" />
      <ProfileField
        label="E-posta Adresi" value={user?.email || ''} dbField="email" isEmail extra="Doğrulanmış"
        onSave={handleUpdateField} editable icon="mail" pendingEmail={pendingEmail}
        onCancelPendingEmail={handleCancelEmailChange} onResendEmail={handleResendEmailChange}
      />
      <ProfileField label="Telefon Numarası" value={profile?.phone || '-'} dbField="phone" onSave={handleUpdateField} icon="phone" />
      <ProfileField label="Konum" value={profile?.location || '-'} dbField="location" onSave={handleUpdateField} isLocation cities={cities} icon="location_on" />
    </div>
  </div>
);

export default ProfileInfoTab;
