// Enes Doğanay | 6 Mayıs 2026: Local toast bildirimi — alert() yerine
import React from 'react';

const FdToast = ({ toast, onClose }) => {
    if (!toast) return null;
    return (
        // Enes Doğanay | 8 Mayıs 2026: role=alert — screen reader bildirimi
        <div role="alert" style={{
            position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)',
            zIndex: 99999, display: 'flex', alignItems: 'center', gap: '10px',
            padding: '12px 18px', borderRadius: '12px', maxWidth: '380px', width: 'max-content',
            boxShadow: '0 8px 28px rgba(15,23,42,0.18)',
            background: toast.type === 'error' ? '#fef2f2' : toast.type === 'warning' ? '#fffbeb' : '#eff6ff',
            border: `1.5px solid ${toast.type === 'error' ? '#fca5a5' : toast.type === 'warning' ? '#fcd34d' : '#bfdbfe'}`,
            color: toast.type === 'error' ? '#991b1b' : toast.type === 'warning' ? '#92400e' : '#1e40af',
            fontSize: '0.85rem', fontWeight: 600, fontFamily: 'inherit',
            animation: 'fdToastIn 0.22s ease'
        }}>
            <style>{`@keyframes fdToastIn { from { opacity:0; transform:translate(-50%,10px);} to { opacity:1; transform:translate(-50%,0);} }`}</style>
            <span className="material-symbols-outlined" style={{ fontSize: '19px', flexShrink: 0 }}>
                {toast.type === 'error' ? 'error' : toast.type === 'warning' ? 'warning' : 'info'}
            </span>
            {toast.message}
            <button onClick={onClose} aria-label="Kapat" style={{ marginLeft: '4px', background: 'none', border: 'none', cursor: 'pointer', padding: '2px', opacity: 0.55, lineHeight: 1 }}>
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>close</span>
            </button>
        </div>
    );
};

export default FdToast;
