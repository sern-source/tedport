// Enes Doğanay | 7 Mayıs 2026: Teklif yönetimi sekmesi — inline chat görünümü
import React from 'react';
import './IhaleYonetimiTab.css';
import './TeklifYonetimiTab.css';
import './TeklifYonetimiTab.hero.css';
import './TeklifYonetimiTab.tabs.css';
import './TeklifYonetimiTab.dark.css';
import TeklifChatView from './TeklifChatView';
import TeklifListView from './TeklifListView';
import QuoteContactPopup from './QuoteContactPopup';
import SharedReportModal from '../../../components/SharedReportModal';

/* Enes Doğanay | 7 Mayıs 2026: Teklif sekmesi — aktif chat varsa inline görünüm */
const TeklifYonetimiTab = (props) => {
  const {
    activeQuoteChat,
    quoteContactPopup, setQuoteContactPopup, qCopied, setQCopied,
    reportModal, setReportModal, reportSending, reportNeden, setReportNeden,
    reportAciklama, setReportAciklama, reportSuccess, handleSubmitReport,
  } = props;

  return (
    <>
      {activeQuoteChat ? (
        <TeklifChatView {...props} />
      ) : (
        <TeklifListView {...props} />
      )}
      <QuoteContactPopup
        quoteContactPopup={quoteContactPopup}
        setQuoteContactPopup={setQuoteContactPopup}
        qCopied={qCopied}
        setQCopied={setQCopied}
      />
      {/* Enes Doğanay | 7 Mayıs 2026: Ortak şikayet modal — z-index 10100 */}
      <SharedReportModal
        open={!!reportModal}
        mesajIcerik={reportModal?.mesajIcerik}
        neden={reportNeden}
        aciklama={reportAciklama}
        sending={reportSending}
        success={reportSuccess}
        onClose={() => setReportModal(null)}
        onChangeNeden={neden => setReportNeden(neden)}
        onChangeAciklama={aciklama => setReportAciklama(aciklama)}
        onSubmit={handleSubmitReport}
      />
    </>
  );
};

export default TeklifYonetimiTab;

