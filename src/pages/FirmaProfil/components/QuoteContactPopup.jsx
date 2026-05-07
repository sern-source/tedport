// Enes Doğanay | 6 Mayıs 2026: İletişim kartı popup — teklif gönderen kullanıcı
import React from 'react';

/* Enes Doğanay | 6 Mayıs 2026: Teklif gönderenin iletişim bilgisi popup */
const QuoteContactPopup = ({ quoteContactPopup, setQuoteContactPopup, qCopied, setQCopied }) => {
  if (!quoteContactPopup) return null;
  const close = () => { setQuoteContactPopup(null); setQCopied(null); };
  return (
    <div className="tom-contact-overlay" onClick={close}>
      <div className="tom-contact-card" onClick={(e) => e.stopPropagation()}>
        <div className="tom-contact-card__banner" />
        <button className="tom-contact-card__close" onClick={close}>
          <span className="material-symbols-outlined">close</span>
        </button>
        <div className="tom-contact-card__avatar">
          {quoteContactPopup.avatar ? (
            <img src={quoteContactPopup.avatar} alt="" className="tom-contact-card__avatar-img" />
          ) : (
            <span className="tom-contact-card__initials">{quoteContactPopup.initials || '?'}</span>
          )}
        </div>
        <div className="tom-contact-card__identity">
          <h3>{quoteContactPopup.name || 'İsimsiz'}</h3>
          {quoteContactPopup.companyName || quoteContactPopup.firma ? (
            <p className="tom-contact-card__firma">
              <span className="material-symbols-outlined">business</span>
              {quoteContactPopup.companyName || quoteContactPopup.firma}
            </p>
          ) : (
            <p className="tom-contact-card__firma">Bireysel Tedarikçi</p>
          )}
          <span className="tom-contact-card__badge">
            <span className="material-symbols-outlined">verified</span>
            Kayıtlı Üye
          </span>
        </div>
        <div className="tom-contact-card__rows">
          {quoteContactPopup.email && (
            <div className="tom-contact-row tom-contact-row--email">
              <span className="material-symbols-outlined">mail</span>
              <div className="tom-contact-row__body">
                <small>E-posta</small>
                <span>{quoteContactPopup.email}</span>
              </div>
              <div className="tom-contact-row__actions">
                <a
                  href={`mailto:${quoteContactPopup.email}`}
                  className="tom-contact-icon-btn"
                  data-tooltip="Mail gönder"
                >
                  <span className="material-symbols-outlined">send</span>
                </a>
                <button
                  className="tom-contact-icon-btn"
                  data-tooltip="Kopyala"
                  onClick={() => {
                    navigator.clipboard.writeText(quoteContactPopup.email);
                    setQCopied('email');
                    setTimeout(() => setQCopied(null), 2000);
                  }}
                >
                  <span className="material-symbols-outlined">
                    {qCopied === 'email' ? 'check' : 'content_copy'}
                  </span>
                </button>
              </div>
            </div>
          )}
          {quoteContactPopup.phone && (
            <a href={`tel:${quoteContactPopup.phone}`} className="tom-contact-row">
              <span className="material-symbols-outlined">phone</span>
              <div className="tom-contact-row__body">
                <small>Telefon</small>
                <span>{quoteContactPopup.phone}</span>
              </div>
            </a>
          )}
          {quoteContactPopup.location && (
            <div className="tom-contact-row">
              <span className="material-symbols-outlined">location_on</span>
              <div className="tom-contact-row__body">
                <small>Konum</small>
                <span>{quoteContactPopup.location}</span>
              </div>
            </div>
          )}
        </div>
        {!quoteContactPopup.email && !quoteContactPopup.phone && (
          <p className="tom-contact-card__empty">İletişim bilgisi bulunamadı.</p>
        )}
      </div>
    </div>
  );
};

export default QuoteContactPopup;
