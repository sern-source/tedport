// Enes Doğanay | 6 Mayıs 2026: Mesaj şikayet modalı
import React from 'react';

const REPORT_REASONS = [
    { value: 'spam', label: 'Spam veya Reklam' },
    { value: 'hakaret', label: 'Hakaret / Küfür' },
    { value: 'tehdit', label: 'Tehdit' },
    { value: 'diger', label: 'Diğer' },
];

const IhaleReportModal = ({ reportState, setReportState, onClose, onSubmit }) => {
    if (!reportState.msgId) return null;

    return (
        <div className="msg-report-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="msg-report-modal">
                <div className="msg-report-modal__header">
                    <h3><span className="material-symbols-outlined">flag</span>Mesajı Şikayet Et</h3>
                    <button onClick={onClose}><span className="material-symbols-outlined">close</span></button>
                </div>
                <div className="msg-report-reasons">
                    {REPORT_REASONS.map(r => (
                        <label key={r.value} className={`msg-report-reason${reportState.neden === r.value ? ' msg-report-reason--active' : ''}`}>
                            <input type="radio" name="report-reason" value={r.value} checked={reportState.neden === r.value} onChange={() => setReportState(p => ({ ...p, neden: r.value }))} />
                            {r.label}
                        </label>
                    ))}
                </div>
                <div className="msg-report-modal__body">
                    <label>Açıklama (isteğe bağlı)</label>
                    <textarea value={reportState.aciklama} onChange={e => setReportState(p => ({ ...p, aciklama: e.target.value }))} rows={3} placeholder="Ek açıklama yazabilirsiniz..." maxLength={400} />
                </div>
                <div className="msg-report-modal__footer">
                    <button className="tom-btn tom-btn--cancel" onClick={onClose}>İptal</button>
                    <button className="tom-btn tom-btn--danger" onClick={onSubmit} disabled={!reportState.neden}><span className="material-symbols-outlined">flag</span>Şikayeti Gönder</button>
                </div>
            </div>
        </div>
    );
};

export default IhaleReportModal;
