// Enes Doğanay | 6 Mayıs 2026: İhaleler sayfası modal/panel/popup katmanı
import React from 'react';
import MyTendersPanel from './MyTendersPanel';
import CloseVisibilityPopup from './CloseVisibilityPopup';
import IhaleFormModal from './IhaleFormModal';
import TenderDetail from './TenderDetail';
import TeklifPopup from './TeklifPopup';
import IhalePublishSuccess from './IhalePublishSuccess';
// Enes Doğanay | 11 Mayıs 2026: Şablon modal
import IhaleTemplateModal from '../../FirmaProfil/components/IhaleTemplateModal';

const IhalelerModals = ({
    myTendersHook, ihaleFormHook, teklifHook,
    detailTender, setDetailTender,
    authManagedCompanyId, userProfile, navigate,
}) => (
    <>
        {/* Enes Doğanay | 6 Nisan 2026: Kurumsal kullanıcıya özel ihale yönetim paneli */}
        {myTendersHook.managedFirmaId && myTendersHook.isOwner && (
            <MyTendersPanel
                myTenders={myTendersHook.myTenders} myTendersLoading={myTendersHook.myTendersLoading}
                myTendersExpanded={myTendersHook.myTendersExpanded} setMyTendersExpanded={myTendersHook.setMyTendersExpanded}
                deleteConfirmId={myTendersHook.deleteConfirmId} setDeleteConfirmId={myTendersHook.setDeleteConfirmId}
                closeConfirmId={myTendersHook.closeConfirmId} setCloseConfirmId={myTendersHook.setCloseConfirmId}
                closingTenderId={myTendersHook.closingTenderId}
                onCreateNew={ihaleFormHook.openCreate} onEdit={ihaleFormHook.openEdit} onClone={ihaleFormHook.handleClone}
                onDelete={myTendersHook.handleDelete} onClose={(id) => myTendersHook.setCloseVisibilityPopup(id)}
            />
        )}
        <CloseVisibilityPopup
            closeVisibilityPopup={myTendersHook.closeVisibilityPopup} closingTenderId={myTendersHook.closingTenderId}
            onGoster={() => myTendersHook.handleCloseTender(myTendersHook.closeVisibilityPopup, 'goster')}
            onGizle={() => myTendersHook.handleCloseTender(myTendersHook.closeVisibilityPopup, 'gizle')}
            onCancel={() => myTendersHook.setCloseVisibilityPopup(null)}
        />
        {/* Enes Doğanay | 5 Mayıs 2026: İhale oluştur/düzenle stepper modal */}
        <IhaleFormModal
            showModal={ihaleFormHook.showModal} editingTender={ihaleFormHook.editingTender}
            form={ihaleFormHook.form} setForm={ihaleFormHook.setForm}
            formSaving={ihaleFormHook.formSaving} formError={ihaleFormHook.formError} setFormError={ihaleFormHook.setFormError}
            stepperStep={ihaleFormHook.stepperStep} setStepperStep={ihaleFormHook.setStepperStep}
            yeniGereksinimMadde={ihaleFormHook.yeniGereksinimMadde} setYeniGereksinimMadde={ihaleFormHook.setYeniGereksinimMadde}
            yeniGereksinimAciklama={ihaleFormHook.yeniGereksinimAciklama} setYeniGereksinimAciklama={ihaleFormHook.setYeniGereksinimAciklama}
            yeniGereksinimAdet={ihaleFormHook.yeniGereksinimAdet} setYeniGereksinimAdet={ihaleFormHook.setYeniGereksinimAdet}
            emailInput={ihaleFormHook.emailInput} setEmailInput={ihaleFormHook.setEmailInput} emailStatus={ihaleFormHook.emailStatus}
            firmaSearchTerm={ihaleFormHook.firmaSearchTerm} setFirmaSearchTerm={ihaleFormHook.setFirmaSearchTerm}
            firmaSearchResults={ihaleFormHook.firmaSearchResults} firmaSearching={ihaleFormHook.firmaSearching}
            fileInputRef={ihaleFormHook.fileInputRef} firmaResultsRef={ihaleFormHook.firmaResultsRef}
            refNoCopied={ihaleFormHook.refNoCopied} setRefNoCopied={ihaleFormHook.setRefNoCopied}
            isVerifiedUser={myTendersHook.isVerifiedUser}
            onClose={() => ihaleFormHook.setShowModal(false)}
            addGereksinim={ihaleFormHook.addGereksinim} removeGereksinim={ihaleFormHook.removeGereksinim}
            handleEmailInputChange={ihaleFormHook.handleEmailInputChange} handleEmailKeyDown={ihaleFormHook.handleEmailKeyDown}
            addEmail={ihaleFormHook.addEmail} removeEmail={ihaleFormHook.removeEmail}
            handleFirmaSearch={ihaleFormHook.handleFirmaSearch} addDavetliFirma={ihaleFormHook.addDavetliFirma} removeDavetliFirma={ihaleFormHook.removeDavetliFirma}
            handleFileAdd={ihaleFormHook.handleFileAdd} removeFile={ihaleFormHook.removeFile}
            handleFormSubmit={ihaleFormHook.handleFormSubmit}
            templateHook={ihaleFormHook.templateHook}
        />
        {/* Enes Doğanay | 11 Mayıs 2026: Şablon seçim/kaydetme modalı */}
        <IhaleTemplateModal
            showModal={ihaleFormHook.templateHook?.showModal}
            modalMode={ihaleFormHook.templateHook?.modalMode}
            templates={ihaleFormHook.templateHook?.templates || []}
            loading={ihaleFormHook.templateHook?.loading}
            error={ihaleFormHook.templateHook?.error}
            saveName={ihaleFormHook.templateHook?.saveName}
            setSaveName={ihaleFormHook.templateHook?.setSaveName}
            saving={ihaleFormHook.templateHook?.saving}
            saveSuccess={ihaleFormHook.templateHook?.saveSuccess}
            deleteConfirmId={ihaleFormHook.templateHook?.deleteConfirmId}
            setDeleteConfirmId={ihaleFormHook.templateHook?.setDeleteConfirmId}
            currentForm={ihaleFormHook.form}
            onClose={ihaleFormHook.templateHook?.closeModal}
            onApplyTemplate={ihaleFormHook.applyTemplate}
            onSaveTemplate={ihaleFormHook.templateHook?.handleSaveTemplate}
            onDeleteTemplate={ihaleFormHook.templateHook?.handleDeleteTemplate}
        />
        {/* Enes Doğanay | 11 Nisan 2026: İhale detay drawer */}
        {detailTender && (
            <TenderDetail
                tender={detailTender} userOffer={teklifHook.userOffers[String(detailTender.id)]}
                isOwnTender={!!(authManagedCompanyId && String(detailTender.firma_id) === String(authManagedCompanyId))}
                userProfile={userProfile}
                onClose={() => setDetailTender(null)}
                onTeklif={(e) => { if (!userProfile) { teklifHook.openTeklifPopup(detailTender, e); } else { setDetailTender(null); teklifHook.openTeklifPopup(detailTender, e); } }}
                onEdit={() => { setDetailTender(null); ihaleFormHook.openEdit(detailTender); }}
                onNavigateFirma={() => { setDetailTender(null); navigate(`/firmadetay/${detailTender.firma_id}`); }}
                onLogin={() => navigate(`/login?redirect=${encodeURIComponent('/ihaleler?ihale=' + detailTender.id)}`)}
                onRegister={() => navigate('/register')}
            />
        )}
        {/* Enes Doğanay | 5 Mayıs 2026: Teklif ver popup */}
        <TeklifPopup
            teklifTender={teklifHook.teklifTender} teklifForm={teklifHook.teklifForm} setTeklifForm={teklifHook.setTeklifForm}
            teklifDosya={teklifHook.teklifDosya} setTeklifDosya={teklifHook.setTeklifDosya} teklifDosyaRef={teklifHook.teklifDosyaRef}
            teklifSaving={teklifHook.teklifSaving} teklifError={teklifHook.teklifError} setTeklifError={teklifHook.setTeklifError}
            teklifSuccess={teklifHook.teklifSuccess} setTeklifSuccess={teklifHook.setTeklifSuccess}
            userOffers={teklifHook.userOffers} withdrawConfirm={teklifHook.withdrawConfirm} setWithdrawConfirm={teklifHook.setWithdrawConfirm}
            withdrawing={teklifHook.withdrawing} draftDeleteConfirm={teklifHook.draftDeleteConfirm} setDraftDeleteConfirm={teklifHook.setDraftDeleteConfirm}
            draftDeleting={teklifHook.draftDeleting} currencyModalIdx={teklifHook.currencyModalIdx} setCurrencyModalIdx={teklifHook.setCurrencyModalIdx}
            currencySearch={teklifHook.currencySearch} setCurrencySearch={teklifHook.setCurrencySearch}
            loginPromptTenderId={teklifHook.loginPromptTenderId} loginPromptPos={teklifHook.loginPromptPos} loginPromptRef={teklifHook.loginPromptRef}
            firmaContactPopup={teklifHook.firmaContactPopup} setFirmaContactPopup={teklifHook.setFirmaContactPopup}
            onClose={() => { if (!teklifHook.teklifSaving) teklifHook.setTeklifTender(null); }}
            onSubmit={teklifHook.handleTeklifSubmit} onDeleteDraft={teklifHook.handleDeleteDraft} onWithdraw={teklifHook.handleWithdrawOffer}
            onUpdateKalem={teklifHook.updateKalem} getGroupedTotals={teklifHook.getGroupedTotals}
            onLogin={() => navigate('/login')}
        />
        {/* Enes Doğanay | 5 Mayıs 2026: İhale yayınlama başarı modalı */}
        <IhalePublishSuccess
            ihalePublishSuccess={ihaleFormHook.ihalePublishSuccess} publishedLinkCopied={ihaleFormHook.publishedLinkCopied}
            setPublishedLinkCopied={ihaleFormHook.setPublishedLinkCopied} onClose={() => ihaleFormHook.setIhalePublishSuccess(null)}
        />
    </>
);

export default IhalelerModals;
