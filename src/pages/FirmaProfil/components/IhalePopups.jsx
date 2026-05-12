// Enes Doğanay | 6 Mayıs 2026: Popup koordinatörü — tüm ihale yönetim popup'ları
import React from 'react';
import IhaleRejectPopup from './IhaleRejectPopup';
import { IhaleAcceptClosePopup, IhaleCloseVisibilityPopup } from './IhaleAcceptClosePopups';
import { IhaleStatusConfirmPopup, IhaleStatusSuccessPopup } from './IhaleStatusPopups';
import { IhalePublishSuccessPopup, IhaleEditSavedPopup, IhaleDraftSavedPopup, IhaleScoringInfoPopup } from './IhalePublishPopups';

const IhalePopups = ({ rejectNoteState, setRejectNoteState, onConfirmReject, acceptClosePopup, setAcceptClosePopup, onConfirmAccept, closeState, setCloseState, onConfirmClose, statusConfirmPopup, setStatusConfirmPopup, onConfirmStatus, statusSuccessModal, setStatusSuccessModal, publishState, setPublishState, showScoringInfo, setShowScoringInfo }) => (
    <>
        <IhaleRejectPopup rejectNoteState={rejectNoteState} setRejectNoteState={setRejectNoteState} onConfirmReject={onConfirmReject} />
        <IhaleAcceptClosePopup acceptClosePopup={acceptClosePopup} setAcceptClosePopup={setAcceptClosePopup} onConfirmAccept={onConfirmAccept} />
        <IhaleCloseVisibilityPopup closeState={closeState} setCloseState={setCloseState} onConfirmClose={onConfirmClose} />
        <IhaleStatusConfirmPopup statusConfirmPopup={statusConfirmPopup} setStatusConfirmPopup={setStatusConfirmPopup} onConfirmStatus={onConfirmStatus} />
        <IhaleStatusSuccessPopup statusSuccessModal={statusSuccessModal} setStatusSuccessModal={setStatusSuccessModal} />
        <IhalePublishSuccessPopup publishState={publishState} setPublishState={setPublishState} />
        <IhaleEditSavedPopup publishState={publishState} setPublishState={setPublishState} />
        {/* Enes Doğanay | 12 Mayıs 2026: Taslak kaydedildi popup'ı */}
        <IhaleDraftSavedPopup publishState={publishState} setPublishState={setPublishState} />
        <IhaleScoringInfoPopup showScoringInfo={showScoringInfo} setShowScoringInfo={setShowScoringInfo} />
    </>
);

export default IhalePopups;
