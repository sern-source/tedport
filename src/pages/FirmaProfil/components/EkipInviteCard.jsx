// Enes Doğanay | 6 Mayıs 2026: Ekip davet formu kartı
// Enes Doğanay | 8 Mayıs 2026: Compact + custom dropdown (native select kaldırıldı)
import React, { useState, useRef, useEffect } from 'react';

const ROLE_OPTIONS = [
  { value: 'admin', label: 'Yönetici', sub: 'Admin' },
  { value: 'member', label: 'Üye', sub: 'Member' },
];

/* Enes Doğanay | 8 Mayıs 2026: Yeni üye davet formu — compact + custom rol dropdown */
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
}) => {
  // Enes Doğanay | 8 Mayıs 2026: Rol dropdown state
  const [roleOpen, setRoleOpen] = useState(false);
  const roleRef = useRef(null);

  useEffect(() => {
    if (!roleOpen) return;
    const handler = (e) => { if (roleRef.current && !roleRef.current.contains(e.target)) setRoleOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [roleOpen]);

  const selectedRole = ROLE_OPTIONS.find(o => o.value === davetRole) || ROLE_OPTIONS[1];

  return (
    <div className="ekip-invite-card">
      <h3>
        <span className="material-symbols-outlined">person_add</span> Yeni Üye Davet Et
      </h3>
      <div className="ekip-invite-form">
        <div className="ekip-invite-row">
          {/* Enes Doğanay | 8 Mayıs 2026: 1 — E-posta */}
          <input
            type="email"
            className="ekip-input"
            placeholder="E-posta adresi"
            value={davetEmail}
            onChange={(e) => setDavetEmail(e.target.value)}
          />
          {/* Enes Doğanay | 8 Mayıs 2026: 2 — Unvan */}
          <input
            type="text"
            className="ekip-input ekip-input--title"
            placeholder="Unvan (opsiyonel)"
            value={davetTitle}
            onChange={(e) => setDavetTitle(e.target.value)}
          />
          {/* Enes Doğanay | 8 Mayıs 2026: 3 — Rol custom dropdown */}
          <div className="ekip-role-wrap" ref={roleRef}>
            <button
              type="button"
              className={`ekip-role-trigger${roleOpen ? ' ekip-role-trigger--open' : ''}`}
              onClick={() => setRoleOpen(p => !p)}
            >
              <span className="ekip-role-trigger-label">{selectedRole.label}</span>
              <span className="material-symbols-outlined ekip-role-chevron">expand_more</span>
            </button>
            {roleOpen && (
              <div className="ekip-role-menu">
                {ROLE_OPTIONS.map(opt => (
                  <div
                    key={opt.value}
                    className={`ekip-role-option${davetRole === opt.value ? ' ekip-role-option--active' : ''}`}
                    onClick={() => { setDavetRole(opt.value); setRoleOpen(false); }}
                  >
                    <span>{opt.label}</span>
                    <span className="ekip-role-option-sub">{opt.sub}</span>
                    {davetRole === opt.value && <span className="material-symbols-outlined ekip-role-check">check</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Enes Doğanay | 8 Mayıs 2026: 4 — Davet butonu */}
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
};

export default EkipInviteCard;

