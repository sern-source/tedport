// Enes Doğanay | 6 Nisan 2026: Firma yönetim paneli — public FirmaDetay görünümüyle birebir örtüşen hiyerarşik editör
// Enes Doğanay | 6 Nisan 2026: ana_sektor/firma_turu kaldırıldı, logo localden yükleniyor, ilçeler turkeyDistricts.js'den geliyor
import React, { useEffect, useMemo, useRef, useState } from 'react';
import './CompanyManagementPanel.css';
import { supabase } from './supabaseClient';
import { updateManagedCompany } from './companyManagementApi';
import { TURKEY_DISTRICTS } from './turkeyDistricts';
import CitySelect from './CitySelect'; // Enes Doğanay | 13 Nisan 2026: Aranabilir şehir/ilçe seçici

const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2)}`;

// ── serileştirme / geri okuma ──────────────────────────────────────────────
const parseCatalog = (raw) => {
    if (!raw) return [];
    let p = raw;
    if (typeof raw === 'string') { try { p = JSON.parse(raw); } catch { return []; } }
    if (!Array.isArray(p)) return [];
    return p.map(cat => ({
        id: uid(),
        name: cat?.ana_kategori || '',
        subs: (Array.isArray(cat?.alt_kategoriler) ? cat.alt_kategoriler : []).map(sub => ({
            id: uid(),
            name: sub?.baslik || '',
            products: (Array.isArray(sub?.urunler) ? sub.urunler : []).map(u => ({ id: uid(), name: String(u || '') }))
        }))
    }));
};

const serializeCatalog = (cats) =>
    cats
        .filter(c => c.name.trim() || c.subs.some(s => s.name.trim()))
        .map(c => ({
            ana_kategori: c.name.trim(),
            alt_kategoriler: c.subs
                .filter(s => s.name.trim() || s.products.some(p => p.name.trim()))
                .map(s => ({
                    baslik: s.name.trim(),
                    urunler: s.products.map(p => p.name.trim()).filter(Boolean)
                }))
        }));

const parseLocation = (val) => {
    const s = String(val || '').trim();
    if (!s) return { city: '', district: '' };
    if (s.includes('/')) { const [d, c] = s.split('/').map(x => x.trim()); return { district: d, city: c }; }
    if (s.includes(',')) { const [d, c] = s.split(',').map(x => x.trim()); return { district: d, city: c }; }
    return { city: s, district: '' };
};

const buildLocation = ({ city, district }) => {
    const c = String(city || '').trim();
    const d = String(district || '').trim();
    return (d && c) ? `${d}/${c}` : (c || d);
};

const mapCat = (cats, cid, fn) => cats.map(c => c.id === cid ? fn(c) : c);
const mapSub = (cats, cid, sid, fn) => mapCat(cats, cid, c => ({ ...c, subs: c.subs.map(s => s.id === sid ? fn(s) : s) }));

// Enes Doğanay | 6 Nisan 2026: İl listesi turkeyDistricts objesinin key'lerinden alınır (sehirler tablosuna gerek kalmaz)
// Enes Doğanay | 13 Nisan 2026: İstanbul, Ankara, Kocaeli önce, geri kalanı alfabetik
const PRIORITY_CITIES = ['İstanbul', 'Ankara', 'Kocaeli'];
const allCityKeys = Object.keys(TURKEY_DISTRICTS);
const ALL_CITIES = [
    ...PRIORITY_CITIES.filter(c => allCityKeys.includes(c)),
    ...allCityKeys.filter(c => !PRIORITY_CITIES.includes(c)).sort((a, b) => a.localeCompare(b, 'tr'))
];

// ── bileşen ───────────────────────────────────────────────────────────────
/* Enes Doğanay | 13 Nisan 2026: onSave prop — admin modu, isNew — yeni firma ekleme, onDelete — firma silme */
const CompanyManagementPanel = ({ company, onCompanyUpdated, onSave, isNew, onDelete }) => {
    const parsedLoc = useMemo(() => parseLocation(company?.il_ilce), [company?.il_ilce]);

    const [fields, setFields] = useState({
        firma_adi: '', category_name: '', city: '', district: '',
        web_sitesi: '', telefon: '', eposta: '', logo_url: '',
        latitude: '', longitude: '', adres: '', description: ''
    });
    const [catalog, setCatalog] = useState([]);
    const [productDraft, setProductDraft] = useState({});
    const [saving, setSaving] = useState(false);
    const [feedback, setFeedback] = useState({ type: '', msg: '' });
    /* Enes Doğanay | 13 Nisan 2026: Başarılı kaydetme modalı */
    const [showSaveSuccess, setShowSaveSuccess] = useState(false);
    /* Enes Doğanay | 13 Nisan 2026: Orijinal değerleri sakla — dirty detection için */
    const originalFieldsRef = useRef(null);
    const originalCatalogRef = useRef(null);
    // Enes Doğanay | 6 Nisan 2026: Logo dosyası localden yükleme state'leri
    const [logoUploading, setLogoUploading] = useState(false);
    const [logoPreview, setLogoPreview] = useState('');
    /* Enes Doğanay | 13 Nisan 2026: Firma silme onay modalı + siliniyor state'i */
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleting, setDeleting] = useState(false);

    // şirket verisi ile formu doldur
    useEffect(() => {
        if (!company) return;
        setFields({
            firma_adi: company.firma_adi || '',
            category_name: company.category_name || '',
            city: parsedLoc.city,
            district: parsedLoc.district,
            web_sitesi: company.web_sitesi || '',
            telefon: company.telefon || '',
            eposta: company.eposta || '',
            logo_url: company.logo_url || '',
            latitude: company.latitude ?? '',
            longitude: company.longitude ?? '',
            adres: company.adres || '',
            description: company.description || ''
        });
        setLogoPreview(company.logo_url || '');
        const parsedCat = parseCatalog(company.urun_kategorileri);
        setCatalog(parsedCat);
        /* Enes Doğanay | 13 Nisan 2026: Orijinal snapshot'ları kaydet */
        originalFieldsRef.current = JSON.stringify({
            firma_adi: company.firma_adi || '',
            category_name: company.category_name || '',
            city: parsedLoc.city,
            district: parsedLoc.district,
            web_sitesi: company.web_sitesi || '',
            telefon: company.telefon || '',
            eposta: company.eposta || '',
            logo_url: company.logo_url || '',
            latitude: company.latitude ?? '',
            longitude: company.longitude ?? '',
            adres: company.adres || '',
            description: company.description || ''
        });
        originalCatalogRef.current = JSON.stringify(serializeCatalog(parsedCat));
    }, [company, parsedLoc.city, parsedLoc.district]);

    /* Enes Doğanay | 13 Nisan 2026: Değişiklik var mı kontrolü — isNew modunda firma adı doluysa aktif */
    const isDirty = useMemo(() => {
        if (isNew) return fields.firma_adi.trim().length > 0;
        if (!originalFieldsRef.current) return false;
        const currentFields = JSON.stringify(fields);
        const currentCatalog = JSON.stringify(serializeCatalog(catalog));
        return currentFields !== originalFieldsRef.current || currentCatalog !== originalCatalogRef.current;
    }, [fields, catalog]);

    // alan değiştiriciler
    const set = (k, v) => setFields(p => ({ ...p, [k]: v }));
    const setCity = city => setFields(p => ({
        ...p, city,
        district: (TURKEY_DISTRICTS[city] || []).includes(p.district) ? p.district : ''
    }));

    // Enes Doğanay | 6 Nisan 2026: Logo dosyası seçilince Supabase Storage'a yüklenir ve logo_url güncellenir
    const handleLogoUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const maxSize = 2 * 1024 * 1024; // 2 MB
        if (file.size > maxSize) {
            setFeedback({ type: 'err', msg: 'Logo dosyası en fazla 2 MB olabilir.' });
            return;
        }

        const allowedTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'];
        if (!allowedTypes.includes(file.type)) {
            setFeedback({ type: 'err', msg: 'Yalnızca PNG, JPG, WebP veya SVG yüklenebilir.' });
            return;
        }

        setLogoUploading(true);
        setFeedback({ type: '', msg: '' });

        try {
            const ext = file.name.split('.').pop();
            const filePath = `logos/${company.firmaID || 'temp'}_${Date.now()}.${ext}`;

            const { error: uploadError } = await supabase.storage
                .from('firma-logolari')
                .upload(filePath, file, { cacheControl: '3600', upsert: true });

            if (uploadError) throw uploadError;

            const { data: publicUrlData } = supabase.storage
                .from('firma-logolari')
                .getPublicUrl(filePath);

            const publicUrl = publicUrlData?.publicUrl;
            if (!publicUrl) throw new Error('Public URL alınamadı.');

            set('logo_url', publicUrl);
            setLogoPreview(publicUrl);
            setFeedback({ type: 'ok', msg: 'Logo yüklendi! Kaydetmeyi unutmayın.' });
        } catch (err) {
            console.error('Logo yükleme hatası:', err);
            setFeedback({ type: 'err', msg: err.message || 'Logo yüklenemedi.' });
        } finally {
            setLogoUploading(false);
        }
    };

    // katalog değiştiriciler
    const addCategory = () => setCatalog(p => [...p, { id: uid(), name: '', subs: [] }]);
    const removeCategory = cid => setCatalog(p => p.filter(c => c.id !== cid));
    const setCatName = (cid, v) => setCatalog(p => mapCat(p, cid, c => ({ ...c, name: v })));
    const addSub = cid => setCatalog(p => mapCat(p, cid, c => ({ ...c, subs: [...c.subs, { id: uid(), name: '', products: [] }] })));
    const removeSub = (cid, sid) => setCatalog(p => mapCat(p, cid, c => ({ ...c, subs: c.subs.filter(s => s.id !== sid) })));
    const setSubName = (cid, sid, v) => setCatalog(p => mapSub(p, cid, sid, s => ({ ...s, name: v })));
    const addProduct = (cid, sid, name) => {
        const t = String(name || '').trim();
        if (!t) return;
        setCatalog(p => mapSub(p, cid, sid, s => ({ ...s, products: [...s.products, { id: uid(), name: t }] })));
        setProductDraft(p => ({ ...p, [sid]: '' }));
    };
    const removeProduct = (cid, sid, pid) => setCatalog(p => mapSub(p, cid, sid, s => ({ ...s, products: s.products.filter(pr => pr.id !== pid) })));

    const handleProductKeyDown = (e, cid, sid) => {
        if (e.key === 'Enter') { e.preventDefault(); addProduct(cid, sid, productDraft[sid]); }
    };

    // Enes Doğanay | 6 Nisan 2026: banner kaldırıldı
    const districtOptions = TURKEY_DISTRICTS[fields.city] || [];

    // Enes Doğanay | 7 Nisan 2026: form yerine div kullanıldığı için event parametresi kaldırıldı
    const handleSubmit = async () => {
        setSaving(true);
        setFeedback({ type: '', msg: '' });
        try {
            const companyPayload = {
                firma_adi: fields.firma_adi,
                category_name: fields.category_name,
                il_ilce: buildLocation({ city: fields.city, district: fields.district }),
                web_sitesi: fields.web_sitesi,
                telefon: fields.telefon,
                eposta: fields.eposta,
                logo_url: fields.logo_url,
                latitude: fields.latitude === '' ? null : Number(fields.latitude),
                longitude: fields.longitude === '' ? null : Number(fields.longitude),
                adres: fields.adres,
                description: fields.description,
                urun_kategorileri: serializeCatalog(catalog)
            };
            /* Enes Doğanay | 13 Nisan 2026: onSave varsa admin modu — yoksa normal kurumsal güncelleme */
            const result = onSave ? await onSave(companyPayload) : await updateManagedCompany(companyPayload);
            setFeedback({ type: '', msg: '' });
            /* Enes Doğanay | 13 Nisan 2026: Kayıt sonrası orijinal snapshot'ları güncelle */
            originalFieldsRef.current = JSON.stringify(fields);
            originalCatalogRef.current = JSON.stringify(serializeCatalog(catalog));
            setShowSaveSuccess(true);
            setTimeout(() => setShowSaveSuccess(false), 5000);
            if (result.company && onCompanyUpdated) onCompanyUpdated(result.company);
        } catch (err) {
            setFeedback({ type: 'err', msg: err.message || 'Kaydedilemedi, lütfen tekrar deneyin.' });
        } finally {
            setSaving(false);
        }
    };

    return (
        <section className="cmp-workspace">

            {/* Enes Doğanay | 7 Nisan 2026: form yerine div kullanıldı, Chrome adres kaydetme popup'ını tamamen engellemek için */}
            <div className="cmp-form">

                {/* Genel Bilgiler */}
                <div className="cmp-card">
                    <div className="cmp-card__head">
                        <span className="material-symbols-outlined">apartment</span>
                        <div>
                            <h3>Genel Firma Bilgileri</h3>
                            <p>Firmalar listesinde ve detay sayfası başlığında görünen kimlik bilgileri.</p>
                        </div>
                    </div>
                    <div className="cmp-grid cmp-grid--3">
                        <label className="cmp-field">
                            <span>Firma Adı *</span>
                            <input type="text" value={fields.firma_adi} onChange={e => set('firma_adi', e.target.value)} required placeholder="Örn. ABC Makine San. A.Ş." />
                        </label>
                        {/* Enes Doğanay | 11 Nisan 2026: "Sektör / Kategori" → "Ana Sektör" olarak değiştirildi */}
                        <label className="cmp-field">
                            <span>Ana Sektör</span>
                            <input type="text" value={fields.category_name} onChange={e => set('category_name', e.target.value)} placeholder="Örn. Boru ve Profil Üreticisi" />
                        </label>
                        <label className="cmp-field">
                            <span>Web Sitesi</span>
                            <input type="text" value={fields.web_sitesi} onChange={e => set('web_sitesi', e.target.value)} placeholder="www.ornekfirma.com" />
                        </label>
                    </div>

                    {/* Enes Doğanay | 6 Nisan 2026: Logo artık localden dosya seçilerek yükleniyor */}
                    <div className="cmp-logo-upload">
                        <div className="cmp-logo-upload__preview">
                            {logoPreview ? (
                                <img src={logoPreview} alt="Firma logosu" />
                            ) : (
                                <div className="cmp-logo-upload__placeholder">
                                    <span className="material-symbols-outlined">image</span>
                                </div>
                            )}
                        </div>
                        <div className="cmp-logo-upload__info">
                            <strong>Firma Logosu</strong>
                            <p>PNG, JPG, WebP veya SVG — maks. 2 MB.</p>
                            <label className="cmp-btn cmp-btn--ghost cmp-btn--sm cmp-logo-upload__btn">
                                <span className="material-symbols-outlined">upload</span>
                                {logoUploading ? 'Yükleniyor…' : 'Fotoğraf Seç'}
                                <input
                                    type="file"
                                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                                    onChange={handleLogoUpload}
                                    disabled={logoUploading}
                                    hidden
                                />
                            </label>
                        </div>
                    </div>
                </div>

                {/* İletişim + Konum */}
                <div className="cmp-card">
                    <div className="cmp-card__head">
                        <span className="material-symbols-outlined">location_on</span>
                        <div>
                            <h3>İletişim ve Konum</h3>
                        </div>
                    </div>
                    <div className="cmp-grid cmp-grid--3">
                        <label className="cmp-field">
                            <span>Telefon</span>
                            <input type="text" name="cmp_t_x" value={fields.telefon} onChange={e => set('telefon', e.target.value)} placeholder="0 (5XX) XXX XX XX" autoComplete="one-time-code" />
                        </label>
                        <label className="cmp-field">
                            <span>E-posta</span>
                            <input type="text" name="cmp_e_x" value={fields.eposta} onChange={e => set('eposta', e.target.value)} placeholder="iletisim@firma.com" autoComplete="one-time-code" />
                        </label>
                        {/* Enes Doğanay | 13 Nisan 2026: Native select yerine CitySelect — aranabilir dropdown */}
                        <div className="cmp-field">
                            <span>İl</span>
                            <CitySelect value={fields.city} onChange={val => setCity(val)} options={ALL_CITIES} placeholder="İl seçin" />
                        </div>
                        <div className="cmp-field">
                            <span>İlçe</span>
                            <CitySelect value={fields.district} onChange={val => set('district', val)} options={districtOptions} placeholder={fields.city ? 'İlçe seçin' : 'Önce il seçin'} />
                        </div>
                        <label className="cmp-field cmp-field--span2">
                            <span>Açık Adres</span>
                            <input type="text" name="cmp_a_x" value={fields.adres} onChange={e => set('adres', e.target.value)} placeholder="Cadde, sokak, bina no, kat / daire" autoComplete="one-time-code" />
                        </label>
                    </div>
                </div>

                {/* Şirket Hakkında */}
                <div className="cmp-card">
                    <div className="cmp-card__head">
                        <span className="material-symbols-outlined">description</span>
                        <div>
                            <h3>Şirket Hakkında</h3>
                            <p>Detay sayfasının "Şirket Hakkında" bölümünde görünür. Tarihçe, kapasite ve güçlü yönleri yazın.</p>
                        </div>
                    </div>
                    <label className="cmp-field">
                        <span>Açıklama</span>
                        <textarea
                            rows={6}
                            value={fields.description}
                            onChange={e => set('description', e.target.value)}
                            placeholder="Örn: 1992 yılında kurulan firmamız, X sektöründe yurt içi ve yurt dışı pazarlara hizmet vermektedir…"
                        />
                    </label>
                </div>

                {/* Ürün Kataloğu */}
                <div className="cmp-card">
                    <div className="cmp-card__head">
                        <span className="material-symbols-outlined">category</span>
                        <div>
                            <h3>Ürün Kataloğu</h3>
                            <p>
                                Aşağısı, firma detay sayfasındaki accordion yapısıyla <strong>birebir aynıdır</strong>.
                                Her kategori bir accordion başlığı, alt kategoriler kendi içinde, ürünler ise etiket (pill) olarak görünür.
                            </p>
                        </div>
                        <button type="button" className="cmp-btn cmp-btn--add-category" onClick={addCategory}>
                            <span className="material-symbols-outlined">add_circle</span>
                            Kategori Ekle
                        </button>
                    </div>

                    <div className="cmp-catalog">
                        {catalog.length === 0 && (
                            <div className="cmp-catalog__empty">
                                <span className="material-symbols-outlined">inventory_2</span>
                                <strong>Henüz ürün kategorisi yok</strong>
                                <p>Yukarıdaki "Kategori Ekle" ile ürün hiyerarşinizi oluşturun.</p>
                            </div>
                        )}

                        {catalog.map((cat, catIdx) => (
                            <div key={cat.id} className="cmp-cat-card">
                                <div className="cmp-cat-header">
                                    <span className="cmp-cat-chevron">▼</span>
                                    <input
                                        className="cmp-cat-name"
                                        type="text"
                                        value={cat.name}
                                        onChange={e => setCatName(cat.id, e.target.value)}
                                        placeholder={`Kategori ${catIdx + 1} adı (örn. Demir-Çelik Ürünler)`}
                                    />
                                    <div className="cmp-cat-header__btns">
                                        <button type="button" className="cmp-btn cmp-btn--ghost cmp-btn--sm" onClick={() => addSub(cat.id)}>
                                            <span className="material-symbols-outlined">add</span>
                                            Alt Kategori
                                        </button>
                                        <button type="button" className="cmp-btn cmp-btn--danger cmp-btn--icon" onClick={() => removeCategory(cat.id)} title="Kategoriyi Sil">
                                            <span className="material-symbols-outlined">delete</span>
                                        </button>
                                    </div>
                                </div>

                                {cat.subs.length > 0 && (
                                    <div className="cmp-cat-content">
                                        {cat.subs.map((sub, subIdx) => (
                                            <div key={sub.id} className="cmp-sub">
                                                <div className="cmp-sub-header">
                                                    <span className="cmp-sub-bullet">•</span>
                                                    <input
                                                        className="cmp-sub-name"
                                                        type="text"
                                                        value={sub.name}
                                                        onChange={e => setSubName(cat.id, sub.id, e.target.value)}
                                                        placeholder={`Alt kategori ${subIdx + 1} adı (örn. Boru Ürünleri)`}
                                                    />
                                                    <button type="button" className="cmp-btn cmp-btn--danger cmp-btn--icon cmp-btn--sm" onClick={() => removeSub(cat.id, sub.id)} title="Alt Kategoriyi Sil">
                                                        <span className="material-symbols-outlined">close</span>
                                                    </button>
                                                </div>

                                                <div className="cmp-products-wrap">
                                                    {sub.products.map(prod => (
                                                        <span key={prod.id} className="cmp-pill">
                                                            {prod.name}
                                                            <button type="button" className="cmp-pill__x" onClick={() => removeProduct(cat.id, sub.id, prod.id)} title="Ürünü Kaldır">×</button>
                                                        </span>
                                                    ))}

                                                    <label className="cmp-pill-add">
                                                        <input
                                                            type="text"
                                                            className="cmp-pill-add__input"
                                                            value={productDraft[sub.id] || ''}
                                                            onChange={e => setProductDraft(p => ({ ...p, [sub.id]: e.target.value }))}
                                                            onKeyDown={e => handleProductKeyDown(e, cat.id, sub.id)}
                                                            placeholder="Ürün adı yaz, Enter ile ekle"
                                                        />
                                                        <button
                                                            type="button"
                                                            className="cmp-pill-add__btn"
                                                            onClick={() => addProduct(cat.id, sub.id, productDraft[sub.id])}
                                                            disabled={!(productDraft[sub.id] || '').trim()}
                                                        >
                                                            <span className="material-symbols-outlined">add</span>
                                                        </button>
                                                    </label>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {cat.subs.length === 0 && (
                                    <div className="cmp-cat-empty">
                                        Alt kategori ekleyerek bu kategorinin içini doldurun.
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Enes Doğanay | 13 Nisan 2026: Hata mesajı inline kalır */}
                {feedback.msg && feedback.type === 'err' && (
                    <div className="cmp-feedback cmp-feedback--err">
                        <span className="material-symbols-outlined">error</span>
                        {feedback.msg}
                    </div>
                )}

                {/* Enes Doğanay | 13 Nisan 2026: Hint metni güncellendi, buton dirty olmadan deaktif */}
                <div className="cmp-actions">
                    <p className="cmp-actions__hint">{isNew ? 'Tüm bilgileri doldurduktan sonra firmayı ekleyebilirsiniz.' : 'Değişiklikler kaydedildikten hemen sonra firma bilgileriniz güncellenecektir.'}</p>
                    <div className="cmp-actions__buttons">
                        <button type="button" className="cmp-btn cmp-btn--save" disabled={saving || !isDirty} onClick={handleSubmit}>
                            <span className="material-symbols-outlined">{saving ? 'progress_activity' : isNew ? 'add_business' : 'save'}</span>
                            {saving ? 'Kaydediliyor…' : isNew ? 'Firmayı Ekle' : 'Değişiklikleri Kaydet'}
                        </button>
                        {/* Enes Doğanay | 13 Nisan 2026: Admin firma silme butonu — onDelete varsa göster */}
                        {onDelete && !isNew && (
                            <button type="button" className="cmp-btn cmp-btn--delete" disabled={saving || deleting} onClick={() => setShowDeleteConfirm(true)}>
                                <span className="material-symbols-outlined">delete_forever</span>
                                {deleting ? 'Siliniyor…' : 'Firmayı Sil'}
                            </button>
                        )}
                    </div>
                </div>

            </div>

            {/* Enes Doğanay | 13 Nisan 2026: Firma silme onay modal popup */}
            {showDeleteConfirm && (
                <div className="cmp-success-overlay" onClick={() => setShowDeleteConfirm(false)}>
                    <div className="cmp-success-card cmp-delete-card" onClick={e => e.stopPropagation()}>
                        <div className="cmp-success-card__icon cmp-delete-card__icon">
                            <span className="material-symbols-outlined">warning</span>
                        </div>
                        <h3>Firmayı Sil</h3>
                        <p>Bu firma ve ilişkili tüm veriler kalıcı olarak silinecektir. Bu işlem geri alınamaz.</p>
                        <p className="cmp-delete-card__name">{fields.firma_adi}</p>
                        <div className="cmp-delete-card__actions">
                            <button className="cmp-btn cmp-btn--ghost-modal" onClick={() => setShowDeleteConfirm(false)} disabled={deleting}>Vazgeç</button>
                            <button className="cmp-btn cmp-btn--delete" disabled={deleting} onClick={async () => {
                                setDeleting(true);
                                try {
                                    await onDelete();
                                    setShowDeleteConfirm(false);
                                } catch (err) {
                                    setFeedback({ type: 'err', msg: err.message || 'Firma silinemedi.' });
                                    setShowDeleteConfirm(false);
                                } finally {
                                    setDeleting(false);
                                }
                            }}>
                                <span className="material-symbols-outlined">{deleting ? 'progress_activity' : 'delete_forever'}</span>
                                {deleting ? 'Siliniyor…' : 'Evet, Sil'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Enes Doğanay | 13 Nisan 2026: Başarılı kaydetme modal popup */}
            {showSaveSuccess && (
                <div className="cmp-success-overlay" onClick={() => setShowSaveSuccess(false)}>
                    <div className="cmp-success-card" onClick={e => e.stopPropagation()}>
                        <div className="cmp-success-card__icon">
                            <span className="material-symbols-outlined">check_circle</span>
                        </div>
                        <h3>Değişiklikler Kaydedildi!</h3>
                        <p>Firma bilgileriniz başarıyla güncellendi.</p>
                        <button className="cmp-success-card__btn" onClick={() => setShowSaveSuccess(false)}>Tamam</button>
                    </div>
                </div>
            )}
        </section>
    );
};

export default CompanyManagementPanel;
