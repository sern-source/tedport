/* Enes Doğanay | 2 Mayıs 2026: Admin — Mesaj Şikayetleri yönetim paneli */
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SharedHeader from './SharedHeader';
import './SharedHeader.css';
import './AdminContactMessages.css';
import { supabase } from './supabaseClient';
import { isAdminEmail } from './adminAccess';
import { resolveIsAdminUser } from './corporateApplicationsApi';

/* Enes Doğanay | 2 Mayıs 2026: Şikayet durum meta */
const DURUM_META = {
  bekliyor:   { label: 'Bekliyor',   className: 'acm-status--new',     icon: 'hourglass_top' },
  incelendi:  { label: 'İncelendi',  className: 'acm-status--read',    icon: 'search' },
  kapatildi:  { label: 'Kapatıldı', className: 'acm-status--archived', icon: 'lock' },
};

/* Enes Doğanay | 2 Mayıs 2026: Şikayet neden etiketleri */
const NEDEN_LABEL = {
  spam:      'Spam / İstenmeyen Mesaj',
  hakaret:   'Hakaret / İltihap',
  tehdit:    'Tehdit / Taciz',
  yaniltici: 'Yanıltıcı / Sahte Teklif',
  diger:     'Diğer',
};

/* Enes Doğanay | 2 Mayıs 2026: Kaynak etiketleri */
const KAYNAK_LABEL = {
  teklif_talebi: 'Teklif Talebi Chat',
  ihale_teklifi: 'İhale Teklifi Chat',
};

const formatDate = (val) => {
  if (!val) return '—';
  const d = new Date(val);
  return `${d.toLocaleDateString('tr-TR')} • ${d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}`;
};

