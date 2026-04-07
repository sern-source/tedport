import React, { useEffect, useCallback, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './Ihaleler.css';
import './SharedHeader.css';
import SharedHeader from './SharedHeader';
import { supabase } from './supabaseClient';
import { formatTenderBudget, formatTenderDate, getTenderStatusMeta } from './tenderUtils';
// Enes Doğanay | 6 Nisan 2026: Kurumsal giriş için ihale CRUD API'si eklendi
import { getManagedCompanyId } from './companyManagementApi';
import { listMyTenders, createTender, updateTender, deleteTender } from './ihaleManagementApi';

// Enes Doğanay | 6 Nisan 2026: Ihale tablosu henuz kurulmamissa ekran kirilmasin diye iliski hatasi yumusatilir
const isMissingRelationError = (error) => error?.code === '42P01' || error?.message?.toLowerCase().includes('relation');

const EMPTY_FORM = {
    baslik: '', aciklama: '', kategori: '', ihale_tipi: '',
    butce_notu: '', yayin_tarihi: '', son_basvuru_tarihi: '',
    durum: 'canli', basvuru_email: '', referans_no: '', il_ilce: ''
};

const IhalelerPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const firmaFilter = searchParams.get('firma') || '';

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

    // Kurumsal giriş kontrolü
    useEffect(() => {
        getManagedCompanyId().then(id => setManagedFirmaId(id || null));
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

    const openCreate = () => {
        setEditingTender(null);
        setForm(EMPTY_FORM);
        setFormError('');
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
        setForm({
            baslik: tender.baslik || '',
            aciklama: tender.aciklama || '',
            kategori: tender.kategori || '',
            ihale_tipi: tender.ihale_tipi || '',
            butce_notu: tender.butce_notu || '',
            yayin_tarihi: toDateInput(tender.yayin_tarihi),
            son_basvuru_tarihi: toDateInput(tender.son_basvuru_tarihi),
            durum: tender.durum || 'canli',
            basvuru_email: tender.basvuru_email || '',
            referans_no: tender.referans_no || '',
            il_ilce: tender.il_ilce || '',
        });
        setFormError('');
        setShowModal(true);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setFormSaving(true);
        setFormError('');
        try {
            if (editingTender) {
                await updateTender(editingTender.id, form);
            } else {
                await createTender(form);
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

    return (
        <div className="tenders-page">
            <SharedHeader />

            <main className="tenders-page-main">

                {/* ── Enes Doğanay | 6 Nisan 2026: Kurumsal kullanıcıya özel ihale yönetim paneli ── */}
                {managedFirmaId && (
                    <section className="my-tenders-panel">
                        <div className="my-tenders-panel__head">
                            <div>
                                <h2><span className="material-symbols-outlined">gavel</span> Benim İhalelerim</h2>
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

                {/* ── Modal: İhale Oluştur / Düzenle ── */}
                {showModal && (
                    <div className="ihale-modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
                        <div className="ihale-modal">
                            <div className="ihale-modal__head">
                                <h3>{editingTender ? 'İhaleyi Düzenle' : 'Yeni İhale Oluştur'}</h3>
                                <button type="button" className="ihale-modal__close" onClick={() => setShowModal(false)}>
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>
                            <form className="ihale-modal__form" onSubmit={handleFormSubmit}>
                                <label className="ihale-field">
                                    <span>Başlık *</span>
                                    <input type="text" required value={form.baslik} onChange={e => setForm(p => ({ ...p, baslik: e.target.value }))} placeholder="Örn. Çelik Boru Alım İhalesi" />
                                </label>
                                <label className="ihale-field ihale-field--full">
                                    <span>Açıklama</span>
                                    <textarea rows={3} value={form.aciklama} onChange={e => setForm(p => ({ ...p, aciklama: e.target.value }))} placeholder="İhale kapsamı, teknik gereksinimler…" />
                                </label>
                                <div className="ihale-modal__grid">
                                    <label className="ihale-field">
                                        <span>Kategori</span>
                                        <input type="text" value={form.kategori} onChange={e => setForm(p => ({ ...p, kategori: e.target.value }))} placeholder="Örn. Metal, İnşaat…" />
                                    </label>
                                    <label className="ihale-field">
                                        <span>İhale Tipi</span>
                                        <select value={form.ihale_tipi} onChange={e => setForm(p => ({ ...p, ihale_tipi: e.target.value }))}>
                                            <option value="">Seçin</option>
                                            <option>Açık İhale</option>
                                            <option>Davetli İhale</option>
                                            <option>Pazarlık Usulü</option>
                                        </select>
                                    </label>
                                    <label className="ihale-field">
                                        <span>Bütçe Notu</span>
                                        <input type="text" value={form.butce_notu} onChange={e => setForm(p => ({ ...p, butce_notu: e.target.value }))} placeholder="Örn. 100.000 - 250.000 TL" />
                                    </label>
                                    <label className="ihale-field">
                                        <span>Durum</span>
                                        <select value={form.durum} onChange={e => setForm(p => ({ ...p, durum: e.target.value }))}>
                                            <option value="canli">Canlı</option>
                                            <option value="draft">Taslak</option>
                                            <option value="kapali">Kapalı</option>
                                        </select>
                                    </label>
                                    <label className="ihale-field">
                                        <span>Yayın Tarihi</span>
                                        <input type="date" value={form.yayin_tarihi} onChange={e => setForm(p => ({ ...p, yayin_tarihi: e.target.value }))} />
                                    </label>
                                    <label className="ihale-field">
                                        <span>Son Başvuru Tarihi</span>
                                        <input type="date" value={form.son_basvuru_tarihi} onChange={e => setForm(p => ({ ...p, son_basvuru_tarihi: e.target.value }))} />
                                    </label>
                                    <label className="ihale-field">
                                        <span>Başvuru E-postası</span>
                                        <input type="email" value={form.basvuru_email} onChange={e => setForm(p => ({ ...p, basvuru_email: e.target.value }))} placeholder="ihale@firma.com" />
                                    </label>
                                    <label className="ihale-field">
                                        <span>Referans No</span>
                                        <input type="text" value={form.referans_no} onChange={e => setForm(p => ({ ...p, referans_no: e.target.value }))} placeholder="Örn. TDP-2026-001" />
                                    </label>
                                    <label className="ihale-field">
                                        <span>İl / İlçe</span>
                                        <input type="text" value={form.il_ilce} onChange={e => setForm(p => ({ ...p, il_ilce: e.target.value }))} placeholder="Örn. İstanbul / Kadıköy" />
                                    </label>
                                </div>
                                {formError && <p className="ihale-form-error">{formError}</p>}
                                <div className="ihale-modal__footer">
                                    <button type="button" className="ihale-btn-cancel" onClick={() => setShowModal(false)}>İptal</button>
                                    <button type="submit" className="ihale-btn-save" disabled={formSaving}>
                                        {formSaving ? 'Kaydediliyor…' : (editingTender ? 'Güncelle' : 'Yayınla')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                <section className="tenders-hero">
                    <div className="tenders-hero-copy">
                        <h1>{selectedFirmaName ? `${selectedFirmaName} İhaleleri` : 'İhaleler'}</h1>
                        <p>
                            {selectedFirmaName
                                ? 'Bu firmaya ait aktif, yaklaşan ve kapanmış ihaleleri tek ekranda takip edin.'
                                : 'Tedport üzerindeki canlı satın alma fırsatlarını, yaklaşan talepleri ve kapanmış ihaleleri tek merkezden inceleyin.'}
                        </p>
                    </div>

                    <div className="tenders-stats-grid">
                        <article className="tenders-stat-card tenders-stat-card-live">
                            <span className="material-symbols-outlined">bolt</span>
                            <strong>{liveCount}</strong>
                            <span>Canlı İhale</span>
                        </article>
                        <article className="tenders-stat-card tenders-stat-card-upcoming">
                            <span className="material-symbols-outlined">schedule</span>
                            <strong>{upcomingCount}</strong>
                            <span>Yaklaşan</span>
                        </article>
                        <article className="tenders-stat-card tenders-stat-card-closed">
                            <span className="material-symbols-outlined">assignment_turned_in</span>
                            <strong>{closedCount}</strong>
                            <span>Kapanmış</span>
                        </article>
                    </div>
                </section>

                <section className="tenders-toolbar">
                    <div className="tenders-search-box">
                        <span className="material-symbols-outlined">search</span>
                        <input
                            type="text"
                            placeholder="Başlık, firma, kategori veya referans ara..."
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                        />
                        {/* Enes Doğanay | 7 Nisan 2026: Grid/Liste görünüm toggle butonu */}
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
                            { key: 'all', label: 'Tümü' },
                            { key: 'canli', label: 'Canlı' },
                            { key: 'yaklasan', label: 'Yaklaşan' },
                            { key: 'kapali', label: 'Kapalı' }
                        ].map((filterOption) => (
                            <button
                                key={filterOption.key}
                                type="button"
                                className={`tenders-filter-pill ${statusFilter === filterOption.key ? 'active' : ''}`}
                                onClick={() => setStatusFilter(filterOption.key)}
                            >
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
                        <p>Supabase üzerinde `database/tenders.sql` dosyasını çalıştırdıktan sonra ihale kayıtları burada dinamik olarak listelenecek.</p>
                    </section>
                ) : loading ? (
                    <section className="tenders-grid">
                        {[1, 2, 3].map((item) => (
                            <article key={item} className="tender-card tender-card-skeleton" />
                        ))}
                    </section>
                ) : filteredTenders.length === 0 ? (
                    <section className="tenders-empty-state">
                        <span className="material-symbols-outlined">gavel</span>
                        <h2>Eşleşen ihale bulunamadı</h2>
                        <p>Arama ifadenizi veya filtreleri değiştirerek farklı ihaleleri görüntüleyebilirsiniz.</p>
                    </section>
                ) : (
                    <>
                        {/* Enes Doğanay | 7 Nisan 2026: Arama veya filtre aktifken listelenen ihale sayısı */}
                        {(searchTerm.trim().length >= 2 || statusFilter !== 'all') && (
                            <p className="tenders-result-count">
                                <span>{filteredTenders.length}</span> ihale listeleniyor
                            </p>
                        )}

                        {viewMode === 'list' ? (
                            /* Enes Doğanay | 7 Nisan 2026: Minimal liste görünümü */
                            <section className="tenders-list-view">
                                <div className="tenders-list-header">
                                    <span className="tenders-list-col tenders-list-col--firma">Firma</span>
                                    <span className="tenders-list-col tenders-list-col--baslik">Başlık</span>
                                    <span className="tenders-list-col tenders-list-col--kod">Referans</span>
                                    <span className="tenders-list-col tenders-list-col--tarih">Açılış</span>
                                    <span className="tenders-list-col tenders-list-col--tarih">Kapanış</span>
                                    <span className="tenders-list-col tenders-list-col--durum">Durum</span>
                                </div>
                                {filteredTenders.map((tender) => {
                                    const statusMeta = getTenderStatusMeta(tender);
                                    return (
                                        <div key={tender.id} className="tenders-list-row" onClick={() => navigate(`/firmadetay/${tender.firma_id}`)}>
                                            <span className="tenders-list-col tenders-list-col--firma">{tender.firma_adi}</span>
                                            <span className="tenders-list-col tenders-list-col--baslik">{tender.baslik}</span>
                                            <span className="tenders-list-col tenders-list-col--kod">{tender.referans_no || '—'}</span>
                                            <span className="tenders-list-col tenders-list-col--tarih">{formatTenderDate(tender.yayin_tarihi)}</span>
                                            <span className="tenders-list-col tenders-list-col--tarih">{formatTenderDate(tender.son_basvuru_tarihi)}</span>
                                            <span className={`tenders-list-col tenders-list-col--durum tender-card-status tender-card-status-${statusMeta.className}`}>{statusMeta.label}</span>
                                        </div>
                                    );
                                })}
                            </section>
                        ) : (
                    <section className="tenders-grid">
                        {filteredTenders.map((tender) => {
                            const statusMeta = getTenderStatusMeta(tender);

                            return (
                                <article key={tender.id} className="tender-card">
                                    <div className="tender-card-top">
                                        <div>
                                            <div className="tender-card-company">{tender.firma_adi}</div>
                                            <h2>{tender.baslik}</h2>
                                        </div>
                                        <span className={`tender-card-status tender-card-status-${statusMeta.className}`}>{statusMeta.label}</span>
                                    </div>

                                    <p className="tender-card-desc">{tender.aciklama}</p>

                                    <div className="tender-card-tags">
                                        {tender.kategori && <span>{tender.kategori}</span>}
                                        {tender.ihale_tipi && <span>{tender.ihale_tipi}</span>}
                                        {tender.firma_konum && <span>{tender.firma_konum}</span>}
                                    </div>

                                    <div className="tender-card-meta-grid">
                                        <div className="tender-card-meta-item">
                                            <span className="material-symbols-outlined">event</span>
                                            <div>
                                                <strong>Yayın Tarihi</strong>
                                                <span>{formatTenderDate(tender.yayin_tarihi)}</span>
                                            </div>
                                        </div>
                                        <div className="tender-card-meta-item">
                                            <span className="material-symbols-outlined">hourglass_bottom</span>
                                            <div>
                                                <strong>Son Başvuru</strong>
                                                <span>{formatTenderDate(tender.son_basvuru_tarihi)}</span>
                                            </div>
                                        </div>
                                        <div className="tender-card-meta-item">
                                            <span className="material-symbols-outlined">payments</span>
                                            <div>
                                                <strong>Bütçe</strong>
                                                <span>{formatTenderBudget(tender.butce_notu)}</span>
                                            </div>
                                        </div>
                                        <div className="tender-card-meta-item">
                                            <span className="material-symbols-outlined">badge</span>
                                            <div>
                                                <strong>Referans</strong>
                                                <span>{tender.referans_no || 'Referans belirtilmedi'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="tender-card-actions">
                                        <button type="button" className="tender-card-primary" onClick={() => navigate(`/firmadetay/${tender.firma_id}`)}>
                                            <span className="material-symbols-outlined">apartment</span>
                                            <span>Firma Profili</span>
                                        </button>
                                        {tender.basvuru_email && (
                                            <a className="tender-card-secondary" href={`mailto:${tender.basvuru_email}`}>
                                                <span className="material-symbols-outlined">mail</span>
                                                <span>Başvuru Maili</span>
                                            </a>
                                        )}
                                    </div>
                                </article>
                            );
                        })}
                    </section>                        )}
                    </>                )}
            </main>
        </div>
    );
};

export default IhalelerPage;