// Enes Doğanay | 6 Mayıs 2026: Bekleyen davet listesi
import React from 'react';

/* Enes Doğanay | 6 Mayıs 2026: Bekleyen davetler bölümü */
const EkipPendingList = ({ bekleyenDavetler, handleDavetIptal }) => {
  if (bekleyenDavetler.length === 0) return null;
  return (
    <div className="ekip-section">
      <h3 className="ekip-section__title">
        <span className="material-symbols-outlined">schedule</span> Bekleyen Davetler
      </h3>
      <div className="ekip-list">
        {bekleyenDavetler.map((d) => (
          <div key={d.id} className="ekip-card ekip-card--pending">
            <div className="ekip-card__info">
              <span className="material-symbols-outlined ekip-card__avatar-icon">mail</span>
              <div>
                <strong>{d.invited_email}</strong>
                <span className="ekip-card__meta">
                  <span className={`ekip-role-badge ekip-role-badge--${d.role}`}>
                    {d.role === 'admin' ? 'Yönetici' : 'Üye'}
                  </span>
                  {d.title && <span className="ekip-card__title-tag">{d.title}</span>}
                  {' '}·{' '}
                  {new Date(d.expires_at) < new Date()
                    ? 'Süresi doldu'
                    // eslint-disable-next-line react-hooks/purity
                    : `${Math.ceil((new Date(d.expires_at) - Date.now()) / 86400000)} gün geçerli`}
                </span>
              </div>
            </div>
            <button
              className="ekip-remove-btn"
              onClick={() => handleDavetIptal(d.id)}
              data-tooltip="Daveti iptal et"
              aria-label="Daveti iptal et"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EkipPendingList;
