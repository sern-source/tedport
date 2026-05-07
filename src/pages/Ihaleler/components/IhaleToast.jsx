// Enes Doğanay | 5 Mayıs 2026: Yerel toast bildirimi — alert() yerine kullanılır
import React from 'react';

// Enes Doğanay | 5 Mayıs 2026: Yalnızca UI — toast state props ile gelir
const IhaleToast = ({ ihToast, onClose }) => {
    if (!ihToast) return null;

    return (
        <div style={{
            position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)',
            zIndex: 99999, display: 'flex', alignItems: 'center', gap: '10px',
            padding: '12px 18px', borderRadius: '12px', maxWidth: '380px', width: 'max-content',
            boxShadow: '0 8px 28px rgba(15,23,42,0.18)',
            background: ihToast.type === 'error' ? '#fef2f2' : '#eff6ff',
            border: `1.5px solid ${ihToast.type === 'error' ? '#fca5a5' : '#bfdbfe'}`,
            color: ihToast.type === 'error' ? '#991b1b' : '#1e40af',
            fontSize: '0.85rem', fontWeight: 600, fontFamily: 'inherit',
            animation: 'ihToastIn 0.22s ease'
        }}>
            <style>{`@keyframes ihToastIn { from { opacity:0; transform:translate(-50%,10px);} to { opacity:1; transform:translate(-50%,0);} }`}</style>
            <span className="material-symbols-outlined" style={{ fontSize: '19px', flexShrink: 0 }}>
                {ihToast.type === 'error' ? 'error' : 'info'}
            </span>
            {ihToast.message}
            <button onClick={onClose} style={{ marginLeft: '4px', background: 'none', border: 'none', cursor: 'pointer', padding: '2px', opacity: 0.55, lineHeight: 1 }}>
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>close</span>
            </button>
        </div>
    );
};

export default IhaleToast;
