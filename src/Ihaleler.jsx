import React, { useEffect, useCallback, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './Ihaleler.css';
import './SharedHeader.css';
import SharedHeader from './SharedHeader';
import { supabase } from './supabaseClient';
import { formatTenderDate, getTenderStatusMeta } from './tenderUtils';
// Enes Doğanay | 6 Nisan 2026: Kurumsal giriş için ihale CRUD API'si eklendi
import { getManagedCompanyId } from './companyManagementApi';
import { listMyTenders, createTender, updateTender, deleteTender } from './ihaleManagementApi';
// Enes Doğanay | 10 Nisan 2026: Teslim yeri il/ilçe seçimi için
import { TURKEY_DISTRICTS } from './turkeyDistricts';
import CitySelect from './CitySelect';
// Enes Doğanay | 10 Nisan 2026: Auth context — teklif popup'ında kullanıcı bilgisi
import { useAuth } from './AuthContext';

// Enes Doğanay | 6 Nisan 2026: Ihale tablosu henuz kurulmamissa ekran kirilmasin diye iliski hatasi yumusatilir
const isMissingRelationError = (error) => error?.code === '42P01' || error?.message?.toLowerCase().includes('relation');

// Enes Doğanay | 10 Nisan 2026: Kategori, bütçe notu kaldırıldı; kdv, teslim il/ilçe, gereksinimler, davet emailleri, davetli firmalar eklendi
// Enes Doğanay | 10 Nisan 2026: Stepper form yapısına geçildi, teslim_suresi eklendi
const EMPTY_FORM = {
    baslik: '', aciklama: '', ihale_tipi: 'Açık İhale',
    kdv_durumu: 'haric',
    yayin_tarihi: '', son_basvuru_tarihi: '',
    teslim_suresi: '',
    durum: 'canli',
    referans_no: '',
    teslim_il: '', teslim_ilce: '',
    gereksinimler: [],       // [{id, madde, aciklama}]
    davet_emailleri: [],     // string[]
    davetli_firmalar: [],    // [{firma_id, firma_adi, onayli}]
    ek_dosyalar: [],         // File[]
};

// Enes Doğanay | 10 Nisan 2026: Stepper adım tanımları
const STEPPER_LABELS = [
    { key: 'temel', label: 'Temel Bilgiler', icon: 'edit_note' },
    { key: 'detay', label: 'İhale Detayları', icon: 'tune' },
    { key: 'sartlar', label: 'Teknik Şartlar', icon: 'checklist' },
    { key: 'onizleme', label: 'Önizleme', icon: 'preview' },
];

const IhalelerPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const firmaFilter = searchParams.get('firma') || '';
    // Enes Doğanay | 10 Nisan 2026: Auth context — teklif popup'ında kullanıcı bilgisi için
    const { userProfile, managedCompanyId: authManagedCompanyId, managedCompanyName } = useAuth() || {};

    const [tenders, setTenders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortBy, setSortBy] = useState('deadline');
    const [selectedFirmaName, setSelectedFirmaName] = useState('');
    const [tableMissing, setTableMissing] = useState(false);

    // Enes Doğanay | 7 Nisan 2026: Görünüm tercihi localStorage'dan okunur ve kullanıcıya özgü kalır
    const [viewMode, setViewMode] = useState(() => {
        try { return localStorage.getItem('tedport_ihale_view') || 'grid'; } catch { return 'grid'; }
    });

    // Enes Doğanay | 6 Nisan 2026: Kurumsal kullanıcı state'leri
    const [managedFirmaId, setManagedFirmaId] = useState(null);
    const [myTenders, setMyTenders] = useState([]);
    const [myTendersLoading, setMyTendersLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingTender, setEditingTender] = useState(null); // null = yeni, obje = düzenle
    const [form, setForm] = useState(EMPTY_FORM);
    const [formSaving, setFormSaving] = useState(false);
    const [formError, setFormError] = useState('');
    const [deleteConfirmId, setDeleteConfirmId] = useState(null);

    // Enes Doğanay | 10 Nisan 2026: Stepper adım kontrolü (0-3)
    const [stepperStep, setStepperStep] = useState(0);

    // Enes Doğanay | 10 Nisan 2026: Gereksinim ekleme, e-posta tag input ve davetli firma arama state'leri
    const [yeniGereksinimMadde, setYeniGereksinimMadde] = useState('');
    const [yeniGereksinimAciklama, setYeniGereksinimAciklama] = useState('');
    const [emailInput, setEmailInput] = useState('');
    const [firmaSearchTerm, setFirmaSearchTerm] = useState('');
    const [firmaSearchResults, setFirmaSearchResults] = useState([]);
    const [firmaSearching, setFirmaSearching] = useState(false);
    const firmaSearchTimeout = useRef(null);
    const fileInputRef = useRef(null);
    const firmaResultsRef = useRef(null);
    // Enes Doğanay | 10 Nisan 2026: Verified kullanıcı kontrolü (davetli ihale hakkı)
    const [isVerifiedUser, setIsVerifiedUser] = useState(false);

    // Enes Doğanay | 11 Nisan 2026: İhale detay drawer state
    const [detailTender, setDetailTender] = useState(null);

    // Enes Doğanay | 10 Nisan 2026: Teklif Ver popup state'leri
    const [teklifTender, setTeklifTender] = useState(null); // hangi ihaleye teklif veriliyor
    const [teklifForm, setTeklifForm] = useState({
        kalemler: [],       // [{gereksinim_id, madde, birim_fiyat, miktar, aciklama}]
        genel_toplam: '',   // kalem yoksa tek tutar
        para_birimi: 'TRY',
        kdv_dahil: false,
        teslim_suresi_gun: '',
        teslim_aciklamasi: '',
        not: '',
    });
    const [teklifDosya, setTeklifDosya] = useState(null);
    const [teklifSaving, setTeklifSaving] = useState(false);
    const [teklifError, setTeklifError] = useState('');
    const teklifDosyaRef = useRef(null);

    // Kurumsal giriş kontrolü
    // Enes Doğanay | 10 Nisan 2026: Stale session'da hata yutulur, sayfa kırılmaz + verified firma kontrolü
    useEffect(() => {
        getManagedCompanyId().then(async (id) => {
            setManagedFirmaId(id || null);
            if (id) {
                const { data } = await supabase.from('firmalar').select('onayli_hesap').eq('firmaID', id).maybeSingle();
                setIsVerifiedUser(data?.onayli_hesap === true);
            }
        }).catch(() => {});
    }, []);

    // Kendi ihalelerini çek (sadece kurumsal kullanıcılar için)
    const fetchMyTenders = useCallback(async () => {
        if (!managedFirmaId) return;
        setMyTendersLoading(true);
        try {
            const data = await listMyTenders();
            setMyTenders(data);
        } catch {
            setMyTenders([]);
        } finally {
            setMyTendersLoading(false);
        }
    }, [managedFirmaId]);

    useEffect(() => { fetchMyTenders(); }, [fetchMyTenders]);

    // Enes Doğanay | 10 Nisan 2026: Otomatik referans no üretimi — TED-DOĞ-2026-0001 formatı
    const generateReferansNo = useCallback(async () => {
        if (!managedFirmaId) return '';
        try {
            const { data: firma } = await supabase.from('firmalar').select('firma_adi').eq('firmaID', managedFirmaId).maybeSingle();
            if (!firma?.firma_adi) return '';
            const firmaAdi = firma.firma_adi.trim();
            const prefix = firmaAdi.slice(0, 3).toLocaleUpperCase('tr-TR');
            const year = new Date().getFullYear();

            // Mevcut referans numaralarını kontrol et, iterasyon belirle
            const { data: existing } = await supabase
                .from('firma_ihaleleri')
                .select('referans_no')
                .eq('firma_id', managedFirmaId);

            const myRefs = (existing || []).map(r => r.referans_no).filter(Boolean);
            const pattern = new RegExp(`^TED-${prefix}\\d*-${year}-(\\d+)$`);
            let maxSeq = 0;
            myRefs.forEach(ref => { const m = ref.match(pattern); if (m) maxSeq = Math.max(maxSeq, parseInt(m[1], 10)); });
            const nextSeq = String(maxSeq + 1).padStart(4, '0');

            // Aynı prefix kullanan başka firma var mı kontrol et
            const { data: others } = await supabase
                .from('firma_ihaleleri')
                .select('referans_no')
                .neq('firma_id', managedFirmaId)
                .like('referans_no', `TED-${prefix}%-${year}-%`);

            const hasSamePrefix = (others || []).length > 0;
            const suffix = hasSamePrefix ? `${prefix}2` : prefix;
            // Eğer aynı prefix başka firmada varsa kendi DB'deki referans kontrol et
            if (hasSamePrefix) {
                const p2 = new RegExp(`^TED-${suffix}-${year}-(\\d+)$`);
                myRefs.forEach(ref => { const m = ref.match(p2); if (m) maxSeq = Math.max(maxSeq, parseInt(m[1], 10)); });
                return `TED-${suffix}-${year}-${String(maxSeq + 1).padStart(4, '0')}`;
            }

            return `TED-${prefix}-${year}-${nextSeq}`;
        } catch {
            return '';
        }
    }, [managedFirmaId]);

    const openCreate = async () => {
        setEditingTender(null);
        const refNo = await generateReferansNo();
        setForm({ ...EMPTY_FORM, referans_no: refNo, gereksinimler: [], davet_emailleri: [], davetli_firmalar: [], ek_dosyalar: [] });
        setFormError('');
        setYeniGereksinimMadde('');
        setYeniGereksinimAciklama('');
        setEmailInput('');
        setFirmaSearchTerm('');
        setFirmaSearchResults([]);
        setStepperStep(0);
        setShowModal(true);
    };

    // Enes Doğanay | 6 Nisan 2026: DB'den gelen tarih ISO formatında olabilir, <input type="date"> için YYYY-MM-DD'ye çevir
    const toDateInput = (v) => {
        if (!v) return '';
        const s = String(v);
        if (s.includes('T')) return s.split('T')[0];
        return s.length >= 10 ? s.slice(0, 10) : s;
    };

    const openEdit = (tender) => {
        setEditingTender(tender);
        // Enes Doğanay | 10 Nisan 2026: Eski il_ilce alanını teslim_il / teslim_ilce'ye dönüştür
        let teslimIl = tender.teslim_il || '';
        let teslimIlce = tender.teslim_ilce || '';
        if (!teslimIl && tender.il_ilce) {
            const parts = tender.il_ilce.split('/').map(s => s.trim());
            teslimIl = parts[0] || '';
            teslimIlce = parts[1] || '';
        }
        setForm({
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
            davet_emailleri: tender.davet_emailleri || [],
            davetli_firmalar: tender.davetli_firmalar || [],
            ek_dosyalar: tender.ek_dosyalar || [],  // Enes Doğanay | 10 Nisan 2026: Kaydedilmiş dosyaları yükle
        });
        setFormError('');
        setYeniGereksinimMadde('');
        setYeniGereksinimAciklama('');
        setEmailInput('');
        setFirmaSearchTerm('');
        setFirmaSearchResults([]);
        setStepperStep(0);
        setShowModal(true);
    };

    // Enes Doğanay | 10 Nisan 2026: İhaleyi klonla (tekrarla) — yeni referans no ile aynı verileri kopyalar
    const handleClone = async (tender) => {
        const refNo = await generateReferansNo();
        setEditingTender(null);
        let teslimIl = tender.teslim_il || '';
        let teslimIlce = tender.teslim_ilce || '';
        if (!teslimIl && tender.il_ilce) {
            const parts = tender.il_ilce.split('/').map(s => s.trim());
            teslimIl = parts[0] || '';
            teslimIlce = parts[1] || '';
        }
        setForm({
            baslik: tender.baslik || '',
            aciklama: tender.aciklama || '',
            ihale_tipi: tender.ihale_tipi || 'Açık İhale',
            kdv_durumu: tender.kdv_durumu || 'haric',
            yayin_tarihi: '',
            son_basvuru_tarihi: '',
            teslim_suresi: tender.teslim_suresi || '',
            durum: 'draft',
            referans_no: refNo,
            teslim_il: teslimIl,
            teslim_ilce: teslimIlce,
            gereksinimler: tender.gereksinimler || [],
            davet_emailleri: tender.davet_emailleri || [],
            davetli_firmalar: tender.davetli_firmalar || [],
            ek_dosyalar: [],
        });
        setFormError('');
        setStepperStep(0);
        setShowModal(true);
    };

    // Enes Doğanay | 10 Nisan 2026: Gereksinim ekleme
    const addGereksinim = () => {
        if (!yeniGereksinimMadde.trim()) return;
        const newItem = { id: Date.now(), madde: yeniGereksinimMadde.trim(), aciklama: yeniGereksinimAciklama.trim() };
        setForm(p => ({ ...p, gereksinimler: [...p.gereksinimler, newItem] }));
        setYeniGereksinimMadde('');
        setYeniGereksinimAciklama('');
    };
    const removeGereksinim = (id) => setForm(p => ({ ...p, gereksinimler: p.gereksinimler.filter(g => g.id !== id) }));

    // Enes Doğanay | 10 Nisan 2026: Çoklu e-posta tag input
    const addEmail = () => {
        const email = emailInput.trim().toLowerCase();
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;
        if (form.davet_emailleri.includes(email)) return;
        setForm(p => ({ ...p, davet_emailleri: [...p.davet_emailleri, email] }));
        setEmailInput('');
    };
    const removeEmail = (email) => setForm(p => ({ ...p, davet_emailleri: p.davet_emailleri.filter(e => e !== email) }));
    const handleEmailKeyDown = (e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addEmail(); } };

    // Enes Doğanay | 10 Nisan 2026: Davetli firma arama — firmalar tablosundan aranır
    const searchFirmalar = useCallback(async (term) => {
        if (!term || term.length < 2) { setFirmaSearchResults([]); return; }
        setFirmaSearching(true);
        try {
            const { data } = await supabase
                .from('firmalar')
                .select('firmaID, firma_adi, onayli_hesap')
                .ilike('firma_adi', `%${term}%`)
                .limit(8);
            setFirmaSearchResults(data || []);
            /* Enes Doğanay | 10 Nisan 2026: Sonuçlar yüklenince otomatik scroll */
            setTimeout(() => firmaResultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 80);
        } catch {
            setFirmaSearchResults([]);
        } finally {
            setFirmaSearching(false);
        }
    }, []);

    const handleFirmaSearch = (val) => {
        setFirmaSearchTerm(val);
        if (firmaSearchTimeout.current) clearTimeout(firmaSearchTimeout.current);
        firmaSearchTimeout.current = setTimeout(() => searchFirmalar(val), 300);
    };

    const addDavetliFirma = (firma) => {
        if (form.davetli_firmalar.some(f => f.firma_id === firma.firmaID)) return;
        setForm(p => ({ ...p, davetli_firmalar: [...p.davetli_firmalar, { firma_id: firma.firmaID, firma_adi: firma.firma_adi, onayli: firma.onayli_hesap === true }] }));
        setFirmaSearchTerm('');
        setFirmaSearchResults([]);
    };
    const removeDavetliFirma = (firmaId) => setForm(p => ({ ...p, davetli_firmalar: p.davetli_firmalar.filter(f => f.firma_id !== firmaId) }));

    // Enes Doğanay | 10 Nisan 2026: Ek dosya yönetimi
    const handleFileAdd = (e) => {
        const files = Array.from(e.target.files || []);
        const valid = files.filter(f => f.size <= 10 * 1024 * 1024);
        if (valid.length < files.length) setFormError('10 MB üzeri dosyalar eklenmedi.');
        setForm(p => ({ ...p, ek_dosyalar: [...p.ek_dosyalar, ...valid] }));
        if (fileInputRef.current) fileInputRef.current.value = '';
    };
    const removeFile = (idx) => setForm(p => ({ ...p, ek_dosyalar: p.ek_dosyalar.filter((_, i) => i !== idx) }));

    // Enes Doğanay | 10 Nisan 2026: Taslak kaydet / Yayınla ayrımı ile form gönderimi
    const handleFormSubmit = async (e, forceDurum) => {
        if (e) e.preventDefault();
        setFormSaving(true);
        setFormError('');
        try {
            // Davetli ihale seçilmişse firma listesi zorunlu
            if (form.ihale_tipi === 'Davetli İhale' && form.davetli_firmalar.length === 0) {
                setFormError('Davetli ihale için en az bir firma eklemeniz gerekiyor.');
                setFormSaving(false);
                return;
            }
            // Onaysız firma kontrolü
            const onaysizFirma = form.davetli_firmalar.find(f => !f.onayli);
            if (onaysizFirma) {
                setFormError(`"${onaysizFirma.firma_adi}" henüz onaylı bir firma değil. Lütfen onaysız firmaları kaldırın.`);
                setFormSaving(false);
                return;
            }

            /* Enes Doğanay | 10 Nisan 2026: Ek dosyaları ihale-ekleri bucket'ına yükle */
            const uploadedFiles = [];
            // Mevcut kaydedilmiş dosyaları koru (düzenleme sırasında)
            const existingFiles = form.ek_dosyalar.filter(f => f.path && f.url);
            uploadedFiles.push(...existingFiles);

            // Yeni File nesnelerini yükle
            const newFiles = form.ek_dosyalar.filter(f => f instanceof File);
            for (const file of newFiles) {
                const timestamp = Date.now();
                const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
                const filePath = `${form.referans_no || 'temp'}/${timestamp}_${safeName}`;
                const { error: uploadError } = await supabase.storage
                    .from('ihale-ekleri')
                    .upload(filePath, file, { upsert: false });
                if (uploadError) {
                    setFormError(`"${file.name}" yüklenemedi: ${uploadError.message}`);
                    setFormSaving(false);
                    return;
                }
                const { data: urlData } = supabase.storage
                    .from('ihale-ekleri')
                    .getPublicUrl(filePath);
                uploadedFiles.push({
                    name: file.name,
                    path: filePath,
                    size: file.size,
                    url: urlData.publicUrl,
                });
            }

            const payload = {
                ...form,
                durum: forceDurum || form.durum,
                // Eski uyumluluk: teslim il/ilce → il_ilce birleştir
                il_ilce: [form.teslim_il, form.teslim_ilce].filter(Boolean).join(' / '),
                // Dosya meta bilgilerini gönder
                ek_dosyalar: uploadedFiles,
            };

            if (editingTender) {
                await updateTender(editingTender.id, payload);
            } else {
                await createTender(payload);
            }
            setShowModal(false);
            // Enes Doğanay | 6 Nisan 2026: Hem kendi listemizi hem public listeyi yenile
            await fetchMyTenders();
            await fetchPublicTenders();
        } catch (err) {
            setFormError(err.message || 'Kaydedilemedi.');
        } finally {
            setFormSaving(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteTender(id);
            setDeleteConfirmId(null);
            await fetchMyTenders();
            await fetchPublicTenders();
        } catch (err) {
            alert(err.message || 'Silinemedi.');
        }
    };

    // Enes Doğanay | 6 Nisan 2026: Public ihale listesini çeken fonksiyon (useEffect dışına alındı, CRUD sonrası da çağrılır)
    const fetchPublicTenders = useCallback(async () => {
        setLoading(true);
        try {
            const tenderQuery = supabase
                .from('firma_ihaleleri')
                .select('*')
                .neq('durum', 'draft')
                .order('is_featured', { ascending: false })
                .order('yayin_tarihi', { ascending: false });

            if (firmaFilter) {
                tenderQuery.eq('firma_id', firmaFilter);
            }

            const { data: tenderData, error: tenderError } = await tenderQuery;

            if (tenderError) {
                if (isMissingRelationError(tenderError)) {
                    setTableMissing(true);
                    setTenders([]);
                    setLoading(false);
                    return;
                }
                throw tenderError;
            }

            const firmaIds = [...new Set((tenderData || []).map((tender) => tender.firma_id).filter(Boolean))];
            const { data: firmsData, error: firmsError } = firmaIds.length > 0
                ? await supabase.from('firmalar').select('firmaID, firma_adi, category_name, il_ilce').in('firmaID', firmaIds)
                : { data: [], error: null };

            if (firmsError) throw firmsError;

            const mappedTenders = (tenderData || []).map((tender) => {
                const firm = (firmsData || []).find((firma) => String(firma.firmaID) === String(tender.firma_id)) || {};
                return {
                    ...tender,
                    firma_adi: firm.firma_adi || tender.firma_adi || 'Firma bilgisi bulunamadı',
                    firma_kategori: firm.category_name || '',
                    firma_konum: firm.il_ilce || tender.il_ilce || 'Konum belirtilmedi'
                };
            });

            setTenders(mappedTenders);
            setSelectedFirmaName(firmaFilter ? mappedTenders[0]?.firma_adi || '' : '');
            setTableMissing(false);
        } catch (error) {
            console.error('İhaleler alınamadı:', error);
            setTenders([]);
        } finally {
            setLoading(false);
        }
    }, [firmaFilter]);

    useEffect(() => { fetchPublicTenders(); }, [fetchPublicTenders]);

    const filteredTenders = tenders
        .filter((tender) => {
            const statusMeta = getTenderStatusMeta(tender);
            const normalizedQuery = searchTerm.trim().toLocaleLowerCase('tr-TR');
            const matchesQuery = !normalizedQuery || [
                tender.baslik,
                tender.aciklama,
                tender.kategori,
                tender.ihale_tipi,
                tender.firma_adi,
                tender.firma_konum,
                tender.referans_no
            ].some((value) => (value || '').toLocaleLowerCase('tr-TR').includes(normalizedQuery));

            const matchesStatus = statusFilter === 'all' || statusMeta.key === statusFilter;
            return matchesQuery && matchesStatus;
        })
        .sort((firstTender, secondTender) => {
            if (sortBy === 'newest') {
                return (secondTender.yayin_tarihi || '').localeCompare(firstTender.yayin_tarihi || '');
            }

            if (sortBy === 'title') {
                return (firstTender.baslik || '').localeCompare(secondTender.baslik || '', 'tr');
            }

            return (firstTender.son_basvuru_tarihi || '').localeCompare(secondTender.son_basvuru_tarihi || '');
        });

    const liveCount = tenders.filter((tender) => getTenderStatusMeta(tender).key === 'canli').length;
    const upcomingCount = tenders.filter((tender) => getTenderStatusMeta(tender).key === 'yaklasan').length;
    const closedCount = tenders.filter((tender) => getTenderStatusMeta(tender).key === 'kapali').length;

    // Enes Doğanay | 7 Nisan 2026: Görünüm değiştirme ve localStorage'a kaydetme
    const toggleViewMode = () => {
        const next = viewMode === 'grid' ? 'list' : 'grid';
        setViewMode(next);
        try { localStorage.setItem('tedport_ihale_view', next); } catch {}
    };

    // Enes Doğanay | 10 Nisan 2026: Teklif Ver popup açma — ihale gereksinimlerinden kalem tablosu oluştur
    const openTeklifPopup = (tender) => {
        const gereksinimler = Array.isArray(tender.gereksinimler) ? tender.gereksinimler : [];
        const kalemler = gereksinimler.map(g => ({
            gereksinim_id: g.id,
            madde: g.madde,
            birim_fiyat: '',
            miktar: '1',
            aciklama: '',
        }));
        setTeklifForm({
            kalemler,
            genel_toplam: '',
            para_birimi: 'TRY',
            kdv_dahil: tender.kdv_durumu === 'dahil',
            teslim_suresi_gun: '',
            teslim_aciklamasi: '',
            not: '',
        });
        setTeklifDosya(null);
        setTeklifError('');
        setTeklifTender(tender);
    };

    // Enes Doğanay | 10 Nisan 2026: Teklif kalem değeri güncelleme
    const updateKalem = (idx, field, value) => {
        setTeklifForm(prev => {
            const kalemler = [...prev.kalemler];
            kalemler[idx] = { ...kalemler[idx], [field]: value };
            return { ...prev, kalemler };
        });
    };

    // Enes Doğanay | 10 Nisan 2026: Kalem toplamı hesapla
    const getKalemToplam = (kalem) => {
        const birim = parseFloat(kalem.birim_fiyat) || 0;
        const miktar = parseFloat(kalem.miktar) || 0;
        return birim * miktar;
    };

    // Enes Doğanay | 10 Nisan 2026: Genel toplam hesapla (kalem varsa kalemlerden, yoksa genel_toplam'dan)
    const getTeklifGenelToplam = () => {
        if (teklifForm.kalemler.length > 0) {
            return teklifForm.kalemler.reduce((sum, k) => sum + getKalemToplam(k), 0);
        }
        return parseFloat(teklifForm.genel_toplam) || 0;
    };

    // Enes Doğanay | 10 Nisan 2026: Para birimi formatla
    const formatCurrency = (amount, currency) => {
        const symbols = { TRY: '₺', USD: '$', EUR: '€', GBP: '£' };
        return `${symbols[currency] || currency} ${amount.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    // Enes Doğanay | 10 Nisan 2026: Teklif gönder / taslak kaydet
    const handleTeklifSubmit = async (isDraft = false) => {
        setTeklifSaving(true);
        setTeklifError('');
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user) {
                setTeklifError('Teklif vermek için giriş yapmanız gerekiyor.');
                setTeklifSaving(false);
                return;
            }

            // Validasyon
            if (!isDraft) {
                if (teklifForm.kalemler.length > 0) {
                    const emptyKalem = teklifForm.kalemler.find(k => !k.birim_fiyat || parseFloat(k.birim_fiyat) <= 0);
                    if (emptyKalem) { setTeklifError('Tüm kalemlerin birim fiyatı girilmelidir.'); setTeklifSaving(false); return; }
                } else {
                    if (!teklifForm.genel_toplam || parseFloat(teklifForm.genel_toplam) <= 0) { setTeklifError('Teklif tutarı girilmelidir.'); setTeklifSaving(false); return; }
                }
                if (!teklifForm.teslim_suresi_gun) { setTeklifError('Tahmini teslim süresini belirtin.'); setTeklifSaving(false); return; }
            }

            // Dosya yükleme (varsa)
            let dosyaUrl = null;
            let dosyaAdi = null;
            if (teklifDosya) {
                const ext = teklifDosya.name.split('.').pop();
                const path = `${session.user.id}/${Date.now()}.${ext}`;
                const { error: uploadErr } = await supabase.storage.from('teklif-ekleri').upload(path, teklifDosya);
                if (uploadErr) { setTeklifError('Dosya yüklenemedi: ' + uploadErr.message); setTeklifSaving(false); return; }
                const { data: urlData } = supabase.storage.from('teklif-ekleri').getPublicUrl(path);
                dosyaUrl = urlData?.publicUrl || path;
                dosyaAdi = teklifDosya.name;
            }

            // DB'ye kaydet
            const toplam = getTeklifGenelToplam();
            const userName = [userProfile?.first_name, userProfile?.last_name].filter(Boolean).join(' ') || session.user.email;

            const { error: insertErr } = await supabase.from('ihale_teklifleri').insert({
                ihale_id: teklifTender.id,
                firma_id: teklifTender.firma_id,
                user_id: session.user.id,
                gonderen_firma_id: authManagedCompanyId || null,
                gonderen_firma_adi: managedCompanyName || null,
                gonderen_ad_soyad: userName,
                gonderen_email: session.user.email,
                kalemler: teklifForm.kalemler.length > 0 ? teklifForm.kalemler : null,
                toplam_tutar: toplam,
                para_birimi: teklifForm.para_birimi,
                kdv_dahil: teklifForm.kdv_dahil,
                teslim_suresi_gun: parseInt(teklifForm.teslim_suresi_gun, 10) || null,
                teslim_aciklamasi: teklifForm.teslim_aciklamasi || null,
                not_field: teklifForm.not || null,
                ek_dosya_url: dosyaUrl,
                ek_dosya_adi: dosyaAdi,
                durum: isDraft ? 'taslak' : 'gonderildi',
            });
            if (insertErr) throw insertErr;

            setTeklifTender(null);
        } catch (err) {
            setTeklifError(err.message || 'Teklif gönderilemedi.');
        } finally {
            setTeklifSaving(false);
        }
    };

    return (
        <div className="tenders-page">
            <SharedHeader />

            <main className="tenders-page-main">

                {/* ── Enes Doğanay | 6 Nisan 2026: Kurumsal kullanıcıya özel ihale yönetim paneli ── */}
                {managedFirmaId && (
                    <section className="my-tenders-panel">
                        <div className="my-tenders-panel__head">
                            <div>
                                {/* Enes Doğanay | 10 Nisan 2026: "Benim" kaldırıldı */}
                                <h2><span className="material-symbols-outlined">gavel</span> İhalelerim</h2>
                                <p>Firmanız adına yayınladığınız ihaleleri buradan yönetin.</p>
                            </div>
                            <button type="button" className="my-tenders-add-btn" onClick={openCreate}>
                                <span className="material-symbols-outlined">add_circle</span>
                                Yeni İhale Oluştur
                            </button>
                        </div>

                        {myTendersLoading ? (
                            <p className="my-tenders-loading">Yükleniyor…</p>
                        ) : myTenders.length === 0 ? (
                            <div className="my-tenders-empty">
                                <span className="material-symbols-outlined">inbox</span>
                                <p>Henüz ihale oluşturmadınız.</p>
                            </div>
                        ) : (
                            <div className="my-tenders-list">
                                {myTenders.map(t => {
                                    const sm = getTenderStatusMeta(t);
                                    return (
                                        <div key={t.id} className="my-tender-row">
                                            <div className="my-tender-row__info">
                                                <span className={`tender-card-status tender-card-status-${sm.className}`}>{sm.label}</span>
                                                <strong>{t.baslik}</strong>
                                                {t.son_basvuru_tarihi && <span className="my-tender-row__date">Son: {formatTenderDate(t.son_basvuru_tarihi)}</span>}
                                            </div>
                                            <div className="my-tender-row__actions">
                                                <button type="button" className="my-tender-btn my-tender-btn--clone" onClick={() => handleClone(t)} title="İhaleyi Tekrarla">
                                                    <span className="material-symbols-outlined">content_copy</span>
                                                </button>
                                                <button type="button" className="my-tender-btn my-tender-btn--edit" onClick={() => openEdit(t)}>
                                                    <span className="material-symbols-outlined">edit</span>
                                                </button>
                                                {deleteConfirmId === t.id ? (
                                                    <>
                                                        <button type="button" className="my-tender-btn my-tender-btn--confirm" onClick={() => handleDelete(t.id)}>Evet, Sil</button>
                                                        <button type="button" className="my-tender-btn my-tender-btn--cancel" onClick={() => setDeleteConfirmId(null)}>İptal</button>
                                                    </>
                                                ) : (
                                                    <button type="button" className="my-tender-btn my-tender-btn--delete" onClick={() => setDeleteConfirmId(t.id)}>
                                                        <span className="material-symbols-outlined">delete</span>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </section>
                )}

                {/* ── Enes Doğanay | 10 Nisan 2026: Stepper modal — 4 adımlı ihale oluşturma sihirbazı ── */}
                {showModal && (
                    <div className="ihale-modal-overlay">
                        <div className="ihale-modal ihale-modal--stepper">
                            {/* Üst: Başlık + Kapat */}
                            <div className="ihale-modal__head">
                                <h3>{editingTender ? 'İhaleyi Düzenle' : 'Yeni İhale Oluştur'}</h3>
                                <button type="button" className="ihale-modal__close" onClick={() => setShowModal(false)}>
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>

                            {/* Enes Doğanay | 10 Nisan 2026: Segment tabanlı stepper — adımlar arası ayrı çizgi */}
                            <div className="ihale-stepper-bar">
                                {STEPPER_LABELS.map((s, i) => (
                                    <React.Fragment key={s.key}>
                                        <button
                                            type="button"
                                            className={`ihale-stepper-item ${i === stepperStep ? 'ihale-stepper-item--active' : ''} ${i < stepperStep ? 'ihale-stepper-item--done' : ''}`}
                                            onClick={() => i <= stepperStep && setStepperStep(i)}
                                        >
                                            <span className="ihale-stepper-num">
                                                {i < stepperStep
                                                    ? <span className="material-symbols-outlined">check</span>
                                                    : <span className="material-symbols-outlined">{s.icon}</span>
                                                }
                                            </span>
                                            <span className="ihale-stepper-label">{s.label}</span>
                                        </button>
                                        {i < STEPPER_LABELS.length - 1 && (
                                            <div className={`ihale-stepper-track ${i < stepperStep ? 'ihale-stepper-track--done' : ''} ${i === stepperStep ? 'ihale-stepper-track--active' : ''}`} />
                                        )}
                                    </React.Fragment>
                                ))}
                            </div>

                            <form className="ihale-modal__form" onSubmit={e => e.preventDefault()}>

                                {/* ═══════ ADIM 1: TEMEL BİLGİLER ═══════ */}
                                {stepperStep === 0 && (
                                    <div className="ihale-step-content">
                                        <label className="ihale-field">
                                            <span>Başlık *</span>
                                            <input type="text" value={form.baslik} onChange={e => setForm(p => ({ ...p, baslik: e.target.value }))} placeholder="Örn. 500 adet laptop alımı" />
                                        </label>

                                        <label className="ihale-field ihale-field--full">
                                            <span>Açıklama</span>
                                            <textarea rows={4} value={form.aciklama} onChange={e => setForm(p => ({ ...p, aciklama: e.target.value }))} placeholder="İhale kapsamı, genel bilgiler, teknik gereksinimler…" />
                                        </label>

                                        <div className="ihale-modal__grid">
                                            <div className="ihale-field">
                                                <span>Teslim Yeri İl *</span>
                                                <CitySelect value={form.teslim_il} onChange={val => setForm(p => ({ ...p, teslim_il: val, teslim_ilce: '' }))} />
                                            </div>
                                            {/* Enes Doğanay | 10 Nisan 2026: İlçe de CitySelect ile aranabilir dropdown */}
                                            <div className="ihale-field">
                                                <span>Teslim Yeri İlçe *</span>
                                                <CitySelect
                                                    value={form.teslim_ilce}
                                                    onChange={val => setForm(p => ({ ...p, teslim_ilce: val }))}
                                                    options={TURKEY_DISTRICTS[form.teslim_il] || []}
                                                    placeholder="İlçe seçiniz"
                                                    icon="map"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* ═══════ ADIM 2: İHALE DETAYLARI ═══════ */}
                                {stepperStep === 1 && (
                                    <div className="ihale-step-content">
                                        <div className="ihale-modal__grid">
                                            <label className="ihale-field">
                                                <span>İhale Tipi *</span>
                                                <select value={form.ihale_tipi} onChange={e => {
                                                    const val = e.target.value;
                                                    if (val === 'Davetli İhale' && !isVerifiedUser) return;
                                                    {/* Enes Doğanay | 10 Nisan 2026: Açık İhaleye dönünce davetli firma verisini temizle */}
                                                    setForm(p => ({
                                                        ...p,
                                                        ihale_tipi: val,
                                                        ...(val !== 'Davetli İhale' ? { davetli_firmalar: [] } : {}),
                                                    }));
                                                }}>
                                                    <option value="Açık İhale">Açık İhale</option>
                                                    <option value="Davetli İhale" disabled={!isVerifiedUser}>
                                                        Davetli İhale {!isVerifiedUser ? '(Onaylı hesap gerekli)' : ''}
                                                    </option>
                                                </select>
                                            </label>

                                            <label className="ihale-field">
                                                <span>KDV Durumu</span>
                                                <select value={form.kdv_durumu} onChange={e => setForm(p => ({ ...p, kdv_durumu: e.target.value }))}>
                                                    <option value="haric">KDV Hariç</option>
                                                    <option value="dahil">KDV Dahil</option>
                                                </select>
                                            </label>

                                            <label className="ihale-field">
                                                <span>İhale Açılış Tarihi *</span>
                                                <input type="date" value={form.yayin_tarihi} onChange={e => setForm(p => ({ ...p, yayin_tarihi: e.target.value }))} />
                                            </label>

                                            <label className="ihale-field">
                                                <span>İhale Kapanış Tarihi *</span>
                                                <input type="date" value={form.son_basvuru_tarihi} onChange={e => setForm(p => ({ ...p, son_basvuru_tarihi: e.target.value }))} />
                                            </label>

                                            <label className="ihale-field">
                                                <span>Talep Edilen Teslim Süresi *</span>
                                                <input type="text" value={form.teslim_suresi} onChange={e => setForm(p => ({ ...p, teslim_suresi: e.target.value }))} placeholder="Örn. 30 iş günü" />
                                            </label>

                                            <label className="ihale-field">
                                                <span>Referans No</span>
                                                <input type="text" value={form.referans_no} readOnly className="ihale-field--readonly" tabIndex={-1} />
                                            </label>
                                        </div>

                                        {/* Kapanış tarihi sticky uyarı */}
                                        {form.son_basvuru_tarihi && (
                                            <div className="ihale-deadline-sticky">
                                                <span className="material-symbols-outlined">timer</span>
                                                <span>İhale Kapanış: <strong>{new Date(form.son_basvuru_tarihi).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</strong></span>
                                            </div>
                                        )}

                                        {/* Davet Edilecek E-postalar */}
                                        <div className="ihale-section">
                                            <span className="ihale-section__title">
                                                <span className="material-symbols-outlined">mail</span>
                                                Davet Edilecek E-postalar
                                            </span>
                                            <p className="ihale-section__desc">İhale yayınlandığında bu adreslere bildirim gönderilecek.</p>
                                            <div className="ihale-email-input-row">
                                                <input
                                                    type="email"
                                                    placeholder="ornek@firma.com"
                                                    value={emailInput}
                                                    onChange={e => setEmailInput(e.target.value)}
                                                    onKeyDown={handleEmailKeyDown}
                                                />
                                                <button type="button" className="ihale-email-add-btn" onClick={addEmail}>
                                                    <span className="material-symbols-outlined">add</span>
                                                </button>
                                            </div>
                                            {form.davet_emailleri.length > 0 && (
                                                <div className="ihale-email-tags">
                                                    {form.davet_emailleri.map(email => (
                                                        <div key={email} className="ihale-email-tag">
                                                            <span>{email}</span>
                                                            <button type="button" onClick={() => removeEmail(email)}>
                                                                <span className="material-symbols-outlined">close</span>
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Davetli İhale: Firma Arama */}
                                        {form.ihale_tipi === 'Davetli İhale' && (
                                            <div className="ihale-section">
                                                <span className="ihale-section__title">
                                                    <span className="material-symbols-outlined">group_add</span>
                                                    Davet Edilecek Firmalar
                                                </span>
                                                <div className="ihale-firma-search">
                                                    <input
                                                        type="text"
                                                        placeholder="Firma adı ile arayın…"
                                                        value={firmaSearchTerm}
                                                        onChange={e => handleFirmaSearch(e.target.value)}
                                                    />
                                                    {firmaSearching && <span className="ihale-firma-search__spinner">Aranıyor…</span>}
                                                    {firmaSearchResults.length > 0 && (
                                                        <div className="ihale-firma-search__results" ref={firmaResultsRef}>
                                                            {firmaSearchResults.map(f => {
                                                                const alreadyAdded = form.davetli_firmalar.some(df => df.firma_id === f.firmaID);
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
                                                                            <button type="button" disabled={alreadyAdded} className="ihale-firma-add-btn" onClick={() => addDavetliFirma(f)}>
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
                                                {form.davetli_firmalar.length > 0 && (
                                                    <div className="ihale-firma-tags">
                                                        {form.davetli_firmalar.map(f => (
                                                            <div key={f.firma_id} className="ihale-firma-tag">
                                                                <span className="material-symbols-outlined">business</span>
                                                                <span>{f.firma_adi}</span>
                                                                <button type="button" onClick={() => removeDavetliFirma(f.firma_id)}>
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
                                {stepperStep === 2 && (
                                    <div className="ihale-step-content">
                                        {/* İhale Gereksinimleri */}
                                        <div className="ihale-section ihale-section--no-border">
                                            <span className="ihale-section__title">
                                                <span className="material-symbols-outlined">checklist</span>
                                                İhale Gereksinimleri *
                                            </span>
                                            <p className="ihale-section__desc">Kalem kalem gereksinimlerinizi ekleyin.</p>
                                            <div className="ihale-req-input-row">
                                                <input
                                                    type="text"
                                                    placeholder="Gereksinim maddesi *"
                                                    value={yeniGereksinimMadde}
                                                    onChange={e => setYeniGereksinimMadde(e.target.value)}
                                                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addGereksinim(); } }}
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="Açıklama (opsiyonel)"
                                                    value={yeniGereksinimAciklama}
                                                    onChange={e => setYeniGereksinimAciklama(e.target.value)}
                                                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addGereksinim(); } }}
                                                />
                                                <button type="button" className="ihale-req-add-btn" onClick={addGereksinim} disabled={!yeniGereksinimMadde.trim()}>
                                                    <span className="material-symbols-outlined">add</span>
                                                </button>
                                            </div>
                                            {form.gereksinimler.length > 0 && (
                                                <div className="ihale-req-table">
                                                    <div className="ihale-req-table__header">
                                                        <span>#</span>
                                                        <span>Madde</span>
                                                        <span>Açıklama</span>
                                                        <span></span>
                                                    </div>
                                                    {form.gereksinimler.map((g, i) => (
                                                        <div key={g.id} className="ihale-req-table__row">
                                                            <span className="ihale-req-table__num">{i + 1}</span>
                                                            <span className="ihale-req-table__madde">{g.madde}</span>
                                                            <span className="ihale-req-table__aciklama">{g.aciklama || '—'}</span>
                                                            <button type="button" className="ihale-req-table__remove" onClick={() => removeGereksinim(g.id)}>
                                                                <span className="material-symbols-outlined">close</span>
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Ek Dokümanlar */}
                                        <div className="ihale-section">
                                            <span className="ihale-section__title">
                                                <span className="material-symbols-outlined">attach_file</span>
                                                Ek Dokümanlar
                                            </span>
                                            <p className="ihale-section__desc">Teknik şartname, çizim veya diğer dokümanları ekleyin. (Maks. 10 MB / dosya)</p>
                                            <div className="ihale-file-upload">
                                                <button type="button" className="ihale-file-btn" onClick={() => fileInputRef.current?.click()}>
                                                    <span className="material-symbols-outlined">upload_file</span>
                                                    Dosya Seç
                                                </button>
                                                <input
                                                    ref={fileInputRef}
                                                    type="file"
                                                    multiple
                                                    accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.zip,.dwg"
                                                    style={{ display: 'none' }}
                                                    onChange={handleFileAdd}
                                                />
                                            </div>
                                            {form.ek_dosyalar.length > 0 && (
                                                <div className="ihale-file-list">
                                                    {form.ek_dosyalar.map((f, i) => (
                                                        <div key={i} className="ihale-file-item">
                                                            <span className="material-symbols-outlined">description</span>
                                                            <span className="ihale-file-name">{f.name}</span>
                                                            <span className="ihale-file-size">{(f.size / 1024).toFixed(0)} KB</span>
                                                            <button type="button" onClick={() => removeFile(i)}>
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
                                {stepperStep === 3 && (
                                    <div className="ihale-step-content ihale-preview">
                                        <div className="ihale-preview__card">
                                            <div className="ihale-preview__header">
                                                <h4>{form.baslik || 'Başlık belirtilmedi'}</h4>
                                                <span className={`tender-card-status tender-card-status-canli`}>{form.ihale_tipi}</span>
                                            </div>

                                            {form.aciklama && <p className="ihale-preview__desc">{form.aciklama}</p>}

                                            <div className="ihale-preview__grid">
                                                <div className="ihale-preview__item">
                                                    <span className="material-symbols-outlined">event</span>
                                                    <div>
                                                        <strong>İhale Açılış</strong>
                                                        <span>{form.yayin_tarihi ? new Date(form.yayin_tarihi).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}</span>
                                                    </div>
                                                </div>
                                                <div className="ihale-preview__item">
                                                    <span className="material-symbols-outlined">hourglass_bottom</span>
                                                    <div>
                                                        <strong>İhale Kapanış</strong>
                                                        <span>{form.son_basvuru_tarihi ? new Date(form.son_basvuru_tarihi).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}</span>
                                                    </div>
                                                </div>
                                                <div className="ihale-preview__item">
                                                    <span className="material-symbols-outlined">local_shipping</span>
                                                    <div>
                                                        <strong>Teslim Süresi</strong>
                                                        <span>{form.teslim_suresi || '—'}</span>
                                                    </div>
                                                </div>
                                                <div className="ihale-preview__item">
                                                    <span className="material-symbols-outlined">receipt_long</span>
                                                    <div>
                                                        <strong>KDV</strong>
                                                        <span>{form.kdv_durumu === 'dahil' ? 'KDV Dahil' : 'KDV Hariç'}</span>
                                                    </div>
                                                </div>
                                                <div className="ihale-preview__item">
                                                    <span className="material-symbols-outlined">location_on</span>
                                                    <div>
                                                        <strong>Teslim Yeri</strong>
                                                        <span>{[form.teslim_il, form.teslim_ilce].filter(Boolean).join(' / ') || '—'}</span>
                                                    </div>
                                                </div>
                                                <div className="ihale-preview__item">
                                                    <span className="material-symbols-outlined">badge</span>
                                                    <div>
                                                        <strong>Referans</strong>
                                                        <span>{form.referans_no || '—'}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {form.gereksinimler.length > 0 && (
                                                <div className="ihale-preview__section">
                                                    <strong><span className="material-symbols-outlined">checklist</span> Gereksinimler ({form.gereksinimler.length})</strong>
                                                    <ul>
                                                        {form.gereksinimler.map((g, i) => (
                                                            <li key={g.id}><span>{i + 1}.</span> {g.madde}{g.aciklama ? ` — ${g.aciklama}` : ''}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            {form.davet_emailleri.length > 0 && (
                                                <div className="ihale-preview__section">
                                                    <strong><span className="material-symbols-outlined">mail</span> Davet E-postaları ({form.davet_emailleri.length})</strong>
                                                    <div className="ihale-preview__tags">{form.davet_emailleri.map(e => <span key={e}>{e}</span>)}</div>
                                                </div>
                                            )}

                                            {form.davetli_firmalar.length > 0 && (
                                                <div className="ihale-preview__section">
                                                    <strong><span className="material-symbols-outlined">business</span> Davetli Firmalar ({form.davetli_firmalar.length})</strong>
                                                    <div className="ihale-preview__tags">{form.davetli_firmalar.map(f => <span key={f.firma_id}>{f.firma_adi}</span>)}</div>
                                                </div>
                                            )}

                                            {form.ek_dosyalar.length > 0 && (
                                                <div className="ihale-preview__section">
                                                    <strong><span className="material-symbols-outlined">attach_file</span> Ek Dokümanlar ({form.ek_dosyalar.length})</strong>
                                                    <div className="ihale-preview__tags">{form.ek_dosyalar.map((f, i) => <span key={i}>{f.name}</span>)}</div>
                                                </div>
                                            )}
                                        </div>

                                        {formError && <p className="ihale-form-error">{formError}</p>}

                                        {/* Yayınla / Taslak Kaydet / İptal */}
                                        <div className="ihale-modal__footer ihale-modal__footer--preview">
                                            <button type="button" className="ihale-btn-cancel" onClick={() => setShowModal(false)}>İptal</button>
                                            <button type="button" className="ihale-btn-draft" disabled={formSaving} onClick={() => handleFormSubmit(null, 'draft')}>
                                                <span className="material-symbols-outlined">save</span>
                                                {formSaving ? 'Kaydediliyor…' : 'Taslak Kaydet'}
                                            </button>
                                            <button type="button" className="ihale-btn-save" disabled={formSaving} onClick={() => handleFormSubmit(null, null)}>
                                                {formSaving ? 'Kaydediliyor…' : (editingTender ? 'Güncelle' : 'İhaleyi Yayınla')}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Stepper navigasyon — Adım 4 (Önizleme) hariç */}
                                {stepperStep < 3 && (
                                    <div className="ihale-stepper-nav">
                                        {stepperStep > 0 && (
                                            <button type="button" className="ihale-stepper-back" onClick={() => setStepperStep(s => s - 1)}>
                                                <span className="material-symbols-outlined">arrow_back</span>
                                                Geri
                                            </button>
                                        )}
                                        <div className="ihale-stepper-nav__spacer" />
                                        {formError && <p className="ihale-form-error ihale-form-error--inline">{formError}</p>}
                                        <button
                                            type="button"
                                            className="ihale-stepper-next"
                                            onClick={() => {
                                                /* Enes Doğanay | 10 Nisan 2026: Adım bazlı custom doğrulama */
                                                if (stepperStep === 0) {
                                                    if (!form.baslik.trim()) { setFormError('İhale başlığı zorunludur.'); return; }
                                                    if (!form.teslim_il) { setFormError('Teslim yeri il seçimi zorunludur.'); return; }
                                                    if (!form.teslim_ilce) { setFormError('Teslim yeri ilçe seçimi zorunludur.'); return; }
                                                }
                                                if (stepperStep === 1) {
                                                    if (!form.yayin_tarihi) { setFormError('İhale açılış tarihi zorunludur.'); return; }
                                                    if (!form.son_basvuru_tarihi) { setFormError('İhale kapanış tarihi zorunludur.'); return; }
                                                    if (!form.teslim_suresi.trim()) { setFormError('Talep edilen teslim süresi zorunludur.'); return; }
                                                }
                                                if (stepperStep === 2) {
                                                    if (form.gereksinimler.length === 0) { setFormError('En az bir ihale gereksinimi eklemelisiniz.'); return; }
                                                }
                                                setFormError('');
                                                setStepperStep(s => s + 1);
                                            }}
                                        >
                                            {stepperStep === 2 ? 'Önizlemeye Geç' : 'Devam Et'}
                                            <span className="material-symbols-outlined">arrow_forward</span>
                                        </button>
                                    </div>
                                )}
                            </form>
                        </div>
                    </div>
                )}

                {/* Enes Doğanay | 11 Nisan 2026: Kompakt hero – tek satır başlık + inline stat rozetleri */}
                <section className="tenders-hero-compact">
                    <div className="tenders-hero-compact__left">
                        <h1>{selectedFirmaName ? `${selectedFirmaName} İhaleleri` : 'İhaleler'}</h1>
                        <p>
                            {selectedFirmaName
                                ? 'Bu firmaya ait aktif, yaklaşan ve kapanmış ihaleleri takip edin.'
                                : 'Canlı satın alma fırsatlarını, yaklaşan talepleri ve kapanmış ihaleleri inceleyin.'}
                        </p>
                    </div>
                    <div className="tenders-hero-compact__stats">
                        <div className="tenders-mini-stat tenders-mini-stat--live">
                            <span className="material-symbols-outlined">bolt</span>
                            <strong>{liveCount}</strong>
                            <span>Canlı</span>
                        </div>
                        <div className="tenders-mini-stat tenders-mini-stat--upcoming">
                            <span className="material-symbols-outlined">schedule</span>
                            <strong>{upcomingCount}</strong>
                            <span>Yaklaşan</span>
                        </div>
                        <div className="tenders-mini-stat tenders-mini-stat--closed">
                            <span className="material-symbols-outlined">check_circle</span>
                            <strong>{closedCount}</strong>
                            <span>Kapanmış</span>
                        </div>
                    </div>
                </section>

                {/* Enes Doğanay | 11 Nisan 2026: Yeniden tasarlanan toolbar */}
                <section className="tenders-toolbar">
                    <div className="tenders-search-box">
                        <span className="material-symbols-outlined">search</span>
                        <input
                            type="text"
                            placeholder="İhale, firma veya referans ara…"
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                        />
                        {searchTerm && (
                            <button type="button" className="tenders-search-clear" onClick={() => setSearchTerm('')}>
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        )}
                        <button
                            type="button"
                            className="tenders-view-toggle"
                            onClick={toggleViewMode}
                            title={viewMode === 'grid' ? 'Liste görünümüne geç' : 'Kart görünümüne geç'}
                        >
                            <span className="material-symbols-outlined">{viewMode === 'grid' ? 'view_list' : 'grid_view'}</span>
                        </button>
                    </div>

                    <div className="tenders-filter-pills">
                        {[
                            { key: 'all', label: 'Tümü', icon: 'apps' },
                            { key: 'canli', label: 'Canlı', icon: 'bolt' },
                            { key: 'yaklasan', label: 'Yaklaşan', icon: 'schedule' },
                            { key: 'kapali', label: 'Kapalı', icon: 'lock' }
                        ].map((filterOption) => (
                            <button
                                key={filterOption.key}
                                type="button"
                                className={`tenders-filter-pill ${statusFilter === filterOption.key ? 'active' : ''}`}
                                onClick={() => setStatusFilter(filterOption.key)}
                            >
                                <span className="material-symbols-outlined">{filterOption.icon}</span>
                                {filterOption.label}
                            </button>
                        ))}
                    </div>

                    <div className="tenders-sort-box">
                        <span className="material-symbols-outlined">swap_vert</span>
                        <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
                            <option value="deadline">Son Başvuru Tarihi</option>
                            <option value="newest">Yeni Yayınlanan</option>
                            <option value="title">Başlığa Göre</option>
                        </select>
                    </div>
                </section>

                {tableMissing ? (
                    <section className="tenders-empty-state">
                        <span className="material-symbols-outlined">database</span>
                        <h2>İhale tablosu henüz kurulmadı</h2>
                        <p>Supabase üzerinde <code>database/tenders.sql</code> dosyasını çalıştırdıktan sonra ihale kayıtları burada listelenecek.</p>
                    </section>
                ) : loading ? (
                    <section className="tenders-grid">
                        {[1, 2, 3, 4, 5, 6].map((item) => (
                            <article key={item} className="tender-card tender-card-skeleton" />
                        ))}
                    </section>
                ) : filteredTenders.length === 0 ? (
                    <section className="tenders-empty-state">
                        <span className="material-symbols-outlined">search_off</span>
                        <h2>Eşleşen ihale bulunamadı</h2>
                        <p>Arama ifadenizi veya filtreleri değiştirerek farklı ihaleleri görüntüleyebilirsiniz.</p>
                    </section>
                ) : (
                    <>
                        {(searchTerm.trim().length >= 2 || statusFilter !== 'all') && (
                            <p className="tenders-result-count">
                                <span>{filteredTenders.length}</span> ihale listeleniyor
                            </p>
                        )}

                        {viewMode === 'list' ? (
                            /* Enes Doğanay | 10 Nisan 2026: Güncellenen liste görünümü — detay + ihaleye katıl */
                            <section className="tenders-list-view">
                                <div className="tenders-list-header">
                                    <span className="tenders-list-col tenders-list-col--firma">Firma</span>
                                    <span className="tenders-list-col tenders-list-col--baslik">Başlık</span>
                                    <span className="tenders-list-col tenders-list-col--konum">Teslim Yeri</span>
                                    <span className="tenders-list-col tenders-list-col--tarih">Açılış</span>
                                    <span className="tenders-list-col tenders-list-col--tarih">Kapanış</span>
                                    <span className="tenders-list-col tenders-list-col--durum">Durum</span>
                                    <span className="tenders-list-col tenders-list-col--actions">İşlem</span>
                                </div>
                                {filteredTenders.map((tender) => {
                                    const statusMeta = getTenderStatusMeta(tender);
                                    return (
                                        <div key={tender.id} className="tenders-list-row" onClick={() => setDetailTender(tender)}>
                                            <span className="tenders-list-col tenders-list-col--firma" onClick={(e) => { e.stopPropagation(); navigate(`/firmadetay/${tender.firma_id}`); }}>{tender.firma_adi}</span>
                                            <span className="tenders-list-col tenders-list-col--baslik">{tender.baslik}</span>
                                            <span className="tenders-list-col tenders-list-col--konum">{[tender.teslim_il, tender.teslim_ilce].filter(Boolean).join(' / ') || '—'}</span>
                                            <span className="tenders-list-col tenders-list-col--tarih">{formatTenderDate(tender.yayin_tarihi)}</span>
                                            <span className="tenders-list-col tenders-list-col--tarih">{formatTenderDate(tender.son_basvuru_tarihi)}</span>
                                            <span className={`tenders-list-col tenders-list-col--durum tender-card-status tender-card-status-${statusMeta.className}`}>{statusMeta.label}</span>
                                            <span className="tenders-list-col tenders-list-col--actions" onClick={(e) => e.stopPropagation()}>
                                                <button type="button" className="tenders-list-action-btn tenders-list-action-btn--join" title="Teklif Ver" onClick={() => openTeklifPopup(tender)}>
                                                    <span className="material-symbols-outlined">handshake</span>
                                                </button>
                                                <button type="button" className="tenders-list-action-btn tenders-list-action-btn--detail" title="Detay" onClick={() => setDetailTender(tender)}>
                                                    <span className="material-symbols-outlined">visibility</span>
                                                </button>
                                            </span>
                                        </div>
                                    );
                                })}
                            </section>
                        ) : (
                            /* Enes Doğanay | 11 Nisan 2026: Modern card grid — yeni alanlar, countdown, Firmaya Git + İhaleye Katıl */
                            <section className="tenders-grid">
                                {filteredTenders.map((tender) => {
                                    const statusMeta = getTenderStatusMeta(tender);
                                    /* Geri sayım hesapla */
                                    const deadline = tender.son_basvuru_tarihi ? new Date(tender.son_basvuru_tarihi) : null;
                                    const now = new Date();
                                    let countdownText = '';
                                    if (deadline && statusMeta.key === 'canli') {
                                        const diffMs = deadline - now;
                                        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                                        const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                                        if (diffDays > 0) countdownText = `${diffDays} gün ${diffHours} saat kaldı`;
                                        else if (diffHours > 0) countdownText = `${diffHours} saat kaldı`;
                                        else if (diffMs > 0) countdownText = 'Son saatler!';
                                    }
                                    const gereksinimCount = Array.isArray(tender.gereksinimler) ? tender.gereksinimler.length : 0;
                                    const teslimYeri = [tender.teslim_il, tender.teslim_ilce].filter(Boolean).join(', ');

                                    return (
                                        <article key={tender.id} className={`tender-card tender-card--${statusMeta.className}`}>
                                            {/* Üst şerit: Firma + Durum */}
                                            <div className="tender-card__header">
                                                <button type="button" className="tender-card__company" onClick={() => navigate(`/firmadetay/${tender.firma_id}`)}>
                                                    <span className="material-symbols-outlined">apartment</span>
                                                    {tender.firma_adi}
                                                </button>
                                                <span className={`tender-card-status tender-card-status-${statusMeta.className}`}>{statusMeta.label}</span>
                                            </div>

                                            {/* Başlık + Açıklama */}
                                            <h2 className="tender-card__title">{tender.baslik}</h2>
                                            {tender.aciklama && <p className="tender-card__desc">{tender.aciklama.length > 120 ? tender.aciklama.slice(0, 120) + '…' : tender.aciklama}</p>}

                                            {/* Tag chips */}
                                            <div className="tender-card__chips">
                                                {tender.ihale_tipi && (
                                                    <span className="tender-chip tender-chip--type">
                                                        <span className="material-symbols-outlined">category</span>
                                                        {tender.ihale_tipi}
                                                    </span>
                                                )}
                                                {tender.kdv_durumu && (
                                                    <span className="tender-chip tender-chip--kdv">
                                                        <span className="material-symbols-outlined">receipt_long</span>
                                                        KDV {tender.kdv_durumu === 'dahil' ? 'Dahil' : 'Hariç'}
                                                    </span>
                                                )}
                                                {teslimYeri && (
                                                    <span className="tender-chip tender-chip--location">
                                                        <span className="material-symbols-outlined">location_on</span>
                                                        {teslimYeri}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Bilgi satırları */}
                                            <div className="tender-card__info">
                                                <div className="tender-card__info-row">
                                                    <span className="material-symbols-outlined">event</span>
                                                    <span className="tender-card__info-label">Açılış</span>
                                                    <span className="tender-card__info-value">{formatTenderDate(tender.yayin_tarihi)}</span>
                                                </div>
                                                <div className="tender-card__info-row">
                                                    <span className="material-symbols-outlined">event_busy</span>
                                                    <span className="tender-card__info-label">Kapanış</span>
                                                    <span className="tender-card__info-value">{formatTenderDate(tender.son_basvuru_tarihi)}</span>
                                                </div>
                                                {tender.teslim_suresi && (
                                                    <div className="tender-card__info-row">
                                                        <span className="material-symbols-outlined">local_shipping</span>
                                                        <span className="tender-card__info-label">Teslim</span>
                                                        <span className="tender-card__info-value">{tender.teslim_suresi}</span>
                                                    </div>
                                                )}
                                                {gereksinimCount > 0 && (
                                                    <div className="tender-card__info-row">
                                                        <span className="material-symbols-outlined">checklist</span>
                                                        <span className="tender-card__info-label">Gereksinimler</span>
                                                        <span className="tender-card__info-value">{gereksinimCount} madde</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Geri sayım bandı */}
                                            {countdownText && (
                                                <div className="tender-card__countdown">
                                                    <span className="material-symbols-outlined">timer</span>
                                                    {countdownText}
                                                </div>
                                            )}

                                            {/* Referans */}
                                            {tender.referans_no && (
                                                <div className="tender-card__ref">
                                                    <span className="material-symbols-outlined">tag</span>
                                                    {tender.referans_no}
                                                </div>
                                            )}

                                            {/* Aksiyon butonları */}
                                            <div className="tender-card__actions">
                                                <button type="button" className="tender-action tender-action--join" onClick={() => openTeklifPopup(tender)}>
                                                    <span className="material-symbols-outlined">handshake</span>
                                                    Teklif Ver
                                                </button>
                                                <button type="button" className="tender-action tender-action--detail" onClick={() => setDetailTender(tender)}>
                                                    <span className="material-symbols-outlined">open_in_full</span>
                                                    Detay
                                                </button>
                                            </div>
                                        </article>
                                    );
                                })}
                            </section>
                        )}
                    </>
                )}

                {/* Enes Doğanay | 11 Nisan 2026: İhale detay drawer — tam bilgi görüntüleme */}
                {detailTender && (() => {
                    const dt = detailTender;
                    const statusMeta = getTenderStatusMeta(dt);
                    const gereksinimler = Array.isArray(dt.gereksinimler) ? dt.gereksinimler : [];
                    const ekDosyalar = Array.isArray(dt.ek_dosyalar) ? dt.ek_dosyalar : [];
                    const teslimYeri = [dt.teslim_il, dt.teslim_ilce].filter(Boolean).join(' / ');
                    return (
                        <div className="tender-detail-overlay" onClick={() => setDetailTender(null)}>
                            <aside className="tender-detail-drawer" onClick={(e) => e.stopPropagation()}>
                                <div className="tender-detail__head">
                                    <div>
                                        <span className={`tender-card-status tender-card-status-${statusMeta.className}`}>{statusMeta.label}</span>
                                        <h2>{dt.baslik}</h2>
                                        <button type="button" className="tender-detail__company-link" onClick={() => { setDetailTender(null); navigate(`/firmadetay/${dt.firma_id}`); }}>
                                            <span className="material-symbols-outlined">apartment</span>
                                            {dt.firma_adi}
                                        </button>
                                    </div>
                                    <button type="button" className="tender-detail__close" onClick={() => setDetailTender(null)}>
                                        <span className="material-symbols-outlined">close</span>
                                    </button>
                                </div>

                                <div className="tender-detail__body">
                                    {dt.aciklama && (
                                        <div className="tender-detail__section">
                                            <h3><span className="material-symbols-outlined">description</span> Açıklama</h3>
                                            <p>{dt.aciklama}</p>
                                        </div>
                                    )}

                                    <div className="tender-detail__grid">
                                        <div className="tender-detail__grid-item">
                                            <span className="material-symbols-outlined">category</span>
                                            <div><strong>İhale Tipi</strong><span>{dt.ihale_tipi || '—'}</span></div>
                                        </div>
                                        <div className="tender-detail__grid-item">
                                            <span className="material-symbols-outlined">receipt_long</span>
                                            <div><strong>KDV Durumu</strong><span>{dt.kdv_durumu === 'dahil' ? 'Dahil' : 'Hariç'}</span></div>
                                        </div>
                                        <div className="tender-detail__grid-item">
                                            <span className="material-symbols-outlined">event</span>
                                            <div><strong>Açılış Tarihi</strong><span>{formatTenderDate(dt.yayin_tarihi)}</span></div>
                                        </div>
                                        <div className="tender-detail__grid-item">
                                            <span className="material-symbols-outlined">event_busy</span>
                                            <div><strong>Kapanış Tarihi</strong><span>{formatTenderDate(dt.son_basvuru_tarihi)}</span></div>
                                        </div>
                                        {dt.teslim_suresi && (
                                            <div className="tender-detail__grid-item">
                                                <span className="material-symbols-outlined">local_shipping</span>
                                                <div><strong>Teslim Süresi</strong><span>{dt.teslim_suresi}</span></div>
                                            </div>
                                        )}
                                        {teslimYeri && (
                                            <div className="tender-detail__grid-item">
                                                <span className="material-symbols-outlined">location_on</span>
                                                <div><strong>Teslim Yeri</strong><span>{teslimYeri}</span></div>
                                            </div>
                                        )}
                                        {dt.referans_no && (
                                            <div className="tender-detail__grid-item">
                                                <span className="material-symbols-outlined">tag</span>
                                                <div><strong>Referans No</strong><span>{dt.referans_no}</span></div>
                                            </div>
                                        )}
                                    </div>

                                    {gereksinimler.length > 0 && (
                                        <div className="tender-detail__section">
                                            <h3><span className="material-symbols-outlined">checklist</span> Gereksinimler ({gereksinimler.length})</h3>
                                            <ul className="tender-detail__req-list">
                                                {gereksinimler.map((g) => (
                                                    <li key={g.id}>
                                                        <strong>{g.madde}</strong>
                                                        {g.aciklama && <span>{g.aciklama}</span>}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {ekDosyalar.length > 0 && (
                                        <div className="tender-detail__section">
                                            <h3><span className="material-symbols-outlined">attach_file</span> Ek Dokümanlar ({ekDosyalar.length})</h3>
                                            <div className="tender-detail__files">
                                                {ekDosyalar.map((f, i) => (
                                                    <a key={i} href={f.url} target="_blank" rel="noopener noreferrer" className="tender-detail__file-link">
                                                        <span className="material-symbols-outlined">download</span>
                                                        {f.name || `Dosya ${i + 1}`}
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="tender-detail__footer">
                                    <button type="button" className="tender-action tender-action--join tender-action--full" onClick={() => { setDetailTender(null); openTeklifPopup(dt); }}>
                                        <span className="material-symbols-outlined">handshake</span>
                                        Teklif Ver
                                    </button>
                                </div>
                            </aside>
                        </div>
                    );
                })()}

                {/* Enes Doğanay | 10 Nisan 2026: Teklif Ver popup — kalem kalem teklif tablosu */}
                {teklifTender && (() => {
                    const tt = teklifTender;
                    const gereksinimler = Array.isArray(tt.gereksinimler) ? tt.gereksinimler : [];
                    const hasKalemler = teklifForm.kalemler.length > 0;
                    const genelToplam = getTeklifGenelToplam();

                    return (
                        <div className="teklif-popup-overlay" onClick={() => !teklifSaving && setTeklifTender(null)}>
                            <div className="teklif-popup" onClick={(e) => e.stopPropagation()}>
                                {/* Başlık */}
                                <div className="teklif-popup__head">
                                    <div className="teklif-popup__head-left">
                                        <span className="material-symbols-outlined teklif-popup__head-icon">handshake</span>
                                        <div>
                                            <h2>Teklif Ver</h2>
                                            <p className="teklif-popup__tender-name">{tt.baslik}</p>
                                            <p className="teklif-popup__tender-firma">
                                                <span className="material-symbols-outlined">apartment</span>
                                                {tt.firma_adi}
                                                {tt.referans_no && <span className="teklif-popup__ref"> • {tt.referans_no}</span>}
                                            </p>
                                        </div>
                                    </div>
                                    <button type="button" className="teklif-popup__close" onClick={() => !teklifSaving && setTeklifTender(null)}>
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
                                        {hasKalemler && (
                                            <div className="teklif-popup__summary-item">
                                                <span className="material-symbols-outlined">checklist</span>
                                                <div><strong>Kalem Sayısı</strong><span>{gereksinimler.length}</span></div>
                                            </div>
                                        )}
                                    </div>

                                    {/* BÖLÜM: Teklif Detay */}
                                    <div className="teklif-popup__section">
                                        <h3><span className="material-symbols-outlined">payments</span> Teklif Detay</h3>

                                        {hasKalemler ? (
                                            /* Kalem kalem teklif tablosu */
                                            <div className="teklif-kalem-table">
                                                <div className="teklif-kalem-table__head">
                                                    <span className="teklif-kalem-col teklif-kalem-col--no">#</span>
                                                    <span className="teklif-kalem-col teklif-kalem-col--madde">Kalem</span>
                                                    <span className="teklif-kalem-col teklif-kalem-col--miktar">Miktar</span>
                                                    <span className="teklif-kalem-col teklif-kalem-col--fiyat">Birim Fiyat</span>
                                                    <span className="teklif-kalem-col teklif-kalem-col--toplam">Toplam</span>
                                                </div>
                                                {teklifForm.kalemler.map((kalem, idx) => {
                                                    const kalemTotal = getKalemToplam(kalem);
                                                    return (
                                                        <div key={kalem.gereksinim_id} className="teklif-kalem-table__row">
                                                            <span className="teklif-kalem-col teklif-kalem-col--no">{idx + 1}</span>
                                                            <div className="teklif-kalem-col teklif-kalem-col--madde">
                                                                <strong>{kalem.madde}</strong>
                                                                <input
                                                                    type="text"
                                                                    placeholder="Açıklama / not…"
                                                                    value={kalem.aciklama}
                                                                    onChange={(e) => updateKalem(idx, 'aciklama', e.target.value)}
                                                                    className="teklif-kalem-input teklif-kalem-input--note"
                                                                />
                                                            </div>
                                                            <div className="teklif-kalem-col teklif-kalem-col--miktar">
                                                                <input
                                                                    type="number"
                                                                    min="1"
                                                                    value={kalem.miktar}
                                                                    onChange={(e) => updateKalem(idx, 'miktar', e.target.value)}
                                                                    className="teklif-kalem-input"
                                                                />
                                                            </div>
                                                            <div className="teklif-kalem-col teklif-kalem-col--fiyat">
                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    step="0.01"
                                                                    placeholder="0.00"
                                                                    value={kalem.birim_fiyat}
                                                                    onChange={(e) => updateKalem(idx, 'birim_fiyat', e.target.value)}
                                                                    className="teklif-kalem-input"
                                                                />
                                                            </div>
                                                            <span className="teklif-kalem-col teklif-kalem-col--toplam teklif-kalem-col--amount">
                                                                {formatCurrency(kalemTotal, teklifForm.para_birimi)}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                                <div className="teklif-kalem-table__footer">
                                                    <span>Genel Toplam</span>
                                                    <strong>{formatCurrency(genelToplam, teklifForm.para_birimi)}</strong>
                                                </div>
                                            </div>
                                        ) : (
                                            /* Tek tutar girişi */
                                            <div className="teklif-popup__single-amount">
                                                <label>Teklif Tutarı</label>
                                                <div className="teklif-popup__amount-row">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        placeholder="0.00"
                                                        value={teklifForm.genel_toplam}
                                                        onChange={(e) => setTeklifForm(p => ({ ...p, genel_toplam: e.target.value }))}
                                                        className="teklif-popup__amount-input"
                                                    />
                                                    <select
                                                        value={teklifForm.para_birimi}
                                                        onChange={(e) => setTeklifForm(p => ({ ...p, para_birimi: e.target.value }))}
                                                        className="teklif-popup__currency-select"
                                                    >
                                                        <option value="TRY">₺ TRY</option>
                                                        <option value="USD">$ USD</option>
                                                        <option value="EUR">€ EUR</option>
                                                        <option value="GBP">£ GBP</option>
                                                    </select>
                                                </div>
                                            </div>
                                        )}

                                        {/* Para birimi + KDV (kalemli modda) */}
                                        {hasKalemler && (
                                            <div className="teklif-popup__inline-row">
                                                <div className="teklif-popup__inline-field">
                                                    <label>Para Birimi</label>
                                                    <select
                                                        value={teklifForm.para_birimi}
                                                        onChange={(e) => setTeklifForm(p => ({ ...p, para_birimi: e.target.value }))}
                                                        className="teklif-popup__currency-select"
                                                    >
                                                        <option value="TRY">₺ TRY</option>
                                                        <option value="USD">$ USD</option>
                                                        <option value="EUR">€ EUR</option>
                                                        <option value="GBP">£ GBP</option>
                                                    </select>
                                                </div>
                                                <label className="teklif-popup__toggle">
                                                    <input
                                                        type="checkbox"
                                                        checked={teklifForm.kdv_dahil}
                                                        onChange={(e) => setTeklifForm(p => ({ ...p, kdv_dahil: e.target.checked }))}
                                                    />
                                                    <span className="teklif-popup__toggle-slider" />
                                                    <span>KDV Dahil</span>
                                                </label>
                                            </div>
                                        )}

                                        {/* Tek tutar modda KDV toggle */}
                                        {!hasKalemler && (
                                            <label className="teklif-popup__toggle" style={{ marginTop: 10 }}>
                                                <input
                                                    type="checkbox"
                                                    checked={teklifForm.kdv_dahil}
                                                    onChange={(e) => setTeklifForm(p => ({ ...p, kdv_dahil: e.target.checked }))}
                                                />
                                                <span className="teklif-popup__toggle-slider" />
                                                <span>KDV Dahil</span>
                                            </label>
                                        )}
                                    </div>

                                    {/* BÖLÜM: Teslimat */}
                                    <div className="teklif-popup__section">
                                        <h3><span className="material-symbols-outlined">local_shipping</span> Teslimat</h3>
                                        <div className="teklif-popup__inline-row">
                                            <div className="teklif-popup__inline-field">
                                                <label>Tahmini Teslim Süresi (gün)</label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    placeholder="ör: 15"
                                                    value={teklifForm.teslim_suresi_gun}
                                                    onChange={(e) => setTeklifForm(p => ({ ...p, teslim_suresi_gun: e.target.value }))}
                                                />
                                            </div>
                                            <div className="teklif-popup__inline-field teklif-popup__inline-field--grow">
                                                <label>Teslim Açıklaması</label>
                                                <input
                                                    type="text"
                                                    placeholder="ör: Fabrikadan teslim, kargo dahil"
                                                    value={teklifForm.teslim_aciklamasi}
                                                    onChange={(e) => setTeklifForm(p => ({ ...p, teslim_aciklamasi: e.target.value }))}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* BÖLÜM: Dosya */}
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
                                            <input
                                                ref={teklifDosyaRef}
                                                type="file"
                                                accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.zip"
                                                style={{ display: 'none' }}
                                                onChange={(e) => {
                                                    const f = e.target.files?.[0];
                                                    if (f && f.size <= 10 * 1024 * 1024) setTeklifDosya(f);
                                                    else if (f) setTeklifError('Dosya 10 MB limitini aşıyor.');
                                                }}
                                            />
                                        </div>
                                    </div>

                                    {/* BÖLÜM: Not */}
                                    <div className="teklif-popup__section">
                                        <h3><span className="material-symbols-outlined">sticky_note_2</span> Ek Not <small>(opsiyonel)</small></h3>
                                        <textarea
                                            rows="3"
                                            placeholder="İhale sahibine iletmek istediğiniz ek bilgi veya notlar…"
                                            value={teklifForm.not}
                                            onChange={(e) => setTeklifForm(p => ({ ...p, not: e.target.value }))}
                                            className="teklif-popup__textarea"
                                        />
                                    </div>

                                    {teklifError && (
                                        <div className="teklif-popup__error">
                                            <span className="material-symbols-outlined">error</span>
                                            {teklifError}
                                        </div>
                                    )}
                                </div>

                                {/* Footer — Gönder + Taslak */}
                                <div className="teklif-popup__footer">
                                    <div className="teklif-popup__footer-total">
                                        <span>Toplam Teklif</span>
                                        <strong>{formatCurrency(genelToplam, teklifForm.para_birimi)}</strong>
                                        {teklifForm.kdv_dahil && <small>KDV Dahil</small>}
                                    </div>
                                    <div className="teklif-popup__footer-actions">
                                        <button type="button" className="teklif-btn teklif-btn--draft" disabled={teklifSaving} onClick={() => handleTeklifSubmit(true)}>
                                            <span className="material-symbols-outlined">save</span>
                                            {teklifSaving ? 'Kaydediliyor…' : 'Taslak Kaydet'}
                                        </button>
                                        <button type="button" className="teklif-btn teklif-btn--submit" disabled={teklifSaving} onClick={() => handleTeklifSubmit(false)}>
                                            <span className="material-symbols-outlined">send</span>
                                            {teklifSaving ? 'Gönderiliyor…' : 'Teklifi Gönder'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })()}
            </main>
        </div>
    );
};

export default IhalelerPage;