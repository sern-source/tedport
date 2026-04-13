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

    /* Enes Doğanay | 13 Nisan 2026: Debounced firma arama — 400ms bekle, en az 2 karakter */
    useEffect(() => {
        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
        if (searchTerm.trim().length < 2) { setSearchResults([]); return; }

        searchTimeoutRef.current = setTimeout(async () => {
            setSearching(true);
            const q = searchTerm.trim();
            const { data, error } = await supabase
                .from('firmalar')
                .select('firmaID, firma_adi, category_name, il_ilce, logo_url')
                .ilike('firma_adi', `%${q}%`)
                .order('firma_adi', { ascending: true })
                .limit(20);
            if (error) console.error('Firma arama hatası:', error);
            setSearchResults(data || []);
            setSearching(false);
        }, 400);

        return () => { if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current); };
    }, [searchTerm]);

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
                                        onChange={e => setSearchTerm(e.target.value)}
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

                            {searching && (
                                <div className="afd-search-status">
                                    <div className="afd-spinner afd-spinner--sm" />
                                    <span>Aranıyor...</span>
                                </div>
                            )}

                            {searchResults.length > 0 && (
                                <div className="afd-results">
                                    {searchResults.map(firma => (
                                        <button
                                            key={firma.firmaID}
                                            className="afd-result-card"
                                            onClick={() => handleSelectFirma(firma)}
                                        >
                                            <div className="afd-result-avatar">
                                                {firma.logo_url?.includes('firma-logolari') ? (
                                                    <img src={firma.logo_url} alt="" />
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
                            )}

                            {!searching && searchTerm.trim().length >= 2 && searchResults.length === 0 && (
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
                            />
                        </div>
                    )}

                </div>
            </div>
        </>
    );
};

export default AdminFirmaDuzenle;
