import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import SharedHeader from './SharedHeader';
import './SharedHeader.css';
import './AdminChatbotTraining.css';
import { supabase } from './supabaseClient';
import { isAdminEmail } from './adminAccess';
import { resolveIsAdminUser } from './corporateApplicationsApi';

/* ─── Boş form şablonları ─────────────────────────────────────── */
const EMPTY_QA = { keywords: '', answer: '', is_active: true };
const EMPTY_QQ = { question: '', sort_order: 0, is_active: true };

/* ─── Sitedeki sayfalar — link ekleyici için ─────────────────── */
const SITE_PAGES = [
  { label: 'Ana Sayfa', path: '/' },
  { label: 'Firma Rehberi', path: '/firmalar' },
  { label: 'İhaleler', path: '/ihaleler' },
  { label: 'Kayıt Ol', path: '/register' },
  { label: 'Giriş Yap', path: '/login' },
  { label: 'Profilim', path: '/profile' },
  { label: 'İletişim', path: '/iletisim' },
  { label: 'Hakkımızda', path: '/hakkimizda' },
  { label: 'KVKK', path: '/kvkk' },
  { label: 'Gizlilik Politikası', path: '/gizlilik-politikasi' },
  { label: 'Hizmet Şartları', path: '/hizmet-sartlari' },
];

/* ─── Yardımcı: keyword string ↔ array ──────────────────────────*/
const kwToStr = (arr) => (arr || []).join(', ');
const strToKw = (str) =>
  str
    .split(',')
    .map((s) => s.trim().toLocaleLowerCase('tr'))
    .filter(Boolean);

