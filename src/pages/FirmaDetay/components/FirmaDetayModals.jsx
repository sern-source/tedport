// Enes Doğanay | 6 Mayıs 2026: Firma detay modalları — teklif talebi ve ekip modalı
// Enes Doğanay | 23 Mayıs 2026: FdQuoteModal → QuoteModal (ortak bileşen) ile değiştirildi
import React from 'react';
import QuoteModal from '../../Firmalar/components/QuoteModal';
import EkipModal from './EkipModal';

const FirmaDetayModals = ({ fd }) => {
    // Enes Doğanay | 23 Mayıs 2026: firma nesnesini QuoteModal'ın beklediği supplier formatına dönüştür
    const supplier = {
        name: fd.firma?.firma_adi,
        images: fd.firma?.logo_url?.includes('firma-logolari') ? fd.firma.logo_url : null,
    };
    return (
        <>
            {fd.showQuoteModal && (
                <QuoteModal
                    supplier={supplier}
                    form={fd.quoteForm}
                    sending={fd.quoteSending}
                    sent={fd.quoteSent}
                    quoteFile={fd.quoteFile}
                    onSetFile={fd.setQuoteFile}
                    userProfile={fd.userProfile}
                    onClose={() => { fd.setShowQuoteModal(false); fd.setFdQuoteFieldError({ key: '', msg: '' }); fd.setQuoteFile(null); }}
                    onSetField={fd.setQuoteField}
                    onSubmit={fd.handleSendQuoteRequest}
                    fieldError={fd.fdQuoteFieldError}
                />
            )}
            {fd.showEkipModal && (
                <EkipModal firmaEkip={fd.firmaEkip} onClose={() => fd.setShowEkipModal(false)} />
            )}
        </>
    );
};

export default FirmaDetayModals;
