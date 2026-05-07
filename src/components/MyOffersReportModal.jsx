// Enes Doğanay | 6 Mayıs 2026: Mesaj şikayet modal — MyOffersTab alt bileşeni
import React from 'react';

const REPORT_NEDENLER = [
    { value: 'spam',   label: 'Spam / Reklam' },
    { value: 'kaba',   label: 'Kaba / Hakaret' },
    { value: 'yanlis', label: 'Yanlış Bilgi' },
    { value: 'diger',  label: 'Diğer' },
];

const MyOffersReportModal = ({
    reportModal, setReportModal,
    reportNeden, setReportNeden,
    reportAciklama, setReportAciklama,
    reportSending, reportSuccess,
    handleSubmitReport,
}) => (
    <>
        {reportModal && (
            <div className="msg-report-overlay" onClick={e => { if (e.target === e.currentTarget) setReportModal(null); }}>
                <div className="msg-report-modal">
                    <button className="msg-report-close" onClick={() => setReportModal(null)} aria-label="Kapat">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                    <div className="msg-report-modal__header"><h3>Mesajı Şikayet Et</h3></div>
                    <div className="msg-report-modal__body">
                        {reportModal.mesajIcerik && <div className="msg-report-preview"><p>{reportModal.mesajIcerik}</p></div>}
                        <label className="msg-report-label">Şikayet Nedeni</label>
                        <div className="msg-report-reasons">
                            {REPORT_NEDENLER.map(n => (
                                <label key={n.value} className={`msg-report-reason${reportNeden === n.value ? ' msg-report-reason--active' : ''}`}>
                                    <input type="radio" name="neden" value={n.value} checked={reportNeden === n.value} onChange={() => setReportNeden(n.value)} />
                                    {n.label}
                                </label>
                            ))}
                        </div>
                        <label className="msg-report-label">Açıklama (isteğe bağlı)</label>
                        <textarea className="msg-report-textarea" placeholder="Ek bilgi veya açıklama…"
                            value={reportAciklama} onChange={e => setReportAciklama(e.target.value)} rows={3} />
                    </div>
                    <div className="msg-report-modal__footer">
                        <button className="msg-report-cancel" onClick={() => setReportModal(null)}>İptal</button>
                        <button className="msg-report-submit" onClick={handleSubmitReport} disabled={reportSending}>
                            {reportSending ? 'Gönderiliyor…' : 'Şikayet Gönder'}
                        </button>
                    </div>
                </div>
            </div>
        )}
        {/* Enes Doğanay | 6 Mayıs 2026: Şikayet başarı toast */}
        {reportSuccess && (
            <div className="msg-report-toast">
                <span className="material-symbols-outlined">check_circle</span>
                Şikayetiniz alındı. Teşekkür ederiz.
            </div>
        )}
    </>
);

export default MyOffersReportModal;
