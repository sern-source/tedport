/* Enes Doğanay | 13 Nisan 2026: Verdiğim Teklifler — kullanıcının katıldığı ihaleleri ve tekliflerini gösterir */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import './MyOffersPanel.css';
/* Enes Doğanay | 15 Nisan 2026: Firma iletişim popup stilleri Ihaleler.css'ten */
import './Ihaleler.css';

/* Enes Doğanay | 13 Nisan 2026: Durum haritası */
const STATUS_MAP = {
    gonderildi: { label: 'Değerlendiriliyor', tone: 'review', icon: 'hourglass_top' },
    kabul: { label: 'Kabul Edildi', tone: 'accepted', icon: 'check_circle' },
    red: { label: 'Reddedildi', tone: 'rejected', icon: 'cancel' },
    taslak: { label: 'Taslak', tone: 'draft', icon: 'edit_note' },
};
const getStatus = (v) => STATUS_MAP[String(v || '').toLowerCase()] || STATUS_MAP.gonderildi;

const TENDER_STATUS_MAP = {
    canli: { label: 'Aktif', tone: 'active' },
    active: { label: 'Aktif', tone: 'active' },
    kapali: { label: 'Kapandı', tone: 'closed' },
    closed: { label: 'Kapandı', tone: 'closed' },
    iptal: { label: 'İptal', tone: 'cancelled' },
    cancelled: { label: 'İptal', tone: 'cancelled' },
    taslak: { label: 'Taslak', tone: 'draft' },
    draft: { label: 'Taslak', tone: 'draft' },
};
const getTenderStatus = (v) => TENDER_STATUS_MAP[String(v || '').toLowerCase()] || { label: 'Bilinmiyor', tone: 'unknown' };

/* Enes Doğanay | 13 Nisan 2026: Para + tarih formatlama */
const formatMoney = (amount, currency) => {
    const v = Number(amount || 0);
    if (!v) return '—';
    try {
        return v.toLocaleString('tr-TR', { style: 'currency', currency: currency || 'TRY', maximumFractionDigits: 0 });
    } catch {
        return `${currency || ''} ${v.toLocaleString('tr-TR')}`;
    }
};

/* Enes Doğanay | 14 Nisan 2026: Teklifin kalemlerinden gruplu toplam — farklı para birimleri varsa parçalı göster */
const getOfferGroupedTotals = (offer) => {
    const kalemler = Array.isArray(offer.kalemler) ? offer.kalemler : [];
    if (kalemler.length === 0) return null;
    const hasMixedCurs = kalemler.some(k => k.para_birimi && k.para_birimi !== (offer.para_birimi || 'TRY'));
    if (!hasMixedCurs) return null;
    const groups = {};
    kalemler.forEach(k => {
        const c = k.para_birimi || offer.para_birimi || 'TRY';
        const t = (Number(k.birim_fiyat) || 0) * (Number(k.miktar) || 0);
        if (t > 0) groups[c] = (groups[c] || 0) + t;
    });
    return Object.keys(groups).length > 0 ? groups : null;
};

const renderOfferAmount = (offer) => {
    const grouped = getOfferGroupedTotals(offer);
    if (!grouped) return formatMoney(offer.toplam_tutar, offer.para_birimi);
    const entries = Object.entries(grouped);
    return entries.map(([c, v], i) => (
        <span key={c}>{i > 0 && ' + '}{formatMoney(v, c)}</span>
    ));
};

const formatDate = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' });
};

const timeAgo = (iso) => {
    if (!iso) return '';
    const diff = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
    if (diff < 1) return 'Az önce';
    if (diff < 60) return `${diff} dk önce`;
    const hr = Math.round(diff / 60);
    if (hr < 24) return `${hr} sa önce`;
    const days = Math.round(hr / 24);
    if (days < 30) return `${days} gün önce`;
    return formatDate(iso);
};

