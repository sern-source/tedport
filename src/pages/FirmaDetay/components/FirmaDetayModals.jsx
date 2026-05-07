// Enes Doğanay | 6 Mayıs 2026: Firma detay modalları — teklif talebi ve ekip modalı
import React from 'react';
import FdQuoteModal from './FdQuoteModal';
import EkipModal from './EkipModal';

const FirmaDetayModals = ({ fd }) => (
    <>
        {fd.showQuoteModal && (
            <FdQuoteModal firma={fd.firma} userProfile={fd.userProfile} quoteForm={fd.quoteForm} onFormChange={fd.setQuoteField} quoteSending={fd.quoteSending} quoteSent={fd.quoteSent} quoteFile={fd.quoteFile} setQuoteFile={fd.setQuoteFile} onClose={() => fd.setShowQuoteModal(false)} onSubmit={fd.handleSendQuoteRequest} onFileWarning={(msg) => fd.showFdToast('warning', msg)} />
        )}
        {fd.showEkipModal && (
            <EkipModal firmaEkip={fd.firmaEkip} onClose={() => fd.setShowEkipModal(false)} />
        )}
    </>
);

export default FirmaDetayModals;
