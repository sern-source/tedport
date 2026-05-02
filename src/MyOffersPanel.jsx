/* Enes Doğanay | 13 Nisan 2026: Verdiğim Teklifler — kullanıcının katıldığı ihaleleri ve tekliflerini gösterir */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import { useAuth } from './AuthContext'; /* Enes Doğanay | 15 Nisan 2026: Teklif popup için kullanıcı bilgisi */
import { formatTenderDate } from './tenderUtils'; /* Enes Doğanay | 15 Nisan 2026: Teklif popup tarih formatı */
import './MyOffersPanel.css';
/* Enes Doğanay | 15 Nisan 2026: Firma iletişim popup stilleri Ihaleler.css'ten */
import './Ihaleler.css';

/* Enes Doğanay | 15 Nisan 2026: Para birimi sabitleri — Ihaleler.jsx ile ortak */
const MAIN_CURRENCIES = [
    { code: 'TRY', symbol: '₺', name: 'Türk Lirası' },
    { code: 'USD', symbol: '$', name: 'Amerikan Doları' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'İngiliz Sterlini' },
    { code: 'CHF', symbol: 'CHF', name: 'İsviçre Frangı' },
];
const ALL_CURRENCIES = [
    ...MAIN_CURRENCIES,
    { code: 'JPY', symbol: '¥', name: 'Japon Yeni' },
    { code: 'CNY', symbol: '¥', name: 'Çin Yuanı' },
    { code: 'RUB', symbol: '₽', name: 'Rus Rublesi' },
    { code: 'SAR', symbol: 'SR', name: 'Suudi Riyali' },
    { code: 'AED', symbol: 'د.إ', name: 'BAE Dirhemi' },
    { code: 'AUD', symbol: 'A$', name: 'Avustralya Doları' },
    { code: 'CAD', symbol: 'C$', name: 'Kanada Doları' },
    { code: 'SEK', symbol: 'kr', name: 'İsveç Kronu' },
    { code: 'NOK', symbol: 'kr', name: 'Norveç Kronu' },
    { code: 'DKK', symbol: 'kr', name: 'Danimarka Kronu' },
    { code: 'PLN', symbol: 'zł', name: 'Polonya Zlotisi' },
    { code: 'INR', symbol: '₹', name: 'Hint Rupisi' },
    { code: 'KRW', symbol: '₩', name: 'Güney Kore Wonu' },
    { code: 'BRL', symbol: 'R$', name: 'Brezilya Reali' },
];
const getCurrencySymbol = (code) => {
    const c = ALL_CURRENCIES.find(cur => cur.code === code);
    return c ? c.symbol : code;
};
const getKalemToplam = (kalem) => {
    const birim = parseFloat(kalem.birim_fiyat) || 0;
    const miktar = parseFloat(kalem.miktar) || 0;
    return birim * miktar;
};
const formatCurrency = (amount, currency) => {
    const symbol = getCurrencySymbol(currency);
    return `${symbol} ${amount.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

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
    const { userProfile, managedCompanyId: authManagedCompanyId, managedCompanyName } = useAuth() || {};
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
    /* Enes Doğanay | 15 Nisan 2026: Teklifi sil — onay modal state */
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [deleting, setDeleting] = useState(false);

    /* Enes Doğanay | 2 Mayıs 2026: İhale teklif mesajlaşma — bidder tarafı */
    const [activeMopChat, setActiveMopChat] = useState(null); // { offer, tenderTitle, firmaAdi }
    const [mopChatMessages, setMopChatMessages] = useState([]);
    const [mopChatLoading, setMopChatLoading] = useState(false);
    const [mopChatInput, setMopChatInput] = useState('');
    const [mopChatSending, setMopChatSending] = useState(false);
    const mopChatChannelRef = useRef(null);
    const mopChatEndRef = useRef(null);
    const [unreadMopChatIds, setUnreadMopChatIds] = useState(() => new Set());
    // Enes Doğanay | 2 Mayıs 2026: Mesaj Şikayet state
    const [reportModal, setReportModal] = useState(null); // { mesajId, mesajIcerik }
    const [reportSending, setReportSending] = useState(false);
    const [reportNeden, setReportNeden] = useState('spam');
    const [reportAciklama, setReportAciklama] = useState('');
    const [reportSuccess, setReportSuccess] = useState(false);

    const scrollMopChatToBottom = useCallback((smooth = true) => {
        setTimeout(() => {
            const container = mopChatEndRef.current?.parentElement;
            if (container) container.scrollTo({ top: container.scrollHeight, behavior: smooth ? 'smooth' : 'instant' });
        }, 80);
    }, []);

    /* Enes Doğanay | 2 Mayıs 2026: Bidder chat'i aç */
    const openMopChat = useCallback(async (offer, tenderTitle, firmaAdi, anonim) => {
        if (mopChatChannelRef.current) {
            supabase.removeChannel(mopChatChannelRef.current);
            mopChatChannelRef.current = null;
        }
        setActiveMopChat({ offer, tenderTitle, firmaAdi, anonim });
        setMopChatLoading(true);
        setMopChatInput('');
        setMopChatMessages([]);

        try {
            const { data } = await supabase
                .from('ihale_teklif_mesajlari')
                .select('*')
                .eq('teklif_id', offer.id)
                .order('created_at', { ascending: true });
            setMopChatMessages(data || []);
            scrollMopChatToBottom(false);

            // Bidder olarak okunmamışları okundu yap
            const unread = (data || []).filter(m => m.sender_role === 'company' && !m.okundu_bidder);
            if (unread.length > 0) {
                supabase.from('ihale_teklif_mesajlari')
                    .update({ okundu_bidder: true })
                    .in('id', unread.map(m => m.id))
                    .then(() => {});
                setUnreadMopChatIds(prev => { const s = new Set(prev); s.delete(offer.id); return s; });
            }
        } catch (err) {
            if (err?.name !== 'AbortError') console.error('Teklif chat mesajları yüklenemedi:', err);
        } finally {
            setMopChatLoading(false);
        }

        const channel = supabase
            .channel(`tender-chat-bidder-${offer.id}`)
            .on('broadcast', { event: 'new-tender-message' }, ({ payload }) => {
                setMopChatMessages(prev => {
                    if (prev.some(m => m.id === payload.id)) return prev;
                    return [...prev, payload];
                });
                scrollMopChatToBottom();
                if (payload.sender_role === 'company') {
                    supabase.from('ihale_teklif_mesajlari').update({ okundu_bidder: true }).eq('id', payload.id).then(() => {});
                }
            })
            .subscribe();
        mopChatChannelRef.current = channel;
    }, [scrollMopChatToBottom]);

    /* Enes Doğanay | 2 Mayıs 2026: Bidder chat'i kapat */
    const closeMopChat = useCallback(() => {
        if (mopChatChannelRef.current) {
            supabase.removeChannel(mopChatChannelRef.current);
            mopChatChannelRef.current = null;
        }
        setActiveMopChat(null);
        setMopChatMessages([]);
        setMopChatInput('');
    }, []);

    /* Enes Doğanay | 2 Mayıs 2026: Mesaj şikayet gönder */
    const submitReport = async () => {
        if (!reportModal || reportSending) return;
        setReportSending(true);
        const { data: authData } = await supabase.auth.getUser();
        const reporterId = authData?.user?.id;
        if (!reporterId) { setReportSending(false); return; }
        const { error } = await supabase.from('mesaj_sikayetleri').insert([{
            reporter_id: reporterId,
            mesaj_id: String(reportModal.mesajId),
            kaynak: 'ihale_teklifi',
            mesaj_icerik: reportModal.mesajIcerik,
            neden: reportNeden,
            aciklama: reportAciklama.trim() || null,
        }]);
        setReportSending(false);
        setReportModal(null);
        setReportNeden('spam');
        setReportAciklama('');
        if (!error) {
            setReportSuccess(true);
            setTimeout(() => setReportSuccess(false), 3500);
        }
    };

    /* Enes Doğanay | 2 Mayıs 2026: Bidder olarak mesaj gönder */
    const sendMopChatMessage = useCallback(async () => {
        if (!mopChatInput.trim() || !activeMopChat) return;
        // Kapalı ihalede mesaj gönderilemesin
        const _mopTender = tenderMap[String(activeMopChat.offer.ihale_id)];
        if (getTenderStatus(_mopTender?.durum).tone === 'closed') return;
        setMopChatSending(true);
        const { data: authData } = await supabase.auth.getUser();
        const senderId = authData?.user?.id;
        if (!senderId) { setMopChatSending(false); return; }

        const { data, error } = await supabase
            .from('ihale_teklif_mesajlari')
            .insert([{
                teklif_id: activeMopChat.offer.id,
                sender_id: senderId,
                sender_role: 'bidder',
                mesaj: mopChatInput.trim(),
                okundu_bidder: true,
            }])
            .select()
            .single();

        if (!error && data) {
            setMopChatMessages(prev => [...prev, data]);
            setMopChatInput('');
            if (mopChatChannelRef.current) {
                await mopChatChannelRef.current.send({ type: 'broadcast', event: 'new-tender-message', payload: data });
            }
            scrollMopChatToBottom();
            // Firma yöneticilerine bildirim gönder
            try {
                const tender = tenderMap[String(activeMopChat.offer.ihale_id)];
                if (tender?.firma_id) {
                    const { data: managers } = await supabase.from('kurumsal_firma_yoneticileri').select('user_id').eq('firma_id', String(tender.firma_id));
                    if (managers?.length) {
                        const userName = [userProfile?.first_name, userProfile?.last_name].filter(Boolean).join(' ') || senderId;
                        const notifRows = managers.map(m => ({
                            user_id: m.user_id,
                            type: 'tender_offer_message',
                            title: 'İhale teklifinden mesaj',
                            message: `"${activeMopChat.tenderTitle || 'İhale'}" teklifine ${userName} mesaj gönderdi.`,
                            is_read: false,
                            metadata: {
                                ihale_id: activeMopChat.offer.ihale_id,
                                teklif_id: activeMopChat.offer.id,
                                ihale_baslik: activeMopChat.tenderTitle,
                            },
                        }));
                        supabase.from('bildirimler').insert(notifRows).then(() => {});
                    }
                }
            } catch { /* bildirim başarısız olsa bile mesaj gitti */ }
        }
        setMopChatSending(false);
    }, [mopChatInput, activeMopChat, tenderMap, userProfile, scrollMopChatToBottom]);

    /* Enes Doğanay | 2 Mayıs 2026: Unmount → kanalı temizle */
    useEffect(() => {
        return () => {
            if (mopChatChannelRef.current) supabase.removeChannel(mopChatChannelRef.current);
        };
    }, []);

    /* Enes Doğanay | 15 Nisan 2026: Teklif güncelle popup state'leri — Ihaleler.jsx'ten taşındı */
    const [editPopupTender, setEditPopupTender] = useState(null); // ihale bilgisi
    const [editPopupOffer, setEditPopupOffer] = useState(null); // mevcut teklif
    const [teklifForm, setTeklifForm] = useState({ kalemler: [], genel_toplam: '', para_birimi: 'TRY', kdv_dahil: false, teslim_suresi_gun: '', teslim_aciklamasi: '', not: '' });
    const [teklifDosya, setTeklifDosya] = useState(null);
    const [teklifSaving, setTeklifSaving] = useState(false);
    const [teklifError, setTeklifError] = useState('');
    const [teklifSuccess, setTeklifSuccess] = useState(false);
    const [currencyModalIdx, setCurrencyModalIdx] = useState(null);
    const [currencySearch, setCurrencySearch] = useState('');
    const teklifDosyaRef = useRef(null);

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
                    // Enes Doğanay | 2 Mayıs 2026: anonim alanı eklendi — firma/ref no gizleme için
                    .select('id, baslik, aciklama, referans_no, firma_id, durum, son_basvuru_tarihi, teslim_il, teslim_ilce, ihale_tipi, kategori, anonim')
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

    /* Enes Doğanay | 2 Mayıs 2026: Bildirimden yönlendirme — sessionStorage mop_open_teklif_chat ile chat aç */
    useEffect(() => {
        if (loading || offers.length === 0) return;
        const chatTeklifId = sessionStorage.getItem('mop_open_teklif_chat');
        if (!chatTeklifId) return;
        sessionStorage.removeItem('mop_open_teklif_chat');
        const targetOffer = offers.find(o => String(o.id) === chatTeklifId);
        if (targetOffer) {
            const tender = tenderMap[String(targetOffer.ihale_id)] || {};
            const firmaAdi = tender.anonim ? 'Anonim Firma' : (firmaMap[String(tender.firma_id)] || 'Firma');
            openMopChat(targetOffer, tender.baslik, firmaAdi, tender.anonim);
        }
    }, [loading, offers]);

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

    /* Enes Doğanay | 15 Nisan 2026: Teklifi sil — veritabanından kaldır */
    const handleDeleteOffer = async () => {
        if (!deleteConfirm) return;
        setDeleting(true);
        try {
            const { error } = await supabase
                .from('ihale_teklifleri')
                .delete()
                .eq('id', deleteConfirm.id);
            if (error) throw error;
            setOffers(prev => prev.filter(o => o.id !== deleteConfirm.id));
            if (expandedId === deleteConfirm.id) setExpandedId(null);
            setDeleteConfirm(null);
        } catch (err) {
            console.error('Teklif silinemedi:', err);
            alert('Teklif silinirken bir hata oluştu.');
        } finally {
            setDeleting(false);
        }
    };

    /* Enes Doğanay | 15 Nisan 2026: Teklif güncelle popup — formu mevcut teklif verileriyle doldur */
    const openEditPopup = async (offer, tender, firmaAdi) => {
        /* İhale detayını çek (gereksinimler için) */
        let tenderFull = { ...tender, firma_adi: firmaAdi };
        try {
            const { data: fullData } = await supabase
                .from('firma_ihaleleri')
                .select('*')
                .eq('id', tender.id)
                .maybeSingle();
            if (fullData) tenderFull = { ...fullData, firma_adi: firmaAdi };
        } catch { /* mevcut bilgiyle devam */ }

        /* Formu mevcut teklif verileriyle doldur */
        const loadedKalemler = Array.isArray(offer.kalemler) ? offer.kalemler.map(k => ({
            ...k,
            para_birimi: k.para_birimi || offer.para_birimi || 'TRY',
        })) : [];
        setTeklifForm({
            kalemler: loadedKalemler,
            genel_toplam: offer.toplam_tutar ? String(offer.toplam_tutar) : '',
            para_birimi: offer.para_birimi || 'TRY',
            kdv_dahil: offer.kdv_dahil || false,
            teslim_suresi_gun: offer.teslim_suresi_gun ? String(offer.teslim_suresi_gun) : '',
            teslim_aciklamasi: offer.teslim_aciklamasi || '',
            not: offer.not_field || '',
        });
        setTeklifDosya(null);
        setTeklifError('');
        setEditPopupOffer(offer);
        setEditPopupTender(tenderFull);
    };

    /* Enes Doğanay | 15 Nisan 2026: Kalem güncelle */
    const updateKalem = (idx, field, value) => {
        setTeklifForm(prev => {
            const kalemler = [...prev.kalemler];
            kalemler[idx] = { ...kalemler[idx], [field]: value };
            return { ...prev, kalemler };
        });
    };

    const getTeklifGenelToplam = () => {
        if (teklifForm.kalemler.length > 0) {
            return teklifForm.kalemler.reduce((sum, k) => sum + getKalemToplam(k), 0);
        }
        return parseFloat(teklifForm.genel_toplam) || 0;
    };

    const getGroupedTotals = () => {
        if (teklifForm.kalemler.length > 0) {
            const groups = {};
            teklifForm.kalemler.forEach(k => {
                const cur = k.para_birimi || 'TRY';
                const total = getKalemToplam(k);
                groups[cur] = (groups[cur] || 0) + total;
            });
            return groups;
        }
        const total = parseFloat(teklifForm.genel_toplam) || 0;
        return { [teklifForm.para_birimi]: total };
    };

    /* Enes Doğanay | 15 Nisan 2026: Teklif gönder / taslak kaydet — Ihaleler.jsx'tekiyle aynı mantık */
    const handleTeklifSubmit = async (isDraft = false) => {
        setTeklifSaving(true);
        setTeklifError('');
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user) { setTeklifError('Giriş yapmanız gerekiyor.'); setTeklifSaving(false); return; }

            if (!isDraft) {
                if (teklifForm.kalemler.length > 0) {
                    const emptyKalem = teklifForm.kalemler.find(k => !k.birim_fiyat || parseFloat(k.birim_fiyat) <= 0);
                    if (emptyKalem) { setTeklifError('Tüm kalemlerin birim fiyatı girilmelidir.'); setTeklifSaving(false); return; }
                } else {
                    if (!teklifForm.genel_toplam || parseFloat(teklifForm.genel_toplam) <= 0) { setTeklifError('Teklif tutarı girilmelidir.'); setTeklifSaving(false); return; }
                }
                if (!teklifForm.teslim_suresi_gun) { setTeklifError('Tahmini teslim süresini belirtin.'); setTeklifSaving(false); return; }
            }

            let dosyaUrl = null;
            let dosyaAdi = null;
            if (teklifDosya) {
                const ext = teklifDosya.name.split('.').pop();
                const path = `${session.user.id}/${Date.now()}.${ext}`;
                const { error: uploadErr } = await supabase.storage.from('teklif-ekleri').upload(path, teklifDosya);
                if (uploadErr) { setTeklifError('Dosya yüklenemedi: ' + uploadErr.message); setTeklifSaving(false); return; }
                dosyaUrl = path;
                dosyaAdi = teklifDosya.name;
            }

            const toplam = getTeklifGenelToplam();
            const effectiveParaBirimi = teklifForm.kalemler.length > 0 ? (teklifForm.kalemler[0]?.para_birimi || 'TRY') : teklifForm.para_birimi;
            const DB_ALLOWED = ['TRY', 'USD', 'EUR', 'GBP'];
            const safeParaBirimi = DB_ALLOWED.includes(effectiveParaBirimi) ? effectiveParaBirimi : 'TRY';

            const payload = {
                kalemler: teklifForm.kalemler.length > 0 ? teklifForm.kalemler : null,
                toplam_tutar: toplam,
                para_birimi: safeParaBirimi,
                kdv_dahil: teklifForm.kdv_dahil,
                teslim_suresi_gun: parseInt(teklifForm.teslim_suresi_gun, 10) || null,
                teslim_aciklamasi: teklifForm.teslim_aciklamasi || null,
                not_field: teklifForm.not || null,
                durum: isDraft ? 'taslak' : 'gonderildi',
                ...(dosyaUrl ? { ek_dosya_url: dosyaUrl, ek_dosya_adi: dosyaAdi } : {}),
            };

            const existingOffer = editPopupOffer;
            const { data: updatedRows, error: updateErr } = await supabase
                .from('ihale_teklifleri')
                .update({ ...payload, updated_at: new Date().toISOString() })
                .eq('id', existingOffer.id)
                .select();
            if (updateErr) throw updateErr;
            if (!updatedRows || updatedRows.length === 0) throw new Error('Teklif güncellenemedi.');

            /* Offers state'ini güncelle */
            setOffers(prev => prev.map(o => o.id === existingOffer.id ? updatedRows[0] : o));

            /* Bildirim gönder (taslak değilse) */
            if (!isDraft && editPopupTender?.firma_id) {
                const isDraftToSubmit = existingOffer.durum === 'taslak';
                const { data: managers } = await supabase.from('kurumsal_firma_yoneticileri').select('user_id').eq('firma_id', String(editPopupTender.firma_id));
                if (managers?.length) {
                    const userName = [userProfile?.first_name, userProfile?.last_name].filter(Boolean).join(' ') || session.user.email;
                    const isRealUpdate = !isDraftToSubmit;
                    const notifRows = managers.map(m => ({
                        user_id: m.user_id,
                        type: isRealUpdate ? 'tender_offer_updated' : 'tender_new_offer',
                        title: isRealUpdate ? 'Teklif güncellendi' : 'Yeni teklif geldi!',
                        message: isRealUpdate
                            ? `"${editPopupTender.baslik || 'İhale'}" ihalenize gelen bir teklifte güncelleme yapıldı.`
                            : `"${editPopupTender.baslik || 'İhale'}" ihalenize yeni bir teklif gönderildi.`,
                        firma_id: String(editPopupTender.firma_id),
                        is_read: false,
                        metadata: { ihale_id: editPopupTender.id, ihale_baslik: editPopupTender.baslik, teklif_id: existingOffer.id },
                    }));
                    supabase.from('bildirimler').insert(notifRows).then(() => {});
                }
            }

            setEditPopupTender(null);
            setEditPopupOffer(null);
            if (isDraft) {
                setTeklifSuccess('draft');
            } else {
                const isDraftToSubmit = existingOffer.durum === 'taslak';
                setTeklifSuccess(isDraftToSubmit ? true : 'update');
            }
            setTimeout(() => setTeklifSuccess(false), 4500);
        } catch (err) {
            setTeklifError(err.message || 'Teklif gönderilemedi.');
        } finally {
            setTeklifSaving(false);
        }
    };

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
                                            {/* Enes Doğanay | 2 Mayıs 2026: Anonim ihalede firma adı ve referans no gizlenir */}
                                            {tender.anonim ? (
                                                <span className="mop-card__firma mop-card__firma--anonim">
                                                    <span className="material-symbols-outlined">apartment</span>
                                                    Anonim Firma
                                                </span>
                                            ) : (
                                                <span className="mop-card__firma" onClick={e => { e.stopPropagation(); if (tender.firma_id) navigate(`/firmadetay/${tender.firma_id}`); }}>
                                                    <span className="material-symbols-outlined">apartment</span>
                                                    {firmaAdi}
                                                </span>
                                            )}
                                            {tender.referans_no && !tender.anonim && (
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

                                        {/* Enes Doğanay | 15 Nisan 2026: Buton sırası — İhaleye Git, İletişim, Güncelle, Sil */}
                                        <div className="mop-card__footer">
                                            <button className="mop-btn mop-btn--outline" onClick={() => navigate(`/ihaleler?ihale=${offer.ihale_id}`)}>
                                                <span className="material-symbols-outlined">gavel</span>
                                                İhaleye Git
                                            </button>
                                            {/* Enes Doğanay | 2 Mayıs 2026: İhale teklif mesajlaşma — taslak değilse göster */}
                                            {offer.durum !== 'taslak' && (
                                                <button
                                                    className={`mop-btn mop-btn--chat${unreadMopChatIds.has(offer.id) ? ' mop-btn--chat-unread' : ''}`}
                                                    onClick={() => openMopChat(offer, tender.baslik, firmaAdi, tender.anonim)}
                                                >
                                                    <span className="material-symbols-outlined">forum</span>
                                                    Mesaj Gönder
                                                    {unreadMopChatIds.has(offer.id) && <span className="mop-chat-unread-dot" />}
                                                </button>
                                            )}
                                            {/* Enes Doğanay | 2 Mayıs 2026: Anonim ihalede firma iletişim butonu gizlenir */}
                                            {tender.firma_id && !tender.anonim && (
                                                <button className="mop-btn mop-btn--contact" onClick={() => openFirmaContact(tender.firma_id, firmaAdi)}>
                                                    <span className="material-symbols-outlined">contact_phone</span>
                                                    Firma ile İletişime Geç
                                                </button>
                                            )}
                                            {/* Enes Doğanay | 2 Mayıs 2026: Güncelle butonu — Ihaleler sayfasına yönlendir, teklif popup orada açılır */}
                                            {tenderSt.tone === 'active' && st.tone !== 'accepted' && (
                                                <button className={`mop-btn ${st.tone === 'draft' ? 'mop-btn--draft' : 'mop-btn--primary'}`} onClick={() => navigate(`/ihaleler?ihale=${tender.id}&teklif=1`)}>
                                                    <span className="material-symbols-outlined">edit</span>
                                                    {st.tone === 'draft' ? 'Taslağı Güncelle' : 'Teklifi Güncelle'}
                                                </button>
                                            )}
                                            {/* Enes Doğanay | 15 Nisan 2026: Sil butonu — taslak ise "Taslağı Sil", gönderilmiş ise "Teklifi Sil" */}
                                            {(st.tone === 'draft' || st.tone === 'review') && (
                                                <button className="mop-btn mop-btn--danger" onClick={() => setDeleteConfirm(offer)}>
                                                    <span className="material-symbols-outlined">delete</span>
                                                    {st.tone === 'draft' ? 'Taslağı Sil' : 'Teklifi Sil'}
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

            {/* Enes Doğanay | 2 Mayıs 2026: İhale teklif mesajlaşma modal — bidder tarafı */}
            {activeMopChat && (
                <div className="mop-chat-overlay" onClick={closeMopChat}>
                    <div className="mop-chat-modal" onClick={e => e.stopPropagation()}>
                        <div className="mop-chat-header">
                            <div className="mop-chat-header__info">
                                <span className="material-symbols-outlined">chat</span>
                                <div>
                                    <strong>{activeMopChat.anonim ? 'Anonim Firma' : (activeMopChat.firmaAdi || 'Firma')}</strong>
                                    <span className="mop-chat-ihale-tag">
                                        <span className="material-symbols-outlined">gavel</span>
                                        {activeMopChat.tenderTitle || 'İhale'}
                                    </span>
                                </div>
                            </div>
                            <button className="mop-chat-close" onClick={closeMopChat}>
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="mop-chat-messages">
                            {mopChatLoading ? (
                                <div className="mop-chat-empty">
                                    <div className="mop-chat-spinner" />
                                    <p>Mesajlar yükleniyor...</p>
                                </div>
                            ) : mopChatMessages.length === 0 ? (
                                <div className="mop-chat-empty">
                                    <span className="material-symbols-outlined">chat_bubble_outline</span>
                                    <p>Henüz mesaj yok. Teklif hakkında firmaya soru sorabilirsiniz.</p>
                                </div>
                            ) : (
                                mopChatMessages.map((m) => (
                                    <div key={m.id} className={`mop-chat-bubble ${m.sender_role === 'bidder' ? 'mine' : 'theirs'}`}>
                                        <div className="mop-chat-bubble__header">
                                            <strong>{m.sender_role === 'bidder' ? 'Siz' : (activeMopChat.anonim ? 'Anonim Firma' : (activeMopChat.firmaAdi || 'Firma'))}</strong>
                                            <span>{new Date(m.created_at).toLocaleString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                        <p>{m.mesaj}</p>
                                        {/* Enes Doğanay | 2 Mayıs 2026: Şikayet butonu — sadece karşı tarafın mesajlarında */}
                                        {m.sender_role !== 'bidder' && (
                                            <button className="msg-report-btn" title="Mesajı Şikayet et" onClick={() => { setReportModal({ mesajId: m.id, mesajIcerik: m.mesaj }); setReportNeden('spam'); setReportAciklama(''); }}>
                                                <span className="material-symbols-outlined">flag</span>
                                            </button>
                                        )}
                                    </div>
                                ))
                            )}
                            <div ref={mopChatEndRef} />
                        </div>

                        {/* Enes Doğanay | 2 Mayıs 2026: Kapalı ihalede mesaj giriş alanı yerine bilgi banner'ı */}
                        {getTenderStatus(tenderMap[String(activeMopChat.offer.ihale_id)]?.durum).tone === 'closed' ? (
                            <div className="mop-chat-closed-banner">
                                <span className="material-symbols-outlined">lock</span>
                                Bu ihale kapatıldı. Artık mesaj gönderilemez.
                            </div>
                        ) : (
                        <div className="mop-chat-input">
                            <input
                                type="text"
                                placeholder="Mesajınızı yazın..."
                                value={mopChatInput}
                                onChange={e => setMopChatInput(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMopChatMessage(); } }}
                                disabled={mopChatSending}
                                maxLength={2000}
                            />
                            <button onClick={sendMopChatMessage} disabled={mopChatSending || !mopChatInput.trim()}>
                                <span className="material-symbols-outlined">{mopChatSending ? 'progress_activity' : 'send'}</span>
                            </button>
                        </div>
                        )}
                    </div>
                </div>
            )}

            {/* Enes Doğanay | 2 Mayıs 2026: Şikayet başarı toasty */}
            {reportSuccess && (
                <div className="msg-report-toast">
                    <span className="material-symbols-outlined">check_circle</span>
                    Şikayetiniz alındı. İncelenecektir.
                </div>
            )}

            {/* Enes Doğanay | 2 Mayıs 2026: Mesaj şikayet modal */}
            {reportModal && (
                <div className="msg-report-overlay" onClick={() => !reportSending && setReportModal(null)}>
                    <div className="msg-report-modal" onClick={e => e.stopPropagation()}>
                        <div className="msg-report-modal__header">
                            <span className="material-symbols-outlined">flag</span>
                            <h3>Mesajı Şikayet Et</h3>
                            <button className="msg-report-close" onClick={() => setReportModal(null)} disabled={reportSending}>
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="msg-report-modal__body">
                            <div className="msg-report-preview">{reportModal.mesajIcerik}</div>
                            <p className="msg-report-label">Şikayet nedeni</p>
                            <div className="msg-report-reasons">
                                {[{value:'spam',label:'Spam / İstenmeyen Mesaj'},{value:'hakaret',label:'Hakaret / İltihap'},{value:'tehdit',label:'Tehdit / Taciz'},{value:'yaniltici',label:'Yanıltıcı / Sahte Teklif'},{value:'diger',label:'Diğer'}].map(r => (
                                    <label key={r.value} className={`msg-report-reason${reportNeden === r.value ? ' selected' : ''}`}>
                                        <input type="radio" name="report-neden" value={r.value} checked={reportNeden === r.value} onChange={() => setReportNeden(r.value)} />
                                        {r.label}
                                    </label>
                                ))}
                            </div>
                            <p className="msg-report-label">Ek açıklama <span>(isteğe bağlı)</span></p>
                            <textarea className="msg-report-textarea" value={reportAciklama} onChange={e => setReportAciklama(e.target.value)} placeholder="Şikayet detayı..." maxLength={500} rows={3} />
                        </div>
                        <div className="msg-report-modal__footer">
                            <button className="msg-report-cancel" onClick={() => setReportModal(null)} disabled={reportSending}>İptal</button>
                            <button className="msg-report-submit" onClick={submitReport} disabled={reportSending}>
                                {reportSending ? <span className="material-symbols-outlined">progress_activity</span> : 'Şikayet Gönder'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Enes Doğanay | 15 Nisan 2026: Teklifi Sil onay modal */}
            {deleteConfirm && (
                <div className="mop-delete-overlay" onClick={() => !deleting && setDeleteConfirm(null)}>
                    <div className="mop-delete-modal" onClick={e => e.stopPropagation()}>
                        <div className="mop-delete-modal__icon">
                            <span className="material-symbols-outlined">warning</span>
                        </div>
                        <h3>{deleteConfirm.durum === 'taslak' ? 'Taslağı Silmek İstediğinize Emin Misiniz?' : 'Teklifinizi Silmek İstediğinize Emin Misiniz?'}</h3>
                        <p>Bu işlem geri alınamaz. {deleteConfirm.durum === 'taslak' ? 'Taslak teklifiniz' : 'Teklifiniz'} bu ihaleden tamamen silinecektir.</p>
                        <div className="mop-delete-modal__actions">
                            <button className="mop-delete-modal__btn mop-delete-modal__btn--cancel" onClick={() => setDeleteConfirm(null)} disabled={deleting}>
                                Vazgeç
                            </button>
                            <button className="mop-delete-modal__btn mop-delete-modal__btn--confirm" onClick={handleDeleteOffer} disabled={deleting}>
                                <span className="material-symbols-outlined">delete</span>
                                {deleting ? 'Siliniyor…' : 'Evet, Sil'}
                            </button>
                        </div>
                    </div>
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

            {/* Enes Doğanay | 15 Nisan 2026: Teklif güncelle popup — Ihaleler.jsx'teki popup bu sayfaya taşındı */}
            {editPopupTender && editPopupOffer && (() => {
                const tt = editPopupTender;
                const hasKalemler = teklifForm.kalemler.length > 0;
                const isDraftMode = editPopupOffer.durum === 'taslak';

                return (
                    <div className="teklif-popup-overlay">
                        <div className="teklif-popup" onClick={e => e.stopPropagation()}>
                            {/* Başlık */}
                            <div className="teklif-popup__head">
                                <div className="teklif-popup__head-left">
                                    <span className="material-symbols-outlined teklif-popup__head-icon">{isDraftMode ? 'draft' : 'edit'}</span>
                                    <div>
                                        <h2>{isDraftMode ? 'Taslağı Görüntüle' : 'Teklifi Güncelle'}</h2>
                                        <p className="teklif-popup__tender-name">{tt.baslik}</p>
                                        <p className="teklif-popup__tender-firma">
                                            <span className="material-symbols-outlined">apartment</span>
                                            {tt.firma_adi}
                                            {tt.referans_no && <span className="teklif-popup__ref"> • {tt.referans_no}</span>}
                                        </p>
                                    </div>
                                </div>
                                <button type="button" className="teklif-popup__close" onClick={() => { if (!teklifSaving) { setEditPopupTender(null); setEditPopupOffer(null); } }}>
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>

                            <div className="teklif-popup__body">
                                {/* İhale özet şeridi */}
                                <div className="teklif-popup__summary-strip">
                                    <div className="teklif-popup__summary-item">
                                        <span className="material-symbols-outlined">event_busy</span>
                                        <div><strong>Son Başvuru</strong><span>{formatTenderDate(tt.son_basvuru_tarihi)}</span></div>
                                    </div>
                                    <div className="teklif-popup__summary-item">
                                        <span className="material-symbols-outlined">location_on</span>
                                        <div><strong>Teslim Yeri</strong><span>{[tt.teslim_il, tt.teslim_ilce].filter(Boolean).join(', ') || '—'}</span></div>
                                    </div>
                                    <div className="teklif-popup__summary-item">
                                        <span className="material-symbols-outlined">receipt_long</span>
                                        <div><strong>KDV</strong><span>{tt.kdv_durumu === 'dahil' ? 'Dahil' : 'Hariç'}</span></div>
                                    </div>
                                </div>

                                {/* Teklif Detay */}
                                <div className="teklif-popup__section">
                                    <h3><span className="material-symbols-outlined">payments</span> Teklif Detay</h3>
                                    {hasKalemler ? (
                                        <div className="teklif-kalem-table">
                                            <div className="teklif-kalem-table__head">
                                                <span className="teklif-kalem-col teklif-kalem-col--no">#</span>
                                                <span className="teklif-kalem-col teklif-kalem-col--madde">Kalem</span>
                                                <span className="teklif-kalem-col teklif-kalem-col--miktar">Miktar</span>
                                                <span className="teklif-kalem-col teklif-kalem-col--fiyat">Birim Fiyat</span>
                                                <span className="teklif-kalem-col teklif-kalem-col--currency">Para Birimi</span>
                                                <span className="teklif-kalem-col teklif-kalem-col--toplam">Toplam</span>
                                            </div>
                                            {teklifForm.kalemler.map((kalem, idx) => {
                                                const kalemTotal = getKalemToplam(kalem);
                                                const kalemCurrency = kalem.para_birimi || 'TRY';
                                                return (
                                                    <div key={kalem.gereksinim_id || idx} className="teklif-kalem-table__row">
                                                        <span className="teklif-kalem-col teklif-kalem-col--no">{idx + 1}</span>
                                                        <div className="teklif-kalem-col teklif-kalem-col--madde">
                                                            <strong>{kalem.madde}</strong>
                                                            <input type="text" placeholder="Açıklama / not…" value={kalem.aciklama} onChange={e => updateKalem(idx, 'aciklama', e.target.value)} className="teklif-kalem-input teklif-kalem-input--note" />
                                                        </div>
                                                        <div className="teklif-kalem-col teklif-kalem-col--miktar">
                                                            <input type="number" min="1" value={kalem.miktar} onChange={e => updateKalem(idx, 'miktar', e.target.value)} className="teklif-kalem-input" />
                                                        </div>
                                                        <div className="teklif-kalem-col teklif-kalem-col--fiyat">
                                                            <input type="number" min="0" step="0.01" placeholder="0.00" value={kalem.birim_fiyat} onChange={e => updateKalem(idx, 'birim_fiyat', e.target.value)} className="teklif-kalem-input" />
                                                        </div>
                                                        <div className="teklif-kalem-col teklif-kalem-col--currency">
                                                            <select
                                                                value={MAIN_CURRENCIES.some(c => c.code === kalemCurrency) ? kalemCurrency : '_other'}
                                                                onChange={e => { if (e.target.value === '_other') { setCurrencyModalIdx(idx); setCurrencySearch(''); } else { updateKalem(idx, 'para_birimi', e.target.value); } }}
                                                                className="teklif-kalem-currency-select"
                                                            >
                                                                {MAIN_CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.symbol} {c.code}</option>)}
                                                                <option value="_other">Diğer…</option>
                                                            </select>
                                                            {!MAIN_CURRENCIES.some(c => c.code === kalemCurrency) && kalemCurrency !== 'TRY' && (
                                                                <span className="teklif-kalem-currency-badge">{getCurrencySymbol(kalemCurrency)} {kalemCurrency}</span>
                                                            )}
                                                        </div>
                                                        <span className="teklif-kalem-col teklif-kalem-col--toplam teklif-kalem-col--amount">{formatCurrency(kalemTotal, kalemCurrency)}</span>
                                                    </div>
                                                );
                                            })}
                                            <div className="teklif-kalem-table__footer">
                                                <span>Genel Toplam</span>
                                                <div className="teklif-kalem-table__footer-totals">
                                                    {Object.entries(getGroupedTotals()).filter(([, amt]) => amt > 0).map(([cur, amt]) => <strong key={cur}>{formatCurrency(amt, cur)}</strong>)}
                                                    {Object.values(getGroupedTotals()).every(v => v === 0) && <strong>{formatCurrency(0, 'TRY')}</strong>}
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="teklif-popup__single-amount">
                                            <label>Teklif Tutarı</label>
                                            <div className="teklif-popup__amount-row">
                                                <input type="number" min="0" step="0.01" placeholder="0.00" value={teklifForm.genel_toplam} onChange={e => setTeklifForm(p => ({ ...p, genel_toplam: e.target.value }))} className="teklif-popup__amount-input" />
                                                <select
                                                    value={MAIN_CURRENCIES.some(c => c.code === teklifForm.para_birimi) ? teklifForm.para_birimi : '_other'}
                                                    onChange={e => { if (e.target.value === '_other') { setCurrencyModalIdx('single'); setCurrencySearch(''); } else { setTeklifForm(p => ({ ...p, para_birimi: e.target.value })); } }}
                                                    className="teklif-popup__currency-select"
                                                >
                                                    {MAIN_CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.symbol} {c.code}</option>)}
                                                    <option value="_other">Diğer…</option>
                                                </select>
                                            </div>
                                        </div>
                                    )}
                                    <label className="teklif-popup__toggle" style={{ marginTop: 10 }}>
                                        <input type="checkbox" checked={teklifForm.kdv_dahil} onChange={e => setTeklifForm(p => ({ ...p, kdv_dahil: e.target.checked }))} />
                                        <span className="teklif-popup__toggle-slider" />
                                        <span>KDV Dahil</span>
                                    </label>
                                </div>

                                {/* Teslimat */}
                                <div className="teklif-popup__section">
                                    <h3><span className="material-symbols-outlined">local_shipping</span> Teslimat</h3>
                                    <div className="teklif-popup__inline-row">
                                        <div className="teklif-popup__inline-field">
                                            <label>Tahmini Teslim Süresi (gün)</label>
                                            <input type="number" min="1" placeholder="ör: 15" value={teklifForm.teslim_suresi_gun} onChange={e => setTeklifForm(p => ({ ...p, teslim_suresi_gun: e.target.value }))} />
                                        </div>
                                        <div className="teklif-popup__inline-field teklif-popup__inline-field--grow">
                                            <label>Teslim Açıklaması</label>
                                            <input type="text" placeholder="ör: Fabrikadan teslim, kargo dahil" value={teklifForm.teslim_aciklamasi} onChange={e => setTeklifForm(p => ({ ...p, teslim_aciklamasi: e.target.value }))} />
                                        </div>
                                    </div>
                                </div>

                                {/* Dosya */}
                                <div className="teklif-popup__section">
                                    <h3><span className="material-symbols-outlined">attach_file</span> Teklif Dosyası</h3>
                                    <div className="teklif-popup__file-area">
                                        {teklifDosya ? (
                                            <div className="teklif-popup__file-chip">
                                                <span className="material-symbols-outlined">description</span>
                                                <span>{teklifDosya.name}</span>
                                                <button type="button" onClick={() => { setTeklifDosya(null); if (teklifDosyaRef.current) teklifDosyaRef.current.value = ''; }}>
                                                    <span className="material-symbols-outlined">close</span>
                                                </button>
                                            </div>
                                        ) : (
                                            <button type="button" className="teklif-popup__file-upload" onClick={() => teklifDosyaRef.current?.click()}>
                                                <span className="material-symbols-outlined">cloud_upload</span>
                                                <span>Dosya Yükle</span>
                                                <small>PDF, Excel, Word — maks. 10 MB</small>
                                            </button>
                                        )}
                                        <input ref={teklifDosyaRef} type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.zip" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f && f.size <= 10 * 1024 * 1024) setTeklifDosya(f); else if (f) setTeklifError('Dosya 10 MB limitini aşıyor.'); }} />
                                    </div>
                                </div>

                                {/* Not */}
                                <div className="teklif-popup__section">
                                    <h3><span className="material-symbols-outlined">sticky_note_2</span> Ek Not <small>(opsiyonel)</small></h3>
                                    <textarea rows="3" placeholder="İhale sahibine iletmek istediğiniz ek bilgi veya notlar…" value={teklifForm.not} onChange={e => setTeklifForm(p => ({ ...p, not: e.target.value }))} className="teklif-popup__textarea" />
                                </div>

                                {teklifError && (
                                    <div className="teklif-popup__error">
                                        <span className="material-symbols-outlined">error</span>
                                        {teklifError}
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="teklif-popup__footer">
                                <div className="teklif-popup__footer-total">
                                    <span>Toplam Teklif</span>
                                    <div className="teklif-popup__footer-amounts">
                                        {(() => {
                                            const grouped = getGroupedTotals();
                                            const entries = Object.entries(grouped).filter(([, amt]) => amt > 0);
                                            if (entries.length === 0) return <strong>{formatCurrency(0, 'TRY')}</strong>;
                                            return entries.map(([cur, amt]) => <strong key={cur}>{formatCurrency(amt, cur)}</strong>);
                                        })()}
                                    </div>
                                    {teklifForm.kdv_dahil && <small>KDV Dahil</small>}
                                </div>
                                <div className="teklif-popup__footer-actions">
                                    {isDraftMode ? (
                                        <button type="button" className="teklif-btn teklif-btn--draft" disabled={teklifSaving} onClick={() => handleTeklifSubmit(true)}>
                                            <span className="material-symbols-outlined">save</span>
                                            {teklifSaving ? 'Kaydediliyor…' : 'Taslak Kaydet'}
                                        </button>
                                    ) : (
                                        <button type="button" className="teklif-btn teklif-btn--withdraw" disabled={teklifSaving} onClick={() => { setEditPopupTender(null); setEditPopupOffer(null); }}>
                                            <span className="material-symbols-outlined">undo</span>
                                            Vazgeç
                                        </button>
                                    )}
                                    <button type="button" className="teklif-btn teklif-btn--submit" disabled={teklifSaving} onClick={() => handleTeklifSubmit(false)}>
                                        <span className="material-symbols-outlined">{isDraftMode ? 'send' : 'edit'}</span>
                                        {teklifSaving ? 'Gönderiliyor…' : (isDraftMode ? 'Teklifi Gönder' : 'Teklifi Güncelle')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })()}

            {/* Enes Doğanay | 15 Nisan 2026: Para birimi seçim modalı */}
            {currencyModalIdx !== null && (
                <div className="teklif-popup-overlay" style={{ zIndex: 10001 }} onClick={() => setCurrencyModalIdx(null)}>
                    <div className="teklif-currency-modal" onClick={e => e.stopPropagation()}>
                        <div className="teklif-currency-modal__head">
                            <h3><span className="material-symbols-outlined">currency_exchange</span> Para Birimi Seçin</h3>
                            <button type="button" onClick={() => setCurrencyModalIdx(null)}><span className="material-symbols-outlined">close</span></button>
                        </div>
                        <div className="teklif-currency-modal__search">
                            <span className="material-symbols-outlined">search</span>
                            <input type="text" placeholder="Para birimi ara…" value={currencySearch} onChange={e => setCurrencySearch(e.target.value)} autoFocus />
                            {currencySearch && <button type="button" onClick={() => setCurrencySearch('')}><span className="material-symbols-outlined">close</span></button>}
                        </div>
                        <div className="teklif-currency-modal__list">
                            {ALL_CURRENCIES.filter(c => { if (!currencySearch.trim()) return true; const q = currencySearch.trim().toLocaleLowerCase('tr-TR'); return c.code.toLocaleLowerCase('tr-TR').includes(q) || c.name.toLocaleLowerCase('tr-TR').includes(q) || c.symbol.toLocaleLowerCase('tr-TR').includes(q); }).map(c => (
                                <button key={c.code} className="teklif-currency-modal__item" onClick={() => { if (currencyModalIdx === 'single') { setTeklifForm(p => ({ ...p, para_birimi: c.code })); } else { updateKalem(currencyModalIdx, 'para_birimi', c.code); } setCurrencyModalIdx(null); }}>
                                    <span className="teklif-currency-modal__symbol">{c.symbol}</span>
                                    <span className="teklif-currency-modal__code">{c.code}</span>
                                    <span className="teklif-currency-modal__name">{c.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Enes Doğanay | 15 Nisan 2026: Teklif başarı overlay */}
            {teklifSuccess && (
                <div className="teklif-success-overlay" onClick={() => setTeklifSuccess(false)}>
                    <div className={`teklif-success-card${teklifSuccess === 'draft' ? ' teklif-success-card--draft' : ''}`} onClick={e => e.stopPropagation()}>
                        <div className={`teklif-success-card__icon${teklifSuccess === 'draft' ? ' teklif-success-card__icon--draft' : ''}`}>
                            <span className="material-symbols-outlined">{teklifSuccess === 'draft' ? 'draft' : 'check_circle'}</span>
                        </div>
                        <h3>{teklifSuccess === 'draft' ? 'Taslak Kaydedildi!' : teklifSuccess === 'update' ? 'Teklifiniz Güncellendi!' : 'Teklifiniz Gönderildi!'}</h3>
                        <p>{teklifSuccess === 'draft'
                            ? 'Teklifiniz taslak olarak kaydedildi. İstediğiniz zaman düzenleyip gönderebilirsiniz.'
                            : teklifSuccess === 'update'
                            ? 'Teklifiniz başarıyla güncellendi. İhale sahibi güncel teklifinizi görebilir.'
                            : 'Teklifiniz ihale sahibine başarıyla iletildi.'
                        }</p>
                        <button className="teklif-success-card__btn" onClick={() => setTeklifSuccess(false)}>Tamam</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyOffersPanel;