const MyOffersPanel = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [offers, setOffers] = useState([]);
    const [tenderMap, setTenderMap] = useState({});
    const [firmaMap, setFirmaMap] = useState({});
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [expandedId, setExpandedId] = useState(null);
    /* Enes Doğanay | 13 Nisan 2026: Bildirimden gelen highlight */
    const [highlightId, setHighlightId] = useState(null);
    const highlightRef = useRef(null);
    /* Enes Doğanay | 15 Nisan 2026: Firma ile iletişime geç popup state */
    const [firmaContactPopup, setFirmaContactPopup] = useState(null);
    const [firmaContactLoading, setFirmaContactLoading] = useState(false);

    /* Enes Doğanay | 13 Nisan 2026: Veri çekme — teklifler + ilgili ihaleler + firmalar */
    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session?.user) { setLoading(false); return; }

                const { data: myOffers } = await supabase
                    .from('ihale_teklifleri')
                    .select('*')
                    .eq('user_id', session.user.id)
                    .order('created_at', { ascending: false });

                if (!myOffers?.length) { setOffers([]); setLoading(false); return; }

                /* İhale bilgilerini çek */
                const ihaleIds = [...new Set(myOffers.map(o => o.ihale_id))];
                const { data: tenders } = await supabase
                    .from('firma_ihaleleri')
                    .select('id, baslik, aciklama, referans_no, firma_id, durum, son_basvuru_tarihi, teslim_il, teslim_ilce, ihale_tipi, kategori')
                    .in('id', ihaleIds);

                const tMap = {};
                (tenders || []).forEach(t => { tMap[String(t.id)] = t; });

                /* Firma adlarını çek */
                const firmaIds = [...new Set((tenders || []).map(t => t.firma_id).filter(Boolean))];
                const { data: firmalar } = firmaIds.length > 0
                    ? await supabase.from('firmalar').select('firmaID, firma_adi').in('firmaID', firmaIds)
                    : { data: [] };

                const fMap = {};
                (firmalar || []).forEach(f => { fMap[String(f.firmaID)] = f.firma_adi; });

                setOffers(myOffers);
                setTenderMap(tMap);
                setFirmaMap(fMap);
            } catch (err) {
                console.error('İhale teklifleri yüklenemedi:', err);
                setOffers([]);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    /* Enes Doğanay | 13 Nisan 2026: sessionStorage'dan highlight — data yüklenince oku, bul, aç */
    useEffect(() => {
        if (loading || offers.length === 0) return;
        const hlIhale = sessionStorage.getItem('mop_highlight_ihale');
        if (!hlIhale) return;
        sessionStorage.removeItem('mop_highlight_ihale');
        const targetOffer = offers.find(o => String(o.ihale_id) === String(hlIhale));
        if (targetOffer) {
            setExpandedId(targetOffer.id);
            setHighlightId(targetOffer.id);
            setTimeout(() => setHighlightId(null), 4000);
        }
    }, [loading, offers]);

    /* Enes Doğanay | 13 Nisan 2026: Highlight edilen teklif kartına scroll */
    useEffect(() => {
        if (highlightId && highlightRef.current) {
            setTimeout(() => highlightRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 200);
        }
    }, [highlightId]);

    /* Enes Doğanay | 13 Nisan 2026: Filtreleme ve arama */
    const filtered = useMemo(() => {
        let list = [...offers];
        if (filter !== 'all') {
            list = list.filter(o => String(o.durum || '').toLowerCase() === filter);
        }
        if (search.trim()) {
            const q = search.trim().toLocaleLowerCase('tr-TR');
            list = list.filter(o => {
                const t = tenderMap[String(o.ihale_id)];
                return (t?.baslik || '').toLocaleLowerCase('tr-TR').includes(q) ||
                    (t?.referans_no || '').toLocaleLowerCase('tr-TR').includes(q) ||
                    (firmaMap[String(t?.firma_id)] || '').toLocaleLowerCase('tr-TR').includes(q);
            });
        }
        return list;
    }, [offers, filter, search, tenderMap, firmaMap]);

    /* KPI'lar */
    const kpis = useMemo(() => ({
        total: offers.length,
        review: offers.filter(o => getStatus(o.durum).tone === 'review').length,
        accepted: offers.filter(o => getStatus(o.durum).tone === 'accepted').length,
        rejected: offers.filter(o => getStatus(o.durum).tone === 'rejected').length,
    }), [offers]);

    /* Enes Doğanay | 15 Nisan 2026: Firma ile iletişime geç — firma + yönetici bilgilerini getir */
    const openFirmaContact = async (firmaId, firmaAdi) => {
        setFirmaContactLoading(true);
        const info = { name: null, firma: firmaAdi || null, email: null, phone: null, firmaPhone: null, firmaEmail: null };
        try {
            if (firmaId) {
                const { data: firma } = await supabase.from('firmalar').select('firma_adi, telefon, eposta').eq('firmaID', firmaId).maybeSingle();
                if (firma) {
                    info.firma = firma.firma_adi || info.firma;
                    if (firma.telefon) info.firmaPhone = firma.telefon;
                    if (firma.eposta) info.firmaEmail = firma.eposta;
                }
                const { data: mgr } = await supabase.from('kurumsal_firma_yoneticileri').select('user_id').eq('firma_id', firmaId).maybeSingle();
                if (mgr?.user_id) {
                    const { data: prof } = await supabase.from('profiles').select('first_name, last_name, phone, email').eq('id', mgr.user_id).maybeSingle();
                    if (prof) {
                        info.name = [prof.first_name, prof.last_name].filter(Boolean).join(' ') || null;
                        if (prof.email) info.email = prof.email;
                        if (prof.phone) info.phone = prof.phone;
                    }
                }
            }
        } catch (e) { console.error('Firma iletişim bilgisi alınamadı:', e); }
        setFirmaContactPopup(info);
        setFirmaContactLoading(false);
    };

    if (loading) {
        return (
            <div className="mop-screen">
                <div className="mop-loading">
                    <div className="mop-loading__spinner" />
                    <p>Teklifleriniz yükleniyor...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="mop-screen">
            {/* ═══ Hero Banner ═══ */}
            <div className="mop-hero">
                <div className="mop-hero__text">
                    <h1>
                        <span className="material-symbols-outlined">assignment_turned_in</span>
                        Verdiğim Teklifler
                    </h1>
                    <p>Katıldığınız ihaleleri, gönderdiğiniz tekliflerin durumunu buradan takip edin.</p>
                </div>
                <div className="mop-hero__stats">
                    <div className="mop-stat">
                        <span className="material-symbols-outlined">send</span>
                        <div><strong>{kpis.total}</strong><span>Toplam</span></div>
                    </div>
                    <div className="mop-stat mop-stat--amber">
                        <span className="material-symbols-outlined">hourglass_top</span>
                        <div><strong>{kpis.review}</strong><span>Bekleyen</span></div>
                    </div>
                    <div className="mop-stat mop-stat--green">
                        <span className="material-symbols-outlined">check_circle</span>
                        <div><strong>{kpis.accepted}</strong><span>Kabul</span></div>
                    </div>
                    <div className="mop-stat mop-stat--red">
                        <span className="material-symbols-outlined">cancel</span>
                        <div><strong>{kpis.rejected}</strong><span>Red</span></div>
                    </div>
                </div>
            </div>

            {/* ═══ Arama + Filtre ═══ */}
            <div className="mop-toolbar">
                <div className="mop-search">
                    <span className="material-symbols-outlined">search</span>
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="İhale adı, referans no veya firma ara..."
                    />
                    {search && (
                        <button className="mop-search__clear" onClick={() => setSearch('')}>
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    )}
                </div>
                <div className="mop-filters">
                    {[
                        { key: 'all', label: 'Tümü', icon: 'apps' },
                        { key: 'gonderildi', label: 'Bekleyen', icon: 'hourglass_top' },
                        { key: 'kabul', label: 'Kabul', icon: 'check_circle' },
                        { key: 'red', label: 'Reddedilen', icon: 'cancel' },
                        { key: 'taslak', label: 'Taslak', icon: 'edit_note' },
                    ].map(f => (
                        <button
                            key={f.key}
                            className={`mop-chip${filter === f.key ? ' mop-chip--on' : ''}`}
                            onClick={() => setFilter(f.key)}
                        >
                            <span className="material-symbols-outlined">{f.icon}</span>
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* ═══ Teklif Kartları ═══ */}
            {filtered.length === 0 ? (
                <div className="mop-empty">
                    <span className="material-symbols-outlined">inbox</span>
                    <h3>{offers.length === 0 ? 'Henüz Teklif Vermediniz' : 'Sonuç Bulunamadı'}</h3>
                    <p>{offers.length === 0
                        ? 'İhaleler sayfasından ilginizi çeken ihalelere teklif verebilirsiniz.'
                        : 'Filtreleri değiştirmeyi veya arama terimini düzenlemeyi deneyin.'
                    }</p>
                    {offers.length === 0 && (
                        <button className="mop-btn mop-btn--primary" onClick={() => navigate('/ihaleler')}>
                            <span className="material-symbols-outlined">gavel</span>
                            İhalelere Göz At
                        </button>
                    )}
                </div>
            ) : (
                <div className="mop-list">
                    {filtered.map((offer) => {
                        const st = getStatus(offer.durum);
                        const tender = tenderMap[String(offer.ihale_id)] || {};
                        const firmaAdi = firmaMap[String(tender.firma_id)] || 'Firma bilinmiyor';
                        const tenderSt = getTenderStatus(tender.durum);
                        const isExpanded = expandedId === offer.id;
                        const kalemler = Array.isArray(offer.kalemler) ? offer.kalemler : [];

                        return (
                            <div
                                key={offer.id}
                                className={`mop-card${isExpanded ? ' mop-card--expanded' : ''}${highlightId === offer.id ? ' mop-card--highlight' : ''}`}
                                ref={highlightId === offer.id ? highlightRef : undefined}
                            >
                                {/* Ana satır */}
                                <div className="mop-card__main" onClick={() => setExpandedId(isExpanded ? null : offer.id)}>
                                    {/* Sol: İhale bilgisi */}
                                    <div className="mop-card__tender">
                                        <h3>{tender.baslik || 'İhale bulunamadı'}</h3>
                                        <div className="mop-card__meta">
                                            <span className="mop-card__firma" onClick={e => { e.stopPropagation(); if (tender.firma_id) navigate(`/firmadetay/${tender.firma_id}`); }}>
                                                <span className="material-symbols-outlined">apartment</span>
                                                {firmaAdi}
                                            </span>
                                            {tender.referans_no && (
                                                <span className="mop-card__ref">
                                                    <span className="material-symbols-outlined">tag</span>
                                                    {tender.referans_no}
                                                </span>
                                            )}
                                            <span className={`mop-tender-badge mop-tender-badge--${tenderSt.tone}`}>
                                                {tenderSt.label}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Orta: Teklif özeti */}
                                    <div className="mop-card__summary">
                                        <div className="mop-card__amount">
                                            <span className="material-symbols-outlined">payments</span>
                                            <strong>{renderOfferAmount(offer)}</strong>
                                        </div>
                                        {offer.teslim_suresi_gun && (
                                            <div className="mop-card__delivery">
                                                <span className="material-symbols-outlined">local_shipping</span>
                                                {offer.teslim_suresi_gun} gün
                                            </div>
                                        )}
                                    </div>

                                    {/* Sağ: Durum + tarih */}
                                    <div className="mop-card__status-area">
                                        <span className={`mop-status mop-status--${st.tone}`}>
                                            <span className="material-symbols-outlined">{st.icon}</span>
                                            {st.label}
                                        </span>
                                        <span className="mop-card__time">{timeAgo(offer.created_at)}</span>
                                    </div>

                                    <span className="material-symbols-outlined mop-card__chevron">
                                        {isExpanded ? 'expand_less' : 'expand_more'}
                                    </span>
                                </div>

                                {/* Genişletilmiş detay */}
                                {isExpanded && (
                                    <div className="mop-card__detail">
                                        <div className="mop-detail-grid">
                                            <div className="mop-detail-cell">
                                                <span className="material-symbols-outlined">payments</span>
                                                <div>
                                                    <small>Teklif Tutarı</small>
                                                    <strong>{renderOfferAmount(offer)}</strong>
                                                    {offer.kdv_dahil !== undefined && <span className="mop-tag">{offer.kdv_dahil ? 'KDV Dahil' : 'KDV Hariç'}</span>}
                                                </div>
                                            </div>
                                            <div className="mop-detail-cell">
                                                <span className="material-symbols-outlined">local_shipping</span>
                                                <div>
                                                    <small>Teslim Süresi</small>
                                                    <strong>{offer.teslim_suresi_gun ? `${offer.teslim_suresi_gun} gün` : '—'}</strong>
                                                </div>
                                            </div>
                                            <div className="mop-detail-cell">
                                                <span className="material-symbols-outlined">event_busy</span>
                                                <div>
                                                    <small>Son Başvuru</small>
                                                    <strong>{formatDate(tender.son_basvuru_tarihi)}</strong>
                                                </div>
                                            </div>
                                            <div className="mop-detail-cell">
                                                <span className="material-symbols-outlined">calendar_today</span>
                                                <div>
                                                    <small>Teklif Tarihi</small>
                                                    <strong>{formatDate(offer.created_at)}</strong>
                                                </div>
                                            </div>
                                        </div>

                                        {offer.teslim_aciklamasi && (
                                            <div className="mop-detail-row">
                                                <span className="material-symbols-outlined">info</span>
                                                <div><small>Teslim Açıklaması</small><p>{offer.teslim_aciklamasi}</p></div>
                                            </div>
                                        )}

                                        {offer.not_field && (
                                            <div className="mop-detail-row">
                                                <span className="material-symbols-outlined">sticky_note_2</span>
                                                <div><small>Notunuz</small><p>{offer.not_field}</p></div>
                                            </div>
                                        )}

                                        {/* Enes Doğanay | 14 Nisan 2026: Kalem bazlı para birimi — her kalemde para_birimi göster */}
                                        {kalemler.length > 0 && (
                                            <div className="mop-kalemler">
                                                <h4>
                                                    <span className="material-symbols-outlined">list_alt</span>
                                                    Teklif Kalemleri ({kalemler.length})
                                                </h4>
                                                <div className="mop-kalemler__wrap">
                                                    <table>
                                                        <thead>
                                                            <tr>
                                                                <th>Madde</th>
                                                                <th>Miktar</th>
                                                                <th>Birim Fiyat</th>
                                                                <th>Para Birimi</th>
                                                                <th>Toplam</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {kalemler.map((k, i) => {
                                                                const kCur = k.para_birimi || offer.para_birimi || 'TRY';
                                                                const kTotal = (Number(k.birim_fiyat) || 0) * (Number(k.miktar) || 0);
                                                                return (
                                                                    <tr key={i}>
                                                                        <td><strong>{k.madde || '—'}</strong></td>
                                                                        <td>{k.miktar || '—'}</td>
                                                                        <td>{k.birim_fiyat ? formatMoney(Number(k.birim_fiyat), kCur) : '—'}</td>
                                                                        <td>{kCur}</td>
                                                                        <td>{kTotal ? formatMoney(kTotal, kCur) : '—'}</td>
                                                                    </tr>
                                                                );
                                                            })}
                                                        </tbody>
                                                    </table>
                                                    {/* Enes Doğanay | 14 Nisan 2026: Parçalı para birimi — gruplu toplam */}
                                                    {(() => {
                                                        const groups = {};
                                                        kalemler.forEach(k => {
                                                            const c = k.para_birimi || offer.para_birimi || 'TRY';
                                                            const t = (Number(k.birim_fiyat) || 0) * (Number(k.miktar) || 0);
                                                            groups[c] = (groups[c] || 0) + t;
                                                        });
                                                        const entries = Object.entries(groups).filter(([, v]) => v > 0);
                                                        if (entries.length <= 1) return null;
                                                        return (
                                                            <div className="mop-kalemler__grouped-total">
                                                                <strong>Toplamlar:</strong>
                                                                {entries.map(([c, v]) => (
                                                                    <span key={c}>{formatMoney(v, c)}</span>
                                                                ))}
                                                            </div>
                                                        );
                                                    })()}
                                                </div>
                                            </div>
                                        )}

                                        {(offer.ek_dosya_url || offer.ek_dosya_adi) && (
                                            <div className="mop-detail-row mop-detail-row--file">
                                                <span className="material-symbols-outlined">attach_file</span>
                                                {/* Enes Doğanay | 15 Nisan 2026: teklif-ekleri private bucket — signed URL ile aç */}
                                                <button type="button" className="mop-file-link" onClick={async () => {
                                                    let filePath = offer.ek_dosya_url;
                                                    if (filePath.startsWith('http')) {
                                                        try {
                                                            const url = new URL(filePath);
                                                            const marker = '/teklif-ekleri/';
                                                            const idx = url.pathname.indexOf(marker);
                                                            if (idx !== -1) filePath = decodeURIComponent(url.pathname.substring(idx + marker.length));
                                                        } catch { /* */ }
                                                    }
                                                    const { data } = await supabase.storage.from('teklif-ekleri').createSignedUrl(filePath, 300);
                                                    if (data?.signedUrl) window.open(data.signedUrl, '_blank', 'noopener,noreferrer');
                                                }}>
                                                    {offer.ek_dosya_adi || 'Ek Dosya'}
                                                </button>
                                            </div>
                                        )}

                                        {/* Enes Doğanay | 13 Nisan 2026: İhaleye Git → detay modal, Teklifi/Taslağı Güncelle → teklif popup */}
                                        {/* Enes Doğanay | 15 Nisan 2026: Firma ile iletişime geç butonu eklendi */}
                                        <div className="mop-card__footer">
                                            <button className="mop-btn mop-btn--outline" onClick={() => navigate(`/ihaleler?ihale=${offer.ihale_id}`)}>
                                                <span className="material-symbols-outlined">gavel</span>
                                                İhaleye Git
                                            </button>
                                            {tender.firma_id && (
                                                <button className="mop-btn mop-btn--contact" onClick={() => openFirmaContact(tender.firma_id, firmaAdi)}>
                                                    <span className="material-symbols-outlined">contact_phone</span>
                                                    Firma ile İletişime Geç
                                                </button>
                                            )}
                                            {tenderSt.tone === 'active' && st.tone !== 'accepted' && (
                                                <button className="mop-btn mop-btn--primary" onClick={() => navigate(`/ihaleler?ihale=${offer.ihale_id}&teklif=1`)}>
                                                    <span className="material-symbols-outlined">edit</span>
                                                    {st.tone === 'draft' ? 'Taslağı Güncelle' : 'Teklifi Güncelle'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Enes Doğanay | 15 Nisan 2026: Firma ile İletişime Geç popup */}
            {firmaContactPopup && (
                <div className="firma-contact-overlay" onClick={() => setFirmaContactPopup(null)}>
                    <div className="firma-contact-card" onClick={e => e.stopPropagation()}>
                        <button className="firma-contact-card__close" onClick={() => setFirmaContactPopup(null)}>
                            <span className="material-symbols-outlined">close</span>
                        </button>
                        <div className="firma-contact-card__avatar">
                            <span className="material-symbols-outlined">apartment</span>
                        </div>
                        {firmaContactPopup.firma && <h3>{firmaContactPopup.firma}</h3>}
                        {firmaContactPopup.name && <p className="firma-contact-card__name">{firmaContactPopup.name}</p>}

                        <div className="firma-contact-card__rows">
                            {firmaContactPopup.firmaEmail && (
                                <a href={`mailto:${firmaContactPopup.firmaEmail}`} className="firma-contact-row">
                                    <span className="material-symbols-outlined">mail</span>
                                    <div><small>E-POSTA</small><span>{firmaContactPopup.firmaEmail}</span></div>
                                </a>
                            )}
                            {firmaContactPopup.email && firmaContactPopup.email !== firmaContactPopup.firmaEmail && (
                                <a href={`mailto:${firmaContactPopup.email}`} className="firma-contact-row">
                                    <span className="material-symbols-outlined">person</span>
                                    <div><small>YÖNETİCİ E-POSTA</small><span>{firmaContactPopup.email}</span></div>
                                </a>
                            )}
                            {firmaContactPopup.firmaPhone && (
                                <a href={`tel:${firmaContactPopup.firmaPhone}`} className="firma-contact-row">
                                    <span className="material-symbols-outlined">call</span>
                                    <div><small>TELEFON</small><span>{firmaContactPopup.firmaPhone}</span></div>
                                </a>
                            )}
                            {firmaContactPopup.phone && firmaContactPopup.phone !== firmaContactPopup.firmaPhone && (
                                <a href={`tel:${firmaContactPopup.phone}`} className="firma-contact-row">
                                    <span className="material-symbols-outlined">person</span>
                                    <div><small>YÖNETİCİ TELEFON</small><span>{firmaContactPopup.phone}</span></div>
                                </a>
                            )}
                        </div>

                        {!firmaContactPopup.email && !firmaContactPopup.phone && !firmaContactPopup.firmaPhone && !firmaContactPopup.firmaEmail && (
                            <p className="firma-contact-card__empty">Bu firma için iletişim bilgisi bulunamadı.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyOffersPanel;
