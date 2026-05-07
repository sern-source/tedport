// Enes Doğanay | 6 Mayıs 2026: İhale sayfalama kontrolleri
import React from 'react';

const TendersPagination = ({ page, setPage, totalPages, smartPages }) => {
    if (totalPages <= 1) return null;
    return (
        <div className="tenders-pagination">
            <button className="tenders-page-btn tenders-page-btn--nav" disabled={page === 1} onClick={() => setPage(1)} data-tooltip="İlk sayfa">
                <span className="material-symbols-outlined">first_page</span>
            </button>
            <button className="tenders-page-btn tenders-page-btn--nav" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                <span className="material-symbols-outlined">chevron_left</span>
            </button>
            {smartPages.map((p, i) =>
                p === '...' ? (
                    <span key={`dots-${i}`} className="tenders-page-btn tenders-page-btn--dots">...</span>
                ) : (
                    <button key={`page-${p}`} className={`tenders-page-btn${page === p ? ' tenders-page-btn--active' : ''}`} onClick={() => setPage(p)}>
                        {p}
                    </button>
                )
            )}
            <button className="tenders-page-btn tenders-page-btn--nav" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
                <span className="material-symbols-outlined">chevron_right</span>
            </button>
            <button className="tenders-page-btn tenders-page-btn--nav" disabled={page === totalPages} onClick={() => setPage(totalPages)} data-tooltip="Son sayfa">
                <span className="material-symbols-outlined">last_page</span>
            </button>
        </div>
    );
};

export default TendersPagination;
