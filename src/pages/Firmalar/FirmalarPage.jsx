// Enes Doğanay | 6 Mayıs 2026: Firmalar sayfası — kompozisyon katmanı, sayfa düzeni
import React, { useState } from 'react';
import SharedHeader from '../../components/SharedHeader';
import FirmaFilterSidebar from './components/FirmaFilterSidebar';
import SupplierCard from './components/SupplierCard';
import FirmalarListView from './components/FirmalarListView';
import FirmalarToolbar from './components/FirmalarToolbar';
import FirmalarPagination from './components/FirmalarPagination';
import QuoteModal from './components/QuoteModal';
import FirmalarSkeletonCards from './components/FirmalarSkeletonCards';
import FirmalarActiveFilterTags from './components/FirmalarActiveFilterTags';
import { useFirmalarPage } from './hooks/useFirmalarPage';
import { useFirmaFilters } from './hooks/useFirmaFilters';
import './FirmalarPage.css';

const FirmalarPage = () => {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const page = useFirmalarPage();
  const filters = useFirmaFilters(page.filters, page.setFilters);

  return (
    <>
      {page.toast && (
        // Enes Doğanay | 8 Mayıs 2026: role=alert — screen reader bildirimi
        <div className={`fl-toast fl-toast--${page.toast.type || 'info'}`} role="alert">
          <span className="material-symbols-outlined">{page.toast.type === 'error' ? 'error' : 'info'}</span>
          {page.toast.message}
          <button className="fl-toast-close" onClick={() => page.setToast(null)} aria-label="Kapat"><span className="material-symbols-outlined">close</span></button>
        </div>
      )}
      <SharedHeader search={page.search} setSearch={page.setSearch} showSearchBar={true} searchHistory={page.searchHistory} onHistoryRemove={page.removeFromHistory} onHistoryClear={page.clearHistory} onHistorySelect={v => page.setSearch(v)} />
      <div className="layout-container">
        <button className="sidebar-mobile-toggle" aria-expanded={filtersOpen} aria-controls="firma-filter-sidebar" onClick={() => setFiltersOpen(o => !o)}>
          <span className="material-symbols-outlined">tune</span>Filtrele
        </button>
        <div className="firmalar-grid">
          <FirmaFilterSidebar {...filters} isOpen={filtersOpen} />
          <section>
            <FirmalarActiveFilterTags activeTags={page.activeTags} removeFilterTag={page.removeFilterTag} setFilters={page.setFilters} />
            <FirmalarToolbar totalCount={page.totalCount} hasSearch={!!(page.debouncedSearch || page.activeTags.length > 0)} page={page.page} totalPages={page.totalPages} onPageChange={page.setPage} sortMode={page.sortMode} onSortChange={page.setSortMode} viewMode={page.viewMode} onViewToggle={page.toggleViewMode} />
            {page.loading ? (
              <FirmalarSkeletonCards />
            ) : page.suppliers.length === 0 ? (
              <div className="empty-results">
                <p>Aradığınız kriterlere uygun firma bulunamadı.</p>
                {page.didYouMean && (
                  <button className="did-you-mean" onClick={() => page.setSearch(page.didYouMean)}>
                    <span className="material-symbols-outlined">search</span>
                    Şunu mu demek istediniz: <strong>{page.didYouMean}</strong>
                  </button>
                )}
              </div>
            ) : page.viewMode === 'list' ? (
              <FirmalarListView suppliers={page.suppliers} favoriteIds={page.favoriteIds} isLoggedIn={page.isLoggedIn} onToggleFavorite={page.handleToggleFavorite} onQuoteRequest={page.quote.openModal} />
            ) : (
              <div className="results-list">
                {page.suppliers.map(supplier => (
                  <SupplierCard key={supplier.id} supplier={supplier} isFavorited={page.favoriteIds.has(supplier.id)} isLoggedIn={page.isLoggedIn} onToggleFavorite={page.handleToggleFavorite} onQuoteRequest={page.quote.openModal} onTagClick={tag => page.setSearch(tag)} />
                ))}
              </div>
            )}
            <FirmalarPagination page={page.page} totalPages={page.totalPages} onPageChange={page.setPage} />
          </section>
        </div>
      </div>
      {page.quote.activeSupplier && (
        <QuoteModal supplier={page.quote.activeSupplier} form={page.quote.quoteForm} quoteFile={page.quote.quoteFile} sending={page.quote.sending} sent={page.quote.sent} userProfile={page.quote.userProfile} onClose={page.quote.closeModal} onSetField={page.quote.setField} onSetFile={page.quote.setQuoteFile} onSubmit={page.quote.handleSubmit} />
      )}
    </>
  );
};

export default FirmalarPage;
