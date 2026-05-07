// Enes Doğanay | 7 Mayıs 2026: Teklif listesi görünümü — hero banner + tabs + gelen/giden
import React from 'react';
import IncomingQuoteList from './IncomingQuoteList';
import OutgoingQuoteList from './OutgoingQuoteList';

/* Enes Doğanay | 7 Mayıs 2026: Teklif listesi ana görünümü */
const TeklifListView = ({
  quotesLoading,
  quotesTab,
  setQuotesTab,
  incomingQuotes,
  outgoingQuotes,
  sortedIncomingQuotes,
  unreadQuoteIds,
  pendingCount,
  statusFilter,
  setStatusFilter,
  outStatusFilter,
  setOutStatusFilter,
  confirmDeleteQuoteId,
  setConfirmDeleteQuoteId,
  handleOpenQuoteChat,
  handleDeleteQuote,
}) => {
  /* Enes Doğanay | 7 Mayıs 2026: Hero KPI hesapları */
  const pendingIncoming = incomingQuotes.filter(q => (q._displayStatus || q.durum) === 'pending').length;
  const repliedIncoming = incomingQuotes.filter(q => (q._displayStatus || q.durum) === 'replied').length;

  return (
  <div className="firma-profil-section">
    {/* Enes Doğanay | 7 Mayıs 2026: Hero banner — tv-hero, indigo gradient */}
    <div className="tv-hero">
      <div className="tv-hero__inner">
        <div className="tv-hero__title">
          <span className="tv-hero__icon">
            <span className="material-symbols-outlined">description</span>
          </span>
          <div>
            <h2>Teklif Yönetimi</h2>
            <p>Gelen ve gönderdiğiniz teklif taleplerini yönetin.</p>
          </div>
        </div>
        <div className="tv-hero__kpis">
          {incomingQuotes.length > 0 && (
            <div className="tv-kpi tv-kpi--in">
              <span className="tv-kpi__value">{incomingQuotes.length}</span>
              <span className="tv-kpi__label">Gelen</span>
            </div>
          )}
          {pendingIncoming > 0 && (
            <div className="tv-kpi tv-kpi--new">
              <span className="tv-kpi__value">{pendingIncoming}</span>
              <span className="tv-kpi__label">Yeni</span>
            </div>
          )}
          {repliedIncoming > 0 && (
            <div className="tv-kpi tv-kpi--replied">
              <span className="tv-kpi__value">{repliedIncoming}</span>
              <span className="tv-kpi__label">Yanıtlandı</span>
            </div>
          )}
          {outgoingQuotes.length > 0 && (
            <div className="tv-kpi tv-kpi--out">
              <span className="tv-kpi__value">{outgoingQuotes.length}</span>
              <span className="tv-kpi__label">Gönderilen</span>
            </div>
          )}
        </div>
      </div>
    </div>
    <div className="cmp-quotes-tabs">
      <button
        className={`cmp-quotes-tab ${quotesTab === 'incoming' ? 'active' : ''}`}
        onClick={() => setQuotesTab('incoming')}
      >
        <span className="material-symbols-outlined">inbox</span> Gelen Teklif Talepleri
        {pendingCount > 0 && <span className="cmp-quotes-badge">{pendingCount}</span>}
      </button>
      <button
        className={`cmp-quotes-tab ${quotesTab === 'outgoing' ? 'active' : ''}`}
        onClick={() => setQuotesTab('outgoing')}
      >
        <span className="material-symbols-outlined">outbox</span> İstenen Teklif Talepleri
      </button>
    </div>
    {quotesLoading ? (
      <p className="cmp-quotes-empty">Yükleniyor...</p>
    ) : quotesTab === 'incoming' ? (
      <IncomingQuoteList
        incomingQuotes={incomingQuotes}
        sortedIncomingQuotes={sortedIncomingQuotes}
        unreadQuoteIds={unreadQuoteIds}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        confirmDeleteQuoteId={confirmDeleteQuoteId}
        setConfirmDeleteQuoteId={setConfirmDeleteQuoteId}
        handleOpenQuoteChat={handleOpenQuoteChat}
        handleDeleteQuote={handleDeleteQuote}
      />
    ) : (
      <OutgoingQuoteList
        outgoingQuotes={outgoingQuotes}
        unreadQuoteIds={unreadQuoteIds}
        outStatusFilter={outStatusFilter}
        setOutStatusFilter={setOutStatusFilter}
        confirmDeleteQuoteId={confirmDeleteQuoteId}
        setConfirmDeleteQuoteId={setConfirmDeleteQuoteId}
        handleOpenQuoteChat={handleOpenQuoteChat}
        handleDeleteQuote={handleDeleteQuote}
      />
    )}
  </div>
  );
};

export default TeklifListView;
