import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import SharedHeader from './SharedHeader';
import SharedFooter from './SharedFooter';
import SEO from './SEO';
import { supabase } from './supabaseClient';
import './SSS.css';

const CATEGORY_ORDER = [
  'Platform Genel',
  'Kayıt ve Üyelik',
  'Kurumsal Başvuru',
  'Giriş ve Şifre',
  'İhale Yönetimi',
  'Teklif Verme',
  'Firma Rehberi',
  'Profil ve Hesap',
  'Bildirimler',
  'Fiyatlandırma',
  'Teknik',
  'Favoriler',
  'Teklif Talebi',
  'Gizlilik ve KVKK',
  'Destek ve İletişim',
];

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

function stripHtml(html) {
  return (html || '').replace(/<[^>]+>/g, '');
}

export default function SSS() {
  const [qaList, setQaList]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [activeCategory, setActive]   = useState('Tümü');
  const [openId, setOpenId]           = useState(null);
  const [search, setSearch]           = useState('');

  useEffect(() => {
    supabase
      .from('chatbot_qa')
      .select('id, question, answer, category')
      .eq('is_active', true)
      .not('question', 'is', null)
      .then(({ data }) => {
        if (data) setQaList(data);
        setLoading(false);
      });
  }, []);

  /* ── Sıralı kategori listesi ── */
  const categories = useMemo(() => {
    const cats = [...new Set(qaList.map(q => q.category).filter(Boolean))];
    return cats.sort((a, b) => {
      const ai = CATEGORY_ORDER.indexOf(a);
      const bi = CATEGORY_ORDER.indexOf(b);
      if (ai === -1 && bi === -1) return a.localeCompare(b, 'tr');
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    });
  }, [qaList]);

  /* ── Filtreleme ── */
  const filtered = useMemo(() => {
    let list = qaList.filter(q => q.question);
    if (activeCategory !== 'Tümü') list = list.filter(q => q.category === activeCategory);
    if (search.trim().length >= 2) {
      const lower = search.toLocaleLowerCase('tr');
      list = list.filter(q =>
        q.question?.toLocaleLowerCase('tr').includes(lower) ||
        stripHtml(q.answer).toLocaleLowerCase('tr').includes(lower)
      );
    }
    return list;
  }, [qaList, activeCategory, search]);

  /* ── Kategoriye göre gruplama ── */
  const grouped = useMemo(() => {
    const isSearching = search.trim().length >= 2;
    if (activeCategory !== 'Tümü' || isSearching) {
      const label = isSearching ? 'Arama Sonuçları' : activeCategory;
      return [{ cat: label, items: filtered }];
    }
    const map = {};
    filtered.forEach(q => {
      const cat = q.category || 'Diğer';
      if (!map[cat]) map[cat] = [];
      map[cat].push(q);
    });
    return CATEGORY_ORDER
      .filter(cat => map[cat]?.length)
      .map(cat => ({ cat, items: map[cat] }));
  }, [filtered, activeCategory, search]);

  /* ── JSON-LD FAQPage schema (Google rich results) ── */
  const jsonLd = useMemo(() => ({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: qaList
      .filter(q => q.question && q.answer)
      .map(q => ({
        '@type': 'Question',
        name: q.question,
        acceptedAnswer: { '@type': 'Answer', text: stripHtml(q.answer) },
      })),
  }), [qaList]);

  const totalCount = qaList.filter(q => q.question).length;

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
        navItems={[
          { label: 'Anasayfa',  href: '/' },
          { label: 'Firmalar',  href: '/firmalar' },
          { label: 'İhaleler',  href: '/ihaleler' },
          { label: 'Hakkımızda', href: '/hakkimizda' },
          { label: 'İletişim',  href: '/iletisim' },
        ]}
      />

      <main className="sss-page">

        {/* ── Hero ── */}
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
                onChange={e => { setSearch(e.target.value); setActive('Tümü'); }}
                autoComplete="off"
              />
              {search && (
                <button className="sss-search-clear" onClick={() => setSearch('')} type="button" aria-label="Temizle">
                  <span className="material-symbols-outlined">close</span>
                </button>
              )}
            </div>
            {!loading && <p className="sss-hero-meta">{totalCount} soru · {categories.length} kategori</p>}
          </div>
        </section>

        {/* ── Kategori Pills ── */}
        <div className="sss-cats-wrap">
          <div className="sss-cats">
            <button
              className={`sss-cat-pill ${activeCategory === 'Tümü' ? 'active' : ''}`}
              onClick={() => { setActive('Tümü'); setSearch(''); }}
            >
              Tümü
              <span className="sss-pill-count">{totalCount}</span>
            </button>
            {categories.map(cat => {
              const count = qaList.filter(q => q.category === cat && q.question).length;
              return (
                <button
                  key={cat}
                  className={`sss-cat-pill ${activeCategory === cat ? 'active' : ''}`}
                  onClick={() => { setActive(cat); setSearch(''); setOpenId(null); }}
                >
                  <span className="material-symbols-outlined">{CATEGORY_ICONS[cat] || 'help_outline'}</span>
                  {cat}
                  <span className="sss-pill-count">{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── İçerik ── */}
        <div className="sss-content">
          {loading ? (
            <div className="sss-skeletons">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="sss-skeleton-item" style={{ opacity: 1 - i * 0.1 }} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="sss-empty">
              <span className="material-symbols-outlined">search_off</span>
              <p>"{search}" için sonuç bulunamadı.</p>
              <button className="sss-empty-reset" onClick={() => { setSearch(''); setActive('Tümü'); }}>
                Tüm Sorulara Dön
              </button>
            </div>
          ) : (
            grouped.map(({ cat, items }) => (
              <section key={cat} className="sss-group">
                {/* Grup başlığı: arama modunda veya tek kategori seçiliyse gizle */}
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

        {/* ── CTA ── */}
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
              <button
                className="sss-cta-btn sss-cta-btn--secondary"
                onClick={() => document.querySelector('.cb-fab')?.click()}
                type="button"
              >
                <span className="material-symbols-outlined">smart_toy</span>
                Chatbot'a Sor
              </button>
            </div>
          </div>
        </section>

      </main>

      <SharedFooter />
    </>
  );
}