/* ─── Bileşen ─────────────────────────────────────────────────── */
const AdminChatbotTraining = () => {
  const navigate = useNavigate();

  /* Yetki */
  const [sessionChecked, setSessionChecked] = useState(false);
  const [accessDenied, setAccessDenied]     = useState(false);

  /* Sekme */
  const [tab, setTab] = useState('qa'); // 'qa' | 'quick'

  /* Q&A state */
  const [qaList, setQaList]           = useState([]);
  const [qaLoading, setQaLoading]     = useState(true);
  const [qaForm, setQaForm]           = useState(EMPTY_QA);
  const [qaEditId, setQaEditId]       = useState(null);
  const [qaFormOpen, setQaFormOpen]   = useState(false);
  const [qaSaving, setQaSaving]       = useState(false);
  const [qaError, setQaError]         = useState('');
  const [qaSearch, setQaSearch]       = useState('');

  /* Link ekleyici state */
  const [linkPage, setLinkPage]       = useState('');
  const [linkText, setLinkText]       = useState('');
  const answerRef                     = useRef(null);

  /* Hızlı Sorular state */
  const [qqList, setQqList]           = useState([]);
  const [qqLoading, setQqLoading]     = useState(true);
  const [qqForm, setQqForm]           = useState(EMPTY_QQ);
  const [qqEditId, setQqEditId]       = useState(null);
  const [qqFormOpen, setQqFormOpen]   = useState(false);
  const [qqSaving, setQqSaving]       = useState(false);
  const [qqError, setQqError]         = useState('');

  /* Silme onayı */
  const [deleteTarget, setDeleteTarget] = useState(null); // { type: 'qa'|'qq', id }

  /* ── Admin yetki kontrolü ─────────────────────────────────── */
  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { navigate('/login'); return; }
      if (!(await resolveIsAdminUser(session.user.email, isAdminEmail))) {
        setAccessDenied(true);
        setSessionChecked(true);
        return;
      }
      setSessionChecked(true);
      fetchQA();
      fetchQQ();
    };
    check();
  }, []);

  /* ── Veri çekme ───────────────────────────────────────────── */
  const fetchQA = useCallback(async () => {
    setQaLoading(true);
    const { data, error } = await supabase
      .from('chatbot_qa')
      .select('*')
      .order('id', { ascending: true });
    if (!error && data) setQaList(data);
    setQaLoading(false);
  }, []);

  const fetchQQ = useCallback(async () => {
    setQqLoading(true);
    const { data, error } = await supabase
      .from('chatbot_quick_questions')
      .select('*')
      .order('sort_order', { ascending: true });
    if (!error && data) setQqList(data);
    setQqLoading(false);
  }, []);

  /* ── Q&A işlemleri ────────────────────────────────────────── */
  const openQaForm = (item = null) => {
    setQaError('');
    setLinkPage('');
    setLinkText('');
    if (item) {
      setQaForm({ keywords: kwToStr(item.keywords), answer: item.answer, is_active: item.is_active });
      setQaEditId(item.id);
    } else {
      setQaForm(EMPTY_QA);
      setQaEditId(null);
    }
    setQaFormOpen(true);
  };

  const closeQaForm = () => { setQaFormOpen(false); setQaEditId(null); setQaError(''); setLinkPage(''); setLinkText(''); };

  /* Textarea imlecine link HTML'i ekle */
  const insertLink = () => {
    if (!linkPage) return;
    const page = SITE_PAGES.find((p) => p.path === linkPage);
    const text = linkText.trim() || page?.label || linkPage;
    const html = `<a href="${linkPage}" class="cb-link">${text}</a>`;
    const ta = answerRef.current;
    if (!ta) {
      setQaForm((f) => ({ ...f, answer: f.answer + html }));
    } else {
      const start = ta.selectionStart;
      const end   = ta.selectionEnd;
      const current = qaForm.answer;
      const next = current.slice(0, start) + html + current.slice(end);
      setQaForm((f) => ({ ...f, answer: next }));
      // imleci linkin sonuna taşı
      requestAnimationFrame(() => {
        ta.focus();
        ta.setSelectionRange(start + html.length, start + html.length);
      });
    }
    setLinkPage('');
    setLinkText('');
  };

  const saveQA = async (e) => {
    e.preventDefault();
    const keywords = strToKw(qaForm.keywords);
    if (!keywords.length) { setQaError('En az bir anahtar kelime girin.'); return; }
    if (!qaForm.answer.trim()) { setQaError('Cevap boş olamaz.'); return; }

    setQaSaving(true);
    setQaError('');
    const payload = { keywords, answer: qaForm.answer.trim(), is_active: qaForm.is_active };

    let error;
    if (qaEditId) {
      ({ error } = await supabase.from('chatbot_qa').update(payload).eq('id', qaEditId));
    } else {
      ({ error } = await supabase.from('chatbot_qa').insert(payload));
    }

    if (error) { setQaError('Kayıt başarısız: ' + error.message); }
    else { closeQaForm(); fetchQA(); }
    setQaSaving(false);
  };

  const toggleQaActive = async (item) => {
    await supabase.from('chatbot_qa').update({ is_active: !item.is_active }).eq('id', item.id);
    fetchQA();
  };

  const confirmDelete = (type, id) => setDeleteTarget({ type, id });

  const executeDelete = async () => {
    if (!deleteTarget) return;
    const table = deleteTarget.type === 'qa' ? 'chatbot_qa' : 'chatbot_quick_questions';
    await supabase.from(table).delete().eq('id', deleteTarget.id);
    setDeleteTarget(null);
    if (deleteTarget.type === 'qa') fetchQA(); else fetchQQ();
  };

  /* ── Hızlı Soru işlemleri ─────────────────────────────────── */
  const openQqForm = (item = null) => {
    setQqError('');
    if (item) {
      setQqForm({ question: item.question, sort_order: item.sort_order, is_active: item.is_active });
      setQqEditId(item.id);
    } else {
      setQqForm({ ...EMPTY_QQ, sort_order: qqList.length + 1 });
      setQqEditId(null);
    }
    setQqFormOpen(true);
  };

  const closeQqForm = () => { setQqFormOpen(false); setQqEditId(null); setQqError(''); };

  const saveQQ = async (e) => {
    e.preventDefault();
    if (!qqForm.question.trim()) { setQqError('Soru boş olamaz.'); return; }
    setQqSaving(true);
    setQqError('');
    const payload = {
      question: qqForm.question.trim(),
      sort_order: Number(qqForm.sort_order) || 0,
      is_active: qqForm.is_active,
    };
    let error;
    if (qqEditId) {
      ({ error } = await supabase.from('chatbot_quick_questions').update(payload).eq('id', qqEditId));
    } else {
      ({ error } = await supabase.from('chatbot_quick_questions').insert(payload));
    }
    if (error) { setQqError('Kayıt başarısız: ' + error.message); }
    else { closeQqForm(); fetchQQ(); }
    setQqSaving(false);
  };

  const toggleQqActive = async (item) => {
    await supabase.from('chatbot_quick_questions').update({ is_active: !item.is_active }).eq('id', item.id);
    fetchQQ();
  };

  /* ── Filtrelenmiş Q&A ─────────────────────────────────────── */
  const filteredQA = qaList.filter((qa) => {
    const term = qaSearch.toLocaleLowerCase('tr');
    if (!term) return true;
    return (
      (qa.keywords || []).some((k) => k.includes(term)) ||
      qa.answer.toLocaleLowerCase('tr').includes(term)
    );
  });

  /* ── Erişim bekle ─────────────────────────────────────────── */
  if (!sessionChecked) return null;

  if (accessDenied) {
    return (
      <>
        <SharedHeader />
        <div className="act-page">
          <div className="act-main">
            <div className="act-access-denied">
              <span className="material-symbols-outlined" style={{ fontSize: 48, color: '#ef4444' }}>block</span>
              <h2>Erişim Reddedildi</h2>
              <p>Bu sayfaya erişim yetkiniz bulunmamaktadır.</p>
              <button onClick={() => navigate('/')} className="act-btn act-btn-primary">Ana Sayfaya Dön</button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SharedHeader />
      <div className="act-page">
        <div className="act-main">

          {/* Hero */}
          <div className="act-hero">
            <div>
              <h1>Chatbot Eğitimi</h1>
              <p>Asistanın cevaplarını ve hızlı sorularını buradan yönetin. Değişiklikler anında uygulanır.</p>
            </div>
            <div className="act-hero-stats">
              <div className="act-hero-stat">
                <span className="act-hero-stat-num">{qaList.filter(q => q.is_active).length}</span>
                <span className="act-hero-stat-label">Aktif Cevap</span>
              </div>
              <div className="act-hero-stat">
                <span className="act-hero-stat-num">{qqList.filter(q => q.is_active).length}</span>
                <span className="act-hero-stat-label">Hızlı Soru</span>
              </div>
            </div>
          </div>

          {/* Sekmeler */}
          <div className="act-tabs">
            <button
              className={`act-tab ${tab === 'qa' ? 'act-tab--active' : ''}`}
              onClick={() => setTab('qa')}
            >
              <span className="material-symbols-outlined">quiz</span>
              Soru &amp; Cevaplar
              <span className="act-tab-badge">{qaList.length}</span>
            </button>
            <button
              className={`act-tab ${tab === 'quick' ? 'act-tab--active' : ''}`}
              onClick={() => setTab('quick')}
            >
              <span className="material-symbols-outlined">bolt</span>
              Hızlı Sorular
              <span className="act-tab-badge">{qqList.length}</span>
            </button>
          </div>

          {/* ══ Q&A Sekmesi ══ */}
          {tab === 'qa' && (
            <div className="act-section">
              {/* Toolbar */}
              <div className="act-toolbar">
                <div className="act-search-wrap">
                  <span className="material-symbols-outlined">search</span>
                  <input
                    className="act-search-input"
                    placeholder="Anahtar kelime veya cevap ara..."
                    value={qaSearch}
                    onChange={(e) => setQaSearch(e.target.value)}
                  />
                  {qaSearch && (
                    <button className="act-search-clear" onClick={() => setQaSearch('')}>
                      <span className="material-symbols-outlined">close</span>
                    </button>
                  )}
                </div>
                <button className="act-btn act-btn-primary" onClick={() => openQaForm()}>
                  <span className="material-symbols-outlined">add</span>
                  Yeni Cevap Ekle
                </button>
              </div>

              {/* Form */}
              {qaFormOpen && (
                <div className="act-form-card">
                  <div className="act-form-header">
                    <span className="material-symbols-outlined">{qaEditId ? 'edit' : 'add_circle'}</span>
                    <h3>{qaEditId ? 'Cevap Düzenle' : 'Yeni Cevap Ekle'}</h3>
                    <button className="act-form-close" onClick={closeQaForm}>
                      <span className="material-symbols-outlined">close</span>
                    </button>
                  </div>
                  <form onSubmit={saveQA} className="act-form">
                    <div className="act-field">
                      <label>
                        Anahtar Kelimeler
                        <span className="act-field-hint">Virgülle ayırın — kullanıcı bu kelimeleri yazdığında tetiklenir</span>
                      </label>
                      <input
                        className="act-input"
                        placeholder="örn: ihale, oluştur, ilan ver, yeni ihale"
                        value={qaForm.keywords}
                        onChange={(e) => setQaForm({ ...qaForm, keywords: e.target.value })}
                      />
                    </div>
                    <div className="act-field">
                      <label>
                        Cevap
                        <span className="act-field-hint">Düz metin veya aşağıdaki link ekleyicisini kullanın</span>
                      </label>
                      {/* Link ekleyici */}
                      <div className="act-link-inserter">
                        <span className="material-symbols-outlined act-link-inserter-icon">link</span>
                        <select
                          className="act-select"
                          value={linkPage}
                          onChange={(e) => {
                            setLinkPage(e.target.value);
                            if (!linkText) {
                              const pg = SITE_PAGES.find((p) => p.path === e.target.value);
                              if (pg) setLinkText(pg.label);
                            }
                          }}
                        >
                          <option value="">— Sayfa seçin —</option>
                          {SITE_PAGES.map((p) => (
                            <option key={p.path} value={p.path}>{p.label} ({p.path})</option>
                          ))}
                        </select>
                        <input
                          className="act-input act-link-text"
                          placeholder="Link metni"
                          value={linkText}
                          onChange={(e) => setLinkText(e.target.value)}
                        />
                        <button
                          type="button"
                          className="act-btn act-btn-insert"
                          onClick={insertLink}
                          disabled={!linkPage}
                          title="Cevaba ekle"
                        >
                          <span className="material-symbols-outlined">add_link</span>
                          Ekle
                        </button>
                      </div>
                      <textarea
                        ref={answerRef}
                        className="act-textarea"
                        rows={5}
                        placeholder="Kullanıcıya gösterilecek cevabı yazın..."
                        value={qaForm.answer}
                        onChange={(e) => setQaForm({ ...qaForm, answer: e.target.value })}
                      />
                      {/* Önizleme */}
                      {qaForm.answer && (
                        <div className="act-preview">
                          <span className="act-preview-label">Önizleme</span>
                          <div
                            className="act-preview-content"
                            dangerouslySetInnerHTML={{ __html: qaForm.answer }}
                          />
                        </div>
                      )}
                    </div>
                    <label className="act-toggle-row">
                      <span>Aktif</span>
                      <input
                        type="checkbox"
                        className="act-toggle"
                        checked={qaForm.is_active}
                        onChange={(e) => setQaForm({ ...qaForm, is_active: e.target.checked })}
                      />
                    </label>
                    {qaError && <div className="act-error">{qaError}</div>}
                    <div className="act-form-actions">
                      <button type="button" className="act-btn act-btn-outline" onClick={closeQaForm}>İptal</button>
                      <button type="submit" className="act-btn act-btn-primary" disabled={qaSaving}>
                        {qaSaving ? 'Kaydediliyor...' : (qaEditId ? 'Güncelle' : 'Ekle')}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Liste */}
              {qaLoading ? (
                <div className="act-loading"><div className="act-spinner" /><p>Yükleniyor...</p></div>
              ) : filteredQA.length === 0 ? (
                <div className="act-empty">
                  <span className="material-symbols-outlined">search_off</span>
                  <p>{qaSearch ? 'Arama sonucu bulunamadı.' : 'Henüz cevap eklenmemiş.'}</p>
                </div>
              ) : (
                <div className="act-qa-list">
                  {filteredQA.map((qa) => (
                    <div key={qa.id} className={`act-qa-card ${!qa.is_active ? 'act-qa-card--inactive' : ''}`}>
                      <div className="act-qa-top">
                        <div className="act-qa-keywords">
                          {(qa.keywords || []).map((kw) => (
                            <span key={kw} className="act-keyword">{kw}</span>
                          ))}
                        </div>
                        <div className="act-qa-actions">
                          <button
                            className={`act-toggle-btn ${qa.is_active ? 'act-toggle-btn--on' : 'act-toggle-btn--off'}`}
                            onClick={() => toggleQaActive(qa)}
                            title={qa.is_active ? 'Pasife Al' : 'Aktife Al'}
                          >
                            <span className="material-symbols-outlined">
                              {qa.is_active ? 'toggle_on' : 'toggle_off'}
                            </span>
                          </button>
                          <button className="act-icon-btn act-icon-btn--edit" onClick={() => openQaForm(qa)} title="Düzenle">
                            <span className="material-symbols-outlined">edit</span>
                          </button>
                          <button className="act-icon-btn act-icon-btn--delete" onClick={() => confirmDelete('qa', qa.id)} title="Sil">
                            <span className="material-symbols-outlined">delete</span>
                          </button>
                        </div>
                      </div>
                      <div
                        className="act-qa-answer"
                        dangerouslySetInnerHTML={{ __html: qa.answer }}
                      />
                      {!qa.is_active && <span className="act-inactive-badge">Pasif</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ══ Hızlı Sorular Sekmesi ══ */}
          {tab === 'quick' && (
            <div className="act-section">
              <div className="act-toolbar">
                <p className="act-info-text">
                  <span className="material-symbols-outlined">info</span>
                  Chatbot penceresinde hızlı buton olarak görünen sorular. Sıra numarasına göre sıralanır.
                </p>
                <button className="act-btn act-btn-primary" onClick={() => openQqForm()}>
                  <span className="material-symbols-outlined">add</span>
                  Yeni Soru Ekle
                </button>
              </div>

              {/* Form */}
              {qqFormOpen && (
                <div className="act-form-card">
                  <div className="act-form-header">
                    <span className="material-symbols-outlined">{qqEditId ? 'edit' : 'add_circle'}</span>
                    <h3>{qqEditId ? 'Soruyu Düzenle' : 'Yeni Hızlı Soru Ekle'}</h3>
                    <button className="act-form-close" onClick={closeQqForm}>
                      <span className="material-symbols-outlined">close</span>
                    </button>
                  </div>
                  <form onSubmit={saveQQ} className="act-form">
                    <div className="act-field">
                      <label>Soru Metni</label>
                      <input
                        className="act-input"
                        placeholder="örn: Nasıl kayıt olabilirim?"
                        value={qqForm.question}
                        onChange={(e) => setQqForm({ ...qqForm, question: e.target.value })}
                      />
                    </div>
                    <div className="act-field">
                      <label>
                        Sıra No
                        <span className="act-field-hint">Küçük numara önce gösterilir</span>
                      </label>
                      <input
                        type="number"
                        className="act-input act-input--sm"
                        min="0"
                        value={qqForm.sort_order}
                        onChange={(e) => setQqForm({ ...qqForm, sort_order: e.target.value })}
                      />
                    </div>
                    <label className="act-toggle-row">
                      <span>Aktif</span>
                      <input
                        type="checkbox"
                        className="act-toggle"
                        checked={qqForm.is_active}
                        onChange={(e) => setQqForm({ ...qqForm, is_active: e.target.checked })}
                      />
                    </label>
                    {qqError && <div className="act-error">{qqError}</div>}
                    <div className="act-form-actions">
                      <button type="button" className="act-btn act-btn-outline" onClick={closeQqForm}>İptal</button>
                      <button type="submit" className="act-btn act-btn-primary" disabled={qqSaving}>
                        {qqSaving ? 'Kaydediliyor...' : (qqEditId ? 'Güncelle' : 'Ekle')}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Liste */}
              {qqLoading ? (
                <div className="act-loading"><div className="act-spinner" /><p>Yükleniyor...</p></div>
              ) : qqList.length === 0 ? (
                <div className="act-empty">
                  <span className="material-symbols-outlined">bolt_off</span>
                  <p>Henüz hızlı soru eklenmemiş.</p>
                </div>
              ) : (
                <div className="act-qq-list">
                  {qqList.map((qq) => (
                    <div key={qq.id} className={`act-qq-card ${!qq.is_active ? 'act-qq-card--inactive' : ''}`}>
                      <span className="act-qq-order">#{qq.sort_order}</span>
                      <span className="act-qq-text">{qq.question}</span>
                      {!qq.is_active && <span className="act-inactive-badge">Pasif</span>}
                      <div className="act-qq-actions">
                        <button
                          className={`act-toggle-btn ${qq.is_active ? 'act-toggle-btn--on' : 'act-toggle-btn--off'}`}
                          onClick={() => toggleQqActive(qq)}
                          title={qq.is_active ? 'Pasife Al' : 'Aktife Al'}
                        >
                          <span className="material-symbols-outlined">
                            {qq.is_active ? 'toggle_on' : 'toggle_off'}
                          </span>
                        </button>
                        <button className="act-icon-btn act-icon-btn--edit" onClick={() => openQqForm(qq)} title="Düzenle">
                          <span className="material-symbols-outlined">edit</span>
                        </button>
                        <button className="act-icon-btn act-icon-btn--delete" onClick={() => confirmDelete('qq', qq.id)} title="Sil">
                          <span className="material-symbols-outlined">delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* Silme Onay Modalı */}
      {deleteTarget && (
        <div className="act-modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="act-modal" onClick={(e) => e.stopPropagation()}>
            <span className="material-symbols-outlined act-modal-icon">warning</span>
            <h3>Silmek istediğinize emin misiniz?</h3>
            <p>Bu işlem geri alınamaz.</p>
            <div className="act-modal-actions">
              <button className="act-btn act-btn-outline" onClick={() => setDeleteTarget(null)}>İptal</button>
              <button className="act-btn act-btn-danger" onClick={executeDelete}>Evet, Sil</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminChatbotTraining;
