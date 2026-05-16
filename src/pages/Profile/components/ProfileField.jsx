// Enes Doğanay | 6 Mayıs 2026: ProfileField — düzenlenebilir profil alanı bileşeni
import React, { useState, useEffect } from 'react';
import CitySelect from '../../../components/CitySelect';
import './ProfileField.css';

const ProfileField = ({
  label, value, extra, dbField, isEmail = false, isLocation = false,
  onSave, editable = true, icon,
  pendingEmail, onCancelPendingEmail, onResendEmail,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value || '');
  const [isSaving, setIsSaving] = useState(false);
  // Enes Doğanay | 16 Mayıs 2026: Alan bazlı satır içi hata mesajı
  const [saveError, setSaveError] = useState('');

  useEffect(() => { setTempValue(value || ''); }, [value]);

  const handleSaveClick = async () => {
    if (tempValue !== value) {
      if (isEmail) { setIsEditing(false); onSave(dbField, tempValue, isEmail); return; }
      setIsSaving(true);
      setSaveError('');
      try {
        await onSave(dbField, tempValue, isEmail);
        setIsEditing(false);
      } catch (err) {
        setSaveError(err?.message || 'Kaydedilemedi.');
      } finally { setIsSaving(false); }
      return;
    }
    setIsEditing(false);
  };

  const handleCancelClick = () => { setTempValue(value || ''); setIsEditing(false); setSaveError(''); };
  const handleKeyDown = (e) => { if (e.key === 'Enter' && !isSaving) handleSaveClick(); };

  return (
    <div className="field field-card-v2">
      {icon && <div className="field-icon-wrap"><span className="material-symbols-outlined">{icon}</span></div>}
      <div className="field-content">
        <label>{label}</label>
        {isEditing ? (
          <>
            {isLocation ? (
              <div className="field-location-edit">
                <CitySelect value={tempValue === '-' ? '' : tempValue} onChange={setTempValue} />
                <div className="field-location-actions">
                  <button className="field-btn-save" onClick={handleSaveClick}>Kaydet</button>
                  <button className="field-btn-cancel" onClick={handleCancelClick}>İptal</button>
                </div>
              </div>
            ) : (
              <>
                <div className="field-edit-row">
                  <input className="field-input" type="text" value={tempValue} onChange={e => { setTempValue(e.target.value); setSaveError(''); }} onKeyDown={handleKeyDown} autoFocus disabled={isSaving} />
                  <button className="field-btn-save" onClick={handleSaveClick} disabled={isSaving}>
                    {isSaving ? <span className="field-btn-spinner" /> : 'Kaydet'}
                  </button>
                  <button className="field-btn-cancel" onClick={handleCancelClick} disabled={isSaving}>İptal</button>
                </div>
                {saveError && <span className="field-save-err"><span className="material-symbols-outlined">error</span>{saveError}</span>}
              </>
            )}
          </>
        ) : (
          <div className="field-value-display">
            <p>{value}</p>
            {extra && !pendingEmail && <span className="field-extra-badge">{extra}</span>}
            {pendingEmail && (
              <div className="field-pending-email">
                <span className="material-symbols-outlined">schedule</span>
                Onay bekleniyor: <strong>{pendingEmail}</strong>
                {onResendEmail && (
                  <button type="button" className="field-pending-resend" onClick={onResendEmail} data-tooltip="Onay mailini tekrar gönder">
                    <span className="material-symbols-outlined">send</span>
                  </button>
                )}
                {onCancelPendingEmail && (
                  <button type="button" className="field-pending-cancel" onClick={onCancelPendingEmail} data-tooltip="Talebi iptal et">
                    <span className="material-symbols-outlined">close</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      {editable && !isEditing && !pendingEmail && (
        <button className="field-edit-btn" onClick={() => setIsEditing(true)}>Düzenle</button>
      )}
    </div>
  );
};

export default ProfileField;
