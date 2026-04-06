import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SharedHeader from './SharedHeader';
import './SharedHeader.css';
import './AdminCorporateApplications.css';
import { supabase } from './supabaseClient';
import { isAdminEmail } from './adminAccess';
import { listCorporateApplications, resolveIsAdminUser, reviewCorporateApplication } from './corporateApplicationsApi';

// Enes Doğanay | 6 Nisan 2026: Basvuru durumlarini admin panelinde tek bicimde rozetlemek icin meta haritasi tanimlandi
const applicationStatusMeta = {
    pending: { label: 'İnceleniyor', className: 'pending' },
    approved: { label: 'Onaylandı', className: 'approved' },
    rejected: { label: 'Reddedildi', className: 'rejected' },
    needs_info: { label: 'Ek Bilgi', className: 'needs_info' }
};

// Enes Doğanay | 6 Nisan 2026: Tarih alanlari admin listesinde kisa ve okunur gosterilir
const formatApplicationDate = (value) => {
    if (!value) {
        return 'Belirtilmedi';
    }

    const date = new Date(value);
    return `${date.toLocaleDateString('tr-TR')} • ${date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}`;
};

const AdminCorporateApplicationsPage = () => {
    const navigate = useNavigate();
    const [sessionChecked, setSessionChecked] = useState(false);
    const [accessDenied, setAccessDenied] = useState(false);
    const [accessToken, setAccessToken] = useState('');
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [adminNotes, setAdminNotes] = useState({});
    const [actionLoadingId, setActionLoadingId] = useState(null);
    const [feedback, setFeedback] = useState({ type: '', message: '' });
    const [dataMode, setDataMode] = useState('edge');
    const [dataModeReason, setDataModeReason] = useState('');
    const [currentUserEmail, setCurrentUserEmail] = useState('');

    useEffect(() => {
        let isMounted = true;

        // Enes Doğanay | 6 Nisan 2026: Admin paneline yalniz yetkili oturum sahibi kullanicilar alinır
        const bootstrapAdminPage = async () => {
            const { data: sessionResult } = await supabase.auth.getSession();
            const session = sessionResult.session;

            if (!session?.user) {
                navigate('/login');
                return;
            }

            if (!(await resolveIsAdminUser(session.user.email, isAdminEmail))) {
                if (isMounted) {
                    setAccessDenied(true);
                    setLoading(false);
                    setSessionChecked(true);
                }
                return;
            }

            if (isMounted) {
                setAccessToken(session.access_token);
                setCurrentUserEmail(session.user.email || '');
                setSessionChecked(true);
            }

            try {
                const result = await listCorporateApplications(session.access_token);

                if (!isMounted) {
                    return;
                }

                setApplications(result.applications || []);
                setDataMode(result.mode || 'edge');
                setDataModeReason(result.fallbackReason || '');
                setAdminNotes(Object.fromEntries((result.applications || []).map((application) => [application.id, application.review_note || ''])));
            } catch (error) {
                if (isMounted) {
                    setFeedback({ type: 'error', message: error.message || 'Başvurular alınamadı.' });
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        bootstrapAdminPage();

        return () => {
            isMounted = false;
        };
    }, [navigate]);

    const visibleApplications = useMemo(() => {
        const normalizedQuery = searchTerm.trim().toLocaleLowerCase('tr-TR');

        return applications.filter((application) => {
            const matchesStatus = statusFilter === 'all' || application.status === statusFilter;
            const matchesSearch = !normalizedQuery || [
                application.company_name,
                application.listed_company_name,
                application.corporate_email,
                application.applicant_first_name,
                application.applicant_last_name,
                application.tax_number
            ].some((value) => (value || '').toLocaleLowerCase('tr-TR').includes(normalizedQuery));

            return matchesStatus && matchesSearch;
        });
    }, [applications, searchTerm, statusFilter]);

    const statusCounts = useMemo(() => {
        return applications.reduce((counts, application) => {
            counts[application.status] = (counts[application.status] || 0) + 1;
            return counts;
        }, { pending: 0, approved: 0, rejected: 0, needs_info: 0 });
    }, [applications]);

    // Enes Doğanay | 6 Nisan 2026: Admin karari tek endpointten verilerek kart durumu aninda guncellenir
    const handleReview = async (application, decision) => {
        if (!accessToken) {
            return;
        }

        setActionLoadingId(application.id);
        setFeedback({ type: '', message: '' });

        try {
            const result = await reviewCorporateApplication({
                accessToken,
                applicationId: application.id,
                decision,
                reviewNote: adminNotes[application.id] || '',
                reviewerEmail: currentUserEmail
            });

            setApplications((prevApplications) => prevApplications.map((item) => item.id === result.application.id ? result.application : item));
            setFeedback({
                type: 'success',
                message: decision === 'approve'
                    ? (result.mode === 'database'
                        ? `Başvuru sadece veritabanında onaylandı. Edge Function akışı çalışmadığı için kullanıcı açma ve onay maili adımı tamamlanmadı.${result.fallbackReason ? ` Sebep: ${result.fallbackReason}` : ''}`
                        : 'Başvuru onaylandı, kullanıcı oluşturuldu ve kurulum maili gönderildi.')
                    : decision === 'needs_info'
                        ? 'Başvuru ek bilgi bekleniyor durumuna alındı.'
                        : 'Başvuru reddedildi.'
            });
        } catch (error) {
            setFeedback({ type: 'error', message: error.message || 'Başvuru güncellenemedi.' });
        } finally {
            setActionLoadingId(null);
        }
    };

    if (!sessionChecked && loading) {
        return null;
    }

    return (
        <div className="corporate-admin-page">
            <SharedHeader
                navItems={[
                    { label: 'Anasayfa', href: '/' },
                    { label: 'Firmalar', href: '/firmalar' },
                    { label: 'İhaleler', href: '/ihaleler' },
                    { label: 'Hakkımızda', href: '/hakkimizda' },
                    { label: 'İletişim', href: '/iletisim' }
                ]}
            />

            <main className="corporate-admin-main">
                {accessDenied ? (
                    <section className="corporate-admin-guard">
                        <span className="material-symbols-outlined">admin_panel_settings</span>
                        <h2>Bu alana erişim yetkiniz yok</h2>
                        <p>Kurumsal başvuru paneli yalnızca yetkili Tedport yöneticilerine açıktır.</p>
                    </section>
                ) : (
                    <>
                        <section className="corporate-admin-hero">
                            <div>
                                <h1>Kurumsal Başvuru Paneli</h1>
                                <p>Kurumsal kayıt taleplerini inceleyin, şirket doğrulamasını yapın ve onaylanan firmalara şifre belirleme bağlantısı gönderin.</p>
                            </div>
                            <div className="corporate-admin-hero-badge">
                                <span className="material-symbols-outlined">shield_person</span>
                                <span>Yetkili Yönetim Alanı</span>
                            </div>
                        </section>

                        {dataMode === 'database' && (
                            <div className="corporate-admin-message success">
                                Edge Function tarafı şu an fallback modunda. Başvurular doğrudan veritabanından okunuyor. {dataModeReason ? `Sebep: ${dataModeReason}` : 'Yeni corporate-applications deploy edilmemiş veya güncel SQL uygulanmamış olabilir.'}
                            </div>
                        )}

                        <section className="corporate-admin-stats">
                            <article className="corporate-admin-stat">
                                <strong>{statusCounts.pending || 0}</strong>
                                <span>İncelenen Başvuru</span>
                            </article>
                            <article className="corporate-admin-stat">
                                <strong>{statusCounts.approved || 0}</strong>
                                <span>Onaylanan Firma</span>
                            </article>
                            <article className="corporate-admin-stat">
                                <strong>{statusCounts.needs_info || 0}</strong>
                                <span>Ek Bilgi Bekleyen</span>
                            </article>
                            <article className="corporate-admin-stat">
                                <strong>{statusCounts.rejected || 0}</strong>
                                <span>Reddedilen Başvuru</span>
                            </article>
                        </section>

                        <section className="corporate-admin-toolbar">
                            <div className="corporate-admin-search">
                                <span className="material-symbols-outlined">search</span>
                                <input
                                    type="text"
                                    placeholder="Firma, başvuru sahibi veya vergi numarası ara..."
                                    value={searchTerm}
                                    onChange={(event) => setSearchTerm(event.target.value)}
                                />
                            </div>

                            <div className="corporate-admin-filters">
                                <span className="material-symbols-outlined">filter_alt</span>
                                <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                                    <option value="all">Tüm Durumlar</option>
                                    <option value="pending">İnceleniyor</option>
                                    <option value="approved">Onaylandı</option>
                                    <option value="needs_info">Ek Bilgi</option>
                                    <option value="rejected">Reddedildi</option>
                                </select>
                            </div>
                        </section>

                        {feedback.message && (
                            <div className={`corporate-admin-message ${feedback.type}`}>
                                {feedback.message}
                            </div>
                        )}

                        {loading ? null : visibleApplications.length === 0 ? (
                            <section className="corporate-admin-empty">
                                <span className="material-symbols-outlined">inbox</span>
                                <h2>Eşleşen başvuru bulunamadı</h2>
                                <p>Filtreleri temizleyin veya yeni başvuruların gelmesini bekleyin.</p>
                            </section>
                        ) : (
                            <section className="corporate-admin-list">
                                {visibleApplications.map((application) => {
                                    const statusMeta = applicationStatusMeta[application.status] || applicationStatusMeta.pending;
                                    return (
                                        <article key={application.id} className="corporate-admin-card">
                                            <div className="corporate-admin-card-top">
                                                <div>
                                                    <h2>{application.company_name}</h2>
                                                    <p>{application.applicant_first_name} {application.applicant_last_name} • {application.applicant_title || 'Pozisyon belirtilmedi'}</p>
                                                </div>
                                                <span className={`corporate-admin-status ${statusMeta.className}`}>{statusMeta.label}</span>
                                            </div>

                                            <div className="corporate-admin-card-meta">
                                                <div className="corporate-admin-card-meta-item">
                                                    <strong>Kurumsal E-posta</strong>
                                                    <span>{application.corporate_email}</span>
                                                </div>
                                                <div className="corporate-admin-card-meta-item">
                                                    <strong>Telefon</strong>
                                                    <span>{application.phone}</span>
                                                </div>
                                                <div className="corporate-admin-card-meta-item">
                                                    <strong>Başvuru Zamanı</strong>
                                                    <span>{formatApplicationDate(application.created_at)}</span>
                                                </div>
                                            </div>

                                            <div className="corporate-admin-card-grid">
                                                <section className="corporate-admin-card-section">
                                                    <h3>Doğrulama Bilgileri</h3>
                                                    <p className="corporate-admin-card-note"><strong>Tedport'ta görünmesini istediği firma:</strong> {application.listed_company_name || 'Belirtilmedi'}</p>
                                                    <p className="corporate-admin-card-note"><strong>Web sitesi:</strong> {application.website_url ? <a href={application.website_url} target="_blank" rel="noreferrer">{application.website_url}</a> : 'Belirtilmedi'}</p>
                                                    <p className="corporate-admin-card-note"><strong>Vergi dairesi / no:</strong> {[application.tax_office, application.tax_number].filter(Boolean).join(' / ') || 'Belirtilmedi'}</p>
                                                    <p className="corporate-admin-card-note"><strong>Adres:</strong> {application.company_address || 'Belirtilmedi'}</p>
                                                    <p className="corporate-admin-card-note"><strong>Başvuru notu:</strong> {application.verification_note || 'Ek açıklama yok.'}</p>
                                                    {application.review_note && (
                                                        <p className="corporate-admin-card-note"><strong>Son admin notu:</strong> {application.review_note}</p>
                                                    )}
                                                </section>

                                                <section className="corporate-admin-review">
                                                    <h3>İnceleme Kararı</h3>
                                                    <div className="corporate-admin-review-note">
                                                        <textarea
                                                            value={adminNotes[application.id] || ''}
                                                            onChange={(event) => setAdminNotes((prevNotes) => ({ ...prevNotes, [application.id]: event.target.value }))}
                                                            placeholder="İnceleme notu, talep edilen ek belge veya onay gerekçesi..."
                                                        />
                                                    </div>
                                                    <div className="corporate-admin-review-actions">
                                                        <button
                                                            type="button"
                                                            className="corporate-admin-btn approve"
                                                            onClick={() => handleReview(application, 'approve')}
                                                            disabled={actionLoadingId === application.id || application.status === 'approved'}
                                                        >
                                                            {actionLoadingId === application.id ? 'İşleniyor...' : 'Onayla ve Hesap Aç'}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="corporate-admin-btn needs-info"
                                                            onClick={() => handleReview(application, 'needs_info')}
                                                            disabled={actionLoadingId === application.id}
                                                        >
                                                            Ek Bilgi İste
                                                        </button>
                                                        <button
                                                            type="button"
                                                            className="corporate-admin-btn reject"
                                                            onClick={() => handleReview(application, 'reject')}
                                                            disabled={actionLoadingId === application.id}
                                                        >
                                                            Reddet
                                                        </button>
                                                    </div>
                                                </section>
                                            </div>
                                        </article>
                                    );
                                })}
                            </section>
                        )}
                    </>
                )}
            </main>
        </div>
    );
};

export default AdminCorporateApplicationsPage;
