import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './Ihaleler.css';
import './SharedHeader.css';
import SharedHeader from './SharedHeader';
import { supabase } from './supabaseClient';
import { formatTenderBudget, formatTenderDate, getTenderStatusMeta } from './tenderUtils';

// Enes Doğanay | 6 Nisan 2026: Ihale tablosu henuz kurulmamissa ekran kirilmasin diye iliski hatasi yumusatilir
const isMissingRelationError = (error) => error?.code === '42P01' || error?.message?.toLowerCase().includes('relation');

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

    useEffect(() => {
        const fetchTenders = async () => {
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

                if (firmsError) {
                    throw firmsError;
                }

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
        };

        fetchTenders();
    }, [firmaFilter]);

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

    return (
        <div className="tenders-page">
            <SharedHeader />

            <main className="tenders-page-main">
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
                    </section>
                )}
            </main>
        </div>
    );
};

export default IhalelerPage;