/* Enes Doğanay | 13 Nisan 2026: İhalelerim & Gelen Teklifler — tamamen yeniden tasarlandı */
/* Enes Doğanay | 13 Nisan 2026: İhale düzenle/sil/kapat + bildirim entegrasyonu */
import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from './supabaseClient';
import { updateTender, deleteTender, createTender as createTenderApi } from './ihaleManagementApi';
import CitySelect from './CitySelect';
import { TURKEY_DISTRICTS } from './turkeyDistricts';
import './TenderOffersManagement.css';
import './Ihaleler.css';

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
    const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
    const sortDropdownRef = useRef(null);
    useEffect(() => {
        if (!sortDropdownOpen) return;
        const handler = (e) => { if (sortDropdownRef.current && !sortDropdownRef.current.contains(e.target)) setSortDropdownOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [sortDropdownOpen]);
    const [compareIds, setCompareIds] = useState([]);
    /* Enes Doğanay | 15 Nisan 2026: Karşılaştırma özelliği onboarding ipucu */
    const [compareHintDismissed, setCompareHintDismissed] = useState(() =>
        localStorage.getItem('tom_compare_hint_never') === '1' || sessionStorage.getItem('tom_compare_hint_dismissed') === '1'
    );
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

    /* Enes Doğanay | 15 Nisan 2026: Akıllı puanlama bilgilendirme popup */
    const [showScoringInfo, setShowScoringInfo] = useState(false);

    /* Enes Doğanay | 15 Nisan 2026: Red nedeni notu */
    const [rejectNotePopup, setRejectNotePopup] = useState(null);
    const [rejectNote, setRejectNote] = useState('');

    /* Enes Doğanay | 15 Nisan 2026: Teklif kabul → ihaleyi kapat mı sorusu */
    const [acceptClosePopup, setAcceptClosePopup] = useState(null);

    /* Enes Doğanay | 15 Nisan 2026: İhale kapatma → görünürlük sorusu */
    const [closeVisibilityPopup, setCloseVisibilityPopup] = useState(null);

    /* Enes Doğanay | 15 Nisan 2026: Kabul edilen teklif statü değiştirme dropdown */
    const [statusDropdownId, setStatusDropdownId] = useState(null);
    /* Enes Doğanay | 15 Nisan 2026: Dropdown statü değişikliği onay popup'ı */
    const [statusConfirmPopup, setStatusConfirmPopup] = useState(null);
    /* Enes Doğanay | 15 Nisan 2026: Statü değişikliği başarı modal */
    const [statusSuccessModal, setStatusSuccessModal] = useState(null);

    /* Enes Doğanay | 15 Nisan 2026: Yeni ihale oluşturma — Ihaleler sayfasındaki 4 adımlı stepper modal */
    const STEPPER_LABELS = [
        { key: 'temel', label: 'Temel Bilgiler', icon: 'edit_note' },
        { key: 'detay', label: 'İhale Detayları', icon: 'tune' },
        { key: 'sartlar', label: 'Teknik Şartlar', icon: 'checklist' },
        { key: 'onizleme', label: 'Önizleme', icon: 'preview' },
    ];
    const CREATE_EMPTY_FORM = { baslik: '', aciklama: '', ihale_tipi: 'Açık İhale', kdv_durumu: 'haric', yayin_tarihi: '', son_basvuru_tarihi: '', teslim_suresi: '', durum: 'canli', referans_no: '', teslim_il: '', teslim_ilce: '', gereksinimler: [], davet_emailleri: [], davetli_firmalar: [], ek_dosyalar: [] };
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createForm, setCreateForm] = useState(CREATE_EMPTY_FORM);
    const [createFormError, setCreateFormError] = useState('');
    const [createFormSaving, setCreateFormSaving] = useState(false);
    const [createStepperStep, setCreateStepperStep] = useState(0);
    const [createYeniGereksinimMadde, setCreateYeniGereksinimMadde] = useState('');
    const [createYeniGereksinimAciklama, setCreateYeniGereksinimAciklama] = useState('');
    const [createEmailInput, setCreateEmailInput] = useState('');
    const [createFirmaSearchTerm, setCreateFirmaSearchTerm] = useState('');
    const [createFirmaSearchResults, setCreateFirmaSearchResults] = useState([]);
    const [createFirmaSearching, setCreateFirmaSearching] = useState(false);
    const createFirmaSearchTimeout = useRef(null);
    const createFileInputRef = useRef(null);
    const createFirmaResultsRef = useRef(null);
    const [createIsVerifiedUser, setCreateIsVerifiedUser] = useState(false);

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

                /* Süresi dolmuş aktif ihaleleri otomatik kapat */
                const now = new Date();
                const expiredIds = rows
                    .filter(t => ['canli', 'active'].includes(String(t.durum).toLowerCase()) && t.son_basvuru_tarihi && new Date(t.son_basvuru_tarihi) < now)
                    .map(t => t.id);
                if (expiredIds.length > 0) {
                    await supabase.from('firma_ihaleleri').update({ durum: 'kapali' }).in('id', expiredIds);
                    rows = rows.map(t => expiredIds.includes(t.id) ? { ...t, durum: 'kapali' } : t);
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

    /* Enes Doğanay | 15 Nisan 2026: Teklif statüsünü güncelle + bildirim + e-posta gönder */
    const updateStatus = async (offerId, status, redNedeni) => {
        setStatusUpdating(offerId);
        const { error: err } = await supabase.from('ihale_teklifleri').update({ durum: status }).eq('id', offerId);
        setStatusUpdating(null);
        if (err) { setError('Durum güncellenemedi.'); return; }
        setOffersByTender(prev => {
            const k = String(selectedId);
            return { ...prev, [k]: (prev[k] || []).map(o => o.id === offerId ? { ...o, durum: status } : o) };
        });

        /* Enes Doğanay | 15 Nisan 2026: Statü değişikliği başarı modal */
        const successMap = {
            kabul: { icon: 'check_circle', title: 'Teklif Kabul Edildi', text: 'Teklif başarıyla kabul edildi. Teklif veren kişiye bildirim ve e-posta gönderildi.', color: '#059669' },
            red: { icon: 'cancel', title: 'Teklif Reddedildi', text: 'Teklif reddedildi. Teklif veren kişiye bildirim ve e-posta gönderildi.', color: '#dc2626' },
            gonderildi: { icon: 'hourglass_top', title: 'Değerlendirmeye Alındı', text: 'Teklif tekrar değerlendirmeye alındı. Teklif veren kişiye bildirim ve e-posta gönderildi.', color: '#2563eb' },
        };
        const sm = successMap[status];
        if (sm) setStatusSuccessModal(sm);

        /* Enes Doğanay | 13 Nisan 2026: Kabul/Red bildirimini teklif veren kullanıcıya gönder */
        const offer = rawOffers.find(o => o.id === offerId);
        if (offer?.user_id && selectedTender) {
            const statusLabel = status === 'kabul' ? 'kabul edildi' : (status === 'red' ? 'reddedildi' : 'değerlendirmeye alındı');
            const message = redNedeni
                ? `"${selectedTender.baslik}" ihalesine verdiğiniz teklif ${statusLabel}. Red nedeni: ${redNedeni}`
                : `"${selectedTender.baslik}" ihalesine verdiğiniz teklif ${statusLabel}.`;
            supabase.from('bildirimler').insert({
                user_id: offer.user_id,
                type: 'tender_offer_status',
                title: `Teklifiniz ${statusLabel}`,
                message,
                firma_id: String(companyId),
                is_read: false,
                metadata: {
                    ihale_id: selectedTender.id,
                    ihale_baslik: selectedTender.baslik,
                    teklif_id: offerId,
                    durum: status,
                    red_nedeni: redNedeni || null,
                },
            }).then(() => {});

            /* Enes Doğanay | 15 Nisan 2026: Kabul/Red/Değerlendirme e-postası gönder */
            sendOfferStatusEmail(offer, status, redNedeni);
        }
    };

    /* Enes Doğanay | 15 Nisan 2026: Teklif kabul/red e-postası — Resend API üzerinden Edge Function ile */
    /* Enes Doğanay | 16 Nisan 2026: Hata detayı eklendi — e-posta gönderim başarısızlığında kullanıcıyı bilgilendir */
    const sendOfferStatusEmail = async (offer, status, redNedeni) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.access_token || !offer.gonderen_email) {
                console.warn('E-posta gönderilemedi: oturum veya alıcı e-posta eksik', { hasToken: !!session?.access_token, email: offer.gonderen_email });
                return;
            }
            console.log('E-posta gönderiliyor:', { to: offer.gonderen_email, status, ihale_baslik: selectedTender?.baslik, gonderen_ad: offer.gonderen_ad_soyad });
            const { data, error: fnError } = await supabase.functions.invoke('ihale-management', {
                body: {
                    action: 'send_offer_status_email',
                    to: offer.gonderen_email,
                    status,
                    ihale_baslik: selectedTender?.baslik || '',
                    gonderen_ad: offer.gonderen_ad_soyad || '',
                    red_nedeni: redNedeni || null,
                    ihale_id: selectedTender?.id || null,
                },
            });
            if (fnError) {
                /* Enes Doğanay | 15 Nisan 2026: Response body'yi oku — edge function hata detayını göster */
                let detail = '';
                try { detail = fnError.context ? await fnError.context.json() : ''; } catch { /* */ }
                console.error('Edge function hatası:', fnError, 'Detay:', detail);
            } else {
                console.log('Teklif durum e-postası gönderildi:', data);
            }
        } catch (e) {
            console.error('Teklif durum e-postası gönderilemedi:', e);
        }
    };

    /* Enes Doğanay | 15 Nisan 2026: teklif-ekleri private bucket — her zaman signed URL ile aç */
    const openFile = async (offer) => {
        if (!offer?.ek_dosya_url) return;
        // Eski kayıtlarda public URL saklanmış olabilir — path kısmını çıkar
        let filePath = offer.ek_dosya_url;
        if (filePath.startsWith('http')) {
            try {
                const url = new URL(filePath);
                const marker = '/teklif-ekleri/';
                const idx = url.pathname.indexOf(marker);
                if (idx !== -1) {
                    filePath = decodeURIComponent(url.pathname.substring(idx + marker.length));
                }
            } catch { /* orijinal path kullan */ }
        }
        const { data } = await supabase.storage.from('teklif-ekleri').createSignedUrl(filePath, 300);
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
    /* Enes Doğanay | 15 Nisan 2026: Görünürlük parametresi eklendi — firma kapattığı ihaleyi herkese göstermek isteyip istemediğini belirler */
    const handleCloseTender = async (id, gorunurluk) => {
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
                kapali_gorunurluk: gorunurluk || 'gizle',
            });
            setTenders(prev => prev.map(t => t.id === id ? { ...t, durum: 'kapali', kapali_gorunurluk: gorunurluk || 'gizle' } : t));
            setCloseConfirmId(null);
            setCloseVisibilityPopup(null);
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

    /* Enes Doğanay | 15 Nisan 2026: İhaleyi tekrarla — kapanan ihaleyi yeni referansla canli olarak kopyalar */
    const handleRepeatTender = async (tender) => {
        try {
            const payload = {
                baslik: tender.baslik,
                aciklama: tender.aciklama || '',
                ihale_tipi: tender.ihale_tipi || 'Açık İhale',
                kdv_durumu: tender.kdv_durumu || 'haric',
                yayin_tarihi: new Date().toISOString().split('T')[0],
                son_basvuru_tarihi: '',
                teslim_suresi: tender.teslim_suresi || '',
                teslim_il: tender.teslim_il || '',
                teslim_ilce: tender.teslim_ilce || '',
                referans_no: (tender.referans_no || '') + '-R',
                gereksinimler: tender.gereksinimler || null,
                davet_emailleri: tender.davet_emailleri || null,
                davetli_firmalar: tender.davetli_firmalar || null,
                ek_dosyalar: tender.ek_dosyalar || null,
                durum: 'canli',
            };
            await createTenderApi(payload);
            await reloadTenders();
        } catch (err) {
            setError(err.message || 'İhale tekrarlanamadı.');
        }
    };

    /* Enes Doğanay | 15 Nisan 2026: Kabul et akışı — kabul sonrası ihaleyi kapat mı sor */
    const handleAcceptOffer = (offerId) => {
        setAcceptClosePopup(offerId);
    };

    const confirmAcceptOffer = async (offerId, shouldClose) => {
        setAcceptClosePopup(null);
        await updateStatus(offerId, 'kabul');
        if (shouldClose && selectedTender) {
            setCloseVisibilityPopup(selectedTender.id);
        }
    };

    /* Enes Doğanay | 15 Nisan 2026: Reddet akışı — opsiyonel not popup */
    const handleRejectOffer = (offerId) => {
        setRejectNotePopup(offerId);
        setRejectNote('');
    };

    const confirmRejectOffer = async () => {
        if (!rejectNotePopup) return;
        await updateStatus(rejectNotePopup, 'red', rejectNote.trim() || null);
        setRejectNotePopup(null);
        setRejectNote('');
    };

    /* Enes Doğanay | 15 Nisan 2026: Stepper modal — referans no üretimi */
    const generateCreateRefNo = useCallback(async () => {
        if (!companyId) return '';
        try {
            const { data: firma } = await supabase.from('firmalar').select('firma_adi, onayli_hesap').eq('firmaID', companyId).maybeSingle();
            if (!firma?.firma_adi) return '';
            setCreateIsVerifiedUser(firma.onayli_hesap === true);
            const prefix = firma.firma_adi.trim().slice(0, 3).toLocaleUpperCase('tr-TR');
            const year = new Date().getFullYear();
            const { data: existing } = await supabase.from('firma_ihaleleri').select('referans_no').eq('firma_id', companyId);
            const myRefs = (existing || []).map(r => r.referans_no).filter(Boolean);
            const pattern = new RegExp(`^TED-${prefix}\\d*-${year}-(\\d+)$`);
            let maxSeq = 0;
            myRefs.forEach(ref => { const m = ref.match(pattern); if (m) maxSeq = Math.max(maxSeq, parseInt(m[1], 10)); });
            const nextSeq = String(maxSeq + 1).padStart(4, '0');
            const { data: others } = await supabase.from('firma_ihaleleri').select('referans_no').neq('firma_id', companyId).like('referans_no', `TED-${prefix}%-${year}-%`);
            const hasSamePrefix = (others || []).length > 0;
            const suffix = hasSamePrefix ? `${prefix}2` : prefix;
            if (hasSamePrefix) {
                const p2 = new RegExp(`^TED-${suffix}-${year}-(\\d+)$`);
                myRefs.forEach(ref => { const m = ref.match(p2); if (m) maxSeq = Math.max(maxSeq, parseInt(m[1], 10)); });
                return `TED-${suffix}-${year}-${String(maxSeq + 1).padStart(4, '0')}`;
            }
            return `TED-${prefix}-${year}-${nextSeq}`;
        } catch { return `TED-${Date.now()}`; }
    }, [companyId]);

    /* Enes Doğanay | 15 Nisan 2026: Stepper modal açma */
    const openCreateModal = async () => {
        const refNo = await generateCreateRefNo();
        setCreateForm({ ...CREATE_EMPTY_FORM, referans_no: refNo, gereksinimler: [], davet_emailleri: [], davetli_firmalar: [], ek_dosyalar: [] });
        setCreateFormError('');
        setCreateYeniGereksinimMadde('');
        setCreateYeniGereksinimAciklama('');
        setCreateEmailInput('');
        setCreateFirmaSearchTerm('');
        setCreateFirmaSearchResults([]);
        setCreateStepperStep(0);
        setShowCreateModal(true);
    };

    // Enes Doğanay | 15 Nisan 2026: Gereksinim ekleme
    const createAddGereksinim = () => {
        if (!createYeniGereksinimMadde.trim()) return;
        const newItem = { id: Date.now(), madde: createYeniGereksinimMadde.trim(), aciklama: createYeniGereksinimAciklama.trim() };
        setCreateForm(p => ({ ...p, gereksinimler: [...p.gereksinimler, newItem] }));
        setCreateYeniGereksinimMadde('');
        setCreateYeniGereksinimAciklama('');
    };
    const createRemoveGereksinim = (id) => setCreateForm(p => ({ ...p, gereksinimler: p.gereksinimler.filter(g => g.id !== id) }));

    // Enes Doğanay | 15 Nisan 2026: E-posta tag input
    const createAddEmail = () => {
        const email = createEmailInput.trim().toLowerCase();
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;
        if (createForm.davet_emailleri.includes(email)) return;
        setCreateForm(p => ({ ...p, davet_emailleri: [...p.davet_emailleri, email] }));
        setCreateEmailInput('');
    };
    const createRemoveEmail = (email) => setCreateForm(p => ({ ...p, davet_emailleri: p.davet_emailleri.filter(e => e !== email) }));
    const createHandleEmailKeyDown = (e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); createAddEmail(); } };

    // Enes Doğanay | 15 Nisan 2026: Davetli firma arama
    const createSearchFirmalar = useCallback(async (term) => {
        if (!term || term.length < 2) { setCreateFirmaSearchResults([]); return; }
        setCreateFirmaSearching(true);
        try {
            const { data } = await supabase.from('firmalar').select('firmaID, firma_adi, onayli_hesap').ilike('firma_adi', `%${term}%`).limit(8);
            setCreateFirmaSearchResults(data || []);
            setTimeout(() => createFirmaResultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 80);
        } catch { setCreateFirmaSearchResults([]); } finally { setCreateFirmaSearching(false); }
    }, []);
    const createHandleFirmaSearch = (val) => {
        setCreateFirmaSearchTerm(val);
        if (createFirmaSearchTimeout.current) clearTimeout(createFirmaSearchTimeout.current);
        createFirmaSearchTimeout.current = setTimeout(() => createSearchFirmalar(val), 300);
    };
    const createAddDavetliFirma = (firma) => {
        if (createForm.davetli_firmalar.some(f => f.firma_id === firma.firmaID)) return;
        setCreateForm(p => ({ ...p, davetli_firmalar: [...p.davetli_firmalar, { firma_id: firma.firmaID, firma_adi: firma.firma_adi, onayli: firma.onayli_hesap === true }] }));
        setCreateFirmaSearchTerm('');
        setCreateFirmaSearchResults([]);
    };
    const createRemoveDavetliFirma = (firmaId) => setCreateForm(p => ({ ...p, davetli_firmalar: p.davetli_firmalar.filter(f => f.firma_id !== firmaId) }));

    // Enes Doğanay | 15 Nisan 2026: Ek dosya yönetimi
    const createHandleFileAdd = (e) => {
        const files = Array.from(e.target.files || []);
        const valid = files.filter(f => f.size <= 10 * 1024 * 1024);
        if (valid.length < files.length) setCreateFormError('10 MB üzeri dosyalar eklenmedi.');
        setCreateForm(p => ({ ...p, ek_dosyalar: [...p.ek_dosyalar, ...valid] }));
        if (createFileInputRef.current) createFileInputRef.current.value = '';
    };
    const createRemoveFile = (idx) => setCreateForm(p => ({ ...p, ek_dosyalar: p.ek_dosyalar.filter((_, i) => i !== idx) }));

    // Enes Doğanay | 15 Nisan 2026: Form gönderimi — Taslak / Yayınla
    const handleCreateFormSubmit = async (e, forceDurum) => {
        if (e) e.preventDefault();
        setCreateFormSaving(true);
        setCreateFormError('');
        try {
            if (createForm.ihale_tipi === 'Davetli İhale' && createForm.davetli_firmalar.length === 0) {
                setCreateFormError('Davetli ihale için en az bir firma eklemeniz gerekiyor.');
                setCreateFormSaving(false);
                return;
            }
            const onaysizFirma = createForm.davetli_firmalar.find(f => !f.onayli);
            if (onaysizFirma) {
                setCreateFormError(`"${onaysizFirma.firma_adi}" henüz onaylı bir firma değil. Lütfen onaysız firmaları kaldırın.`);
                setCreateFormSaving(false);
                return;
            }
            const uploadedFiles = [];
            const newFiles = createForm.ek_dosyalar.filter(f => f instanceof File);
            for (const file of newFiles) {
                const timestamp = Date.now();
                const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
                const filePath = `${createForm.referans_no || 'temp'}/${timestamp}_${safeName}`;
                const { error: uploadError } = await supabase.storage.from('ihale-ekleri').upload(filePath, file, { upsert: false });
                if (uploadError) {
                    setCreateFormError(`"${file.name}" yüklenemedi: ${uploadError.message}`);
                    setCreateFormSaving(false);
                    return;
                }
                const { data: urlData } = supabase.storage.from('ihale-ekleri').getPublicUrl(filePath);
                uploadedFiles.push({ name: file.name, path: filePath, size: file.size, url: urlData.publicUrl });
            }
            const payload = {
                ...createForm,
                durum: forceDurum || createForm.durum,
                il_ilce: [createForm.teslim_il, createForm.teslim_ilce].filter(Boolean).join(' / '),
                ek_dosyalar: uploadedFiles,
            };
            await createTenderApi(payload);
            setShowCreateModal(false);
            await reloadTenders();
        } catch (err) {
            setCreateFormError(err.message || 'Kaydedilemedi.');
        } finally {
            setCreateFormSaving(false);
        }
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
                    {/* Enes Doğanay | 15 Nisan 2026: Bekleyen stat kaldırıldı */}
                    <div className="tom-stat">
                        <span className="material-symbols-outlined">mail</span>
                        <div><strong>{totalOffers}</strong><span>Gelen Teklif</span></div>
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span className="tom-sidebar__count">{filteredTenders.length}</span>
                            {/* Enes Doğanay | 15 Nisan 2026: Yeni ihale oluşturma butonu — stepper modal açar */}
                            <button className="tom-btn tom-btn--create-tender" onClick={openCreateModal}>
                                <span className="material-symbols-outlined">add</span>
                                Yeni İhale Oluştur
                            </button>
                        </div>
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
                                        {/* Enes Doğanay | 15 Nisan 2026: İhale ek dokümanlarını göster */}
                                        {(() => {
                                            let rawEk = selectedTender.ek_dosyalar;
                                            if (typeof rawEk === 'string') try { rawEk = JSON.parse(rawEk); } catch { rawEk = []; }
                                            const ekDosyalar = Array.isArray(rawEk) ? rawEk : [];
                                            if (!ekDosyalar.length) return null;
                                            return (
                                                <div className="tom-info-card__files">
                                                    <h4><span className="material-symbols-outlined">attach_file</span> Ek Dokümanlar ({ekDosyalar.length})</h4>
                                                    <div className="tom-info-card__files-list">
                                                        {ekDosyalar.map((f, i) => (
                                                            <button key={i} type="button" className="tom-info-card__file-btn" onClick={async () => {
                                                                if (f.url && f.url.startsWith('http')) {
                                                                    window.open(f.url, '_blank', 'noopener,noreferrer');
                                                                } else if (f.path) {
                                                                    const { data } = await supabase.storage.from('ihale-ekleri').createSignedUrl(f.path, 300);
                                                                    if (data?.signedUrl) window.open(data.signedUrl, '_blank', 'noopener,noreferrer');
                                                                }
                                                            }}>
                                                                <span className="material-symbols-outlined">download</span>
                                                                {f.name || `Dosya ${i + 1}`}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })()}
                                        {/* Enes Doğanay | 13 Nisan 2026: İhale yönetim aksiyonları — düzenle/kapat/sil */}
                                        {/* Enes Doğanay | 15 Nisan 2026: İhaleyi tekrarla butonu + silme uyarısı iyileştirildi + kapatma görünürlük sorusu */}
                                        <div className="tom-tender-actions">
                                            {(() => {
                                                const tenderTone = getTenderStatus(selectedTender.durum).tone;
                                                const isClosed = tenderTone === 'closed' || tenderTone === 'cancelled';
                                                return (
                                                    <>
                                                        <button className="tom-btn tom-btn--edit" onClick={() => openEditModal(selectedTender)} disabled={isClosed} title={isClosed ? 'Kapanan ihale düzenlenemez' : 'Düzenle'}>
                                                            <span className="material-symbols-outlined">edit</span>
                                                            Düzenle
                                                        </button>
                                                        {/* Enes Doğanay | 15 Nisan 2026: Kapanan ihaleyi tekrarla butonu */}
                                                        {isClosed && (
                                                            <button className="tom-btn tom-btn--repeat" onClick={() => handleRepeatTender(selectedTender)}>
                                                                <span className="material-symbols-outlined">replay</span>
                                                                İhaleyi Tekrarla
                                                            </button>
                                                        )}
                                                    </>
                                                );
                                            })()}
                                            {getTenderStatus(selectedTender.durum).tone === 'active' && (
                                                closeConfirmId === selectedTender.id ? (
                                                    <div className="tom-confirm-inline">
                                                        <span>İhaleyi kapatmak istediğinize emin misiniz?</span>
                                                        <button className="tom-btn tom-btn--confirm" onClick={() => { setCloseConfirmId(null); setCloseVisibilityPopup(selectedTender.id); }}>
                                                            Evet, Kapat
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
                                                <div className="tom-confirm-inline tom-confirm-inline--danger">
                                                    <div>
                                                        <span style={{ fontWeight: 700, color: '#991b1b' }}>⚠ Dikkat!</span>
                                                        <span style={{ display: 'block', fontSize: '0.78rem', marginTop: 2 }}>Bu işlem kalıcıdır. İhale ve tüm teklifler geri getirilemez şekilde silinecektir.</span>
                                                    </div>
                                                    <button className="tom-btn tom-btn--confirm tom-btn--confirm-red" onClick={() => handleDeleteTender(selectedTender.id)}>Kalıcı Olarak Sil</button>
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
                                        {/* Enes Doğanay | 15 Nisan 2026: Akıllı puanlama bilgilendirme butonu */}
                                        <button
                                            className="tom-btn-icon"
                                            onClick={() => setShowScoringInfo(true)}
                                            title="Akıllı Puanlama Nasıl Çalışır?"
                                        >
                                            <span className="material-symbols-outlined">help</span>
                                        </button>
                                        <div className="tom-sort-wrap" ref={sortDropdownRef}>
                                            <button
                                                type="button"
                                                className="tom-sort-trigger"
                                                onClick={() => setSortDropdownOpen(o => !o)}
                                            >
                                                <span className="material-symbols-outlined">sort</span>
                                                <span className="tom-sort-label">
                                                    {offerSort === 'score' ? 'Puana Göre' : offerSort === 'price-asc' ? 'Fiyat ↑' : offerSort === 'price-desc' ? 'Fiyat ↓' : offerSort === 'delivery' ? 'Teslim Süresi' : 'Tarih (Yeni)'}
                                                </span>
                                                <span className={`material-symbols-outlined tom-sort-chevron${sortDropdownOpen ? ' open' : ''}`}>expand_more</span>
                                            </button>
                                            {sortDropdownOpen && (
                                                <div className="tom-sort-menu">
                                                    {[
                                                        { value: 'score',      label: 'Puana Göre',    icon: 'workspace_premium' },
                                                        { value: 'price-asc',  label: 'Fiyat ↑',        icon: 'arrow_upward' },
                                                        { value: 'price-desc', label: 'Fiyat ↓',        icon: 'arrow_downward' },
                                                        { value: 'delivery',   label: 'Teslim Süresi', icon: 'local_shipping' },
                                                        { value: 'date',       label: 'Tarih (Yeni)',   icon: 'schedule' },
                                                    ].map(opt => (
                                                        <button
                                                            key={opt.value}
                                                            type="button"
                                                            className={`tom-sort-option${offerSort === opt.value ? ' active' : ''}`}
                                                            onClick={() => { setOfferSort(opt.value); setSortDropdownOpen(false); }}
                                                        >
                                                            <span className="material-symbols-outlined">{opt.icon}</span>
                                                            {opt.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
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

                                {/* Enes Doğanay | 15 Nisan 2026: Karşılaştırma ipucu banner */}
                                {displayOffers.length >= 2 && compareIds.length === 0 && !compareHintDismissed && (
                                    <div className="tom-compare-hint">
                                        <div className="tom-compare-hint__icon">
                                            <span className="material-symbols-outlined">compare_arrows</span>
                                        </div>
                                        <div className="tom-compare-hint__content">
                                            <strong>Teklifleri Karşılaştırın</strong>
                                            <p>Teklif kartlarının sağındaki <span className="material-symbols-outlined" style={{ fontSize: 16, verticalAlign: 'middle' }}>compare_arrows</span> butonuna tıklayarak en az <b>2</b>, en fazla <b>3</b> teklif seçin. Seçtiğiniz teklifler fiyat, teslim süresi ve genel puan üzerinden otomatik olarak karşılaştırılır.</p>
                                            <label className="tom-compare-hint__never">
                                                <input type="checkbox" id="compareHintNever" />
                                                <span>Bir daha gösterme</span>
                                            </label>
                                        </div>
                                        <button className="tom-compare-hint__dismiss" onClick={() => { setCompareHintDismissed(true); if (document.getElementById('compareHintNever')?.checked) { localStorage.setItem('tom_compare_hint_never', '1'); } else { sessionStorage.setItem('tom_compare_hint_dismissed', '1'); } }} title="Kapat">
                                            <span className="material-symbols-outlined">close</span>
                                        </button>
                                    </div>
                                )}

                                {/* Enes Doğanay | 15 Nisan 2026: 1 teklif seçiliyken nudge */}
                                {compareIds.length === 1 && (
                                    <div className="tom-compare-nudge">
                                        <span className="material-symbols-outlined">info</span>
                                        Karşılaştırma için <b>1 teklif daha</b> seçin
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
                                                            <label className={`tom-compare-check${!compareHintDismissed && compareIds.length === 0 ? ' tom-compare-check--hint' : ''}`} title="Karşılaştır">
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
                                                                {/* Enes Doğanay | 15 Nisan 2026: Kabul edilen teklif → iletişime geç + statü değiştir */}
                                                                {String(offer.durum || '').toLowerCase() === 'kabul' && (
                                                                    <div className="tom-offer-card__footer-right">
                                                                        <button className="tom-btn tom-btn--outline" onClick={() => openContact(offer)}>
                                                                            <span className="material-symbols-outlined">contact_phone</span>
                                                                            İletişime Geç
                                                                        </button>
                                                                        <div className="tom-status-dropdown-wrap">
                                                                            <button className="tom-btn tom-btn--status-change" onClick={() => setStatusDropdownId(statusDropdownId === offer.id ? null : offer.id)}>
                                                                                <span className="material-symbols-outlined">swap_horiz</span>
                                                                                Statüyü Değiştir
                                                                            </button>
                                                                            {statusDropdownId === offer.id && (
                                                                                <div className="tom-status-dropdown">
                                                                                    <button onClick={() => { setStatusConfirmPopup({ offerId: offer.id, status: 'gonderildi' }); setStatusDropdownId(null); }}>
                                                                                        <span className="material-symbols-outlined" style={{ color: '#2563eb' }}>hourglass_top</span>
                                                                                        Değerlendiriliyor
                                                                                    </button>
                                                                                    <button onClick={() => { handleRejectOffer(offer.id); setStatusDropdownId(null); }}>
                                                                                        <span className="material-symbols-outlined" style={{ color: '#dc2626' }}>cancel</span>
                                                                                        Reddedildi
                                                                                    </button>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                {/* Enes Doğanay | 15 Nisan 2026: Reddedilen teklif → statü değiştir */}
                                                                {String(offer.durum || '').toLowerCase() === 'red' && (
                                                                    <div className="tom-offer-card__footer-right">
                                                                        <div className="tom-status-dropdown-wrap">
                                                                            <button className="tom-btn tom-btn--status-change" onClick={() => setStatusDropdownId(statusDropdownId === offer.id ? null : offer.id)}>
                                                                                <span className="material-symbols-outlined">swap_horiz</span>
                                                                                Statüyü Değiştir
                                                                            </button>
                                                                            {statusDropdownId === offer.id && (
                                                                                <div className="tom-status-dropdown">
                                                                                    <button onClick={() => { setStatusConfirmPopup({ offerId: offer.id, status: 'gonderildi' }); setStatusDropdownId(null); }}>
                                                                                        <span className="material-symbols-outlined" style={{ color: '#2563eb' }}>hourglass_top</span>
                                                                                        Değerlendiriliyor
                                                                                    </button>
                                                                                    <button onClick={() => { handleAcceptOffer(offer.id); setStatusDropdownId(null); }}>
                                                                                        <span className="material-symbols-outlined" style={{ color: '#059669' }}>check_circle</span>
                                                                                        Kabul Et
                                                                                    </button>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                {/* Enes Doğanay | 15 Nisan 2026: Henüz karar verilmemiş teklifler */}
                                                                {!['kabul', 'red'].includes(String(offer.durum || '').toLowerCase()) && (
                                                                <div className="tom-offer-card__footer-right">
                                                                    <button
                                                                        className="tom-btn tom-btn--reject"
                                                                        onClick={() => handleRejectOffer(offer.id)}
                                                                        disabled={isUpdating}
                                                                    >
                                                                        <span className="material-symbols-outlined">close</span>
                                                                        Reddet
                                                                    </button>
                                                                    <button
                                                                        className="tom-btn tom-btn--accept"
                                                                        onClick={() => handleAcceptOffer(offer.id)}
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

            {/* Enes Doğanay | 15 Nisan 2026: Akıllı puanlama bilgilendirme popup */}
            {showScoringInfo && (
                <div className="tom-contact-overlay" onClick={() => setShowScoringInfo(false)}>
                    <div className="tom-scoring-info-card" onClick={e => e.stopPropagation()}>
                        <button className="tom-contact-card__close" onClick={() => setShowScoringInfo(false)}>
                            <span className="material-symbols-outlined">close</span>
                        </button>
                        <div className="tom-scoring-info-card__icon">
                            <span className="material-symbols-outlined">psychology</span>
                        </div>
                        <h3>Akıllı Puanlama Nasıl Çalışır?</h3>
                        <div className="tom-scoring-info-card__body">
                            <p>Akıllı puanlama sistemi, gelen teklifleri otomatik olarak değerlendirerek size en uygun teklifi hızlıca bulmanıza yardımcı olur.</p>
                            <div className="tom-scoring-info-item">
                                <span className="material-symbols-outlined" style={{ color: '#059669' }}>payments</span>
                                <div>
                                    <strong>Fiyat Puanı</strong>
                                    <p>Teklif edilen fiyat ne kadar düşükse puan o kadar yüksek olur. Tüm teklifler arasındaki en düşük ve en yüksek fiyatlar baz alınarak hesaplanır.</p>
                                </div>
                            </div>
                            <div className="tom-scoring-info-item">
                                <span className="material-symbols-outlined" style={{ color: '#d97706' }}>local_shipping</span>
                                <div>
                                    <strong>Teslim Hızı Puanı</strong>
                                    <p>Teslim süresi ne kadar kısa ise puan o kadar yüksek olur. Daha hızlı teslimat daha iyi skor demektir.</p>
                                </div>
                            </div>
                            <div className="tom-scoring-info-item">
                                <span className="material-symbols-outlined" style={{ color: '#2563eb' }}>tune</span>
                                <div>
                                    <strong>Ağırlık Ayarları</strong>
                                    <p>Kaydırıcılarla Fiyat ve Teslim Hızı kriterlerinin ağırlığını değiştirebilirsiniz. Örnek: fiyat %80, teslim %20 yaparsanız fiyat daha belirleyici olur.</p>
                                </div>
                            </div>
                            <div className="tom-scoring-info-item">
                                <span className="material-symbols-outlined" style={{ color: '#7c3aed' }}>compare_arrows</span>
                                <div>
                                    <strong>Karşılaştırma</strong>
                                    <p>En fazla 3 teklifi seçerek yan yana karşılaştırabilirsiniz. En iyi teklif otomatik olarak vurgulanır.</p>
                                </div>
                            </div>
                        </div>
                        <button className="tom-btn tom-btn--accept" style={{ width: '100%', justifyContent: 'center', marginTop: 16 }} onClick={() => setShowScoringInfo(false)}>
                            <span className="material-symbols-outlined">check</span>
                            Anladım
                        </button>
                    </div>
                </div>
            )}

            {/* Enes Doğanay | 15 Nisan 2026: Red nedeni popup */}
            {rejectNotePopup && (
                <div className="tom-contact-overlay" onClick={() => setRejectNotePopup(null)}>
                    <div className="tom-reject-note-card" onClick={e => e.stopPropagation()}>
                        <button className="tom-contact-card__close" onClick={() => setRejectNotePopup(null)}>
                            <span className="material-symbols-outlined">close</span>
                        </button>
                        <div className="tom-scoring-info-card__icon" style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}>
                            <span className="material-symbols-outlined">cancel</span>
                        </div>
                        <h3>Teklifi Reddet</h3>
                        <p style={{ color: '#64748b', fontSize: '0.88rem', margin: '8px 0 16px', textAlign: 'center' }}>İsteğe bağlı olarak red nedeninizi yazabilirsiniz. Bu not, teklif veren kişiye e-posta ile iletilecektir.</p>
                        <textarea
                            className="tom-reject-note-textarea"
                            rows={3}
                            value={rejectNote}
                            onChange={e => setRejectNote(e.target.value)}
                            placeholder="Red nedeni (opsiyonel)..."
                        />
                        <div className="tom-reject-note-actions">
                            <button className="tom-btn tom-btn--cancel-sm" onClick={() => setRejectNotePopup(null)}>İptal</button>
                            <button className="tom-btn tom-btn--reject" onClick={confirmRejectOffer}>
                                <span className="material-symbols-outlined">close</span>
                                Reddet
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Enes Doğanay | 15 Nisan 2026: Kabul → İhaleyi kapat mı sorusu */}
            {acceptClosePopup && (
                <div className="tom-contact-overlay" onClick={() => setAcceptClosePopup(null)}>
                    <div className="tom-accept-close-card" onClick={e => e.stopPropagation()}>
                        <div className="tom-scoring-info-card__icon" style={{ background: 'linear-gradient(135deg, #059669, #10b981)' }}>
                            <span className="material-symbols-outlined">check_circle</span>
                        </div>
                        <h3>Teklif Kabul Edilecek</h3>
                        <p style={{ color: '#64748b', fontSize: '0.88rem', margin: '8px 0 20px', textAlign: 'center' }}>Bu teklifi kabul ettikten sonra ihaleyi kapatmak ister misiniz?</p>
                        <div className="tom-accept-close-actions">
                            <button className="tom-btn tom-btn--accept" onClick={() => confirmAcceptOffer(acceptClosePopup, true)}>
                                <span className="material-symbols-outlined">lock</span>
                                Kabul Et ve İhaleyi Kapat
                            </button>
                            <button className="tom-btn tom-btn--outline" onClick={() => confirmAcceptOffer(acceptClosePopup, false)}>
                                <span className="material-symbols-outlined">check</span>
                                Kabul Et, İhale Açık Kalsın
                            </button>
                            <button className="tom-btn tom-btn--cancel-sm" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setAcceptClosePopup(null)}>İptal</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Enes Doğanay | 15 Nisan 2026: İhale kapatma → görünürlük sorusu */}
            {closeVisibilityPopup && (
                <div className="tom-contact-overlay" onClick={() => setCloseVisibilityPopup(null)}>
                    <div className="tom-accept-close-card" onClick={e => e.stopPropagation()}>
                        <div className="tom-scoring-info-card__icon" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
                            <span className="material-symbols-outlined">visibility</span>
                        </div>
                        <h3>İhale Görünürlüğü</h3>
                        <p style={{ color: '#64748b', fontSize: '0.88rem', margin: '8px 0 20px', textAlign: 'center' }}>Kapattığınız ihale, İhaleler sayfasında diğer kullanıcılara gösterilmeye devam etsin mi?</p>
                        <div className="tom-accept-close-actions">
                            <button className="tom-btn tom-btn--accept" onClick={() => handleCloseTender(closeVisibilityPopup, 'goster')} disabled={closingTenderId === closeVisibilityPopup}>
                                <span className="material-symbols-outlined">visibility</span>
                                {closingTenderId === closeVisibilityPopup ? 'Kapatılıyor…' : 'Evet, Görüntülensin'}
                            </button>
                            <button className="tom-btn tom-btn--outline" onClick={() => handleCloseTender(closeVisibilityPopup, 'gizle')} disabled={closingTenderId === closeVisibilityPopup}>
                                <span className="material-symbols-outlined">visibility_off</span>
                                {closingTenderId === closeVisibilityPopup ? 'Kapatılıyor…' : 'Hayır, Gizlensin'}
                            </button>
                            <button className="tom-btn tom-btn--cancel-sm" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setCloseVisibilityPopup(null)}>İptal</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Enes Doğanay | 16 Haziran 2025: Değerlendirmeye alma onay popup */}
            {statusConfirmPopup && (
                <div className="tom-contact-overlay" onClick={() => setStatusConfirmPopup(null)}>
                    <div className="tom-accept-close-card" onClick={e => e.stopPropagation()}>
                        <div className="tom-scoring-info-card__icon" style={{ background: 'linear-gradient(135deg, #2563eb, #3b82f6)' }}>
                            <span className="material-symbols-outlined">hourglass_top</span>
                        </div>
                        <h3>Değerlendirmeye Al</h3>
                        <p style={{ color: '#64748b', fontSize: '0.88rem', margin: '8px 0 20px', textAlign: 'center' }}>Bu teklifi tekrar değerlendirmeye almak istediğinize emin misiniz?</p>
                        <div className="tom-accept-close-actions">
                            <button className="tom-btn tom-btn--accept" style={{ background: 'linear-gradient(135deg, #2563eb, #3b82f6)' }} onClick={() => { updateStatus(statusConfirmPopup.offerId, statusConfirmPopup.status); setStatusConfirmPopup(null); }}>
                                <span className="material-symbols-outlined">hourglass_top</span>
                                Değerlendirmeye Al
                            </button>
                            <button className="tom-btn tom-btn--cancel-sm" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setStatusConfirmPopup(null)}>İptal</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Enes Doğanay | 16 Haziran 2025: Statü değişikliği başarı modal */}
            {statusSuccessModal && (
                <div className="tom-contact-overlay" onClick={() => setStatusSuccessModal(null)}>
                    <div className="tom-accept-close-card" onClick={e => e.stopPropagation()}>
                        <div className="tom-scoring-info-card__icon" style={{ background: statusSuccessModal.color }}>
                            <span className="material-symbols-outlined">{statusSuccessModal.icon}</span>
                        </div>
                        <h3>{statusSuccessModal.title}</h3>
                        <p style={{ color: '#64748b', fontSize: '0.88rem', margin: '8px 0 20px', textAlign: 'center' }}>{statusSuccessModal.text}</p>
                        <button className="tom-btn tom-btn--accept" style={{ width: '100%', justifyContent: 'center', background: statusSuccessModal.color }} onClick={() => setStatusSuccessModal(null)}>
                            <span className="material-symbols-outlined">check</span>
                            Tamam
                        </button>
                    </div>
                </div>
            )}

            {/* Enes Doğanay | 15 Nisan 2026: Yeni İhale Oluştur — 4 adımlı stepper modal (Ihaleler sayfasıyla birebir aynı) */}
            {showCreateModal && (
                <div className="ihale-modal-overlay">
                    <div className="ihale-modal ihale-modal--stepper">
                        <div className="ihale-modal__head">
                            <h3>Yeni İhale Oluştur</h3>
                            <button type="button" className="ihale-modal__close" onClick={() => setShowCreateModal(false)}>
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="ihale-stepper-bar">
                            {STEPPER_LABELS.map((s, i) => (
                                <React.Fragment key={s.key}>
                                    <button
                                        type="button"
                                        className={`ihale-stepper-item ${i === createStepperStep ? 'ihale-stepper-item--active' : ''} ${i < createStepperStep ? 'ihale-stepper-item--done' : ''}`}
                                        onClick={() => i <= createStepperStep && setCreateStepperStep(i)}
                                    >
                                        <span className="ihale-stepper-num">
                                            {i < createStepperStep
                                                ? <span className="material-symbols-outlined">check</span>
                                                : <span className="material-symbols-outlined">{s.icon}</span>
                                            }
                                        </span>
                                        <span className="ihale-stepper-label">{s.label}</span>
                                    </button>
                                    {i < STEPPER_LABELS.length - 1 && (
                                        <div className={`ihale-stepper-track ${i < createStepperStep ? 'ihale-stepper-track--done' : ''} ${i === createStepperStep ? 'ihale-stepper-track--active' : ''}`} />
                                    )}
                                </React.Fragment>
                            ))}
                        </div>

                        <form className="ihale-modal__form" onSubmit={e => e.preventDefault()}>

                            {/* ═══════ ADIM 1: TEMEL BİLGİLER ═══════ */}
                            {createStepperStep === 0 && (
                                <div className="ihale-step-content">
                                    <label className="ihale-field">
                                        <span>Başlık *</span>
                                        <input type="text" value={createForm.baslik} onChange={e => setCreateForm(p => ({ ...p, baslik: e.target.value }))} placeholder="Örn. 500 adet laptop alımı" />
                                    </label>
                                    <label className="ihale-field ihale-field--full">
                                        <span>Açıklama</span>
                                        <textarea rows={4} value={createForm.aciklama} onChange={e => setCreateForm(p => ({ ...p, aciklama: e.target.value }))} placeholder="İhale kapsamı, genel bilgiler, teknik gereksinimler…" />
                                    </label>
                                    <div className="ihale-modal__grid">
                                        <div className="ihale-field">
                                            <span>Teslim Yeri İl *</span>
                                            <CitySelect value={createForm.teslim_il} onChange={val => setCreateForm(p => ({ ...p, teslim_il: val, teslim_ilce: '' }))} />
                                        </div>
                                        <div className="ihale-field">
                                            <span>Teslim Yeri İlçe *</span>
                                            <CitySelect
                                                value={createForm.teslim_ilce}
                                                onChange={val => setCreateForm(p => ({ ...p, teslim_ilce: val }))}
                                                options={TURKEY_DISTRICTS[createForm.teslim_il] || []}
                                                placeholder="İlçe seçiniz"
                                                icon="map"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ═══════ ADIM 2: İHALE DETAYLARI ═══════ */}
                            {createStepperStep === 1 && (
                                <div className="ihale-step-content">
                                    <div className="ihale-modal__grid">
                                        <label className="ihale-field">
                                            <span>İhale Tipi *</span>
                                            <select value={createForm.ihale_tipi} onChange={e => {
                                                const val = e.target.value;
                                                if (val === 'Davetli İhale' && !createIsVerifiedUser) return;
                                                setCreateForm(p => ({
                                                    ...p,
                                                    ihale_tipi: val,
                                                    ...(val !== 'Davetli İhale' ? { davetli_firmalar: [] } : {}),
                                                }));
                                            }}>
                                                <option value="Açık İhale">Açık İhale</option>
                                                <option value="Davetli İhale" disabled={!createIsVerifiedUser}>
                                                    Davetli İhale {!createIsVerifiedUser ? '(Onaylı hesap gerekli)' : ''}
                                                </option>
                                            </select>
                                        </label>
                                        <label className="ihale-field">
                                            <span>KDV Durumu</span>
                                            <select value={createForm.kdv_durumu} onChange={e => setCreateForm(p => ({ ...p, kdv_durumu: e.target.value }))}>
                                                <option value="haric">KDV Hariç</option>
                                                <option value="dahil">KDV Dahil</option>
                                            </select>
                                        </label>
                                        <label className="ihale-field">
                                            <span>İhale Açılış Tarihi *</span>
                                            <input type="date" value={createForm.yayin_tarihi} onChange={e => setCreateForm(p => ({ ...p, yayin_tarihi: e.target.value }))} />
                                        </label>
                                        <label className="ihale-field">
                                            <span>İhale Kapanış Tarihi *</span>
                                            <input type="date" value={createForm.son_basvuru_tarihi} onChange={e => setCreateForm(p => ({ ...p, son_basvuru_tarihi: e.target.value }))} />
                                        </label>
                                        <label className="ihale-field">
                                            <span>Talep Edilen Teslim Süresi *</span>
                                            <input type="text" value={createForm.teslim_suresi} onChange={e => setCreateForm(p => ({ ...p, teslim_suresi: e.target.value }))} placeholder="Örn. 30 iş günü" />
                                        </label>
                                        <label className="ihale-field">
                                            <span>Referans No</span>
                                            <input type="text" value={createForm.referans_no} readOnly className="ihale-field--readonly" tabIndex={-1} />
                                        </label>
                                    </div>

                                    {createForm.son_basvuru_tarihi && (
                                        <div className="ihale-deadline-sticky">
                                            <span className="material-symbols-outlined">timer</span>
                                            <span>İhale Kapanış: <strong>{new Date(createForm.son_basvuru_tarihi).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</strong></span>
                                        </div>
                                    )}

                                    <div className="ihale-section">
                                        <span className="ihale-section__title">
                                            <span className="material-symbols-outlined">mail</span>
                                            Davet Edilecek E-postalar
                                        </span>
                                        <p className="ihale-section__desc">İhale yayınlandığında bu adreslere bildirim gönderilecek.</p>
                                        <div className="ihale-email-input-row">
                                            <input type="email" placeholder="ornek@firma.com" value={createEmailInput} onChange={e => setCreateEmailInput(e.target.value)} onKeyDown={createHandleEmailKeyDown} />
                                            <button type="button" className="ihale-email-add-btn" onClick={createAddEmail}>
                                                <span className="material-symbols-outlined">add</span>
                                            </button>
                                        </div>
                                        {createForm.davet_emailleri.length > 0 && (
                                            <div className="ihale-email-tags">
                                                {createForm.davet_emailleri.map(email => (
                                                    <div key={email} className="ihale-email-tag">
                                                        <span>{email}</span>
                                                        <button type="button" onClick={() => createRemoveEmail(email)}>
                                                            <span className="material-symbols-outlined">close</span>
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {createForm.ihale_tipi === 'Davetli İhale' && (
                                        <div className="ihale-section">
                                            <span className="ihale-section__title">
                                                <span className="material-symbols-outlined">group_add</span>
                                                Davet Edilecek Firmalar
                                            </span>
                                            <div className="ihale-firma-search">
                                                <input type="text" placeholder="Firma adı ile arayın…" value={createFirmaSearchTerm} onChange={e => createHandleFirmaSearch(e.target.value)} />
                                                {createFirmaSearching && <span className="ihale-firma-search__spinner">Aranıyor…</span>}
                                                {createFirmaSearchResults.length > 0 && (
                                                    <div className="ihale-firma-search__results" ref={createFirmaResultsRef}>
                                                        {createFirmaSearchResults.map(f => {
                                                            const alreadyAdded = createForm.davetli_firmalar.some(df => df.firma_id === f.firmaID);
                                                            const isOnayli = f.onayli_hesap === true;
                                                            return (
                                                                <div key={f.firmaID} className={`ihale-firma-search__item ${!isOnayli ? 'ihale-firma-search__item--disabled' : ''}`}>
                                                                    <div className="ihale-firma-search__info">
                                                                        <strong>{f.firma_adi}</strong>
                                                                        {isOnayli
                                                                            ? <span className="ihale-firma-badge ihale-firma-badge--ok"><span className="material-symbols-outlined">verified</span> Onaylı</span>
                                                                            : <span className="ihale-firma-badge ihale-firma-badge--warn"><span className="material-symbols-outlined">info</span> Onaylı firma değil</span>
                                                                        }
                                                                    </div>
                                                                    {isOnayli ? (
                                                                        <button type="button" disabled={alreadyAdded} className="ihale-firma-add-btn" onClick={() => createAddDavetliFirma(f)}>
                                                                            {alreadyAdded ? 'Eklendi' : '+ Ekle'}
                                                                        </button>
                                                                    ) : (
                                                                        <span className="ihale-firma-warn-text">Firmayla iletişime geçip profilini onaylamasını talep edebilirsiniz.</span>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                            {createForm.davetli_firmalar.length > 0 && (
                                                <div className="ihale-firma-tags">
                                                    {createForm.davetli_firmalar.map(f => (
                                                        <div key={f.firma_id} className="ihale-firma-tag">
                                                            <span className="material-symbols-outlined">business</span>
                                                            <span>{f.firma_adi}</span>
                                                            <button type="button" onClick={() => createRemoveDavetliFirma(f.firma_id)}>
                                                                <span className="material-symbols-outlined">close</span>
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ═══════ ADIM 3: TEKNİK / TİCARİ ŞARTLAR ═══════ */}
                            {createStepperStep === 2 && (
                                <div className="ihale-step-content">
                                    <div className="ihale-section ihale-section--no-border">
                                        <span className="ihale-section__title">
                                            <span className="material-symbols-outlined">checklist</span>
                                            İhale Gereksinimleri *
                                        </span>
                                        <p className="ihale-section__desc">Kalem kalem gereksinimlerinizi ekleyin.</p>
                                        <div className="ihale-req-input-row">
                                            <input type="text" placeholder="Gereksinim maddesi *" value={createYeniGereksinimMadde} onChange={e => setCreateYeniGereksinimMadde(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); createAddGereksinim(); } }} />
                                            <input type="text" placeholder="Açıklama (opsiyonel)" value={createYeniGereksinimAciklama} onChange={e => setCreateYeniGereksinimAciklama(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); createAddGereksinim(); } }} />
                                            <button type="button" className="ihale-req-add-btn" onClick={createAddGereksinim} disabled={!createYeniGereksinimMadde.trim()}>
                                                <span className="material-symbols-outlined">add</span>
                                            </button>
                                        </div>
                                        {createForm.gereksinimler.length > 0 && (
                                            <div className="ihale-req-table">
                                                <div className="ihale-req-table__header">
                                                    <span>#</span>
                                                    <span>Madde</span>
                                                    <span>Açıklama</span>
                                                    <span></span>
                                                </div>
                                                {createForm.gereksinimler.map((g, i) => (
                                                    <div key={g.id} className="ihale-req-table__row">
                                                        <span className="ihale-req-table__num">{i + 1}</span>
                                                        <span className="ihale-req-table__madde">{g.madde}</span>
                                                        <span className="ihale-req-table__aciklama">{g.aciklama || '—'}</span>
                                                        <button type="button" className="ihale-req-table__remove" onClick={() => createRemoveGereksinim(g.id)}>
                                                            <span className="material-symbols-outlined">close</span>
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="ihale-section">
                                        <span className="ihale-section__title">
                                            <span className="material-symbols-outlined">attach_file</span>
                                            Ek Dokümanlar
                                        </span>
                                        <p className="ihale-section__desc">Teknik şartname, çizim veya diğer dokümanları ekleyin. (Maks. 10 MB / dosya)</p>
                                        <div className="ihale-file-upload">
                                            <button type="button" className="ihale-file-btn" onClick={() => createFileInputRef.current?.click()}>
                                                <span className="material-symbols-outlined">upload_file</span>
                                                Dosya Seç
                                            </button>
                                            <input ref={createFileInputRef} type="file" multiple accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.zip,.dwg" style={{ display: 'none' }} onChange={createHandleFileAdd} />
                                        </div>
                                        {createForm.ek_dosyalar.length > 0 && (
                                            <div className="ihale-file-list">
                                                {createForm.ek_dosyalar.map((f, i) => (
                                                    <div key={i} className="ihale-file-item">
                                                        <span className="material-symbols-outlined">description</span>
                                                        <span className="ihale-file-name">{f.name}</span>
                                                        <span className="ihale-file-size">{(f.size / 1024).toFixed(0)} KB</span>
                                                        <button type="button" onClick={() => createRemoveFile(i)}>
                                                            <span className="material-symbols-outlined">close</span>
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* ═══════ ADIM 4: ÖNİZLEME ═══════ */}
                            {createStepperStep === 3 && (
                                <div className="ihale-step-content ihale-preview">
                                    <div className="ihale-preview__card">
                                        <div className="ihale-preview__header">
                                            <h4>{createForm.baslik || 'Başlık belirtilmedi'}</h4>
                                            <span className={`tender-card-status tender-card-status-canli`}>{createForm.ihale_tipi}</span>
                                        </div>
                                        {createForm.aciklama && <p className="ihale-preview__desc">{createForm.aciklama}</p>}
                                        <div className="ihale-preview__grid">
                                            <div className="ihale-preview__item">
                                                <span className="material-symbols-outlined">event</span>
                                                <div><strong>İhale Açılış</strong><span>{createForm.yayin_tarihi ? new Date(createForm.yayin_tarihi).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}</span></div>
                                            </div>
                                            <div className="ihale-preview__item">
                                                <span className="material-symbols-outlined">hourglass_bottom</span>
                                                <div><strong>İhale Kapanış</strong><span>{createForm.son_basvuru_tarihi ? new Date(createForm.son_basvuru_tarihi).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}</span></div>
                                            </div>
                                            <div className="ihale-preview__item">
                                                <span className="material-symbols-outlined">local_shipping</span>
                                                <div><strong>Teslim Süresi</strong><span>{createForm.teslim_suresi || '—'}</span></div>
                                            </div>
                                            <div className="ihale-preview__item">
                                                <span className="material-symbols-outlined">receipt_long</span>
                                                <div><strong>KDV</strong><span>{createForm.kdv_durumu === 'dahil' ? 'KDV Dahil' : 'KDV Hariç'}</span></div>
                                            </div>
                                            <div className="ihale-preview__item">
                                                <span className="material-symbols-outlined">location_on</span>
                                                <div><strong>Teslim Yeri</strong><span>{[createForm.teslim_il, createForm.teslim_ilce].filter(Boolean).join(' / ') || '—'}</span></div>
                                            </div>
                                            <div className="ihale-preview__item">
                                                <span className="material-symbols-outlined">badge</span>
                                                <div><strong>Referans</strong><span>{createForm.referans_no || '—'}</span></div>
                                            </div>
                                        </div>

                                        {createForm.gereksinimler.length > 0 && (
                                            <div className="ihale-preview__section">
                                                <strong><span className="material-symbols-outlined">checklist</span> Gereksinimler ({createForm.gereksinimler.length})</strong>
                                                <ul>{createForm.gereksinimler.map((g, i) => (<li key={g.id}><span>{i + 1}.</span> {g.madde}{g.aciklama ? ` — ${g.aciklama}` : ''}</li>))}</ul>
                                            </div>
                                        )}
                                        {createForm.davet_emailleri.length > 0 && (
                                            <div className="ihale-preview__section">
                                                <strong><span className="material-symbols-outlined">mail</span> Davet E-postaları ({createForm.davet_emailleri.length})</strong>
                                                <div className="ihale-preview__tags">{createForm.davet_emailleri.map(e => <span key={e}>{e}</span>)}</div>
                                            </div>
                                        )}
                                        {createForm.davetli_firmalar.length > 0 && (
                                            <div className="ihale-preview__section">
                                                <strong><span className="material-symbols-outlined">business</span> Davetli Firmalar ({createForm.davetli_firmalar.length})</strong>
                                                <div className="ihale-preview__tags">{createForm.davetli_firmalar.map(f => <span key={f.firma_id}>{f.firma_adi}</span>)}</div>
                                            </div>
                                        )}
                                        {createForm.ek_dosyalar.length > 0 && (
                                            <div className="ihale-preview__section">
                                                <strong><span className="material-symbols-outlined">attach_file</span> Ek Dokümanlar ({createForm.ek_dosyalar.length})</strong>
                                                <div className="ihale-preview__tags">{createForm.ek_dosyalar.map((f, i) => <span key={i}>{f.name}</span>)}</div>
                                            </div>
                                        )}
                                    </div>

                                    {createFormError && <p className="ihale-form-error">{createFormError}</p>}

                                    <div className="ihale-modal__footer ihale-modal__footer--preview">
                                        <button type="button" className="ihale-btn-cancel" onClick={() => setShowCreateModal(false)}>İptal</button>
                                        <button type="button" className="ihale-btn-draft" disabled={createFormSaving} onClick={() => handleCreateFormSubmit(null, 'draft')}>
                                            <span className="material-symbols-outlined">save</span>
                                            {createFormSaving ? 'Kaydediliyor…' : 'Taslak Kaydet'}
                                        </button>
                                        <button type="button" className="ihale-btn-save" disabled={createFormSaving} onClick={() => handleCreateFormSubmit(null, null)}>
                                            {createFormSaving ? 'Kaydediliyor…' : 'İhaleyi Yayınla'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Stepper navigasyon — Adım 4 (Önizleme) hariç */}
                            {createStepperStep < 3 && (
                                <div className="ihale-stepper-nav">
                                    {createStepperStep > 0 && (
                                        <button type="button" className="ihale-stepper-back" onClick={() => setCreateStepperStep(s => s - 1)}>
                                            <span className="material-symbols-outlined">arrow_back</span>
                                            Geri
                                        </button>
                                    )}
                                    <div className="ihale-stepper-nav__spacer" />
                                    {createFormError && <p className="ihale-form-error ihale-form-error--inline">{createFormError}</p>}
                                    <button
                                        type="button"
                                        className="ihale-stepper-next"
                                        onClick={() => {
                                            if (createStepperStep === 0) {
                                                if (!createForm.baslik.trim()) { setCreateFormError('İhale başlığı zorunludur.'); return; }
                                                if (!createForm.teslim_il) { setCreateFormError('Teslim yeri il seçimi zorunludur.'); return; }
                                                if (!createForm.teslim_ilce) { setCreateFormError('Teslim yeri ilçe seçimi zorunludur.'); return; }
                                            }
                                            if (createStepperStep === 1) {
                                                if (!createForm.yayin_tarihi) { setCreateFormError('İhale açılış tarihi zorunludur.'); return; }
                                                if (!createForm.son_basvuru_tarihi) { setCreateFormError('İhale kapanış tarihi zorunludur.'); return; }
                                                if (!createForm.teslim_suresi.trim()) { setCreateFormError('Talep edilen teslim süresi zorunludur.'); return; }
                                            }
                                            if (createStepperStep === 2) {
                                                if (createForm.gereksinimler.length === 0) { setCreateFormError('En az bir ihale gereksinimi eklemelisiniz.'); return; }
                                            }
                                            setCreateFormError('');
                                            setCreateStepperStep(s => s + 1);
                                        }}
                                    >
                                        {createStepperStep === 2 ? 'Önizlemeye Geç' : 'Devam Et'}
                                        <span className="material-symbols-outlined">arrow_forward</span>
                                    </button>
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            )}
        </section>
    );
};

export default TenderOffersManagement;
