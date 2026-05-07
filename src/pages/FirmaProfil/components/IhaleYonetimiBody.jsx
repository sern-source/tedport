// Enes Doğanay | 6 Mayıs 2026: İhale yönetimi — sidebar + ana içerik alanı
import React from 'react';
import IhaleSidebar from './IhaleSidebar';
import IhaleInfoCard from './IhaleInfoCard';
import IhaleOffersSection from './IhaleOffersSection';

const IhaleYonetimiBody = ({
    core, chat, create, tenderActions, offerActions, combinedModals, sortedFilteredTenders,
}) => {
    const selectedTender = core.selectedTender;
    return (
        <div className="tom-body">
            {/* Enes Doğanay | 6 Mayıs 2026: İhale listesi sidebar */}
            <IhaleSidebar
                filteredTenders={sortedFilteredTenders} selectedId={core.selectedId}
                offersByTender={core.offersByTender} tenderUnreadSet={chat.tenderUnreadSet}
                tenderSearch={core.tenderSearch} setTenderSearch={core.setTenderSearch}
                tenderFilter={core.tenderFilter} setTenderFilter={core.setTenderFilter}
                tenderPage={core.tenderPage} setTenderPage={core.setTenderPage}
                onSelectTender={core.setSelectedId} onNewTender={create.openCreateModal}
            />
            <main className="tom-main">
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
