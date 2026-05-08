// Enes Doğanay | 6 Mayıs 2026: MyOffersTab — İhale Tekliflerim sekmesi koordinatörü
import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMyOffers } from '../hooks/useMyOffers';
import MyOfferCard from './MyOfferCard';
import MyOfferChatView from './MyOfferChatView';
import MyOffersHero from './MyOffersHero';
import MyOffersToolbar from './MyOffersToolbar';
import SharedReportModal from './SharedReportModal';
import MyOffersDeleteModal from './MyOffersDeleteModal';
import MyOffersFirmaContactPopup from './MyOffersFirmaContactPopup';
import Pagination from './Pagination';
import './MyOffersTab.css';
import './MyOffersTab.dark.css';

const MyOffersTab = ({ userId, companyId, mopChatTrigger, onChatOpened, onUnreadCountChange }) => {
    const navigate = useNavigate();
    const state = useMyOffers({ userId, companyId, mopChatTrigger, onChatOpened, onUnreadCountChange });
    const {
        loading, tenderMap, firmaMap,
        filter, setFilter, search, setSearch,
        currentPage, setCurrentPage, pageCount, pagedOffers,
        expandedId, setExpandedId, highlightId, highlightRef,
        unreadMopChatIds, unreadMopChatCounts,
        activeMopChat, mopChatMessages, mopChatLoading, mopChatError,
        mopChatInput, setMopChatInput, mopChatSending, mopChatEndRef,
        handleOpenMopChat, handleCloseMopChat, handleSendMopChatMessage,
        deleteConfirm, setDeleteConfirm, deleting, handleDeleteOffer,
        firmaContactPopup, setFirmaContactPopup, firmaContactLoading, handleOpenFirmaContact,
        reportModal, setReportModal, reportSending,
        reportNeden, setReportNeden, reportAciklama, setReportAciklama,
        reportSuccess, handleSubmitReport,
        mopToast, filtered, kpis,
        // Enes Doğanay | 7 Mayıs 2026: firma logo haritası — chat avatarı için
        firmaLogoMap,
    } = state;

    // Enes Doğanay | 6 Mayıs 2026: Şikayet modalı açma handler
    const handleOpenReportModal = useCallback(({ mesajId, mesajIcerik }) => {
        setReportModal({ mesajId, mesajIcerik });
    }, [setReportModal]);

    // Enes Doğanay | 7 Mayıs 2026: Chat açma — firmaLogo burada hesaplanır (firmaLogoMap stale closure önlemi)
    const handleOpenChatWithLogo = useCallback((offer, tenderTitle, firmaAdi, anonim) => {
        const t = tenderMap[String(offer.ihale_id)];
        const logo = t?.firma_id ? (firmaLogoMap?.[String(t.firma_id)] || null) : null;
        handleOpenMopChat(offer, tenderTitle, firmaAdi, anonim, logo);
    }, [tenderMap, firmaLogoMap, handleOpenMopChat]);

    // Enes Doğanay | 6 Mayıs 2026: Chat yeniden deneme
    const handleRetryChat = useCallback(() => {
        if (!activeMopChat) return;
        handleOpenChatWithLogo(activeMopChat.offer, activeMopChat.tenderTitle, activeMopChat.firmaAdi, activeMopChat.anonim);
    }, [activeMopChat, handleOpenChatWithLogo]);

    return (
        <div className="mop-screen">
            {mopToast && (
                <div className={`mop-toast mop-toast--${mopToast.type}`}>
                    <span className="material-symbols-outlined">{mopToast.type === 'success' ? 'check_circle' : 'error'}</span>
                    {mopToast.message}
                </div>
            )}
            <MyOffersHero kpis={kpis} />
            <MyOffersToolbar search={search} setSearch={setSearch} filter={filter} setFilter={setFilter} setCurrentPage={setCurrentPage} />
            {loading && (
                <div className="mop-loading">
                    <div className="mop-loading__spinner"><span className="material-symbols-outlined">hourglass_top</span></div>
                    <p>Teklifleriniz yükleniyor…</p>
                </div>
            )}
            {!loading && filtered.length === 0 && (
                <div className="mop-empty">
                    <span className="material-symbols-outlined">gavel</span>
                    <h3>{search || filter !== 'all' ? 'Arama kriterinize uygun teklif bulunamadı.' : 'Henüz ihale teklifiniz yok.'}</h3>
                    {!search && filter === 'all' && (
                        <button className="mop-btn mop-btn--primary" onClick={() => navigate('/ihaleler')}>İhalelere Göz At</button>
                    )}
                </div>
            )}
            {!loading && pagedOffers.length > 0 && (
                <div className="mop-list">
                    {pagedOffers.map(offer => {
                        const tender = tenderMap[String(offer.ihale_id)] || {};
                        const firmaAdi = tender.anonim ? 'Anonim Firma' : (firmaMap[String(tender.firma_id)] || 'Firma');
                        return (
                            <MyOfferCard key={offer.id} offer={offer} tender={tender} firmaAdi={firmaAdi}
                                isExpanded={expandedId === offer.id} isHighlight={highlightId === offer.id}
                                highlightRef={highlightRef} unreadMopChatIds={unreadMopChatIds} unreadMopChatCounts={unreadMopChatCounts}
                                onToggle={() => setExpandedId(expandedId === offer.id ? null : offer.id)}
                                onOpenChat={handleOpenChatWithLogo}
                                onDelete={(o) => setDeleteConfirm(o)} navigate={navigate} />
                        );
                    })}
                </div>
            )}
            {!loading && <Pagination page={currentPage} totalPages={pageCount} onPageChange={setCurrentPage} />}
            <MyOfferChatView activeMopChat={activeMopChat} mopChatMessages={mopChatMessages}
                mopChatLoading={mopChatLoading} mopChatError={mopChatError}
                mopChatInput={mopChatInput} setMopChatInput={setMopChatInput}
                mopChatSending={mopChatSending} mopChatEndRef={mopChatEndRef}
                tenderMap={tenderMap} onClose={handleCloseMopChat} onSend={handleSendMopChatMessage}
                onRetry={handleRetryChat} onOpenReportModal={handleOpenReportModal} />
            {/* Enes Doğanay | 7 Mayıs 2026: Ortak şikayet modal */}
            <SharedReportModal
                open={!!reportModal}
                mesajIcerik={reportModal?.mesajIcerik}
                neden={reportNeden}
                aciklama={reportAciklama}
                sending={reportSending}
                success={reportSuccess}
                onClose={() => setReportModal(null)}
                onChangeNeden={setReportNeden}
                onChangeAciklama={setReportAciklama}
                onSubmit={handleSubmitReport}
            />
            <MyOffersDeleteModal deleteConfirm={deleteConfirm} setDeleteConfirm={setDeleteConfirm}
                deleting={deleting} handleDeleteOffer={handleDeleteOffer} />
            <MyOffersFirmaContactPopup firmaContactPopup={firmaContactPopup} setFirmaContactPopup={setFirmaContactPopup}
                firmaContactLoading={firmaContactLoading} />
        </div>
    );
};

export default MyOffersTab;
