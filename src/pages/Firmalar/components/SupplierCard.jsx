// Enes Doğanay | 6 Mayıs 2026: Firma kartı — grid görünümü için
'use client';
import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import ContactDropdown from './ContactDropdown';
import './SupplierCard.css';

const SupplierCard = ({ supplier, isFavorited, onToggleFavorite, isLoggedIn, onQuoteRequest, onTagClick }) => {
  const router = useRouter();
  // Enes Doğanay | 23 Mayıs 2026: next/image fallback — Supabase URL yüklenemezse default logo
  const [logoError, setLogoError] = useState(false);
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

  // Enes Doğanay | 23 Mayıs 2026: slug bazlı URL — slug yoksa eski ID URL'e fallback
  const firmaUrl = supplier.slug ? `/firmalar/${supplier.slug}` : `/firmadetay/${supplier.id}`;

  const handleNavigate = (e) => {
    e.preventDefault();
    router.push(firmaUrl);
  };

  return (
    <div className="supplier-card">
      {/* Enes Doğanay | 11 Mayıs 2026: Fav wrapper — tooltip pozisyonlaması için */}
      <div className="card-fav-wrap">
        <button
          className={`card-fav-btn${isFavorited ? ' card-fav-btn--active' : ''}`}
          onClick={(e) => { e.stopPropagation(); onToggleFavorite(supplier.id); }}
          aria-label={!isLoggedIn ? 'Giriş yapın' : isFavorited ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
          type="button"
          disabled={!isLoggedIn}
        >
          <span className="material-symbols-outlined">{isFavorited ? 'bookmark_added' : 'bookmark_add'}</span>
        </button>
        <span className="card-fav-tooltip">
          {!isLoggedIn ? 'Favori için giriş yapın' : isFavorited ? 'Favorilerden çıkar' : 'Favorilere ekle'}
        </span>
      </div>

      <a href={firmaUrl} className="card-images" onClick={handleNavigate}>
        {/* Enes Doğanay | 23 Mayıs 2026: next/image fill — WebP optimizasyon + lazy load otomatik */}
        <div className="main-image">
          <Image
            src={logoError || !supplier.images ? '/tedport_default_company_logo.png' : supplier.images}
            alt={supplier.name || 'Firma logosu'}
            fill
            sizes="(max-width: 540px) 72px, (max-width: 768px) 84px, 96px"
            style={{ objectFit: 'contain' }}
            onError={() => setLogoError(true)}
          />
        </div>
      </a>

      <div className="card-content">
        <h3 className="supplier-name">
          <a href={firmaUrl} onClick={handleNavigate} style={{ color: 'inherit', textDecoration: 'none' }}>
            {supplier.name}
            {supplier.isVerified && !supplier.isDemo && (
              <span className="verified-badge-inline">
                <span className="material-symbols-outlined verified-icon">verified</span>
                <span className="verified-text">Onaylı Firma</span>
              </span>
            )}
            {/* Enes Doğanay | 12 Mayıs 2026: Otomatik Profil → Firma Onayı Bekleniyor */}
            {!supplier.isVerified && !supplier.isDemo && (
              <span className="platform-badge-inline">
                <span className="platform-badge-text">Firma Onayı Bekleniyor</span>
                <span className="material-symbols-outlined platform-badge-icon">schedule</span>
              </span>
            )}
          </a>
        </h3>
        {/* Enes Doğanay | 12 Mayıs 2026: 📍 emoji → material icon + sektör pill */}
        <div className="meta-info">
          <span className="material-symbols-outlined" style={{ fontSize: '13px', flexShrink: 0 }}>location_on</span>
          {supplier.location}
          {supplier.sector && <span className="meta-sector" title={supplier.sector}>{supplier.sector}</span>}
        </div>
        <div className="tags">
          {(supplier.tags || []).map((tag) => (
            <span key={tag} className="tag" style={{ cursor: 'pointer' }} onClick={() => onTagClick(tag)}>{tag}</span>
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

// Enes Doğanay | 28 Haziran 2026: React.memo — büyük listelerde gereksiz re-render önler
export default React.memo(SupplierCard);
