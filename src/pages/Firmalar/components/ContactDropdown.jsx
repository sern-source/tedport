// Enes Doğanay | 6 Mayıs 2026: İletişime Geç dropdown içeriği — kart ve liste görünümü paylaşımlı
import React from 'react';
import { useNavigate } from 'react-router-dom';

const ContactDropdown = ({ supplier, isLoggedIn, onQuoteRequest }) => {
  const navigate = useNavigate();
  return (
    <div className="contact-dropdown">
      {!isLoggedIn ? (
        <div className="contact-gated-panel">
          <span className="material-symbols-outlined contact-gated-lock">lock</span>
          <p className="contact-gated-text">Teklif istemek ve iletişim bilgilerini görmek için giriş yapın.</p>
          <button onClick={() => navigate('/login')} className="contact-gated-btn">Giriş Yap</button>
        </div>
      ) : (
        <>
          {supplier.isVerified && (
            <button className="contact-dropdown-item contact-dropdown-teklif" onClick={onQuoteRequest} type="button">
              <span className="material-symbols-outlined">request_quote</span>Teklif İste
            </button>
          )}
          {supplier.telefon && (
            <a href={`tel:${supplier.telefon}`} className="contact-dropdown-item">
              <span className="material-symbols-outlined">call</span>{supplier.telefon}
            </a>
          )}
          {supplier.eposta && (
            <a href={`mailto:${supplier.eposta}`} className="contact-dropdown-item">
              <span className="material-symbols-outlined">mail</span>{supplier.eposta}
            </a>
          )}
          {supplier.web_sitesi && (
            <a
              href={supplier.web_sitesi.startsWith('http') ? supplier.web_sitesi : `https://${supplier.web_sitesi}`}
              target="_blank" rel="noopener noreferrer" className="contact-dropdown-item"
            >
              <span className="material-symbols-outlined">language</span>
              {supplier.web_sitesi.replace(/^https?:\/\//, '')}
            </a>
          )}
          {(supplier.adres || supplier.location) && (
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(supplier.adres || supplier.location)}`}
              target="_blank" rel="noopener noreferrer" className="contact-dropdown-item"
            >
              <span className="material-symbols-outlined">location_on</span>
              {supplier.location || supplier.adres}
            </a>
          )}
          {!supplier.telefon && !supplier.eposta && !supplier.web_sitesi && !supplier.adres && !supplier.isVerified && (
            <span className="contact-dropdown-empty">İletişim bilgisi yok</span>
          )}
        </>
      )}
    </div>
  );
};

export default ContactDropdown;
