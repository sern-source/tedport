// Enes Doğanay | 6 Mayıs 2026: Ekip davet formu kartı
import React from 'react';

/* Enes Doğanay | 6 Mayıs 2026: Yeni üye davet formu */
const EkipInviteCard = ({
  davetEmail,
  setDavetEmail,
  davetRole,
  setDavetRole,
  davetTitle,
  setDavetTitle,
  davetSending,
  davetError,
  davetSuccess,
  handleDavetGonder,
}) => (
  <div className="ekip-invite-card">
    <h3>
      <span className="material-symbols-outlined">person_add</span> Yeni Üye Davet Et
    </h3>
    <div className="ekip-invite-form">
      <div className="ekip-invite-row">
        <input
          type="email"
          className="ekip-input"
          placeholder="E-posta adresi"
          value={davetEmail}
          onChange={(e) => setDavetEmail(e.target.value)}
        />
        <input
          type="text"
          className="ekip-input ekip-input--title"
          placeholder="Unvan (opsiyonel)"
          value={davetTitle}
          onChange={(e) => setDavetTitle(e.target.value)}
        />
        {/* Enes Doğanay | 6 Mayıs 2026: Native select korundu — mevcut davranış */}
        <select
          className="ekip-select"
          value={davetRole}
          onChange={(e) => setDavetRole(e.target.value)}
        >
          <option value="admin">Yönetici (Admin)</option>
          <option value="member">Üye (Member)</option>
        </select>
        <button
          className="ekip-invite-btn"
          onClick={handleDavetGonder}
          disabled={davetSending}
        >
          {davetSending ? 'Gönderiliyor…' : 'Davet Gönder'}
        </button>
      </div>
      {davetError && (
        <p className="ekip-msg ekip-msg--error">
          <span className="material-symbols-outlined">error</span>
          {davetError}
        </p>
      )}
      {davetSuccess && (
        <p className="ekip-msg ekip-msg--success">
          <span className="material-symbols-outlined">check_circle</span>
          Davet başarıyla gönderildi!
        </p>
      )}
    </div>
  </div>
);

export default EkipInviteCard;
