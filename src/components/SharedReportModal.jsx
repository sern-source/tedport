// Enes Doğanay | 7 Mayıs 2026: Ortak mesaj şikayet modalı — MyOffers ve İhaleYönetimi paylaşır
import React from 'react';
import './SharedReportModal.css';

/* Enes Doğanay | 7 Mayıs 2026: Şikayet nedenleri — her iki sayfada ortak */
const REPORT_REASONS = [
    { value: 'spam',    label: 'Spam veya Reklam' },
    { value: 'hakaret', label: 'Hakaret / Küfür' },
    { value: 'tehdit',  label: 'Tehdit' },
    { value: 'diger',   label: 'Diğer' },
];

const SharedReportModal = ({
    open,
    mesajIcerik,
    neden,
    aciklama,
    sending,
    success,
    onClose,
    onChangeNeden,
    onChangeAciklama,
    onSubmit,
}) => (
    <>
        {/* Enes Doğanay | 7 Mayıs 2026: Şikayet modal overlay — z-index 10100 (chat üzerinde) */}
        {open && (
            <div
                className="srm-overlay"
                onClick={e => { if (!sending && e.target === e.currentTarget) onClose(); }}
            >
                <div className="srm-modal">
                    <div className="srm-modal__header">
                        <span className="material-symbols-outlined srm-flag-icon">flag</span>
                        <h3>Mesajı Şikayet Et</h3>
                        <button className="srm-close" onClick={onClose} disabled={sending} aria-label="Kapat">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>
                    {mesajIcerik && (
                        <div className="srm-preview">{mesajIcerik}</div>
                    )}
                    <div className="srm-reasons">
                        {REPORT_REASONS.map(r => (
                            <label
                                key={r.value}
                                className={`srm-reason${neden === r.value ? ' selected' : ''}`}
                            >
                                <input
                                    type="radio"
                                    name="srm-report-neden"
                                    value={r.value}
                                    checked={neden === r.value}
                                    onChange={() => onChangeNeden(r.value)}
                                    disabled={sending}
                                />
                                {r.label}
                            </label>
                        ))}
                    </div>
                    <div className="srm-body">
                        <label className="srm-label">
                            Açıklama <span>(isteğe bağlı)</span>
                        </label>
                        <textarea
                            className="srm-textarea"
                            value={aciklama}
                            onChange={e => onChangeAciklama(e.target.value)}
                            placeholder="Ek açıklama yazabilirsiniz..."
                            maxLength={500}
                            rows={3}
                            disabled={sending}
                        />
                    </div>
                    <div className="srm-footer">
                        <button className="srm-cancel" onClick={onClose} disabled={sending}>
                            İptal
                        </button>
                        <button
                            className="srm-submit"
                            onClick={onSubmit}
                            disabled={sending || !neden}
                        >
                            {sending
                                ? <span className="material-symbols-outlined srm-spin">progress_activity</span>
                                : <><span className="material-symbols-outlined">flag</span>Şikayeti Gönder</>
                            }
                        </button>
                    </div>
                </div>
            </div>
        )}
        {/* Enes Doğanay | 7 Mayıs 2026: Başarı toast */}
        {success && (
            <div className="srm-toast">
                <span className="material-symbols-outlined">check_circle</span>
                Şikayetiniz alındı. Teşekkür ederiz.
            </div>
        )}
    </>
);

export default SharedReportModal;
