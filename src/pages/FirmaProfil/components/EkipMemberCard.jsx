// Enes Doğanay | 6 Mayıs 2026: Ekip üyesi kartı — bilgi, aksiyonlar, izin ızgarası
import React, { useState, useRef, useEffect } from 'react';
import EkipPermissionsGrid from './EkipPermissionsGrid';

// Enes Doğanay | 9 Mayıs 2026: Rol seçenekleri
const ROLE_OPTIONS = [
  { value: 'admin', label: 'Yönetici', sub: 'Admin' },
  { value: 'member', label: 'Üye', sub: 'Member' },
];

/* Enes Doğanay | 6 Mayıs 2026: Ekip üyesi kartı */
const EkipMemberCard = ({
  m,
  isMe,
  isOwner,
  editingMember,
  setEditingMember,
  confirmRemoveMember,
  setConfirmRemoveMember,
  handleVisibilityToggle,
  handleEmailVisibilityToggle,
  handleRolGuncelle,
  handleUyeCikar,
  handlePermissionsUpdate,
}) => {
  const fullName = [m.first_name, m.last_name].filter(Boolean).join(' ') || 'İsimsiz';
  const initials = ((m.first_name?.[0] || '') + (m.last_name?.[0] || '')).toUpperCase() || '?';

  // Enes Doğanay | 9 Mayıs 2026: Rol dropdown state
  const [memberRoleOpen, setMemberRoleOpen] = useState(false);
  const memberRoleRef = useRef(null);

  useEffect(() => {
    if (!memberRoleOpen) return;
    const handler = (e) => { if (memberRoleRef.current && !memberRoleRef.current.contains(e.target)) setMemberRoleOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [memberRoleOpen]);

  const selectedEditRole = ROLE_OPTIONS.find(o => o.value === editingMember?.role) || ROLE_OPTIONS[1];

  return (
    <div
      className={`ekip-card${isMe ? ' ekip-card--me' : ''}${!m.is_public ? ' ekip-card--hidden' : ''}`}
    >
      <div className="ekip-card__info">
        <div className="ekip-card__avatar">{initials}</div>
        <div>
          <strong>
            {fullName}
            {isMe && <span className="ekip-me-chip">Siz</span>}
          </strong>
          <span className="ekip-card__meta">
            <span className={`ekip-role-badge ekip-role-badge--${m.role}`}>
              {m.role === 'owner' ? 'Sahip' : m.role === 'admin' ? 'Yönetici' : 'Üye'}
            </span>
            {m.title && <span className="ekip-card__title-tag">{m.title}</span>}
            {!m.is_public && <span className="ekip-hidden-chip">Gizli</span>}
          </span>
          {/* Enes Doğanay | 9 Mayıs 2026: E-posta yönetim panelinde her zaman görünür */}
          {m.email && (
            <span className="ekip-card__email">
              <span className="material-symbols-outlined">mail</span>
              {m.email}
            </span>
          )}
        </div>
      </div>

      {!isOwner && (
        <div className="ekip-card__actions">
          <button
            className={`ekip-visibility-btn${m.is_public ? '' : ' ekip-visibility-btn--hidden'}`}
            onClick={() => handleVisibilityToggle(m.user_id, m.is_public)}
            data-tooltip={m.is_public ? 'Gizlemek için tıkla' : 'Göstermek için tıkla'}
            aria-label={m.is_public ? 'Gizlemek için tıkla' : 'Göstermek için tıkla'}
          >
            <span className="material-symbols-outlined">
              {m.is_public ? 'visibility' : 'visibility_off'}
            </span>
          </button>
          {/* Enes Doğanay | 9 Mayıs 2026: E-posta halka açık toggle */}
          <button
            className={`ekip-email-btn${m.show_email ? ' ekip-email-btn--on' : ''}`}
            onClick={() => handleEmailVisibilityToggle(m.user_id, m.show_email)}
            data-tooltip={m.show_email ? 'E-posta herkese açık — gizlemek için tıkla' : 'E-posta gizli — açmak için tıkla'}
            aria-label={m.show_email ? 'E-postayı gizle' : 'E-postayı göster'}
          >
            <span className="material-symbols-outlined">
              {m.show_email ? 'mail' : 'mail_off'}
            </span>
          </button>

          {editingMember?.user_id === m.user_id ? (
            <div className="ekip-edit-inline">
              <input
                className="ekip-input ekip-input--sm"
                value={editingMember.title}
                onChange={(e) => setEditingMember((p) => ({ ...p, title: e.target.value }))}
                placeholder="Unvan"
              />
              {/* Enes Doğanay | 9 Mayıs 2026: Custom rol dropdown */}
              <div className="ekip-role-wrap" ref={memberRoleRef}>
                <button
                  type="button"
                  className={`ekip-role-trigger${memberRoleOpen ? ' ekip-role-trigger--open' : ''}`}
                  onClick={() => setMemberRoleOpen(p => !p)}
                >
                  <span className="ekip-role-trigger-label">{selectedEditRole.label}</span>
                  <span className="material-symbols-outlined ekip-role-chevron">expand_more</span>
                </button>
                {memberRoleOpen && (
                  <div className="ekip-role-menu">
                    {ROLE_OPTIONS.map(opt => (
                      <div
                        key={opt.value}
                        className={`ekip-role-option${editingMember.role === opt.value ? ' ekip-role-option--active' : ''}`}
                        onClick={() => { setEditingMember(p => ({ ...p, role: opt.value })); setMemberRoleOpen(false); }}
                      >
                        <span>{opt.label}</span>
                        <span className="ekip-role-option-sub">{opt.sub}</span>
                        {editingMember.role === opt.value && <span className="material-symbols-outlined ekip-role-check">check</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button
                className="ekip-save-btn"
                onClick={() => handleRolGuncelle(m.user_id, editingMember.role, editingMember.title)}
              >
                <span className="material-symbols-outlined">check</span>
              </button>
              <button className="ekip-cancel-btn" onClick={() => setEditingMember(null)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
          ) : (
            <>
              <button
                className="ekip-edit-btn"
                onClick={() => setEditingMember({ user_id: m.user_id, role: m.role, title: m.title || '' })}
                data-tooltip="Düzenle"
                aria-label="Düzenle"
              >
                <span className="material-symbols-outlined">edit</span>
              </button>
              {confirmRemoveMember?.user_id === m.user_id ? (
                <span className="ekip-confirm-remove">
                  <span>Çıkarılsın mı?</span>
                  <button className="ekip-confirm-yes" onClick={() => handleUyeCikar(m.user_id)}>
                    Evet
                  </button>
                  <button className="ekip-confirm-no" onClick={() => setConfirmRemoveMember(null)}>
                    Hayır
                  </button>
                </span>
              ) : (
                <button
                  className="ekip-remove-btn"
                  onClick={() => setConfirmRemoveMember({ user_id: m.user_id, name: fullName })}
                  data-tooltip="Ekipten çıkar"
                  aria-label="Ekipten çıkar"
                >
                  <span className="material-symbols-outlined">person_remove</span>
                </button>
              )}
            </>
          )}
        </div>
      )}

      {/* Enes Doğanay | 6 Mayıs 2026: Sayfa bazlı yetki matrisi */}
      {!isOwner && (
        <EkipPermissionsGrid
          userId={m.user_id}
          pagePermissions={m.page_permissions}
          handlePermissionsUpdate={handlePermissionsUpdate}
        />
      )}
    </div>
  );
};

export default EkipMemberCard;
