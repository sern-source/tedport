// Enes Doğanay | 6 Mayıs 2026: İhale yönetimi — sidebar + ana içerik alanı
import React, { useState, useEffect } from 'react';
import IhaleSidebar from './IhaleSidebar';
import IhaleInfoCard from './IhaleInfoCard';
import IhaleOffersSection from './IhaleOffersSection';

const IhaleYonetimiBody = ({
    core, chat, create, tenderActions, offerActions, combinedModals, sortedFilteredTenders,
    sidebarSort, setSidebarSort,
}) => {
    const selectedTender = core.selectedTender;
    // Enes Doğanay | 8 Mayıs 2026: Mobil liste/detay geçiş state'i
    const [mobileView, setMobileView] = useState(core.selectedId ? 'detail' : 'list');

    // Enes Doğanay | 8 Mayıs 2026: URL/bildirim ile selectedId değişince → detay görünümüne geç
    useEffect(() => {
        if (core.selectedId) setMobileView('detail');
    }, [core.selectedId]); // eslint-disable-line

    // Enes Doğanay | 8 Mayıs 2026: Tender seçimi — mobilde detay görünümüne geç
    const handleSelectTender = (id) => {
        core.setSelectedId(id);
        setMobileView('detail');
    };

    return (
        <div className={`tom-body tom-body--mobile-${mobileView}`}>
            {/* Enes Doğanay | 6 Mayıs 2026: İhale listesi sidebar */}
            <IhaleSidebar
                filteredTenders={sortedFilteredTenders} selectedId={core.selectedId}
                offersByTender={core.offersByTender} tenderUnreadSet={chat.tenderUnreadSet}
                tenderSearch={core.tenderSearch} setTenderSearch={core.setTenderSearch}
                tenderFilter={core.tenderFilter} setTenderFilter={core.setTenderFilter}
                tenderPage={core.tenderPage} setTenderPage={core.setTenderPage}
                sidebarSort={sidebarSort} setSidebarSort={setSidebarSort}
                onSelectTender={handleSelectTender} onNewTender={create.openCreateModal}
            />
            <main className="tom-main">
                {/* Enes Doğanay | 8 Mayıs 2026: Mobil geri butonu — sadece ≤768px detay görünümünde görünür */}
                <button className="tom-mobile-back" onClick={() => setMobileView('list')}>
                    <span className="material-symbols-outlined">arrow_back</span>
                    İhale Listesi
                </button>
                {!selectedTender ? (
                    <div className="tom-empty-state">
                        <span className="material-symbols-outlined">gavel</span>
                        <h3>İhale Seçin</h3>
                        <p>Sol panelden bir ihale seçin veya yeni ihale oluşturun.</p>
                        <button className="tom-btn tom-btn--create-tender" onClick={create.openCreateModal}>
                            <span className="material-symbols-outlined">add</span>Yeni İhale Oluştur
                        </button>
                    </div>
                ) : (
                    <>
                        <IhaleInfoCard
                            tender={selectedTender}
                            onEdit={create.openEditInCreateModal} onRepeat={create.openRepeatModal}
                            onDelete={tenderActions.handleDeleteTender} onClose={tenderActions.handleCloseTender}
                            onComplete={tenderActions.handleCompleteTender}
                            completeConfirmId={tenderActions.completeConfirmId}
                            setCompleteConfirmId={tenderActions.setCompleteConfirmId}
                            completeLoading={tenderActions.completeLoading}
                            deleteConfirmId={tenderActions.deleteConfirmId} setDeleteConfirmId={tenderActions.setDeleteConfirmId}
                            closeState={tenderActions.closeState} setCloseState={tenderActions.setCloseState}
                        />
                        <IhaleOffersSection
                            displayOffers={offerActions.displayOffers} compareList={offerActions.compareList}
                            compareIds={offerActions.compareState.ids} compareHintDismissed={offerActions.compareState.hintDismissed}
                            setCompareHintDismissed={(v) => offerActions.setCompareState(p => ({ ...p, hintDismissed: v }))}
                            selectedTender={selectedTender} displayState={offerActions.displayState}
                            setDisplayState={offerActions.setDisplayState} sortState={offerActions.sortState}
                            setSortState={offerActions.setSortState} sortDropdownRef={offerActions.sortDropdownRef}
                            unread={chat.unread} shortlist={offerActions.shortlist} notes={offerActions.notes}
                            highlightRef={offerActions.highlightRef} highlightState={offerActions.highlightState}
                            statusDropdownId={combinedModals.statusDropdownId} setStatusDropdownId={combinedModals.setStatusDropdownId}
                            showScoringInfo={offerActions.showScoringInfo} setShowScoringInfo={offerActions.setShowScoringInfo}
                            offerModals={combinedModals}
                        />
                    </>
                )}
            </main>
        </div>
    );
};

export default IhaleYonetimiBody;
