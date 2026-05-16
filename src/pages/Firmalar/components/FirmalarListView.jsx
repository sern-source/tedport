// Enes Doğanay | 6 Mayıs 2026: Firma listesi — liste görünümü (tablo düzeni)
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ContactDropdown from './ContactDropdown';
import './FirmalarListView.css';

const FirmalarListView = ({ suppliers, favoriteIds, isLoggedIn, onToggleFavorite, onQuoteRequest }) => {
  const navigate = useNavigate();
  const [openContactId, setOpenContactId] = useState(null);
  const contactRef = useRef(null);

  useEffect(() => {
    if (!openContactId) return;
    const handler = (e) => {
      if (contactRef.current && !contactRef.current.contains(e.target)) setOpenContactId(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [openContactId]);

  return (
    <section className="firmalar-list-view">
      <div className="firmalar-list-header">
        <span className="firmalar-list-col firmalar-list-col--logo" />
        <span className="firmalar-list-col firmalar-list-col--name">Firma Adı</span>
        <span className="firmalar-list-col firmalar-list-col--sector">Sektör</span>
        <span className="firmalar-list-col firmalar-list-col--location">Konum</span>
        <span className="firmalar-list-col firmalar-list-col--action" />
      </div>

      {suppliers.map(supplier => (
        <div key={supplier.id} className="firmalar-list-row">
          <a
            href={`/firmadetay/${supplier.id}`}
            className="firmalar-list-col firmalar-list-col--logo"
            onClick={(e) => { e.preventDefault(); navigate(`/firmadetay/${supplier.id}`); }}
          >
            <img
              src={supplier.images || '/tedport_default_company_logo.png'}
              alt="" className="firmalar-list-avatar-img"
              onError={e => { e.currentTarget.src = '/tedport_default_company_logo.png'; }}
            />
          </a>

          <a
            href={`/firmadetay/${supplier.id}`}
            className="firmalar-list-col firmalar-list-col--name"
            onClick={(e) => { e.preventDefault(); navigate(`/firmadetay/${supplier.id}`); }}
            style={{ color: 'inherit', textDecoration: 'none' }}
          >
            <span className="firmalar-list-name-text">{supplier.name}</span>
            {supplier.isVerified && !supplier.isDemo && (
              <span className="verified-badge-inline">
                <span className="material-symbols-outlined verified-icon" style={{ fontSize: '14px' }}>verified</span>
                <span className="verified-text">Onaylı Firma</span>
              </span>
            )}
            {/* Enes Doğanay | 12 Mayıs 2026: Otomatik Profil → Firma Onayı Bekleniyor */}
            {!supplier.isVerified && !supplier.isDemo && (
              <span className="platform-badge-inline">
                <span className="platform-badge-text">Firma Onayı Bekleniyor</span>
                <span className="material-symbols-outlined platform-badge-icon" style={{ fontSize: '13px' }}>schedule</span>
              </span>
            )}
          </a>

          {/* Enes Doğanay | 12 Mayıs 2026: Grid ile uyumluluk — supplier.sector pill */}
          <span className="firmalar-list-col firmalar-list-col--sector"
            onClick={() => navigate(`/firmadetay/${supplier.id}`)}
            role="button" tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate(`/firmadetay/${supplier.id}`); }}
          >
            {supplier.sector
              ? <span className="list-sector-pill" title={supplier.sector}>{supplier.sector}</span>
              : <span style={{ color: 'var(--text-muted)' }}>—</span>}
          </span>
          <span className="firmalar-list-col firmalar-list-col--location"
            onClick={() => navigate(`/firmadetay/${supplier.id}`)}
            role="button" tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate(`/firmadetay/${supplier.id}`); }}
          >
            {supplier.location || '—'}
          </span>

          <span className="firmalar-list-col firmalar-list-col--action" onClick={e => e.stopPropagation()}>
            <button
              className={`list-fav-btn${favoriteIds.has(supplier.id) ? ' list-fav-btn--active' : ''}`}
              onClick={() => onToggleFavorite(supplier.id)}
              aria-label={!isLoggedIn ? 'Giriş yapın' : favoriteIds.has(supplier.id) ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
              type="button"
              disabled={!isLoggedIn}
            >
              <span className="material-symbols-outlined">
                {favoriteIds.has(supplier.id) ? 'bookmark_added' : 'bookmark_add'}
              </span>
            </button>
            <div className="contact-dropdown-wrap" ref={openContactId === supplier.id ? contactRef : undefined}>
              <button
                className="btn-outline firmalar-list-contact-btn"
                onClick={() => setOpenContactId(openContactId === supplier.id ? null : supplier.id)}
              >
                İletişime Geç
              </button>
              {openContactId === supplier.id && (
                <ContactDropdown
                  supplier={supplier}
                  isLoggedIn={isLoggedIn}
                  onQuoteRequest={() => { setOpenContactId(null); onQuoteRequest(supplier); }}
                />
              )}
            </div>
          </span>
        </div>
      ))}
    </section>
  );
};

export default FirmalarListView;
