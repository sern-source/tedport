// Enes Doğanay | 6 Mayıs 2026: Firmalar sayfası skeleton yükleme kartları
import React from 'react';

const FirmalarSkeletonCards = () => (
    <div className="skeleton-list">
        {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton-card">
                <div className="skeleton-avatar" />
                <div className="skeleton-content">
                    <div className="skeleton-line skeleton-line-title" />
                    <div className="skeleton-line skeleton-line-meta" />
                    <div className="skeleton-line skeleton-line-desc" />
                    <div className="skeleton-line skeleton-line-desc-short" />
                </div>
            </div>
        ))}
    </div>
);

export default FirmalarSkeletonCards;
