// Enes Doğanay | 6 Mayıs 2026: Firma kartı — grid görünümü için
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ContactDropdown from './ContactDropdown';
import './SupplierCard.css';

const SupplierCard = ({ supplier, isFavorited, onToggleFavorite, isLoggedIn, onQuoteRequest, onTagClick }) => {
  const navigate = useNavigate();
  const [showContact, setShowContact] = useState(false);
  const contactRef = useRef(null);

  useEffect(() => {
    if (!showContact) return;
    const handler = (e) => {
      if (contactRef.current && !contactRef.current.contains(e.target)) setShowContact(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showContact]);

  const handleNavigate = (e) => {
    e.preventDefault();
    navigate(`/firmadetay/${supplier.id}`);
  };

  return (
    <div className="supplier-card">
      <button
        className={`card-fav-btn${isFavorited ? ' card-fav-btn--active' : ''}`}
        onClick={(e) => { e.stopPropagation(); onToggleFavorite(supplier.id); }}
        data-tooltip={!isLoggedIn ? 'Giriş yapın' : isFavorited ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
        type="button"
        disabled={!isLoggedIn}
      >
        <span className="material-symbols-outlined">{isFavorited ? 'bookmark_added' : 'bookmark_add'}</span>
      </button>

      <a href={`/firmadetay/${supplier.id}`} className="card-images" onClick={handleNavigate}>
        <div className="main-image">
          {supplier.images ? (
            <img
              src={supplier.images} alt={supplier.name}
              style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '8px' }}
              onError={e => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex'; }}
            />
          ) : null}
          <img
            src="/tedport_default_company_logo.png" alt="Logo"
            style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '8px', display: supplier.images ? 'none' : 'block' }}
          />
        </div>
      </a>

      <div className="card-content">
        <h3 className="supplier-name">
          <a href={`/firmadetay/${supplier.id}`} onClick={handleNavigate} style={{ color: 'inherit', textDecoration: 'none' }}>
            {supplier.name}
            {supplier.isVerified && (
              <span className="verified-badge-inline">
                <span className="material-symbols-outlined verified-icon">verified</span>
                <span className="verified-text">Onaylı Firma</span>
              </span>
            )}
            {!supplier.isVerified && (
              <span className="platform-badge-inline">
                <span className="material-symbols-outlined platform-badge-icon">public</span>
                <span className="platform-badge-text">Otomatik Profil</span>
              </span>
            )}
          </a>
        </h3>
        <div className="meta-info">📍 {supplier.location}</div>
        <div className="tags">
          {(supplier.tags || []).map((tag, i) => (
            <span key={i} className="tag" style={{ cursor: 'pointer' }} onClick={() => onTagClick(tag)}>{tag}</span>
          ))}
        </div>
        <p className="description">{supplier.description}</p>
        <div className="card-footer">
          <div className="actions">
            <div className="contact-dropdown-wrap" ref={contactRef}>
              <button className="btn-outline" onClick={() => setShowContact(o => !o)}>İletişime Geç</button>
              {showContact && (
                <ContactDropdown
                  supplier={supplier}
                  isLoggedIn={isLoggedIn}
                  onQuoteRequest={() => { setShowContact(false); onQuoteRequest(supplier); }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplierCard;
