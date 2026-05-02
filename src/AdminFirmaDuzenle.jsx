/* Enes Doğanay | 13 Nisan 2026: Admin — Firma Düzenleme sayfası */
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import SharedHeader from './SharedHeader';
import './SharedHeader.css';
import './AdminFirmaDuzenle.css';
import CompanyManagementPanel from './CompanyManagementPanel';
import './CompanyManagementPanel.css';
import { supabase } from './supabaseClient';
import { isAdminEmail } from './adminAccess';
import { resolveIsAdminUser } from './corporateApplicationsApi';

/* Enes Doğanay | 13 Nisan 2026: Boş firma objesi — yeni firma ekleme modunda kullanılır */
const EMPTY_COMPANY = {
    firma_adi: '', web_sitesi: '', category_name: '', description: '',
    firma_turu: '', telefon: '', eposta: '', adres: '',
    latitude: null, longitude: null, ana_sektor: '',
    urun_kategorileri: '[]', logo_url: '', il_ilce: ''
};

const AdminFirmaDuzenle = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [accessDenied, setAccessDenied] = useState(false);

    /* Enes Doğanay | 13 Nisan 2026: Firma arama state'leri */
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);

    /* Enes Doğanay | 15 Nisan 2026: A-Z / Z-A sıralama seçeneği */
    const [sortAsc, setSortAsc] = useState(true);

    /* Enes Doğanay | 15 Nisan 2026: Benzer/duplike kayıt tespiti */
    const [duplicateMode, setDuplicateMode] = useState(false);
    const [duplicateGroups, setDuplicateGroups] = useState([]);
    const [duplicateLoading, setDuplicateLoading] = useState(false);
    /* Enes Doğanay | 15 Nisan 2026: Duplike silme — önizle + onay akışı */
    const [purgePreview, setPurgePreview] = useState(null);   // { keep: [...], remove: [...] }
    const [purgeConfirm, setPurgeConfirm] = useState(false);
    const [purging, setPurging] = useState(false);
    const [purgeResult, setPurgeResult] = useState(null);

    /* Enes Doğanay | 15 Nisan 2026: Zayıf firma tespiti + seçerek silme */
    const [weakMode, setWeakMode] = useState(false);
    const [weakFirms, setWeakFirms] = useState([]);
    const [weakLoading, setWeakLoading] = useState(false);
    const [weakSelected, setWeakSelected] = useState(new Set());
    const [weakDeleting, setWeakDeleting] = useState(new Set());
    const [weakDeleteResult, setWeakDeleteResult] = useState(null);

    /* Enes Doğanay | 1 Mayıs 2026: Pagination state */
    const PAGE_SIZE = 50;
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    /* Enes Doğanay | 13 Nisan 2026: Seçili firma + mod state'leri */
    const [selectedFirma, setSelectedFirma] = useState(null);
    const [loadingCompany, setLoadingCompany] = useState(false);
    const [isNewMode, setIsNewMode] = useState(false);

    const searchTimeoutRef = useRef(null);

    /* Enes Doğanay | 13 Nisan 2026: Admin oturum kontrolü */
    useEffect(() => {
        let isMounted = true;
        const checkAccess = async () => {
            const { data: sessionResult } = await supabase.auth.getSession();
            const session = sessionResult.session;
            if (!session?.user) { navigate('/login'); return; }
            if (!(await resolveIsAdminUser(session.user.email, isAdminEmail))) {
                if (isMounted) { setAccessDenied(true); setLoading(false); }
                return;
            }
            if (isMounted) setLoading(false);
        };
        checkAccess();
        return () => { isMounted = false; };
    }, [navigate]);

    /* Enes Doğanay | 15 Nisan 2026: Debounced firma arama — boşken tüm firmalar, yazınca filtrele */
    /* Enes Doğanay | 1 Mayıs 2026: Pagination desteği eklendi */
    useEffect(() => {
        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
        const q = searchTerm.trim();
        const delay = q.length > 0 ? 400 : 0;

        searchTimeoutRef.current = setTimeout(async () => {
            setSearching(true);
            const from = (currentPage - 1) * PAGE_SIZE;
            const to = from + PAGE_SIZE - 1;
            let query = supabase
                .from('firmalar')
                .select('firmaID, firma_adi, category_name, il_ilce, logo_url', { count: 'exact' })
                .order('firma_adi', { ascending: sortAsc })
                .range(from, to);
            if (q.length > 0) {
                query = query.ilike('firma_adi', `%${q}%`);
            }
            const { data, error, count } = await query;
            if (error) console.error('Firma arama hatası:', error);
            setSearchResults(data || []);
            setTotalCount(count || 0);
            setSearching(false);
        }, delay);

        return () => { if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current); };
    }, [searchTerm, sortAsc, currentPage]);

    /* Enes Doğanay | 15 Nisan 2026: Benzer/duplike firma isimlerini bul ve grupla */
    const handleFindDuplicates = async () => {
        if (duplicateMode) { setDuplicateMode(false); setDuplicateGroups([]); return; }
        setDuplicateLoading(true);
        setDuplicateMode(true);
        setSearchTerm('');
        try {
            /* Tüm firmaları çek */
            let allFirmalar = [];
            let from = 0;
            const batchSize = 1000;
            while (true) {
                const { data, error } = await supabase
                    .from('firmalar')
                    .select('firmaID, firma_adi, category_name, il_ilce, logo_url')
                    .order('firma_adi', { ascending: true })
                    .range(from, from + batchSize - 1);
                if (error) { console.error('Duplike arama hatası:', error); break; }
                if (!data || data.length === 0) break;
                allFirmalar = allFirmalar.concat(data);
                if (data.length < batchSize) break;
                from += batchSize;
            }

            /* İsim normalize fonksiyonu */
            const normalize = (name) => {
                return (name || '').toLocaleLowerCase('tr-TR')
                    .replace(/[^a-zçğıöşü0-9]/gi, '')
                    .replace(/\s+/g, '');
            };

            /* Aynı normalize isimle eşleşenleri grupla */
            const groups = {};
            allFirmalar.forEach(f => {
                const key = normalize(f.firma_adi);
                if (!groups[key]) groups[key] = [];
                groups[key].push(f);
            });

            /* Birden fazla kayıt olan grupları al (birebir eşleşme) */
            let result = Object.values(groups).filter(g => g.length > 1);

            /* Benzer isimleri de bul (Levenshtein mesafesi <= 3) */
            const keys = Object.keys(groups).filter(k => groups[k].length === 1);
            const levenshtein = (a, b) => {
                if (a.length === 0) return b.length;
                if (b.length === 0) return a.length;
                const matrix = [];
                for (let i = 0; i <= b.length; i++) matrix[i] = [i];
                for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
                for (let i = 1; i <= b.length; i++) {
                    for (let j = 1; j <= a.length; j++) {
                        const cost = b.charAt(i - 1) === a.charAt(j - 1) ? 0 : 1;
                        matrix[i][j] = Math.min(
                            matrix[i - 1][j] + 1,
                            matrix[i][j - 1] + 1,
                            matrix[i - 1][j - 1] + cost
                        );
                    }
                }
                return matrix[b.length][a.length];
            };

            const usedKeys = new Set();
            for (let i = 0; i < keys.length; i++) {
                if (usedKeys.has(keys[i])) continue;
                const similar = [keys[i]];
                for (let j = i + 1; j < keys.length; j++) {
                    if (usedKeys.has(keys[j])) continue;
                    const maxLen = Math.max(keys[i].length, keys[j].length);
                    const dist = levenshtein(keys[i], keys[j]);
                    if (dist <= 3 && dist / maxLen < 0.3) {
                        similar.push(keys[j]);
                        usedKeys.add(keys[j]);
                    }
                }
                if (similar.length > 1) {
                    usedKeys.add(keys[i]);
                    const merged = similar.flatMap(k => groups[k]);
                    result.push(merged);
                }
            }

            /* Grup boyutuna göre sırala (çok eşleşenler üstte) */
            result.sort((a, b) => b.length - a.length);
            setDuplicateGroups(result);
        } catch (err) {
            console.error('Duplike tarama hatası:', err);
        } finally {
            setDuplicateLoading(false);
        }
    };

    /* Enes Doğanay | 15 Nisan 2026: Birebir duplike firmaları önizle — her gruptan en dolu kaydı tut, gerisini sil listesine ekle */
    const handlePurgeDuplicatesPreview = async () => {
        setPurgeResult(null);
        setPurgeConfirm(false);

        /* Tüm firmaları tam veriyle çek (veri karşılaştırması için) */
        let allFirmalar = [];
        let from = 0;
        const batchSize = 1000;
        while (true) {
            const { data, error } = await supabase
                .from('firmalar')
                .select('*')
                .order('firma_adi', { ascending: true })
                .range(from, from + batchSize - 1);
            if (error) { console.error('Duplike önizleme hatası:', error); break; }
            if (!data || data.length === 0) break;
            allFirmalar = allFirmalar.concat(data);
            if (data.length < batchSize) break;
            from += batchSize;
        }

        /* Normalize & grupla — sadece birebir eşleşenler */
        const normalize = (name) => {
            return (name || '').toLocaleLowerCase('tr-TR')
                .replace(/[^a-zçğıöşü0-9]/gi, '')
                .replace(/\s+/g, '');
        };
        const groups = {};
        allFirmalar.forEach(f => {
            const key = normalize(f.firma_adi);
            if (!groups[key]) groups[key] = [];
            groups[key].push(f);
        });

        /* Her grubun en dolu kaydını puanla */
        const scoreFirma = (f) => {
            let score = 0;
            /* Ürün kataloğu ağırlıklı — en önemli kriter */
            try {
                const catalog = JSON.parse(f.urun_kategorileri || '[]');
                const totalProducts = catalog.reduce((acc, cat) =>
                    acc + (cat.alt_kategoriler || []).reduce((a2, sub) => a2 + (sub.urunler || []).length, 0), 0);
                score += totalProducts * 5;
                score += catalog.length * 3;
            } catch { /* boş veya hatalı JSON */ }
            /* Diğer alanlar */
            if (f.description && f.description.trim().length > 10) score += 4;
            if (f.telefon && f.telefon.trim()) score += 2;
            if (f.eposta && f.eposta.trim()) score += 2;
            if (f.adres && f.adres.trim()) score += 2;
            if (f.web_sitesi && f.web_sitesi.trim()) score += 2;
            if (f.logo_url && f.logo_url.includes('firma-logolari')) score += 3;
            if (f.ana_sektor && f.ana_sektor.trim()) score += 1;
            if (f.il_ilce && f.il_ilce.trim()) score += 1;
            if (f.category_name && f.category_name.trim()) score += 1;
            if (f.firma_turu && f.firma_turu.trim()) score += 1;
            if (f.latitude && f.longitude) score += 1;
            if (f.onayli_hesap) score += 10;
            if (f.best) score += 5;
            return score;
        };

        const keep = [];
        const remove = [];

        Object.values(groups).forEach(group => {
            if (group.length <= 1) return;
            /* Puana göre sırala — en yüksek puan = en dolu kayıt */
            const scored = group.map(f => ({ ...f, _score: scoreFirma(f) }))
                .sort((a, b) => b._score - a._score);
            keep.push(scored[0]);
            remove.push(...scored.slice(1));
        });

        if (remove.length === 0) {
            setPurgePreview({ keep: [], remove: [] });
        } else {
            setPurgePreview({ keep, remove });
        }
    };

    /* Enes Doğanay | 15 Nisan 2026: Onaylanan duplikeleri sil — JSON yedeği al, sonra tek tek sil */
    const handlePurgeConfirmed = async () => {
        if (!purgePreview || purgePreview.remove.length === 0) return;
        setPurging(true);

        /* Güvenlik: silinecek kayıtların JSON yedeği */
        const backup = purgePreview.remove.map(f => ({
            firmaID: f.firmaID, firma_adi: f.firma_adi, category_name: f.category_name,
            description: f.description, telefon: f.telefon, eposta: f.eposta,
            adres: f.adres, web_sitesi: f.web_sitesi, logo_url: f.logo_url,
            il_ilce: f.il_ilce, ana_sektor: f.ana_sektor, urun_kategorileri: f.urun_kategorileri,
            firma_turu: f.firma_turu, onayli_hesap: f.onayli_hesap, best: f.best,
        }));
        console.log('%c[DUPLIKE SİLME YEDEĞİ] Silinecek kayıtlar:', 'color:#f59e0b;font-weight:700', JSON.stringify(backup, null, 2));

        let deleted = 0;
        let errors = [];
        for (const firma of purgePreview.remove) {
            try {
                const { error } = await supabase.functions.invoke('company-management', {
                    body: { action: 'admin_delete_company', firmaID: firma.firmaID }
                });
                if (error) throw error;
                deleted++;
            } catch (err) {
                errors.push({ firmaID: firma.firmaID, firma_adi: firma.firma_adi, error: err.message });
            }
        }

        setPurgeResult({ deleted, errors, total: purgePreview.remove.length });
        setPurgePreview(null);
        setPurgeConfirm(false);
        setPurging(false);

        /* Duplike listesini yenile */
        if (deleted > 0) {
            setDuplicateMode(false);
            setDuplicateGroups([]);
        }
    };

    /* Enes Doğanay | 15 Nisan 2026: Zayıf firma tespiti — ürün kataloğu ağırlıklı puanlama */
    const scoreWeak = (f) => {
        let score = 0;
        let productCount = 0;
        let categoryCount = 0;
        try {
            const catalog = JSON.parse(f.urun_kategorileri || '[]');
            categoryCount = catalog.length;
            productCount = catalog.reduce((acc, cat) =>
                acc + (cat.alt_kategoriler || []).reduce((a2, sub) => a2 + (sub.urunler || []).length, 0), 0);
        } catch { /* boş veya hatalı JSON */ }
        /* Ürün puanlaması — en büyük kriter */
        score += productCount * 8;
        score += categoryCount * 4;
        /* Diğer alanlar (daha düşük ağırlık) */
        if (f.description && f.description.trim().length > 20) score += 3;
        else if (f.description && f.description.trim().length > 0) score += 1;
        if (f.telefon && f.telefon.trim()) score += 2;
        if (f.eposta && f.eposta.trim()) score += 2;
        if (f.adres && f.adres.trim()) score += 1;
        if (f.web_sitesi && f.web_sitesi.trim()) score += 1;
        if (f.logo_url && f.logo_url.includes('firma-logolari')) score += 2;
        if (f.ana_sektor && f.ana_sektor.trim()) score += 1;
        if (f.il_ilce && f.il_ilce.trim()) score += 1;
        if (f.firma_turu && f.firma_turu.trim()) score += 1;
        if (f.onayli_hesap) score += 15;
        if (f.best) score += 8;
        return { score, productCount, categoryCount };
    };

    const handleFindWeakFirms = async () => {
        if (weakMode) { setWeakMode(false); setWeakFirms([]); setWeakSelected(new Set()); return; }
        setWeakLoading(true);
        setWeakMode(true);
        setDuplicateMode(false);
        setDuplicateGroups([]);
        setSearchTerm('');
        setWeakDeleteResult(null);
        try {
            let allFirmalar = [];
            let from = 0;
            const batchSize = 1000;
            while (true) {
                const { data, error } = await supabase
                    .from('firmalar')
                    .select('*')
                    .order('firma_adi', { ascending: true })
                    .range(from, from + batchSize - 1);
                if (error) { console.error('Zayıf firma tarama hatası:', error); break; }
                if (!data || data.length === 0) break;
                allFirmalar = allFirmalar.concat(data);
                if (data.length < batchSize) break;
                from += batchSize;
            }
            /* Puanla ve eşik altındakileri filtrele */
            const WEAK_THRESHOLD = 15;
            const scored = allFirmalar.map(f => {
                const { score, productCount, categoryCount } = scoreWeak(f);
                return { ...f, _score: score, _productCount: productCount, _categoryCount: categoryCount };
            });
            const weak = scored.filter(f => f._score <= WEAK_THRESHOLD)
                .sort((a, b) => a._score - b._score);
            setWeakFirms(weak);
        } catch (err) {
            console.error('Zayıf firma tarama hatası:', err);
        } finally {
            setWeakLoading(false);
        }
    };

    /* Enes Doğanay | 15 Nisan 2026: Zayıf firma seçim toggle */
    const toggleWeakSelect = (firmaID) => {
        setWeakSelected(prev => {
            const next = new Set(prev);
            if (next.has(firmaID)) next.delete(firmaID); else next.add(firmaID);
            return next;
        });
    };
    const toggleWeakSelectAll = () => {
        if (weakSelected.size === weakFirms.length) setWeakSelected(new Set());
        else setWeakSelected(new Set(weakFirms.map(f => f.firmaID)));
    };

    /* Enes Doğanay | 15 Nisan 2026: Tek firma sil (zayıf listeden) */
    const handleWeakDeleteSingle = async (firma) => {
        if (!window.confirm(`"${firma.firma_adi}" silinecek. Emin misiniz?`)) return;
        setWeakDeleting(prev => new Set(prev).add(firma.firmaID));
        console.log('%c[ZAYIF FİRMA SİLME YEDEĞİ]', 'color:#ef4444;font-weight:700', JSON.stringify(firma, null, 2));
        try {
            const { error } = await supabase.functions.invoke('company-management', {
                body: { action: 'admin_delete_company', firmaID: firma.firmaID }
            });
            if (error) throw error;
            setWeakFirms(prev => prev.filter(f => f.firmaID !== firma.firmaID));
            setWeakSelected(prev => { const n = new Set(prev); n.delete(firma.firmaID); return n; });
        } catch (err) {
            alert(`Silinemedi: ${err.message}`);
        } finally {
            setWeakDeleting(prev => { const n = new Set(prev); n.delete(firma.firmaID); return n; });
        }
    };

    /* Enes Doğanay | 15 Nisan 2026: Seçili zayıf firmaları toplu sil */
    const handleWeakDeleteSelected = async () => {
        if (weakSelected.size === 0) return;
        if (!window.confirm(`${weakSelected.size} firma silinecek. Bu işlem geri alınamaz. Emin misiniz?`)) return;
        const toDelete = weakFirms.filter(f => weakSelected.has(f.firmaID));
        console.log('%c[TOPLU ZAYIF FİRMA SİLME YEDEĞİ]', 'color:#ef4444;font-weight:700', JSON.stringify(toDelete, null, 2));
        let deleted = 0;
        let errors = [];
        for (const firma of toDelete) {
            setWeakDeleting(prev => new Set(prev).add(firma.firmaID));
            try {
                const { error } = await supabase.functions.invoke('company-management', {
                    body: { action: 'admin_delete_company', firmaID: firma.firmaID }
                });
                if (error) throw error;
                deleted++;
            } catch (err) {
                errors.push({ firmaID: firma.firmaID, firma_adi: firma.firma_adi, error: err.message });
            }
            setWeakDeleting(prev => { const n = new Set(prev); n.delete(firma.firmaID); return n; });
        }
        setWeakFirms(prev => prev.filter(f => !weakSelected.has(f.firmaID) || errors.some(e => e.firmaID === f.firmaID)));
        setWeakSelected(new Set(errors.map(e => e.firmaID)));
        setWeakDeleteResult({ deleted, errors, total: toDelete.length });
    };

    /* Enes Doğanay | 13 Nisan 2026: Firma seçildiğinde edge function ile tam veriyi çek */
    const handleSelectFirma = async (firma) => {
        setSearchResults([]);
        setSearchTerm('');
        setLoadingCompany(true);
        try {
            const { data, error } = await supabase.functions.invoke('company-management', {
                body: { action: 'admin_get_company', firmaID: firma.firmaID }
            });
            if (error) throw new Error(data?.error || error.message);
            setSelectedFirma(data.company);
        } catch (err) {
            console.error('Firma detay hatası:', err);
            setSelectedFirma(null);
        } finally {
            setLoadingCompany(false);
        }
    };

    /* Enes Doğanay | 13 Nisan 2026: Admin kaydetme — düzenleme veya yeni ekleme */
    const handleAdminSave = useCallback(async (companyPayload) => {
        if (isNewMode) {
            const { data, error } = await supabase.functions.invoke('company-management', {
                body: { action: 'admin_create_company', company: companyPayload }
            });
            if (error) throw new Error(data?.error || error.message);
            /* Enes Doğanay | 13 Nisan 2026: Ekleme sonrası düzenleme moduna geç */
            setSelectedFirma(data.company);
            setIsNewMode(false);
            return { company: data.company, firmaId: data.firmaId };
        }
        if (!selectedFirma) throw new Error('Firma seçilmedi.');
        const { data, error } = await supabase.functions.invoke('company-management', {
            body: { action: 'admin_update_company', firmaID: selectedFirma.firmaID, company: companyPayload }
        });
        if (error) throw new Error(data?.error || error.message);
        return { company: data.company, firmaId: data.firmaId };
    }, [selectedFirma, isNewMode]);

    /* Enes Doğanay | 13 Nisan 2026: Firma güncellendikten sonra state'i yenile */
    const handleCompanyUpdated = (updatedCompany) => {
        setSelectedFirma(updatedCompany);
    };

    /* Enes Doğanay | 13 Nisan 2026: Admin firma silme — edge function admin_delete_company */
    const handleAdminDelete = useCallback(async () => {
        if (!selectedFirma) throw new Error('Firma seçilmedi.');
        const { data, error } = await supabase.functions.invoke('company-management', {
            body: { action: 'admin_delete_company', firmaID: selectedFirma.firmaID }
        });
        if (error) throw new Error(data?.error || error.message);
        setSelectedFirma(null);
    }, [selectedFirma]);

    /* Enes Doğanay | 13 Nisan 2026: Seçimi temizle — başka firma seçmek için */
    const handleClearSelection = () => {
        setSelectedFirma(null);
        setIsNewMode(false);
    };

    /* Enes Doğanay | 13 Nisan 2026: Yeni firma ekleme modunu aç */
    const handleNewCompany = () => {
        setSelectedFirma(EMPTY_COMPANY);
        setIsNewMode(true);
        setSearchTerm('');
        setSearchResults([]);
    };

    if (loading) {
        return (
            <>
                <SharedHeader navItems={[{ label: 'Anasayfa', href: '/' }, { label: 'Firmalar', href: '/firmalar' }]} />
                <div className="afd-page"><div className="afd-loading"><div className="afd-spinner" /><p>Yükleniyor...</p></div></div>
            </>
        );
    }

    if (accessDenied) {
        return (
            <>
                <SharedHeader navItems={[{ label: 'Anasayfa', href: '/' }, { label: 'Firmalar', href: '/firmalar' }]} />
                <div className="afd-page">
                    <div className="afd-denied">
                        <span className="material-symbols-outlined">lock</span>
                        <h2>Erişim Engellendi</h2>
                        <p>Bu sayfa yalnızca admin kullanıcılara açıktır.</p>
                        <button onClick={() => navigate('/')}>Ana Sayfaya Dön</button>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <SharedHeader
                navItems={[
                    { label: 'Anasayfa', href: '/' },
                    { label: 'Firmalar', href: '/firmalar' },
                    { label: 'İhaleler', href: '/ihaleler' },
                    { label: 'Hakkımızda', href: '/hakkimizda' },
                    { label: 'İletişim', href: '/iletisim' }
                ]}
            />

            <div className="afd-page">
                <div className="afd-container">

                    {/* Enes Doğanay | 13 Nisan 2026: Sayfa başlığı */}
                    <div className="afd-hero">
                        <span className="material-symbols-outlined">edit_note</span>
                        <div>
                            <h1>Firma Düzenleme</h1>
                            <p>Firma arayın, seçin ve tüm bilgilerini düzenleyin. Değişiklikler anında yansır.</p>
                        </div>
                    </div>

                    {/* Enes Doğanay | 13 Nisan 2026: Firma arama alanı + Firma Ekle butonu */}
                    {!selectedFirma && !loadingCompany && (
                        <div className="afd-search-section">
                            <div className="afd-search-top">
                                <div className="afd-search-bar">
                                    <span className="material-symbols-outlined">search</span>
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                        placeholder="Firma adı ile arayın..."
                                        autoFocus
                                    />
                                    {searchTerm && (
                                        <button className="afd-search-clear" onClick={() => { setSearchTerm(''); setSearchResults([]); }}>
                                            <span className="material-symbols-outlined">close</span>
                                        </button>
                                    )}
                                </div>
                                <button className="afd-btn afd-btn--add" onClick={handleNewCompany}>
                                    <span className="material-symbols-outlined">add_business</span>
                                    Firma Ekle
                                </button>
                            </div>

                            {/* Enes Doğanay | 15 Nisan 2026: A-Z / Z-A sıralama + Benzer Kayıtlar + Zayıf Firmalar toggle */}
                            <div className="afd-sort-row">
                                {!duplicateMode && !weakMode && searchResults.length > 0 && (
                                    <>
                                        <button className={`afd-btn afd-btn--sort${sortAsc ? ' active' : ''}`} onClick={() => { setSortAsc(true); setCurrentPage(1); }}>
                                            <span className="material-symbols-outlined">arrow_downward</span>
                                            A → Z
                                        </button>
                                        <button className={`afd-btn afd-btn--sort${!sortAsc ? ' active' : ''}`} onClick={() => { setSortAsc(false); setCurrentPage(1); }}>
                                            <span className="material-symbols-outlined">arrow_upward</span>
                                            Z → A
                                        </button>
                                    </>
                                )}
                                <button
                                    className={`afd-btn afd-btn--sort afd-btn--dup${duplicateMode ? ' active' : ''}`}
                                    onClick={() => { if (weakMode) { setWeakMode(false); setWeakFirms([]); setWeakSelected(new Set()); } handleFindDuplicates(); }}
                                    disabled={duplicateLoading || weakLoading}
                                >
                                    {duplicateLoading ? (
                                        <><div className="afd-spinner afd-spinner--sm" /> Taranıyor...</>
                                    ) : (
                                        <><span className="material-symbols-outlined">content_copy</span> {duplicateMode ? 'Normal Liste' : 'Benzer Kayıtlar'}</>
                                    )}
                                </button>
                                {/* Enes Doğanay | 15 Nisan 2026: Duplike kayıtları sil — önce önizle */}
                                <button
                                    className="afd-btn afd-btn--sort afd-btn--purge"
                                    onClick={handlePurgeDuplicatesPreview}
                                    disabled={duplicateLoading || purging || weakLoading}
                                >
                                    <span className="material-symbols-outlined">delete_sweep</span>
                                    Duplikeleri Sil
                                </button>
                                {/* Enes Doğanay | 15 Nisan 2026: Zayıf firmaları listele */}
                                <button
                                    className={`afd-btn afd-btn--sort afd-btn--weak${weakMode ? ' active' : ''}`}
                                    onClick={() => { if (duplicateMode) { setDuplicateMode(false); setDuplicateGroups([]); } handleFindWeakFirms(); }}
                                    disabled={weakLoading || duplicateLoading}
                                >
                                    {weakLoading ? (
                                        <><div className="afd-spinner afd-spinner--sm" /> Taranıyor...</>
                                    ) : (
                                        <><span className="material-symbols-outlined">trending_down</span> {weakMode ? 'Normal Liste' : 'Zayıf Firmalar'}</>
                                    )}
                                </button>
                            </div>

                            {/* Enes Doğanay | 15 Nisan 2026: Silme sonucu */}
                            {purgeResult && (
                                <div className={`afd-purge-result ${purgeResult.errors.length > 0 ? 'afd-purge-result--warn' : ''}`}>
                                    <span className="material-symbols-outlined">{purgeResult.errors.length > 0 ? 'warning' : 'check_circle'}</span>
                                    <span>
                                        {purgeResult.deleted}/{purgeResult.total} duplike firma silindi.
                                        {purgeResult.errors.length > 0 && ` ${purgeResult.errors.length} kayıt silinemedi.`}
                                    </span>
                                    <button className="afd-purge-result-close" onClick={() => setPurgeResult(null)}>
                                        <span className="material-symbols-outlined">close</span>
                                    </button>
                                </div>
                            )}

                            {/* Enes Doğanay | 15 Nisan 2026: Duplike mod — gruplu sonuçlar */}
                            {duplicateMode && !duplicateLoading && duplicateGroups.length > 0 && (
                                <div className="afd-dup-results">
                                    <p className="afd-dup-summary">
                                        <span className="material-symbols-outlined">warning</span>
                                        {duplicateGroups.length} grup benzer/aynı isimli firma bulundu
                                    </p>
                                    {duplicateGroups.map((group, gi) => (
                                        <div key={gi} className="afd-dup-group">
                                            <div className="afd-dup-group-header">
                                                <span className="material-symbols-outlined">folder_copy</span>
                                                {group.length} benzer kayıt
                                            </div>
                                            {group.map(firma => (
                                                <button
                                                    key={firma.firmaID}
                                                    className="afd-result-card"
                                                    onClick={() => { setDuplicateMode(false); setDuplicateGroups([]); handleSelectFirma(firma); }}
                                                >
                                                    <div className="afd-result-avatar">
                                                        {firma.logo_url?.includes('firma-logolari') ? (
                                                            <img src={firma.logo_url} alt="" loading="lazy" />
                                                        ) : (
                                                            <span>{(firma.firma_adi || 'F').charAt(0).toUpperCase()}</span>
                                                        )}
                                                    </div>
                                                    <div className="afd-result-info">
                                                        <strong>{firma.firma_adi}</strong>
                                                        <small>{firma.category_name || 'Kategori yok'} • {firma.il_ilce || 'Konum yok'}</small>
                                                    </div>
                                                    <span className="afd-dup-id">#{firma.firmaID?.slice(0, 8)}</span>
                                                </button>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {duplicateMode && !duplicateLoading && duplicateGroups.length === 0 && (
                                <div className="afd-no-results">
                                    <span className="material-symbols-outlined">check_circle</span>
                                    <span>Benzer veya duplike firma kaydı bulunamadı.</span>
                                </div>
                            )}

                            {/* Enes Doğanay | 15 Nisan 2026: Zayıf firma listesi — seçerek/bireysel silme */}
                            {weakMode && !weakLoading && weakFirms.length > 0 && (
                                <div className="afd-weak-results">
                                    <div className="afd-weak-header">
                                        <p className="afd-dup-summary afd-dup-summary--weak">
                                            <span className="material-symbols-outlined">trending_down</span>
                                            {weakFirms.length} zayıf verili firma bulundu (puan &lt; 15)
                                        </p>
                                        <div className="afd-weak-actions">
                                            <label className="afd-weak-select-all">
                                                <input
                                                    type="checkbox"
                                                    checked={weakSelected.size === weakFirms.length && weakFirms.length > 0}
                                                    onChange={toggleWeakSelectAll}
                                                />
                                                Tümünü Seç
                                            </label>
                                            {weakSelected.size > 0 && (
                                                <button className="afd-btn afd-btn--danger afd-btn--sm" onClick={handleWeakDeleteSelected} disabled={weakDeleting.size > 0}>
                                                    <span className="material-symbols-outlined">delete</span>
                                                    Seçilenleri Sil ({weakSelected.size})
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {weakDeleteResult && (
                                        <div className={`afd-purge-result ${weakDeleteResult.errors.length > 0 ? 'afd-purge-result--warn' : ''}`}>
                                            <span className="material-symbols-outlined">{weakDeleteResult.errors.length > 0 ? 'warning' : 'check_circle'}</span>
                                            <span>
                                                {weakDeleteResult.deleted}/{weakDeleteResult.total} firma silindi.
                                                {weakDeleteResult.errors.length > 0 && ` ${weakDeleteResult.errors.length} kayıt silinemedi.`}
                                            </span>
                                            <button className="afd-purge-result-close" onClick={() => setWeakDeleteResult(null)}>
                                                <span className="material-symbols-outlined">close</span>
                                            </button>
                                        </div>
                                    )}

                                    <div className="afd-weak-list">
                                        {weakFirms.map(firma => (
                                            <div key={firma.firmaID} className={`afd-weak-card${weakSelected.has(firma.firmaID) ? ' selected' : ''}`}>
                                                <input
                                                    type="checkbox"
                                                    className="afd-weak-checkbox"
                                                    checked={weakSelected.has(firma.firmaID)}
                                                    onChange={() => toggleWeakSelect(firma.firmaID)}
                                                />
                                                <div
                                                    className="afd-weak-card-body"
                                                    onClick={() => { setWeakMode(false); setWeakFirms([]); setWeakSelected(new Set()); handleSelectFirma(firma); }}
                                                >
                                                    <div className="afd-result-avatar">
                                                        {firma.logo_url?.includes('firma-logolari') ? (
                                                            <img src={firma.logo_url} alt="" loading="lazy" />
                                                        ) : (
                                                            <span>{(firma.firma_adi || 'F').charAt(0).toUpperCase()}</span>
                                                        )}
                                                    </div>
                                                    <div className="afd-result-info">
                                                        <strong>{firma.firma_adi}</strong>
                                                        <small>
                                                            {firma.category_name || 'Kategori yok'} • {firma.il_ilce || 'Konum yok'}
                                                        </small>
                                                    </div>
                                                    <div className="afd-weak-meta">
                                                        <span className={`afd-weak-score${firma._score === 0 ? ' afd-weak-score--zero' : ''}`}>
                                                            Puan: {firma._score}
                                                        </span>
                                                        <small>
                                                            {firma._productCount === 0 ? '❌ Ürün yok' : `${firma._productCount} ürün`}
                                                            {firma._categoryCount > 0 && ` • ${firma._categoryCount} kategori`}
                                                        </small>
                                                    </div>
                                                </div>
                                                <button
                                                    className="afd-weak-del-btn"
                                                    onClick={() => handleWeakDeleteSingle(firma)}
                                                    disabled={weakDeleting.has(firma.firmaID)}
                                                    title="Bu firmayı sil"
                                                >
                                                    {weakDeleting.has(firma.firmaID) ? (
                                                        <div className="afd-spinner afd-spinner--sm" />
                                                    ) : (
                                                        <span className="material-symbols-outlined">delete</span>
                                                    )}
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {weakMode && !weakLoading && weakFirms.length === 0 && (
                                <div className="afd-no-results">
                                    <span className="material-symbols-outlined">check_circle</span>
                                    <span>Zayıf verili firma bulunamadı. Tüm firmalar yeterli veriye sahip.</span>
                                </div>
                            )}

                            {!duplicateMode && !weakMode && searching && (
                                <div className="afd-search-status">
                                    <div className="afd-spinner afd-spinner--sm" />
                                    <span>Aranıyor...</span>
                                </div>
                            )}

                            {!duplicateMode && !weakMode && searchResults.length > 0 && (
                                <>
                                    <div className="afd-results">
                                        {searchResults.map(firma => (
                                            <button
                                                key={firma.firmaID}
                                                className="afd-result-card"
                                                onClick={() => handleSelectFirma(firma)}
                                            >
                                                <div className="afd-result-avatar">
                                                    {firma.logo_url?.includes('firma-logolari') ? (
                                                        <img src={firma.logo_url} alt="" loading="lazy" />
                                                    ) : (
                                                        <span>{(firma.firma_adi || 'F').charAt(0).toUpperCase()}</span>
                                                    )}
                                                </div>
                                                <div className="afd-result-info">
                                                    <strong>{firma.firma_adi}</strong>
                                                    <small>{firma.category_name || 'Kategori yok'} • {firma.il_ilce || 'Konum yok'}</small>
                                                </div>
                                                {firma.logo_url?.includes('firma-logolari') && (
                                                    <span className="afd-result-logo-badge" title="Logosu var">
                                                        <span className="material-symbols-outlined">image</span>
                                                    </span>
                                                )}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Pagination */}
                                    {totalCount > PAGE_SIZE && (
                                        <div className="afd-pagination">
                                            <span className="afd-pagination-info">
                                                {totalCount} firmadan {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, totalCount)} gösteriliyor
                                            </span>
                                            <div className="afd-pagination-controls">
                                                <button
                                                    className="afd-page-btn"
                                                    onClick={() => setCurrentPage(1)}
                                                    disabled={currentPage === 1}
                                                    title="İlk sayfa"
                                                >
                                                    <span className="material-symbols-outlined">first_page</span>
                                                </button>
                                                <button
                                                    className="afd-page-btn"
                                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                                    disabled={currentPage === 1}
                                                >
                                                    <span className="material-symbols-outlined">chevron_left</span>
                                                </button>
                                                {(() => {
                                                    const totalPages = Math.ceil(totalCount / PAGE_SIZE);
                                                    const pages = [];
                                                    const start = Math.max(1, currentPage - 2);
                                                    const end = Math.min(totalPages, currentPage + 2);
                                                    if (start > 1) pages.push(<span key="s-ellipsis" className="afd-page-ellipsis">…</span>);
                                                    for (let i = start; i <= end; i++) {
                                                        pages.push(
                                                            <button
                                                                key={i}
                                                                className={`afd-page-btn afd-page-btn--num${i === currentPage ? ' active' : ''}`}
                                                                onClick={() => setCurrentPage(i)}
                                                            >
                                                                {i}
                                                            </button>
                                                        );
                                                    }
                                                    if (end < totalPages) pages.push(<span key="e-ellipsis" className="afd-page-ellipsis">…</span>);
                                                    return pages;
                                                })()}
                                                <button
                                                    className="afd-page-btn"
                                                    onClick={() => setCurrentPage(p => Math.min(Math.ceil(totalCount / PAGE_SIZE), p + 1))}
                                                    disabled={currentPage >= Math.ceil(totalCount / PAGE_SIZE)}
                                                >
                                                    <span className="material-symbols-outlined">chevron_right</span>
                                                </button>
                                                <button
                                                    className="afd-page-btn"
                                                    onClick={() => setCurrentPage(Math.ceil(totalCount / PAGE_SIZE))}
                                                    disabled={currentPage >= Math.ceil(totalCount / PAGE_SIZE)}
                                                    title="Son sayfa"
                                                >
                                                    <span className="material-symbols-outlined">last_page</span>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}

                            {!duplicateMode && !weakMode && !searching && searchTerm.trim().length >= 1 && searchResults.length === 0 && (
                                <div className="afd-no-results">
                                    <span className="material-symbols-outlined">person_search</span>
                                    <span>"{searchTerm}" için firma bulunamadı.</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Enes Doğanay | 13 Nisan 2026: Firma yüklenirken spinner */}
                    {loadingCompany && (
                        <div className="afd-loading">
                            <div className="afd-spinner" />
                            <p>Firma bilgileri yükleniyor...</p>
                        </div>
                    )}

                    {/* Enes Doğanay | 13 Nisan 2026: Firma seçildiyse veya yeni ekleme modunda — panel */}
                    {selectedFirma && (
                        <div className="afd-panel-wrapper">
                            <div className="afd-panel-header">
                                <div className="afd-panel-title">
                                    {isNewMode ? (
                                        <>
                                            <h2>Yeni Firma Ekle</h2>
                                            <small>Firma bilgilerini doldurun ve ekleyin.</small>
                                        </>
                                    ) : (
                                        <>
                                            <h2>{selectedFirma.firma_adi}</h2>
                                            <small>{selectedFirma.category_name || ''} • {selectedFirma.il_ilce || ''} • <span className="afd-firma-id">#{selectedFirma.firmaID}</span></small>
                                        </>
                                    )}
                                </div>
                                <button className="afd-btn afd-btn--ghost" onClick={handleClearSelection}>
                                    <span className="material-symbols-outlined">arrow_back</span>
                                    {isNewMode ? 'Vazgeç' : 'Başka Firma Seç'}
                                </button>
                            </div>

                            <CompanyManagementPanel
                                company={selectedFirma}
                                onCompanyUpdated={handleCompanyUpdated}
                                onSave={handleAdminSave}
                                isNew={isNewMode}
                                onDelete={!isNewMode ? handleAdminDelete : undefined}
                                isAdmin={true}
                            />
                        </div>
                    )}

                </div>
            </div>

            {/* Enes Doğanay | 15 Nisan 2026: Duplike silme önizleme + onay overlay */}
            {purgePreview && (
                <div className="afd-purge-overlay" onClick={() => { if (!purging) { setPurgePreview(null); setPurgeConfirm(false); } }}>
                    <div className="afd-purge-modal" onClick={e => e.stopPropagation()}>
                        {purgePreview.remove.length === 0 ? (
                            <>
                                <div className="afd-purge-modal-header afd-purge-modal-header--ok">
                                    <span className="material-symbols-outlined">check_circle</span>
                                    <h3>Duplike Kayıt Bulunamadı</h3>
                                </div>
                                <p className="afd-purge-modal-body">Birebir aynı isimli firma kaydı mevcut değil.</p>
                                <div className="afd-purge-modal-actions">
                                    <button className="afd-btn afd-btn--ghost" onClick={() => setPurgePreview(null)}>Kapat</button>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="afd-purge-modal-header">
                                    <span className="material-symbols-outlined">delete_sweep</span>
                                    <div>
                                        <h3>Duplike Silme Önizlemesi</h3>
                                        <p>{purgePreview.remove.length} firma silinecek, {purgePreview.keep.length} firma tutulacak</p>
                                    </div>
                                </div>
                                <div className="afd-purge-modal-body">
                                    <div className="afd-purge-list">
                                        {purgePreview.keep.map((k, i) => {
                                            const removes = purgePreview.remove.filter(r => {
                                                const norm = (n) => (n || '').toLocaleLowerCase('tr-TR').replace(/[^a-zçğıöşü0-9]/gi, '').replace(/\s+/g, '');
                                                return norm(r.firma_adi) === norm(k.firma_adi);
                                            });
                                            return (
                                                <div key={i} className="afd-purge-group">
                                                    <div className="afd-purge-keep">
                                                        <span className="afd-purge-badge afd-purge-badge--keep">TUTULACAK</span>
                                                        <strong>{k.firma_adi}</strong>
                                                        <small>Puan: {k._score} • {k.category_name || '—'} • #{k.firmaID?.slice(0, 8)}</small>
                                                    </div>
                                                    {removes.map(r => (
                                                        <div key={r.firmaID} className="afd-purge-remove">
                                                            <span className="afd-purge-badge afd-purge-badge--remove">SİLİNECEK</span>
                                                            <strong>{r.firma_adi}</strong>
                                                            <small>Puan: {r._score} • {r.category_name || '—'} • #{r.firmaID?.slice(0, 8)}</small>
                                                        </div>
                                                    ))}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                                <div className="afd-purge-modal-actions">
                                    <button className="afd-btn afd-btn--ghost" onClick={() => { setPurgePreview(null); setPurgeConfirm(false); }} disabled={purging}>
                                        Vazgeç
                                    </button>
                                    {!purgeConfirm ? (
                                        <button className="afd-btn afd-btn--danger" onClick={() => setPurgeConfirm(true)}>
                                            <span className="material-symbols-outlined">warning</span>
                                            {purgePreview.remove.length} Firmayı Sil
                                        </button>
                                    ) : (
                                        <button className="afd-btn afd-btn--danger afd-btn--danger-confirm" onClick={handlePurgeConfirmed} disabled={purging}>
                                            {purging ? (
                                                <><div className="afd-spinner afd-spinner--sm" /> Siliniyor...</>
                                            ) : (
                                                <><span className="material-symbols-outlined">delete_forever</span> Evet, Kesinlikle Sil</>
                                            )}
                                        </button>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default AdminFirmaDuzenle;
