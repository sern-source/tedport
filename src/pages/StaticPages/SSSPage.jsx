// Enes Doğanay | 6 Mayıs 2026: SSS sayfası — hook ile yeniden yazıldı
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import SharedHeader from '../../components/SharedHeader';
import SharedFooter from '../../components/SharedFooter';
import SEO from '../../components/SEO';
import { useSSS } from './hooks/useSSS';
import './SSSPage.css';

// Enes Doğanay | 8 Mayıs 2026: Module-level sabiti — JSX içi inline array kaldırıldı
const SSS_NAV = [
  { label: 'Anasayfa',   href: '/' },
  { label: 'Firmalar',   href: '/firmalar' },
  { label: 'İhaleler',   href: '/ihaleler' },
  { label: 'Hakkımızda', href: '/hakkimizda' },
  { label: 'İletişim',   href: '/iletisim' },
];

// Enes Doğanay | 6 Mayıs 2026: Kategori ikonları sabiti
const CATEGORY_ICONS = {
  'Platform Genel':       'info',
  'Kayıt ve Üyelik':      'person_add',
  'Kurumsal Başvuru':     'business',
  'Giriş ve Şifre':       'lock',
  'İhale Yönetimi':       'gavel',
  'Teklif Verme':         'request_quote',
  'Firma Rehberi':        'store',
  'Profil ve Hesap':      'manage_accounts',
  'Bildirimler':          'notifications',
  'Fiyatlandırma':        'payments',
  'Teknik':               'build',
  'Favoriler':            'bookmark',
  'Teklif Talebi':        'assignment',
  'Gizlilik ve KVKK':     'shield',
  'Destek ve İletişim':   'support_agent',
};

export default function SSSPage() {
  const {
    isLoading,
    categories,
    filtered,
    grouped,
    jsonLd,
    totalCount,
    activeCategory,
    openId,
    search,
    setOpenId,
    handleCategoryChange,
    handleSearchChange,
    handleReset,
  } = useSSS();

  return (
    <>
      <SEO
        title="Sıkça Sorulan Sorular"
        description="Tedport hakkında merak ettiğiniz her şey burada — kayıt, ihale, teklif verme, firma rehberi, güvenlik ve daha fazlası."
        path="/sss"
      />
      {totalCount > 0 && (
        <Helmet>
          <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
        </Helmet>
      )}

      <SharedHeader
        navItems={SSS_NAV}
      />

      <main className="sss-page">

        {/* Hero */}
        <section className="sss-hero">
          <div className="sss-hero-inner">
            <span className="material-symbols-outlined sss-hero-icon">help</span>
            <h1>Sıkça Sorulan Sorular</h1>
            <p>Tedport hakkında merak ettiğiniz her şey burada.</p>
            <div className="sss-search-wrap">
              <span className="material-symbols-outlined">search</span>
              <input
                type="search"
                placeholder="Soru veya konu ara…"
                value={search}
                onChange={e => handleSearchChange(e.target.value)}
                autoComplete="off"
              />
              {search && (
                <button className="sss-search-clear" onClick={() => handleSearchChange('')} type="button" aria-label="Temizle">
                  <span className="material-symbols-outlined">close</span>
                </button>
              )}
            </div>
            {!isLoading && <p className="sss-hero-meta">{totalCount} soru · {categories.length} kategori</p>}
          </div>
        </section>

        {/* Kategori Pills */}
        <div className="sss-cats-wrap">
          <div className="sss-cats">
            <button
              className={`sss-cat-pill ${activeCategory === 'Tümü' ? 'active' : ''}`}
              onClick={() => handleReset()}
            >
              Tümü
              <span className="sss-pill-count">{totalCount}</span>
            </button>
            {categories.map(cat => {
              const count = filtered.filter(q => q.category === cat).length || 0;
              return (
                <button
                  key={cat}
                  className={`sss-cat-pill ${activeCategory === cat ? 'active' : ''}`}
                  onClick={() => handleCategoryChange(cat)}
                >
                  <span className="material-symbols-outlined">{CATEGORY_ICONS[cat] || 'help_outline'}</span>
                  {cat}
                  <span className="sss-pill-count">{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* İçerik */}
        <div className="sss-content">
          {isLoading ? (
            <div className="sss-skeletons">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="sss-skeleton-item" style={{ opacity: 1 - i * 0.1 }} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="sss-empty">
              <span className="material-symbols-outlined">search_off</span>
              <p>"{search}" için sonuç bulunamadı.</p>
              <button className="sss-empty-reset" onClick={handleReset} type="button">
                Tüm Sorulara Dön
              </button>
            </div>
          ) : (
            grouped.map(({ cat, items }) => (
              <section key={cat} className="sss-group">
                {activeCategory === 'Tümü' && search.trim().length < 2 && (
                  <h2 className="sss-group-title">
                    <span className="material-symbols-outlined">{CATEGORY_ICONS[cat] || 'help_outline'}</span>
                    {cat}
                    <span className="sss-group-count">{items.length}</span>
                  </h2>
                )}
                {items.map(item => (
                  <div key={item.id} className={`sss-item ${openId === item.id ? 'open' : ''}`}>
                    <button
                      className="sss-question"
                      onClick={() => setOpenId(openId === item.id ? null : item.id)}
                      aria-expanded={openId === item.id}
                    >
                      <span>{item.question}</span>
                      <span className="material-symbols-outlined sss-chevron">expand_more</span>
                    </button>
                    <div className="sss-answer-wrap">
                      <div
                        className="sss-answer"
                        dangerouslySetInnerHTML={{ __html: item.answer }}
                      />
                    </div>
                  </div>
                ))}
              </section>
            ))
          )}
        </div>

        {/* CTA */}
        <section className="sss-cta">
          <div className="sss-cta-inner">
            <span className="material-symbols-outlined sss-cta-icon">support_agent</span>
            <h2>Aradığınız cevabı bulamadınız mı?</h2>
            <p>Ekibimiz size yardımcı olmaktan memnuniyet duyar.</p>
            <div className="sss-cta-btns">
              <Link to="/iletisim" className="sss-cta-btn sss-cta-btn--primary">
                <span className="material-symbols-outlined">mail</span>
                İletişime Geç
              </Link>
            </div>
          </div>
        </section>

      </main>

      <SharedFooter />
    </>
  );
}
