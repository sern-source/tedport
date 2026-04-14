/* Enes Doğanay | 13 Nisan 2026: İhalelerim & Gelen Teklifler — tamamen yeniden tasarlandı */
/* Enes Doğanay | 13 Nisan 2026: İhale düzenle/sil/kapat + bildirim entegrasyonu */
import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from './supabaseClient';
import { updateTender, deleteTender } from './ihaleManagementApi';
import CitySelect from './CitySelect';
import { TURKEY_DISTRICTS } from './turkeyDistricts';
import './TenderOffersManagement.css';

/* ─── Yardımcı Fonksiyonlar ─── */

/* Enes Doğanay | 13 Nisan 2026: Para formatlayıcı */
const formatMoney = (amount, currency) => {
    const v = Number(amount || 0);
    if (!v) return '—';
    try {
        return v.toLocaleString('tr-TR', { style: 'currency', currency: currency || 'TRY', maximumFractionDigits: 0 });
    } catch {
        return `${currency || ''} ${v.toLocaleString('tr-TR')}`;
    }
};

/* Enes Doğanay | 14 Nisan 2026: Teklifin kalemlerinden para birimine göre gruplu toplamları hesapla */
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

/* Enes Doğanay | 14 Nisan 2026: Gruplu toplamı render et — farklı para birimleri varsa parçalı göster */
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

