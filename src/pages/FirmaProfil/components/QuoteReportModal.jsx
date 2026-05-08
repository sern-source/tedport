// Enes Doğanay | 6 Mayıs 2026: Şikayet modal + başarı toast
import React from 'react';

/* Enes Doğanay | 6 Mayıs 2026: Şikayet nedenleri listesi */
const REPORT_REASONS = [
  { value: 'spam', label: 'Spam / İstenmeyen Mesaj' },
  { value: 'hakaret', label: 'Hakaret / İltihap' },
  { value: 'tehdit', label: 'Tehdit / Taciz' },
  { value: 'yaniltici', label: 'Yanıltıcı / Sahte Teklif' },
  { value: 'diger', label: 'Diğer' },
];

/* Enes Doğanay | 6 Mayıs 2026: Mesaj şikayet modal */
const QuoteReportModal = ({
  reportModal,
  setReportModal,
  reportSending,
  reportNeden,
  setReportNeden,
  reportAciklama,
  setReportAciklama,
  reportSuccess,
  handleSubmitReport,
}) => (
  <>
    {reportSuccess && (
      <div className="msg-report-toast">
        <span className="material-symbols-outlined">check_circle</span>
        Şikayetiniz alındı. İncelenecektir.
      </div>
    )}
    {reportModal && (
      <div
        className="msg-report-overlay"
        onClick={() => !reportSending && setReportModal(null)}
      >
        <div className="msg-report-modal" role="dialog" aria-modal="true" aria-labelledby="quote-report-title" onClick={(e) => e.stopPropagation()}>
          <div className="msg-report-modal__header">
            <span className="material-symbols-outlined">flag</span>
            <h3 id="quote-report-title">Mesajı Şikayet Et</h3>
            <button
              className="msg-report-close"
              onClick={() => setReportModal(null)}
              disabled={reportSending}
              aria-label="Kapat"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <div className="msg-report-modal__body">
            <div className="msg-report-preview">{reportModal.mesajIcerik}</div>
            <p className="msg-report-label">Şikayet nedeni</p>
            <div className="msg-report-reasons">
              {REPORT_REASONS.map((r) => (
                <label
                  key={r.value}
                  className={`msg-report-reason${reportNeden === r.value ? ' selected' : ''}`}
                >
                  <input
                    type="radio"
                    name="report-neden"
                    value={r.value}
                    checked={reportNeden === r.value}
                    onChange={() => setReportNeden(r.value)}
                  />
                  {r.label}
                </label>
              ))}
            </div>
            <p className="msg-report-label">
              Ek açıklama <span>(isteğe bağlı)</span>
            </p>
            <textarea
              className="msg-report-textarea"
              value={reportAciklama}
              onChange={(e) => setReportAciklama(e.target.value)}
              placeholder="Şikayet detayı..."
              maxLength={500}
              rows={3}
            />
          </div>
          <div className="msg-report-modal__footer">
            <button
              className="msg-report-cancel"
              onClick={() => setReportModal(null)}
              disabled={reportSending}
            >
              İptal
            </button>
            <button
              className="msg-report-submit"
              onClick={handleSubmitReport}
              disabled={reportSending}
            >
              {reportSending ? (
                <span className="material-symbols-outlined">progress_activity</span>
              ) : (
                'Şikayet Gönder'
              )}
            </button>
          </div>
        </div>
      </div>
    )}
  </>
);

export default QuoteReportModal;
