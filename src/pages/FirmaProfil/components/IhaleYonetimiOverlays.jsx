// Enes Doğanay | 6 Mayıs 2026: İhale yönetimi — tüm modal/popup/overlay katmanı
import React from 'react';
import IhaleChatModal from './IhaleChatModal';
import IhaleContactPopup from './IhaleContactPopup';
import IhaleEditModal from './IhaleEditModal';
import SharedReportModal from '../../../components/SharedReportModal';
import IhaleFormModal from '../../Ihaleler/components/IhaleFormModal';
import IhalePopups from './IhalePopups';
// Enes Doğanay | 11 Mayıs 2026: Şablon modal
import IhaleTemplateModal from './IhaleTemplateModal';

const IhaleYonetimiOverlays = ({ chat, offerModals, tenderActions, create, offerActions, selectedTender, isTenderClosed, getUserId }) => (
    <>
        {/* Enes Doğanay | 6 Mayıs 2026: Teklif sahibi ile chat */}
        <IhaleChatModal
            activeTenderChat={chat.activeTenderChat} tenderChatMessages={chat.tenderChatMessages}
            tenderChatLoading={chat.tenderChatLoading} tenderChatError={chat.tenderChatError}
            tenderChatInput={chat.tenderChatInput} setTenderChatInput={chat.setTenderChatInput}
            tenderChatSending={chat.tenderChatSending} tenderChatEndRef={chat.tenderChatEndRef}
            isTenderClosed={isTenderClosed} onClose={chat.closeTenderChat}
            onSend={() => chat.sendTenderChatMessage(getUserId)}
            onOpenContact={() => offerModals.openContact(chat.activeTenderChat?.offer)}
            onOpenReport={({ mesajId, mesajIcerik }) => chat.setReportState(p => ({ ...p, modal: { mesajId, mesajIcerik }, neden: '', aciklama: '' }))}
        />
        <IhaleContactPopup contactState={offerModals.contactState} setContactState={offerModals.setContactState} />
        <IhaleEditModal
            editModal={tenderActions.editModal} editForm={tenderActions.editForm}
            editError={tenderActions.editError} editSaving={tenderActions.editSaving}
            editReqState={tenderActions.editReqState} setEditReqState={tenderActions.setEditReqState}
            setEditForm={tenderActions.setEditForm} onClose={() => tenderActions.setEditModal(false)}
            onSave={tenderActions.handleEditSave} onAddReq={tenderActions.addEditReq} onRemoveReq={tenderActions.removeEditReq}
        />
        {/* Enes Doğanay | 7 Mayıs 2026: Ortak şikayet modal — z-index 10100 (chat üzerinde) */}
        <SharedReportModal
            open={!!chat.reportState.modal}
            mesajIcerik={chat.reportState.modal?.mesajIcerik}
            neden={chat.reportState.neden}
            aciklama={chat.reportState.aciklama}
            sending={chat.reportState.sending}
            success={chat.reportState.success}
            onClose={() => chat.setReportState({ modal: null, neden: '', aciklama: '', sending: false, success: false })}
            onChangeNeden={neden => chat.setReportState(p => ({ ...p, neden }))}
            onChangeAciklama={aciklama => chat.setReportState(p => ({ ...p, aciklama }))}
            onSubmit={chat.submitReport}
        />
        {/* Enes Doğanay | 6 Mayıs 2026: Yeni/düzenle ihale — create.* ile beslenir */}
        <IhaleFormModal
            showModal={create.showModal} editingTender={create.editingTender}
            form={create.form} setForm={create.setForm}
            formSaving={create.formSaving} formError={create.formError} setFormError={create.setFormError}
            stepperStep={create.stepperStep} setStepperStep={create.setStepperStep}
            yeniGereksinimMadde={create.yeniGereksinimMadde} setYeniGereksinimMadde={create.setYeniGereksinimMadde}
            yeniGereksinimAciklama={create.yeniGereksinimAciklama} setYeniGereksinimAciklama={create.setYeniGereksinimAciklama}
            yeniGereksinimAdet={create.yeniGereksinimAdet} setYeniGereksinimAdet={create.setYeniGereksinimAdet}
            emailInput={create.emailInput} emailStatus={create.emailStatus}
            firmaSearchTerm={create.firmaSearchTerm} firmaSearchResults={create.firmaSearchResults}
            firmaSearching={create.firmaSearching} fileInputRef={create.fileInputRef}
            firmaResultsRef={create.firmaResultsRef} refNoCopied={create.refNoCopied} setRefNoCopied={create.setRefNoCopied}
            isVerifiedUser={create.isVerifiedUser} onClose={() => create.setShowCreateModal(false)}
            addGereksinim={create.addGereksinim} removeGereksinim={create.removeGereksinim}
            handleEmailInputChange={create.handleEmailInputChange} handleEmailKeyDown={create.handleEmailKeyDown}
            addEmail={create.addEmail} removeEmail={create.removeEmail}
            handleFirmaSearch={create.handleFirmaSearch} addDavetliFirma={create.addDavetliFirma} removeDavetliFirma={create.removeDavetliFirma}
            handleFileAdd={create.handleFileAdd} removeFile={create.removeFile} handleFormSubmit={create.handleFormSubmit}
            templateHook={create.templateHook}
        />
        <IhalePopups
            rejectNoteState={offerModals.rejectNoteState} setRejectNoteState={offerModals.setRejectNoteState}
            onConfirmReject={offerModals.confirmRejectOffer} acceptClosePopup={offerModals.acceptClosePopup}
            setAcceptClosePopup={offerModals.setAcceptClosePopup}
            onConfirmAccept={async (offerId, shouldClose) => {
                const doClose = await offerModals.confirmAcceptOffer(offerId, shouldClose);
                if (doClose && selectedTender) tenderActions.handleCloseTender(selectedTender.id, 'goster');
            }}
            closeState={tenderActions.closeState} setCloseState={tenderActions.setCloseState}
            onConfirmClose={tenderActions.handleCloseTender}
            statusConfirmPopup={offerModals.statusConfirmPopup} setStatusConfirmPopup={offerModals.setStatusConfirmPopup}
            onConfirmStatus={(offerId, status) => offerModals.updateStatus(offerId, status)}
            statusSuccessModal={offerModals.statusSuccessModal} setStatusSuccessModal={offerModals.setStatusSuccessModal}
            publishState={create.publishState} setPublishState={create.setPublishState}
            showScoringInfo={offerActions.showScoringInfo} setShowScoringInfo={offerActions.setShowScoringInfo}
            selectedTender={selectedTender}
        />
        {/* Enes Doğanay | 11 Mayıs 2026: Şablon seç / kaydet modalı */}
        <IhaleTemplateModal
            showModal={create.templateHook?.showModal}
            modalMode={create.templateHook?.modalMode}
            templates={create.templateHook?.templates || []}
            loading={create.templateHook?.loading}
            error={create.templateHook?.error}
            saveName={create.templateHook?.saveName}
            setSaveName={create.templateHook?.setSaveName}
            saving={create.templateHook?.saving}
            saveSuccess={create.templateHook?.saveSuccess}
            deleteConfirmId={create.templateHook?.deleteConfirmId}
            setDeleteConfirmId={create.templateHook?.setDeleteConfirmId}
            currentForm={create.form}
            onClose={create.templateHook?.closeModal}
            onApplyTemplate={create.applyTemplate}
            onSaveTemplate={create.templateHook?.handleSaveTemplate}
            onDeleteTemplate={create.templateHook?.handleDeleteTemplate}
        />
    </>
);

export default IhaleYonetimiOverlays;
