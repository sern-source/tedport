// Enes Doğanay | 6 Mayıs 2026: Ekip üyeleri modal bileşeni
import React from 'react';
import './EkipModal.css';

const EkipModal = ({ firmaEkip, onClose }) => (
    <div className="ekip-modal-overlay" onClick={onClose}>
        <div className="ekip-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ekip-modal-header">
                <h3>Ekibimiz</h3>
                <button type="button" className="ekip-modal-close" onClick={onClose}>
                    <span className="material-symbols-outlined">close</span>
                </button>
            </div>
            <div className="ekip-modal-body">
                {firmaEkip.map(uye => (
                    <div key={uye.user_id} className="fd-ekip-card">
                        <div className="fd-ekip-avatar">
                            {uye.avatar_url ? (
                                <img src={uye.avatar_url} alt={uye.full_name || ''} />
                            ) : (
                                <span className="material-symbols-outlined">person</span>
                            )}
                        </div>
                        <div className="fd-ekip-info">
                            <strong>{uye.full_name || 'Ekip Üyesi'}</strong>
                            {uye.title && <span className="fd-ekip-title">{uye.title}</span>}
                            <span className={`ekip-role-badge ekip-role-badge--${uye.role}`}>
                                {uye.role === 'owner' ? 'Yetkili' : uye.role === 'admin' ? 'Yönetici' : 'Üye'}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

export default EkipModal;
