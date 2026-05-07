// Enes Doğanay | 7 Mayıs 2026: Gelen teklifler listesi + durum filtresi + pagination
import React, { useState, useEffect } from 'react';
import QuoteCard from './QuoteCard';
import Pagination from '../../../components/Pagination';

/* Enes Doğanay | 7 Mayıs 2026: Sayfa başına görüntülenecek teklif sayısı */
const ITEMS_PER_PAGE = 8;

/* Enes Doğanay | 6 Mayıs 2026: Gelen teklif durum filtreleri */
const STATUS_FILTERS = [
  { key: 'all', label: 'Tümü' },
  { key: 'pending', label: 'Yeni' },
  { key: 'read', label: 'Okundu' },
  { key: 'replied', label: 'Yanıtlandı' },
  { key: 'awaiting_reply', label: 'Yanıt Bekleniyor' },
  { key: 'rejected', label: 'Reddedildi' },
  { key: 'closed', label: 'Sonlandırıldı' },
];

/* Enes Doğanay | 7 Mayıs 2026: Gelen teklif listesi */
const IncomingQuoteList = ({
  incomingQuotes,
  sortedIncomingQuotes,
  unreadQuoteIds,
  statusFilter,
  setStatusFilter,
  confirmDeleteQuoteId,
  setConfirmDeleteQuoteId,
  handleOpenQuoteChat,
  handleDeleteQuote,
}) => {
  /* Enes Doğanay | 7 Mayıs 2026: Sayfalama state */
  const [currentPage, setCurrentPage] = useState(1);
  /* Enes Doğanay | 7 Mayıs 2026: Arama state */
  const [search, setSearch] = useState('');

  useEffect(() => { setCurrentPage(1); }, [statusFilter]);
  useEffect(() => { setCurrentPage(1); }, [search]);

  if (incomingQuotes.length === 0) {
    return (
      <div className="cmp-quotes-empty-state">
        <span className="material-symbols-outlined">inbox</span>
        <p>Henüz teklif talebi gelmedi.</p>
      </div>
    );
  }

  const filtered =
    statusFilter === 'all'
      ? sortedIncomingQuotes
      : sortedIncomingQuotes.filter((q) => (q._displayStatus || q.durum) === statusFilter);

  /* Enes Doğanay | 7 Mayıs 2026: Arama filtresi */
  const searched = search.trim()
    ? filtered.filter(q => {
        const s = search.toLowerCase();
        return (q._firma_adi || '').toLowerCase().includes(s) ||
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
          <input type="text" placeholder="Firma veya mesaj ara…" value={search}
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
            className={`qt-filter-chip${statusFilter === f.key ? ' qt-filter-chip--active' : ''}`}
            onClick={() => setStatusFilter(f.key)}
          >
            {f.label}
            {f.key !== 'all' && (
              <span className="qt-filter-count">
                ({incomingQuotes.filter((q) => (q._displayStatus || q.durum) === f.key).length})
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
            isIncoming={true}
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

export default IncomingQuoteList;