const daysUntil = (dateStr) => {
    if (!dateStr) return null;
    return Math.ceil((new Date(dateStr) - new Date()) / 86400000);
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

/* Enes Doğanay | 13 Nisan 2026: Tarih formatlayıcı — input[type=date] uyumlu */
const toDateInput = (v) => {
    if (!v) return '';
    const s = String(v);
    if (s.includes('T')) return s.split('T')[0];
    return s.length >= 10 ? s.slice(0, 10) : s;
};

/* Enes Doğanay | 13 Nisan 2026: İhale ve teklif durum haritaları */
const TENDER_STATUS = {
    active: { label: 'Aktif', tone: 'active', icon: 'radio_button_checked' },
    canli: { label: 'Aktif', tone: 'active', icon: 'radio_button_checked' },
    draft: { label: 'Taslak', tone: 'draft', icon: 'edit_note' },
    taslak: { label: 'Taslak', tone: 'draft', icon: 'edit_note' },
    closed: { label: 'Kapandı', tone: 'closed', icon: 'lock' },
    kapali: { label: 'Kapandı', tone: 'closed', icon: 'lock' },
    completed: { label: 'Tamamlandı', tone: 'closed', icon: 'check_circle' },
    cancelled: { label: 'İptal', tone: 'cancelled', icon: 'cancel' },
    iptal: { label: 'İptal', tone: 'cancelled', icon: 'cancel' },
};
const getTenderStatus = (v) => TENDER_STATUS[String(v || '').toLowerCase()] || { label: 'Bilinmiyor', tone: 'unknown', icon: 'help' };

const OFFER_STATUS = {
    kabul: { label: 'Kabul Edildi', tone: 'accepted', icon: 'check_circle' },
    red: { label: 'Reddedildi', tone: 'rejected', icon: 'cancel' },
    taslak: { label: 'Taslak', tone: 'draft', icon: 'edit_note' },
    gonderildi: { label: 'Değerlendiriliyor', tone: 'review', icon: 'hourglass_top' },
};
const getOfferStatus = (v) => OFFER_STATUS[String(v || '').toLowerCase()] || { label: 'Değerlendiriliyor', tone: 'review', icon: 'hourglass_top' };

/* Enes Doğanay | 13 Nisan 2026: Akıllı puanlama — fiyat ve süre düşükse puan yükselir */
/* Enes Doğanay | 13 Nisan 2026: İçerik kalitesi kaldırıldı — sadece fiyat ve teslim süresi */
const calculateOfferScore = (offer, allOffers, weights) => {
    const prices = allOffers.map(o => Number(o.toplam_tutar || 0)).filter(v => v > 0);
    const deliveries = allOffers.map(o => Number(o.teslim_suresi_gun || 0)).filter(v => v > 0);
    const price = Number(offer.toplam_tutar || 0);
    const delivery = Number(offer.teslim_suresi_gun || 0);

    const minP = Math.min(...prices, price || Infinity);
    const maxP = Math.max(...prices, price || 0);
    const minD = Math.min(...deliveries, delivery || Infinity);
    const maxD = Math.max(...deliveries, delivery || 0);

    const priceScore = !price ? 0 : minP === maxP ? 100 : ((maxP - price) / (maxP - minP)) * 100;
    const deliveryScore = !delivery ? 15 : minD === maxD ? 100 : ((maxD - delivery) / (maxD - minD)) * 100;

    const wP = Number(weights.price || 0);
    const wD = Number(weights.delivery || 0);
    const total = wP + wD || 1;

    const overall = (priceScore * wP + deliveryScore * wD) / total;

    return {
        overall: Math.round(overall),
        price: Math.round(priceScore),
        delivery: Math.round(deliveryScore),
    };
};

/* ─── Score Ring SVG ─── */
/* Enes Doğanay | 13 Nisan 2026: Animasyonlu skor çemberi */
const ScoreRing = ({ score, size = 52 }) => {
    const r = (size - 6) / 2;
    const circ = 2 * Math.PI * r;
    const offset = circ - (score / 100) * circ;
    const color = score >= 75 ? '#059669' : score >= 50 ? '#d97706' : '#ef4444';
    return (
        <div className="tom-score-ring" style={{ width: size, height: size }}>
            <svg width={size} height={size}>
                <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e2e8f0" strokeWidth="3.5" />
                <circle
                    cx={size / 2} cy={size / 2} r={r} fill="none"
                    stroke={color} strokeWidth="3.5"
                    strokeDasharray={circ} strokeDashoffset={offset}
                    strokeLinecap="round"
                    transform={`rotate(-90 ${size / 2} ${size / 2})`}
                    style={{ transition: 'stroke-dashoffset 0.6s ease' }}
                />
            </svg>
            <span className="tom-score-ring__val">{score}</span>
        </div>
    );
};

/* ═══════════════════════════════════════════════════
   ANA BİLEŞEN
   ═══════════════════════════════════════════════════ */
const TenderOffersManagement = ({ companyId }) => {
    /* ─── State ─── */
    const [searchParams, setSearchParams] = useSearchParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [tenders, setTenders] = useState([]);
    const [offersByTender, setOffersByTender] = useState({});
    const [selectedId, setSelectedId] = useState(null);

    const [tenderSearch, setTenderSearch] = useState('');
    const [tenderFilter, setTenderFilter] = useState('all');
    const [offerFilter, setOfferFilter] = useState('all');
    const [offerSort, setOfferSort] = useState('score');
    const [compareIds, setCompareIds] = useState([]);
    const [expandedOfferId, setExpandedOfferId] = useState(null);
    const [showScorePanel, setShowScorePanel] = useState(false);
    const [showTenderInfo, setShowTenderInfo] = useState(true);
    const [weights, setWeights] = useState({ price: 55, delivery: 45 });
    const [statusUpdating, setStatusUpdating] = useState(null);

    /* Enes Doğanay | 13 Nisan 2026: Bildirim'den gelen highlight state */
    const [highlightOfferId, setHighlightOfferId] = useState(null);
    const highlightRef = useRef(null);

    /* Enes Doğanay | 13 Nisan 2026: İletişim popup state */
    const [contactPopup, setContactPopup] = useState(null);
    const [contactLoading, setContactLoading] = useState(false);

    /* Enes Doğanay | 13 Nisan 2026: İhale düzenle/sil/kapat state */
    const [editModal, setEditModal] = useState(false);
    const [editForm, setEditForm] = useState(null);
    const [editSaving, setEditSaving] = useState(false);
    const [editError, setEditError] = useState('');
    const [editReqMadde, setEditReqMadde] = useState('');
    const [editReqAciklama, setEditReqAciklama] = useState('');
    const [deleteConfirmId, setDeleteConfirmId] = useState(null);
    const [closingTenderId, setClosingTenderId] = useState(null);
    const [closeConfirmId, setCloseConfirmId] = useState(null);

    /* Enes Doğanay | 13 Nisan 2026: Favoriler ve notlar localStorage ile kalıcı */
    const [shortlist, setShortlist] = useState(() => {
        try { return JSON.parse(localStorage.getItem('tedport_shortlist_offer_ids') || '[]'); }
        catch { return []; }
    });
    const [notes, setNotes] = useState(() => {
        try { return JSON.parse(localStorage.getItem('tedport_offer_notes') || '{}'); }
        catch { return {}; }
    });

    useEffect(() => { localStorage.setItem('tedport_shortlist_offer_ids', JSON.stringify(shortlist)); }, [shortlist]);
    useEffect(() => { localStorage.setItem('tedport_offer_notes', JSON.stringify(notes)); }, [notes]);

    /* ─── Veri Çekme ─── */
    useEffect(() => {
        if (!companyId) return;
        const load = async () => {
            setLoading(true);
            setError('');

            /* Enes Doğanay | 13 Nisan 2026: Supabase client init tamamlanmasını bekle */
            await supabase.auth.getSession();

            try {
                const res = await supabase
                    .from('firma_ihaleleri')
                    .select('id, baslik, aciklama, referans_no, ihale_tipi, kategori, butce_notu, yayin_tarihi, son_basvuru_tarihi, durum, teslim_il, teslim_ilce, il_ilce, teslim_suresi, kdv_durumu, gereksinimler, created_at')
                    .eq('firma_id', String(companyId))
                    .order('created_at', { ascending: false });

                let rows = res.data || [];
                if (res.error) {
                    const fb = await supabase.from('firma_ihaleleri').select('*').eq('firma_id', String(companyId)).order('created_at', { ascending: false });
                    rows = fb.data || [];
                    if (fb.error) { setError('İhaleler yüklenemedi.'); setLoading(false); return; }
                }

                const ids = rows.map(t => t.id);
                let grouped = {};
                if (ids.length > 0) {
                    /* Enes Doğanay | 13 Nisan 2026: Taslak teklifler ihale sahibine görünmez — sadece gönderilmiş olanlar */
                    const oRes = await supabase.from('ihale_teklifleri').select('*').in('ihale_id', ids).neq('durum', 'taslak').order('created_at', { ascending: false });
                    if (oRes.error) { setError('Teklifler yüklenemedi.'); setLoading(false); return; }
                    grouped = (oRes.data || []).reduce((a, o) => {
                        const k = String(o.ihale_id);
                        if (!a[k]) a[k] = [];
                        a[k].push(o);
                        return a;
                    }, {});
                }

                setTenders(rows);
                setOffersByTender(grouped);
                setSelectedId(prev => {
                    if (prev && rows.some(t => String(t.id) === String(prev))) return prev;
                    return rows[0]?.id || null;
                });
            } catch (err) {
                console.error('İhale yönetimi yüklenemedi:', err);
                setError('Veriler yüklenirken bir hata oluştu.');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [companyId]);

    /* Enes Doğanay | 13 Nisan 2026: Realtime — teklif INSERT/UPDATE/DELETE otomatik güncelleme */
    useEffect(() => {
        if (!companyId || tenders.length === 0) return;
        const ids = tenders.map(t => String(t.id));
        const channel = supabase
            .channel('tom-offers-live')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'ihale_teklifleri' }, (payload) => {
                const row = payload.new;
                /* Enes Doğanay | 13 Nisan 2026: Taslak teklifler ihale sahibine görünmez */
                if (row.durum === 'taslak') return;
                if (ids.includes(String(row.ihale_id))) {
                    setOffersByTender(prev => {
                        const k = String(row.ihale_id);
                        return { ...prev, [k]: [row, ...(prev[k] || [])] };
                    });
                }
            })
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'ihale_teklifleri' }, (payload) => {
                const row = payload.new;
                if (ids.includes(String(row.ihale_id))) {
                    setOffersByTender(prev => {
                        const k = String(row.ihale_id);
                        return { ...prev, [k]: (prev[k] || []).map(o => String(o.id) === String(row.id) ? row : o) };
                    });
                }
            })
            .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'ihale_teklifleri' }, (payload) => {
                const row = payload.old;
                if (row?.ihale_id && ids.includes(String(row.ihale_id))) {
                    setOffersByTender(prev => {
                        const k = String(row.ihale_id);
                        return { ...prev, [k]: (prev[k] || []).filter(o => String(o.id) !== String(row.id)) };
                    });
                }
            })
            .subscribe();
        return () => { supabase.removeChannel(channel); };
    }, [companyId, tenders]);

    /* Enes Doğanay | 13 Nisan 2026: URL params → highlight specific offer (bildirim navigasyonu) */
    useEffect(() => {
        if (loading || tenders.length === 0) return;
        const ihaleParam = searchParams.get('ihale');
        const teklifUserParam = searchParams.get('teklif_user');
        if (!ihaleParam) return;

        /* İhaleyi seç */
        const targetTender = tenders.find(t => String(t.id) === String(ihaleParam));
        if (targetTender) {
            setSelectedId(targetTender.id);
            setTenderFilter('all');
            setOfferFilter('all');

            /* Teklif veren kullanıcıyı bul ve highlight et */
            if (teklifUserParam) {
                const offers = offersByTender[String(targetTender.id)] || [];
                const targetOffer = offers.find(o => String(o.user_id) === String(teklifUserParam));
                if (targetOffer) {
                    setExpandedOfferId(targetOffer.id);
                    setHighlightOfferId(targetOffer.id);
                    /* Highlight'ı 4 sn sonra kaldır */
                    setTimeout(() => setHighlightOfferId(null), 4000);
                }
            }
        }

        /* URL params temizle — tekrar tetiklenmemesi için */
        const newParams = new URLSearchParams(searchParams);
        newParams.delete('ihale');
        newParams.delete('teklif_user');
        setSearchParams(newParams, { replace: true });
    }, [loading, tenders, offersByTender]);

    /* Enes Doğanay | 13 Nisan 2026: Highlight edilen teklif kartına scroll */
    useEffect(() => {
        if (highlightOfferId && highlightRef.current) {
            setTimeout(() => {
                highlightRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 200);
        }
    }, [highlightOfferId]);

    /* ─── Hesaplamalar ─── */
    const selectedTender = useMemo(() => tenders.find(t => String(t.id) === String(selectedId)) || null, [tenders, selectedId]);
    const rawOffers = useMemo(() => offersByTender[String(selectedId)] || [], [offersByTender, selectedId]);

    const scoredOffers = useMemo(() =>
        rawOffers.map(o => ({ ...o, _score: calculateOfferScore(o, rawOffers, weights) })),
        [rawOffers, weights]
    );

    /* Enes Doğanay | 13 Nisan 2026: Filtreleme ve sıralama */
    const displayOffers = useMemo(() => {
        const sl = new Set(shortlist.map(String));
        let list = [...scoredOffers];
        if (offerFilter === 'shortlist') list = list.filter(o => sl.has(String(o.id)));
        else if (offerFilter !== 'all') list = list.filter(o => String(o.durum || '').toLowerCase() === offerFilter);

        list.sort((a, b) => {
            switch (offerSort) {
                case 'score': return b._score.overall - a._score.overall;
                case 'price-asc': return Number(a.toplam_tutar || 0) - Number(b.toplam_tutar || 0);
                case 'price-desc': return Number(b.toplam_tutar || 0) - Number(a.toplam_tutar || 0);
                case 'delivery': return Number(a.teslim_suresi_gun || 999) - Number(b.teslim_suresi_gun || 999);
                case 'date': return new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at);
                default: return 0;
            }
        });
        return list;
    }, [scoredOffers, offerFilter, offerSort, shortlist]);

    const filteredTenders = useMemo(() => {
        let list = [...tenders];
        if (tenderSearch) {
            const q = tenderSearch.toLowerCase();
            list = list.filter(t =>
                (t.baslik || '').toLowerCase().includes(q) ||
                (t.referans_no || '').toLowerCase().includes(q) ||
                (t.aciklama || '').toLowerCase().includes(q)
            );
        }
        if (tenderFilter !== 'all') list = list.filter(t => getTenderStatus(t.durum).tone === tenderFilter);
        return list;
    }, [tenders, tenderSearch, tenderFilter]);

    /* KPI'lar */
    const totalOffers = useMemo(() => Object.values(offersByTender).flat().length, [offersByTender]);
    const pendingOffers = useMemo(() => Object.values(offersByTender).flat().filter(o => !['kabul', 'red'].includes(String(o.durum || '').toLowerCase())).length, [offersByTender]);
    const activeTenders = useMemo(() => tenders.filter(t => getTenderStatus(t.durum).tone === 'active').length, [tenders]);

    const compareList = useMemo(() => {
        const s = new Set(compareIds.map(String));
        return scoredOffers.filter(o => s.has(String(o.id))).slice(0, 3);
    }, [compareIds, scoredOffers]);

    /* ─── İşlemler ─── */
    const toggleCompare = (id) => {
        setCompareIds(prev => {
            const k = String(id);
            if (prev.map(String).includes(k)) return prev.filter(i => String(i) !== k);
            if (prev.length >= 3) return prev;
            return [...prev, id];
        });
    };

    const toggleShortlist = (id) => {
        setShortlist(prev => {
            const k = String(id);
            if (prev.map(String).includes(k)) return prev.filter(i => String(i) !== k);
            return [...prev, id];
        });
    };

    const updateStatus = async (offerId, status) => {
        setStatusUpdating(offerId);
        const { error: err } = await supabase.from('ihale_teklifleri').update({ durum: status }).eq('id', offerId);
        setStatusUpdating(null);
        if (err) { setError('Durum güncellenemedi.'); return; }
        setOffersByTender(prev => {
            const k = String(selectedId);
            return { ...prev, [k]: (prev[k] || []).map(o => o.id === offerId ? { ...o, durum: status } : o) };
        });

        /* Enes Doğanay | 13 Nisan 2026: Kabul/Red bildirimini teklif veren kullanıcıya gönder */
        const offer = rawOffers.find(o => o.id === offerId);
        if (offer?.user_id && selectedTender) {
            const statusLabel = status === 'kabul' ? 'kabul edildi' : 'reddedildi';
            supabase.from('bildirimler').insert({
                user_id: offer.user_id,
                type: 'tender_offer_status',
                title: `Teklifiniz ${statusLabel}`,
                message: `"${selectedTender.baslik}" ihalesine verdiğiniz teklif ${statusLabel}.`,
                firma_id: String(companyId),
                is_read: false,
                metadata: {
                    ihale_id: selectedTender.id,
                    ihale_baslik: selectedTender.baslik,
                    teklif_id: offerId,
                    durum: status,
                },
            }).then(() => {});
        }
    };

    const openFile = async (offer) => {
        if (!offer?.ek_dosya_url) return;
        if (offer.ek_dosya_url.startsWith('http')) {
            window.open(offer.ek_dosya_url, '_blank', 'noopener,noreferrer');
            return;
        }
        const { data } = await supabase.storage.from('teklif-ekleri').createSignedUrl(offer.ek_dosya_url, 300);
        if (data?.signedUrl) window.open(data.signedUrl, '_blank', 'noopener,noreferrer');
    };

    /* Enes Doğanay | 13 Nisan 2026: İletişime geç — teklif verenin profil + firma bilgilerini getir */
    const openContact = async (offer) => {
        setContactLoading(true);
        const info = {
            name: offer.gonderen_ad_soyad,
            email: offer.gonderen_email,
            firma: offer.gonderen_firma_adi || null,
            phone: null,
            firmaPhone: null,
            firmaEmail: null,
        };

        /* Profil tablosundan telefon */
        if (offer.user_id) {
            const { data: prof } = await supabase.from('profiles').select('phone').eq('id', offer.user_id).maybeSingle();
            if (prof?.phone) info.phone = prof.phone;
        }

        /* Firma tablosundan telefon ve e-posta */
        if (offer.gonderen_firma_id) {
            const { data: firma } = await supabase.from('firmalar').select('telefon, eposta').eq('firmaID', offer.gonderen_firma_id).maybeSingle();
            if (firma?.telefon) info.firmaPhone = firma.telefon;
            if (firma?.eposta) info.firmaEmail = firma.eposta;
        }

        setContactPopup(info);
        setContactLoading(false);
    };

    /* Enes Doğanay | 13 Nisan 2026: İhaleye teklif veren herkese bildirim gönder */
    const notifyOfferSubmitters = async (tender, type, title, message) => {
        const offers = offersByTender[String(tender.id)] || [];
        const uniqueUsers = [...new Set(offers.map(o => o.user_id).filter(Boolean))];
        if (uniqueUsers.length === 0) return;
        const rows = uniqueUsers.map(uid => ({
            user_id: uid,
            type,
            title,
            message,
            firma_id: String(companyId),
            is_read: false,
            metadata: { ihale_id: tender.id, ihale_baslik: tender.baslik },
        }));
        await supabase.from('bildirimler').insert(rows).then(() => {});
    };

    /* Enes Doğanay | 13 Nisan 2026: Düzenleme modalını aç — mevcut ihale verileriyle formu doldur */
    const openEditModal = (tender) => {
        let teslimIl = tender.teslim_il || '';
        let teslimIlce = tender.teslim_ilce || '';
        if (!teslimIl && tender.il_ilce) {
            const parts = tender.il_ilce.split('/').map(s => s.trim());
            teslimIl = parts[0] || '';
            teslimIlce = parts[1] || '';
        }
        setEditForm({
            id: tender.id,
            baslik: tender.baslik || '',
            aciklama: tender.aciklama || '',
            ihale_tipi: tender.ihale_tipi || 'Açık İhale',
            kdv_durumu: tender.kdv_durumu || 'haric',
            yayin_tarihi: toDateInput(tender.yayin_tarihi),
            son_basvuru_tarihi: toDateInput(tender.son_basvuru_tarihi),
            teslim_suresi: tender.teslim_suresi || '',
            durum: tender.durum || 'canli',
            referans_no: tender.referans_no || '',
            teslim_il: teslimIl,
            teslim_ilce: teslimIlce,
            gereksinimler: tender.gereksinimler || [],
        });
        setEditError('');
        setEditReqMadde('');
        setEditReqAciklama('');
        setEditModal(true);
    };

    /* Enes Doğanay | 13 Nisan 2026: Düzenleme formunu kaydet */
    const handleEditSave = async () => {
        if (!editForm) return;
        if (!editForm.baslik.trim()) { setEditError('İhale başlığı zorunludur.'); return; }
        setEditSaving(true);
        setEditError('');
        try {
            const payload = {
                baslik: editForm.baslik,
                aciklama: editForm.aciklama,
                ihale_tipi: editForm.ihale_tipi,
                kdv_durumu: editForm.kdv_durumu,
                yayin_tarihi: editForm.yayin_tarihi,
                son_basvuru_tarihi: editForm.son_basvuru_tarihi,
                teslim_suresi: editForm.teslim_suresi,
                durum: editForm.durum,
                referans_no: editForm.referans_no,
                teslim_il: editForm.teslim_il,
                teslim_ilce: editForm.teslim_ilce,
                il_ilce: [editForm.teslim_il, editForm.teslim_ilce].filter(Boolean).join(' / '),
                gereksinimler: editForm.gereksinimler,
            };
            await updateTender(editForm.id, payload);
            /* State güncelle */
            setTenders(prev => prev.map(t => t.id === editForm.id ? { ...t, ...payload } : t));
            setEditModal(false);
            /* Bildirim gönder */
            const tender = tenders.find(t => t.id === editForm.id);
            if (tender) {
                await notifyOfferSubmitters(tender, 'tender_updated', 'İhale bilgileri güncellendi', `"${editForm.baslik}" ihalesinin bilgileri güncellendi.`);
            }
        } catch (err) {
            setEditError(err.message || 'Güncelleme başarısız.');
        } finally {
            setEditSaving(false);
        }
    };

    /* Enes Doğanay | 13 Nisan 2026: Gereksinim ekle/sil (edit modal) */
    const addEditReq = () => {
        if (!editReqMadde.trim()) return;
        const item = { id: Date.now(), madde: editReqMadde.trim(), aciklama: editReqAciklama.trim() };
        setEditForm(p => ({ ...p, gereksinimler: [...p.gereksinimler, item] }));
        setEditReqMadde('');
        setEditReqAciklama('');
    };
    const removeEditReq = (id) => setEditForm(p => ({ ...p, gereksinimler: p.gereksinimler.filter(g => g.id !== id) }));

    /* Enes Doğanay | 13 Nisan 2026: İhale sil */
    const handleDeleteTender = async (id) => {
        try {
            const tender = tenders.find(t => t.id === id);
            await deleteTender(id);
            setDeleteConfirmId(null);
            if (tender) {
                await notifyOfferSubmitters(tender, 'tender_cancelled', 'İhale iptal edildi', `"${tender.baslik}" ihalesi iptal edildi/silindi.`);
            }
            setTenders(prev => prev.filter(t => t.id !== id));
            setOffersByTender(prev => { const n = { ...prev }; delete n[String(id)]; return n; });
            if (String(selectedId) === String(id)) setSelectedId(tenders.find(t => t.id !== id)?.id || null);
        } catch (err) {
            setError(err.message || 'İhale silinemedi.');
        }
    };

    /* Enes Doğanay | 13 Nisan 2026: İhaleyi erken kapat */
    /* Enes Doğanay | 13 Nisan 2026: Tüm mevcut alanları gönder — Edge Function null alanları DB'ye yazıyor */
    const handleCloseTender = async (id) => {
        setClosingTenderId(id);
        try {
            const tender = tenders.find(t => t.id === id);
            if (!tender) throw new Error('İhale bulunamadı.');
            await updateTender(id, {
                baslik: tender.baslik,
                aciklama: tender.aciklama || '',
                ihale_tipi: tender.ihale_tipi || '',
                kdv_durumu: tender.kdv_durumu || 'haric',
                yayin_tarihi: tender.yayin_tarihi || '',
                son_basvuru_tarihi: tender.son_basvuru_tarihi || '',
                teslim_suresi: tender.teslim_suresi || '',
                teslim_il: tender.teslim_il || '',
                teslim_ilce: tender.teslim_ilce || '',
                referans_no: tender.referans_no || '',
                gereksinimler: tender.gereksinimler || null,
                davet_emailleri: tender.davet_emailleri || null,
                davetli_firmalar: tender.davetli_firmalar || null,
                ek_dosyalar: tender.ek_dosyalar || null,
                durum: 'kapali',
            });
            setTenders(prev => prev.map(t => t.id === id ? { ...t, durum: 'kapali' } : t));
            setCloseConfirmId(null);
            if (tender) {
                await notifyOfferSubmitters(tender, 'tender_closed', 'İhale kapandı', `"${tender.baslik}" ihalesi kapanmıştır.`);
            }
        } catch (err) {
            setError(err.message || 'İhale kapatılamadı.');
        } finally {
            setClosingTenderId(null);
        }
    };

    /* Enes Doğanay | 13 Nisan 2026: Veri yeniden yükleme (silme/güncelleme sonrası) */
    const reloadTenders = async () => {
        const res = await supabase
            .from('firma_ihaleleri')
            .select('id, baslik, aciklama, referans_no, ihale_tipi, kategori, butce_notu, yayin_tarihi, son_basvuru_tarihi, durum, teslim_il, teslim_ilce, il_ilce, teslim_suresi, kdv_durumu, gereksinimler, created_at')
            .eq('firma_id', String(companyId))
            .order('created_at', { ascending: false });
        if (res.data) setTenders(res.data);
    };

    /* ─── Render ─── */

    if (loading) {
        return (
            <section className="tom-screen">
                <div className="tom-loading">
                    <div className="tom-loading__spinner" />
                    <p>İhaleler ve teklifler yükleniyor...</p>
                </div>
            </section>
        );
    }

    if (error && tenders.length === 0) {
        return (
            <section className="tom-screen">
                <div className="tom-error-state">
                    <span className="material-symbols-outlined">error_outline</span>
                    <h3>Bir Sorun Oluştu</h3>
                    <p>{error}</p>
                </div>
            </section>
        );
    }

    return (
        <section className="tom-screen">
            {/* ═══ Hero Banner ═══ */}
            <div className="tom-hero">
                <div className="tom-hero__text">
                    <h1>
                        <span className="material-symbols-outlined">gavel</span>
                        İhalelerim & Gelen Teklifler
                    </h1>
                    <p>Tüm ihalelerinizi tek ekranda yönetin, teklifleri karşılaştırın ve hızlı karar verin.</p>
                </div>
                <div className="tom-hero__stats">
                    <div className="tom-stat">
                        <span className="material-symbols-outlined">description</span>
                        <div><strong>{tenders.length}</strong><span>Toplam İhale</span></div>
                    </div>
                    <div className="tom-stat tom-stat--green">
                        <span className="material-symbols-outlined">radio_button_checked</span>
                        <div><strong>{activeTenders}</strong><span>Aktif</span></div>
                    </div>
                    <div className="tom-stat">
                        <span className="material-symbols-outlined">mail</span>
                        <div><strong>{totalOffers}</strong><span>Gelen Teklif</span></div>
                    </div>
                    <div className="tom-stat tom-stat--amber">
                        <span className="material-symbols-outlined">pending</span>
                        <div><strong>{pendingOffers}</strong><span>Bekleyen</span></div>
                    </div>
                </div>
            </div>

            {/* ═══ Hata Bildirimi ═══ */}
            {error && (
                <div className="tom-toast">
                    <span className="material-symbols-outlined">warning</span>
                    <span>{error}</span>
                    <button onClick={() => setError('')}><span className="material-symbols-outlined">close</span></button>
                </div>
            )}

            {/* ═══ Ana Düzen ═══ */}
            <div className="tom-body">
                {/* ─── Sol Panel: İhale Listesi ─── */}
                <aside className="tom-sidebar">
                    <div className="tom-sidebar__head">
                        <h2>İhale Listesi</h2>
                        <span className="tom-sidebar__count">{filteredTenders.length}</span>
                    </div>

                    <div className="tom-sidebar__search">
                        <span className="material-symbols-outlined">search</span>
                        <input
                            value={tenderSearch}
                            onChange={e => setTenderSearch(e.target.value)}
                            placeholder="İhale ara..."
                        />
                        {tenderSearch && (
                            <button className="tom-sidebar__clear" onClick={() => setTenderSearch('')}>
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        )}
                    </div>

                    <div className="tom-sidebar__filters">
                        {[
                            { key: 'all', label: 'Tümü' },
                            { key: 'active', label: 'Aktif' },
                            { key: 'closed', label: 'Kapandı' },
                            { key: 'draft', label: 'Taslak' },
                        ].map(f => (
                            <button
                                key={f.key}
                                className={`tom-pill${tenderFilter === f.key ? ' tom-pill--on' : ''}`}
                                onClick={() => setTenderFilter(f.key)}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>

                    <div className="tom-sidebar__list">
                        {filteredTenders.length === 0 ? (
                            <div className="tom-empty-mini">
                                <span className="material-symbols-outlined">search_off</span>
                                <p>İhale bulunamadı</p>
                            </div>
                        ) : (
                            filteredTenders.map(t => {
                                const st = getTenderStatus(t.durum);
                                const cnt = (offersByTender[String(t.id)] || []).length;
                                const isActive = String(selectedId) === String(t.id);
                                const dl = daysUntil(t.son_basvuru_tarihi);
                                return (
                                    <button
                                        key={t.id}
                                        className={`tom-tender-card${isActive ? ' tom-tender-card--active' : ''}`}
                                        onClick={() => { setSelectedId(t.id); setCompareIds([]); setExpandedOfferId(null); setOfferFilter('all'); }}
                                    >
                                        <div className={`tom-tender-card__bar tom-tender-card__bar--${st.tone}`} />
                                        <div className="tom-tender-card__body">
                                            <div className="tom-tender-card__top">
                                                <h3>{t.baslik}</h3>
                                                <span className={`tom-badge tom-badge--${st.tone}`}>
                                                    <span className="material-symbols-outlined">{st.icon}</span>
                                                    {st.label}
                                                </span>
                                            </div>
                                            <div className="tom-tender-card__meta">
                                                <span className="tom-tender-card__offers">
                                                    <span className="material-symbols-outlined">mail</span>
                                                    {cnt} teklif
                                                </span>
                                                {dl !== null && (
                                                    <span className={dl <= 3 && dl >= 0 ? 'tom-deadline--urgent' : dl < 0 ? 'tom-deadline--past' : ''}>
                                                        <span className="material-symbols-outlined">schedule</span>
                                                        {dl > 0 ? `${dl} gün kaldı` : dl === 0 ? 'Son gün!' : 'Süre doldu'}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })
                        )}
                    </div>
                </aside>

                {/* ─── Sağ Panel: Detay & Teklifler ─── */}
                <main className="tom-main">
                    {!selectedTender ? (
                        <div className="tom-empty">
                            <span className="material-symbols-outlined">touch_app</span>
                            <h3>İhale Seçin</h3>
                            <p>Detayları ve gelen teklifleri görmek için soldan bir ihale seçin.</p>
                        </div>
                    ) : (
                        <>
                            {/* ── İhale Bilgi Kartı ── */}
                            <div className="tom-info-card">
                                <button className="tom-info-card__toggle" onClick={() => setShowTenderInfo(p => !p)}>
                                    <div className="tom-info-card__title-row">
                                        <h2>{selectedTender.baslik}</h2>
                                        <div className="tom-info-card__tags">
                                            {selectedTender.referans_no && <span className="tom-tag"><span className="material-symbols-outlined">tag</span>Ref: {selectedTender.referans_no}</span>}
                                            {selectedTender.ihale_tipi && <span className="tom-tag">{selectedTender.ihale_tipi}</span>}
                                            {selectedTender.kategori && <span className="tom-tag">{selectedTender.kategori}</span>}
                                        </div>
                                    </div>
                                    <span className="material-symbols-outlined tom-info-card__chevron">{showTenderInfo ? 'expand_less' : 'expand_more'}</span>
                                </button>

                                {showTenderInfo && (
                                    <div className="tom-info-card__body">
                                        <p className="tom-info-card__desc">{selectedTender.aciklama || 'Bu ihale için açıklama girilmemiş.'}</p>
                                        <div className="tom-info-card__grid">
                                            <div className="tom-info-cell">
                                                <span className="material-symbols-outlined">calendar_today</span>
                                                <div><small>Yayın Tarihi</small><strong>{formatDate(selectedTender.yayin_tarihi)}</strong></div>
                                            </div>
                                            <div className="tom-info-cell">
                                                <span className="material-symbols-outlined">event_busy</span>
                                                <div><small>Son Başvuru</small><strong>{formatDate(selectedTender.son_basvuru_tarihi)}</strong></div>
                                            </div>
                                            <div className="tom-info-cell">
                                                <span className="material-symbols-outlined">location_on</span>
                                                <div><small>Teslim Lokasyonu</small><strong>{[selectedTender.teslim_il, selectedTender.teslim_ilce].filter(Boolean).join(' / ') || selectedTender.il_ilce || '—'}</strong></div>
                                            </div>
                                            <div className="tom-info-cell">
                                                <span className="material-symbols-outlined">local_shipping</span>
                                                <div><small>Teslim Süresi</small><strong>{selectedTender.teslim_suresi || '—'}</strong></div>
                                            </div>
                                            {selectedTender.butce_notu && (
                                                <div className="tom-info-cell">
                                                    <span className="material-symbols-outlined">account_balance_wallet</span>
                                                    <div><small>Bütçe</small><strong>{selectedTender.butce_notu}</strong></div>
                                                </div>
                                            )}
                                            {selectedTender.kdv_durumu && (
                                                <div className="tom-info-cell">
                                                    <span className="material-symbols-outlined">receipt_long</span>
                                                    <div><small>KDV Durumu</small><strong>{selectedTender.kdv_durumu}</strong></div>
                                                </div>
                                            )}
                                        </div>
                                        {/* Enes Doğanay | 13 Nisan 2026: İhale yönetim aksiyonları — düzenle/kapat/sil */}
                                        {/* Enes Doğanay | 13 Nisan 2026: Kapanan/iptal edilen ihalede düzenle deaktif */}
                                        <div className="tom-tender-actions">
                                            {(() => {
                                                const tenderTone = getTenderStatus(selectedTender.durum).tone;
                                                const isClosed = tenderTone === 'closed' || tenderTone === 'cancelled';
                                                return (
                                                    <button className="tom-btn tom-btn--edit" onClick={() => openEditModal(selectedTender)} disabled={isClosed} title={isClosed ? 'Kapanan ihale düzenlenemez' : 'Düzenle'}>
                                                        <span className="material-symbols-outlined">edit</span>
                                                        Düzenle
                                                    </button>
                                                );
                                            })()}
                                            {getTenderStatus(selectedTender.durum).tone === 'active' && (
                                                closeConfirmId === selectedTender.id ? (
                                                    <div className="tom-confirm-inline">
                                                        <span>İhaleyi kapatmak istediğinize emin misiniz?</span>
                                                        <button className="tom-btn tom-btn--confirm" onClick={() => handleCloseTender(selectedTender.id)} disabled={closingTenderId === selectedTender.id}>
                                                            {closingTenderId === selectedTender.id ? 'Kapatılıyor…' : 'Evet, Kapat'}
                                                        </button>
                                                        <button className="tom-btn tom-btn--cancel-sm" onClick={() => setCloseConfirmId(null)}>İptal</button>
                                                    </div>
                                                ) : (
                                                    <button className="tom-btn tom-btn--close-tender" onClick={() => setCloseConfirmId(selectedTender.id)}>
                                                        <span className="material-symbols-outlined">lock</span>
                                                        İhaleyi Kapat
                                                    </button>
                                                )
                                            )}
                                            {deleteConfirmId === selectedTender.id ? (
                                                <div className="tom-confirm-inline">
                                                    <span>Silmek istediğinize emin misiniz?</span>
                                                    <button className="tom-btn tom-btn--confirm tom-btn--confirm-red" onClick={() => handleDeleteTender(selectedTender.id)}>Evet, Sil</button>
                                                    <button className="tom-btn tom-btn--cancel-sm" onClick={() => setDeleteConfirmId(null)}>İptal</button>
                                                </div>
                                            ) : (
                                                <button className="tom-btn tom-btn--delete-tender" onClick={() => setDeleteConfirmId(selectedTender.id)}>
                                                    <span className="material-symbols-outlined">delete</span>
                                                    Sil
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* ── Teklifler Bölümü ── */}
                            <div className="tom-offers-section">
                                {/* Toolbar */}
                                <div className="tom-offers-toolbar">
                                    <div className="tom-offers-toolbar__left">
                                        <h3>
                                            Gelen Teklifler
                                            <span className="tom-count-badge">{displayOffers.length}</span>
                                        </h3>
                                    </div>
                                    <div className="tom-offers-toolbar__right">
                                        <button
                                            className={`tom-btn-icon${showScorePanel ? ' tom-btn-icon--active' : ''}`}
                                            onClick={() => setShowScorePanel(p => !p)}
                                            title="Puanlama Ayarları"
                                        >
                                            <span className="material-symbols-outlined">tune</span>
                                        </button>
                                        <div className="tom-sort-wrap">
                                            <span className="material-symbols-outlined">sort</span>
                                            <select value={offerSort} onChange={e => setOfferSort(e.target.value)} className="tom-sort-select">
                                                <option value="score">Puana Göre</option>
                                                <option value="price-asc">Fiyat ↑</option>
                                                <option value="price-desc">Fiyat ↓</option>
                                                <option value="delivery">Teslim Süresi</option>
                                                <option value="date">Tarih (Yeni)</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Filter Chips */}
                                <div className="tom-offers-filters">
                                    {[
                                        { key: 'all', label: 'Tümü', icon: 'apps' },
                                        { key: 'gonderildi', label: 'Değerlendiriliyor', icon: 'hourglass_top' },
                                        { key: 'kabul', label: 'Kabul', icon: 'check_circle' },
                                        { key: 'red', label: 'Reddedilen', icon: 'cancel' },
                                        { key: 'shortlist', label: 'Favoriler', icon: 'star' },
                                    ].map(f => (
                                        <button
                                            key={f.key}
                                            className={`tom-chip${offerFilter === f.key ? ' tom-chip--on' : ''}`}
                                            onClick={() => setOfferFilter(f.key)}
                                        >
                                            <span className="material-symbols-outlined">{f.icon}</span>
                                            {f.label}
                                        </button>
                                    ))}
                                </div>

                                {/* Puanlama Paneli (Açılır/Kapanır) */}
                                {showScorePanel && (
                                    <div className="tom-score-panel">
                                        <div className="tom-score-panel__head">
                                            <h4><span className="material-symbols-outlined">tune</span> Akıllı Puanlama Ağırlıkları</h4>
                                            <p>Kriterlerin ağırlığını kaydırarak teklifleri kendi önceliklerinize göre sıralayın.</p>
                                        </div>
                                        <div className="tom-score-panel__sliders">
                                            {[
                                                { key: 'price', label: 'Fiyat Önceliği', icon: 'payments', color: '#059669' },
                                                { key: 'delivery', label: 'Teslim Hızı', icon: 'local_shipping', color: '#d97706' },
                                            ].map(s => (
                                                <div key={s.key} className="tom-slider-row">
                                                    <div className="tom-slider-row__label">
                                                        <span className="material-symbols-outlined" style={{ color: s.color }}>{s.icon}</span>
                                                        <span>{s.label}</span>
                                                        <strong style={{ color: s.color }}>{weights[s.key]}%</strong>
                                                    </div>
                                                    <input
                                                        type="range"
                                                        min="0" max="100"
                                                        value={weights[s.key]}
                                                        onChange={e => setWeights(p => ({ ...p, [s.key]: Number(e.target.value) }))}
                                                        style={{ accentColor: s.color }}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Teklif Kartları */}
                                {displayOffers.length === 0 ? (
                                    <div className="tom-empty">
                                        <span className="material-symbols-outlined">inbox</span>
                                        <h3>Teklif Bulunamadı</h3>
                                        <p>{offerFilter !== 'all' ? 'Bu filtrede teklif yoktur, filtreyi değiştirmeyi deneyin.' : 'Bu ihaleye henüz teklif gelmedi.'}</p>
                                    </div>
                                ) : (
                                    <div className="tom-offer-list">
                                        {displayOffers.map((offer, idx) => {
                                            const st = getOfferStatus(offer.durum);
                                            const isShort = shortlist.map(String).includes(String(offer.id));
                                            const isCompare = compareIds.map(String).includes(String(offer.id));
                                            const isExpanded = expandedOfferId === offer.id;
                                            const kalemler = Array.isArray(offer.kalemler) ? offer.kalemler : [];
                                            const isUpdating = statusUpdating === offer.id;
                                            const isHighlighted = highlightOfferId === offer.id;

                                            return (
                                                <div
                                                    key={offer.id}
                                                    ref={isHighlighted ? highlightRef : null}
                                                    className={`tom-offer-card${isExpanded ? ' tom-offer-card--expanded' : ''}${isCompare ? ' tom-offer-card--compare' : ''}${isHighlighted ? ' tom-offer-card--highlight' : ''}`}
                                                >
                                                    {/* Sıralama rozeti — ilk 3 teklif (puan sıralamasında) */}
                                                    {idx < 3 && offerSort === 'score' && (
                                                        <div className={`tom-rank tom-rank--${idx + 1}`}>#{idx + 1}</div>
                                                    )}

                                                    {/* Ana satır */}
                                                    <div className="tom-offer-card__main" onClick={() => setExpandedOfferId(isExpanded ? null : offer.id)}>
                                                        <ScoreRing score={offer._score.overall} />

                                                        <div className="tom-offer-card__info">
                                                            <div className="tom-offer-card__company">
                                                                <strong>{offer.gonderen_firma_adi || offer.gonderen_ad_soyad}</strong>
                                                                <span className="tom-offer-card__email">{offer.gonderen_email}</span>
                                                            </div>
                                                            <div className="tom-offer-card__metrics">
                                                                <div className="tom-metric">
                                                                    <span className="material-symbols-outlined">payments</span>
                                                                    <strong>{renderOfferAmount(offer)}</strong>
                                                                    {offer.kdv_dahil !== undefined && (
                                                                        <small>{offer.kdv_dahil ? 'KDV Dahil' : 'KDV Hariç'}</small>
                                                                    )}
                                                                </div>
                                                                <div className="tom-metric">
                                                                    <span className="material-symbols-outlined">local_shipping</span>
                                                                    <strong>{offer.teslim_suresi_gun ? `${offer.teslim_suresi_gun} gün` : '—'}</strong>
                                                                </div>
                                                                <span className={`tom-offer-status tom-offer-status--${st.tone}`}>
                                                                    <span className="material-symbols-outlined">{st.icon}</span>
                                                                    {st.label}
                                                                </span>
                                                                <span className="tom-offer-card__time">{timeAgo(offer.created_at)}</span>
                                                            </div>
                                                        </div>

                                                        {/* Hızlı Aksiyonlar */}
                                                        <div className="tom-offer-card__actions" onClick={e => e.stopPropagation()}>
                                                            <button
                                                                className={`tom-icon-btn${isShort ? ' tom-icon-btn--starred' : ''}`}
                                                                onClick={() => toggleShortlist(offer.id)}
                                                                title={isShort ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
                                                            >
                                                                <span className="material-symbols-outlined">{isShort ? 'star' : 'star_outline'}</span>
                                                            </button>
                                                            <button
                                                                className="tom-icon-btn tom-icon-btn--contact"
                                                                onClick={() => openContact(offer)}
                                                                title="İletişime Geç"
                                                            >
                                                                <span className="material-symbols-outlined">contact_phone</span>
                                                            </button>
                                                            <label className="tom-compare-check" title="Karşılaştır">
                                                                <input type="checkbox" checked={isCompare} onChange={() => toggleCompare(offer.id)} />
                                                                <span className="material-symbols-outlined">compare_arrows</span>
                                                            </label>
                                                        </div>
                                                    </div>

                                                    {/* Genişletilmiş Detay */}
                                                    {isExpanded && (
                                                        <div className="tom-offer-card__detail">
                                                            {/* Puan Detayı */}
                                                            <div className="tom-score-breakdown">
                                                                <h4>Puan Detayı</h4>
                                                                <div className="tom-score-bars">
                                                                    {[
                                                                        { label: 'Fiyat', val: offer._score.price, cls: 'green' },
                                                                        { label: 'Teslim', val: offer._score.delivery, cls: 'amber' },
                                                                    ].map(b => (
                                                                        <div key={b.label} className="tom-score-bar">
                                                                            <span>{b.label}</span>
                                                                            <div className="tom-bar">
                                                                                <div className={`tom-bar__fill tom-bar__fill--${b.cls}`} style={{ width: `${b.val}%` }} />
                                                                            </div>
                                                                            <strong>{b.val}</strong>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>

                                                            {/* Teslim Açıklaması */}
                                                            {offer.teslim_aciklamasi && (
                                                                <div className="tom-detail-row">
                                                                    <span className="material-symbols-outlined">info</span>
                                                                    <div><small>Teslim Açıklaması</small><p>{offer.teslim_aciklamasi}</p></div>
                                                                </div>
                                                            )}

                                                            {/* Tedarikçi Notu */}
                                                            {offer.not_field && (
                                                                <div className="tom-detail-row">
                                                                    <span className="material-symbols-outlined">sticky_note_2</span>
                                                                    <div><small>Tedarikçi Notu</small><p>{offer.not_field}</p></div>
                                                                </div>
                                                            )}

                                                            {/* Enes Doğanay | 14 Nisan 2026: Kalem bazlı para birimi — her kalemde para_birimi göster */}
                                                            {/* Enes Doğanay | 14 Nisan 2026: Birim sütunu kaldırıldı — teklif formunda girilmiyor */}
                                                            {/* Teklif Kalemleri */}
                                                            {kalemler.length > 0 && (
                                                                <div className="tom-kalemler">
                                                                    <h4>
                                                                        <span className="material-symbols-outlined">list_alt</span>
                                                                        Teklif Kalemleri ({kalemler.length})
                                                                    </h4>
                                                                    <div className="tom-kalemler__wrap">
                                                                        <table>
                                                                            <thead>
                                                                                <tr>
                                                                                    <th>Madde</th>
                                                                                    <th>Miktar</th>
                                                                                    <th>Birim Fiyat</th>
                                                                                    <th>Para Birimi</th>
                                                                                    <th>Toplam</th>
                                                                                    <th>Açıklama</th>
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
                                                                                            <td>{k.aciklama || k.not || '—'}</td>
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
                                                                                <div className="tom-kalemler__grouped-total">
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

                                                            {/* Enes Doğanay | 13 Nisan 2026: Kişisel Not kaldırıldı */}

                                                            {/* Aksiyon Butonları */}
                                                            <div className="tom-offer-card__footer">
                                                                {(offer.ek_dosya_url || offer.ek_dosya_adi) && (
                                                                    <button className="tom-btn tom-btn--outline" onClick={() => openFile(offer)}>
                                                                        <span className="material-symbols-outlined">attach_file</span>
                                                                        {offer.ek_dosya_adi || 'Ek Dosya'}
                                                                    </button>
                                                                )}
                                                                {/* Enes Doğanay | 13 Nisan 2026: Kabul/Red butonları sadece henüz karar verilmemiş tekliflerde gösterilsin */}
                                                                {!['kabul', 'red'].includes(String(offer.durum || '').toLowerCase()) && (
                                                                <div className="tom-offer-card__footer-right">
                                                                    <button
                                                                        className="tom-btn tom-btn--reject"
                                                                        onClick={() => updateStatus(offer.id, 'red')}
                                                                        disabled={isUpdating}
                                                                    >
                                                                        <span className="material-symbols-outlined">close</span>
                                                                        Reddet
                                                                    </button>
                                                                    <button
                                                                        className="tom-btn tom-btn--accept"
                                                                        onClick={() => updateStatus(offer.id, 'kabul')}
                                                                        disabled={isUpdating}
                                                                    >
                                                                        <span className="material-symbols-outlined">check</span>
                                                                        Kabul Et
                                                                    </button>
                                                                </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* ── Karşılaştırma Modu ── */}
                                {compareList.length >= 2 && (
                                    <div className="tom-compare">
                                        <div className="tom-compare__head">
                                            <h3>
                                                <span className="material-symbols-outlined">compare_arrows</span>
                                                Karşılaştırma ({compareList.length} teklif)
                                            </h3>
                                            <button className="tom-btn-text" onClick={() => setCompareIds([])}>
                                                <span className="material-symbols-outlined">close</span> Temizle
                                            </button>
                                        </div>
                                        <div className="tom-compare__grid">
                                            {compareList.map(offer => {
                                                const bestPrice = compareList.reduce((b, c) => c._score.price > b._score.price ? c : b).id === offer.id;
                                                const bestDel = compareList.reduce((b, c) => c._score.delivery > b._score.delivery ? c : b).id === offer.id;
                                                const bestScore = compareList.reduce((b, c) => c._score.overall > b._score.overall ? c : b).id === offer.id;

                                                return (
                                                    <div key={offer.id} className={`tom-compare-card${bestScore ? ' tom-compare-card--best' : ''}`}>
                                                        {bestScore && (
                                                            <div className="tom-compare-card__crown">
                                                                <span className="material-symbols-outlined">emoji_events</span>
                                                                En İyi Teklif
                                                            </div>
                                                        )}
                                                        <h4>{offer.gonderen_firma_adi || offer.gonderen_ad_soyad}</h4>
                                                        <div className="tom-compare-card__score">
                                                            <ScoreRing score={offer._score.overall} size={68} />
                                                        </div>
                                                        <div className="tom-compare-card__rows">
                                                            {[
                                                                { label: 'Fiyat', val: renderOfferAmount(offer), score: offer._score.price, cls: 'green', best: bestPrice },
                                                                { label: 'Teslim', val: offer.teslim_suresi_gun ? `${offer.teslim_suresi_gun} gün` : '—', score: offer._score.delivery, cls: 'amber', best: bestDel },
                                                                { label: 'Genel Puan', val: offer._score.overall, score: offer._score.overall, cls: 'blue', best: bestScore },
                                                            ].map(r => (
                                                                <div key={r.label} className={`tom-compare-row${r.best ? ' tom-compare-row--best' : ''}`}>
                                                                    <div className="tom-compare-row__label">
                                                                        <span>{r.label}</span>
                                                                        {r.best && <span className="material-symbols-outlined tom-trophy">emoji_events</span>}
                                                                    </div>
                                                                    <div className="tom-bar tom-bar--sm">
                                                                        <div className={`tom-bar__fill tom-bar__fill--${r.cls}`} style={{ width: `${r.score}%` }} />
                                                                    </div>
                                                                    <strong>{r.val}</strong>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </main>
            </div>

            {/* Enes Doğanay | 13 Nisan 2026: İhale düzenleme modal */}
            {editModal && editForm && (
                <div className="tom-edit-overlay" onClick={() => { if (!editSaving) setEditModal(false); }}>
                    <div className="tom-edit-modal" onClick={e => e.stopPropagation()}>
                        <div className="tom-edit-modal__header">
                            <h2><span className="material-symbols-outlined">edit_note</span> İhaleyi Düzenle</h2>
                            <button className="tom-edit-modal__close" onClick={() => setEditModal(false)} disabled={editSaving}>
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        {editError && (
                            <div className="tom-edit-error">
                                <span className="material-symbols-outlined">error</span>
                                {editError}
                            </div>
                        )}

                        <div className="tom-edit-modal__body">
                            {/* Temel Bilgiler */}
                            <div className="tom-edit-section">
                                <h3><span className="material-symbols-outlined">info</span> Temel Bilgiler</h3>
                                <div className="tom-edit-grid">
                                    <div className="tom-edit-field tom-edit-field--full">
                                        <label>İhale Başlığı *</label>
                                        <input type="text" value={editForm.baslik} onChange={e => setEditForm(p => ({ ...p, baslik: e.target.value }))} placeholder="İhale başlığını girin" />
                                    </div>
                                    <div className="tom-edit-field tom-edit-field--full">
                                        <label>Açıklama</label>
                                        <textarea rows={3} value={editForm.aciklama} onChange={e => setEditForm(p => ({ ...p, aciklama: e.target.value }))} placeholder="İhale açıklaması" />
                                    </div>
                                    <div className="tom-edit-field">
                                        <label>Referans No</label>
                                        <input type="text" value={editForm.referans_no} onChange={e => setEditForm(p => ({ ...p, referans_no: e.target.value }))} placeholder="Ref. numarası" />
                                    </div>
                                    <div className="tom-edit-field">
                                        <label>İhale Tipi</label>
                                        <select value={editForm.ihale_tipi} onChange={e => setEditForm(p => ({ ...p, ihale_tipi: e.target.value }))}>
                                            <option value="Açık İhale">Açık İhale</option>
                                            <option value="Davetli İhale">Davetli İhale</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Tarih & Koşullar */}
                            <div className="tom-edit-section">
                                <h3><span className="material-symbols-outlined">event</span> Tarih & Koşullar</h3>
                                <div className="tom-edit-grid">
                                    <div className="tom-edit-field">
                                        <label>Yayın Tarihi</label>
                                        <input type="date" value={editForm.yayin_tarihi} onChange={e => setEditForm(p => ({ ...p, yayin_tarihi: e.target.value }))} />
                                    </div>
                                    <div className="tom-edit-field">
                                        <label>Son Başvuru Tarihi</label>
                                        <input type="date" value={editForm.son_basvuru_tarihi} onChange={e => setEditForm(p => ({ ...p, son_basvuru_tarihi: e.target.value }))} />
                                    </div>
                                    <div className="tom-edit-field">
                                        <label>Teslim Süresi</label>
                                        <input type="text" value={editForm.teslim_suresi} onChange={e => setEditForm(p => ({ ...p, teslim_suresi: e.target.value }))} placeholder="ör. 30 gün" />
                                    </div>
                                    <div className="tom-edit-field">
                                        <label>KDV Durumu</label>
                                        <select value={editForm.kdv_durumu} onChange={e => setEditForm(p => ({ ...p, kdv_durumu: e.target.value }))}>
                                            <option value="haric">Hariç</option>
                                            <option value="dahil">Dahil</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Lokasyon */}
                            <div className="tom-edit-section">
                                <h3><span className="material-symbols-outlined">location_on</span> Teslim Lokasyonu</h3>
                                <div className="tom-edit-grid">
                                    <div className="tom-edit-field">
                                        <label>İl</label>
                                        <CitySelect value={editForm.teslim_il} onChange={val => setEditForm(p => ({ ...p, teslim_il: val, teslim_ilce: '' }))} />
                                    </div>
                                    <div className="tom-edit-field">
                                        <label>İlçe</label>
                                        <CitySelect
                                            value={editForm.teslim_ilce}
                                            onChange={val => setEditForm(p => ({ ...p, teslim_ilce: val }))}
                                            options={TURKEY_DISTRICTS[editForm.teslim_il] || []}
                                            placeholder="İlçe seçiniz"
                                            icon="map"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Gereksinimler */}
                            <div className="tom-edit-section">
                                <h3><span className="material-symbols-outlined">checklist</span> Gereksinimler</h3>
                                <div className="tom-edit-req-input">
                                    <input
                                        type="text"
                                        placeholder="Gereksinim maddesi"
                                        value={editReqMadde}
                                        onChange={e => setEditReqMadde(e.target.value)}
                                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addEditReq(); } }}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Açıklama (opsiyonel)"
                                        value={editReqAciklama}
                                        onChange={e => setEditReqAciklama(e.target.value)}
                                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addEditReq(); } }}
                                    />
                                    <button type="button" className="tom-btn tom-btn--add-req" onClick={addEditReq} disabled={!editReqMadde.trim()}>
                                        <span className="material-symbols-outlined">add</span>
                                    </button>
                                </div>
                                {editForm.gereksinimler.length > 0 && (
                                    <div className="tom-edit-req-list">
                                        {editForm.gereksinimler.map((g, i) => (
                                            <div key={g.id} className="tom-edit-req-row">
                                                <span className="tom-edit-req-num">{i + 1}</span>
                                                <span className="tom-edit-req-madde">{g.madde}</span>
                                                <span className="tom-edit-req-aciklama">{g.aciklama || '—'}</span>
                                                <button type="button" className="tom-edit-req-remove" onClick={() => removeEditReq(g.id)}>
                                                    <span className="material-symbols-outlined">close</span>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="tom-edit-modal__footer">
                            <button className="tom-btn tom-btn--cancel" onClick={() => setEditModal(false)} disabled={editSaving}>İptal</button>
                            <button className="tom-btn tom-btn--save" onClick={handleEditSave} disabled={editSaving}>
                                <span className="material-symbols-outlined">{editSaving ? 'hourglass_top' : 'save'}</span>
                                {editSaving ? 'Kaydediliyor…' : 'Değişiklikleri Kaydet'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Enes Doğanay | 13 Nisan 2026: İletişime Geç popup overlay */}
            {contactPopup && (
                <div className="tom-contact-overlay" onClick={() => setContactPopup(null)}>
                    <div className="tom-contact-card" onClick={e => e.stopPropagation()}>
                        <button className="tom-contact-card__close" onClick={() => setContactPopup(null)}>
                            <span className="material-symbols-outlined">close</span>
                        </button>
                        <div className="tom-contact-card__avatar">
                            <span className="material-symbols-outlined">person</span>
                        </div>
                        <h3>{contactPopup.name || 'İsimsiz'}</h3>
                        {contactPopup.firma && <p className="tom-contact-card__firma">{contactPopup.firma}</p>}

                        <div className="tom-contact-card__rows">
                            {contactPopup.email && (
                                <a href={`mailto:${contactPopup.email}`} className="tom-contact-row">
                                    <span className="material-symbols-outlined">mail</span>
                                    <div><small>E-posta</small><span>{contactPopup.email}</span></div>
                                </a>
                            )}
                            {contactPopup.phone && (
                                <a href={`tel:${contactPopup.phone}`} className="tom-contact-row">
                                    <span className="material-symbols-outlined">phone</span>
                                    <div><small>Telefon</small><span>{contactPopup.phone}</span></div>
                                </a>
                            )}
                            {contactPopup.firmaPhone && contactPopup.firmaPhone !== contactPopup.phone && (
                                <a href={`tel:${contactPopup.firmaPhone}`} className="tom-contact-row">
                                    <span className="material-symbols-outlined">business</span>
                                    <div><small>Firma Telefon</small><span>{contactPopup.firmaPhone}</span></div>
                                </a>
                            )}
                            {contactPopup.firmaEmail && contactPopup.firmaEmail !== contactPopup.email && (
                                <a href={`mailto:${contactPopup.firmaEmail}`} className="tom-contact-row">
                                    <span className="material-symbols-outlined">domain</span>
                                    <div><small>Firma E-posta</small><span>{contactPopup.firmaEmail}</span></div>
                                </a>
                            )}
                        </div>

                        {!contactPopup.email && !contactPopup.phone && !contactPopup.firmaPhone && !contactPopup.firmaEmail && (
                            <p className="tom-contact-card__empty">Bu kişi/firma için iletişim bilgisi bulunamadı.</p>
                        )}
                    </div>
                </div>
            )}
        </section>
    );
};

export default TenderOffersManagement;
