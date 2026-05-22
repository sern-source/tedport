/* Enes Doğanay | 2 Mayıs 2026: Admin Onay Merkezi — etiket ve logo onay/red yönetimi */
'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../supabaseClient';
import { isAdminEmail } from './adminAccess';
import { resolveIsAdminUser } from '../../services/corporateApplicationsApi';
// Enes Doğanay | 12 Mayıs 2026: Sertifika servis fonksiyonları
import { fetchSertifikaTalepleri, approveSertifikaTalebi, rejectSertifikaTalebi } from '../../services/sertifikaService';
// Enes Doğanay | 12 Mayıs 2026: Sertifika türü renk meta
import { SERTIFIKA_META } from '../../constants/sertifikaConstants';
import PageLoader from '../../components/PageLoader';
import './AdminEtiketOnay.css';

const TABS = [
  { key: 'etiket',     label: 'Etiket Talepleri',     icon: 'label'              },
  { key: 'logo',       label: 'Logo Talepleri',         icon: 'image'              },
  // Enes Doğanay | 12 Mayıs 2026: Sertifika talepleri onay tabı
  { key: 'sertifika',  label: 'Sertifika Talepleri',   icon: 'workspace_premium'  },
];

export default function AdminEtiketOnay() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);

  // ── Etiket talepleri state ──
  const [etiketler, setEtiketler]     = useState([]);
  const [etiketLoad, setEtiketLoad]   = useState(true);

  // ── Logo talepleri state ──
  const [logolar, setLogolar]         = useState([]);
  const [logoLoad, setLogoLoad]       = useState(true);

  // Enes Doğanay | 12 Mayıs 2026: Sertifika talepleri state
  const [sertifikaTalepleri, setSertifikaTalepleri] = useState([]);
  const [sertifikaLoad, setSertifikaLoad]           = useState(true);
  // Geçerlilik tarihi her talep için ayrı saklanır
  const [gecerlilikTarihleri, setGecerlilikTarihleri] = useState({});

  const [tab, setTab]                 = useState('etiket');
  const [actionId, setActionId]       = useState(null); // talep id işleniyor
  const [rejectNote, setRejectNote]   = useState('');
  const [rejectTargetId, setRejectTargetId] = useState(null);
  const [rejectType, setRejectType]   = useState('etiket'); // 'etiket' | 'logo'

  // ── Admin doğrulama ──
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      resolveIsAdminUser(session?.user?.email, isAdminEmail).then(isAdmin => {
        if (!isAdmin) { router.push('/'); return; }
        setAuthChecked(true);
      });
    });
  }, []);

  // ── Etiket taleplerini çek ──
  const fetchEtiketler = useCallback(async () => {
    setEtiketLoad(true);
    const { data } = await supabase
      .from('etiket_talepleri')
      .select('id, firma_id, firma_adi, etiketler, durum, admin_notu, created_at')
      .order('created_at', { ascending: false });
    setEtiketler(data || []);
    setEtiketLoad(false);
  }, []);

  // ── Logo taleplerini çek (pending_logo_url dolu firmalar) ──
  const fetchLogolar = useCallback(async () => {
    setLogoLoad(true);
    const { data, error } = await supabase
      .from('firmalar')
      .select('firmaID, firma_adi, logo_url, pending_logo_url')
      .not('pending_logo_url', 'is', null)
      .neq('pending_logo_url', '');
    if (error) console.error('Logo talepleri yüklenemedi:', error.message);
    setLogolar(data || []);
    setLogoLoad(false);
  }, []);

  // Enes Doğanay | 12 Mayıs 2026: Sertifika taleplerini çek
  const fetchSertifikalar = useCallback(async () => {
    setSertifikaLoad(true);
    try {
      const data = await fetchSertifikaTalepleri();
      setSertifikaTalepleri(data);
    } catch (err) {
      console.error('Sertifika talepleri yüklenemedi:', err.message);
    } finally {
      setSertifikaLoad(false);
    }
  }, []);

  useEffect(() => {
    if (!authChecked) return;
    fetchEtiketler();
    fetchLogolar();
    fetchSertifikalar();
  }, [authChecked, fetchEtiketler, fetchLogolar, fetchSertifikalar]);

  if (!authChecked) return <PageLoader />;

  // ── Etiket Onayla ──
  const approveEtiket = async (talep) => {
    setActionId(talep.id);
    try {
      // 1) firma tablosundaki arama_etiketleri güncelle
      const { error: firmaErr } = await supabase
        .from('firmalar')
        .update({ arama_etiketleri: talep.etiketler })
        .eq('firmaID', talep.firma_id);
      if (firmaErr) { alert('Firma güncellenemedi: ' + firmaErr.message); return; }
      // 2) talebi onayla
      const { error: talepErr } = await supabase
        .from('etiket_talepleri')
        .update({ durum: 'onaylandi', updated_at: new Date().toISOString() })
        .eq('id', talep.id);
      if (talepErr) { alert('Talep güncellenemedi: ' + talepErr.message); return; }
      setEtiketler(prev => prev.map(t => t.id === talep.id ? { ...t, durum: 'onaylandi' } : t));
    } finally {
      setActionId(null);
    }
  };

  // ── Etiket Reddet ──
  const rejectEtiket = async () => {
    if (!rejectTargetId) return;
    setActionId(rejectTargetId);
    try {
      await supabase
        .from('etiket_talepleri')
        .update({ durum: 'reddedildi', admin_notu: rejectNote, updated_at: new Date().toISOString() })
        .eq('id', rejectTargetId);
      setEtiketler(prev => prev.map(t => t.id === rejectTargetId ? { ...t, durum: 'reddedildi', admin_notu: rejectNote } : t));
    } finally {
      setActionId(null);
      setRejectTargetId(null);
      setRejectNote('');
    }
  };

  // ── Logo Onayla ──
  const approveLogo = async (firma) => {
    setActionId(firma.firmaID);
    try {
      const { error } = await supabase
        .from('firmalar')
        .update({ logo_url: firma.pending_logo_url, pending_logo_url: null, pending_logo_red_notu: null })
        .eq('firmaID', firma.firmaID);
      if (error) { alert('Logo güncellenemedi: ' + error.message); return; }
      setLogolar(prev => prev.filter(f => f.firmaID !== firma.firmaID));
    } finally {
      setActionId(null);
    }
  };

  // ── Logo Reddet ──
  const rejectLogo = async () => {
    if (!rejectTargetId) return;
    setActionId(rejectTargetId);
    try {
      const { error } = await supabase
        .from('firmalar')
        .update({ pending_logo_url: null, pending_logo_red_notu: rejectNote || 'Logo uygun bulunmadı.' })
        .eq('firmaID', rejectTargetId);
      if (error) { alert('Logo reddedilemedi: ' + error.message); return; }
      setLogolar(prev => prev.filter(f => f.firmaID !== rejectTargetId));
    } finally {
      setActionId(null);
      setRejectTargetId(null);
      setRejectNote('');
    }
  };

  const openReject = (id, type) => {
    setRejectTargetId(id);
    setRejectType(type);
    setRejectNote('');
  };

  // Enes Doğanay | 12 Mayıs 2026: Sertifika onayla
  const approveSertifika = async (talep) => {
    setActionId(talep.id);
    try {
      await approveSertifikaTalebi(talep.id, gecerlilikTarihleri[talep.id] || null);
      setSertifikaTalepleri(prev =>
        prev.map(t => t.id === talep.id
          ? { ...t, durum: 'onaylandi', gecerlilik_tarihi: gecerlilikTarihleri[talep.id] || null }
          : t
        )
      );
    } catch (err) {
      alert('Sertifika onaylanamıyor: ' + err.message);
    } finally {
      setActionId(null);
    }
  };

  // Enes Doğanay | 12 Mayıs 2026: Sertifika reddet
  const rejectSertifika = async () => {
    if (!rejectTargetId) return;
    setActionId(rejectTargetId);
    try {
      await rejectSertifikaTalebi(rejectTargetId, rejectNote);
      setSertifikaTalepleri(prev =>
        prev.map(t => t.id === rejectTargetId
          ? { ...t, durum: 'reddedildi', admin_notu: rejectNote }
          : t
        )
      );
    } finally {
      setActionId(null);
      setRejectTargetId(null);
      setRejectNote('');
    }
  };

  const pendingEtiket = etiketler.filter(t => t.durum === 'bekliyor').length;
  const pendingLogo   = logolar.length;
  // Enes Doğanay | 12 Mayıs 2026: Bekleyen sertifika sayısı
  const pendingSertifika = sertifikaTalepleri.filter(t => t.durum === 'bekliyor').length;

  return (
    <div className="aeo-page">
      <div className="aeo-header">
        <button className="aeo-back" onClick={() => router.back()} type="button">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <span className="material-symbols-outlined aeo-header-icon">verified</span>
        <div>
          <h1>Onay Merkezi</h1>
          <p>Firma etiket talepleri ve logo değişiklik onayları</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="aeo-tabs">
        {TABS.map(t => (
          <button
            key={t.key}
            className={`aeo-tab ${tab === t.key ? 'active' : ''}`}
            onClick={() => setTab(t.key)}
            type="button"
          >
            <span className="material-symbols-outlined">{t.icon}</span>
            {t.label}
            {t.key === 'etiket'    && pendingEtiket    > 0 && (
              <span className="aeo-badge">{pendingEtiket}</span>
            )}
            {t.key === 'logo'      && pendingLogo      > 0 && (
              <span className="aeo-badge">{pendingLogo}</span>
            )}
            {t.key === 'sertifika' && pendingSertifika > 0 && (
              <span className="aeo-badge">{pendingSertifika}</span>
            )}
          </button>
        ))}
      </div>

      <div className="aeo-content">

        {/* ── ETİKET TALEPLERİ ── */}
        {tab === 'etiket' && (
          etiketLoad ? (
            <div className="aeo-loading">
              <span className="material-symbols-outlined aeo-spin">progress_activity</span>
              Yükleniyor…
            </div>
          ) : etiketler.length === 0 ? (
            <div className="aeo-empty">
              <span className="material-symbols-outlined">label_off</span>
              <p>Henüz etiket talebi yok.</p>
            </div>
          ) : (
            <div className="aeo-list">
              {etiketler.map(talep => (
                <div key={talep.id} className={`aeo-card aeo-card--${talep.durum}`}>
                  <div className="aeo-card-head">
                    <div className="aeo-card-firm">
                      <span className="material-symbols-outlined">business</span>
                      <strong>{talep.firma_adi || talep.firma_id}</strong>
                    </div>
                    <span className={`aeo-status aeo-status--${talep.durum}`}>
                      {talep.durum === 'bekliyor'   && <><span className="material-symbols-outlined">schedule</span> Bekliyor</>}
                      {talep.durum === 'onaylandi'  && <><span className="material-symbols-outlined">check_circle</span> Onaylandı</>}
                      {talep.durum === 'reddedildi' && <><span className="material-symbols-outlined">cancel</span> Reddedildi</>}
                    </span>
                  </div>

                  <div className="aeo-card-tags">
                    <span className="material-symbols-outlined">label</span>
                    <span>{talep.etiketler}</span>
                  </div>

                  {talep.admin_notu && (
                    <div className="aeo-card-note">
                      <span className="material-symbols-outlined">sticky_note_2</span>
                      {talep.admin_notu}
                    </div>
                  )}

                  <div className="aeo-card-meta">
                    {new Date(talep.created_at).toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </div>

                  {talep.durum === 'bekliyor' && (
                    <div className="aeo-card-actions">
                      <button
                        className="aeo-btn aeo-btn--approve"
                        onClick={() => approveEtiket(talep)}
                        disabled={actionId === talep.id}
                        type="button"
                      >
                        <span className="material-symbols-outlined">
                          {actionId === talep.id ? 'progress_activity' : 'check'}
                        </span>
                        Onayla
                      </button>
                      <button
                        className="aeo-btn aeo-btn--reject"
                        onClick={() => openReject(talep.id, 'etiket')}
                        disabled={!!actionId}
                        type="button"
                      >
                        <span className="material-symbols-outlined">close</span>
                        Reddet
                      </button>
                      <button
                        className="aeo-btn aeo-btn--ghost"
                        onClick={() => router.push(`/admin/firma-duzenle?firmaId=${talep.firma_id}`)}
                        type="button"
                      >
                        <span className="material-symbols-outlined">open_in_new</span>
                        Firmaya Git
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
        )}

        {/* ── LOGO TALEPLERİ ── */}
        {tab === 'logo' && (
          logoLoad ? (
            <div className="aeo-loading">
              <span className="material-symbols-outlined aeo-spin">progress_activity</span>
              Yükleniyor…
            </div>
          ) : logolar.length === 0 ? (
            <div className="aeo-empty">
              <span className="material-symbols-outlined">hide_image</span>
              <p>Onay bekleyen logo yok.</p>
            </div>
          ) : (
            <div className="aeo-list">
              {logolar.map(firma => (
                <div key={firma.firmaID} className="aeo-card aeo-card--bekliyor">
                  <div className="aeo-card-head">
                    <div className="aeo-card-firm">
                      <span className="material-symbols-outlined">business</span>
                      <strong>{firma.firma_adi}</strong>
                    </div>
                    <span className="aeo-status aeo-status--bekliyor">
                      <span className="material-symbols-outlined">schedule</span> Onay Bekliyor
                    </span>
                  </div>

                  <div className="aeo-logo-compare">
                    <div className="aeo-logo-box">
                      <p>Mevcut Logo</p>
                      {firma.logo_url?.includes('firma-logolari') ? (
                        <img src={firma.logo_url} alt="Mevcut logo" />
                      ) : (
                        <div className="aeo-logo-placeholder">
                          <span className="material-symbols-outlined">image_not_supported</span>
                          <span>Logo yok</span>
                        </div>
                      )}
                    </div>
                    <span className="material-symbols-outlined aeo-logo-arrow">arrow_forward</span>
                    <div className="aeo-logo-box aeo-logo-box--new">
                      <p>Yeni Logo (Bekliyor)</p>
                      <img src={firma.pending_logo_url} alt="Yeni logo" />
                    </div>
                  </div>

                  <div className="aeo-card-actions">
                    <button
                      className="aeo-btn aeo-btn--approve"
                      onClick={() => approveLogo(firma)}
                      disabled={actionId === firma.firmaID}
                      type="button"
                    >
                      <span className="material-symbols-outlined">
                        {actionId === firma.firmaID ? 'progress_activity' : 'check'}
                      </span>
                      Logoyu Onayla
                    </button>
                    <button
                      className="aeo-btn aeo-btn--reject"
                      onClick={() => openReject(firma.firmaID, 'logo')}
                      disabled={!!actionId}
                      type="button"
                    >
                      <span className="material-symbols-outlined">close</span>
                      Reddet
                    </button>
                    <button
                      className="aeo-btn aeo-btn--ghost"
                      onClick={() => router.push(`/admin/firma-duzenle?firmaId=${firma.firmaID}`)}
                      type="button"
                    >
                      <span className="material-symbols-outlined">open_in_new</span>
                      Firmaya Git
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* Enes Doğanay | 12 Mayıs 2026: SERTIFIKA TALEPLERI ── */}
        {tab === 'sertifika' && (
          sertifikaLoad ? (
            <div className="aeo-loading">
              <span className="material-symbols-outlined aeo-spin">progress_activity</span>
              Yükleniyor…
            </div>
          ) : sertifikaTalepleri.length === 0 ? (
            <div className="aeo-empty">
              <span className="material-symbols-outlined">workspace_premium</span>
              <p>Henüz sertifika talebi yok.</p>
            </div>
          ) : (
            <div className="aeo-list">
              {sertifikaTalepleri.map(talep => {
                const certLabel = talep.sertifika_turu === 'Diger'
                  ? (talep.sertifika_turu_diger || 'Diğer')
                  : talep.sertifika_turu;
                const certMeta = SERTIFIKA_META[talep.sertifika_turu] || SERTIFIKA_META['Diger'];
                return (
                  <div key={talep.id} className={`aeo-card aeo-card--${talep.durum}`}>
                    <div className="aeo-card-head">
                      <div className="aeo-card-firm">
                        <span className="material-symbols-outlined">business</span>
                        <strong>{talep.firma_adi || `Firma #${talep.firma_id}`}</strong>
                      </div>
                      <span className={`aeo-status aeo-status--${talep.durum}`}>
                        {talep.durum === 'bekliyor'   && <><span className="material-symbols-outlined">schedule</span> Bekliyor</>}
                        {talep.durum === 'onaylandi'  && <><span className="material-symbols-outlined">check_circle</span> Onaylanıldı</>}
                        {talep.durum === 'reddedildi' && <><span className="material-symbols-outlined">cancel</span> Reddedildi</>}
                      </span>
                    </div>

                    {/* Sertifika türü badge */}
                    <div className="aeo-sertifika-tur-row">
                      <span
                        className="aeo-sertifika-tur-badge"
                        style={{ background: certMeta.bg, color: certMeta.color, border: `1px solid ${certMeta.border}` }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 15, fontVariationSettings: "'FILL' 1" }}>workspace_premium</span>
                        {certLabel}
                      </span>
                      <span className="aeo-cert-desc">{certMeta.desc}</span>
                    </div>

                    {/* Belge linki (varsa) */}
                    {talep.belge_url && (
                      <div className="aeo-card-note">
                        <span className="material-symbols-outlined">description</span>
                        <button
                          type="button"
                          className="aeo-cert-doc-link"
                          onClick={async () => {
                            const { data, error } = await supabase.storage
                              .from('sertifika-belgeleri')
                              .createSignedUrl(talep.belge_url, 3600);
                            if (data?.signedUrl) window.open(data.signedUrl, '_blank');
                            else alert('Dosya açılamadı: ' + (error?.message || 'Bilinmeyen hata'));
                          }}
                        >
                          Belgeyi Görüntüle
                        </button>
                      </div>
                    )}

                    {talep.admin_notu && (
                      <div className="aeo-card-note">
                        <span className="material-symbols-outlined">sticky_note_2</span>
                        {talep.admin_notu}
                      </div>
                    )}

                    <div className="aeo-card-meta">
                      {new Date(talep.created_at).toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      {talep.gecerlilik_tarihi && (
                        <> &middot; Geçerlilik: {new Date(talep.gecerlilik_tarihi).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long' })}</>
                      )}
                    </div>

                    {talep.durum === 'bekliyor' && (
                      <>
                        <div className="aeo-sertifika-approve-row">
                          <label className="aeo-sertifika-date-label">
                            <span className="material-symbols-outlined">calendar_today</span>
                            Geçerlilik tarihi (isteğe bağlı)
                          </label>
                          <input
                            type="date"
                            className="aeo-sertifika-date-input"
                            value={gecerlilikTarihleri[talep.id] || ''}
                            onChange={e => setGecerlilikTarihleri(prev => ({ ...prev, [talep.id]: e.target.value }))}
                          />
                        </div>
                        <div className="aeo-card-actions">
                          <button
                            className="aeo-btn aeo-btn--approve"
                            onClick={() => approveSertifika(talep)}
                            disabled={actionId === talep.id}
                            type="button"
                          >
                            <span className="material-symbols-outlined">
                              {actionId === talep.id ? 'progress_activity' : 'check'}
                            </span>
                            Onayla
                          </button>
                          <button
                            className="aeo-btn aeo-btn--reject"
                            onClick={() => openReject(talep.id, 'sertifika')}
                            disabled={!!actionId}
                            type="button"
                          >
                            <span className="material-symbols-outlined">close</span>
                            Reddet
                          </button>
                          <button
                            className="aeo-btn aeo-btn--ghost"
                            onClick={() => router.push(`/firmadetay/${talep.firma_id}`)}
                            type="button"
                          >
                            <span className="material-symbols-outlined">open_in_new</span>
                            Firmayı Görüntüle
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )
        )}

      </div>

      {/* ── Reddetme Modal ── */}
      {rejectTargetId && (
        <div className="aeo-modal-overlay" onClick={() => setRejectTargetId(null)}>
          <div className="aeo-modal" onClick={e => e.stopPropagation()}>
            <div className="aeo-modal-head">
              <span className="material-symbols-outlined">cancel</span>
              <h3>Reddet</h3>
            </div>
            <p>Neden reddediyorsunuz? (isteğe bağlı)</p>
            <textarea
              rows={3}
              value={rejectNote}
              onChange={e => setRejectNote(e.target.value)}
              placeholder="Firma sahibi bu notu görecek…"
            />
            <div className="aeo-modal-actions">
              <button className="aeo-btn aeo-btn--ghost" onClick={() => setRejectTargetId(null)} type="button">
                Vazgeç
              </button>
              <button
                className="aeo-btn aeo-btn--reject"
                onClick={rejectType === 'etiket' ? rejectEtiket : rejectType === 'logo' ? rejectLogo : rejectSertifika}
                disabled={!!actionId}
                type="button"
              >
                <span className="material-symbols-outlined">
                  {actionId ? 'progress_activity' : 'close'}
                </span>
                Reddet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
