/* Enes Doğanay | 13 Nisan 2026: Admin — Firma Logo Yükleme sayfası */
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import SharedHeader from './SharedHeader';
import './SharedHeader.css';
import './AdminLogoUpload.css';
import { supabase } from './supabaseClient';
import { isAdminEmail } from './adminAccess';
import { resolveIsAdminUser } from './corporateApplicationsApi';

/* Enes Doğanay | 13 Nisan 2026: İzin verilen dosya tipleri ve maksimum boyut */
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'];
const MAX_SIZE = 2 * 1024 * 1024; // 2 MB

const AdminLogoUpload = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [accessDenied, setAccessDenied] = useState(false);

    /* Enes Doğanay | 13 Nisan 2026: Firma arama state'leri */
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);

    /* Enes Doğanay | 13 Nisan 2026: Seçili firma + logo yükleme state'leri */
    const [selectedFirma, setSelectedFirma] = useState(null);
    const [logoPreview, setLogoPreview] = useState('');
    const [logoFile, setLogoFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [feedback, setFeedback] = useState({ type: '', msg: '' });

    const fileInputRef = useRef(null);
    const searchTimeoutRef = useRef(null);

    /* Enes Doğanay | 13 Nisan 2026: Admin oturum kontrolü — AdminCorporateApplications ile aynı pattern */
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
            /* Enes Doğanay | 13 Nisan 2026: firma_adi ilike ile arama */
            const { data, error } = await supabase
                .from('firmalar')
                .select('firmaID, firma_adi, category_name, il_ilce, logo_url')
                .ilike('firma_adi', `%${q}%`)
                .order('firma_adi', { ascending: true })
                .limit(20);
            if (error) { console.error('Firma arama hatası:', error); }
            setSearchResults(data || []);
            setSearching(false);
        }, 400);

        return () => { if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current); };
    }, [searchTerm]);

    /* Enes Doğanay | 13 Nisan 2026: Firma seçildiğinde mevcut logosunu göster */
    const handleSelectFirma = (firma) => {
        setSelectedFirma(firma);
        setLogoPreview(firma.logo_url || '');
        setLogoFile(null);
        setFeedback({ type: '', msg: '' });
        setSearchResults([]);
        setSearchTerm('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    /* Enes Doğanay | 13 Nisan 2026: Dosya seçimi — validasyon + önizleme */
    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > MAX_SIZE) {
            setFeedback({ type: 'err', msg: 'Dosya en fazla 2 MB olabilir.' });
            return;
        }
        if (!ALLOWED_TYPES.includes(file.type)) {
            setFeedback({ type: 'err', msg: 'Yalnızca PNG, JPG, WebP veya SVG yüklenebilir.' });
            return;
        }

        setLogoFile(file);
        setLogoPreview(URL.createObjectURL(file));
        setFeedback({ type: '', msg: '' });
    };

    /* Enes Doğanay | 13 Nisan 2026: Logo yükle → Storage + DB güncelle */
    const handleUpload = async () => {
        if (!selectedFirma || !logoFile) return;
        setUploading(true);
        setFeedback({ type: '', msg: '' });

        try {
            const ext = logoFile.name.split('.').pop();
            const filePath = `logos/${selectedFirma.firmaID}_${Date.now()}.${ext}`;

            const { error: uploadError } = await supabase.storage
                .from('firma-logolari')
                .upload(filePath, logoFile, { cacheControl: '3600', upsert: true });
            if (uploadError) throw uploadError;

            const { data: publicUrlData } = supabase.storage
                .from('firma-logolari')
                .getPublicUrl(filePath);
            const publicUrl = publicUrlData?.publicUrl;
            if (!publicUrl) throw new Error('Public URL alınamadı.');

            /* Enes Doğanay | 13 Nisan 2026: RLS bypass — edge function ile admin güncellemesi */
            const { data: fnData, error: dbError } = await supabase.functions.invoke('company-management', {
                body: { action: 'admin_update_logo', firmaID: selectedFirma.firmaID, logo_url: publicUrl }
            });
            if (dbError) throw new Error(fnData?.error || dbError.message);

            setSelectedFirma(prev => ({ ...prev, logo_url: publicUrl }));
            setLogoPreview(publicUrl);
            setLogoFile(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
            setFeedback({ type: 'ok', msg: 'Logo başarıyla yüklendi ve kaydedildi!' });
        } catch (err) {
            console.error('Logo yükleme hatası:', err);
            setFeedback({ type: 'err', msg: err.message || 'Logo yüklenemedi.' });
        } finally {
            setUploading(false);
        }
    };

    /* Enes Doğanay | 13 Nisan 2026: Mevcut logoyu kaldır */
    const handleRemoveLogo = async () => {
        if (!selectedFirma) return;
        setUploading(true);
        try {
            /* Enes Doğanay | 13 Nisan 2026: RLS bypass — edge function ile admin güncellemesi */
            const { data: fnData, error } = await supabase.functions.invoke('company-management', {
                body: { action: 'admin_update_logo', firmaID: selectedFirma.firmaID, logo_url: null }
            });
            if (error) throw new Error(fnData?.error || error.message);

            setSelectedFirma(prev => ({ ...prev, logo_url: null }));
            setLogoPreview('');
            setLogoFile(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
            setFeedback({ type: 'ok', msg: 'Logo kaldırıldı.' });
        } catch (err) {
            setFeedback({ type: 'err', msg: err.message || 'Logo kaldırılamadı.' });
        } finally {
            setUploading(false);
        }
    };

    /* Enes Doğanay | 13 Nisan 2026: Seçimi temizle — başka firma seçmek için */
    const handleClearSelection = () => {
        setSelectedFirma(null);
        setLogoPreview('');
        setLogoFile(null);
        setFeedback({ type: '', msg: '' });
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    if (loading) {
        return (
            <>
                <SharedHeader navItems={[{ label: 'Anasayfa', href: '/' }, { label: 'Firmalar', href: '/firmalar' }]} />
                <div className="alu-page"><div className="alu-loading"><div className="alu-spinner" /><p>Yükleniyor...</p></div></div>
            </>
        );
    }

    if (accessDenied) {
        return (
            <>
                <SharedHeader navItems={[{ label: 'Anasayfa', href: '/' }, { label: 'Firmalar', href: '/firmalar' }]} />
                <div className="alu-page">
                    <div className="alu-denied">
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

            <div className="alu-page">
                <div className="alu-container">

                    {/* Enes Doğanay | 13 Nisan 2026: Sayfa başlığı */}
                    <div className="alu-hero">
                        <span className="material-symbols-outlined">add_photo_alternate</span>
                        <div>
                            <h1>Firma Logo Yükleme</h1>
                            <p>Firma arayın, seçin ve logo yükleyin. Logo anında firmalar listesinde görüntülenir.</p>
                        </div>
                    </div>

                    {/* Enes Doğanay | 13 Nisan 2026: Firma arama alanı */}
                    {!selectedFirma && (
                        <div className="alu-search-section">
                            <div className="alu-search-bar">
                                <span className="material-symbols-outlined">search</span>
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    placeholder="Firma adı veya ID ile arayın..."
                                    autoFocus
                                />
                                {searchTerm && (
                                    <button className="alu-search-clear" onClick={() => { setSearchTerm(''); setSearchResults([]); }}>
                                        <span className="material-symbols-outlined">close</span>
                                    </button>
                                )}
                            </div>

                            {searching && (
                                <div className="alu-search-status">
                                    <div className="alu-spinner alu-spinner--sm" />
                                    <span>Aranıyor...</span>
                                </div>
                            )}

                            {searchResults.length > 0 && (
                                <div className="alu-results">
                                    {searchResults.map(firma => (
                                        <button
                                            key={firma.firmaID}
                                            className="alu-result-card"
                                            onClick={() => handleSelectFirma(firma)}
                                        >
                                            <div className="alu-result-avatar">
                                                {firma.logo_url?.includes('firma-logolari') ? (
                                                    <img src={firma.logo_url} alt="" />
                                                ) : (
                                                    <span>{(firma.firma_adi || 'F').charAt(0).toUpperCase()}</span>
                                                )}
                                            </div>
                                            <div className="alu-result-info">
                                                <strong>{firma.firma_adi}</strong>
                                                <small>{firma.category_name || 'Kategori yok'} • {firma.il_ilce || 'Konum yok'}</small>
                                            </div>
                                            <div className="alu-result-id">#{firma.firmaID}</div>
                                            {firma.logo_url?.includes('firma-logolari') && (
                                                <span className="alu-result-has-logo" title="Logo mevcut">
                                                    <span className="material-symbols-outlined">check_circle</span>
                                                </span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {!searching && searchTerm.trim().length >= 2 && searchResults.length === 0 && (
                                <div className="alu-no-result">
                                    <span className="material-symbols-outlined">search_off</span>
                                    <p>"{searchTerm}" için firma bulunamadı.</p>
                                </div>
                            )}

                            {searchTerm.trim().length < 2 && searchResults.length === 0 && (
                                <div className="alu-hint">
                                    <span className="material-symbols-outlined">info</span>
                                    <p>Aramaya başlamak için en az 2 karakter girin.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Enes Doğanay | 13 Nisan 2026: Seçili firma — logo yükleme alanı */}
                    {selectedFirma && (
                        <div className="alu-upload-section">
                            <div className="alu-selected-header">
                                <div className="alu-selected-info">
                                    <h2>{selectedFirma.firma_adi}</h2>
                                    <p>{selectedFirma.category_name || 'Kategori yok'} • {selectedFirma.il_ilce || 'Konum yok'} • <span className="alu-id">#{selectedFirma.firmaID}</span></p>
                                </div>
                                <button className="alu-btn alu-btn--ghost" onClick={handleClearSelection}>
                                    <span className="material-symbols-outlined">arrow_back</span>
                                    Başka Firma Seç
                                </button>
                            </div>

                            <div className="alu-upload-area">
                                {/* Enes Doğanay | 13 Nisan 2026: Logo önizleme */}
                                <div className="alu-preview">
                                    {logoPreview ? (
                                        <img src={logoPreview} alt="Logo önizleme" />
                                    ) : (
                                        <div className="alu-preview-placeholder">
                                            <span className="material-symbols-outlined">image</span>
                                            <span>Logo yok</span>
                                        </div>
                                    )}
                                </div>

                                {/* Enes Doğanay | 13 Nisan 2026: Yükleme kontrolleri */}
                                <div className="alu-upload-controls">
                                    <label className="alu-btn alu-btn--primary">
                                        <span className="material-symbols-outlined">upload</span>
                                        {logoFile ? 'Dosya Değiştir' : 'Logo Seç'}
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/png,image/jpeg,image/webp,image/svg+xml"
                                            onChange={handleFileChange}
                                            hidden
                                        />
                                    </label>

                                    {logoFile && (
                                        <div className="alu-file-info">
                                            <span className="material-symbols-outlined">description</span>
                                            <span>{logoFile.name}</span>
                                            <small>({(logoFile.size / 1024).toFixed(0)} KB)</small>
                                        </div>
                                    )}

                                    <p className="alu-upload-hint">PNG, JPG, WebP veya SVG — maks. 2 MB</p>

                                    <div className="alu-action-row">
                                        <button
                                            className="alu-btn alu-btn--save"
                                            onClick={handleUpload}
                                            disabled={!logoFile || uploading}
                                        >
                                            <span className="material-symbols-outlined">{uploading ? 'progress_activity' : 'save'}</span>
                                            {uploading ? 'Yükleniyor...' : 'Kaydet'}
                                        </button>

                                        {selectedFirma.logo_url && (
                                            <button
                                                className="alu-btn alu-btn--danger"
                                                onClick={handleRemoveLogo}
                                                disabled={uploading}
                                            >
                                                <span className="material-symbols-outlined">delete</span>
                                                Logoyu Kaldır
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Enes Doğanay | 13 Nisan 2026: Geri bildirim mesajı */}
                            {feedback.msg && (
                                <div className={`alu-feedback alu-feedback--${feedback.type}`}>
                                    <span className="material-symbols-outlined">
                                        {feedback.type === 'ok' ? 'check_circle' : 'error'}
                                    </span>
                                    <span>{feedback.msg}</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default AdminLogoUpload;
