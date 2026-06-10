// Enes Doğanay | 7 Mayıs 2026: Gönderilen teklifler listesi + durum filtresi + pagination
import React, { useState, useEffect } from 'react';
import QuoteCard from './QuoteCard';
import Pagination from '../../../components/Pagination';

/* Enes Doğanay | 7 Mayıs 2026: Sayfa başına görüntülenecek teklif sayısı */
const ITEMS_PER_PAGE = 8;

/* Enes Doğanay | 6 Mayıs 2026: Gönderilen teklif durum filtreleri */
const STATUS_FILTERS = [
  { key: 'all', label: 'Tümü' },
  { key: 'pending', label: 'Beklemede' },
  { key: 'read', label: 'Firma Görüntüledi' },
  { key: 'replied', label: 'Yanıt Geldi' },
  { key: 'awaiting_reply', label: 'Yanıt Bekleniyor' },
  { key: 'rejected', label: 'Reddedildi' },
  { key: 'closed', label: 'Sonlandırıldı' },
];

/* Enes Doğanay | 7 Mayıs 2026: Gönderilen teklif listesi */
const OutgoingQuoteList = ({
  outgoingQuotes,
  unreadQuoteIds,
  outStatusFilter,
  setOutStatusFilter,
  confirmDeleteQuoteId,
  setConfirmDeleteQuoteId,
  handleOpenQuoteChat,
  handleDeleteQuote,
}) => {
  /* Enes Doğanay | 7 Mayıs 2026: Sayfalama state */
  const [currentPage, setCurrentPage] = useState(1);
  /* Enes Doğanay | 7 Mayıs 2026: Arama state */
  const [search, setSearch] = useState('');

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setCurrentPage(1); }, [outStatusFilter]);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setCurrentPage(1); }, [search]);

  if (outgoingQuotes.length === 0) {
    return (
      <div className="cmp-quotes-empty-state">
        <span className="material-symbols-outlined">outbox</span>
        <p>Henüz teklif talebi göndermediniz.</p>
      </div>
    );
  }

  const filtered =
    outStatusFilter === 'all'
      ? outgoingQuotes
      : outgoingQuotes.filter((q) => (q._displayStatus || q.durum) === outStatusFilter);

  /* Enes Doğanay | 7 Mayıs 2026: Arama filtresi */
  const searched = search.trim()
    ? filtered.filter(q => {
        const s = search.toLowerCase();
        return (q._firma_adi || q._alici_adi || '').toLowerCase().includes(s) ||
               (q.mesaj || '').toLowerCase().includes(s) ||
               (q.konu || '').toLowerCase().includes(s);
      })
    : filtered;

  const totalPages = Math.ceil(searched.length / ITEMS_PER_PAGE);
  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginated = searched.slice(start, start + ITEMS_PER_PAGE);

  return (
    <>
      {/* Enes Doğanay | 7 Mayıs 2026: Toolbar — search bar + chip filtreler */}
      <div className="qt-toolbar">
        <div className="qt-toolbar__search">
          <span className="material-symbols-outlined">search</span>
          <input type="text" placeholder="Alıcı veya mesaj ara…" value={search}
            onChange={e => setSearch(e.target.value)} />
          {search && (
            <button className="qt-toolbar__clear" onClick={() => setSearch('')} aria-label="Aramayı temizle">
              <span className="material-symbols-outlined">close</span>
            </button>
          )}
        </div>
      </div>
      <div className="qt-filter-bar">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.key}
            className={`qt-filter-chip${outStatusFilter === f.key ? ' qt-filter-chip--active' : ''}`}
            onClick={() => setOutStatusFilter(f.key)}
          >
            {f.label}
            {f.key !== 'all' && (
              <span className="qt-filter-count">
                ({outgoingQuotes.filter((q) => (q._displayStatus || q.durum) === f.key).length})
              </span>
            )}
          </button>
        ))}
      </div>
      <div className="cmp-quotes-list cmp-quotes-list--filtered">
        {paginated.map((q) => (
          <QuoteCard
            key={q.id}
            q={q}
            isIncoming={false}
            unreadQuoteIds={unreadQuoteIds}
            confirmDeleteQuoteId={confirmDeleteQuoteId}
            setConfirmDeleteQuoteId={setConfirmDeleteQuoteId}
            handleOpenQuoteChat={handleOpenQuoteChat}
            handleDeleteQuote={handleDeleteQuote}
          />
        ))}
      </div>
      {totalPages > 1 && (
        <Pagination page={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      )}
    </>
  );
};

export default OutgoingQuoteList;
