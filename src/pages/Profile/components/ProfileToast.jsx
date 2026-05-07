// Enes Doğanay | 6 Mayıs 2026: ProfileToast — inline stil toast bileşeni
import React from 'react';

const ProfileToast = ({ toast, onClose }) => {
  if (!toast) return null;
  return (
    <div style={{
      position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)',
      zIndex: 99999, display: 'flex', alignItems: 'center', gap: '10px',
      padding: '12px 18px', borderRadius: '12px', maxWidth: '380px', width: 'max-content',
      boxShadow: '0 8px 28px rgba(15,23,42,0.18)',
      background: '#fef2f2', border: '1.5px solid #fca5a5', color: '#991b1b',
      fontSize: '0.85rem', fontWeight: 600, fontFamily: 'inherit',
      animation: 'prToastIn 0.22s ease',
    }}>
      <style>{`@keyframes prToastIn { from { opacity:0; transform:translate(-50%,10px);} to { opacity:1; transform:translate(-50%,0);} }`}</style>
      <span className="material-symbols-outlined" style={{ fontSize: '19px', flexShrink: 0 }}>error</span>
      {toast.message}
      <button onClick={onClose} style={{ marginLeft: '4px', background: 'none', border: 'none', cursor: 'pointer', padding: '2px', opacity: 0.55, lineHeight: 1 }}>
        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>close</span>
      </button>
    </div>
  );
};

export default ProfileToast;