const AdminMesajSikayetleri = () => {
  const navigate = useNavigate();
  const [sessionChecked, setSessionChecked] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState([]);
  const [durumFilter, setDurumFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [adminNotEdit, setAdminNotEdit] = useState({}); // id → text being edited

  /* Enes Doğanay | 2 Mayıs 2026: Admin yetki kontrolü */
  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { navigate('/login'); return; }
      if (!(await resolveIsAdminUser(session.user.email, isAdminEmail))) {
        setAccessDenied(true);
        setLoading(false);
        setSessionChecked(true);
        return;
      }
      setSessionChecked(true);
      fetchReports();
    };
    checkAdmin();
  }, []);

  /* Enes Doğanay | 2 Mayıs 2026: Şikayetleri çek + reporter & sender profil zenginleştirme */
  const fetchReports = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('mesaj_sikayetleri')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) { console.error('mesaj_sikayetleri fetch error:', error); setLoading(false); return; }
    if (!data) { setLoading(false); return; }

    // --- Reporter profilleri ---
    const reporterIds = [...new Set(data.map(r => r.reporter_id).filter(Boolean))];
    const { data: reporterProfiles } = reporterIds.length
      ? await supabase.from('profiles').select('id, first_name, last_name, email').in('id', reporterIds)
      : { data: [] };
    const reporterMap = {};
    (reporterProfiles || []).forEach(p => { reporterMap[p.id] = p; });

    // --- Reporter'ların kurumsal firma bilgisi ---
    const reporterFirmaMap = {}; // reporter user_id → firma_adi
    if (reporterIds.length) {
      const { data: repYoneticiler } = await supabase
        .from('kurumsal_firma_yoneticileri')
        .select('user_id, firma_id')
        .in('user_id', reporterIds);
      const repFirmaIds = (repYoneticiler || []).map(y => y.firma_id).filter(Boolean);
      if (repFirmaIds.length) {
        const { data: repFirmalar } = await supabase
          .from('firmalar')
          .select('firmaID, firma_adi')
          .in('firmaID', repFirmaIds);
        const repFirmaIdMap = {};
        (repFirmalar || []).forEach(f => { repFirmaIdMap[f.firmaID] = f.firma_adi; });
        (repYoneticiler || []).forEach(y => { reporterFirmaMap[y.user_id] = repFirmaIdMap[y.firma_id] || null; });
      }
    }

    // --- Mesaj gönderen (sender) bilgisi ---
    const ihaleMesajIds = data.filter(r => r.kaynak === 'ihale_teklifi' && r.mesaj_id).map(r => r.mesaj_id);
    const teklifMesajIds = data.filter(r => r.kaynak === 'teklif_talebi' && r.mesaj_id).map(r => r.mesaj_id);

    const senderMap = {}; // mesaj_id → { sender_id, sender_role, teklif_id }

    if (ihaleMesajIds.length) {
      const { data: msgs } = await supabase
        .from('ihale_teklif_mesajlari')
        .select('id, sender_id, sender_role, teklif_id')
        .in('id', ihaleMesajIds);
      (msgs || []).forEach(m => { senderMap[m.id] = { sender_id: m.sender_id, sender_role: m.sender_role, teklif_id: m.teklif_id, kaynak: 'ihale_teklifi' }; });
    }
    if (teklifMesajIds.length) {
      const { data: msgs } = await supabase
        .from('teklif_mesajlari')
        .select('id, sender_id, sender_role, teklif_id')
        .in('id', teklifMesajIds);
      (msgs || []).forEach(m => { senderMap[m.id] = { sender_id: m.sender_id, sender_role: m.sender_role, teklif_id: m.teklif_id, kaynak: 'teklif_talebi' }; });
    }

    // --- Sender profilleri (user/bidder için) ---
    const senderUserIds = [...new Set(Object.values(senderMap).map(s => s.sender_id).filter(Boolean))];
    const { data: senderProfiles } = senderUserIds.length
      ? await supabase.from('profiles').select('id, first_name, last_name, email').in('id', senderUserIds)
      : { data: [] };
    const senderProfileMap = {};
    (senderProfiles || []).forEach(p => { senderProfileMap[p.id] = p; });

    // --- Firma isimleri (company rolü için) ---
    const companyUserIds = [...new Set(
      Object.values(senderMap)
        .filter(s => s.sender_role === 'company' && s.sender_id)
        .map(s => s.sender_id)
    )];
    const firmaMap = {}; // user_id → firma_adi
    if (companyUserIds.length) {
      const { data: yoneticiler } = await supabase
        .from('kurumsal_firma_yoneticileri')
        .select('user_id, firma_id')
        .in('user_id', companyUserIds);
      const firmaIds = (yoneticiler || []).map(y => y.firma_id).filter(Boolean);
      if (firmaIds.length) {
        const { data: firmalar } = await supabase
          .from('firmalar')
          .select('firmaID, firma_adi')
          .in('firmaID', firmaIds);
        const firmaIdMap = {};
        (firmalar || []).forEach(f => { firmaIdMap[f.firmaID] = f.firma_adi; });
        (yoneticiler || []).forEach(y => { firmaMap[y.user_id] = firmaIdMap[y.firma_id] || null; });
      }
    }

    // --- ihale_teklifi bidder: gonderen_firma_adi ---
    const bidderTeklifIds = [...new Set(
      Object.values(senderMap)
        .filter(s => s.sender_role === 'bidder' && s.teklif_id)
        .map(s => s.teklif_id)
    )];
    const bidderFirmaMap = {}; // teklif_id → gonderen_firma_adi || gonderen_ad_soyad
    if (bidderTeklifIds.length) {
      const { data: teklifler } = await supabase
        .from('ihale_teklifleri')
        .select('id, gonderen_firma_adi, gonderen_ad_soyad')
        .in('id', bidderTeklifIds);
      (teklifler || []).forEach(t => { bidderFirmaMap[t.id] = t.gonderen_firma_adi || t.gonderen_ad_soyad || null; });
    }

    // --- Zenginleştir ---
    const enriched = data.map(r => {
      const reporter = reporterMap[r.reporter_id] || null;
      const senderInfo = senderMap[r.mesaj_id] || null;
      let senderLabel = null;
      if (senderInfo) {
        if (senderInfo.sender_role === 'company') {
          senderLabel = firmaMap[senderInfo.sender_id] || null;
          if (!senderLabel) {
            const p = senderProfileMap[senderInfo.sender_id];
            if (p) senderLabel = `${p.first_name || ''} ${p.last_name || ''}`.trim() || p.email || null;
          }
        } else {
          // bidder (ihale) veya user (teklif_talebi)
          if (senderInfo.sender_role === 'bidder' && senderInfo.teklif_id) {
            senderLabel = bidderFirmaMap[senderInfo.teklif_id] || null;
          }
          if (!senderLabel) {
            const p = senderProfileMap[senderInfo.sender_id];
            if (p) senderLabel = `${p.first_name || ''} ${p.last_name || ''}`.trim() || p.email || null;
          }
        }
      }
      return {
        ...r,
        _reporter: reporter,
        _reporter_firma: reporterFirmaMap[r.reporter_id] || null,
        _sender_role: senderInfo?.sender_role || null,
        _sender_label: senderLabel,
        _sender_id: senderInfo?.sender_id || null,
      };
    });

    setReports(enriched);
    setLoading(false);
  };

  /* Enes Doğanay | 2 Mayıs 2026: Durum güncelle */
  const updateDurum = async (id, newDurum) => {
    setActionLoadingId(id);
    const { error } = await supabase
      .from('mesaj_sikayetleri')
      .update({ durum: newDurum })
      .eq('id', id);
    if (!error) {
      setReports(prev => prev.map(r => r.id === id ? { ...r, durum: newDurum } : r));
    }
    setActionLoadingId(null);
  };

  /* Enes Doğanay | 2 Mayıs 2026: Admin notu kaydet */
  const saveAdminNot = async (id) => {
    const not = adminNotEdit[id] ?? '';
    setActionLoadingId(id);
    const { error } = await supabase
      .from('mesaj_sikayetleri')
      .update({ admin_notu: not.trim() || null })
      .eq('id', id);
    if (!error) {
      setReports(prev => prev.map(r => r.id === id ? { ...r, admin_notu: not.trim() || null } : r));
      setAdminNotEdit(prev => { const n = { ...prev }; delete n[id]; return n; });
    }
    setActionLoadingId(null);
  };

  /* Enes Doğanay | 2 Mayıs 2026: Şikayet sil */
  const deleteReport = async (id) => {
    if (!window.confirm('Bu şikayeti silmek istediğinize emin misiniz?')) return;
    setActionLoadingId(id);
    const { error } = await supabase.from('mesaj_sikayetleri').delete().eq('id', id);
    if (!error) {
      setReports(prev => prev.filter(r => r.id !== id));
      if (expandedId === id) setExpandedId(null);
    }
    setActionLoadingId(null);
  };

  /* Enes Doğanay | 2 Mayıs 2026: Filtreleme */
  const filtered = reports.filter(r => {
    const matchDurum = durumFilter === 'all' || r.durum === durumFilter;
    const term = searchTerm.toLocaleLowerCase('tr-TR');
    const matchSearch = !term ||
      (r.mesaj_icerik || '').toLocaleLowerCase('tr-TR').includes(term) ||
      (r.aciklama || '').toLocaleLowerCase('tr-TR').includes(term) ||
      (r.neden || '').toLocaleLowerCase('tr-TR').includes(term) ||
      (r.reporter_id || '').toLocaleLowerCase('tr-TR').includes(term) ||
      ((r._reporter ? `${r._reporter.first_name || ''} ${r._reporter.last_name || ''} ${r._reporter.email || ''}` : '')).toLocaleLowerCase('tr-TR').includes(term) ||
      ((r._sender_label || '')).toLocaleLowerCase('tr-TR').includes(term);
    return matchDurum && matchSearch;
  });

  const counts = {
    all:       reports.length,
    bekliyor:  reports.filter(r => r.durum === 'bekliyor').length,
    incelendi: reports.filter(r => r.durum === 'incelendi').length,
    kapatildi: reports.filter(r => r.durum === 'kapatildi').length,
  };

  if (!sessionChecked) return null;

  if (accessDenied) {
    return (
      <>
        <SharedHeader />
        <div className="acm-page">
          <div className="acm-main">
            <div className="acm-access-denied">
              <span className="material-symbols-outlined" style={{ fontSize: 48, color: '#ef4444' }}>block</span>
              <h2>Erişim Reddedildi</h2>
              <p>Bu sayfaya erişim yetkiniz bulunmamaktadır.</p>
              <button onClick={() => navigate('/')} className="acm-btn-primary">Ana Sayfaya Dön</button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SharedHeader />
      <div className="acm-page">
        <div className="acm-main">

          {/* Hero */}
          <div className="acm-hero">
            <div>
              <h1>Mesaj Şikayetleri</h1>
              <p>Kullanıcıların mesajlaşma kanallarında şikayet ettiği içerikleri inceleyin ve yönetin.</p>
            </div>
            <div className="acm-hero-badge">
              <span className="material-symbols-outlined">flag</span>
              {counts.bekliyor} bekliyor
            </div>
          </div>

          {/* Stats */}
          <div className="acm-stats">
            {[
              { key: 'all',       icon: 'inbox',          label: 'Toplam',    color: '#64748b' },
              { key: 'bekliyor',  icon: 'hourglass_top',  label: 'Bekliyor',  color: '#ef4444' },
              { key: 'incelendi', icon: 'search',         label: 'İncelendi', color: '#f59e0b' },
              { key: 'kapatildi', icon: 'lock',           label: 'Kapatıldı', color: '#10b981' },
            ].map(s => (
              <button
                key={s.key}
                className={`acm-stat-card ${durumFilter === s.key ? 'acm-stat-card--active' : ''}`}
                onClick={() => setDurumFilter(s.key)}
                type="button"
              >
                <span className="material-symbols-outlined" style={{ color: s.color }}>{s.icon}</span>
                <span className="acm-stat-num">{counts[s.key]}</span>
                <span className="acm-stat-label">{s.label}</span>
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="acm-search-wrap">
            <span className="material-symbols-outlined">search</span>
            <input
              type="text"
              placeholder="Mesaj içeriği, açıklama veya neden ara..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="acm-search-input"
            />
            {searchTerm && (
              <button type="button" className="acm-search-clear" onClick={() => setSearchTerm('')}>
                <span className="material-symbols-outlined">close</span>
              </button>
            )}
          </div>

          {/* List */}
          {loading ? (
            <div className="acm-loading">
              <div className="acm-spinner"></div>
              <p>Şikayetler yükleniyor...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="acm-empty">
              <span className="material-symbols-outlined" style={{ fontSize: 48, color: '#cbd5e1' }}>flag</span>
              <p>Şikayet bulunamadı.</p>
            </div>
          ) : (
            <div className="acm-list">
              {filtered.map(report => {
                const meta = DURUM_META[report.durum] || DURUM_META.bekliyor;
                const isExpanded = expandedId === report.id;
                const isLoading = actionLoadingId === report.id;
                const notDraft = adminNotEdit[report.id] ?? report.admin_notu ?? '';

                return (
                  <div
                    key={report.id}
                    className={`acm-card ${isExpanded ? 'acm-card--expanded' : ''} ${report.durum === 'bekliyor' ? 'acm-card--unread' : ''}`}
                  >
                    {/* Header */}
                    <button
                      type="button"
                      className="acm-card-header"
                      onClick={() => setExpandedId(isExpanded ? null : report.id)}
                    >
                      <div className="acm-card-header-left">
                        <span className="material-symbols-outlined acm-card-icon" style={{ color: '#ef4444' }}>flag</span>
                        <div className="acm-card-meta">
                          <span className="acm-card-name">
                            <strong>{NEDEN_LABEL[report.neden] || report.neden}</strong>
                          </span>
                          <span className="acm-card-subject">
                            <span className="ams-kaynak-badge">{KAYNAK_LABEL[report.kaynak] || report.kaynak}</span>
                            {' — '}
                            {report.mesaj_icerik
                              ? (report.mesaj_icerik.length > 80 ? report.mesaj_icerik.slice(0, 80) + '…' : report.mesaj_icerik)
                              : '(mesaj içeriği yok)'}
                          </span>
                        </div>
                      </div>
                      <div className="acm-card-header-right">
                        <span className={`acm-status-badge ${meta.className}`}>{meta.label}</span>
                        <span className="acm-card-date">{formatDate(report.created_at)}</span>
                        <span className={`acm-chevron material-symbols-outlined ${isExpanded ? 'acm-chevron--open' : ''}`}>
                          expand_more
                        </span>
                      </div>
                    </button>

                    {/* Body */}
                    {isExpanded && (
                      <div className="acm-card-body">

                        {/* Şikayet edilen mesaj */}
                        <div className="acm-field">
                          <span className="acm-field-label">Şikayet Edilen Mesaj</span>
                          <div className="acm-field-value acm-field-value--block acm-report-msg-preview">
                            {report.mesaj_icerik || '—'}
                          </div>
                        </div>

                        {/* Şikayet eden + Şikayet edilen */}
                        <div className="acm-field-row">
                          <div className="acm-field">
                            <span className="acm-field-label">Şikayet Eden</span>
                            {report._reporter ? (
                              <span className="acm-field-value">
                                <strong>{`${report._reporter.first_name || ''} ${report._reporter.last_name || ''}`.trim() || '(isimsiz)'}</strong>
                                {report._reporter_firma ? (
                                  <span style={{ marginLeft: 6, fontSize: '0.78rem', background: '#dbeafe', color: '#1d4ed8', padding: '1px 7px', borderRadius: 6, fontWeight: 600 }}>Kurumsal</span>
                                ) : (
                                  <span style={{ marginLeft: 6, fontSize: '0.78rem', background: '#f1f5f9', color: '#475569', padding: '1px 7px', borderRadius: 6 }}>Bireysel</span>
                                )}
                                {report._reporter_firma && (
                                  <span style={{ display: 'block', fontSize: '0.8rem', color: '#1d4ed8', marginTop: 2 }}>{report._reporter_firma}</span>
                                )}
                                {report._reporter.email && <span style={{ color: '#64748b', display: 'block', fontSize: '0.8rem', marginTop: 1 }}>{report._reporter.email}</span>}
                                <span style={{ display: 'block', fontSize: '0.72rem', color: '#94a3b8', fontFamily: 'monospace', marginTop: 2 }}>{report.reporter_id}</span>
                              </span>
                            ) : (
                              <span className="acm-field-value" style={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>{report.reporter_id}</span>
                            )}
                          </div>
                          <div className="acm-field">
                            <span className="acm-field-label">Şikayet Edilen Mesajın Sahibi</span>
                            {report._sender_label ? (
                              <span className="acm-field-value">
                                <strong>{report._sender_label}</strong>
                                {report._sender_role && <span style={{ marginLeft: 6, fontSize: '0.78rem', background: '#f1f5f9', padding: '1px 6px', borderRadius: 6, color: '#475569' }}>{report._sender_role}</span>}
                                {report._sender_id && <span style={{ display: 'block', fontSize: '0.72rem', color: '#94a3b8', fontFamily: 'monospace', marginTop: 2 }}>{report._sender_id}</span>}
                              </span>
                            ) : (
                              <span className="acm-field-value" style={{ color: '#94a3b8', fontSize: '0.82rem' }}>
                                {report._sender_id
                                  ? <span style={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>{report._sender_id}</span>
                                  : '(mesaj bulunamadı)'}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Meta bilgiler */}
                        <div className="acm-field-row">
                          <div className="acm-field">
                            <span className="acm-field-label">Neden</span>
                            <span className="acm-field-value">{NEDEN_LABEL[report.neden] || report.neden}</span>
                          </div>
                          <div className="acm-field">
                            <span className="acm-field-label">Kaynak</span>
                            <span className="acm-field-value">{KAYNAK_LABEL[report.kaynak] || report.kaynak}</span>
                          </div>
                          <div className="acm-field">
                            <span className="acm-field-label">Mesaj ID</span>
                            <span className="acm-field-value" style={{ fontSize: '0.78rem', fontFamily: 'monospace' }}>{report.mesaj_id}</span>
                          </div>
                        </div>

                        {/* Kullanıcı açıklaması */}
                        {report.aciklama && (
                          <div className="acm-field">
                            <span className="acm-field-label">Kullanıcı Açıklaması</span>
                            <div className="acm-field-value acm-field-value--block">{report.aciklama}</div>
                          </div>
                        )}

                        {/* Admin notu */}
                        <div className="acm-field">
                          <span className="acm-field-label">Admin Notu</span>
                          <textarea
                            className="acm-admin-note-input"
                            value={notDraft}
                            onChange={e => setAdminNotEdit(prev => ({ ...prev, [report.id]: e.target.value }))}
                            placeholder="İnceleme notu ekleyin..."
                            rows={2}
                          />
                          {adminNotEdit[report.id] !== undefined && adminNotEdit[report.id] !== (report.admin_notu || '') && (
                            <button
                              type="button"
                              className="acm-save-note-btn"
                              onClick={() => saveAdminNot(report.id)}
                              disabled={isLoading}
                            >
                              <span className="material-symbols-outlined">save</span>
                              Notu Kaydet
                            </button>
                          )}
                        </div>

                        {/* Durum değiştir */}
                        <div className="acm-field">
                          <span className="acm-field-label">Durum Değiştir</span>
                          <div className="acm-actions">
                            {report.durum !== 'incelendi' && (
                              <button
                                type="button"
                                className="acm-action-btn acm-action-btn--read"
                                onClick={() => updateDurum(report.id, 'incelendi')}
                                disabled={isLoading}
                              >
                                <span className="material-symbols-outlined">search</span>
                                İncelendi İşaretle
                              </button>
                            )}
                            {report.durum !== 'kapatildi' && (
                              <button
                                type="button"
                                className="acm-action-btn acm-action-btn--archive"
                                onClick={() => updateDurum(report.id, 'kapatildi')}
                                disabled={isLoading}
                              >
                                <span className="material-symbols-outlined">lock</span>
                                Kapat
                              </button>
                            )}
                            {report.durum !== 'bekliyor' && (
                              <button
                                type="button"
                                className="acm-action-btn"
                                onClick={() => updateDurum(report.id, 'bekliyor')}
                                disabled={isLoading}
                              >
                                <span className="material-symbols-outlined">refresh</span>
                                Bekleyene Al
                              </button>
                            )}
                            <button
                              type="button"
                              className="acm-action-btn acm-action-btn--delete"
                              onClick={() => deleteReport(report.id)}
                              disabled={isLoading}
                            >
                              <span className="material-symbols-outlined">delete</span>
                              Şikayeti Sil
                            </button>
                          </div>
                        </div>

                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </div>
    </>
  );
};

export default AdminMesajSikayetleri;
