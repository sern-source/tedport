// Enes Doğanay | 7 Mayıs 2026: QuotesTab — teklif talepleri listesi (filtre + sayfalama)
import React, { useState } from 'react';
import QuoteChatView from './QuoteChatView';
import QuoteCard from '../../../components/QuoteCard';
import Pagination from '../../../components/Pagination';
import './QuotesTab.css';

const STATUS_FILTERS = [
  { key: 'all', label: 'Tümü' },
  { key: 'pending', label: 'Beklemede' },
  { key: 'read', label: 'Firma Görüntüledi' },
  { key: 'replied', label: 'Yanıt Geldi' },
  { key: 'awaiting_reply', label: 'Yanıt Bekleniyor' },
  { key: 'rejected', label: 'Reddedildi' },
  { key: 'closed', label: 'Sonlandırıldı' },
];

const PAGE_SIZE = 10;

const QuotesTab = ({
  myQuotes, myQuotesLoading, activeQuoteId, setActiveQuoteId, quoteStatusFilter, setQuoteStatusFilter,
  quoteCurrentPage, setQuoteCurrentPage, quoteChatMessages, quoteChatLoading, quoteChatInput,
  setQuoteChatInput, quoteChatSending, quoteChatEndRef, confirmDeleteQuoteId, setConfirmDeleteQuoteId,
  setReportModal, setReportNeden, setReportAciklama,
  openQuoteChat, sendQuoteChatMessage, handleDeleteQuote, getFilteredSortedQuotes,
  unreadQuoteIds, navigate,
}) => {
  // Enes Doğanay | 8 Mayıs 2026: Search lokal state — hooks koşullu çağrılamaz, early return'dan önce
  const [quoteSearch, setQuoteSearch] = useState('');

  // Enes Doğanay | 7 Mayıs 2026: Aktif teklif varsa inline chat görünümü
  const activeQuote = activeQuoteId ? (myQuotes || []).find(q => q.id === activeQuoteId) : null;
  if (activeQuote) {
    return (
      <QuoteChatView
        activeQuote={activeQuote}
        quoteChatMessages={quoteChatMessages}
        quoteChatLoading={quoteChatLoading}
        quoteChatInput={quoteChatInput}
        setQuoteChatInput={setQuoteChatInput}
        quoteChatSending={quoteChatSending}
        quoteChatEndRef={quoteChatEndRef}
        sendQuoteChatMessage={sendQuoteChatMessage}
        setActiveQuoteId={setActiveQuoteId}
        setReportModal={setReportModal}
        setReportNeden={setReportNeden}
        setReportAciklama={setReportAciklama}
        navigate={navigate}
      />
    );
  }

  const sortedQuotes = getFilteredSortedQuotes(unreadQuoteIds);
  const searchedQuotes = quoteSearch.trim()
    ? sortedQuotes.filter(q => {
        const q2 = quoteSearch.toLowerCase();
        return (q._firma_adi || '').toLowerCase().includes(q2) ||
               (q.mesaj || '').toLowerCase().includes(q2) ||
               (q.konu || '').toLowerCase().includes(q2);
      })
    : sortedQuotes;
  const totalPages = Math.ceil(searchedQuotes.length / PAGE_SIZE) || 1;
  const pageQuotes = searchedQuotes.slice((quoteCurrentPage - 1) * PAGE_SIZE, quoteCurrentPage * PAGE_SIZE);

  // Enes Doğanay | 7 Mayıs 2026: Hero KPI hesapları
  const total = (myQuotes || []).length;
  const repliedCount = (myQuotes || []).filter(q => (q._displayStatus || q.durum) === 'replied').length;
  const pendingCount = (myQuotes || []).filter(q => ['pending', 'read'].includes(q._displayStatus || q.durum)).length;
  const closedCount = (myQuotes || []).filter(q => (q._displayStatus || q.durum) === 'closed').length;

  return (
    <div className="quotes-section">
      {/* Enes Doğanay | 7 Mayıs 2026: Hero banner — Favoriler/İhale Tekliflerim ile aynı sistematik */}
      <div className="qt-hero">
        <div className="qt-hero__inner">
          <div className="qt-hero__title">
            <span className="material-symbols-outlined">request_quote</span>
            <div>
              <h2>Teklif Taleplerim</h2>
              <p>Firmalara gönderdiğiniz teklif taleplerini buradan takip edin.</p>
            </div>
          </div>
          <div className="qt-kpis">
            <div className="qt-kpi">
              <span className="qt-kpi__value">{total}</span>
              <span className="qt-kpi__label">Toplam</span>
            </div>
            <div className="qt-kpi qt-kpi--replied">
              <span className="qt-kpi__value">{repliedCount}</span>
              <span className="qt-kpi__label">Yanıt Geldi</span>
            </div>
            <div className="qt-kpi qt-kpi--pending">
              <span className="qt-kpi__value">{pendingCount}</span>
              <span className="qt-kpi__label">Beklemede</span>
            </div>
            <div className="qt-kpi qt-kpi--closed">
              <span className="qt-kpi__value">{closedCount}</span>
              <span className="qt-kpi__label">Sonlandırıldı</span>
            </div>
          </div>
        </div>
      </div>

      {/* Enes Doğanay | 7 Mayıs 2026: Toolbar — her zaman görünür, search + chip filtreler */}
      <div className="qt-toolbar">
        <div className="qt-toolbar__search">
          <span className="material-symbols-outlined">search</span>
          <input type="text" placeholder="Firma veya mesaj ara…" value={quoteSearch}
            onChange={e => { setQuoteSearch(e.target.value); setQuoteCurrentPage(1); }} />
          {quoteSearch && (
            <button className="qt-toolbar__clear" onClick={() => { setQuoteSearch(''); setQuoteCurrentPage(1); }} aria-label="Aramayı temizle">
              <span className="material-symbols-outlined">close</span>
            </button>
          )}
        </div>
        <div className="qt-filter-bar">
          {STATUS_FILTERS.map(f => (
            <button key={f.key} className={`qt-filter-chip${quoteStatusFilter === f.key ? ' qt-filter-chip--active' : ''}`}
              onClick={() => { setQuoteStatusFilter(f.key); setQuoteCurrentPage(1); }}>
              {f.label}
              {f.key !== 'all' && <span className="qt-filter-count">({myQuotes.filter(q => (q._displayStatus || q.durum) === f.key).length})</span>}
            </button>
          ))}
        </div>
      </div>

      {myQuotesLoading ? (
        <div className="quotes-loading">Yükleniyor...</div>
      ) : myQuotes.length === 0 ? (
        <div className="quotes-empty-state">
          <span className="material-symbols-outlined">request_quote</span>
          <h3>Henüz teklif talebi göndermediniz</h3>
          <p>Firma detay sayfalarında "Teklif İste" butonunu kullanarak firmalardan teklif isteyebilirsiniz.</p>
        </div>
      ) : (
        <>
          <div className="cmp-quotes-list">
            {pageQuotes.map(q => (
              <QuoteCard
                key={q.id}
                q={q}
                isIncoming={false}
                senderLabel={q._firma_adi}
                unreadQuoteIds={unreadQuoteIds}
                confirmDeleteQuoteId={confirmDeleteQuoteId}
                setConfirmDeleteQuoteId={setConfirmDeleteQuoteId}
                handleOpenQuoteChat={(quote) => openQuoteChat(quote.id)}
                handleDeleteQuote={(qId) => handleDeleteQuote(qId)}
              />
            ))}
          </div>
          <Pagination page={quoteCurrentPage} totalPages={totalPages} onPageChange={setQuoteCurrentPage} />
        </>
      )}
    </div>
  );
};

export default QuotesTab;

