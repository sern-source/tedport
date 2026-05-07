// Enes Doğanay | 7 Mayıs 2026: Shared pagination — tüm sayfalarda kullanılan standart pagination
import React from 'react';

/* Enes Doğanay | 7 Mayıs 2026: Sayfa numarası dizisi üretici — mevcut sayfadan ±2 + baş/son + '...' */
const getSmartPages = (current, total) => {
  const delta = 2;
  const pages = [];
  let last = null;
  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
      if (last && i - last > 1) pages.push('...');
      pages.push(i);
      last = i;
    }
  }
  return pages;
};

const Pagination = ({ page, totalPages, onPageChange }) => {
  if (!totalPages || totalPages <= 1) return null;
  const smartPages = getSmartPages(page, totalPages);

  return (
    <div className="pagination">
      <button className="page-btn nav" disabled={page === 1} onClick={() => onPageChange(1)} data-tooltip="İlk sayfa">
        <span className="material-symbols-outlined">first_page</span>
      </button>
      <button className="page-btn nav" disabled={page === 1} onClick={() => onPageChange(p => p - 1)}>
        <span className="material-symbols-outlined">chevron_left</span>
      </button>
      {smartPages.map((p, i) =>
        p === '...' ? (
          <span key={`dots-${i}`} className="page-dots">...</span>
        ) : (
          <button key={`page-${p}`} className={`page-btn${page === p ? ' active' : ''}`} onClick={() => onPageChange(p)}>
            {p}
          </button>
        )
      )}
      <button className="page-btn nav" disabled={page === totalPages} onClick={() => onPageChange(p => p + 1)}>
        <span className="material-symbols-outlined">chevron_right</span>
      </button>
      <button className="page-btn nav" disabled={page === totalPages} onClick={() => onPageChange(totalPages)} data-tooltip="Son sayfa">
        <span className="material-symbols-outlined">last_page</span>
      </button>
    </div>
  );
};

export default Pagination;
