// Enes Doğanay | 6 Mayıs 2026: Ekip üyesi kartı — bilgi, aksiyonlar, izin ızgarası
import React from 'react';
import EkipPermissionsGrid from './EkipPermissionsGrid';

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
  handleRolGuncelle,
  handleUyeCikar,
  handlePermissionsUpdate,
}) => {
  const fullName = [m.first_name, m.last_name].filter(Boolean).join(' ') || 'İsimsiz';
  const initials = ((m.first_name?.[0] || '') + (m.last_name?.[0] || '')).toUpperCase() || '?';

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

          {editingMember?.user_id === m.user_id ? (
            <div className="ekip-edit-inline">
              <input
                className="ekip-input ekip-input--sm"
                value={editingMember.title}
                onChange={(e) => setEditingMember((p) => ({ ...p, title: e.target.value }))}
                placeholder="Unvan"
              />
              <select
                className="ekip-select ekip-select--sm"
                value={editingMember.role}
                onChange={(e) => setEditingMember((p) => ({ ...p, role: e.target.value }))}
              >
                <option value="admin">Yönetici</option>
                <option value="member">Üye</option>
              </select>
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
