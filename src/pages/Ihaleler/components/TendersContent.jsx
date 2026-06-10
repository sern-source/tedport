// Enes Doğanay | 5 Mayıs 2026: İhale listesi içeriği — durum state'lerine göre routing
// Enes Doğanay | 13 Mayıs 2026: Login duvarı kaldırıldı — içerik herkese açık, buton seviyesinde auth
import React from 'react';
import './TendersContent.css';
import TenderCard from './TenderCard';
import TendersListView from './TendersListView';
import TendersPagination from './TendersPagination';

const TendersContent = ({
    tableMissing, loading, filteredTenders, paginatedTenders,
    searchTerm, statusFilter, viewMode,
    highlightTenderId, highlightTenderRef, authManagedCompanyId, userOffers,
    page, setPage, totalPages, smartPages,
    onDetail, onEdit, onTeklif, onContact, onNavigateFirma,
}) => {
    if (tableMissing) return (
        <section className="tenders-empty-state">
            <span className="material-symbols-outlined">database</span>
            <h2>İhale tablosu henüz kurulmadı</h2>
            <p>Supabase üzerinde <code>database/tenders.sql</code> dosyasını çalıştırdıktan sonra ihale kayıtları burada listelenecek.</p>
        </section>
    );

    if (loading) return (
        <section className="tenders-grid">
            {[1, 2, 3, 4, 5, 6].map(item => <article key={item} className="tender-card tender-card-skeleton" />)}
        </section>
    );

    if (filteredTenders.length === 0) return (
        <section className="tenders-empty-state">
            <span className="material-symbols-outlined">search_off</span>
            <h2>Eşleşen ihale bulunamadı</h2>
            <p>Arama ifadenizi veya filtreleri değiştirerek farklı ihaleleri görüntüleyebilirsiniz.</p>
        </section>
    );

    return (
        <>
            <div>
                {(searchTerm.trim().length >= 2 || statusFilter !== 'all') && (
                    <p className="tenders-result-count"><span>{filteredTenders.length}</span> ihale listeleniyor</p>
                )}
                {viewMode === 'list' ? (
                    <TendersListView paginatedTenders={paginatedTenders} highlightTenderId={highlightTenderId}
                        highlightTenderRef={highlightTenderRef} authManagedCompanyId={authManagedCompanyId}
                        userOffers={userOffers} onDetail={onDetail} onEdit={onEdit}
                        onTeklif={onTeklif} onContact={onContact} onNavigateFirma={onNavigateFirma} />
                ) : (
                    <section className="tenders-grid">
                        {paginatedTenders.map(tender => (
                            <TenderCard key={tender.id} tender={tender}
                                isHighlighted={highlightTenderId === tender.id}
                                isOwnTender={!!(authManagedCompanyId && String(tender.firma_id) === String(authManagedCompanyId))}
                                userOffer={userOffers[String(tender.id)]}
                                highlightRef={highlightTenderId === tender.id ? highlightTenderRef : null}
                                onDetail={() => onDetail(tender)} onEdit={() => onEdit(tender)}
                                onTeklif={(e) => onTeklif(tender, e)} onContact={() => onContact(tender)}
                                onNavigateFirma={() => onNavigateFirma(tender)} />
                        ))}
                    </section>
                )}
                <TendersPagination page={page} setPage={setPage} totalPages={totalPages} smartPages={smartPages} />
            </div>
        </>
    );
};

export default TendersContent;
